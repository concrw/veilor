// 클리어 모드 홈 — 멘탈 대시보드
// "지금 어디쯤 와 있는지 한눈에. 다음에 뭘 하면 되는지 자동으로."
//
// ZONE A: 헤더
// ZONE B: 관계 건강도 (빈도40 + 기분평균40 + 스트릭20)
// ZONE C: 오늘 체크인 (슬라이더 + 활동 탭) → clear_checkin 저장
// ZONE D: 이번 주 바차트 + 활동-감정 인사이트 1줄
// ZONE E: Daily Challenge (Adaptive — 점수 3구간)

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  getChallengeByScore,
  isChallengeCompletedToday,
  markChallengeCompleted,
} from '@/data/challengeConstants';
import EmotionWheel, { type EmotionScore } from '@/components/charts/EmotionWheel';

// ─────────────────────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────────────────────

interface ClearCheckin {
  mood_score: number;
  activities: string[];
  checked_at: string;
}

interface WeeklySession {
  created_at: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────────────────────────────────────

const CHECKIN_DATE_KEY = 'veilor_clear_last_checkin';
const ACTIVITY_OPTIONS = ['관계', '일', '운동', '혼자', '휴식', '공부'] as const;
type Activity = typeof ACTIVITY_OPTIONS[number];

function hasClearCheckinToday(): boolean {
  try {
    return localStorage.getItem(CHECKIN_DATE_KEY) === new Date().toISOString().split('T')[0];
  } catch {
    return false;
  }
}

function markClearCheckinToday(): void {
  try {
    localStorage.setItem(CHECKIN_DATE_KEY, new Date().toISOString().split('T')[0]);
  } catch {
    // silent
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONE B — 관계 건강도
// ─────────────────────────────────────────────────────────────────────────────

function calcHealthScore({
  weekCount,
  moodAvg,       // 1~10
  streakCount,
}: {
  weekCount: number;
  moodAvg: number;
  streakCount: number;
}): number {
  const freqScore  = Math.min(weekCount / 7, 1) * 40;
  const moodScore  = Math.min(moodAvg / 10, 1) * 40;
  const streakScore = Math.min(streakCount / 30, 1) * 20;
  return Math.round(freqScore + moodScore + streakScore);
}

function ScoreDots({ score }: { score: number }) {
  // 0~100 → 0~5 dots
  const filled = Math.round((score / 100) * 5);
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full transition-colors duration-500"
          style={{ background: i < filled ? '#4AAEFF' : '#1e2a38' }}
        />
      ))}
    </div>
  );
}

function HealthScoreCard({
  score,
  weekCount,
}: {
  score: number;
  weekCount: number;
}) {
  const weekGoal = 5;
  const progress = Math.min(weekCount / weekGoal, 1);

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: '#111318', borderColor: '#4AAEFF22' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500 mb-1">관계 건강도</p>
          <div className="flex items-end gap-2">
            <span className="text-[32px] font-bold tabular-nums leading-none" style={{ color: '#4AAEFF' }}>
              {score}
            </span>
            <span className="text-sm text-slate-500 mb-0.5">점</span>
          </div>
        </div>
        <ScoreDots score={score} />
      </div>

      {/* 주간 목표 진행 바 */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] text-slate-500">이번 주 기록</span>
          <span className="text-[11px] text-slate-400">
            {weekCount}/{weekGoal}
          </span>
        </div>
        <div className="w-full rounded-full h-1.5" style={{ background: '#1e2a38' }}>
          <div
            className="h-1.5 rounded-full transition-all duration-700"
            style={{
              width: `${progress * 100}%`,
              background: progress >= 1 ? '#34C48B' : '#4AAEFF',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONE C — 오늘 체크인
// ─────────────────────────────────────────────────────────────────────────────

function CheckinCard({
  onComplete,
}: {
  onComplete: (moodScore: number, activities: Activity[]) => void;
}) {
  const [moodScore, setMoodScore] = useState(5);
  const [selected, setSelected] = useState<Activity[]>([]);
  const [saving, setSaving] = useState(false);

  function toggleActivity(a: Activity) {
    setSelected(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  }

  function moodLabel(v: number): string {
    if (v <= 2) return '많이 힘들어';
    if (v <= 4) return '조금 힘들어';
    if (v <= 6) return '보통이야';
    if (v <= 8) return '꽤 좋아';
    return '아주 좋아';
  }

  async function handleSave() {
    setSaving(true);
    await onComplete(moodScore, selected);
    setSaving(false);
  }

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: '#111318', borderColor: '#4AAEFF22' }}
    >
      <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500 mb-4">
        오늘 상태 · 약 10초
      </p>

      {/* 슬라이더 */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-200">{moodLabel(moodScore)}</span>
          <span className="text-sm tabular-nums font-bold" style={{ color: '#4AAEFF' }}>
            {moodScore}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={moodScore}
          onChange={e => setMoodScore(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #4AAEFF ${(moodScore - 1) / 9 * 100}%, #1e2a38 ${(moodScore - 1) / 9 * 100}%)`,
            accentColor: '#4AAEFF',
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-600">힘들어</span>
          <span className="text-[10px] text-slate-600">좋아</span>
        </div>
      </div>

      {/* 활동 탭 */}
      <div className="flex flex-wrap gap-2 mb-5">
        {ACTIVITY_OPTIONS.map(a => (
          <button
            key={a}
            onClick={() => toggleActivity(a)}
            className={[
              'text-xs px-3 py-1.5 rounded-full border transition-all',
              selected.includes(a)
                ? 'text-sky-300 border-sky-400/60 bg-sky-400/10'
                : 'text-slate-500 border-slate-700 hover:border-slate-600',
            ].join(' ')}
          >
            {a}
          </button>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-2xl font-semibold text-sm transition-colors disabled:opacity-50"
        style={{ background: '#4AAEFF', color: '#0D1117' }}
      >
        {saving ? '저장 중...' : '기록하기'}
      </button>
    </div>
  );
}

function CheckinDoneCard({
  moodScore,
  activities,
}: {
  moodScore: number;
  activities: Activity[];
}) {
  return (
    <div
      className="rounded-2xl border p-4 flex items-center justify-between"
      style={{ background: '#111318', borderColor: '#34C48B22' }}
    >
      <div>
        <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500 mb-0.5">오늘 상태</p>
        <p className="text-sm text-slate-200">
          <span className="font-semibold tabular-nums" style={{ color: '#4AAEFF' }}>{moodScore}</span>
          <span className="text-slate-500 mx-1">·</span>
          <span className="text-slate-400">{activities.length > 0 ? activities.join(', ') : '기록 완료'}</span>
        </p>
      </div>
      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: '#34C48B', background: '#34C48B15' }}>
        ✓ 완료
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONE D — 이번 주 바차트 + 인사이트
// ─────────────────────────────────────────────────────────────────────────────

function WeekBar({ count, max, day, active }: { count: number; max: number; day: string; active: boolean }) {
  const height = max > 0 ? Math.round((count / max) * 44) : 0;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="h-11 flex items-end">
        <div
          className="w-6 rounded-t transition-all duration-700"
          style={{
            height: `${Math.max(height, count > 0 ? 4 : 0)}px`,
            background: active ? '#4AAEFF' : count > 0 ? '#4AAEFF55' : '#1e2a38',
          }}
        />
      </div>
      <span className={`text-[10px] ${active ? 'text-sky-400' : 'text-slate-600'}`}>{day}</span>
    </div>
  );
}

function WeekSnapshotCard({
  weekBars,
  checkins,
}: {
  weekBars: { date: string; count: number; day: string; isToday: boolean }[];
  checkins: ClearCheckin[];
}) {
  const maxCount = Math.max(...weekBars.map(b => b.count), 1);

  // 활동-감정 인사이트: 가장 빈도 높은 활동 + 해당 날 평균 mood vs 전체 평균
  const insightText = (() => {
    if (checkins.length < 2) return null;

    const overall = checkins.reduce((s, c) => s + c.mood_score, 0) / checkins.length;

    const activityMoods: Record<string, number[]> = {};
    checkins.forEach(c => {
      c.activities.forEach(a => {
        if (!activityMoods[a]) activityMoods[a] = [];
        activityMoods[a].push(c.mood_score);
      });
    });

    let bestActivity = '';
    let bestDiff = 0;
    Object.entries(activityMoods).forEach(([act, scores]) => {
      if (scores.length < 1) return;
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
      const diff = avg - overall;
      if (Math.abs(diff) > Math.abs(bestDiff)) {
        bestActivity = act;
        bestDiff = diff;
      }
    });

    if (!bestActivity || Math.abs(bestDiff) < 0.5) return null;

    const direction = bestDiff > 0 ? '기분이 더 좋았어요' : '기분이 조금 낮았어요';
    const diffStr = Math.abs(bestDiff).toFixed(1);
    return `${bestActivity}한 날 평균보다 ${diffStr}점 ${direction}`;
  })();

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: '#111318', borderColor: '#4AAEFF22' }}
    >
      <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500 mb-4">이번 주</p>
      <div className="flex justify-between items-end mb-4">
        {weekBars.map(bar => (
          <WeekBar
            key={bar.date}
            count={bar.count}
            max={maxCount}
            day={bar.day}
            active={bar.isToday}
          />
        ))}
      </div>
      {insightText && (
        <p className="text-xs text-slate-400 border-t pt-3" style={{ borderColor: '#1e2a38' }}>
          📊 {insightText}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONE E — Daily Challenge
// ─────────────────────────────────────────────────────────────────────────────

function ChallengeCard({ score }: { score: number }) {
  const [done, setDone] = useState(isChallengeCompletedToday);
  const challenge = getChallengeByScore(score);

  function handleDone() {
    markChallengeCompleted();
    setDone(true);
  }

  const categoryColor: Record<string, string> = {
    관계: '#4AAEFF',
    자기이해: '#A78BFA',
    회복: '#34C48B',
    행동: '#F59E0B',
  };
  const color = categoryColor[challenge.category] ?? '#4AAEFF';

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: '#111318', borderColor: `${color}22` }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500">오늘의 챌린지</p>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full"
          style={{ color, background: `${color}15` }}
        >
          {challenge.category}
        </span>
      </div>

      <p className="text-sm font-medium text-slate-200 leading-relaxed mb-4">
        "{challenge.text}"
      </p>

      {done ? (
        <div
          className="w-full py-2.5 rounded-xl text-center text-sm font-medium"
          style={{ color: '#34C48B', background: '#34C48B12' }}
        >
          ✓ 해봤어요
        </div>
      ) : (
        <button
          onClick={handleDone}
          className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}
        >
          해봤어요
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 낮은 점수 회복 카드 (score < 40)
// ─────────────────────────────────────────────────────────────────────────────

function RecoveryCard() {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: '#111318', borderColor: '#34C48B22' }}
    >
      <p className="text-sm font-medium text-slate-200 mb-1">오늘은 조금 힘든 날인가요?</p>
      <p className="text-xs text-slate-500 leading-relaxed">
        쉬어도 괜찮아요. 기록하는 것만으로도 충분해요.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONE F — SexSelf 인사이트 패널
// 조건: cq_responses에 'sexself_profile' 키 존재 여부로 진단 완료 판단
// ─────────────────────────────────────────────────────────────────────────────

const SEXSELF_PROFILE_LABELS: Record<string, string> = {
  OPEN_EXPRESSIVE: '열린 표현형',
  RESPONSIVE: '반응형',
  SUPPRESSED: '억제형',
  DORMANT: '휴면형',
  SHAME_BLOCKED: '수치 차단형',
  SAFETY_SEEKING: '안전 추구형',
  EXPLORING: '탐색형',
  BUILDING_AWARENESS: '인식 형성 중',
  ANXIETY_FROZEN: '욕구 동결',
};

const SEXSELF_PROFILE_COLORS: Record<string, string> = {
  OPEN_EXPRESSIVE: '#10b981',
  RESPONSIVE: '#3b82f6',
  SUPPRESSED: '#f59e0b',
  DORMANT: '#6b7280',
  SHAME_BLOCKED: '#ef4444',
  SAFETY_SEEKING: '#8b5cf6',
  EXPLORING: '#06b6d4',
  BUILDING_AWARENESS: '#64748b',
  ANXIETY_FROZEN: '#6366f1',
};

function SexAxisBar({ label, value }: { label: string; value: number }) {
  // value: -1.0 ~ +1.0 → 0%~100% 시각화
  const pct = Math.round((value + 1) / 2 * 100);
  const color = value >= 0 ? '#f59e0b' : '#3b82f6';
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] w-16 text-right shrink-0" style={{ color: '#64748b' }}>
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: '#1e2a38' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-[10px] w-7 text-right" style={{ color }}>{value >= 0 ? '+' : ''}{value}</span>
    </div>
  );
}

function SexSelfInsightPanel({
  data,
  onNavigate,
}: {
  data: Record<string, string> | null | undefined;
  onNavigate: (path: string) => void;
}) {
  // 미진단: CTA
  if (!data || !data.sexself_profile) {
    return (
      <div
        className="rounded-2xl border p-5 flex items-center justify-between"
        style={{ background: '#111318', borderColor: '#ec489922' }}
      >
        <div>
          <p className="text-sm font-medium mb-0.5" style={{ color: '#e2e8f0' }}>성적 자아 탐색하기</p>
          <p className="text-xs" style={{ color: '#64748b' }}>나의 성적 자아를 발견해 보세요</p>
        </div>
        <button
          onClick={() => onNavigate('/home/sexself/questions')}
          className="text-xs font-medium px-3 py-1.5 rounded-lg"
          style={{ background: '#ec489922', color: '#ec4899' }}
        >
          시작 →
        </button>
      </div>
    );
  }

  const profile = data.sexself_profile;
  const profileColor = SEXSELF_PROFILE_COLORS[profile] ?? '#64748b';
  const profileLabel = SEXSELF_PROFILE_LABELS[profile] ?? profile;
  const isAnxietyFrozen = profile === 'ANXIETY_FROZEN';

  // ANXIETY_FROZEN: 안전 메시지만 표시
  if (isAnxietyFrozen) {
    return (
      <div
        className="rounded-2xl border p-5"
        style={{ background: '#111318', borderColor: '#6366f122' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: '#6366f122', color: '#6366f1' }}
          >
            성적 자아
          </span>
          <span className="text-xs font-medium" style={{ color: '#6366f1' }}>{profileLabel}</span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
          지금 이 상태도 자연스러운 보호 반응이에요. 준비가 될 때 천천히 탐색해도 괜찮습니다.
        </p>
      </div>
    );
  }

  const leading = parseFloat(data.sexself_sex_leading ?? '0');
  const expressiveness = parseFloat(data.sexself_sex_expressiveness ?? '0');
  const intensity = parseFloat(data.sexself_sex_intensity ?? '0');
  const roleLabel = data.sexself_kink_role ?? '';
  const intensityLabel = data.sexself_kink_intensity ?? '';

  return (
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: '#111318', borderColor: `${profileColor}22` }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: `${profileColor}22`, color: profileColor }}
          >
            성적 자아
          </span>
          <span className="text-xs font-medium" style={{ color: profileColor }}>
            {profileLabel}
          </span>
        </div>
        <button
          onClick={() => onNavigate('/home/sexself/questions')}
          className="text-[10px]"
          style={{ color: '#64748b' }}
        >
          자세히 →
        </button>
      </div>

      {/* SEX 3축 바 */}
      <div className="space-y-1.5">
        <SexAxisBar label="주도/복종" value={Math.round(leading * 100) / 100} />
        <SexAxisBar label="표현/억제" value={Math.round(expressiveness * 100) / 100} />
        <SexAxisBar label="강도" value={Math.round(intensity * 100) / 100} />
      </div>

      {/* 역할 + 강도 레이블 */}
      {(roleLabel || intensityLabel) && (
        <div className="flex gap-2">
          {roleLabel && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-full border"
              style={{ color: '#94a3b8', borderColor: '#1e2a38' }}
            >
              {roleLabel}
            </span>
          )}
          {intensityLabel && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-full border"
              style={{ color: '#94a3b8', borderColor: '#1e2a38' }}
            >
              {intensityLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────────────────────────────

export default function ClearHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [checkedToday, setCheckedToday] = useState(hasClearCheckinToday);
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [todayActivities, setTodayActivities] = useState<Activity[]>([]);

  // 이번 주 세션 (vent + clear_checkin 모두)
  const { data: weekSessions = [] } = useQuery<WeeklySession[]>({
    queryKey: ['clear_week_sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
      weekAgo.setHours(0, 0, 0, 0);
      const { data } = await veilorDb
        .from('tab_conversations')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString());
      return (data ?? []) as WeeklySession[];
    },
    enabled: !!user,
  });

  // 최근 clear_checkin 기록 (기분 평균 + 활동 인사이트용)
  const { data: clearCheckins = [] } = useQuery<ClearCheckin[]>({
    queryKey: ['clear_checkins', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await veilorDb
        .from('tab_conversations')
        .select('content')
        .eq('user_id', user.id)
        .eq('tab', 'clear_checkin')
        .order('created_at', { ascending: false })
        .limit(30);
      return (data ?? [])
        .map(row => {
          try { return JSON.parse(row.content ?? '{}') as ClearCheckin; }
          catch { return null; }
        })
        .filter((x): x is ClearCheckin => x !== null && typeof x.mood_score === 'number');
    },
    enabled: !!user,
  });

  // 프로필 (streak_count)
  const { data: profile } = useQuery({
    queryKey: ['clear_profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await veilorDb
        .from('user_profiles')
        .select('nickname, streak_count')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // ── 주간 바 데이터 ──────────────────────────────────────────────────────────

  const today = new Date();
  const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

  const weekBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const count = weekSessions.filter(s =>
      (s.created_at ?? '').startsWith(dateStr)
    ).length;
    return { date: dateStr, count, day: DAY_LABELS[d.getDay()], isToday: i === 6 };
  });

  const weekCount = weekBars.reduce((s, b) => s + b.count, 0);

  // ── 관계 건강도 ─────────────────────────────────────────────────────────────

  const moodAvg = clearCheckins.length > 0
    ? clearCheckins.slice(0, 7).reduce((s, c) => s + c.mood_score, 0) /
      Math.min(clearCheckins.length, 7)
    : 5;

  const healthScore = calcHealthScore({
    weekCount,
    moodAvg,
    streakCount: profile?.streak_count ?? 0,
  });

  // ── 체크인 저장 ─────────────────────────────────────────────────────────────

  const handleCheckinComplete = useCallback(
    async (moodScore: number, activities: Activity[]) => {
      if (!user) return;

      const payload: ClearCheckin = {
        mood_score: moodScore,
        activities,
        checked_at: new Date().toISOString(),
      };

      await veilorDb.from('tab_conversations').insert({
        user_id: user.id,
        tab: 'clear_checkin',
        stage: 'daily',
        role: 'user',
        content: JSON.stringify(payload),
      });

      markClearCheckinToday();
      setCheckedToday(true);
      setTodayMood(moodScore);
      setTodayActivities(activities);

      // 쿼리 무효화 → 점수 즉시 재계산
      queryClient.invalidateQueries({ queryKey: ['clear_checkins', user.id] });
      queryClient.invalidateQueries({ queryKey: ['clear_week_sessions', user.id] });
    },
    [user, queryClient],
  );

  // ── 최근 감정 분포 (EmotionWheel용) ────────────────────────────────────────
  const { data: emotionScores } = useQuery({
    queryKey: ['emotion_scores_recent', user?.id],
    queryFn: async (): Promise<EmotionScore[]> => {
      if (!user) return [];
      const { data } = await veilorDb
        .from('emotion_scores' as never)
        .select('top_emotions')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (!data?.length) return [];
      // 최근 5개 감정 결과를 합산 평균
      const totals: Record<string, number> = {};
      const counts: Record<string, number> = {};
      for (const row of data as Array<{ top_emotions: Array<{ label: string; score: number }> }>) {
        for (const { label, score } of row.top_emotions ?? []) {
          totals[label] = (totals[label] ?? 0) + score;
          counts[label] = (counts[label] ?? 0) + 1;
        }
      }
      return Object.entries(totals).map(([emotion, total]) => ({
        emotion,
        score: total / counts[emotion],
      }));
    },
    enabled: !!user,
  });

  // ── SexSelf 진단 결과 (ZONE F용) ───────────────────────────────────────────
  const { data: sexSelfData } = useQuery({
    queryKey: ['clear_sexself', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await veilorDb
        .from('cq_responses')
        .select('question_key, response_value')
        .eq('user_id', user.id)
        .in('question_key', [
          'sexself_profile',
          'sexself_sex_leading',
          'sexself_sex_expressiveness',
          'sexself_sex_intensity',
          'sexself_kink_role',
          'sexself_kink_intensity',
        ]);
      if (!data || data.length === 0) return null;
      return Object.fromEntries(
        data.map(r => [r.question_key, r.response_value])
      ) as Record<string, string>;
    },
    enabled: !!user,
  });

  // ── Adaptive 조건 ────────────────────────────────────────────────────────────
  // 체크인 여부 + 점수 3구간으로 ZONE C/E 분기

  const showRecovery = checkedToday && healthScore < 40;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div id="main-content" className="min-h-screen pb-24 px-4 pt-8" style={{ background: '#0D1117' }}>

      {/* ZONE A — 헤더 */}
      <div className="mb-6">
        <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500 mb-1">CLEAR</p>
        <h1 className="text-lg font-semibold text-slate-100">
          {profile?.nickname ? `${profile.nickname}님의 대시보드` : '나의 대시보드'}
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          {today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {/* ZONE B — 관계 건강도 */}
      <div className="mb-3">
        <HealthScoreCard score={healthScore} weekCount={weekCount} />
      </div>

      {/* ZONE C — 오늘 체크인 / 낮은 점수 회복 카드 */}
      <div className="mb-3">
        {showRecovery ? (
          <RecoveryCard />
        ) : checkedToday ? (
          <CheckinDoneCard
            moodScore={todayMood ?? clearCheckins[0]?.mood_score ?? 5}
            activities={todayActivities.length > 0 ? todayActivities : (clearCheckins[0]?.activities as Activity[] ?? [])}
          />
        ) : (
          <CheckinCard onComplete={handleCheckinComplete} />
        )}
      </div>

      {/* ZONE D — 이번 주 스냅샷 */}
      <div className="mb-3">
        <WeekSnapshotCard weekBars={weekBars} checkins={clearCheckins} />
      </div>

      {/* ZONE D-2 — 감정 분포 휠 */}
      {emotionScores && emotionScores.length > 0 && (
        <div className="mb-3 rounded-2xl border p-5" style={{ background: '#111318', borderColor: '#4AAEFF22' }}>
          <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500 mb-4">감정 분포</p>
          <div className="flex justify-center">
            <EmotionWheel scores={emotionScores} size={220} />
          </div>
        </div>
      )}

      {/* ZONE E — Daily Challenge */}
      <div className="mb-3">
        <ChallengeCard score={healthScore} />
      </div>

      {/* ZONE F — SexSelf 인사이트 패널 */}
      <div className="mb-3">
        <SexSelfInsightPanel data={sexSelfData} onNavigate={navigate} />
      </div>

      {/* 추가 네비게이션 — 탭 바로가기 */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {[
          { label: '패턴 탐색', path: '/home/dig', color: '#A78BFA' },
          { label: '성장 확인', path: '/home/get', color: '#34C48B' },
        ].map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="rounded-2xl border py-3 text-sm font-medium transition-all"
            style={{
              background: '#111318',
              borderColor: `${item.color}22`,
              color: item.color,
            }}
          >
            {item.label} →
          </button>
        ))}
      </div>
    </div>
  );
}
