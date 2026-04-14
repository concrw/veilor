// 코치 전용 훅 모음
// - 코치 목록/프로필 조회 (공개)
// - 코치 포스트 CRUD
// - 코치 포털: 담당 멤버, 세션 관리

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type {
  B2BCoach, B2BCoachPost, B2BCoachingSession,
  B2BCoachMemberSummary, B2BSessionStatus,
} from '@/integrations/supabase/veilor-types';

// ──────────────────────────────────────────────────────────────────────────────
// 공개 조회 (CoachList, CoachProfile)
// ──────────────────────────────────────────────────────────────────────────────

/** 전체 활성 코치 목록 */
export function useCoachList() {
  return useQuery<B2BCoach[]>({
    queryKey: ['b2b_coaches_public'],
    queryFn: async () => {
      const { data, error } = await veilorDb
        .from('b2b_coaches')
        .select('*')
        .eq('status', 'active')
        .order('avg_rating', { ascending: false });
      if (error) throw error;
      return (data ?? []) as B2BCoach[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/** 단일 코치 프로필 */
export function useCoachProfile(coachId: string) {
  return useQuery<B2BCoach | null>({
    queryKey: ['b2b_coach', coachId],
    queryFn: async () => {
      const { data, error } = await veilorDb
        .from('b2b_coaches')
        .select('*')
        .eq('id', coachId)
        .single();
      if (error) throw error;
      return data as B2BCoach;
    },
    enabled: !!coachId,
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// 코치 포스트 (공개 피드)
// ──────────────────────────────────────────────────────────────────────────────

/** 특정 코치의 포스트 목록 */
export function useCoachPosts(coachId: string) {
  return useQuery<B2BCoachPost[]>({
    queryKey: ['coach_posts', coachId],
    queryFn: async () => {
      const { data, error } = await veilorDb
        .from('coach_posts')
        .select('*')
        .eq('coach_id', coachId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as B2BCoachPost[];
    },
    enabled: !!coachId,
  });
}

/** 포스트 작성 */
export function useCreateCoachPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { coach_id: string; user_id: string; title?: string; body: string; tags?: string[] }) => {
      const { data, error } = await veilorDb
        .from('coach_posts')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as B2BCoachPost;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['coach_posts', data.coach_id] });
    },
  });
}

/** 포스트 수정 */
export function useUpdateCoachPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, coach_id, ...fields }: Partial<B2BCoachPost> & { id: string; coach_id: string }) => {
      const { data, error } = await veilorDb
        .from('coach_posts')
        .update(fields)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { ...data, coach_id } as B2BCoachPost;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['coach_posts', data.coach_id] });
    },
  });
}

/** 포스트 삭제 */
export function useDeleteCoachPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, coach_id }: { id: string; coach_id: string }) => {
      const { error } = await veilorDb
        .from('coach_posts')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { id, coach_id };
    },
    onSuccess: ({ coach_id }) => {
      qc.invalidateQueries({ queryKey: ['coach_posts', coach_id] });
    },
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// 코치 포털 전용 (본인 인증 필요)
// ──────────────────────────────────────────────────────────────────────────────

/** 로그인한 코치의 프로필 조회 (user_id 기준) */
export function useMyCoachProfile() {
  const { user } = useAuth();
  return useQuery<B2BCoach | null>({
    queryKey: ['my_coach_profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await veilorDb
        .from('b2b_coaches')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data as B2BCoach | null;
    },
    enabled: !!user,
  });
}

/** 코치 담당 세션 목록 */
export function useMyCoachSessions(coachId: string) {
  return useQuery<B2BCoachingSession[]>({
    queryKey: ['coach_sessions', coachId],
    queryFn: async () => {
      const { data, error } = await veilorDb
        .from('b2b_coaching_sessions')
        .select('*')
        .eq('coach_id', coachId)
        .order('scheduled_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as B2BCoachingSession[];
    },
    enabled: !!coachId,
  });
}

/** 담당 멤버 요약 (최근 체크인 포함) */
export function useMyCoachMembers(coachId: string) {
  return useQuery<B2BCoachMemberSummary[]>({
    queryKey: ['coach_members', coachId],
    queryFn: async () => {
      // 코치가 세션을 가진 멤버 목록
      const { data: sessions, error } = await veilorDb
        .from('b2b_coaching_sessions')
        .select('member_id, org_id, status')
        .eq('coach_id', coachId);
      if (error) throw error;

      // 고유 멤버 추출
      const memberOrgPairs = [
        ...new Map(
          (sessions ?? []).map((s) => [`${s.member_id}::${s.org_id}`, s])
        ).values(),
      ];

      const results: B2BCoachMemberSummary[] = await Promise.all(
        memberOrgPairs.map(async (s) => {
          const [memberRes, checkinRes, countRes, orgRes] = await Promise.all([
            veilorDb
              .from('b2b_org_members')
              .select('member_type')
              .eq('user_id', s.member_id)
              .eq('org_id', s.org_id)
              .single(),
            veilorDb
              .from('b2b_checkin_sessions')
              .select('created_at, risk_level, c_avg')
              .eq('member_id', s.member_id)
              .eq('org_id', s.org_id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single(),
            veilorDb
              .from('b2b_coaching_sessions')
              .select('id', { count: 'exact', head: true })
              .eq('member_id', s.member_id)
              .eq('coach_id', coachId),
            veilorDb
              .from('b2b_orgs')
              .select('name')
              .eq('id', s.org_id)
              .single(),
          ]);

          return {
            member_id: s.member_id,
            org_id: s.org_id,
            org_name: orgRes.data?.name,
            member_type: memberRes.data?.member_type ?? 'member',
            latest_checkin_at: checkinRes.data?.created_at ?? null,
            latest_risk_level: checkinRes.data?.risk_level ?? null,
            latest_c_avg: checkinRes.data?.c_avg ?? null,
            sessions_count: countRes.count ?? 0,
          } as B2BCoachMemberSummary;
        })
      );
      return results;
    },
    enabled: !!coachId,
  });
}

/** 세션 상태 업데이트 (완료/취소) */
export function useUpdateSessionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      coachId,
      status,
      coach_notes,
      followup_needed,
    }: {
      sessionId: string;
      coachId: string;
      status: B2BSessionStatus;
      coach_notes?: string;
      followup_needed?: boolean;
    }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'completed') {
        updates.ended_at = new Date().toISOString();
        if (coach_notes !== undefined) updates.coach_notes = coach_notes;
        if (followup_needed !== undefined) updates.followup_needed = followup_needed;
      }
      const { error } = await veilorDb
        .from('b2b_coaching_sessions')
        .update(updates)
        .eq('id', sessionId);
      if (error) throw error;
      return { sessionId, coachId };
    },
    onSuccess: ({ coachId }) => {
      qc.invalidateQueries({ queryKey: ['coach_sessions', coachId] });
      qc.invalidateQueries({ queryKey: ['coach_members', coachId] });
    },
  });
}
