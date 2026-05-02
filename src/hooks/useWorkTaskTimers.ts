import { useState, useEffect } from 'react';
import type { WorkTask } from './useWorkTasks';

/**
 * WorkTask 타이머 관리 훅
 * - 1초마다 실행 중인 태스크의 남은 시간 감소
 * - DB 업데이트 없이 로컬 상태만 관리
 */
export const useWorkTaskTimers = (tasks: WorkTask[]) => {
  const [localTimers, setLocalTimers] = useState<{ [taskId: string]: number }>({});

  useEffect(() => {
    if (tasks.length === 0) return;

    const interval = setInterval(() => {
      setLocalTimers((prev) => {
        const next = { ...prev };

        tasks.forEach((task) => {
          if (task.is_running) {
            const current = prev[task.id] ?? (task.time_remaining ?? 0);
            next[task.id] = current - 1;
          }
        });

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  const getDisplayTime = (task: WorkTask): number => {
    return localTimers[task.id] ?? (task.time_remaining ?? 0);
  };

  const resetTimer = (taskId: string) => {
    setLocalTimers((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  };

  const initializeTimer = (taskId: string, durationSeconds: number) => {
    setLocalTimers((prev) => ({
      ...prev,
      [taskId]: durationSeconds,
    }));
  };

  const resetAllTimers = () => {
    setLocalTimers({});
  };

  return {
    localTimers,
    getDisplayTime,
    resetTimer,
    initializeTimer,
    resetAllTimers,
  };
};
