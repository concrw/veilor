// 루틴 모드 — 30초 일일 체크인 모달
// Daylio 패턴: 감정(1단계) → 에너지(1단계) → 오늘 한 것(선택) → 완료
// DB: veilor.user_profiles (streak_count 갱신) + veilor.tab_conversations (기록)

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ROUTINE_MILESTONES } from '@/data/routineConstants';
import { useT } from '@/i18n/useT';

// ──────────────────────────────────────────────────────────────────────────────
// 타입
// ──────────────────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  onComplete: (streak: number) => void;
}

// ──────────────────────────────────────────────────────────────────────────────
// 유틸
// ──────────────────────────────────────────────────────────────────────────────

const CHECKIN_DATE_KEY = 'veilor_routine_last_checkin';

function hasCheckedInToday(): boolean {
  try {
    const stored = localStorage.getItem(CHECKIN_DATE_KEY);
    if (!stored) return false;
    return stored === new Date().toISOString().split('T')[0];
  } catch {
    return false;
  }
}

function markCheckedInToday() {
  try {
    localStorage.setItem(CHECKIN_DATE_KEY, new Date().toISOString().split('T')[0]);
  } catch {
    // silent
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 컴포넌트
// ──────────────────────────────────────────────────────────────────────────────

type Step = 'mood' | 'energy' | 'activity' | 'done';

export default function RoutineCheckinModal({ onClose, onComplete }: Props) {
  const { user } = useAuth();
  const t = useT();
  const s = t.routineCheckin;
  const [step, setStep] = useState<Step>('mood');
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [activities, setActivities] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [newStreak, setNewStreak] = useState(0);

  // 이미 오늘 체크인한 경우 건너뜀
  useEffect(() => {
    if (hasCheckedInToday()) {
      onClose();
    }
  }, [onClose]);

  function toggleActivity(act: string) {
    setActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );
  }

  async function handleSave() {
    if (!user || mood === null || energy === null) return;
    setSaving(true);

    try {
      // 1) 오늘의 체크인 기록 저장 (tab_conversations에 JSON으로)
      const checkinData = {
        mood_index: mood,
        mood_label: s.moodItems[mood].text,
        energy_index: energy,
        energy_label: s.energyItems[energy].text,
        activities,
        checked_at: new Date().toISOString(),
      };

      await veilorDb
        .from('tab_conversations')
        .insert({
          user_id: user.id,
          tab: 'routine_checkin',
          stage: 'daily',
          role: 'user',
          content: JSON.stringify(checkinData),
        });

      // 2) streak_count 갱신
      const { data: profile } = await veilorDb
        .from('user_profiles')
        .select('streak_count')
        .eq('user_id', user.id)
        .single();

      const currentStreak = profile?.streak_count ?? 0;
      const updatedStreak = currentStreak + 1;

      await veilorDb
        .from('user_profiles')
        .update({ streak_count: updatedStreak })
        .eq('user_id', user.id);

      markCheckedInToday();
      setNewStreak(updatedStreak);
      setStep('done');
      onComplete(updatedStreak);
    } catch (err) {
      console.error(err);
      toast({ title: s.saveError, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  // ── 렌더 ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" aria-modal="true" role="dialog">
      {/* 배경 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step === 'done' ? onClose : undefined}
      />

      {/* 모달 */}
      <div className="relative w-full max-w-sm bg-[#1C1917] border border-stone-700/60 rounded-t-3xl px-6 pt-6 pb-10 shadow-2xl">
        {/* 핸들 */}
        <div className="w-10 h-1 bg-stone-600 rounded-full mx-auto mb-6" />

        {step === 'mood' && (
          <MoodStep
            mood={mood}
            moodItems={s.moodItems}
            stepLabel={s.mood.stepLabel}
            title={s.mood.title}
            hint={s.mood.hint}
            onSelect={(i) => { setMood(i); setStep('energy'); }}
          />
        )}

        {step === 'energy' && (
          <EnergyStep
            energy={energy}
            energyItems={s.energyItems}
            stepLabel={s.energy.stepLabel}
            title={s.energy.title}
            hint={s.energy.hint}
            back={s.energy.back}
            onSelect={(i) => { setEnergy(i); setStep('activity'); }}
            onBack={() => setStep('mood')}
          />
        )}

        {step === 'activity' && (
          <ActivityStep
            activities={activities}
            activityItems={s.activityItems}
            stepLabel={s.activity.stepLabel}
            title={s.activity.title}
            back={s.activity.back}
            savLabel={s.activity.save}
            savingLabel={s.activity.saving}
            skipLabel={s.activity.skip}
            onToggle={toggleActivity}
            onSave={handleSave}
            onBack={() => setStep('energy')}
            saving={saving}
          />
        )}

        {step === 'done' && (
          <DoneStep streak={newStreak} strings={s.done} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

// ── 서브 스텝 컴포넌트 ────────────────────────────────────────────────────────

function MoodStep({
  mood,
  moodItems,
  stepLabel,
  title,
  hint,
  onSelect,
}: {
  mood: number | null;
  moodItems: readonly { label: string; text: string }[];
  stepLabel: string;
  title: string;
  hint: string;
  onSelect: (i: number) => void;
}) {
  return (
    <div>
      <p className="text-[10px] tracking-widest text-stone-500 uppercase mb-1">{stepLabel}</p>
      <h2 className="text-lg font-semibold text-stone-100 mb-6">{title}</h2>
      <div className="flex justify-between mb-2">
        {moodItems.map((m, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={[
              'flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border transition-all',
              mood === i
                ? 'border-amber-400/70 bg-amber-400/10'
                : 'border-stone-700/40 hover:border-stone-600',
            ].join(' ')}
          >
            <span className="text-2xl">{m.label}</span>
            <span className="text-[10px] text-stone-400">{m.text}</span>
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-stone-500 mt-4">{hint}</p>
    </div>
  );
}

function EnergyStep({
  energy,
  energyItems,
  stepLabel,
  title,
  hint,
  back,
  onSelect,
  onBack,
}: {
  energy: number | null;
  energyItems: readonly { label: string; text: string }[];
  stepLabel: string;
  title: string;
  hint: string;
  back: string;
  onSelect: (i: number) => void;
  onBack: () => void;
}) {
  return (
    <div>
      <button onClick={onBack} className="text-xs text-stone-500 mb-4">{back}</button>
      <p className="text-[10px] tracking-widest text-stone-500 uppercase mb-1">{stepLabel}</p>
      <h2 className="text-lg font-semibold text-stone-100 mb-6">{title}</h2>
      <div className="flex justify-between">
        {energyItems.map((e, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={[
              'flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border transition-all flex-1 mx-1',
              energy === i
                ? 'border-amber-400/70 bg-amber-400/10'
                : 'border-stone-700/40 hover:border-stone-600',
            ].join(' ')}
          >
            <span className="text-2xl">{e.label}</span>
            <span className="text-[10px] text-stone-400 text-center leading-tight">{e.text}</span>
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-stone-500 mt-4">{hint}</p>
    </div>
  );
}

function ActivityStep({
  activities,
  activityItems,
  stepLabel,
  title,
  back,
  savLabel,
  savingLabel,
  skipLabel,
  onToggle,
  onSave,
  onBack,
  saving,
}: {
  activities: string[];
  activityItems: readonly string[];
  stepLabel: string;
  title: string;
  back: string;
  savLabel: string;
  savingLabel: string;
  skipLabel: string;
  onToggle: (a: string) => void;
  onSave: () => void;
  onBack: () => void;
  saving: boolean;
}) {
  return (
    <div>
      <button onClick={onBack} className="text-xs text-stone-500 mb-4">{back}</button>
      <p className="text-[10px] tracking-widest text-stone-500 uppercase mb-1">{stepLabel}</p>
      <h2 className="text-lg font-semibold text-stone-100 mb-5">{title}</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {activityItems.map((a) => (
          <button
            key={a}
            onClick={() => onToggle(a)}
            className={[
              'text-sm px-3 py-1.5 rounded-full border transition-all',
              activities.includes(a)
                ? 'border-amber-400/70 bg-amber-400/10 text-amber-300'
                : 'border-stone-700 text-stone-400 hover:border-stone-600',
            ].join(' ')}
          >
            {a}
          </button>
        ))}
      </div>
      <button
        onClick={onSave}
        disabled={saving}
        className="w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-50 text-stone-950 font-semibold text-sm py-3.5 rounded-2xl transition-colors"
      >
        {saving ? savingLabel : savLabel}
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="w-full mt-2 text-xs text-stone-500 py-2"
      >
        {skipLabel}
      </button>
    </div>
  );
}

function DoneStep({
  streak,
  strings,
  onClose,
}: {
  streak: number;
  strings: typeof S.ko.done;
  onClose: () => void;
}) {
  const isMilestone = (ROUTINE_MILESTONES as readonly number[]).includes(streak);

  return (
    <div className="text-center py-4">
      {isMilestone ? (
        <>
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-xl font-bold text-amber-300 mb-1">{strings.milestoneTitle(streak)}</h2>
          <p className="text-sm text-stone-400 mb-6">{strings.milestoneDesc}</p>
        </>
      ) : (
        <>
          <div className="text-5xl mb-3">🔥</div>
          <h2 className="text-xl font-bold text-stone-100 mb-1">{strings.regularTitle(streak)}</h2>
          <p className="text-sm text-stone-400 mb-6">{strings.regularDesc}</p>
        </>
      )}
      <div className="bg-stone-800/60 rounded-2xl p-4 mb-6">
        <p className="text-xs text-stone-500 mb-1">{strings.currentStreak}</p>
        <p className="text-3xl font-bold text-amber-400">{streak}<span className="text-sm font-normal text-stone-400 ml-1">{strings.streakUnit}</span></p>
      </div>
      <button
        onClick={onClose}
        className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-sm py-3 rounded-2xl transition-colors"
      >
        {strings.home}
      </button>
    </div>
  );
}

export { hasCheckedInToday };
