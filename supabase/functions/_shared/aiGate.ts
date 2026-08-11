/**
 * AI 비용 게이트 — 모든 Claude 호출 함수 공통.
 *
 * held-chat에만 있던 월 한도 체크를 전 AI 함수로 확장하기 위한 공유 헬퍼.
 * 게이트가 없으면 held-chat의 $7 캡을 다른 함수로 우회할 수 있다.
 *
 * 사용법:
 *   const gate = await checkAiAccess(userId);
 *   if (!gate.allowed) return aiGateResponse(gate, corsHeaders);
 *   ... Claude 호출 ...
 *   logAiUsage({ userId, model, usage: data.usage, tab: 'dig' });
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { MODELS } from "./models.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

/** USD per 1M tokens. Anthropic 공개 요금 기준. */
const PRICING: Record<string, {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}> = {
  [MODELS.SONNET]: { input: 3.00, output: 15.00, cacheRead: 0.30, cacheWrite: 3.75 },
  [MODELS.HAIKU]: { input: 1.00, output: 5.00, cacheRead: 0.10, cacheWrite: 1.25 },
};

export interface AiGateResult {
  allowed: boolean;
  reason?: string;
  source?: string;
  monthly_used_usd?: number;
  monthly_remaining_usd?: number;
  balance?: number;
}

/**
 * veilor 스키마는 PostgREST에 노출되어 있지 않다.
 * (db:{schema:"veilor"} 지정 시 406 "Invalid schema: veilor")
 * 따라서 public 스키마의 SECURITY DEFINER 래퍼를 경유한다.
 *   public.fn_check_ai_access / fn_increment_monthly_used_usd / fn_log_ai_usage
 * 마이그레이션: ai_gate_public_wrappers
 */
function serviceClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * 구독 여부 + 월 $7 한도를 확인한다.
 *
 * userId가 없으면 차단한다 — 익명 호출로 캡을 우회하는 것을 막기 위함.
 * 인프라 설정이 없으면(로컬 개발 등) 통과시킨다.
 */
export async function checkAiAccess(userId: string | null | undefined): Promise<AiGateResult> {
  const sb = serviceClient();
  if (!sb) return { allowed: true, source: "no_infra" };

  if (!userId) {
    return { allowed: false, reason: "USER_REQUIRED" };
  }

  const { data, error } = await sb.rpc("fn_check_ai_access", { p_user_id: userId });

  // RPC 실패 시 차단한다. 열어두면 장애 중 비용이 무제한으로 샌다.
  if (error) {
    console.error("[aiGate] fn_check_ai_access failed:", error.message);
    return { allowed: false, reason: "GATE_UNAVAILABLE" };
  }

  return (data ?? { allowed: false, reason: "GATE_UNAVAILABLE" }) as AiGateResult;
}

/** 게이트 거부 시 반환할 Response. 402 = Payment Required. */
export function aiGateResponse(
  gate: AiGateResult,
  corsHeaders: Record<string, string>,
): Response {
  const status = gate.reason === "USER_REQUIRED" ? 401 : 402;
  return new Response(
    JSON.stringify({
      error: gate.reason ?? "AI_ACCESS_DENIED",
      monthly_used_usd: gate.monthly_used_usd ?? null,
    }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

export interface AnthropicUsage {
  input_tokens?: number;
  output_tokens?: number;
  cache_read_input_tokens?: number;
  cache_creation_input_tokens?: number;
}

/**
 * 토큰 사용량을 기록하고 monthly_used_usd에 누적한다.
 * 비동기 fire-and-forget — 응답을 지연시키지 않는다.
 */
export function logAiUsage(params: {
  userId: string | null | undefined;
  model: string;
  usage: AnthropicUsage | null | undefined;
  tab?: string | null;
}): void {
  const { userId, model, usage, tab } = params;
  if (!userId || !usage) return;

  const sb = serviceClient();
  if (!sb) return;

  const input = usage.input_tokens ?? 0;
  const output = usage.output_tokens ?? 0;
  const cacheRead = usage.cache_read_input_tokens ?? 0;
  const cacheWrite = usage.cache_creation_input_tokens ?? 0;

  const price = PRICING[model] ?? PRICING[MODELS.SONNET];
  const costUsd =
    (input * price.input +
      output * price.output +
      cacheRead * price.cacheRead +
      cacheWrite * price.cacheWrite) / 1_000_000;

  // veilor.ai_token_usage에 직접 insert할 수 없으므로 public 래퍼 RPC를 쓴다.
  sb.rpc("fn_log_ai_usage", {
    p_user_id: userId,
    p_model: model,
    p_tab: tab ?? null,
    p_input_tokens: input,
    p_output_tokens: output,
    p_cache_read_tokens: cacheRead,
    p_cache_write_tokens: cacheWrite,
  }).then(() => {}).catch((e: unknown) => console.warn("[aiGate] usage log failed:", e));

  if (costUsd > 0) {
    sb.rpc("fn_increment_monthly_used_usd", {
      p_user_id: userId,
      p_cost_usd: costUsd,
    }).then(() => {}).catch((e: unknown) => console.warn("[aiGate] cost increment failed:", e));
  }
}
