/**
 * calc-risk-score
 * B2B 체크인 저장 후 위기 감지 알고리즘 실행 → risk_score / risk_level 업데이트 → 코치 알림
 *
 * 알고리즘 설계 근거: veilor_b2b.md 섹션 12-1 ~ 12-5
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// ─────────────────────────────────────────────
// 키워드 등급 (veilor_b2b.md 섹션 12-1 신호C 기준)
// ─────────────────────────────────────────────
const KEYWORDS_HIGH = [
  "죽고싶", "죽고 싶", "자살", "자해", "스스로 목숨", "살고 싶지 않",
  "손목을 긋", "손목 긋", "뛰어내리", "목을 매", "목매", "칼로",
  "약을 먹", "약을 많이", "떠나버리", "사라지고 싶", "없어지고 싶",
];

const KEYWORDS_LOW = [
  "포기하고 싶", "그만두고 싶", "지쳐", "번아웃", "아무것도 하기 싫",
  "즐거운 일이 없", "무기력", "힘들다", "힘들어", "못하겠어",
  "실망", "좌절", "무너지는", "다 놔버리고",
];

// ─────────────────────────────────────────────
// 신호 A — 4C 절대값 스코어
// ─────────────────────────────────────────────
function scoreSignalA(avg: number, minItem: number): number {
  let score = 0;
  if (avg <= 3.0) score += 40;
  else if (avg <= 5.0) score += 20;
  if (minItem <= 2.0) score += 20;
  return score;
}

// ─────────────────────────────────────────────
// 신호 B — 연속 하락 패턴 (최근 N개 체크인 기반)
// ─────────────────────────────────────────────
function scoreSignalB(
  recentAvgs: number[],  // 오래된 순서 [D-4, D-3, D-2, D-1, 오늘]
  daysToEvent: number | null,
): number {
  if (recentAvgs.length < 2) return 0;

  let consecutive = 0;
  for (let i = recentAvgs.length - 1; i > 0; i--) {
    if (recentAvgs[i] < recentAvgs[i - 1]) consecutive++;
    else break;
  }

  let score = 0;
  if (consecutive >= 5) score += 35;
  else if (consecutive >= 3) score += 20;

  // 이벤트 D-7 이내 가중
  if (score > 0 && daysToEvent !== null && daysToEvent >= 0 && daysToEvent <= 7) {
    score = Math.round(score * 1.5);
  }
  return score;
}

// ─────────────────────────────────────────────
// 신호 C — 텍스트 키워드
// ─────────────────────────────────────────────
function scoreSignalC(text: string | null): { score: number; isHighKeyword: boolean } {
  if (!text) return { score: 0, isHighKeyword: false };
  const lower = text.toLowerCase();

  for (const kw of KEYWORDS_HIGH) {
    if (lower.includes(kw)) return { score: 60, isHighKeyword: true };
  }
  for (const kw of KEYWORDS_LOW) {
    if (lower.includes(kw)) return { score: 20, isHighKeyword: false };
  }
  return { score: 0, isHighKeyword: false };
}

// ─────────────────────────────────────────────
// 등급 분류 (섹션 12-2)
// ─────────────────────────────────────────────
function classifyRisk(
  score: number,
  isHighKeyword: boolean,
  memberType: string,
  daysToEvent: number | null,
): { level: "normal" | "low" | "medium" | "high"; score: number } {
  // HIGH 키워드 즉시 HIGH (규칙 4)
  if (isHighKeyword) return { level: "high", score: Math.max(score, 60) };

  // 트레이니 임계값 하향 (섹션 12-5)
  let mediumThreshold = 40;
  if (memberType === "trainee") mediumThreshold = 35;

  // 이벤트 D-3 이내 MEDIUM 임계값 추가 하향 (규칙 1)
  if (daysToEvent !== null && daysToEvent >= 0 && daysToEvent <= 3) {
    mediumThreshold = Math.max(mediumThreshold - 10, 20);
  }

  if (score >= 60) return { level: "high", score };
  if (score >= mediumThreshold) return { level: "medium", score };
  if (score >= 20) return { level: "low", score };
  return { level: "normal", score };
}

// ─────────────────────────────────────────────
// 라우팅 결과 결정
// ─────────────────────────────────────────────
function determineRouting(level: string): string {
  if (level === "high") return "counseling";
  if (level === "medium") return "coaching";
  if (level === "low") return "coaching";
  return "self_care";
}

// ─────────────────────────────────────────────
// 메인 핸들러
// ─────────────────────────────────────────────
serve(async (req) => {
  const corsOpt = handleCorsOptions(req);
  if (corsOpt) return corsOpt;
  const corsHeaders = getCorsHeaders(req);

  try {
    const { checkin_id } = await req.json();
    if (!checkin_id) {
      return new Response(JSON.stringify({ error: "checkin_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // veilor 스키마는 PostgREST에 노출되어 있지 않아 db:{schema:"veilor"} 접근이
    // 406으로 실패한다. public SECURITY DEFINER 래퍼를 경유한다.
    // 마이그레이션: calc_risk_score_public_wrappers
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1~3. 체크인 + 멤버타입 + 최근 5회를 한 번에 조회
    const { data: ctx, error: cErr } = await sb.rpc("fn_b2b_checkin_context", {
      p_checkin_id: checkin_id,
    });

    if (cErr || !ctx?.found) {
      if (cErr) console.error("fn_b2b_checkin_context failed:", cErr.message);
      return new Response(JSON.stringify({ error: "checkin not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const checkin = ctx.checkin;
    const memberType = ctx.member_type ?? "member";

    // fn_b2b_checkin_context는 created_at 오름차순으로 반환한다 (기존 reverse()와 동일 순서)
    const recentAvgs = (ctx.recent ?? [])
      .map((r: { c_avg: number }) => Number(r.c_avg ?? 0));

    // 4. 스코어 계산
    const avg4c = Number(checkin.c_avg ?? 0);
    const minItem = Math.min(
      checkin.c_control ?? 10,
      checkin.c_commitment ?? 10,
      checkin.c_challenge ?? 10,
      checkin.c_confidence ?? 10,
    );

    const scoreA = scoreSignalA(avg4c, minItem);
    const scoreB = scoreSignalB(recentAvgs, checkin.days_to_event);
    const { score: scoreC, isHighKeyword } = scoreSignalC(checkin.free_text);

    const totalScore = scoreA + scoreB + scoreC;
    const { level, score: finalScore } = classifyRisk(
      totalScore,
      isHighKeyword,
      memberType,
      checkin.days_to_event,
    );
    const routing = determineRouting(level);

    // 5. 체크인 업데이트 (meta는 래퍼 안에서 기존 값과 병합된다)
    const { error: applyErr } = await sb.rpc("fn_b2b_apply_risk", {
      p_checkin_id: checkin_id,
      p_risk_score: finalScore,
      p_risk_level: level,
      p_routing: routing,
      p_breakdown: { signal_a: scoreA, signal_b: scoreB, signal_c: scoreC },
    });
    if (applyErr) console.error("fn_b2b_apply_risk failed:", applyErr.message);

    // 6. HIGH 키워드 → crisis_flags 기록
    if (isHighKeyword) {
      const { error: flagErr } = await sb.rpc("fn_b2b_insert_crisis_flag", {
        p_user_id: checkin.member_id,
        p_trigger_text: checkin.free_text ?? "",
        p_keywords: KEYWORDS_HIGH.filter(kw => (checkin.free_text ?? "").includes(kw)),
        p_severity: "high",
        p_status: "open",
      });
      if (flagErr) console.error("fn_b2b_insert_crisis_flag failed:", flagErr.message);
    }

    // 7. MEDIUM / HIGH → 코치 알림 발송
    if (level === "medium" || level === "high") {
      // 담당 코치 + 보호자를 한 번에 조회
      const { data: targets, error: tErr } = await sb.rpc("fn_b2b_alert_targets", {
        p_member_id: checkin.member_id,
        p_org_id: checkin.org_id,
      });
      if (tErr) console.error("fn_b2b_alert_targets failed:", tErr.message);

      if (targets?.coach_id) {
        // send-email Edge Function 호출 (비동기)
        sb.functions.invoke("send-email", {
          body: {
            to_user_id: targets.coach_id,
            template: "b2b_risk_alert",
            data: {
              risk_level: level,
              checkin_id,
              member_id: checkin.member_id,
              org_id: checkin.org_id,
              score: finalScore,
              sla_hours: level === "high" ? 2 : 24,
            },
          },
        }).catch(() => {});
      }

      // 트레이니 HIGH → 보호자 알림 추가
      if (memberType === "trainee" && level === "high" && targets?.guardian_user_id) {
        sb.functions.invoke("send-email", {
          body: {
            to_user_id: targets.guardian_user_id,
            template: "b2b_guardian_alert",
            data: { risk_level: level, member_id: checkin.member_id },
          },
        }).catch(() => {});
      }
    }

    return new Response(
      JSON.stringify({ ok: true, risk_level: level, risk_score: finalScore, routing }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    console.error("[calc-risk-score]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
