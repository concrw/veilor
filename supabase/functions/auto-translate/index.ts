import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.36.3";
import { getAuthenticatedUser, AuthError } from "../_shared/auth.ts";
import { logAiUsage } from "../_shared/aiGate.ts";
import { MODELS } from "../_shared/models.ts";

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}
function handleCorsOptions(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }
  return null;
}

interface TranslateRequest {
  user_id: string;
  content: string;
  source_lang: string;
  target_langs: string[];
  table_name: string;
  row_id?: string;
}

Deno.serve(async (req: Request) => {
  const corsOpts = handleCorsOptions(req);
  if (corsOpts) return corsOpts;

  const headers = { ...getCorsHeaders(req), "Content-Type": "application/json" };

  try {
    // veilor 스키마는 PostgREST에 노출되어 있지 않아 직접 접근이 실패한다.
    // (기존 코드는 error를 무시해 Pro 유저에게도 항상 AUTO_TRANSLATE_DISABLED를 반환했다)
    // 마이그레이션: auto_translate_public_wrappers
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // body.user_id는 위조 가능하므로 인증된 user.id만 사용한다 (BOLA 방지)
    const { user: authUser } = await getAuthenticatedUser(req);

    const body: TranslateRequest = await req.json();
    const { content, source_lang, target_langs, table_name, row_id } = body;
    const user_id = authUser.id;

    if (!user_id || !content || !target_langs?.length) {
      return new Response(
        JSON.stringify({ ok: false, error: "INVALID_PARAMS" }),
        { status: 400, headers },
      );
    }

    // Pro 유저 확인 + 크레딧 잔액을 한 번에 조회
    const { data: ctx, error: ctxErr } = await supabase.rpc("fn_auto_translate_context", {
      p_user_id: user_id,
    });

    // 조회 실패를 "기능 비활성화"로 오인하지 않도록 명시적으로 구분한다.
    if (ctxErr) {
      console.error("fn_auto_translate_context failed:", ctxErr.message);
      return new Response(
        JSON.stringify({ ok: false, error: "TRANSLATE_GATE_UNAVAILABLE" }),
        { status: 503, headers },
      );
    }

    if (!ctx?.auto_translate) {
      return new Response(
        JSON.stringify({ ok: false, error: "AUTO_TRANSLATE_DISABLED" }),
        { status: 403, headers },
      );
    }

    const balance = Number(ctx.balance ?? 0);
    const cost = target_langs.length;

    if (balance < cost) {
      return new Response(
        JSON.stringify({ ok: false, error: "INSUFFICIENT_CREDITS", balance }),
        { status: 402, headers },
      );
    }

    const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });

    const translations: Record<string, string> = {};

    for (const targetLang of target_langs) {
      if (targetLang === source_lang) continue;
      const langName = targetLang === "en" ? "English" : "Korean";
      const msg = await anthropic.messages.create({
        model: MODELS.HAIKU,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Translate the following text to ${langName} naturally.\nKeep the emotional tone and personal voice intact.\nRespond with only the translated text, no explanations.\n\nText: ${content}`,
          },
        ],
      });
      logAiUsage({ userId: user_id, model: MODELS.HAIKU, usage: msg.usage, tab: "auto-translate" });
      const translated = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
      translations[targetLang] = translated;
    }

    // 번역 결과를 같은 테이블에 lang = targetLang 행으로 삽입.
    // 원문 복제는 래퍼 안에서 처리한다 (id/created_at은 DEFAULT 적용).
    if (row_id && (table_name === "codetalk_entries" || table_name === "community_posts")) {
      for (const [lang, translated] of Object.entries(translations)) {
        const { error: insErr } = await supabase.rpc("fn_insert_translation", {
          p_table: table_name,
          p_row_id: row_id,
          p_lang: lang,
          p_text: translated,
        });
        if (insErr) console.error("fn_insert_translation failed:", insErr.message);
      }
    }

    // 크레딧 차감 + 거래 기록 (래퍼 안에서 원자적으로 처리)
    const { data: charged, error: chargeErr } = await supabase.rpc("fn_charge_translate_credits", {
      p_user_id: user_id,
      p_cost: cost,
    });
    if (chargeErr) console.error("fn_charge_translate_credits failed:", chargeErr.message);
    const newBalance = charged ?? (balance - cost);

    return new Response(
      JSON.stringify({
        ok: true,
        translations,
        remaining_credits: newBalance,
      }),
      { headers },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: e instanceof AuthError ? e.status : 500,
      headers,
    });
  }
});
