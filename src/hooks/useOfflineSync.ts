/**
 * useOfflineSync — dexie 오프라인 우선 동기화
 * 온라인 복구 시 미동기화 체크인을 Supabase에 배치 업로드
 */
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  getPendingCheckins,
  markCheckinSynced,
  type LocalCheckin,
} from '@/lib/localDb';
import { useAuth } from '@/context/AuthContext';

const SYNC_DEBOUNCE_MS = 2000;

export function useOfflineSync() {
  const { user } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const runSync = async () => {
      const pending: LocalCheckin[] = await getPendingCheckins(user.id);
      if (pending.length === 0) return;

      // Supabase veilor 스키마의 emotion_checkins 테이블로 배치 upsert
      const rows = pending.map(c => ({
        user_id:    c.userId,
        emotion:    c.emotion,
        score:      c.score,
        note:       c.note ?? null,
        created_at: new Date(c.createdAt).toISOString(),
      }));

      const { error } = await supabase
        .schema('veilor')
        .from('emotion_checkins')
        .upsert(rows, { onConflict: 'user_id,created_at' })
        .select('id');

      if (!error) {
        for (const c of pending) {
          if (c.id != null) await markCheckinSynced(c.id);
        }
        console.log(`[offline-sync] ${pending.length}개 체크인 동기화 완료`);
      } else {
        console.warn('[offline-sync] 동기화 오류:', error.message);
      }
    };

    // 온라인 복구 이벤트
    const handleOnline = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(runSync, SYNC_DEBOUNCE_MS);
    };

    // 초기 마운트 시 온라인이면 즉시 시도
    if (navigator.onLine) {
      timerRef.current = setTimeout(runSync, SYNC_DEBOUNCE_MS);
    }

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user?.id]);
}
