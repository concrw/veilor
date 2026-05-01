import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const HF_API_KEY = Deno.env.get("HUGGINGFACE_API_KEY") ?? "";
const CF_ACCOUNT_ID = Deno.env.get("CF_ACCOUNT_ID") ?? "";
const CF_API_TOKEN = Deno.env.get("CF_API_TOKEN") ?? "";

const KURE_URL = "https://router.huggingface.co/hf-inference/models/nlpai-lab/KURE-v1";
const VECTORIZE_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/vectorize/v2/indexes/veilor-psych`;
const BATCH_SIZE = 20;
const EMBED_TIMEOUT_MS = 8000;

async function embedText(text: string): Promise<number[] | null> {
  try {
    const resp = await fetch(KURE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text.slice(0, 512), options: { wait_for_model: true } }),
      signal: AbortSignal.timeout(EMBED_TIMEOUT_MS),
    });
    if (!resp.ok) return null;
    const raw = await resp.json();
    const vec: number[] = Array.isArray(raw[0]) ? raw[0] : raw;
    if (Array.isArray(vec) && vec.length === 1024) return vec;
    return null;
  } catch {
    return null;
  }
}

async function upsertToVectorize(vectors: { id: string; values: number[]; metadata: Record<string, unknown> }[]): Promise<boolean> {
  try {
    const resp = await fetch(`${VECTORIZE_URL}/upsert`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ vectors }),
      signal: AbortSignal.timeout(10000),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.includes(SUPABASE_SERVICE_ROLE_KEY.slice(-10))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!HF_API_KEY) {
    return new Response(JSON.stringify({ error: "HUGGINGFACE_API_KEY 미설정" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    return new Response(JSON.stringify({ error: "CF_ACCOUNT_ID / CF_API_TOKEN 미설정" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: "veilor" },
  });

  const body = await req.json().catch(() => ({}));
  const batchSize = Math.min(Number(body.batch_size ?? BATCH_SIZE), 50);
  const domainFilter: string | null = body.domain_code ?? null;

  // vectorized=false 청크 조회
  let query = sb
    .from("psych_paper_chunks")
    .select("id, content, domain_codes, paper_id")
    .eq("vectorized", false)
    .limit(batchSize);

  if (domainFilter) {
    query = query.contains("domain_codes", [domainFilter]);
  }

  const { data: chunks, error: fetchErr } = await query;
  if (fetchErr) {
    return new Response(JSON.stringify({ error: fetchErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!chunks || chunks.length === 0) {
    return new Response(
      JSON.stringify({ embedded: 0, failed: 0, remaining: 0, message: "모든 청크 벡터화 완료" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let embedded = 0;
  let failed = 0;
  const succeededIds: string[] = [];

  for (const chunk of chunks) {
    const vec = await embedText(chunk.content);
    if (!vec) { failed++; continue; }

    const ok = await upsertToVectorize([{
      id: chunk.id,
      values: vec,
      metadata: {
        paper_id: chunk.paper_id,
        domain_codes: chunk.domain_codes ?? [],
      },
    }]);

    if (ok) {
      succeededIds.push(chunk.id);
      embedded++;
    } else {
      failed++;
    }
  }

  // 성공한 청크만 vectorized=true 업데이트
  if (succeededIds.length > 0) {
    await sb
      .from("psych_paper_chunks")
      .update({ vectorized: true })
      .in("id", succeededIds);
  }

  // 남은 미벡터화 청크 수
  const { count: remaining } = await sb
    .from("psych_paper_chunks")
    .select("id", { count: "exact", head: true })
    .eq("vectorized", false);

  return new Response(
    JSON.stringify({ embedded, failed, remaining: remaining ?? 0 }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
