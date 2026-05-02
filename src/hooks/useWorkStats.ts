import { useState, useEffect, useCallback } from 'react';
import { veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import {
  calcAccuracy,
  calcMasteryLevel,
  calcCompletionPower,
  calcMentalPerformanceCorrelation,
  type MasteryLevel,
} from '@/lib/tbqc';
import type { WorkTask } from '@/integrations/supabase/veilor-types';

const isDev = process.env.NODE_ENV === 'development';

function getWeekStart(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface WorkStatsResult {
  tasks: WorkTask[];
  doneTasks: WorkTask[];
  completionRate: number;
  avgAccuracy: number;
  completionPower: number;
  highEnergyRate: number;
  lowEnergyRate: number;
  masteryLevel: MasteryLevel;
  streak: number;
  loading: boolean;
}

export const useWorkStats = (): WorkStatsResult => {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWeekTasks = useCallback(async () => {
    if (authLoading || !user?.id) return;

    setLoading(true);
    try {
      const weekStart = getWeekStart();

      const { data, error } = await veilorDb
        .from('work_tasks' as never)
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', weekStart.toISOString());

      if (error) {
        if (isDev) console.error('useWorkStats 쿼리 에러:', error);
        return;
      }

      setTasks((data ?? []) as unknown as WorkTask[]);
    } catch (err) {
      if (isDev) console.error('useWorkStats 예외:', err);
    } finally {
      setLoading(false);
    }
  }, [authLoading, user?.id]);

  useEffect(() => {
    fetchWeekTasks();
  }, [fetchWeekTasks]);

  // 지표 계산
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const completionRate = tasks.length ? doneTasks.length / tasks.length : 0;

  const accuracyScores = doneTasks
    .filter((t) => t.estimated_minutes && t.actual_minutes)
    .map((t) => calcAccuracy(t.estimated_minutes!, t.actual_minutes!));
  const avgAccuracy = accuracyScores.length
    ? accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length
    : 0;

  const completionPower = calcCompletionPower(tasks);
  const { highEnergyCompletionRate, lowEnergyCompletionRate } =
    calcMentalPerformanceCorrelation(tasks);

  // streak 계산 — done 태스크 날짜 목록에서 오늘부터 역산
  const streak = (() => {
    const doneDateSet = new Set(
      doneTasks
        .filter((t) => t.completed_at)
        .map((t) => getLocalDateString(new Date(t.completed_at!))),
    );

    let count = 0;
    const cursor = new Date();

    while (true) {
      const dateStr = getLocalDateString(cursor);
      if (!doneDateSet.has(dateStr)) break;
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return count;
  })();

  const masteryLevel = calcMasteryLevel(completionRate, avgAccuracy, streak);

  return {
    tasks,
    doneTasks,
    completionRate,
    avgAccuracy,
    completionPower,
    highEnergyRate: highEnergyCompletionRate,
    lowEnergyRate: lowEnergyCompletionRate,
    masteryLevel,
    streak,
    loading,
  };
};
