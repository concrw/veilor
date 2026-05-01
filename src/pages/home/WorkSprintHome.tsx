import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useLanguageContext } from '@/context/LanguageContext';
import { veilorDb } from '@/integrations/supabase/client';
import type { WorkTask, WorkSprint } from '@/integrations/supabase/veilor-types';
import {
  calcAccuracy,
  calcMasteryLevel,
  calcCompletionPower,
  calcMentalPerformanceCorrelation,
  type MasteryLevel,
} from '@/lib/tbqc';

// ──────────────────────────────────────────────────────────────────────────────
// i18n
// ──────────────────────────────────────────────────────────────────────────────

const S = {
  ko: {
    header: '이번 주 퍼포먼스',
    masteryTitle: '메타인지 레벨',
    mastery: {
      beginner:     '초보자',
      intermediate: '중급자',
      skilled:      '숙련자',
      expert:       '시간예측 전문가',
      master:       'TBQC 마스터',
    },
    kpiTitle: 'TBQC 핵심 지표',
    completionRate: '완료율',
    accuracy: '시간예측 정확도',
    completionPower: '완수력',
    mentalTitle: '멘탈 × 퍼포먼스',
    highEnergy: '에너지 높은 날',
    lowEnergy: '에너지 낮은 날',
    mentalInsight: (hi: number, lo: number) =>
      `에너지 높은 날 완료율 ${Math.round(hi * 100)}%, 낮은 날 ${Math.round(lo * 100)}%`,
    goalsTitle: '이번 주 목표',
    addGoalPlaceholder: '목표 입력',
    addGoal: '추가',
    amberTitle: 'Amber 주간 코칭',
    amberCoaching: (rate: number, acc: number) => {
      if (rate >= 0.8 && acc >= 0.7) return '훌륭합니다. 이번 주 실행력과 시간 예측 모두 탁월합니다. 다음 주는 더 도전적인 목표를 설정해보세요.';
      if (rate >= 0.6) return `완료율 ${Math.round(rate * 100)}%는 좋은 출발입니다. 시간 예측 정확도를 높이면 다음 레벨로 도약할 수 있어요.`;
      return '이번 주는 작은 태스크를 완료하는 연습을 해보세요. 완료 경험이 쌓일수록 예측 정확도도 함께 올라갑니다.';
    },
    pctUnit: '%',
    noData: '이번 주 태스크 데이터가 없습니다',
    weekLabel: (start: Date) => {
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.getMonth() + 1}/${start.getDate()} — ${end.getMonth() + 1}/${end.getDate()}`;
    },
  },
  en: {
    header: "This Week's Performance",
    masteryTitle: 'Metacognition Level',
    mastery: {
      beginner:     'Beginner',
      intermediate: 'Intermediate',
      skilled:      'Skilled',
      expert:       'Time-Prediction Expert',
      master:       'TBQC Master',
    },
    kpiTitle: 'TBQC Key Metrics',
    completionRate: 'Completion Rate',
    accuracy: 'Time Prediction Accuracy',
    completionPower: 'Completion Power',
    mentalTitle: 'Mental × Performance',
    highEnergy: 'High-energy days',
    lowEnergy: 'Low-energy days',
    mentalInsight: (hi: number, lo: number) =>
      `High-energy completion ${Math.round(hi * 100)}%, low-energy ${Math.round(lo * 100)}%`,
    goalsTitle: 'Sprint Goals',
    addGoalPlaceholder: 'Add a goal',
    addGoal: 'Add',
    amberTitle: 'Amber Weekly Coaching',
    amberCoaching: (rate: number, acc: number) => {
      if (rate >= 0.8 && acc >= 0.7) return 'Excellent. Both execution and time prediction are outstanding this week. Set more ambitious goals next week.';
      if (rate >= 0.6) return `${Math.round(rate * 100)}% completion is a good start. Improving time prediction accuracy will take you to the next level.`;
      return 'Practice completing small tasks this week. As you accumulate completions, your prediction accuracy will naturally improve.';
    },
    pctUnit: '%',
    noData: 'No task data this week',
    weekLabel: (start: Date) => {
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    },
  },
} as const;

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
  master:       '#D4A574',
};

const MASTERY_ORDER: MasteryLevel[] = ['beginner', 'intermediate', 'skilled', 'expert', 'master'];

// ──────────────────────────────────────────────────────────────────────────────
// KPI 카드
// ──────────────────────────────────────────────────────────────────────────────

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex-1 rounded-xl p-3 text-center" style={{ background: '#1E1C1A', border: '1px solid #2A2624' }}>
      <p className="text-xs text-stone-500 mb-1">{label}</p>
      <p className="text-lg font-semibold" style={{ color }}>{value}</p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 컴포넌트
// ──────────────────────────────────────────────────────────────────────────────

export default function WorkSprintHome() {
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const queryClient = useQueryClient();
  const [newGoal, setNewGoal] = useState('');

  const weekStart = getWeekStart();
  const weekStartStr = weekStart.toISOString().split('T')[0];

  // 이번 주 태스크
  const { data: tasks = [] } = useQuery<WorkTask[]>({
    queryKey: ['work_tasks_week', user?.id, weekStartStr],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await veilorDb
        .from('work_tasks' as never)
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', weekStart.toISOString());
      return (data ?? []) as WorkTask[];
    },
    enabled: !!user,
  });

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
      await veilorDb.from('work_sprints' as never).upsert({
        user_id: user.id,
        week_start: weekStartStr,
        goals,
      }, { onConflict: 'user_id,week_start' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['work_sprint', user?.id, weekStartStr] }),
  });

  // 지표 계산
  const doneTasks = tasks.filter(t => t.status === 'done');
  const completionRate = tasks.length ? doneTasks.length / tasks.length : 0;

  const accuracyScores = doneTasks
    .filter(t => t.estimated_minutes && t.actual_minutes)
    .map(t => calcAccuracy(t.estimated_minutes!, t.actual_minutes!));
  const avgAccuracy = accuracyScores.length
    ? accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length
    : 0;

  const completionPower = calcCompletionPower(tasks);
  const { highEnergyCompletionRate, lowEnergyCompletionRate } = calcMentalPerformanceCorrelation(tasks);

  const masteryLevel = calcMasteryLevel(completionRate, avgAccuracy, 0);
  const masteryIdx = MASTERY_ORDER.indexOf(masteryLevel);
  const masteryColor = MASTERY_COLORS[masteryLevel];

  const goals: { title: string; done: boolean }[] = sprint?.goals ?? [];

  function handleAddGoal() {
    if (!newGoal.trim() || goals.length >= 3) return;
    upsertSprint.mutate([...goals, { title: newGoal.trim(), done: false }]);
    setNewGoal('');
  }

  function toggleGoal(idx: number) {
    const updated = goals.map((g, i) => i === idx ? { ...g, done: !g.done } : g);
    upsertSprint.mutate(updated);
  }

  return (
    <div className="min-h-screen bg-[#1C1917] px-4 py-6 max-w-sm mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <p className="text-xs text-stone-500 mb-1">{s.weekLabel(weekStart)}</p>
        <h1 className="text-xl font-semibold text-stone-100">{s.header}</h1>
      </div>

      {tasks.length === 0 ? (
        <p className="text-center text-stone-600 text-sm py-8">{s.noData}</p>
      ) : (
        <>
          {/* 메타인지 레벨 */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: '#252220', border: '1px solid #2A2624' }}>
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
            <p className="text-base font-semibold" style={{ color: masteryColor }}>
              {s.mastery[masteryLevel]}
            </p>
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
          <div className="rounded-2xl p-4 mb-4" style={{ background: '#252220', border: '1px solid #2A2624' }}>
            <p className="text-xs text-stone-500 mb-3">{s.mentalTitle}</p>
            <div className="space-y-2">
              {[
                { label: s.highEnergy, value: highEnergyCompletionRate, color: '#38bdf8' },
                { label: s.lowEnergy,  value: lowEnergyCompletionRate,  color: '#f43f5e' },
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
              {s.mentalInsight(highEnergyCompletionRate, lowEnergyCompletionRate)}
            </p>
          </div>
        </>
      )}

      {/* 주간 목표 */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: '#252220', border: '1px solid #2A2624' }}>
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
              onChange={e => setNewGoal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddGoal()}
              placeholder={s.addGoalPlaceholder}
              className="flex-1 rounded-xl px-3 py-2 text-sm text-stone-200 placeholder-stone-600 outline-none"
              style={{ background: '#1C1917', border: '1px solid #2A2624' }}
            />
            <button
              onClick={handleAddGoal}
              disabled={!newGoal.trim()}
              className="rounded-xl px-3 py-2 text-xs font-medium text-stone-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 transition-colors"
            >
              {s.addGoal}
            </button>
          </div>
        )}
      </div>

      {/* Amber 주간 코칭 */}
      <div className="rounded-2xl p-4 flex gap-3 items-start" style={{ background: '#1E1C1A', border: '1px solid #2A2624' }}>
        <span className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5" style={{ background: '#D4A574' }} />
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
