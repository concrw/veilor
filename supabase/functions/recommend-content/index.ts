import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";

interface ContentRecommendation {
  id: string;
  type: "article" | "course" | "book" | "video";
  title: string;
  description: string;
  url?: string;
  relevance_score: number;
  tags: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  try {
    const { user, client: supabaseClient } = await getAuthenticatedUser(req);

    // Fetch user's Why analysis
    const { data: whyData } = await supabaseClient
      .from("why_analysis")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch user's Ikigai
    const { data: ikigaiData } = await supabaseClient
      .from("ikigai_designs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch user's Brand Strategy
    const { data: brandData } = await supabaseClient
      .from("brand_strategies")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Extract keywords from user data
    const keywords: string[] = [];

    if (whyData?.prime_perspective) {
      // Extract key terms from perspective
      const perspectiveTerms = whyData.prime_perspective
        .split(/[,.\s]+/)
        .filter((term: string) => term.length > 2);
      keywords.push(...perspectiveTerms.slice(0, 5));
    }

    if (ikigaiData) {
      keywords.push(...(ikigaiData.love_elements || []).slice(0, 3));
      keywords.push(...(ikigaiData.good_at_elements || []).slice(0, 3));
      keywords.push(...(ikigaiData.world_needs_elements || []).slice(0, 3));
    }

    if (brandData?.brand_direction) {
      if (brandData.brand_direction.field) {
        keywords.push(brandData.brand_direction.field);
      }
      if (brandData.brand_direction.topics) {
        keywords.push(...brandData.brand_direction.topics.slice(0, 3));
      }
    }

    // Generate recommendations using Claude API
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicKey) {
      // Return mock recommendations with is_mock flag
      const mockRecommendations: ContentRecommendation[] = generateMockRecommendations(keywords);
      return new Response(
        JSON.stringify({ recommendations: mockRecommendations, keywords, is_mock: true }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const prompt = `사용자의 관심사와 역량을 기반으로 콘텐츠를 추천해주세요.

사용자 키워드: ${keywords.join(", ")}

다음 형식으로 5개의 추천 콘텐츠를 JSON 배열로 반환해주세요:
[
  {
    "id": "unique-id",
    "type": "article" | "course" | "book" | "video",
    "title": "콘텐츠 제목",
    "description": "50자 이내 설명",
    "tags": ["태그1", "태그2"],
    "relevance_score": 0.0-1.0
  }
]

한국어로 답변해주세요. JSON만 반환하세요.`;

    let content = "";

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [
          { role: "user", content: prompt },
        ],
      }),
    });

    if (claudeResponse.ok) {
      const claudeResult = await claudeResponse.json();
      content = claudeResult.content?.[0]?.text || "";
    }

    let recommendations: ContentRecommendation[];
    try {
      recommendations = JSON.parse(content.replace(/```json\n?|\n?```/g, ""));
    } catch {
      recommendations = generateMockRecommendations(keywords);
    }

    return new Response(
      JSON.stringify({ recommendations, keywords }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});

function generateMockRecommendations(keywords: string[]): ContentRecommendation[] {
  const templates = [
    {
      type: "article" as const,
      titlePrefix: "퍼스널 브랜딩의 핵심:",
      descPrefix: "자신만의 강점을 발견하고",
    },
    {
      type: "course" as const,
      titlePrefix: "실전 워크숍:",
      descPrefix: "체계적인 학습을 통해",
    },
    {
      type: "book" as const,
      titlePrefix: "추천 도서:",
      descPrefix: "깊이 있는 통찰을 제공하는",
    },
    {
      type: "video" as const,
      titlePrefix: "영상 강의:",
      descPrefix: "시각적으로 배우는",
    },
  ];

  const mainKeyword = keywords[0] || "자기계발";

  return templates.map((template, index) => ({
    id: `rec-${Date.now()}-${index}`,
    type: template.type,
    title: `${template.titlePrefix} ${mainKeyword}`,
    description: `${template.descPrefix} ${mainKeyword}에 대한 콘텐츠입니다.`,
    tags: keywords.slice(0, 3),
    relevance_score: Math.round((0.9 - index * 0.1) * 100) / 100,
  }));
}
