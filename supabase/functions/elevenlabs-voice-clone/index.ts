import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

const ELEVENLABS_API_KEY  = Deno.env.get("ELEVENLABS_API_KEY") ?? "";
const SUPABASE_URL         = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Voice Clone은 유저당 1분에 1회 제한 (업로드 남용 방지)
const CLONE_COOLDOWN_MS = 60_000;
const lastCloneTime = new Map<string, number>();

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  const preflight = handleCorsOptions(req);
  if (preflight) return preflight;

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

  // 쿨다운 체크
  const last = lastCloneTime.get(user.id) ?? 0;
  if (Date.now() - last < CLONE_COOLDOWN_MS) {
    return new Response(JSON.stringify({ error: "잠시 후 다시 시도해 주세요." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // multipart/form-data 그대로 ElevenLabs에 전달
  const formData = await req.formData();

  // name 미지정 시 기본값 설정
  if (!formData.get("name")) {
    formData.set("name", `veilor_user_${user.id.slice(0, 8)}`);
  }
  formData.set("description", "VEILOR user voice clone");

  const elevenRes = await fetch("https://api.elevenlabs.io/v1/voices/add", {
    method: "POST",
    headers: { "xi-api-key": ELEVENLABS_API_KEY },
    body: formData,
  });

  if (!elevenRes.ok) {
    const errText = await elevenRes.text();
    console.error("[elevenlabs-voice-clone] API error:", elevenRes.status, errText);
    return new Response(JSON.stringify({ error: "Voice Clone 오류" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const result = await elevenRes.json() as { voice_id: string };
  lastCloneTime.set(user.id, Date.now());

  // user_profiles에 voice_id 저장
  await supabase
    .from("user_profiles")
    .update({ elevenlabs_voice_id: result.voice_id })
    .eq("user_id", user.id);

  return new Response(JSON.stringify({ voice_id: result.voice_id }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
