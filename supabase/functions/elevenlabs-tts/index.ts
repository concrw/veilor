import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const ELEVENLABS_API_KEY    = Deno.env.get("ELEVENLABS_API_KEY") ?? "";
const DEFAULT_VOICE_ID_KO   = Deno.env.get("ELEVENLABS_DEFAULT_VOICE_ID") ?? "";
const DEFAULT_VOICE_ID_EN   = Deno.env.get("ELEVENLABS_DEFAULT_VOICE_ID_EN") ?? "";
const SUPABASE_URL           = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const MODEL_ID               = "eleven_multilingual_v2";

// 분당 최대 TTS 요청 수 (유저별)
const TTS_RATE_LIMIT = 20;

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  const preflight = handleCorsOptions(req);
  if (preflight) return preflight;

  // 인증 확인
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Rate limit (유저 ID 기준, 분당 20회)
  if (!checkRateLimit(`tts:${user.id}`, TTS_RATE_LIMIT, 60_000)) {
    return rateLimitResponse(corsHeaders);
  }

  const { text, voiceId, lang } = await req.json() as {
    text: string;
    voiceId?: string;
    lang?: string;
  };

  if (!text?.trim()) {
    return new Response(JSON.stringify({ error: "text is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Voice ID 우선순위: 요청의 voiceId(사용자 클론) > 언어별 기본값
  const resolvedVoiceId = voiceId
    ?? ((lang ?? "ko").startsWith("ko") ? DEFAULT_VOICE_ID_KO : DEFAULT_VOICE_ID_EN)
    ?? DEFAULT_VOICE_ID_KO;

  if (!resolvedVoiceId) {
    return new Response(JSON.stringify({ error: "Voice ID not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const elevenRes = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key":   ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept":       "audio/mpeg",
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: MODEL_ID,
        voice_settings: { stability: 0.5, similarity_boost: 0.8 },
      }),
    }
  );

  if (!elevenRes.ok) {
    const errText = await elevenRes.text();
    console.error("[elevenlabs-tts] API error:", elevenRes.status, errText);
    return new Response(JSON.stringify({ error: "TTS 서비스 오류" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 오디오 스트림을 그대로 클라이언트에 전달
  return new Response(elevenRes.body, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
});
