import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Signal Tagging Worker
// 역할: veilor.signal_tagging_jobs의 pending 잡을 배치 처리
//       process_pending_keyword_tags() RPC 호출 → signal_m43_tags 태깅 실행
// 호출: cron(5분 간격) 또는 수동 POST

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WORKER_SECRET = Deno.env.get('WORKER_SECRET');

import { getCorsHeaders } from "../_shared/cors.ts";

async function callRpc(funcName: string, params: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${funcName}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Accept-Profile': 'veilor',
      'Content-Profile': 'veilor',
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`RPC ${funcName} 실패: ${err}`);
  }
  return res.json();
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Worker Secret 검증 (설정된 경우)
  if (WORKER_SECRET) {
    const provided = req.headers.get('x-worker-secret');
    if (provided !== WORKER_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  try {
    const body = req.method === 'POST' && req.headers.get('content-type')?.includes('application/json')
      ? await req.json().catch(() => ({}))
      : {};

    const batchSize: number = body.batch_size ?? 50;

    // keyword 기반 태깅 배치 처리
    const taggedCount = await callRpc('process_pending_keyword_tags', {
      p_batch_size: batchSize,
    }) as number;

    console.log(`[signal-tagging-worker] keyword 태깅 완료: ${taggedCount}건`);

    return new Response(
      JSON.stringify({
        ok: true,
        keyword_tagged: taggedCount,
        processed_at: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[signal-tagging-worker] 오류:', message);

    return new Response(
      JSON.stringify({ ok: false, error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
