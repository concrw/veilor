import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { MODELS, TEMPERATURES } from "../_shared/models.ts";
import { getAuthenticatedUser, AuthError } from "../_shared/auth.ts";
import { sanitizeUserInput } from "../_shared/sanitize.ts";
import { checkAiAccess, aiGateResponse, logAiUsage } from "../_shared/aiGate.ts";

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

interface JobItem { name: string; reason?: string }

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // C3 수정: 인증 추가
    const { user: authUser } = await getAuthenticatedUser(req);

    // AI 비용 게이트 (구독 여부 + 월 $7 한도)
    const gate = await checkAiAccess(authUser.id);
    if (!gate.allowed) {
      return aiGateResponse(gate, corsHeaders);
    }

    const body = await req.json();
    const happyJobs: JobItem[] = (body.happyJobs ?? []).map((j: JobItem) => ({
      name: sanitizeUserInput(j.name ?? '', 200),
      reason: j.reason ? sanitizeUserInput(j.reason, 500) : undefined,
    }));
    const painJobs: JobItem[] = (body.painJobs ?? []).map((j: JobItem) => ({
      name: sanitizeUserInput(j.name ?? '', 200),
      reason: j.reason ? sanitizeUserInput(j.reason, 500) : undefined,
    }));
    const firstMemories: string[] = (body.firstMemories ?? []).map((m: unknown) =>
      sanitizeUserInput(String(m ?? ''), 500)
    );

    const formatJobs = (items: JobItem[]) =>
      (Array.isArray(items) ? items : []).map(j => `- ${j.name}${j.reason ? `: ${j.reason}` : ''}`).join('\n');

    const formatMems = (items: unknown[]) =>
      (Array.isArray(items) ? items : []).filter(Boolean).map(m => `- ${String(m)}`).join('\n');

    const happyText = formatJobs(happyJobs);
    const painText = formatJobs(painJobs);
    const memText = formatMems(firstMemories);

    const userPrompt = `다음 데이터를 분석해서 이 사람의 Prime Perspective를 도출해줘:\n\n` +
      `행복한 직업들:\n${happyText || '- (없음)'}\n\n` +
      `고통스러운 직업들:\n${painText || '- (없음)'}\n\n` +
      `각인 순간들:\n${memText || '- (없음)'}\n\n` +
      `이를 바탕으로:\n` +
      `1. 이 사람이 언제 가장 행복하고 번영하는지\n` +
      `2. 핵심 가치와 동기가 무엇인지\n` +
      `3. 회피하는 요소들은 무엇인지\n\n` +
      `2-3문장으로 Prime Perspective를 작성해줘. 한국어로 답변해줘.`;

    const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODELS.SONNET,
        max_tokens: 1024,
        temperature: TEMPERATURES.ANALYSIS,
        system: '너는 커리어 분석가다. 입력 데이터를 간결히 통합하여 2-3문장으로 Prime Perspective를 한국어로 작성한다. 불필요한 서론, 헤더, 목록 없이 자연스러운 단락으로만 작성한다.',
        messages: [
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!aiResp.ok) {
      const details = await aiResp.text();
      console.error('Anthropic error:', aiResp.status, details);
      return new Response(JSON.stringify({ error: 'Claude API 호출 실패', details }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await aiResp.json();
    logAiUsage({ userId: authUser.id, model: MODELS.SONNET, usage: data?.usage, tab: 'perspective' });
    const content: string = data?.content?.[0]?.text?.trim() ?? '';

    return new Response(JSON.stringify({ primePerspective: content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('analyze-perspective error:', error);
    return new Response(JSON.stringify({ error: '요청 처리 중 오류' }), {
      status: error instanceof AuthError ? error.status : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
