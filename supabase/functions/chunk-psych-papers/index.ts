import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CHUNK_MAX_CHARS = 2000;
const BATCH_SIZE = 100;

/**
 * 단락 경계(\n\n) 기준으로 텍스트를 분할.
 * 단락이 CHUNK_MAX_CHARS를 초과하면 문장 단위(. )로 추가 분할.
 */
function splitIntoChunks(text: string, maxChars: number): string[] {
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter((p) => p.length > 0);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if (para.length > maxChars) {
      if (current.trim()) { chunks.push(current.trim()); current = ""; }
      const sentences = para.match(/[^.!?]+[.!?]+/g) ?? [para];
      let senBuf = "";
      for (const sen of sentences) {
        if ((senBuf + sen).length > maxChars && senBuf.trim()) {
          chunks.push(senBuf.trim()); senBuf = "";
        }
        senBuf += " " + sen;
      }
      if (senBuf.trim()) chunks.push(senBuf.trim());
    } else if ((current + "\n\n" + para).length > maxChars) {
      if (current.trim()) chunks.push(current.trim());
      current = para;
    } else {
      current = current ? current + "\n\n" + para : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter((c) => c.length > 50);
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // 관리자 전용 — Authorization 헤더로 service role key 확인
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.includes(SUPABASE_SERVICE_ROLE_KEY.slice(-10))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: "veilor" },
  });

  const body = await req.json().catch(() => ({}));
  const offset = Number(body.offset ?? 0);
  const limit = Math.min(Number(body.limit ?? BATCH_SIZE), 500);
  const domainFilter: string | null = body.domain_code ?? null;

  // 청킹 대상 논문 조회 — chunked=false 필터
  let query = sb
    .from("psych_papers")
    .select("id, title, abstract, domain_codes")
    .eq("chunked", false)
    .not("abstract", "is", null)
    .range(offset, offset + limit - 1);

  if (domainFilter) {
    query = query.contains("domain_codes", [domainFilter]);
  }

  const { data: papers, error: fetchErr } = await query;
  if (fetchErr) {
    return new Response(JSON.stringify({ error: fetchErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!papers || papers.length === 0) {
    return new Response(JSON.stringify({ processed: 0, skipped: 0, message: "no papers found" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let processed = 0;
  let skipped = 0;
  let totalChunks = 0;

  for (const paper of papers) {
    if (!paper.abstract || paper.abstract.length < 50) { skipped++; continue; }

    const chunks = splitIntoChunks(paper.abstract, CHUNK_MAX_CHARS);
    if (chunks.length === 0) { skipped++; continue; }

    const rows = chunks.map((content, i) => ({
      paper_id: paper.id,
      chunk_index: i,
      chunk_type: "abstract",
      content,
      domain_codes: paper.domain_codes ?? [],
      token_count: Math.ceil(content.length / 4),
    }));

    const { error: insertErr } = await sb.from("psych_paper_chunks").insert(rows);
    if (insertErr) {
      console.error(`chunk insert error for ${paper.id}:`, insertErr.message);
      skipped++;
      continue;
    }

    await sb.from("psych_papers").update({ chunked: true }).eq("id", paper.id);

    processed++;
    totalChunks += chunks.length;
  }

  return new Response(
    JSON.stringify({ processed, skipped, total_chunks_created: totalChunks, offset, limit }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
