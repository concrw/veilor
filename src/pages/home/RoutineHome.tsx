// 루틴 모드 홈
// 스트릭 배너 + 진행 링 + 오늘 체크인 CTA + 최근 7일 기록
// Daylio-style habit tracking with Veilor emotional layer

import { useState, useEffect, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { hasCheckedInToday } from '@/components/routine/RoutineCheckinModal';
import { ROUTINE_MILESTONES } from '@/data/routineConstants';

const RoutineCheckinModal = lazy(() => import('@/components/routine/RoutineCheckinModal'));

// ──────────────────────────────────────────────────────────────────────────────
// 타입
// ──────────────────────────────────────────────────────────────────────────────

interface CheckinRecord {
  mood_index: number;
  mood_label: string;
  energy_index: number;
  energy_label: string;
  activities: string[];
  checked_at: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// 진행 링 SVG
// ──────────────────────────────────────────────────────────────────────────────

function ProgressRing({
  streak,
  goal = 30,
}: {
  streak: number;
  goal?: number;
}) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(streak / goal, 1);
  const offset = circumference * (1 - progress);

  const isMilestone = (ROUTINE_MILESTONES as readonly number[]).includes(streak);
  const strokeColor = isMilestone ? '#F5C98A' : '#D4A574';

  return (
    <div className="relative flex items-center justify-center">
      <svg width={128} height={128} className="-rotate-90">
        {/* 트랙 */}
        <circle
          cx={64}
          cy={64}
          r={radius}
          fill="none"
          stroke="#292524"
          strokeWidth={8}
        />
        {/* 진행 */}
        <circle
          cx={64}
          cy={64}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* 중앙 텍스트 */}
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold ${isMilestone ? 'text-amber-200' : 'text-stone-100'}`}>
          {streak}
        </span>
        <span className="text-xs text-stone-500">일째</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 최근 7일 도트 그리드
// ──────────────────────────────────────────────────────────────────────────────

function WeekDots({ checkins }: { checkins: CheckinRecord[] }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const checkinDates = new Set(
    checkins.map((c) => c.checked_at.split('T')[0])
  );

  const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="flex justify-center gap-3">
      {days.map((date, i) => {
        const isChecked = checkinDates.has(date);
        const isToday = i === 6;
        const dayLabel = DAY_LABELS[new Date(date).getDay()];
        return (
          <div key={date} className="flex flex-col items-center gap-1.5">
            <div
              className={[
                'w-8 h-8 rounded-full border-2 transition-all',
                isChecked
                  ? 'bg-amber-400 border-amber-400'
                  : isToday
                  ? 'border-amber-400/50 bg-transparent'
                  : 'border-stone-700 bg-transparent',
              ].join(' ')}
            />
            <span className={`text-[10px] ${isToday ? 'text-amber-400' : 'text-stone-600'}`}>
              {dayLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────────────────────────────────────────

export default function RoutineHome() {
  const { user } = useAuth();
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkedToday, setCheckedToday] = useState(hasCheckedInToday());
  const [streak, setStreak] = useState(0);

  // 프로필 (streak_count)
  const { data: profile } = useQuery({
    queryKey: ['user_profile_streak', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await veilorDb
        .from('user_profiles')
        .select('streak_count, nickname')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // 최근 체크인 기록 (tab_conversations)
  const { data: checkins = [] } = useQuery<CheckinRecord[]>({
    queryKey: ['routine_checkins', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await veilorDb
        .from('tab_conversations')
        .select('content, created_at')
        .eq('user_id', user.id)
        .eq('tab', 'routine_checkin')
        .order('created_at', { ascending: false })
        .limit(30);
      return (data ?? []).map((row) => {
        try {
          return JSON.parse(row.content ?? '{}') as CheckinRecord;
        } catch {
          return null;
        }
      }).filter(Boolean) as CheckinRecord[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile?.streak_count !== undefined && profile.streak_count !== null) {
      setStreak(profile.streak_count);
    }
  }, [profile]);

  function handleCheckinComplete(newStreak: number) {
    setStreak(newStreak);
    setCheckedToday(true);
    setShowCheckin(false);
  }

  const nickname = profile?.nickname ?? '오늘도';
  const isMilestone = (ROUTINE_MILESTONES as readonly number[]).includes(streak);

  return (
    <div id="main-content" className="min-h-screen bg-[#1C1917] px-4 py-8 pb-24">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.25em] text-stone-500 uppercase mb-1">루틴</p>
        <h1 className="text-stone-200 text-lg font-semibold">
          {checkedToday
            ? `${nickname}님, 오늘도 기록했어요`
            : `${nickname}님, 오늘 체크인을 해볼까요?`}
        </h1>
      </div>

      {/* 진행 링 */}
      <div className="flex justify-center mb-2">
        <ProgressRing streak={streak} goal={30} />
      </div>

      {/* 마일스톤 배지 */}
      {isMilestone && (
        <div className="text-center mb-6">
          <span className="inline-block bg-amber-400/10 border border-amber-400/40 text-amber-300 text-xs px-3 py-1 rounded-full">
            🏆 {streak}일 마일스톤 달성!
          </span>
        </div>
      )}
      {!isMilestone && <div className="mb-6" />}

      {/* 7일 도트 */}
      <div className="bg-stone-900/50 border border-stone-700/40 rounded-2xl p-5 mb-5">
        <p className="text-xs text-stone-500 mb-4 text-center">최근 7일</p>
        <WeekDots checkins={checkins} />
      </div>

      {/* 다음 목표 */}
      <div className="bg-stone-900/50 border border-stone-700/40 rounded-2xl p-5 mb-6">
        <p className="text-xs text-stone-500 mb-1">다음 목표</p>
        <NextGoalBar streak={streak} />
      </div>

      {/* CTA */}
      {!checkedToday ? (
        <button
          onClick={() => setShowCheckin(true)}
          className="w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-stone-950 font-semibold text-sm py-4 rounded-2xl transition-colors shadow-lg"
        >
          오늘 체크인 — 30초
        </button>
      ) : (
        <div className="w-full bg-stone-800/60 border border-stone-700/40 text-stone-400 font-medium text-sm py-4 rounded-2xl text-center">
          ✓ 오늘 체크인 완료
        </div>
      )}

      {/* 체크인 모달 */}
      {showCheckin && (
        <Suspense fallback={null}>
          <RoutineCheckinModal
            onClose={() => setShowCheckin(false)}
            onComplete={handleCheckinComplete}
          />
        </Suspense>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 다음 목표 바
// ──────────────────────────────────────────────────────────────────────────────

const MILESTONES = ROUTINE_MILESTONES;

function NextGoalBar({ streak }: { streak: number }) {
  const nextMilestone = MILESTONES.find((m) => m > streak) ?? 100;
  const prevMilestone = MILESTONES.filter((m) => m <= streak).at(-1) ?? 0;
  const progress = (streak - prevMilestone) / (nextMilestone - prevMilestone);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-stone-400">{streak}일</span>
        <span className="text-xs text-amber-400 font-medium">{nextMilestone}일</span>
      </div>
      <div className="w-full bg-stone-800 rounded-full h-2">
        <div
          className="bg-amber-400 h-2 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>
      <p className="text-xs text-stone-500 mt-2 text-center">
        {nextMilestone - streak}일 남았어요
      </p>
    </div>
  );
}
