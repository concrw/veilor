import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { getChallengeByScore, isChallengeCompletedToday, markChallengeCompleted } from '@/data/challengeConstants';

// category 값은 DB/데이터 상수에서 오는 코드값이므로 색상 매핑만 유지
const CATEGORY_COLORS: Record<string, string> = {
  관계: '#4AAEFF',
  자기이해: '#A78BFA',
  회복: '#34C48B',
  행동: '#F59E0B',
};

export function ChallengeCard({ score }: { score: number }) {
  const { translations: tr } = useTranslation();
  const c = tr.clear;
  const [done, setDone] = useState(isChallengeCompletedToday);
  const challenge = getChallengeByScore(score);
  const color = CATEGORY_COLORS[challenge.category] ?? '#4AAEFF';

  function handleDone() {
    markChallengeCompleted();
    setDone(true);
  }

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: '#111318', borderColor: `${color}22` }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500">
          {c.todayChallenge}
        </p>
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
          ✓ {c.challengeDone}
        </div>
      ) : (
        <button
          onClick={handleDone}
          className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}
        >
          {c.challengeTryIt}
        </button>
      )}
    </div>
  );
}

export function RecoveryCard() {
  const { translations: tr } = useTranslation();
  const c = tr.clear;
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: '#111318', borderColor: '#34C48B22' }}
    >
      <p className="text-sm font-medium text-slate-200 mb-1">{c.recoveryTitle}</p>
      <p className="text-xs text-slate-500 leading-relaxed">{c.recoveryDesc}</p>
    </div>
  );
}
