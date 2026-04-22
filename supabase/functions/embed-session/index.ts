/**
 * embed-session — KURE-v1 세션 임베딩 파이프라인
 *
 * 흐름:
 *   1. dive_sessions에서 session_embedding NULL인 완료 세션 조회
 *   2. context_summary + held_keywords → HuggingFace KURE-v1 임베딩
 *   3. vector(1024) → dive_sessions.session_embedding 저장
 *   4. 이후 fn_similar_sessions()로 유사 패턴 검색 가능
 *
 * 호출 방법:
 *   - Supabase Cron (pg_cron): 매 시간 정각
 *   - 세션 완료 직후 held-chat에서 직접 호출 (body: { sessionId })
 *
 * 환경변수:
 *   HUGGINGFACE_API_KEY  — HF Inference API 토큰
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const HF_API_KEY              = Deno.env.get('HUGGINGFACE_API_KEY') ?? '';
const SUPABASE_URL            = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// KURE-v1: 고려대 NLP&AI Lab, MIT 라이선스
// 차원: 1024, 한국어 텍스트 임베딩 특화
const KURE_MODEL = 'nlpai-lab/KURE-v1';

async function getEmbedding(text: string): Promise<number[] | null> {
  if (!HF_API_KEY || !text.trim()) return null;

  const resp = await fetch(
    `https://api-inference.huggingface.co/pipeline/feature-extraction/${KURE_MODEL}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
    },
  );

  if (!resp.ok) {
    console.warn('KURE-v1 API error:', resp.status, await resp.text());
    return null;
  }

  const raw = await resp.json();
  // feature-extraction 응답: [[...1024 floats...]] (batch=1) 또는 [...1024 floats...]
  const vector: number[] = Array.isArray(raw[0]) ? raw[0] : raw;
  if (!Array.isArray(vector) || vector.length !== 1024) {
    console.warn('Unexpected KURE-v1 output shape:', vector?.length);
    return null;
  }
  return vector;
}

// pgvector 배열 형식으로 변환: [0.1, 0.2, ...] → '[0.1,0.2,...]'
function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(',')}]`;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  // 서비스 롤 또는 Admin만 호출 가능
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');
  const isServiceRole = token === SUPABASE_SERVICE_ROLE_KEY;

  if (!isServiceRole) {
    // 일반 사용자 호출: 자신의 세션 1개만 허용 (sessionId 필수)
    const body = await req.json().catch(() => ({}));
    const sessionId = body.sessionId as string | undefined;
    const userId    = body.userId    as string | undefined;

    if (!sessionId || !userId) {
      return new Response(JSON.stringify({ error: 'sessionId, userId 필수' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 단일 세션 임베딩
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: 'veilor' },
    });

    const { data: session } = await sb
      .from('dive_sessions')
      .select('id, context_summary, held_keywords, emotion')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (!session) {
      return new Response(JSON.stringify({ embedded: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const text = buildSessionText(session);
    const vec  = await getEmbedding(text);

    if (vec) {
      await sb.from('dive_sessions')
        .update({ session_embedding: toVectorLiteral(vec) as unknown })
        .eq('id', sessionId);
    }

    return new Response(JSON.stringify({ embedded: vec ? 1 : 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 서비스 롤: 배치 처리 (기본 50개씩)
  const body = await req.json().catch(() => ({}));
  const batchLimit = Math.min(Number(body.limit ?? 50), 200);

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'veilor' },
  });

  const { data: sessions, error } = await sb
    .from('dive_sessions')
    .select('id, context_summary, held_keywords, emotion')
    .eq('session_completed', true)
    .is('session_embedding', null)
    .not('context_summary', 'is', null)
    .order('created_at', { ascending: false })
    .limit(batchLimit);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!sessions || sessions.length === 0) {
    return new Response(JSON.stringify({ embedded: 0, message: '처리할 세션 없음' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let embedded = 0;
  for (const session of sessions) {
    const text = buildSessionText(session);
    const vec  = await getEmbedding(text);
    if (!vec) continue;

    const { error: updateErr } = await sb
      .from('dive_sessions')
      .update({ session_embedding: toVectorLiteral(vec) as unknown })
      .eq('id', session.id);

    if (!updateErr) embedded++;

    // HF API rate limit 방어: 200ms 딜레이
    await new Promise(r => setTimeout(r, 200));
  }

  return new Response(JSON.stringify({ embedded, total: sessions.length }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

function buildSessionText(session: {
  emotion?: string | null;
  context_summary?: string | null;
  held_keywords?: string[] | null;
}): string {
  const parts: string[] = [];
  if (session.emotion) parts.push(`감정: ${session.emotion}`);
  if (session.context_summary) parts.push(session.context_summary.slice(0, 500));
  if (Array.isArray(session.held_keywords) && session.held_keywords.length > 0) {
    parts.push(`키워드: ${session.held_keywords.slice(0, 10).join(', ')}`);
  }
  return parts.join('\n');
}
