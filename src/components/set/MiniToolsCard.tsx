// #9 미니 도구들 — 호흡/그라운딩/감정 체크인/감사 일기
import { useState } from 'react';
import { useLanguageContext } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';

type ToolId = 'breathing' | 'grounding' | 'checkin' | 'gratitude';

const S = {
  ko: {
    title: '미니 도구',
    tools: [
      { id: 'breathing' as ToolId, icon: '🫁', name: '호흡', desc: '4-7-8 호흡법' },
      { id: 'grounding' as ToolId, icon: '🌿', name: '그라운딩', desc: '5-4-3-2-1 기법' },
      { id: 'checkin' as ToolId, icon: '💭', name: '감정 체크인', desc: '지금 느끼는 감정 3개' },
      { id: 'gratitude' as ToolId, icon: '✨', name: '감사 일기', desc: '오늘 고마운 것 1가지' },
    ],
    breathing: {
      inhale: '들이쉬세요',
      hold: '멈추세요',
      exhale: '내쉬세요',
    },
    grounding: {
      title: '5-4-3-2-1 그라운딩',
      steps: [
        { n: 5, s: '보이는 것', i: '👁️' },
        { n: 4, s: '만질 수 있는 것', i: '✋' },
        { n: 3, s: '들리는 것', i: '👂' },
        { n: 2, s: '냄새', i: '👃' },
        { n: 1, s: '맛', i: '👅' },
      ],
      stepFmt: (n: number, s: string) => `${n}가지 ${s}을 찾아보세요`,
    },
    checkin: {
      title: '지금 느끼는 감정 3개를 골라보세요',
      emotions: ['불안', '슬픔', '화남', '외로움', '평온', '기쁨', '혼란', '지침', '감사', '설렘', '무감각', '안도'],
      done: '감정을 인식하는 것만으로도 한 걸음이에요',
    },
    gratitude: {
      title: '오늘 고마운 것 1가지',
      placeholder: '작은 것이라도 좋아요...',
      save: '저장하기',
      done: '기록했어요. 오늘도 수고했어요.',
    },
    close: '닫기',
  },
  en: {
    title: 'Mini Tools',
    tools: [
      { id: 'breathing' as ToolId, icon: '🫁', name: 'Breathing', desc: '4-7-8 technique' },
      { id: 'grounding' as ToolId, icon: '🌿', name: 'Grounding', desc: '5-4-3-2-1 method' },
      { id: 'checkin' as ToolId, icon: '💭', name: 'Emotion Check-in', desc: '3 feelings right now' },
      { id: 'gratitude' as ToolId, icon: '✨', name: 'Gratitude Journal', desc: '1 thing to be thankful for' },
    ],
    breathing: {
      inhale: 'Breathe in',
      hold: 'Hold',
      exhale: 'Breathe out',
    },
    grounding: {
      title: '5-4-3-2-1 Grounding',
      steps: [
        { n: 5, s: 'things you can see', i: '👁️' },
        { n: 4, s: 'things you can touch', i: '✋' },
        { n: 3, s: 'things you can hear', i: '👂' },
        { n: 2, s: 'things you can smell', i: '👃' },
        { n: 1, s: 'thing you can taste', i: '👅' },
      ],
      stepFmt: (n: number, s: string) => `Find ${n} ${s}`,
    },
    checkin: {
      title: 'Choose 3 emotions you feel right now',
      emotions: ['Anxious', 'Sad', 'Angry', 'Lonely', 'Calm', 'Happy', 'Confused', 'Tired', 'Grateful', 'Excited', 'Numb', 'Relieved'],
      done: 'Just recognizing your feelings is a step forward.',
    },
    gratitude: {
      title: '1 thing you\'re grateful for today',
      placeholder: 'Even small things count...',
      save: 'Save',
      done: 'Recorded. You did well today.',
    },
    close: 'Close',
  },
};

function BreathingTool({ onClose, s }: { onClose: () => void; s: typeof S.ko }) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [count, setCount] = useState(4);

  useState(() => {
    const seq = [{ p: 'inhale' as const, d: 4 }, { p: 'hold' as const, d: 7 }, { p: 'exhale' as const, d: 8 }];
    let idx = 0, c = 4;
    const timer = setInterval(() => {
      c--;
      if (c <= 0) { idx = (idx + 1) % 3; c = seq[idx].d; setPhase(seq[idx].p); }
      setCount(c);
    }, 1000);
    return () => clearInterval(timer);
  });

  const phaseLabel = phase === 'inhale' ? s.breathing.inhale : phase === 'hold' ? s.breathing.hold : s.breathing.exhale;

  return (
    <div className="text-center py-4 space-y-3">
      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary transition-all"
        style={{ transform: phase === 'inhale' ? 'scale(1.2)' : phase === 'exhale' ? 'scale(0.8)' : 'scale(1)' }}>
        {count}
      </div>
      <p className="text-sm font-medium">{phaseLabel}</p>
      <button onClick={onClose} className="text-xs text-muted-foreground">{s.close}</button>
    </div>
  );
}

export default function MiniToolsCard() {
  const { language } = useLanguageContext();
  const { user } = useAuth();
  const s = S[language] ?? S.ko;
  const [active, setActive] = useState<ToolId | null>(null);
  const [checkinDone, setCheckinDone] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [gratitude, setGratitude] = useState('');
  const [gratitudeSaved, setGratitudeSaved] = useState(false);

  const handleEmotionClick = async (emotion: string) => {
    const next = selectedEmotions.includes(emotion)
      ? selectedEmotions.filter(e => e !== emotion)
      : [...selectedEmotions, emotion];
    setSelectedEmotions(next);

    if (!checkinDone && next.length > 0) {
      setCheckinDone(true);
      if (user) {
        await veilorDb.from('tab_conversations').insert({
          user_id: user.id,
          tab: 'set',
          stage: 'checkin',
          role: 'user',
          content: next.join(','),
          lang: language,
        });
      }
    }
  };

  const handleGratitudeSave = async () => {
    if (!gratitude.trim()) return;
    if (user) {
      await veilorDb.from('tab_conversations').insert({
        user_id: user.id,
        tab: 'set',
        stage: 'gratitude',
        role: 'user',
        content: gratitude.trim(),
        lang: language,
      });
    }
    setGratitudeSaved(true);
  };

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <p className="text-xs text-muted-foreground">{s.title}</p>

      {!active ? (
        <div className="grid grid-cols-2 gap-2">
          {s.tools.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)}
              className="bg-muted/50 rounded-xl p-3 text-left hover:bg-muted transition-colors">
              <span className="text-lg">{t.icon}</span>
              <p className="text-xs font-medium mt-1">{t.name}</p>
              <p className="text-[10px] text-muted-foreground">{t.desc}</p>
            </button>
          ))}
        </div>
      ) : active === 'breathing' ? (
        <BreathingTool onClose={() => setActive(null)} s={s} />
      ) : active === 'grounding' ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">{s.grounding.title}</p>
          {s.grounding.steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2 text-xs">
              <span>{step.i}</span> {s.grounding.stepFmt(step.n, step.s)}
            </div>
          ))}
          <button onClick={() => setActive(null)} className="w-full text-xs text-muted-foreground py-2">{s.close}</button>
        </div>
      ) : active === 'checkin' ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">{s.checkin.title}</p>
          <div className="flex flex-wrap gap-1.5">
            {s.checkin.emotions.map(e => (
              <button key={e}
                onClick={() => handleEmotionClick(e)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  selectedEmotions.includes(e)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'hover:border-primary/50 hover:bg-primary/5'
                }`}>
                {e}
              </button>
            ))}
          </div>
          {checkinDone && <p className="text-xs text-primary">{s.checkin.done}</p>}
          <button onClick={() => { setActive(null); setCheckinDone(false); setSelectedEmotions([]); }} className="w-full text-xs text-muted-foreground py-2">{s.close}</button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium">{s.gratitude.title}</p>
          <textarea value={gratitude} onChange={e => setGratitude(e.target.value)}
            placeholder={s.gratitude.placeholder} maxLength={200}
            className="w-full bg-background border rounded-lg p-2.5 text-xs resize-none h-16 focus:outline-none focus:ring-1 focus:ring-primary" />
          {gratitudeSaved
            ? <p className="text-xs text-primary">{s.gratitude.done}</p>
            : gratitude.trim() && (
              <button onClick={handleGratitudeSave}
                className="w-full text-xs bg-primary/10 text-primary rounded-lg py-1.5 hover:bg-primary/20 transition-colors">
                {s.gratitude.save}
              </button>
            )
          }
          <button onClick={() => { setActive(null); setGratitude(''); setGratitudeSaved(false); }} className="w-full text-xs text-muted-foreground py-2">{s.close}</button>
        </div>
      )}
    </div>
  );
}
