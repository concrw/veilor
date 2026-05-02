import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useLanguageContext } from '@/context/LanguageContext';
import { veilorDb } from '@/integrations/supabase/client';
import { useWorkTasks } from '@/hooks/useWorkTasks';
import { useWorkTaskTimers } from '@/hooks/useWorkTaskTimers';
import { useMidnightRollover } from '@/hooks/useMidnightRollover';
import { useWorkTranslations } from '@/hooks/useTranslation';

// ──────────────────────────────────────────────────────────────────────────────
// 헬퍼
// ──────────────────────────────────────────────────────────────────────────────

function formatTime(secs: number) {
  const totalSecs = Math.max(0, secs);
  const m = Math.floor(totalSecs / 60).toString().padStart(2, '0');
  const s = (totalSecs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ──────────────────────────────────────────────────────────────────────────────
// 컴포넌트
// ──────────────────────────────────────────────────────────────────────────────

export default function WorkFocusHome() {
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const w = useWorkTranslations();
  const s = w.focus;

  const [newTitle, setNewTitle] = useState('');
  const [newEst, setNewEst] = useState('');

  const {
    tasks,
    completedTasks,
    loading,
    addTask,
    startTask,
    pauseTask,
    resumeTask,
    completeTask,
    deleteTask,
    loadTasks,
  } = useWorkTasks();

  const { getDisplayTime } = useWorkTaskTimers(tasks);

  useMidnightRollover({ userId: user?.id, onDateChange: () => loadTasks() });

  // 오늘 체크인 에너지
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
      } catch {
        return null;
      }
    },
    enabled: !!user,
  });

  // 롤오버 태스크 — date < today 이면서 미완료
  const today = getTodayDateString();
  const rollovers = tasks.filter(
    (t) => t.date !== null && t.date < today && t.status !== 'done',
  );

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const estMins = newEst ? parseInt(newEst) : 30;
    addTask(newTitle.trim(), estMins);
    setNewTitle('');
    setNewEst('');
  };

  const energyPct = todayEnergy ?? 0;
  const dateLabel = new Date().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
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
            style={{
              width: `${energyPct}%`,
              background: energyPct >= 70 ? '#38bdf8' : energyPct >= 40 ? '#f59e0b' : '#f43f5e',
            }}
          />
        </div>
      </div>

      {/* Amber 코멘트 */}
      <div
        className="rounded-2xl p-4 mb-4 flex gap-3 items-start"
        style={{ background: '#1E1C1A', border: '1px solid #2A2624' }}
      >
        <span
          className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5"
          style={{ background: '#E0B48A' }}
        />
        <p className="text-sm text-stone-300 leading-relaxed">{s.amberComment(energyPct)}</p>
      </div>

      {/* 롤오버 알림 */}
      {rollovers.length > 0 && (
        <div
          className="rounded-xl px-4 py-2.5 mb-4 text-xs text-amber-300"
          style={{ background: '#2A2010', border: '1px solid #44330088' }}
        >
          {s.rolloverLabel(rollovers.length)}
        </div>
      )}

      {/* 태스크 추가 폼 */}
      <div className="flex gap-2 mb-4">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={s.addPlaceholder}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm text-stone-200 placeholder-stone-600 outline-none"
          style={{ background: '#252220', border: '1px solid #2A2624' }}
        />
        <input
          value={newEst}
          onChange={(e) => setNewEst(e.target.value)}
          placeholder={s.estLabel}
          type="number"
          min="1"
          className="w-20 rounded-xl px-3 py-2.5 text-sm text-stone-200 placeholder-stone-600 outline-none"
          style={{ background: '#252220', border: '1px solid #2A2624' }}
        />
        <button
          onClick={handleAdd}
          disabled={!newTitle.trim()}
          className="rounded-xl px-3 py-2.5 text-sm font-medium text-stone-950 disabled:opacity-40 transition-colors"
          style={{ background: '#E0B48A' }}
        >
          {s.add}
        </button>
      </div>

      {/* 로딩 */}
      {loading && (
        <p className="text-center text-stone-600 text-xs py-4">로딩 중...</p>
      )}

      {/* 활성 태스크 목록 */}
      {!loading && tasks.length === 0 ? (
        <p className="text-center text-stone-600 text-sm py-8">{s.empty}</p>
      ) : (
        <div className="flex flex-col gap-3 mb-4">
          {tasks.map((task) => {
            const isRunning = task.is_running;
            const isPaused = task.is_paused;
            const displaySecs = getDisplayTime(task);

            return (
              <div
                key={task.id}
                className="rounded-2xl p-4"
                style={{
                  background: isRunning ? '#1A2230' : '#252220',
                  border: `1px solid ${isRunning ? '#38bdf844' : '#2A2624'}`,
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm text-stone-200 font-medium leading-snug flex-1">
                    {task.title}
                  </p>
                  {task.estimated_minutes && (
                    <span className="text-xs text-stone-500 flex-shrink-0">
                      {task.estimated_minutes}{s.minuteUnit}
                    </span>
                  )}
                </div>

                {/* 타이머 표시 */}
                {(isRunning || isPaused) && (
                  <p
                    className="text-lg font-mono mb-2"
                    style={{ color: isRunning ? '#38bdf8' : '#f59e0b' }}
                  >
                    {formatTime(displaySecs)}
                  </p>
                )}

                <div className="flex gap-2">
                  {/* 시작 버튼 — 정지 상태이며 일시정지 아닐 때 */}
                  {!isRunning && !isPaused && (
                    <button
                      onClick={() => startTask(task.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-sky-400/10 text-sky-300 hover:bg-sky-400/20 transition-colors"
                    >
                      {s.start}
                    </button>
                  )}

                  {/* 재개 버튼 — 일시정지 상태 */}
                  {isPaused && !isRunning && (
                    <button
                      onClick={() => resumeTask(task.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-sky-400/10 text-sky-300 hover:bg-sky-400/20 transition-colors"
                    >
                      {s.resume}
                    </button>
                  )}

                  {/* 일시정지 버튼 — 실행 중 */}
                  {isRunning && (
                    <button
                      onClick={() => pauseTask(task.id, displaySecs)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-colors"
                    >
                      {s.pause}
                    </button>
                  )}

                  {/* 완료 버튼 */}
                  <button
                    onClick={() => {
                      const estMins = task.estimated_minutes ?? undefined;
                      completeTask(task.id, estMins);
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-colors"
                  >
                    {s.done}
                  </button>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors"
                  >
                    {s.delete}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 완료된 태스크 */}
      {completedTasks.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-stone-500 mb-2">완료 {completedTasks.length}개</p>
          <div className="flex flex-col gap-2">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl px-4 py-2.5 flex items-center justify-between"
                style={{ background: '#1A1C18', border: '1px solid #2A3024' }}
              >
                <p className="text-sm text-stone-500 line-through">{task.title}</p>
                {task.actual_minutes && (
                  <span className="text-xs text-stone-600">{task.actual_minutes}{s.minuteUnit}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
