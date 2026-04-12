// 파트너 연결 훅 — 초대코드 발급/수락 + 연결 조회
// 실제 유저 간 초대코드 기반 연결 + 가상 유저 시뮬레이션 동일 구조 사용
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface PartnerConnection {
  connectionId: string;
  partnerId: string;
  partnerType: 'real' | 'virtual';
  connectedAt: string;
}

export interface PartnerProfile {
  mskCode: string | null;
  primaryMask: string | null;
  axisScores: Record<string, number> | null;
  nickname?: string;
}

// ─────────────────────────────────────────────
// 내 파트너 연결 조회
// ─────────────────────────────────────────────
export function usePartnerConnection() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['partner-connection', user?.id],
    queryFn: async (): Promise<PartnerConnection | null> => {
      if (!user) return null;
      const { data, error } = await veilorDb
        .from('partner_connections')
        .select('id, user_a_id, user_b_id, user_b_type, user_a_type, connected_at')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .eq('status', 'active')
        .order('connected_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      const partnerId = data.user_a_id === user.id ? data.user_b_id : data.user_a_id;
      const partnerType = data.user_a_id === user.id ? data.user_b_type : data.user_a_type;

      return {
        connectionId: data.id,
        partnerId,
        partnerType: partnerType as 'real' | 'virtual',
        connectedAt: data.connected_at,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

// ─────────────────────────────────────────────
// 파트너 프로필 조회 (연결된 후)
// ─────────────────────────────────────────────
export function usePartnerProfile(partnerId: string | null | undefined) {
  return useQuery({
    queryKey: ['partner-profile', partnerId],
    queryFn: async (): Promise<PartnerProfile | null> => {
      if (!partnerId) return null;
      const { data } = await veilorDb
        .from('user_profiles')
        .select('msk_code, primary_mask, axis_scores, nickname')
        .eq('user_id', partnerId)
        .maybeSingle();

      if (!data) return null;
      return {
        mskCode: data.msk_code as string | null,
        primaryMask: data.primary_mask as string | null,
        axisScores: data.axis_scores as Record<string, number> | null,
        nickname: data.nickname as string | undefined,
      };
    },
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 10,
  });
}

// ─────────────────────────────────────────────
// 초대코드 발급
// ─────────────────────────────────────────────
export function useCreateInvite() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<{ inviteCode: string; expiresAt: string }> => {
      if (!user) throw new Error('로그인이 필요합니다.');

      // 기존 pending 초대가 있으면 재사용
      const { data: existing } = await veilorDb
        .from('partner_invites')
        .select('invite_code, expires_at')
        .eq('inviter_id', user.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        return { inviteCode: existing.invite_code, expiresAt: existing.expires_at };
      }

      // 신규 발급
      const { data, error } = await veilorDb
        .from('partner_invites')
        .insert({ inviter_id: user.id, inviter_type: 'real' })
        .select('invite_code, expires_at')
        .single();

      if (error || !data) throw new Error('초대코드 발급에 실패했습니다.');
      return { inviteCode: data.invite_code, expiresAt: data.expires_at };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-connection', user?.id] });
    },
  });
}

// ─────────────────────────────────────────────
// 초대코드 수락
// ─────────────────────────────────────────────
export function useAcceptInvite() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteCode: string): Promise<void> => {
      if (!user) throw new Error('로그인이 필요합니다.');

      // 초대 조회
      const { data: invite, error: fetchErr } = await veilorDb
        .from('partner_invites')
        .select('id, inviter_id, status, expires_at')
        .eq('invite_code', inviteCode.trim().toUpperCase())
        .maybeSingle();

      if (fetchErr || !invite) throw new Error('유효하지 않은 초대코드입니다.');
      if (invite.status !== 'pending') throw new Error('이미 사용된 초대코드입니다.');
      if (new Date(invite.expires_at) < new Date()) throw new Error('만료된 초대코드입니다.');
      if (invite.inviter_id === user.id) throw new Error('본인의 초대코드는 사용할 수 없습니다.');

      // 초대 수락 업데이트
      const { error: updateErr } = await veilorDb
        .from('partner_invites')
        .update({ status: 'accepted', invitee_id: user.id, accepted_at: new Date().toISOString() })
        .eq('id', invite.id);

      if (updateErr) throw new Error('초대 수락 중 오류가 발생했습니다.');

      // 연결 생성
      const { error: connErr } = await veilorDb
        .from('partner_connections')
        .insert({
          user_a_id: invite.inviter_id,
          user_b_id: user.id,
          user_a_type: 'real',
          user_b_type: 'real',
          invite_id: invite.id,
          status: 'active',
        });

      if (connErr) throw new Error('파트너 연결 중 오류가 발생했습니다.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-connection', user?.id] });
    },
  });
}

// ─────────────────────────────────────────────
// 파트너 연결 해제
// ─────────────────────────────────────────────
export function useDisconnectPartner() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connectionId: string): Promise<void> => {
      const { error } = await veilorDb
        .from('partner_connections')
        .update({ status: 'disconnected', disconnected_at: new Date().toISOString() })
        .eq('id', connectionId);

      if (error) throw new Error('연결 해제 중 오류가 발생했습니다.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-connection', user?.id] });
    },
  });
}

// ─────────────────────────────────────────────
// 초대코드 입력 UI 상태 관리
// ─────────────────────────────────────────────
export function useInviteCodeInput() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const acceptInvite = useAcceptInvite();

  const handleSubmit = async () => {
    setError(null);
    if (code.trim().length < 6) {
      setError('초대코드를 입력해주세요.');
      return;
    }
    try {
      await acceptInvite.mutateAsync(code);
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
    }
  };

  return {
    code,
    setCode: (v: string) => setCode(v.toUpperCase().slice(0, 8)),
    error,
    handleSubmit,
    isPending: acceptInvite.isPending,
    isSuccess: acceptInvite.isSuccess,
  };
}
