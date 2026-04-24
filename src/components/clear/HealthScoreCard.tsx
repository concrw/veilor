import { useTranslation } from '@/hooks/useTranslation';

function ScoreDots({ score }: { score: number }) {
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

interface HealthScoreCardProps {
  score: number;
  weekCount: number;
}

const WEEK_GOAL = 5;

export function HealthScoreCard({ score, weekCount }: HealthScoreCardProps) {
  const { translations: tr } = useTranslation();
  const c = tr.clear;
  const progress = Math.min(weekCount / WEEK_GOAL, 1);

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: '#111318', borderColor: '#4AAEFF22' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500 mb-1">
            {c.healthScore}
          </p>
          <div className="flex items-end gap-2">
            <span
              className="text-[32px] font-bold tabular-nums leading-none"
              style={{ color: '#4AAEFF' }}
            >
              {score}
            </span>
            <span className="text-sm text-slate-500 mb-0.5">{c.scoreUnit}</span>
          </div>
        </div>
        <ScoreDots score={score} />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] text-slate-500">{c.weeklyRecord}</span>
          <span className="text-[11px] text-slate-400">
            {c.weekGoalFmt
              .replace('{current}', String(weekCount))
              .replace('{goal}', String(WEEK_GOAL))}
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
