// 하루 AI 사용 횟수 추적 훅 — DB 기반 (localStorage는 UX 캐시)
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { veilrumDb } from '@/integrations/supabase/client';

const STORAGE_KEY_PREFIX = 'veilrum_ai_usage_';

function getTodayKey(): string {
  const now = new Date();
  return `${STORAGE_KEY_PREFIX}${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getLocalCount(): number {
  try {
    return parseInt(localStorage.getItem(getTodayKey()) ?? '0', 10);
  } catch {
    return 0;
  }
}

function setLocalCount(n: number) {
  try {
    localStorage.setItem(getTodayKey(), String(n));
  } catch { /* localStorage 불가 환경 무시 */ }
}

export function useAiUsageCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(getLocalCount);

  // DB에서 오늘 사용량 조회 (실제 진실의 원천)
  const syncFromDb = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const { count: dbCount } = await veilrumDb
      .from('user_signals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00Z`)
      .in('signal_type', ['vent', 'dig']);
    const serverCount = dbCount ?? 0;
    setCount(serverCount);
    setLocalCount(serverCount);
    return serverCount;
  }, [user]);

  const increment = useCallback(async () => {
    const localNext = getLocalCount() + 1;
    setCount(localNext);
    setLocalCount(localNext);
    // 비동기로 DB 동기화 (fire-and-forget)
    syncFromDb().catch(() => {});
    return localNext;
  }, [syncFromDb]);

  return {
    count,
    increment,
    syncFromDb,
  };
}
