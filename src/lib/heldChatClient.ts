/**
 * held-chat 클라이언트 — Supabase Edge Function 중계
 * API 키는 서버(Edge Function)에서만 보유. 클라이언트에 노출되지 않음.
 */

import { supabase } from '@/integrations/supabase/client';
import { detectCrisisLevel } from './crisisDetect';

const CRISIS_RESPONSE_CRITICAL = `지금 정말 힘드시겠어요. 혼자 이 무게를 지고 계셨던 거죠.

지금 바로 연락할 수 있는 곳이 있어요:
📞 **자살예방상담전화 1393** (24시간, 무료)
📞 **정신건강위기상담전화 1577-0199** (24시간)

지금 안전한가요? 오늘 밤 옆에 있어줄 수 있는 사람이 있으면 좋겠어요.`;

const CRISIS_RESPONSE_HIGH = `지금 많이 지쳐 있는 것 같아서 마음이 쓰여요.

혼자서 너무 오래 버텨오신 건 아닌지 걱정돼요. 언제든 이야기 나눌 수 있는 곳이 있어요:
📞 **자살예방상담전화 1393** (24시간)

지금 어떤 상황인지 조금 더 이야기해줄 수 있어요?`;

export interface HeldChatParams {
  emotion?: string;
  text: string;
  mask?: string;
  mskCode?: string;
  axisScores?: { A: number; B: number; C: number; D: number } | null;
  history?: Array<{ role: 'user' | 'ai'; text: string }>;
  aiSettings?: { name?: string; tone?: string; personality?: string };
  tab?: string;
  userId?: string;
  similarCount?: number; // 비슷한 고민을 가진 가상유저 수 — AI 패턴 컨텍스트
}

export interface HeldChatResult {
  response: string;
  crisis?: 'critical' | 'high' | 'none';
}

export async function invokeHeldChat(
  params: HeldChatParams,
  signal?: AbortSignal,
): Promise<HeldChatResult> {
  const { text } = params;

  // ── 1차 클라이언트 위기 감지 (즉각 차단, 서버 왕복 없음) ──
  const crisisLevel = detectCrisisLevel(text);
  if (crisisLevel === 'critical') {
    return { response: CRISIS_RESPONSE_CRITICAL, crisis: 'critical' };
  }
  if (crisisLevel === 'high') {
    return { response: CRISIS_RESPONSE_HIGH, crisis: 'high' };
  }

  // ── Edge Function 경유 (API 키는 서버에만 존재) ──
  const { data: { session } } = await supabase.auth.getSession();

  const controller = new AbortController();
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/held-chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        ...params,
        userId: params.userId ?? session?.user?.id,
      }),
      signal: controller.signal,
    },
  );

  if (!res.ok) {
    const details = await res.text().catch(() => '');
    throw new Error(`held-chat 오류: ${res.status} ${details}`);
  }

  const data = await res.json() as HeldChatResult;
  return data;
}

/**
 * SSE 스트리밍 모드 — Anthropic SSE 이벤트를 청크 단위로 콜백 전달
 * onChunk: 텍스트 델타가 올 때마다 호출
 * returns: 완성된 전체 응답 문자열
 */
export async function invokeHeldChatStream(
  params: HeldChatParams,
  onChunk: (delta: string) => void,
  signal?: AbortSignal,
): Promise<HeldChatResult> {
  const { text } = params;

  const crisisLevel = detectCrisisLevel(text);
  if (crisisLevel === 'critical') {
    onChunk(CRISIS_RESPONSE_CRITICAL);
    return { response: CRISIS_RESPONSE_CRITICAL, crisis: 'critical' };
  }
  if (crisisLevel === 'high') {
    onChunk(CRISIS_RESPONSE_HIGH);
    return { response: CRISIS_RESPONSE_HIGH, crisis: 'high' };
  }

  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/held-chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        ...params,
        userId: params.userId ?? session?.user?.id,
      }),
      signal,
    },
  );

  if (!res.ok || !res.body) {
    throw new Error(`held-chat 스트리밍 오류: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') break;

      try {
        const evt = JSON.parse(raw);
        // Anthropic SSE: content_block_delta 이벤트에서 텍스트 추출
        const delta: string = evt?.delta?.text ?? '';
        if (delta) {
          fullText += delta;
          onChunk(delta);
        }
      } catch {
        // 파싱 실패한 줄은 무시
      }
    }
  }

  return { response: fullText };
}
