import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import EmotionWheel from '@/components/charts/EmotionWheel';
import { HealthScoreCard } from '@/components/clear/HealthScoreCard';
import { CheckinCard, CheckinDoneCard } from '@/components/clear/CheckinCard';
import { WeekSnapshotCard } from '@/components/clear/WeekSnapshotCard';
import { ChallengeCard, RecoveryCard } from '@/components/clear/ChallengeCard';
import { SexSelfInsightPanel } from '@/components/clear/SexSelfInsightPanel';
import { useClearHomeData } from '@/components/clear/useClearHomeData';
import type { ActivityKey } from '@/components/clear/clearHomeTypes';

export default function ClearHome() {
  const navigate = useNavigate();
  const { translations: tr } = useTranslation();
  const c = tr.clear;

  const {
    today,
    profile,
    weekBars,
    weekCount,
    healthScore,
    clearCheckins,
    emotionScores,
    sexSelfData,
    checkedToday,
    todayMood,
    todayActivities,
    handleCheckinComplete,
  } = useClearHomeData();

  const showRecovery = checkedToday && healthScore < 40;

  const navItems = [
    { label: c.navPatterns, path: '/home/dig', color: '#A78BFA' },
    { label: c.navGrowth, path: '/home/get', color: '#34C48B' },
  ];

  return (
    <div id="main-content" className="min-h-screen pb-24 px-4 pt-8" style={{ background: '#0D1117' }}>

      <div className="mb-6">
        <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500 mb-1">CLEAR</p>
        <h1 className="text-lg font-semibold text-slate-100">
          {profile?.nickname ? `${profile.nickname}님의 ${c.dashboard}` : c.dashboard}
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          {today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      <div className="mb-3">
        <HealthScoreCard score={healthScore} weekCount={weekCount} />
      </div>

      <div className="mb-3">
        {showRecovery ? (
          <RecoveryCard />
        ) : checkedToday ? (
          <CheckinDoneCard
            moodScore={todayMood ?? clearCheckins[0]?.mood_score ?? 5}
            activities={
              todayActivities.length > 0
                ? todayActivities
                : (clearCheckins[0]?.activities as ActivityKey[] ?? [])
            }
          />
        ) : (
          <CheckinCard onComplete={handleCheckinComplete} />
        )}
      </div>

      <div className="mb-3">
        <WeekSnapshotCard weekBars={weekBars} checkins={clearCheckins} />
      </div>

      {emotionScores && emotionScores.length > 0 && (
        <div
          className="mb-3 rounded-2xl border p-5"
          style={{ background: '#111318', borderColor: '#4AAEFF22' }}
        >
          <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500 mb-4">감정 분포</p>
          <div className="flex justify-center">
            <EmotionWheel scores={emotionScores} size={220} />
          </div>
        </div>
      )}

      <div className="mb-3">
        <ChallengeCard score={healthScore} />
      </div>

      <div className="mb-3">
        <SexSelfInsightPanel data={sexSelfData} onNavigate={navigate} />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="rounded-2xl border py-3 text-sm font-medium transition-all"
            style={{ background: '#111318', borderColor: `${item.color}22`, color: item.color }}
          >
            {item.label} →
          </button>
        ))}
      </div>
    </div>
  );
}
