import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';

export type PivotType = 'fatigue' | 'transition' | 'growth';

interface UseSocialPivotDetectionResult {
  shouldNudge: boolean;
  pivotType: PivotType | null;
  recordPivot: (type: PivotType, note: string) => Promise<void>;
}

export function useSocialPivotDetection(userId: string | undefined): UseSocialPivotDetectionResult {
  const since28d = new Date(Date.now() - 28 * 86400 * 1000).toISOString();
  const since7d = new Date(Date.now() - 7 * 86400 * 1000).toISOString();

  const { data: dormantCount = 0 } = useQuery<number>({
    queryKey: ['social-pivot-dormant', userId],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('social_interests')
        .select('id')
        .eq('user_id', userId!)
        .eq('status', 'dormant')
        .eq('level', 1)
        .gte('updated_at', since28d);
      return (data ?? []).length;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: recentPivot } = useQuery({
    queryKey: ['social-pivot-recent', userId],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('social_pivots')
        .select('id')
        .eq('user_id', userId!)
        .gte('detected_at', since7d)
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const hasDormant = dormantCount >= 2;
  const noRecentPivot = recentPivot === null;
  const shouldNudge = hasDormant && noRecentPivot;

  let pivotType: PivotType | null = null;
  if (hasDormant) {
    pivotType = dormantCount >= 4 ? 'fatigue' : 'transition';
  }

  async function recordPivot(type: PivotType, note: string) {
    if (!userId) return;
    await veilorDb.from('social_pivots').insert({
      user_id: userId,
      pivot_type: type,
      note: note || null,
      detected_at: new Date().toISOString(),
    });
  }

  return { shouldNudge, pivotType, recordPivot };
}
