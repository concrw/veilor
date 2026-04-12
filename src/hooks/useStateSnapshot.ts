/**
 * State Snapshot — 대화 턴마다 user_profiles에 현재 상태를 영구화
 * current_mode, risk_level, active_pattern, session_phase
 */
import { useCallback } from 'react';
import { veilorDb } from '@/integrations/supabase/client';

export interface StateSnapshot {
  current_mode?: 'held' | 'dig' | 'get' | 'set';
  risk_level?: 'critical' | 'high' | 'medium' | 'none';
  active_pattern?: string | null;
  session_phase?: 'explore' | 'deepen' | 'resolve';
}

export function useStateSnapshot(userId: string | undefined) {
  const saveSnapshot = useCallback(
    async (snapshot: StateSnapshot) => {
      if (!userId) return;
      await veilorDb
        .from('user_profiles')
        .update({
          ...snapshot,
          last_snapshot_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    },
    [userId],
  );

  return { saveSnapshot };
}
