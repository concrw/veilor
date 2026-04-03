// 신호 파이프라인 — Vent/Dig/Set 입력을 Postgres RPC로 트랜잭션 보장 저장
// 설계 원칙: 단일 RPC 호출로 tab_conversations + prime_perspectives + user_signals 동시 write
//           append_vent_signal은 위기 감지 결과(crisis_severity)를 함께 반환
import { supabase, veilrumDb } from '@/integrations/supabase/client';

export type CrisisSeverity = 'none' | 'medium' | 'high' | 'critical';

// ─────────────────────────────────────────────
// VENT: 메시지 1개 보낼 때마다 호출
// 반환값: { signal_id, crisis_severity } — 위기 감지 시 앱에서 UI 처리 가능
// ─────────────────────────────────────────────
export async function saveVentMessage(
  userId: string,
  emotion: string,
  userMessage: string,
  turnIndex: number,
): Promise<{ signalId: string | null; crisisSeverity: CrisisSeverity }> {
  const { data, error } = await veilrumDb.rpc('append_vent_signal', {
    p_user_id:    userId,
    p_emotion:    emotion,
    p_message:    userMessage,
    p_turn_index: turnIndex,
  });
  if (error) console.error('[saveVentMessage]', error);
  return {
    signalId:       data?.signal_id       ?? null,
    crisisSeverity: data?.crisis_severity ?? 'none',
  };
}

// VENT: 대화 완료(4턴) 시 요약 저장
export async function saveVentSummary(
  userId: string,
  emotion: string,
  suggestion: string,
) {
  await veilrumDb.rpc('append_vent_summary', {
    p_user_id:    userId,
    p_emotion:    emotion,
    p_suggestion: suggestion,
  });
}

// ─────────────────────────────────────────────
// DIG: 분석 실행 시 저장
// ─────────────────────────────────────────────
export async function saveDigSignal(
  userId: string,
  signal: {
    situation: string;
    text: string;
    matchedQuestion: string;
    domain: string;
    score: number;
  },
) {
  const { situation, text, matchedQuestion, domain, score } = signal;

  await veilrumDb.rpc('append_dig_signal', {
    p_user_id:          userId,
    p_situation:        situation,
    p_text:             text,
    p_matched_question: matchedQuestion,
    p_domain:           domain,
    p_score:            score,
  });
}

// ─────────────────────────────────────────────
// VENT: 세션 완료 시 dive_sessions에 요약 저장
// RPC 우선 → 실패 시 direct insert 폴백
// ─────────────────────────────────────────────
export async function saveVentSessionSummary(
  userId: string,
  emotion: string,
  messages: { role: string; text: string }[],
  suggestion: string,
  turnCount: number,
): Promise<string | null> {
  // 1차: RPC 호출 시도
  const { data, error } = await veilrumDb.rpc('save_vent_session_summary', {
    p_user_id:    userId,
    p_emotion:    emotion,
    p_messages:   messages,
    p_suggestion: suggestion,
    p_turn_count: turnCount,
  });
  if (!error) return data ?? null;

  console.warn('[saveVentSessionSummary] RPC failed, using direct insert fallback:', error.message);

  // 2차: direct insert 폴백
  const userMsgs = messages.filter(m => m.role === 'user').map(m => m.text);
  const contextSummary = `${emotion} | ${userMsgs[0] || ''} → ${suggestion}`;
  const { data: inserted, error: insertErr } = await veilrumDb
    .from('dive_sessions')
    .insert({
      user_id: userId,
      mode: 'vent',
      emotion,
      messages,
      context_summary: contextSummary,
      held_keywords: userMsgs.slice(0, 10),
      suggestion,
      turn_count: turnCount,
      session_completed: turnCount >= 4,
      emotional_stability: 50,
      ended_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (insertErr) {
    console.error('[saveVentSessionSummary] direct insert also failed:', insertErr);
    return null;
  }

  // user_profiles.held_last_emotion 업데이트
  await veilrumDb
    .from('user_profiles')
    .update({ held_last_emotion: emotion })
    .eq('user_id', userId);

  return inserted?.id ?? null;
}

// ─────────────────────────────────────────────
// VENT: 미완료 세션 저장 (뒤로가기/탭전환 등)
// 대화가 1턴 이상 진행됐으나 4턴 미만에서 종료된 경우
// ─────────────────────────────────────────────
export async function saveVentPartialSession(
  userId: string,
  emotion: string,
  messages: { role: string; text: string }[],
  turnCount: number,
): Promise<string | null> {
  if (turnCount < 1) return null; // 대화가 없었으면 저장하지 않음

  const userMsgs = messages.filter(m => m.role === 'user').map(m => m.text);
  const contextSummary = `${emotion} | 미완료(${turnCount}턴) | ${userMsgs[0] || ''}`;

  const { data, error } = await veilrumDb
    .from('dive_sessions')
    .insert({
      user_id: userId,
      mode: 'vent',
      emotion,
      messages,
      context_summary: contextSummary,
      held_keywords: userMsgs.slice(0, 10),
      turn_count: turnCount,
      session_completed: false,
      emotional_stability: 40,
      ended_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('[saveVentPartialSession]', error);
    return null;
  }
  return data?.id ?? null;
}

// ─────────────────────────────────────────────
// SET: 키워드 저장 시 저장
// ─────────────────────────────────────────────
export async function saveSetSignal(
  userId: string,
  signal: {
    keyword: string;
    dayNumber: number;
    definition: string;
  },
) {
  const { keyword, dayNumber, definition } = signal;

  await veilrumDb.rpc('append_set_signal', {
    p_user_id:    userId,
    p_keyword:    keyword,
    p_day_number: dayNumber,
    p_definition: definition,
  });
}
