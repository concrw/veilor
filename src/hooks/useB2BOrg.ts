import { useState } from 'react';
import { veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type {
  B2BOrg,
  B2BOrgMember,
  B2BOrgAdmin,
  B2BOrgEvent,
  B2BOrgAggregate,
  B2BOrgOnboardingInput,
  B2BMemberInviteInput,
  B2BCheckinInput,
  B2BCheckinSession,
} from '@/integrations/supabase/veilor-types';

// ─────────────────────────────────────────────
// 고객사 생성 (어드민 온보딩 1단계)
// ─────────────────────────────────────────────
export function useCreateOrg() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrg = async (input: B2BOrgOnboardingInput): Promise<B2BOrg | null> => {
    if (!user) { setError('로그인이 필요합니다.'); return null; }
    setLoading(true);
    setError(null);

    try {
      // 1. 고객사 생성
      const { data: org, error: orgErr } = await veilorDb
        .from('b2b_orgs')
        .insert({
          name: input.name,
          org_type: input.org_type,
          plan: input.plan,
          contract_start: input.contract_start,
          status: 'active',
        })
        .select()
        .single();

      if (orgErr) throw new Error(orgErr.message);

      // 2. 생성자를 owner 어드민으로 등록
      const { error: adminErr } = await veilorDb
        .from('b2b_org_admins')
        .insert({
          org_id: org.id,
          user_id: user.id,
          role: 'owner',
        });

      if (adminErr) throw new Error(adminErr.message);

      return org as B2BOrg;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '고객사 생성 중 오류가 발생했습니다.';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createOrg, loading, error };
}

// ─────────────────────────────────────────────
// 내 소속 고객사 조회
// ─────────────────────────────────────────────
export function useMyOrg() {
  const { user } = useAuth();
  const [org, setOrg] = useState<B2BOrg | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyOrg = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // 어드민으로 소속된 고객사 조회
      const { data, error: err } = await veilorDb
        .from('b2b_org_admins')
        .select('org_id, b2b_orgs(*)')
        .eq('user_id', user.id)
        .eq('b2b_orgs.status', 'active')
        .limit(1)
        .single();

      if (err && err.code !== 'PGRST116') throw new Error(err.message);
      if (data?.b2b_orgs) setOrg(data.b2b_orgs as unknown as B2BOrg);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '고객사 정보를 불러오지 못했습니다.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return { org, fetchMyOrg, loading, error };
}

// ─────────────────────────────────────────────
// 멤버 초대 (이메일 기반 — Supabase invite)
// ─────────────────────────────────────────────
export function useInviteMembers(orgId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ email: string; status: 'ok' | 'error'; msg?: string }[]>([]);

  const inviteMembers = async (members: B2BMemberInviteInput[]) => {
    setLoading(true);
    setError(null);
    setResults([]);

    const out: typeof results = [];

    for (const m of members) {
      try {
        // Supabase auth.admin.inviteUserByEmail은 서버사이드 전용.
        // 클라이언트에서는 초대 레코드를 pending 상태로 DB에 저장하고
        // Edge Function이 이메일 발송을 처리한다.
        const { error: invErr } = await veilorDb
          .from('b2b_org_members')
          .upsert({
            org_id: orgId,
            // user_id는 초대 수락 후 채워짐 — 임시로 placeholder uuid 사용
            // 실제로는 초대 토큰 테이블로 분리하거나 Edge Function 처리
            member_type: m.member_type,
            birth_year: m.birth_year ?? null,
            status: 'inactive',
            meta: { invited_email: m.email, invite_pending: true },
          });

        if (invErr) throw new Error(invErr.message);
        out.push({ email: m.email, status: 'ok' });
      } catch (e) {
        const msg = e instanceof Error ? e.message : '초대 중 오류';
        out.push({ email: m.email, status: 'error', msg });
      }
    }

    setResults(out);
    setLoading(false);
    return out;
  };

  return { inviteMembers, loading, error, results };
}

// ─────────────────────────────────────────────
// 멤버 목록 조회 (어드민용)
// ─────────────────────────────────────────────
export function useOrgMembers(orgId: string) {
  const [members, setMembers] = useState<B2BOrgMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await veilorDb
        .from('b2b_org_members')
        .select('*')
        .eq('org_id', orgId)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (err) throw new Error(err.message);
      setMembers((data ?? []) as B2BOrgMember[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : '멤버 목록 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  return { members, fetchMembers, loading, error };
}

// ─────────────────────────────────────────────
// 4C 체크인 제출
// ─────────────────────────────────────────────
export function useSubmitCheckin() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitCheckin = async (input: B2BCheckinInput): Promise<B2BCheckinSession | null> => {
    if (!user) { setError('로그인이 필요합니다.'); return null; }
    setLoading(true);
    setError(null);

    try {
      // 1. 체크인 저장 (risk_score는 DB 트리거 또는 Edge Function이 계산)
      const { data, error: err } = await veilorDb
        .from('b2b_checkin_sessions')
        .insert({
          member_id: user.id,
          org_id: input.org_id,
          org_event_id: input.org_event_id ?? null,
          trigger_type: input.trigger_type,
          c_control: input.c_control,
          c_commitment: input.c_commitment,
          c_challenge: input.c_challenge,
          c_confidence: input.c_confidence,
          free_text: input.free_text ?? null,
          risk_score: 0,       // Edge Function이 덮어씀
          risk_level: 'normal', // Edge Function이 덮어씀
        })
        .select()
        .single();

      if (err) throw new Error(err.message);

      // 2. 위기 감지 Edge Function 호출 (비동기 — UI 블록 안함)
      veilorDb.functions
        .invoke('calc-risk-score', { body: { checkin_id: data.id } })
        .catch(() => {
          // 알림 실패해도 체크인 자체는 저장됨
        });

      return data as B2BCheckinSession;
    } catch (e) {
      setError(e instanceof Error ? e.message : '체크인 저장 중 오류');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { submitCheckin, loading, error };
}

// ─────────────────────────────────────────────
// 주간 조직 집계 조회 (어드민 대시보드용)
// ─────────────────────────────────────────────
export function useOrgAggregate(orgId: string, weeks = 4) {
  const [aggregates, setAggregates] = useState<B2BOrgAggregate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAggregate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await veilorDb
        .from('b2b_org_aggregate')
        .select('*')
        .eq('org_id', orgId)
        .order('week_start', { ascending: false })
        .limit(weeks);

      if (err) throw new Error(err.message);
      setAggregates((data ?? []) as B2BOrgAggregate[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : '집계 데이터 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  return { aggregates, fetchAggregate, loading, error };
}

// ─────────────────────────────────────────────
// 이벤트 캘린더 관리
// ─────────────────────────────────────────────
export function useOrgEvents(orgId: string) {
  const [events, setEvents] = useState<B2BOrgEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await veilorDb
        .from('b2b_org_events')
        .select('*')
        .eq('org_id', orgId)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      if (err) throw new Error(err.message);
      setEvents((data ?? []) as B2BOrgEvent[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : '이벤트 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (event: Omit<B2BOrgEvent, 'id' | 'created_at'>) => {
    const { data, error: err } = await veilorDb
      .from('b2b_org_events')
      .insert(event)
      .select()
      .single();
    if (err) throw new Error(err.message);
    await fetchEvents();
    return data as B2BOrgEvent;
  };

  return { events, fetchEvents, addEvent, loading, error };
}
