import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { ACTIVITY_KEYS, type ActivityKey } from './clearHomeTypes';

interface CheckinCardProps {
  onComplete: (moodScore: number, activities: ActivityKey[]) => void;
}

function getMoodLabel(
  v: number,
  labels: { veryBad: string; bad: string; normal: string; good: string; veryGood: string },
): string {
  if (v <= 2) return labels.veryBad;
  if (v <= 4) return labels.bad;
  if (v <= 6) return labels.normal;
  if (v <= 8) return labels.good;
  return labels.veryGood;
}

export function CheckinCard({ onComplete }: CheckinCardProps) {
  const { translations: tr } = useTranslation();
  const c = tr.clear;
  const [moodScore, setMoodScore] = useState(5);
  const [selected, setSelected] = useState<ActivityKey[]>([]);
  const [saving, setSaving] = useState(false);

  function toggleActivity(a: ActivityKey) {
    setSelected(prev => (prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]));
  }

  async function handleSave() {
    setSaving(true);
    await onComplete(moodScore, selected);
    setSaving(false);
  }

  const activityLabels = c.activities;

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: '#111318', borderColor: '#4AAEFF22' }}
    >
      <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500 mb-4">
        {c.todayStatus} · {c.todayStatusSub}
      </p>

      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-200">
            {getMoodLabel(moodScore, c.moodLabels)}
          </span>
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
            background: `linear-gradient(to right, #4AAEFF ${((moodScore - 1) / 9) * 100}%, #1e2a38 ${((moodScore - 1) / 9) * 100}%)`,
            accentColor: '#4AAEFF',
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-600">{c.moodMin}</span>
          <span className="text-[10px] text-slate-600">{c.moodMax}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {ACTIVITY_KEYS.map(key => (
          <button
            key={key}
            onClick={() => toggleActivity(key)}
            className={[
              'text-xs px-3 py-1.5 rounded-full border transition-all',
              selected.includes(key)
                ? 'text-sky-300 border-sky-400/60 bg-sky-400/10'
                : 'text-slate-500 border-slate-700 hover:border-slate-600',
            ].join(' ')}
          >
            {activityLabels[key]}
          </button>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-2xl font-semibold text-sm transition-colors disabled:opacity-50"
        style={{ background: '#4AAEFF', color: '#0D1117' }}
      >
        {saving ? c.saving : c.record}
      </button>
    </div>
  );
}

interface CheckinDoneCardProps {
  moodScore: number;
  activities: ActivityKey[];
}

export function CheckinDoneCard({ moodScore, activities }: CheckinDoneCardProps) {
  const { translations: tr } = useTranslation();
  const c = tr.clear;
  const activityLabels = c.activities;

  const activityText =
    activities.length > 0
      ? activities.map(k => activityLabels[k]).join(', ')
      : c.checkinDoneLabel;

  return (
    <div
      className="rounded-2xl border p-4 flex items-center justify-between"
      style={{ background: '#111318', borderColor: '#34C48B22' }}
    >
      <div>
        <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500 mb-0.5">
          {c.todayStatus}
        </p>
        <p className="text-sm text-slate-200">
          <span className="font-semibold tabular-nums" style={{ color: '#4AAEFF' }}>
            {moodScore}
          </span>
          <span className="text-slate-500 mx-1">·</span>
          <span className="text-slate-400">{activityText}</span>
        </p>
      </div>
      <span
        className="text-xs font-medium px-2 py-0.5 rounded-full"
        style={{ color: '#34C48B', background: '#34C48B15' }}
      >
        ✓ {c.checkinDone}
      </span>
    </div>
  );
}
