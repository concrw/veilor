import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { MODELS, TEMPERATURES } from "../_shared/models.ts";
import { sanitizeUserInput } from "../_shared/sanitize.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

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

    const body = await req.json();

    // Rate limit: 유저당 분당 10회
    const rateLimitKey = body.userId ?? req.headers.get('x-forwarded-for') ?? 'anon';
    if (!checkRateLimit(rateLimitKey, 10, 60_000)) {
      return rateLimitResponse(corsHeaders);
    }

    const emotion = sanitizeUserInput(body.emotion ?? '', 50);
    const text = sanitizeUserInput(body.text ?? '', 2000);
    const mask = sanitizeUserInput(body.mask ?? '', 50);
    const axisScores = body.axisScores;
    const history = body.history;

    // 개인화 컨텍스트 구성
    let context = '';
    if (emotion) context += `현재 감정: ${emotion}\n`;
    if (mask) context += `관계 가면: ${mask}\n`;
    if (axisScores) {
      context += `관계 역량 축: 애착(A):${axisScores.A}/100, 소통(B):${axisScores.B}/100, 욕구표현(C):${axisScores.C}/100, 역할(D):${axisScores.D}/100\n`;
    }
    context += `\n사용자가 말한 내용:\n${text}`;

    // 대화 히스토리 → Claude messages 형식
    const messages: { role: string; content: string }[] = [];
    if (history && Array.isArray(history)) {
      for (const h of history.slice(-6)) { // 최근 6턴만
        if (h.role === 'user') messages.push({ role: 'user', content: h.text });
        else if (h.role === 'ai') messages.push({ role: 'assistant', content: h.text });
      }
    }
    messages.push({ role: 'user', content: context });

    const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODELS.SONNET,
        max_tokens: 512,
        temperature: TEMPERATURES.CONVERSATION,
        system: `너는 '엠버'라는 이름의 AI 감정 수용 파트너야. 전문 상담사가 아니며, 사용자가 자신의 감정과 경험을 털어놓을 때 깊이 들어주고 감정을 있는 그대로 인정한다.

응답 원칙:
- 3~5문장 이내로 간결하게
- 감정에 이름을 붙여주되 과장하지 않는다
- "당연히 그럴 수 있어요", "그 감정 충분히 이해돼요" 같은 수용적 언어 사용
- 조언, 당위, 긍정적 재구성 금지
- 사용자의 관계 역량 축 점수가 제공되면, 그 패턴을 자연스럽게 반영하되 점수를 직접 언급하지 않는다
- 예: 애착 축이 높으면 "상대의 반응이 많이 중요하게 느껴지시는 것 같아요" 식으로 녹여낸다
- 한국어로 답변, 존댓말 사용
- 위기 상황(자해/자살 표현) 감지 시: 공감 후 "자살예방상담전화 1393"을 안내한다`,
        messages,
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
    const response: string = data?.content?.[0]?.text?.trim() ?? '';

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('held-chat error:', error);
    return new Response(JSON.stringify({ error: '요청 처리 중 오류' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
