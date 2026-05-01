import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.36.3";

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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { db: { schema: "veilor" } },
    );

    const body: TranslateRequest = await req.json();
    const { user_id, content, source_lang, target_langs, table_name, row_id } = body;

    if (!user_id || !content || !target_langs?.length) {
      return new Response(
        JSON.stringify({ ok: false, error: "INVALID_PARAMS" }),
        { status: 400, headers },
      );
    }

    // Pro 유저 확인
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("auto_translate")
      .eq("user_id", user_id)
      .single();

    if (!profile?.auto_translate) {
      return new Response(
        JSON.stringify({ ok: false, error: "AUTO_TRANSLATE_DISABLED" }),
        { status: 403, headers },
      );
    }

    // 크레딧 잔액 확인
    const { data: credits } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", user_id)
      .single();

    const balance = credits?.balance ?? 0;
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
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Translate the following text to ${langName} naturally.\nKeep the emotional tone and personal voice intact.\nRespond with only the translated text, no explanations.\n\nText: ${content}`,
          },
        ],
      });
      const translated = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
      translations[targetLang] = translated;
    }

    // 번역 결과를 같은 테이블에 lang = targetLang 행으로 삽입
    if (table_name === "codetalk_entries" && row_id) {
      const { data: original } = await supabase
        .from("codetalk_entries")
        .select("*")
        .eq("id", row_id)
        .single();

      if (original) {
        for (const [lang, translated] of Object.entries(translations)) {
          await supabase.from("codetalk_entries").insert({
            ...original,
            id: undefined,
            lang,
            definition: translated,
            imprinting_moment: original.imprinting_moment,
            root_cause: original.root_cause,
            created_at: undefined,
            updated_at: undefined,
          });
        }
      }
    } else if (table_name === "community_posts" && row_id) {
      const { data: original } = await supabase
        .from("community_posts")
        .select("*")
        .eq("id", row_id)
        .single();

      if (original) {
        for (const [lang, translated] of Object.entries(translations)) {
          await supabase.from("community_posts").insert({
            ...original,
            id: undefined,
            lang,
            content: translated,
            created_at: undefined,
            updated_at: undefined,
          });
        }
      }
    }

    // 크레딧 차감
    const newBalance = balance - cost;
    await supabase
      .from("user_credits")
      .upsert({ user_id, balance: newBalance, updated_at: new Date().toISOString() });

    await supabase.from("credit_transactions").insert({
      user_id,
      amount: -cost,
      reason: "auto_translate",
    });

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
      status: 500,
      headers,
    });
  }
});
