// embed-m43-questions
// 역할: 임베딩 없는 m43_domain_questions를 배치로 처리
//       OpenAI text-embedding-3-small → veilor.upsert_question_embedding() RPC
// 호출 방법:
//   1. Supabase Cron (pg_cron) — 매일 새벽 3시
//   2. Admin 수동 호출 (Authorization: Bearer SERVICE_ROLE_KEY)
// Body(선택): { limit: 200 }  — 기본 100개씩 처리

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL            = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY          = Deno.env.get("OPENAI_API_KEY");

const EMBED_MODEL  = "text-embedding-3-small";
const EMBED_DIM    = 1536;
const BATCH_SIZE   = 20;   // OpenAI API 한 번에 최대 전송 수

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    // ── 인증: service role만 허용 ──────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (token !== SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const limit: number = Math.min(body.limit ?? 100, 500);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── 1. 임베딩 없는 질문 목록 조회 ──────────────────────────
    const { data: questions, error: fetchErr } = await supabase
      .schema("veilor")
      .rpc("get_questions_without_embedding", { p_limit: limit });

    if (fetchErr) throw fetchErr;
    if (!questions || questions.length === 0) {
      return new Response(JSON.stringify({ processed: 0, message: "모든 질문에 임베딩 완료" }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // ── 2. BATCH_SIZE 단위로 OpenAI 임베딩 요청 ────────────────
    let processed = 0;
    let failed    = 0;

    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
      const batch = questions.slice(i, i + BATCH_SIZE) as { id: string; question: string }[];
      const texts = batch.map((q) => q.question);

      let embeddings: number[][];
      try {
        const res = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ model: EMBED_MODEL, input: texts, dimensions: EMBED_DIM }),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error(`OpenAI embeddings error (batch ${i}):`, errText);
          failed += batch.length;
          continue;
        }

        const json = await res.json();
        embeddings = json.data.map((d: { embedding: number[] }) => d.embedding);
      } catch (e) {
        console.error(`fetch error (batch ${i}):`, e);
        failed += batch.length;
        continue;
      }

      // ── 3. 각 질문에 임베딩 저장 ────────────────────────────
      for (let j = 0; j < batch.length; j++) {
        const { error: upsertErr } = await supabase
          .schema("veilor")
          .rpc("upsert_question_embedding", {
            p_question_id: batch[j].id,
            p_embedding:   embeddings[j],
          });

        if (upsertErr) {
          console.error(`upsert error (${batch[j].id}):`, upsertErr);
          failed++;
        } else {
          processed++;
        }
      }

      // OpenAI rate limit 대비 배치 간 50ms 대기
      if (i + BATCH_SIZE < questions.length) {
        await new Promise((r) => setTimeout(r, 50));
      }
    }

    return new Response(
      JSON.stringify({ processed, failed, total: questions.length }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } },
    );

  } catch (e: any) {
    console.error("embed-m43-questions error:", e);
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
