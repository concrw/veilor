// 클리어 모드 홈 — 멘탈 대시보드
// "지금 어디쯤 와 있는지 한눈에"
// 오늘의 할 것 카드 + 이번 주 체크인 흐름 + 주요 지표 요약
// 디자인 토큰: cool dark (#111318), clear blue (#4AAEFF), mint (#34C48B)

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// ──────────────────────────────────────────────────────────────────────────────
// 타입
// ──────────────────────────────────────────────────────────────────────────────

interface WeeklyCheckin {
  id: string;
  content: string | null;
  created_at: string | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// 주간 바 차트 (Recharts 없이 SVG/CSS)
// ──────────────────────────────────────────────────────────────────────────────

function WeekBar({ count, max, day, active }: { count: number; max: number; day: string; active: boolean }) {
  const height = max > 0 ? Math.round((count / max) * 48) : 0;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="h-12 flex items-end">
        <div
          className="w-6 rounded-t transition-all duration-500"
          style={{
            height: `${height}px`,
            background: active ? '#4AAEFF' : count > 0 ? '#4AAEFF55' : '#1e2533',
          }}
        />
      </div>
      <span className={`text-[10px] ${active ? 'text-sky-400' : 'text-stone-600'}`}>{day}</span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 오늘의 할 것 항목
// ──────────────────────────────────────────────────────────────────────────────

const TODAY_TASKS = [
  { id: 'vent', label: '감정 털어놓기', tab: '/home/vent', icon: '💬' },
  { id: 'dig', label: '패턴 탐색하기', tab: '/home/dig', icon: '🔍' },
  { id: 'get', label: '성장 확인하기', tab: '/home/get', icon: '📈' },
];

function TodayCard({ sessionCount }: { sessionCount: number }) {
  const navigate = useNavigate();
  const done = Math.min(sessionCount, TODAY_TASKS.length);

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: '#111318', borderColor: '#4AAEFF22' }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs tracking-widest text-stone-500 uppercase">오늘의 할 것</p>
        <span className="text-xs font-medium text-sky-400">{done}/{TODAY_TASKS.length} 완료</span>
      </div>
      <div className="space-y-2.5">
        {TODAY_TASKS.map((task, i) => {
          const isDone = i < done;
          return (
            <button
              key={task.id}
              onClick={() => navigate(task.tab)}
              className={[
                'w-full flex items-center gap-3 py-2.5 px-3 rounded-xl border text-left transition-all',
                isDone
                  ? 'border-emerald-500/30 bg-emerald-500/5 opacity-70'
                  : 'border-sky-400/20 bg-sky-400/5 hover:bg-sky-400/10',
              ].join(' ')}
            >
              <span className="text-base">{task.icon}</span>
              <span className={`text-sm ${isDone ? 'line-through text-stone-500' : 'text-stone-200'}`}>
                {task.label}
              </span>
              {isDone && (
                <span className="ml-auto text-xs text-emerald-400">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 지표 카드
// ──────────────────────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div
      className="flex-1 rounded-2xl border p-4"
      style={{ background: '#111318', borderColor: `${color}22` }}
    >
      <p className="text-[10px] text-stone-500 mb-2">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] text-stone-500 mt-1">{sub}</p>}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 메인
// ──────────────────────────────────────────────────────────────────────────────

export default function ClearHome() {
  const { user } = useAuth();

  // 이번 주 체크인 (tab_conversations)
  const { data: weekData = [] } = useQuery<WeeklyCheckin[]>({
    queryKey: ['clear_week_checkins', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data } = await veilorDb
        .from('tab_conversations')
        .select('id, content, created_at')
        .eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: true });
      return (data ?? []) as WeeklyCheckin[];
    },
    enabled: !!user,
  });

  // 프로필
  const { data: profile } = useQuery({
    queryKey: ['clear_profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await veilorDb
        .from('user_profiles')
        .select('nickname, streak_count, axis_scores')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // 주간 바 데이터
  const today = new Date();
  const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

  const weekBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const count = weekData.filter((w) =>
      (w.created_at ?? '').startsWith(dateStr)
    ).length;
    return { date: dateStr, count, day: DAY_LABELS[d.getDay()], isToday: i === 6 };
  });

  const maxCount = Math.max(...weekBars.map((b) => b.count), 1);
  const totalThisWeek = weekBars.reduce((s, b) => s + b.count, 0);
  const sessionToday = weekBars[6].count;

  const axisScores = profile?.axis_scores as Record<string, number> | null;
  const avgScore = axisScores
    ? Math.round(
        Object.values(axisScores).reduce((a, b) => a + b, 0) /
          Math.max(Object.values(axisScores).length, 1)
      )
    : null;

  return (
    <div id="main-content" className="min-h-screen pb-24 px-4 py-8" style={{ background: '#0D1117' }}>
      {/* 헤더 */}
      <div className="mb-8">
        <p className="text-xs tracking-[0.25em] text-stone-500 uppercase mb-1">클리어</p>
        <h1 className="text-stone-100 text-lg font-semibold">
          {profile?.nickname ?? ''}님의 멘탈 대시보드
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {/* 지표 행 */}
      <div className="flex gap-3 mb-5">
        <MetricCard
          label="이번 주 기록"
          value={totalThisWeek}
          sub="세션"
          color="#4AAEFF"
        />
        <MetricCard
          label="스트릭"
          value={profile?.streak_count ?? 0}
          sub="일"
          color="#34C48B"
        />
        {avgScore !== null && (
          <MetricCard
            label="V-Score"
            value={avgScore}
            sub="평균"
            color="#A78BFA"
          />
        )}
      </div>

      {/* 오늘의 할 것 */}
      <div className="mb-5">
        <TodayCard sessionCount={sessionToday} />
      </div>

      {/* 이번 주 흐름 */}
      <div
        className="rounded-2xl border p-5 mb-5"
        style={{ background: '#111318', borderColor: '#4AAEFF22' }}
      >
        <p className="text-xs text-stone-500 mb-4">이번 주 세션 흐름</p>
        <div className="flex justify-between items-end">
          {weekBars.map((bar) => (
            <WeekBar
              key={bar.date}
              count={bar.count}
              max={maxCount}
              day={bar.day}
              active={bar.isToday}
            />
          ))}
        </div>
      </div>

      {/* V-Axis 스코어 */}
      {axisScores && Object.keys(axisScores).length > 0 && (
        <div
          className="rounded-2xl border p-5"
          style={{ background: '#111318', borderColor: '#4AAEFF22' }}
        >
          <p className="text-xs text-stone-500 mb-4">V-Axis 지표</p>
          <div className="space-y-3">
            {Object.entries(axisScores).slice(0, 5).map(([key, val]) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-stone-400">{key}</span>
                  <span className="text-xs font-medium text-sky-400">{val}</span>
                </div>
                <div className="w-full bg-stone-800 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min((val / 100) * 100, 100)}%`,
                      background: val >= 70 ? '#34C48B' : val >= 40 ? '#4AAEFF' : '#F59E0B',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
