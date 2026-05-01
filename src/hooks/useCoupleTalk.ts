import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type {
  CoupleTalkCard,
  CoupleTalkSession,
  CoupleTalkAnswer,
  CoupleTalkCategory,
} from '@/integrations/supabase/veilor-types';

// ── 세션 조회 (partner_connections 자동 연결 포함) ───────────────────
export function useCoupleTalkSession() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['couple-talk-session', user?.id],
    queryFn: async (): Promise<CoupleTalkSession | null> => {
      if (!user) return null;

      // 1. 내가 참여한 세션 조회
      const { data: existing } = await veilorDb
        .from('couple_talk_sessions')
        .select('*')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) return existing as CoupleTalkSession;

      // 2. 세션이 없고 partner_connections에 활성 연결이 있으면 자동 세션 생성
      const { data: pc } = await veilorDb
        .from('partner_connections')
        .select('id, user_a_id, user_b_id')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .eq('status', 'active')
        .maybeSingle();

      if (!pc) return null;

      const partnerId = pc.user_a_id === user.id ? pc.user_b_id : pc.user_a_id;
      if (!partnerId) return null;

      // 파트너가 이미 만든 세션이 있는지 확인
      const { data: partnerSession } = await veilorDb
        .from('couple_talk_sessions')
        .select('*')
        .or(`user_a_id.eq.${partnerId},user_b_id.eq.${partnerId}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (partnerSession) {
        const s = partnerSession as CoupleTalkSession;
        // 파트너 세션의 user_b가 비어 있을 때만 join (RLS: user_b_id가 null이어야 update 가능)
        if (!s.user_b_id) {
          const { data: updated } = await veilorDb
            .from('couple_talk_sessions')
            .update({ user_b_id: user.id })
            .eq('id', s.id)
            .is('user_b_id', null)
            .select('*')
            .single();
          return updated as CoupleTalkSession | null;
        }
        return s;
      }

      // 내가 user_a로 세션 생성, 파트너를 user_b로
      const { data: created } = await veilorDb
        .from('couple_talk_sessions')
        .insert({ user_a_id: user.id, user_b_id: partnerId })
        .select('*')
        .single();
      return created as CoupleTalkSession | null;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

// ── 새 세션 생성 (초대코드 발급) ─────────────────────────────────────
export function useCreateCoupleTalkSession() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<CoupleTalkSession> => {
      const token = Math.random().toString(36).slice(2, 10).toUpperCase();
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await veilorDb
        .from('couple_talk_sessions')
        .insert({ user_a_id: user!.id, invite_token: token, invite_token_expires_at: expires })
        .select('*')
        .single();
      if (error || !data) throw new Error('세션 생성에 실패했습니다');
      return data as CoupleTalkSession;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['couple-talk-session', user?.id] }),
  });
}

// ── 초대코드로 세션 참여 ──────────────────────────────────────────────
export function useJoinCoupleTalkSession() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (token: string): Promise<void> => {
      const { data: session, error } = await veilorDb
        .from('couple_talk_sessions')
        .select('id, user_a_id, user_b_id, invite_token_expires_at')
        .eq('invite_token', token.trim().toUpperCase())
        .maybeSingle();

      if (error || !session) throw new Error('유효하지 않은 초대코드입니다');
      const s = session as CoupleTalkSession & { invite_token_expires_at?: string | null };
      if (s.user_b_id) throw new Error('이미 사용된 초대코드입니다');
      if (s.user_a_id === user!.id) throw new Error('본인의 초대코드는 사용할 수 없습니다');
      if (s.invite_token_expires_at && new Date(s.invite_token_expires_at) < new Date()) {
        throw new Error('만료된 초대코드입니다');
      }

      const { error: updateErr } = await veilorDb
        .from('couple_talk_sessions')
        .update({ user_b_id: user!.id, invite_token: null })
        .eq('id', s.id);
      if (updateErr) throw new Error('연결 중 오류가 발생했습니다');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['couple-talk-session', user?.id] }),
  });
}

// ── 카테고리별 카드 목록 ──────────────────────────────────────────────
export function useCoupleTalkCards(category: CoupleTalkCategory | null) {
  return useQuery({
    queryKey: ['couple-talk-cards', category],
    queryFn: async (): Promise<CoupleTalkCard[]> => {
      const { data } = await veilorDb
        .from('couple_talk_cards')
        .select('*')
        .eq('is_active', true)
        .eq('category', category!)
        .order('question_order');
      return (data ?? []) as CoupleTalkCard[];
    },
    enabled: !!category,
    staleTime: 1000 * 60 * 30,
  });
}

// ── 특정 카드의 두 사람 답변 조회 ─────────────────────────────────────
export function useCoupleTalkAnswers(
  sessionId: string | null | undefined,
  cardId: string | null | undefined,
) {
  return useQuery({
    queryKey: ['couple-talk-answers', sessionId, cardId],
    queryFn: async (): Promise<CoupleTalkAnswer[]> => {
      const { data } = await veilorDb
        .from('couple_talk_answers')
        .select('*')
        .eq('session_id', sessionId!)
        .eq('card_id', cardId!);
      return (data ?? []) as CoupleTalkAnswer[];
    },
    enabled: !!sessionId && !!cardId,
    staleTime: 1000 * 30,
  });
}

// ── 답변 저장 (upsert) ────────────────────────────────────────────────
export function useSaveCoupleTalkAnswer() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      cardId,
      answerText,
    }: {
      sessionId: string;
      cardId: string;
      answerText: string;
    }): Promise<void> => {
      const { error } = await veilorDb
        .from('couple_talk_answers')
        .upsert(
          { session_id: sessionId, card_id: cardId, user_id: user!.id, answer_text: answerText },
          { onConflict: 'session_id,card_id,user_id' },
        );
      if (error) throw new Error('답변 저장에 실패했습니다');
    },
    onSuccess: (_, { sessionId, cardId }) =>
      qc.invalidateQueries({ queryKey: ['couple-talk-answers', sessionId, cardId] }),
  });
}

// ── 섹스 덱 동의 ──────────────────────────────────────────────────────
export function useConsentSexDeck() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      isUserA,
    }: {
      sessionId: string;
      isUserA: boolean;
    }): Promise<void> => {
      const field = isUserA ? 'sex_deck_consent_a' : 'sex_deck_consent_b';
      const { error } = await veilorDb
        .from('couple_talk_sessions')
        .update({ [field]: true })
        .eq('id', sessionId);
      if (error) throw new Error('동의 저장에 실패했습니다');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['couple-talk-session', user?.id] }),
  });
}
