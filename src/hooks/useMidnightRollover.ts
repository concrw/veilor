import { useEffect, useRef, useCallback } from 'react';
import { veilorDb } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const isDev = process.env.NODE_ENV === 'development';

const STORAGE_KEY = 'veilor_work_last_date';

interface UseMidnightRolloverProps {
  userId: string | undefined;
  onDateChange: () => void;
}

export const useMidnightRollover = ({ userId, onDateChange }: UseMidnightRolloverProps) => {
  const midnightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getStoredDate = () => {
    try {
      return localStorage.getItem(STORAGE_KEY) || new Date().toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const setStoredDate = (date: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, date);
    } catch {
      // 무시
    }
  };

  const lastDateRef = useRef<string>(getStoredDate());
  const userIdRef = useRef(userId);
  const onDateChangeRef = useRef(onDateChange);

  useEffect(() => {
    userIdRef.current = userId;
    onDateChangeRef.current = onDateChange;
  }, [userId, onDateChange]);

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  };

  const migrateTasksFromDate = async (
    uid: string,
    fromDate: string,
    toDate: string,
    onDateChangeFn: () => void,
  ) => {
    try {
      const fromTime = new Date(fromDate).getTime();
      const toTime = new Date(toDate).getTime();
      const daysDiff = Math.floor((toTime - fromTime) / (1000 * 60 * 60 * 24));

      if (daysDiff !== 1) {
        console.error(`자정 마이그레이션 중단: 날짜 차이 ${daysDiff}일`);
        toast.error(`날짜 검증 실패: ${fromDate} -> ${toDate} (${daysDiff}일 차이)`);
        return;
      }

      // is_running=true 태스크 조회
      const { data: runningTasks, error: runningError } = await veilorDb
        .from('work_tasks' as never)
        .select('id, title, date, is_running, is_paused, time_remaining' as never)
        .eq('user_id', uid)
        .eq('date', fromDate)
        .eq('is_running', true)
        .neq('status', 'done');

      if (runningError) {
        console.error('실행 중 태스크 조회 실패:', runningError);
      }

      // is_paused=true 태스크 조회
      const { data: pausedTasks, error: pausedError } = await veilorDb
        .from('work_tasks' as never)
        .select('id, title, date, is_running, is_paused, time_remaining' as never)
        .eq('user_id', uid)
        .eq('date', fromDate)
        .eq('is_paused', true)
        .neq('status', 'done');

      if (pausedError) {
        console.error('일시정지 태스크 조회 실패:', pausedError);
      }

      const allToMigrate = [
        ...((runningTasks as unknown as { id: string; title: string }[]) || []),
        ...((pausedTasks as unknown as { id: string; title: string }[]) || []),
      ];

      if (allToMigrate.length === 0) {
        if (isDev) console.log(`${fromDate}의 실행/일시정지 태스크 없음`);
        return;
      }

      let successCount = 0;
      for (const task of allToMigrate) {
        const { error: updateError } = await veilorDb
          .from('work_tasks' as never)
          .update({ date: toDate, updated_at: new Date().toISOString() } as never)
          .eq('id', task.id);

        if (updateError) {
          console.error(`"${task.title}" 마이그레이션 실패:`, updateError);
        } else {
          successCount++;
          if (isDev) console.log(`"${task.title}" -> ${toDate} 이동 완료`);
        }
      }

      if (successCount > 0) {
        toast.success(
          `새로운 날이 시작되었습니다!\n${successCount}개의 작업이 오늘로 이동되었습니다.`,
          { duration: 5000 },
        );
        onDateChangeFn();
      }
    } catch (err) {
      console.error('자정 마이그레이션 실패:', err);
      toast.error('작업 이동 중 오류가 발생했습니다.');
    }
  };

  const migrateRunningTasksWithDate = async (fromDate: string, toDate: string) => {
    const uid = userIdRef.current;
    const onDateChangeFn = onDateChangeRef.current;

    if (!uid) return;

    if (fromDate === toDate) {
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const actualYesterday = yesterdayDate.toISOString().split('T')[0];
      await migrateTasksFromDate(uid, actualYesterday, toDate, onDateChangeFn);
      return;
    }

    await migrateTasksFromDate(uid, fromDate, toDate, onDateChangeFn);
  };

  const scheduleNextMidnight = useCallback(() => {
    if (midnightTimeoutRef.current) {
      clearTimeout(midnightTimeoutRef.current);
    }

    const timeUntilMidnight = getTimeUntilMidnight();

    midnightTimeoutRef.current = setTimeout(() => {
      const yesterday = lastDateRef.current;
      const today = getTodayString();

      lastDateRef.current = today;
      setStoredDate(today);

      migrateRunningTasksWithDate(yesterday, today);
      scheduleNextMidnight();
    }, timeUntilMidnight);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!userId) return;

    const currentDate = getTodayString();
    const storedDate = getStoredDate();

    if (storedDate !== currentDate) {
      const storedTime = new Date(storedDate).getTime();
      const currentTime = new Date(currentDate).getTime();
      const daysDiff = Math.floor((currentTime - storedTime) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        migrateRunningTasksWithDate(storedDate, currentDate);
      } else if (daysDiff > 1) {
        console.warn(`${daysDiff}일간 앱 미사용. 실행 중 태스크 자동 마이그레이션 건너뜀.`);
      }

      lastDateRef.current = currentDate;
      setStoredDate(currentDate);
      onDateChange();
    } else {
      lastDateRef.current = storedDate;
    }

    scheduleNextMidnight();

    return () => {
      if (midnightTimeoutRef.current) {
        clearTimeout(midnightTimeoutRef.current);
        midnightTimeoutRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    currentDate: lastDateRef.current,
  };
};
