import { useState, useEffect, useCallback } from 'react';
import { veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { ZONES, TOTAL_ZONES, SEED_STAGES } from '@/data/mePageData';

export function calcPrecision(
  zoneState: Record<string, boolean>,
  stats: { sessionCount: number; signalCount: number; patternAreaCount: number } | null | undefined,
): number {
  const zoneOn = Object.values(zoneState).filter(Boolean).length;
  const zonePct = zoneOn / TOTAL_ZONES;
  const sessionScore = Math.min((stats?.sessionCount ?? 0) / 20, 1);
  const signalScore = Math.min((stats?.signalCount ?? 0) / 50, 1);
  const patternScore = Math.min((stats?.patternAreaCount ?? 0) / 5, 1);
  return Math.min(Math.round(zonePct * 40 + sessionScore * 25 + signalScore * 20 + patternScore * 15), 100);
}

export function getSeedTitle(pct: number): string {
  if (pct < 40) return '씨앗을 심었어요';
  if (pct < 65) return '패턴이 보이기 시작했어요';
  if (pct < 85) return '뿌리를 내리는 중';
  return '꽃이 피어나고 있어요';
}

export function getStageStatus(pct: number, i: number, stages: { threshold: number }[]): 'done' | 'active' | 'none' {
  const next = stages[i + 1]?.threshold ?? 101;
  if (pct >= next) return 'done';
  if (pct >= stages[i].threshold) return 'active';
  return 'none';
}

export function useMePageState(statsData: { sessionCount: number; signalCount: number; patternAreaCount: number } | null | undefined) {
  const { user } = useAuth();

  const [zoneState, setZoneState] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    ZONES.forEach(g => g.items.forEach(item => { init[item.id] = item.defaultOn; }));
    return init;
  });

  useEffect(() => {
    if (!user) return;
    veilorDb
      .from('persona_zones')
      .select('sub_zone, is_enabled')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const loaded: Record<string, boolean> = {};
          (data as { sub_zone: string; is_enabled: boolean }[]).forEach(row => {
            loaded[row.sub_zone] = row.is_enabled;
          });
          setZoneState(prev => ({ ...prev, ...loaded }));
        }
      });
  }, [user]);

  const toggleZone = useCallback(async (id: string) => {
    if (!user) return;
    const newVal = !zoneState[id];
    setZoneState(prev => ({ ...prev, [id]: newVal }));
    await veilorDb.from('persona_zones').upsert({
      user_id: user.id,
      layer: ZONES.find(g => g.items.some(i => i.id === id))?.layer ?? 'social',
      sub_zone: id,
      is_enabled: newVal,
      enabled_at: new Date().toISOString(),
    }, { onConflict: 'user_id,sub_zone' });
  }, [user, zoneState]);

  const pct = calcPrecision(zoneState, statsData);
  const closedCount = Object.values(zoneState).filter(v => !v).length;
  const seedTitle = getSeedTitle(pct);
  const stageStatus = (i: number) => getStageStatus(pct, i, SEED_STAGES);

  return { zoneState, toggleZone, pct, closedCount, seedTitle, stageStatus };
}
