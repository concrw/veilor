export interface ClearCheckin {
  mood_score: number;
  activities: string[];
  checked_at: string;
}

export interface WeeklySession {
  created_at: string | null;
}

export const ACTIVITY_KEYS = ['relationship', 'work', 'exercise', 'alone', 'rest', 'study'] as const;
export type ActivityKey = typeof ACTIVITY_KEYS[number];

export const CHECKIN_DATE_KEY = 'veilor_clear_last_checkin';

export function hasClearCheckinToday(): boolean {
  try {
    return localStorage.getItem(CHECKIN_DATE_KEY) === new Date().toISOString().split('T')[0];
  } catch {
    return false;
  }
}

export function markClearCheckinToday(): void {
  try {
    localStorage.setItem(CHECKIN_DATE_KEY, new Date().toISOString().split('T')[0]);
  } catch {
    // silent
  }
}

export function calcHealthScore({
  weekCount,
  moodAvg,
  streakCount,
}: {
  weekCount: number;
  moodAvg: number;
  streakCount: number;
}): number {
  const freqScore = Math.min(weekCount / 7, 1) * 40;
  const moodScore = Math.min(moodAvg / 10, 1) * 40;
  const streakScore = Math.min(streakCount / 30, 1) * 20;
  return Math.round(freqScore + moodScore + streakScore);
}

export const SEXSELF_PROFILE_COLORS: Record<string, string> = {
  OPEN_EXPRESSIVE: '#10b981',
  RESPONSIVE: '#3b82f6',
  SUPPRESSED: '#f59e0b',
  DORMANT: '#6b7280',
  SHAME_BLOCKED: '#ef4444',
  SAFETY_SEEKING: '#8b5cf6',
  EXPLORING: '#06b6d4',
  BUILDING_AWARENESS: '#64748b',
  ANXIETY_FROZEN: '#6366f1',
};
