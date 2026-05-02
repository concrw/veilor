import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useLanguageContext } from '@/context/LanguageContext';
import { veilorDb } from '@/integrations/supabase/client';
import { useWorkStats } from '@/hooks/useWorkStats';
import type { WorkSprint } from '@/integrations/supabase/veilor-types';
import type { MasteryLevel } from '@/lib/tbqc';
import { useWorkTranslations } from '@/hooks/useTranslation';

// ──────────────────────────────────────────────────────────────────────────────
// 헬퍼
// ──────────────────────────────────────────────────────────────────────────────

function getWeekStart(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

const MASTERY_COLORS: Record<MasteryLevel, string> = {
  beginner:     '#78716c',
  intermediate: '#a78bfa',
  skilled:      '#38bdf8',
  expert:       '#f59e0b',
  master:       '#E0B48A',
};

const MASTERY_ORDER: MasteryLevel[] = ['beginner', 'intermediate', 'skilled', 'expert', 'master'];

// ──────────────────────────────────────────────────────────────────────────────
// KPI 카드
// ──────────────────────────────────────────────────────────────────────────────

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="flex-1 rounded-xl p-3 text-center"
      style={{ background: '#1E1C1A', border: '1px solid #2A2624' }}
    >
      <p className="text-xs text-stone-500 mb-1">{label}</p>
      <p className="text-lg font-semibold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 컴포넌트
// ──────────────────────────────────────────────────────────────────────────────

export default function WorkSprintHome() {
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const w = useWorkTranslations();
  const s = w.sprint;
  const queryClient = useQueryClient();
  const [newGoal, setNewGoal] = useState('');

  const weekStart = getWeekStart();
  const weekStartStr = weekStart.toISOString().split('T')[0];

  // useWorkStats 훅으로 주간 지표 조회
  const {
    tasks,
    completionRate,
    avgAccuracy,
    completionPower,
    highEnergyRate,
    lowEnergyRate,
    masteryLevel,
    streak,
    loading,
  } = useWorkStats();

  // 스프린트 레코드
  const { data: sprint } = useQuery<WorkSprint | null>({
    queryKey: ['work_sprint', user?.id, weekStartStr],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await veilorDb
        .from('work_sprints' as never)
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStartStr)
        .maybeSingle();
      return (data as WorkSprint) ?? null;
    },
    enabled: !!user,
  });

  // 스프린트 upsert
  const upsertSprint = useMutation({
    mutationFn: async (goals: { title: string; done: boolean }[]) => {
      if (!user) return;
      await veilorDb.from('work_sprints' as never).upsert(
        {
          user_id: user.id,
          week_start: weekStartStr,
          goals,
        },
        { onConflict: 'user_id,week_start' },
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['work_sprint', user?.id, weekStartStr] }),
  });

  const masteryIdx = MASTERY_ORDER.indexOf(masteryLevel);
  const masteryColor = MASTERY_COLORS[masteryLevel];

  const goals: { title: string; done: boolean }[] = sprint?.goals ?? [];

  function handleAddGoal() {
    if (!newGoal.trim() || goals.length >= 3) return;
    upsertSprint.mutate([...goals, { title: newGoal.trim(), done: false }]);
    setNewGoal('');
  }

  function toggleGoal(idx: number) {
    const updated = goals.map((g, i) => (i === idx ? { ...g, done: !g.done } : g));
    upsertSprint.mutate(updated);
  }

  return (
    <div className="min-h-screen bg-[#1C1917] px-4 py-6 max-w-sm mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <p className="text-xs text-stone-500 mb-1">{s.weekLabel(weekStart)}</p>
        <h1 className="text-xl font-semibold text-stone-100">{s.header}</h1>
      </div>

      {loading && (
        <p className="text-center text-stone-600 text-xs py-4">로딩 중...</p>
      )}

      {!loading && tasks.length === 0 ? (
        <p className="text-center text-stone-600 text-sm py-8">{s.noData}</p>
      ) : (
        <>
          {/* 메타인지 레벨 */}
          <div
            className="rounded-2xl p-4 mb-4"
            style={{ background: '#252220', border: '1px solid #2A2624' }}
          >
            <p className="text-xs text-stone-500 mb-3">{s.masteryTitle}</p>
            <div className="flex gap-1 mb-2">
              {MASTERY_ORDER.map((lvl, i) => (
                <div
                  key={lvl}
                  className="flex-1 h-1.5 rounded-full transition-all"
                  style={{ background: i <= masteryIdx ? MASTERY_COLORS[lvl] : '#2A2624' }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold" style={{ color: masteryColor }}>
                {s.mastery[masteryLevel]}
              </p>
              {streak > 0 && (
                <p className="text-xs text-stone-400">
                  {s.streakTitle} {streak}{s.streakUnit}
                </p>
              )}
            </div>
          </div>

          {/* TBQC 지표 */}
          <div className="mb-4">
            <p className="text-xs text-stone-500 mb-2">{s.kpiTitle}</p>
            <div className="flex gap-2">
              <KpiCard
                label={s.completionRate}
                value={`${Math.round(completionRate * 100)}${s.pctUnit}`}
                color={completionRate >= 0.7 ? '#4ade80' : completionRate >= 0.4 ? '#f59e0b' : '#f43f5e'}
              />
              <KpiCard
                label={s.accuracy}
                value={`${Math.round(avgAccuracy * 100)}${s.pctUnit}`}
                color={avgAccuracy >= 0.7 ? '#38bdf8' : avgAccuracy >= 0.4 ? '#f59e0b' : '#f43f5e'}
              />
              <KpiCard
                label={s.completionPower}
                value={`${Math.round(completionPower * 100)}${s.pctUnit}`}
                color={completionPower >= 0.7 ? '#a78bfa' : completionPower >= 0.4 ? '#f59e0b' : '#f43f5e'}
              />
            </div>
          </div>

          {/* 멘탈 × 퍼포먼스 */}
          <div
            className="rounded-2xl p-4 mb-4"
            style={{ background: '#252220', border: '1px solid #2A2624' }}
          >
            <p className="text-xs text-stone-500 mb-3">{s.mentalTitle}</p>
            <div className="space-y-2">
              {[
                { label: s.highEnergy, value: highEnergyRate, color: '#38bdf8' },
                { label: s.lowEnergy,  value: lowEnergyRate,  color: '#f43f5e' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-400">{label}</span>
                    <span style={{ color }}>{Math.round(value * 100)}{s.pctUnit}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-800">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${value * 100}%`, background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-3 leading-relaxed">
              {s.mentalInsight(highEnergyRate, lowEnergyRate)}
            </p>
          </div>
        </>
      )}

      {/* 주간 목표 */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{ background: '#252220', border: '1px solid #2A2624' }}
      >
        <p className="text-xs text-stone-500 mb-3">{s.goalsTitle}</p>
        <div className="flex flex-col gap-2 mb-3">
          {goals.map((g, i) => (
            <button
              key={i}
              onClick={() => toggleGoal(i)}
              className="flex items-center gap-3 text-left"
            >
              <span
                className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all"
                style={{
                  borderColor: g.done ? '#4ade80' : '#44403c',
                  background: g.done ? '#4ade8022' : 'transparent',
                }}
              />
              <span className={`text-sm ${g.done ? 'line-through text-stone-600' : 'text-stone-200'}`}>
                {g.title}
              </span>
            </button>
          ))}
        </div>
        {goals.length < 3 && (
          <div className="flex gap-2">
            <input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
              placeholder={s.addGoalPlaceholder}
              className="flex-1 rounded-xl px-3 py-2 text-sm text-stone-200 placeholder-stone-600 outline-none"
              style={{ background: '#1C1917', border: '1px solid #2A2624' }}
            />
            <button
              onClick={handleAddGoal}
              disabled={!newGoal.trim()}
              className="rounded-xl px-3 py-2 text-xs font-medium text-stone-950 disabled:opacity-40 transition-colors"
              style={{ background: '#E0B48A' }}
            >
              {s.addGoal}
            </button>
          </div>
        )}
      </div>

      {/* Amber 주간 코칭 */}
      <div
        className="rounded-2xl p-4 flex gap-3 items-start"
        style={{ background: '#1E1C1A', border: '1px solid #2A2624' }}
      >
        <span
          className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5"
          style={{ background: '#E0B48A' }}
        />
        <div>
          <p className="text-xs text-stone-500 mb-1">{s.amberTitle}</p>
          <p className="text-sm text-stone-300 leading-relaxed">
            {s.amberCoaching(completionRate, avgAccuracy)}
          </p>
        </div>
      </div>
    </div>
  );
}
