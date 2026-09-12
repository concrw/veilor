// 베일러 구독 훅 — 서버사이드 current_user_role() / current_user_access() RPC 기반
// 클라이언트에서 tier 비교 없이 DB에서 직접 검증
// No user_id argument from client (auth.uid() used server-side)
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'premium';

// current_user_access가 지원하는 feature 목록
export type VeilorFeature =
  | 'ai_insights'      // AI 인사이트 (premium+)
  | 'pattern_history'  // 패턴 히스토리 (premium+)
  | 'researcher_view'  // 연구자 대시보드 (researcher/admin)
  | 'export_data';     // 데이터 내보내기 (premium+)

interface AccessMap {
  [feature: string]: boolean;
}

export function useVeilorSubscription() {
  const { user } = useAuth();

  const { data: role, isLoading: roleLoading, error: roleError } = useQuery<string>({
    queryKey: ['veilor-role', user?.id],
    queryFn: async () => {
      const { data, error } = await veilorDb.rpc('current_user_role');
      if (error) throw error;
      return (data as string) ?? 'basic';
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const features: VeilorFeature[] = ['ai_insights', 'pattern_history', 'researcher_view', 'export_data'];

  const { data: accessMap, isLoading: accessLoading, error: accessError } = useQuery<AccessMap>({
    queryKey: ['veilor-access', user?.id],
    queryFn: async () => {
      const results = await Promise.all(
        features.map(async (f) => {
          const { data, error } = await veilorDb.rpc('current_user_access', { p_feature: f });
          if (error) throw error;
          return [f, !!data] as [string, boolean];
        })
      );
      return Object.fromEntries(results);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const currentRole = role ?? 'basic';
  const isPro       = currentRole === 'pro' || currentRole === 'premium';
  const isResearcher = currentRole === 'researcher' || currentRole === 'admin';
  const isAdmin     = currentRole === 'admin';
  const isLoading   = roleLoading || accessLoading;
  const isRoleResolved = !user || !roleLoading;
  const error = roleError || accessError;

  function can(feature: VeilorFeature): boolean {
    return accessMap?.[feature] ?? false;
  }

  return {
    role: currentRole,
    isPro,
    isResearcher,
    isAdmin,
    isLoading,
    isRoleResolved,
    error: error as Error | null,
    can,
    tier: currentRole as SubscriptionTier,
    isPremium: currentRole === 'premium',
  };
}
