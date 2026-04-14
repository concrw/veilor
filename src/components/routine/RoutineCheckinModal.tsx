// 루틴 모드 — 30초 일일 체크인 모달
// Daylio 패턴: 감정(1단계) → 에너지(1단계) → 오늘 한 것(선택) → 완료
// DB: veilor.user_profiles (streak_count 갱신) + veilor.tab_conversations (기록)

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ROUTINE_MILESTONES } from '@/data/routineConstants';

// ──────────────────────────────────────────────────────────────────────────────
// 타입
// ──────────────────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  onComplete: (streak: number) => void;
}

// ──────────────────────────────────────────────────────────────────────────────
// 데이터
// ──────────────────────────────────────────────────────────────────────────────

const MOODS = [
  { label: '😫', text: '힘들어' },
  { label: '😔', text: '별로야' },
  { label: '😐', text: '그냥' },
  { label: '😊', text: '괜찮아' },
  { label: '😄', text: '좋아' },
];

const ENERGY = [
  { label: '🪫', text: '완전 방전' },
  { label: '🔋', text: '조금 남음' },
  { label: '⚡', text: '보통' },
  { label: '🔥', text: '에너지 있음' },
];

const ACTIVITIES = [
  '일했어', '공부했어', '운동했어', '사람 만났어',
  '혼자 있었어', '쉬었어', '뭔가 만들었어', '바깥에 나갔어',
];

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
        mood_label: MOODS[mood].text,
        energy_index: energy,
        energy_label: ENERGY[energy].text,
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
      toast({ title: '저장 중 오류가 발생했습니다', variant: 'destructive' });
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
            onSelect={(i) => { setMood(i); setStep('energy'); }}
          />
        )}

        {step === 'energy' && (
          <EnergyStep
            energy={energy}
            onSelect={(i) => { setEnergy(i); setStep('activity'); }}
            onBack={() => setStep('mood')}
          />
        )}

        {step === 'activity' && (
          <ActivityStep
            activities={activities}
            onToggle={toggleActivity}
            onSave={handleSave}
            onBack={() => setStep('energy')}
            saving={saving}
          />
        )}

        {step === 'done' && (
          <DoneStep streak={newStreak} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

// ── 서브 스텝 컴포넌트 ────────────────────────────────────────────────────────

function MoodStep({ mood, onSelect }: { mood: number | null; onSelect: (i: number) => void }) {
  return (
    <div>
      <p className="text-[10px] tracking-widest text-stone-500 uppercase mb-1">오늘의 감정</p>
      <h2 className="text-lg font-semibold text-stone-100 mb-6">지금 기분이 어때요?</h2>
      <div className="flex justify-between mb-2">
        {MOODS.map((m, i) => (
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
      <p className="text-center text-xs text-stone-500 mt-4">선택하면 다음으로 넘어가요</p>
    </div>
  );
}

function EnergyStep({
  energy,
  onSelect,
  onBack,
}: {
  energy: number | null;
  onSelect: (i: number) => void;
  onBack: () => void;
}) {
  return (
    <div>
      <button onClick={onBack} className="text-xs text-stone-500 mb-4">← 뒤로</button>
      <p className="text-[10px] tracking-widest text-stone-500 uppercase mb-1">에너지</p>
      <h2 className="text-lg font-semibold text-stone-100 mb-6">에너지는요?</h2>
      <div className="flex justify-between">
        {ENERGY.map((e, i) => (
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
      <p className="text-center text-xs text-stone-500 mt-4">선택하면 다음으로 넘어가요</p>
    </div>
  );
}

function ActivityStep({
  activities,
  onToggle,
  onSave,
  onBack,
  saving,
}: {
  activities: string[];
  onToggle: (a: string) => void;
  onSave: () => void;
  onBack: () => void;
  saving: boolean;
}) {
  return (
    <div>
      <button onClick={onBack} className="text-xs text-stone-500 mb-4">← 뒤로</button>
      <p className="text-[10px] tracking-widest text-stone-500 uppercase mb-1">오늘 한 것 (선택)</p>
      <h2 className="text-lg font-semibold text-stone-100 mb-5">오늘 뭐 했어요?</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {ACTIVITIES.map((a) => (
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
        {saving ? '저장 중...' : '오늘 체크인 완료'}
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="w-full mt-2 text-xs text-stone-500 py-2"
      >
        그냥 건너뛰고 완료
      </button>
    </div>
  );
}

function DoneStep({ streak, onClose }: { streak: number; onClose: () => void }) {
  const isMilestone = (ROUTINE_MILESTONES as readonly number[]).includes(streak);

  return (
    <div className="text-center py-4">
      {isMilestone ? (
        <>
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-xl font-bold text-amber-300 mb-1">{streak}일 달성!</h2>
          <p className="text-sm text-stone-400 mb-6">마일스톤을 넘었어요. 이게 쌓이는 거예요.</p>
        </>
      ) : (
        <>
          <div className="text-5xl mb-3">🔥</div>
          <h2 className="text-xl font-bold text-stone-100 mb-1">{streak}일째</h2>
          <p className="text-sm text-stone-400 mb-6">오늘도 기록했어요. 내일도 이어가요.</p>
        </>
      )}
      <div className="bg-stone-800/60 rounded-2xl p-4 mb-6">
        <p className="text-xs text-stone-500 mb-1">현재 스트릭</p>
        <p className="text-3xl font-bold text-amber-400">{streak}<span className="text-sm font-normal text-stone-400 ml-1">일</span></p>
      </div>
      <button
        onClick={onClose}
        className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-sm py-3 rounded-2xl transition-colors"
      >
        홈으로
      </button>
    </div>
  );
}

export { hasCheckedInToday };
