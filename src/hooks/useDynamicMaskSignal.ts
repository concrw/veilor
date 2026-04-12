/**
 * Dynamic Mask Signal — 대화 중 감정/키워드 누적 기반 가면 재보정 신호
 *
 * 사용법: 대화 턴마다 호출. 특정 임계값 이상 신호가 누적되면
 * active_pattern을 업데이트하고 UI 알림 여부를 반환한다.
 *
 * 실제 primary_mask 변경은 하지 않는다 (V-File 재진단 필요).
 * 대신 active_pattern (현재 대화에서 활성화된 패턴)만 업데이트한다.
 */

import { useCallback, useRef } from 'react';
import { veilorDb } from '@/integrations/supabase/client';

// 감정-가면 매핑: 특정 감정이 반복될 때 활성화 가능성이 높은 가면
const EMOTION_MASK_SIGNAL: Record<string, string[]> = {
  '불안해':    ['AVD', 'EMP', 'DEP'],
  '화가 나':   ['PWR', 'SCP', 'SAV'],
  '외로워':    ['NRC', 'DEP', 'GVR'],
  '슬퍼':      ['SAV', 'DEP', 'EMP'],
  '무기력':    ['DEP', 'SAV', 'NRC'],
  '답답':      ['PWR', 'SCP', 'AVD'],
  '공허':      ['NRC', 'AVD', 'PSP'],
  '분노':      ['PWR', 'SCP', 'DEP'],
  '불안':      ['AVD', 'EMP', 'DEP'],
  '슬픔':      ['SAV', 'DEP', 'EMP'],
};

interface SignalState {
  maskCounts: Record<string, number>;
  turnCount: number;
}

export function useDynamicMaskSignal(userId: string | undefined, currentMask: string | null) {
  const signalRef = useRef<SignalState>({ maskCounts: {}, turnCount: 0 });

  const recordSignal = useCallback(
    async (emotion: string, text: string): Promise<{ shouldAlert: boolean; suggestedMask: string | null }> => {
      if (!userId) return { shouldAlert: false, suggestedMask: null };

      const state = signalRef.current;
      state.turnCount += 1;

      // 감정 기반 신호 누적
      const signals = EMOTION_MASK_SIGNAL[emotion] ?? [];
      for (const msk of signals) {
        state.maskCounts[msk] = (state.maskCounts[msk] ?? 0) + 1;
      }

      // 텍스트 키워드 기반 보정 (간단한 휴리스틱)
      if (text.includes('통제') || text.includes('결정')) state.maskCounts['PWR'] = (state.maskCounts['PWR'] ?? 0) + 0.5;
      if (text.includes('버려') || text.includes('혼자')) state.maskCounts['DEP'] = (state.maskCounts['DEP'] ?? 0) + 0.5;
      if (text.includes('참아') || text.includes('희생')) state.maskCounts['SAV'] = (state.maskCounts['SAV'] ?? 0) + 0.5;
      if (text.includes('도망') || text.includes('거리')) state.maskCounts['AVD'] = (state.maskCounts['AVD'] ?? 0) + 0.5;

      // 5턴 이후 + 누적 신호가 임계값(3) 이상인 가면 탐지
      if (state.turnCount < 5) return { shouldAlert: false, suggestedMask: null };

      const entries = Object.entries(state.maskCounts).sort((a, b) => b[1] - a[1]);
      if (entries.length === 0) return { shouldAlert: false, suggestedMask: null };

      const [topMsk, topCount] = entries[0];
      if (topCount < 3) return { shouldAlert: false, suggestedMask: null };

      // 현재 가면과 다를 때만 active_pattern 업데이트
      if (topMsk !== currentMask) {
        await veilorDb
          .from('user_profiles')
          .update({ active_pattern: topMsk, last_snapshot_at: new Date().toISOString() })
          .eq('user_id', userId)
          .then(() => {})
          .catch(() => {});

        // 신호 누적 리셋 (다음 감지 사이클로)
        state.maskCounts = {};
        state.turnCount = 0;

        return { shouldAlert: true, suggestedMask: topMsk };
      }

      return { shouldAlert: false, suggestedMask: null };
    },
    [userId, currentMask],
  );

  return { recordSignal };
}
