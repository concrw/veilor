import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// DM 메시지 AI 유해성 필터
// 역할: 메시지 전송 전 Claude로 harassment/spam/explicit 여부 판별
// 반환: { ok: true, flagged: false } 또는 { ok: true, flagged: true, reason: '...' }

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;

import { getCorsHeaders } from "../_shared/cors.ts";

const SYSTEM_PROMPT = `You are a content safety classifier for a relationship coaching app.
Classify the user message into one of:
- SAFE: normal conversation
- HARASSMENT: threats, insults, targeted attacks
- SPAM: repetitive/promotional content
- EXPLICIT: sexually explicit or graphic content
- CRISIS: self-harm or suicidal content

Respond with JSON only: {"verdict": "SAFE|HARASSMENT|SPAM|EXPLICIT|CRISIS", "reason": "one line explanation if not SAFE"}`;

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(JSON.stringify({ ok: true, flagged: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 짧은 메시지(30자 미만)는 필터 생략 — API 비용 절감
    if (message.trim().length < 30) {
      return new Response(JSON.stringify({ ok: true, flagged: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!res.ok) {
      // Claude API 실패 시 전송 허용 (가용성 우선)
      console.error('[dm-message-filter] Claude API 오류:', await res.text());
      return new Response(JSON.stringify({ ok: true, flagged: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResp = await res.json();
    const raw = aiResp.content?.[0]?.text ?? '{"verdict":"SAFE"}';

    let parsed: { verdict: string; reason?: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { verdict: 'SAFE' };
    }

    const flagged = parsed.verdict !== 'SAFE';

    // 위험 메시지 감사 로그 (fire-and-forget)
    if (flagged && userId) {
      fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/write_audit_log`, {
        method: 'POST',
        headers: {
          'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_schema: 'veilrum',
          p_table: 'dm_message_filter_log',
          p_operation: 'FLAGGED',
          p_user_id: userId,
          p_details: JSON.stringify({ verdict: parsed.verdict, reason: parsed.reason }),
        }),
      }).catch(() => {}); // 로깅 실패해도 무시
      console.warn(`[dm-message-filter] FLAGGED: ${parsed.verdict} for user ${userId}`);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        flagged,
        reason: flagged ? parsed.reason ?? parsed.verdict : undefined,
        verdict: parsed.verdict,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[dm-message-filter] 오류:', message);
    // 오류 시 전송 허용
    return new Response(JSON.stringify({ ok: true, flagged: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
