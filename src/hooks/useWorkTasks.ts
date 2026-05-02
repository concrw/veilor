import { useState, useEffect, useCallback, useRef } from 'react';
import { veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import type { WorkTask as BaseWorkTask } from '@/integrations/supabase/veilor-types';

const isDev = process.env.NODE_ENV === 'development';

export interface WorkTask extends BaseWorkTask {
  date: string | null;
  displayIndex?: number;
}

const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useWorkTasks = (selectedDate?: Date) => {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<WorkTask[]>([]);
  const [loading, setLoading] = useState(false);

  const mountedRef = useRef(true);
  const lastLoadedRef = useRef<string>('');
  const isLoadingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const parseTask = useCallback((raw: Record<string, unknown>, dateString: string): WorkTask => {
    const estimatedMinutes = typeof raw.estimated_minutes === 'number' ? raw.estimated_minutes : 30;
    return {
      id: raw.id as string,
      user_id: raw.user_id as string,
      title: (raw.title as string) || '제목 없음',
      category: (raw.category as string) || 'general',
      estimated_minutes: raw.estimated_minutes as number | null,
      actual_minutes: raw.actual_minutes as number | null,
      status: (raw.status as WorkTask['status']) || 'todo',
      pause_count: (raw.pause_count as number) || 0,
      mental_snapshot: (raw.mental_snapshot as WorkTask['mental_snapshot']) || {},
      lang: (raw.lang as string) || 'ko',
      started_at: raw.started_at as string | null,
      completed_at: raw.completed_at as string | null,
      rolled_over_from: raw.rolled_over_from as string | null,
      created_at: raw.created_at as string,
      time_remaining:
        raw.time_remaining !== null && raw.time_remaining !== undefined
          ? (raw.time_remaining as number)
          : estimatedMinutes * 60,
      is_running: Boolean(raw.is_running),
      is_paused: Boolean(raw.is_paused),
      paused_at: raw.paused_at as string | null,
      total_paused_seconds: (raw.total_paused_seconds as number) || 0,
      order_index: (raw.order_index as number) ?? 0,
      date: (raw.date as string) || dateString,
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.id) {
      setTasks([]);
      setCompletedTasks([]);
      setLoading(false);
      lastLoadedRef.current = '';
      return;
    }

    const targetDate = selectedDate || new Date();
    const dateString = getLocalDateString(targetDate);
    const loadKey = `${user.id}-${dateString}`;

    if (lastLoadedRef.current === loadKey && !isLoadingRef.current) return;
    if (isLoadingRef.current) return;

    const loadTasksData = async () => {
      isLoadingRef.current = true;
      setLoading(true);
      lastLoadedRef.current = loadKey;

      try {
        const { data: allTasks, error } = await veilorDb
          .from('work_tasks' as never)
          .select('*')
          .eq('user_id', user.id)
          .eq('date', dateString)
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: true });

        if (error) {
          if (isDev) console.error('work_tasks 쿼리 에러:', error);
          return;
        }

        if (!mountedRef.current) return;

        const activeTasks: WorkTask[] = [];
        const completedList: WorkTask[] = [];

        ((allTasks as unknown as Record<string, unknown>[]) || []).forEach((raw) => {
          const task = parseTask(raw, dateString);
          if (task.status === 'done') {
            completedList.push(task);
          } else {
            activeTasks.push({ ...task, displayIndex: activeTasks.length });
          }
        });

        if (mountedRef.current) {
          setTasks(activeTasks);
          setCompletedTasks(completedList);
        }
      } catch (err) {
        if (isDev) console.error('work_tasks 로딩 에러:', err);
      } finally {
        isLoadingRef.current = false;
        if (mountedRef.current) setLoading(false);
      }
    };

    loadTasksData();
  }, [user?.id, authLoading, selectedDate, parseTask]);

  const loadTasks = useCallback(
    async (date?: Date) => {
      if (authLoading || !user?.id) return;

      lastLoadedRef.current = '';
      isLoadingRef.current = false;

      const targetDate = date || selectedDate || new Date();
      const dateString = getLocalDateString(targetDate);

      if (mountedRef.current) setLoading(true);

      try {
        const { data: allTasks, error } = await veilorDb
          .from('work_tasks' as never)
          .select('*')
          .eq('user_id', user.id)
          .eq('date', dateString)
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: true });

        if (error) {
          if (isDev) console.error('work_tasks 강제 로드 에러:', error);
          return;
        }

        if (!mountedRef.current) return;

        const activeTasks: WorkTask[] = [];
        const completedList: WorkTask[] = [];

        ((allTasks as unknown as Record<string, unknown>[]) || []).forEach((raw) => {
          const task = parseTask(raw, dateString);
          if (task.status === 'done') {
            completedList.push(task);
          } else {
            activeTasks.push({ ...task, displayIndex: activeTasks.length });
          }
        });

        if (mountedRef.current) {
          setTasks(activeTasks);
          setCompletedTasks(completedList);
        }
      } catch (err) {
        if (isDev) console.error('work_tasks 강제 로드 예외:', err);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [authLoading, user?.id, selectedDate, parseTask],
  );

  const addTask = useCallback(
    async (title: string, estimatedMinutes: number = 30, targetDate?: Date) => {
      if (authLoading || !user?.id || !title.trim()) return;

      const date = targetDate || selectedDate || new Date();
      const dateString = getLocalDateString(date);

      const { data: maxOrderData } = await veilorDb
        .from('work_tasks' as never)
        .select('order_index')
        .eq('user_id', user.id)
        .eq('date', dateString)
        .order('order_index', { ascending: false })
        .limit(1);

      const maxOrder = (maxOrderData as unknown as { order_index: number }[] | null)?.[0]?.order_index ?? -1;
      const newOrderIndex = maxOrder + 1;

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const tempTask: WorkTask = {
        id: tempId,
        user_id: user.id,
        title: title.trim(),
        category: 'general',
        estimated_minutes: estimatedMinutes,
        actual_minutes: null,
        status: 'todo',
        pause_count: 0,
        mental_snapshot: {},
        lang: 'ko',
        started_at: null,
        completed_at: null,
        rolled_over_from: null,
        created_at: new Date().toISOString(),
        time_remaining: estimatedMinutes * 60,
        is_running: false,
        is_paused: false,
        paused_at: null,
        total_paused_seconds: 0,
        order_index: newOrderIndex,
        date: dateString,
        displayIndex: tasks.length,
      };

      if (mountedRef.current) {
        setTasks((prev) => [...prev, tempTask]);
      }

      try {
        const { data, error } = await veilorDb
          .from('work_tasks' as never)
          .insert({
            user_id: user.id,
            title: title.trim(),
            estimated_minutes: estimatedMinutes,
            time_remaining: estimatedMinutes * 60,
            status: 'todo',
            is_running: false,
            is_paused: false,
            total_paused_seconds: 0,
            order_index: newOrderIndex,
            date: dateString,
            pause_count: 0,
            mental_snapshot: {},
            lang: 'ko',
          } as never)
          .select()
          .single();

        if (error) throw error;

        if (mountedRef.current) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === tempId
                ? { ...tempTask, id: (data as unknown as { id: string }).id }
                : t,
            ),
          );
        }
      } catch (err) {
        if (mountedRef.current) {
          setTasks((prev) => prev.filter((t) => t.id !== tempId));
        }
        if (isDev) console.error('addTask 에러:', err);
      }
    },
    [authLoading, user?.id, selectedDate, tasks.length],
  );

  const startTask = useCallback(
    async (taskId: string) => {
      if (authLoading || !user?.id) return;

      const now = new Date().toISOString();

      if (mountedRef.current) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, status: 'in_progress' as const, is_running: true, started_at: now }
              : t,
          ),
        );
      }

      try {
        await veilorDb
          .from('work_tasks' as never)
          .update({ status: 'in_progress', is_running: true, started_at: now } as never)
          .eq('id', taskId);
      } catch (err) {
        if (isDev) console.error('startTask 에러:', err);
      }
    },
    [authLoading, user?.id],
  );

  const pauseTask = useCallback(
    async (taskId: string, timeRemaining?: number) => {
      if (authLoading || !user?.id) return;

      const task = tasks.find((t) => t.id === taskId);
      if (!task || !task.started_at) return;

      const now = new Date().toISOString();
      const nowTime = new Date(now).getTime();
      const startTime = new Date(task.started_at).getTime();
      const elapsedSeconds = Math.floor((nowTime - startTime) / 1000);

      const currentRemaining =
        timeRemaining !== undefined
          ? timeRemaining
          : (task.time_remaining ?? 0) - elapsedSeconds;

      const newPauseCount = (task.pause_count || 0) + 1;
      const newTotalPaused = (task.total_paused_seconds || 0) + elapsedSeconds;

      if (mountedRef.current) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'todo' as const,
                  is_paused: true,
                  paused_at: now,
                  is_running: false,
                  time_remaining: currentRemaining,
                  total_paused_seconds: newTotalPaused,
                  pause_count: newPauseCount,
                  started_at: null,
                }
              : t,
          ),
        );
      }

      try {
        await veilorDb
          .from('work_tasks' as never)
          .update({
            status: 'todo',
            is_paused: true,
            paused_at: now,
            is_running: false,
            time_remaining: currentRemaining,
            total_paused_seconds: newTotalPaused,
            pause_count: newPauseCount,
            started_at: null,
          } as never)
          .eq('id', taskId);
      } catch (err) {
        if (isDev) console.error('pauseTask 에러:', err);
      }
    },
    [authLoading, user?.id, tasks],
  );

  const resumeTask = useCallback(
    async (taskId: string) => {
      if (authLoading || !user?.id) return;

      const task = tasks.find((t) => t.id === taskId);
      if (!task || !task.is_paused) return;

      const now = new Date().toISOString();

      if (mountedRef.current) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'in_progress' as const,
                  is_paused: false,
                  paused_at: null,
                  is_running: true,
                  started_at: now,
                }
              : t,
          ),
        );
      }

      try {
        await veilorDb
          .from('work_tasks' as never)
          .update({
            status: 'in_progress',
            is_paused: false,
            paused_at: null,
            is_running: true,
            started_at: now,
          } as never)
          .eq('id', taskId);
      } catch (err) {
        if (isDev) console.error('resumeTask 에러:', err);
      }
    },
    [authLoading, user?.id, tasks],
  );

  const completeTask = useCallback(
    (taskId: string, actualMinutes?: number) => {
      if (authLoading || !user?.id) return;

      const taskToComplete = tasks.find((t) => t.id === taskId);
      if (!taskToComplete) return;

      const completedAt = new Date().toISOString();

      const completedTask: WorkTask = {
        ...taskToComplete,
        status: 'done',
        is_running: false,
        is_paused: false,
        completed_at: completedAt,
        actual_minutes: actualMinutes ?? taskToComplete.actual_minutes,
      };

      if (mountedRef.current) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        setCompletedTasks((prev) => [completedTask, ...prev]);
      }

      veilorDb
        .from('work_tasks' as never)
        .update({
          status: 'done',
          is_running: false,
          is_paused: false,
          completed_at: completedAt,
          actual_minutes: actualMinutes,
        } as never)
        .eq('id', taskId)
        .then(({ error }) => {
          if (error) {
            if (mountedRef.current) {
              setCompletedTasks((prev) => prev.filter((t) => t.id !== taskId));
              setTasks((prev) => [...prev, taskToComplete]);
            }
            toast.error('완료 처리 실패');
            if (isDev) console.error('completeTask 에러:', error);
          }
        });
    },
    [authLoading, user?.id, tasks],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (authLoading || !user?.id) return;

      if (mountedRef.current) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        setCompletedTasks((prev) => prev.filter((t) => t.id !== taskId));
      }

      try {
        await veilorDb.from('work_tasks' as never).delete().eq('id', taskId);
      } catch (err) {
        if (isDev) console.error('deleteTask 에러:', err);
      }
    },
    [authLoading, user?.id],
  );

  const reorderTasks = useCallback(
    async (startIndex: number, endIndex: number) => {
      if (authLoading || !user?.id) return;

      let reordered: WorkTask[] = [];

      if (mountedRef.current) {
        setTasks((prev) => {
          const result = [...prev];
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          reordered = result.map((t, idx) => ({ ...t, order_index: idx, displayIndex: idx }));
          return reordered;
        });
      }

      try {
        for (const t of reordered) {
          await veilorDb
            .from('work_tasks' as never)
            .update({ order_index: t.order_index } as never)
            .eq('id', t.id);
        }
      } catch (err) {
        if (isDev) console.error('reorderTasks 에러:', err);
        toast.error('순서 저장 실패');
      }
    },
    [authLoading, user?.id],
  );

  return {
    tasks,
    completedTasks,
    loading,
    addTask,
    startTask,
    pauseTask,
    resumeTask,
    completeTask,
    deleteTask,
    reorderTasks,
    loadTasks,
  };
};
