import type { WorkTask } from '@/integrations/supabase/veilor-types';

export type MasteryLevel = 'beginner' | 'intermediate' | 'skilled' | 'expert' | 'master';

/** 시간 예측 정확도 — ±20% 범위면 1.0(정확), 벗어날수록 0에 수렴 */
export function calcAccuracy(estimated: number, actual: number): number {
  if (estimated <= 0 || actual <= 0) return 0;
  const ratio = actual / estimated;
  // 0.8 ~ 1.2 범위 = 정확
  if (ratio >= 0.8 && ratio <= 1.2) return 1;
  // 범위 밖: 오차 비율로 선형 감소 (최소 0)
  const deviation = ratio > 1.2 ? ratio - 1.2 : 0.8 - ratio;
  return Math.max(0, 1 - deviation * 2);
}

/** 메타인지 레벨 산출 */
export function calcMasteryLevel(
  completionRate: number,
  accuracy: number,
  streak: number,
): MasteryLevel {
  const score = completionRate * 0.4 + accuracy * 0.4 + Math.min(streak / 14, 1) * 0.2;
  if (score >= 0.9) return 'master';
  if (score >= 0.75) return 'expert';
  if (score >= 0.55) return 'skilled';
  if (score >= 0.35) return 'intermediate';
  return 'beginner';
}

/** 완수력 — 중단(pause)이 있었지만 결국 완료한 태스크 비율 */
export function calcCompletionPower(tasks: WorkTask[]): number {
  const interrupted = tasks.filter(t => t.pause_count > 0);
  if (interrupted.length === 0) return 1;
  const completed = interrupted.filter(t => t.status === 'done');
  return completed.length / interrupted.length;
}

/** 멘탈 × 퍼포먼스 상관관계 */
export function calcMentalPerformanceCorrelation(tasks: WorkTask[]): {
  highEnergyCompletionRate: number;
  lowEnergyCompletionRate: number;
} {
  const done = tasks.filter(t => t.status === 'done' || t.status === 'rolled_over');
  const highEnergy = done.filter(t => (t.mental_snapshot?.energy ?? 0) >= 60);
  const lowEnergy  = done.filter(t => (t.mental_snapshot?.energy ?? 0) < 60  && (t.mental_snapshot?.energy ?? 0) > 0);

  const allHigh = tasks.filter(t => (t.mental_snapshot?.energy ?? 0) >= 60);
  const allLow  = tasks.filter(t => (t.mental_snapshot?.energy ?? 0) < 60 && (t.mental_snapshot?.energy ?? 0) > 0);

  return {
    highEnergyCompletionRate: allHigh.length ? highEnergy.filter(t => t.status === 'done').length / allHigh.length : 0,
    lowEnergyCompletionRate:  allLow.length  ? lowEnergy.filter(t => t.status === 'done').length  / allLow.length  : 0,
  };
}

/** 자정 기준 미완료 태스크 목록 (rolled_over 대상) */
export function getRolloverTasks(tasks: WorkTask[]): WorkTask[] {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return tasks.filter(t =>
    (t.status === 'todo' || t.status === 'in_progress') &&
    new Date(t.created_at) < todayStart,
  );
}
