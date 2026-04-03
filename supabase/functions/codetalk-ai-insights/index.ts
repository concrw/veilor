import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getAuthenticatedUser, createServiceClient } from "../_shared/auth.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing ANTHROPIC_API_KEY" }), {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // ── 1. 인증 확인 (요청자 = auth user)
    const { user: authUser } = await getAuthenticatedUser(req);
    const supabaseAdmin = createServiceClient();

    // ── 2. 요청 body 파싱
    const body = await req.json();
    const { entry_id, user_id } = body;

    // 요청된 user_id가 실제 인증된 사용자와 일치하는지 서버에서 확인
    if (user_id !== authUser.id) {
      return new Response(JSON.stringify({ error: "Forbidden: user_id mismatch" }), {
        status: 403,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // ── 3. 서버사이드 구독 검증 (핵심 보안 로직)
    const { data: profile } = await supabaseAdmin
      .schema("veilrum")
      .from("user_profiles")
      .select("subscription_tier, subscription_expires_at")
      .eq("user_id", authUser.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const tier = profile.subscription_tier as string;
    const expiresAt = profile.subscription_expires_at as string | null;
    const isPro = tier === "pro" || tier === "elite" || tier === "premium" || tier === "enterprise";

    // 만료일 체크 (서버 시간 기준)
    if (!isPro) {
      return new Response(JSON.stringify({ error: "Pro subscription required" }), {
        status: 403,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    if (expiresAt && new Date(expiresAt) < new Date()) {
      return new Response(JSON.stringify({ error: "Subscription expired" }), {
        status: 403,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // ── 4. 해당 entry 조회 (작성자 본인 것인지 확인)
    const { data: entry } = await supabaseAdmin
      .schema("veilrum")
      .from("codetalk_entries")
      .select("keyword, definition, created_at")
      .eq("id", entry_id)
      .eq("user_id", authUser.id)  // 본인 entry만 조회
      .single();

    if (!entry) {
      return new Response(JSON.stringify({ error: "Entry not found" }), {
        status: 404,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // ── 5. 과거 패턴 컨텍스트 로드
    const { data: pp } = await supabaseAdmin
      .schema("veilrum")
      .from("prime_perspectives")
      .select("held_signals, dig_signals, codetalk_signals")
      .eq("user_id", authUser.id)
      .maybeSingle();

    const recentVent = ((pp?.held_signals ?? []) as any[])
      .filter((s) => s.emotion && s.type !== "summary")
      .slice(-5)
      .map((s) => `감정: ${s.emotion}`)
      .join(", ");

    const recentDomains = ((pp?.dig_signals ?? []) as any[])
      .slice(-5)
      .map((s) => s.domain)
      .filter(Boolean)
      .join(", ");

    const recentKeywords = ((pp?.codetalk_signals ?? []) as any[])
      .slice(-10)
      .map((s) => s.keyword)
      .filter(Boolean)
      .join(", ");

    // ── 6. Claude AI 조언 생성
    const prompt = `사용자가 오늘의 키워드 "${entry.keyword}"에 대해 이렇게 기록했습니다:

"${entry.definition}"

[사용자 최근 패턴]
- 최근 감정: ${recentVent || "정보 없음"}
- 반복 도메인: ${recentDomains || "정보 없음"}
- 최근 키워드 흐름: ${recentKeywords || "정보 없음"}

위 기록과 패턴을 바탕으로 아래 4가지를 각각 2~3문장으로 한국어로 답해주세요:
1. insight: 이 기록에서 드러나는 핵심 통찰
2. pattern: 관계에서 반복되는 패턴 연결
3. growth: 다음 7일간 시도해볼 구체적 행동
4. affirmation: 따뜻한 응원 한 마디

반드시 JSON 형식으로만 응답하세요: {"insight":"...","pattern":"...","growth":"...","affirmation":"..."}`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: "당신은 관계 심리 전문 코치입니다. 반드시 유효한 JSON만 응답합니다. 다른 텍스트 없이 JSON만.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiRes.ok) {
      throw new Error(`Anthropic API error: ${aiRes.status}`);
    }

    const aiJson = await aiRes.json();
    const rawText = aiJson?.content?.[0]?.text?.trim() ?? "{}";

    let insights: Record<string, string>;
    try {
      insights = JSON.parse(rawText);
    } catch {
      insights = {
        insight: "오늘의 기록에서 자신의 경계와 감정을 인식하고 있음을 느낄 수 있습니다.",
        pattern: "이 키워드는 반복되는 관계 패턴과 연결될 수 있습니다.",
        growth: "오늘 기록한 내용을 바탕으로 한 가지 작은 실천을 시도해보세요.",
        affirmation: "오늘도 자신을 이해하려는 노력, 충분히 가치 있습니다.",
      };
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });

  } catch (e: any) {
    console.error("codetalk-ai-insights error:", e);
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
