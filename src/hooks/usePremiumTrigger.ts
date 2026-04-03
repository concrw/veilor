// 프리미엄 전환 트리거 훅 — 5개 트리거 로직 중앙 관리
// T1: AI CODETALK 조언 횟수 초과
// T2: 멀티페르소나 분석 요청
// T3: Ikigai 설계 시도
// T4: 브랜드 정체성 설계 접근
// T5: 월간 리포트 상세 보기

import { useState, useCallback } from 'react';
import { useVeilrumSubscription } from '@/hooks/useVeilrumSubscription';
import type { TriggerType } from '@/components/premium/UpgradeModal';

// 무료 한도 상수 — 서버에서도 동일 값으로 검증해야 함
export const FREE_LIMITS = {
  AI_CODETALK_DAILY: 3,       // 하루 AI 조언 횟수
} as const;

export function usePremiumTrigger() {
  const { isPro, isLoading } = useVeilrumSubscription();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTrigger, setActiveTrigger] = useState<TriggerType>('codetalk_ai_limit');

  /**
   * 프리미엄 기능 접근 시도 — 무료 유저면 모달 표시, Pro면 true 반환
   * @returns true면 접근 허용, false면 모달 표시됨
   */
  const tryAccess = useCallback((trigger: TriggerType): boolean => {
    if (isLoading) return false;
    if (isPro) return true;

    setActiveTrigger(trigger);
    setModalOpen(true);
    return false;
  }, [isPro, isLoading]);

  /**
   * AI 횟수 제한 체크 — count가 한도 이상이면 모달 표시
   * @returns true면 접근 허용
   */
  const checkAiLimit = useCallback((currentCount: number): boolean => {
    if (isLoading) return false;
    if (isPro) return true;
    if (currentCount >= FREE_LIMITS.AI_CODETALK_DAILY) {
      setActiveTrigger('codetalk_ai_limit');
      setModalOpen(true);
      return false;
    }
    return true;
  }, [isPro, isLoading]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  return {
    isPro,
    isLoading,
    modalOpen,
    activeTrigger,
    tryAccess,
    checkAiLimit,
    closeModal,
  };
}
