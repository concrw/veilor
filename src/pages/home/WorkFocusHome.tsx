import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useLanguageContext } from '@/context/LanguageContext';
import { veilorDb } from '@/integrations/supabase/client';
import type { WorkTask } from '@/integrations/supabase/veilor-types';
import { getRolloverTasks } from '@/lib/tbqc';

// ──────────────────────────────────────────────────────────────────────────────
// i18n
// ──────────────────────────────────────────────────────────────────────────────

const S = {
  ko: {
    header: '오늘의 집중',
    mentalLabel: '현재 에너지',
    noCheckin: '오늘 체크인 없음',
    addPlaceholder: '새 태스크 제목',
    estLabel: '예상(분)',
    add: '추가',
    start: '시작',
    pause: '일시정지',
    done: '완료',
    rolloverLabel: (n: number) => `어제 미완료 ${n}개가 오늘로 넘어왔어요`,
    amberComment: (energy: number) =>
      energy >= 70
        ? '에너지가 좋습니다. 집중력이 필요한 태스크를 먼저 하세요.'
        : energy >= 40
        ? '적당한 에너지입니다. 중간 난이도 태스크부터 시작해보세요.'
        : '에너지가 낮습니다. 작은 태스크부터 시작해 모멘텀을 만들어보세요.',
    empty: '아직 태스크가 없습니다',
    minuteUnit: '분',
  },
  en: {
    header: "Today's Focus",
    mentalLabel: 'Current Energy',
    noCheckin: 'No check-in today',
    addPlaceholder: 'New task title',
    estLabel: 'Est. (min)',
    add: 'Add',
    start: 'Start',
    pause: 'Pause',
    done: 'Done',
    rolloverLabel: (n: number) => `${n} unfinished task${n > 1 ? 's' : ''} rolled over from yesterday`,
    amberComment: (energy: number) =>
      energy >= 70
        ? 'Great energy. Tackle your high-focus tasks first.'
        : energy >= 40
        ? 'Moderate energy. Start with medium-difficulty tasks.'
        : 'Energy is low. Begin with small tasks to build momentum.',
    empty: 'No tasks yet',
    minuteUnit: 'min',
  },
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// 타이머 훅
// ──────────────────────────────────────────────────────────────────────────────

function useTaskTimer(taskId: string | null, onTick?: (secs: number) => void) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (taskId) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1;
          onTick?.(next);
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [taskId]);

  return elapsed;
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ──────────────────────────────────────────────────────────────────────────────
// 컴포넌트
// ──────────────────────────────────────────────────────────────────────────────

export default function WorkFocusHome() {
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const queryClient = useQueryClient();

  const [newTitle, setNewTitle] = useState('');
  const [newEst, setNewEst] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const elapsed = useTaskTimer(activeTaskId);

  // 오늘 체크인 에너지 (mood_score를 energy로 사용)
  const { data: todayEnergy } = useQuery<number | null>({
    queryKey: ['focus_today_energy', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data } = await veilorDb
        .from('tab_conversations')
        .select('content')
        .eq('user_id', user.id)
        .eq('tab', 'clear_checkin')
        .gte('created_at', todayStart.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);
      if (!data?.length) return null;
      try {
        const parsed = JSON.parse(data[0].content ?? '{}');
        return typeof parsed.mood_score === 'number' ? parsed.mood_score : null;
      } catch { return null; }
    },
    enabled: !!user,
  });

  // 오늘 + 롤오버 태스크
  const { data: tasks = [] } = useQuery<WorkTask[]>({
    queryKey: ['work_tasks_today', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data } = await veilorDb
        .from('work_tasks' as never)
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'done')
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: true });
      return (data ?? []) as WorkTask[];
    },
    enabled: !!user,
  });

  const rollovers = getRolloverTasks(tasks);

  // 태스크 추가
  const addMutation = useMutation({
    mutationFn: async () => {
      if (!user || !newTitle.trim()) return;
      const mentalSnapshot = todayEnergy != null
        ? { energy: todayEnergy, mood: todayEnergy, focus: null }
        : {};
      await veilorDb.from('work_tasks' as never).insert({
        user_id: user.id,
        title: newTitle.trim(),
        estimated_minutes: newEst ? parseInt(newEst) : null,
        mental_snapshot: mentalSnapshot,
        lang: language,
      });
    },
    onSuccess: () => {
      setNewTitle('');
      setNewEst('');
      queryClient.invalidateQueries({ queryKey: ['work_tasks_today', user?.id] });
    },
  });

  // 타이머 시작
  const startMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await veilorDb.from('work_tasks' as never).update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
      }).eq('id', taskId);
    },
    onSuccess: (_, taskId) => {
      setActiveTaskId(taskId);
      queryClient.invalidateQueries({ queryKey: ['work_tasks_today', user?.id] });
    },
  });

  // 일시정지
  const pauseMutation = useMutation({
    mutationFn: async (task: WorkTask) => {
      await veilorDb.from('work_tasks' as never).update({
        status: 'todo',
        pause_count: task.pause_count + 1,
      }).eq('id', task.id);
    },
    onSuccess: () => {
      setActiveTaskId(null);
      queryClient.invalidateQueries({ queryKey: ['work_tasks_today', user?.id] });
    },
  });

  // 완료
  const doneMutation = useMutation({
    mutationFn: async (task: WorkTask) => {
      const actualMinutes = task.started_at
        ? Math.round((Date.now() - new Date(task.started_at).getTime()) / 60000)
        : null;
      await veilorDb.from('work_tasks' as never).update({
        status: 'done',
        actual_minutes: actualMinutes,
        completed_at: new Date().toISOString(),
      }).eq('id', task.id);
    },
    onSuccess: () => {
      setActiveTaskId(null);
      queryClient.invalidateQueries({ queryKey: ['work_tasks_today', user?.id] });
    },
  });

  const energyPct = todayEnergy ?? 0;
  const today = new Date();
  const dateLabel = today.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
    month: 'long', day: 'numeric', weekday: 'short',
  });

  return (
    <div className="min-h-screen bg-[#1C1917] px-4 py-6 max-w-sm mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <p className="text-xs text-stone-500 mb-1">{dateLabel}</p>
        <h1 className="text-xl font-semibold text-stone-100">{s.header}</h1>
      </div>

      {/* 멘탈 스냅샷 */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: '#252220', border: '1px solid #2A2624' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-stone-400">{s.mentalLabel}</span>
          <span className="text-sm font-medium text-sky-300">
            {todayEnergy != null ? `${todayEnergy}` : s.noCheckin}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-stone-800">
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${energyPct}%`, background: energyPct >= 70 ? '#38bdf8' : energyPct >= 40 ? '#f59e0b' : '#f43f5e' }}
          />
        </div>
      </div>

      {/* Amber 코멘트 */}
      <div className="rounded-2xl p-4 mb-4 flex gap-3 items-start" style={{ background: '#1E1C1A', border: '1px solid #2A2624' }}>
        <span className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5" style={{ background: '#D4A574' }} />
        <p className="text-sm text-stone-300 leading-relaxed">
          {s.amberComment(energyPct)}
        </p>
      </div>

      {/* 롤오버 알림 */}
      {rollovers.length > 0 && (
        <div className="rounded-xl px-4 py-2.5 mb-4 text-xs text-amber-300" style={{ background: '#2A2010', border: '1px solid #44330088' }}>
          {s.rolloverLabel(rollovers.length)}
        </div>
      )}

      {/* 태스크 추가 폼 */}
      <div className="flex gap-2 mb-4">
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addMutation.mutate()}
          placeholder={s.addPlaceholder}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm text-stone-200 placeholder-stone-600 outline-none"
          style={{ background: '#252220', border: '1px solid #2A2624' }}
        />
        <input
          value={newEst}
          onChange={e => setNewEst(e.target.value)}
          placeholder={s.estLabel}
          type="number"
          min="1"
          className="w-20 rounded-xl px-3 py-2.5 text-sm text-stone-200 placeholder-stone-600 outline-none"
          style={{ background: '#252220', border: '1px solid #2A2624' }}
        />
        <button
          onClick={() => addMutation.mutate()}
          disabled={!newTitle.trim()}
          className="rounded-xl px-3 py-2.5 text-sm font-medium text-stone-950 bg-sky-400 hover:bg-sky-300 disabled:opacity-40 transition-colors"
        >
          {s.add}
        </button>
      </div>

      {/* 태스크 목록 */}
      {tasks.length === 0 ? (
        <p className="text-center text-stone-600 text-sm py-8">{s.empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map(task => {
            const isActive = activeTaskId === task.id;
            return (
              <div
                key={task.id}
                className="rounded-2xl p-4"
                style={{
                  background: isActive ? '#1A2230' : '#252220',
                  border: `1px solid ${isActive ? '#38bdf844' : '#2A2624'}`,
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm text-stone-200 font-medium leading-snug flex-1">{task.title}</p>
                  {task.estimated_minutes && (
                    <span className="text-xs text-stone-500 flex-shrink-0">
                      {task.estimated_minutes}{s.minuteUnit}
                    </span>
                  )}
                </div>
                {isActive && (
                  <p className="text-lg font-mono text-sky-300 mb-2">{formatTime(elapsed)}</p>
                )}
                <div className="flex gap-2">
                  {!isActive && task.status !== 'done' && (
                    <button
                      onClick={() => startMutation.mutate(task.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-sky-400/10 text-sky-300 hover:bg-sky-400/20 transition-colors"
                    >
                      {s.start}
                    </button>
                  )}
                  {isActive && (
                    <button
                      onClick={() => pauseMutation.mutate(task)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-colors"
                    >
                      {s.pause}
                    </button>
                  )}
                  <button
                    onClick={() => doneMutation.mutate(task)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-colors"
                  >
                    {s.done}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
