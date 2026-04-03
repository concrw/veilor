// 베일럼 구독 훅 — 서버사이드 check_user_access() RPC 기반
// 클라이언트에서 tier 비교 없이 DB에서 직접 검증
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { supabase, veilrumDb } from '@/integrations/supabase/client';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'pro' | 'elite';

// check_user_access가 지원하는 feature 목록
export type VeilrumFeature =
  | 'ai_insights'      // AI 인사이트 (premium+)
  | 'pattern_history'  // 패턴 히스토리 (premium+)
  | 'researcher_view'  // 연구자 대시보드 (researcher/admin)
  | 'export_data';     // 데이터 내보내기 (premium+)

interface AccessMap {
  [feature: string]: boolean;
}

export function useVeilrumSubscription() {
  const { user } = useAuth();

  // 역할/티어 조회
  const { data: role, isLoading: roleLoading } = useQuery<string>({
    queryKey: ['veilrum-role', user?.id],
    queryFn: async () => {
      const { data } = await veilrumDb
        .rpc('get_user_role', { p_user_id: user!.id });
      return (data as string) ?? 'basic';
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5분 캐시
  });

  // 주요 feature 접근 권한 일괄 조회
  const features: VeilrumFeature[] = ['ai_insights', 'pattern_history', 'researcher_view', 'export_data'];

  const { data: accessMap, isLoading: accessLoading } = useQuery<AccessMap>({
    queryKey: ['veilrum-access', user?.id],
    queryFn: async () => {
      const results = await Promise.all(
        features.map(async (f) => {
          const { data } = await veilrumDb
            .rpc('check_user_access', { p_user_id: user!.id, p_feature: f });
          return [f, !!data] as [string, boolean];
        })
      );
      return Object.fromEntries(results);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const currentRole = role ?? 'basic';
  const isPro       = currentRole === 'premium' || currentRole === 'pro' || currentRole === 'elite';
  const isResearcher = currentRole === 'researcher' || currentRole === 'admin';
  const isAdmin     = currentRole === 'admin';
  const isLoading   = roleLoading || accessLoading;

  function can(feature: VeilrumFeature): boolean {
    return accessMap?.[feature] ?? false;
  }

  return {
    role: currentRole,
    isPro,
    isResearcher,
    isAdmin,
    isLoading,
    can,
    // 하위 호환 — 기존 코드의 tier/isElite 참조 대응
    tier: currentRole as SubscriptionTier,
    isElite: currentRole === 'elite',
  };
}
