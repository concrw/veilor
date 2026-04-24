import { useTranslation } from '@/hooks/useTranslation';
import type { ClearCheckin } from './clearHomeTypes';

interface WeekBar {
  date: string;
  count: number;
  day: string;
  isToday: boolean;
}

function WeekBarItem({ count, max, day, active }: { count: number; max: number; day: string; active: boolean }) {
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

interface WeekSnapshotCardProps {
  weekBars: WeekBar[];
  checkins: ClearCheckin[];
}

export function WeekSnapshotCard({ weekBars, checkins }: WeekSnapshotCardProps) {
  const { translations: tr } = useTranslation();
  const c = tr.clear;
  const maxCount = Math.max(...weekBars.map(b => b.count), 1);

  const insightText = (() => {
    if (checkins.length < 2) return null;
    const overall = checkins.reduce((s, ch) => s + ch.mood_score, 0) / checkins.length;
    const activityMoods: Record<string, number[]> = {};
    checkins.forEach(ch => {
      ch.activities.forEach(a => {
        if (!activityMoods[a]) activityMoods[a] = [];
        activityMoods[a].push(ch.mood_score);
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
    const direction = bestDiff > 0 ? c.insightBetter : c.insightWorse;
    return c.insightFmt
      .replace('{activity}', bestActivity)
      .replace('{diff}', Math.abs(bestDiff).toFixed(1))
      .replace('{direction}', direction);
  })();

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: '#111318', borderColor: '#4AAEFF22' }}
    >
      <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500 mb-4">
        {c.weekSnapshot}
      </p>
      <div className="flex justify-between items-end mb-4">
        {weekBars.map(bar => (
          <WeekBarItem
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
          {insightText}
        </p>
      )}
    </div>
  );
}
