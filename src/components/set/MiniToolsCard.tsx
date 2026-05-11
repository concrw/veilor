// #9 미니 도구들 — 호흡/그라운딩/감정 체크인/감사 일기
import { useState } from 'react';
import { useLanguageContext } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { useT } from '@/i18n/useT';
import type { LocaleResource } from '@/i18n/types';

type ToolId = 'breathing' | 'grounding' | 'checkin' | 'gratitude';

function BreathingTool({ onClose, s }: { onClose: () => void; s: LocaleResource['miniTools'] }) {
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
  const t = useT();
  const s = t.miniTools;
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
          {s.tools.map(tool => (
            <button key={tool.id} onClick={() => setActive(tool.id as ToolId)}
              className="bg-muted/50 rounded-xl p-3 text-left hover:bg-muted transition-colors">
              <span className="text-lg">{tool.icon}</span>
              <p className="text-xs font-medium mt-1">{tool.name}</p>
              <p className="text-[10px] text-muted-foreground">{tool.desc}</p>
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
