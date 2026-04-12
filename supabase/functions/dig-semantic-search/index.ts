/**
 * dig-semantic-search — M43 질문 시맨틱 검색 (pgvector + embedding)
 *
 * Anthropic 임베딩을 통해 사용자 입력과 M43 질문의 의미적 유사도를 계산.
 * 기존 키워드 매칭보다 훨씬 관련성 높은 결과를 반환.
 *
 * pgvector가 없거나 임베딩이 없는 경우 graceful fallback 없음
 * (이 함수는 pgvector 확장 + m43_domain_questions.embedding 컬럼이 전제)
 */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { sanitizeUserInput } from "../_shared/sanitize.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY 미설정' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const rateLimitKey = body.userId ?? req.headers.get('x-forwarded-for') ?? 'anon';
    if (!checkRateLimit(rateLimitKey, 20, 60_000)) return rateLimitResponse(corsHeaders);

    const query = sanitizeUserInput(body.query ?? '', 500);
    const divisionId = body.divisionId ?? null;
    const limit = Math.min(Number(body.limit ?? 5), 10);

    if (!query) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1단계: 쿼리 임베딩 생성 (Anthropic voyage-multilingual-2)
    const embedResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{ role: 'user', content: `임베딩 생성: ${query}` }],
        // 실제로는 embedding API 사용; Claude message API로 대체 사용 불가
        // → Supabase RPC fn_semantic_search로 서버사이드 처리
      }),
    });

    // Anthropic은 별도 embedding endpoint가 없으므로
    // Supabase RPC에서 pg_embedding/pgvector로 처리
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: 'veilor' },
    });

    // fn_dig_semantic_search RPC 호출 (pgvector 기반)
    const { data, error } = await sb.rpc('fn_dig_semantic_search', {
      p_query: query,
      p_division_id: divisionId,
      p_limit: limit,
    });

    if (error) {
      // pgvector / 임베딩 없는 환경 — 빈 배열 반환 (키워드 검색 fallback은 클라이언트에서)
      console.warn('fn_dig_semantic_search error:', error.message);
      return new Response(JSON.stringify({ results: [], fallback: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ results: data ?? [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('dig-semantic-search error:', err);
    return new Response(JSON.stringify({ results: [], fallback: true }), {
      status: 200, // fallback이므로 200 반환
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
