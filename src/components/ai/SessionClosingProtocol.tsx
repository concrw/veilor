import { useState, useEffect } from 'react';
import { useLanguageContext } from '@/context/LanguageContext';

interface Props {
  messageCount: number;
  lastEmotion?: string;
  onClose?: () => void;
  onSaveNote?: (note: string) => void;
}

const S = {
  ko: {
    breathingSteps: [
      { text: '코로 천천히 들이쉬세요', duration: 4000, phase: 'in' as const },
      { text: '잠깐 멈추세요', duration: 2000, phase: 'hold' as const },
      { text: '입으로 천천히 내쉬세요', duration: 4000, phase: 'out' as const },
    ],
    closingPrompts: [
      '오늘 대화에서 가장 마음에 남는 것 하나를 적어보세요.',
      '지금 이 순간, 몸 어디에 감정이 머물고 있나요?',
      '오늘 나에게 해주고 싶은 말 한마디를 적어보세요.',
      '이 대화를 마치며, 무엇을 알아챘나요?',
    ],
    introTitle: '오늘 대화를 마무리할게요',
    introDescMany: (n: number) => `${n}번의 대화를 함께했어요. 잠깐 숨 고르고 마무리해요.`,
    introDescFew: '짧은 호흡 훈련으로 마무리해요.',
    introWithEmotion: (e: string) => ` 오늘 느낀 '${e}' 감정과 함께.`,
    btnBreathing: '호흡으로 마무리',
    btnReflection: '바로 기록으로',
    btnSkip: '그냥 끝내기',
    breathingCountFmt: (n: number) => `호흡 ${n}/3`,
    breathDuration: { in: '4초', hold: '2초', out: '4초' },
    reflectionTitle: '오늘의 한 줄',
    placeholder: '자유롭게 적어보세요...',
    btnSave: '저장하고 마무리',
    btnSkipReflection: '건너뛰기',
    doneTitle: '잘 마무리됐어요',
    doneDesc: '오늘 이 공간에 와준 것만으로 충분해요. 다음에 또 이야기해요.',
    btnClose: '닫기',
  },
  en: {
    breathingSteps: [
      { text: 'Slowly breathe in through your nose', duration: 4000, phase: 'in' as const },
      { text: 'Hold for a moment', duration: 2000, phase: 'hold' as const },
      { text: 'Slowly breathe out through your mouth', duration: 4000, phase: 'out' as const },
    ],
    closingPrompts: [
      "Write one thing from today's conversation that stayed with you.",
      'Where in your body do you feel your emotions right now?',
      'Write one thing you want to say to yourself today.',
      "As you finish this conversation, what did you notice?",
    ],
    introTitle: "Let's wrap up today's session",
    introDescMany: (n: number) => `We had ${n} exchanges today. Take a breath and let's close.`,
    introDescFew: "Let's finish with a short breathing exercise.",
    introWithEmotion: (e: string) => ` Together with the '${e}' feeling you felt today.`,
    btnBreathing: 'Close with breathing',
    btnReflection: 'Go straight to reflection',
    btnSkip: 'Just close',
    breathingCountFmt: (n: number) => `Breath ${n}/3`,
    breathDuration: { in: '4s', hold: '2s', out: '4s' },
    reflectionTitle: "Today's one line",
    placeholder: 'Write freely...',
    btnSave: 'Save and finish',
    btnSkipReflection: 'Skip',
    doneTitle: 'Well done',
    doneDesc: "Just showing up today was enough. Let's talk again next time.",
    btnClose: 'Close',
  },
};

export default function SessionClosingProtocol({ messageCount, lastEmotion, onClose, onSaveNote }: Props) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [step, setStep] = useState<'intro' | 'breathing' | 'reflection' | 'done'>('intro');
  const [breathStep, setBreathStep] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [note, setNote] = useState('');
  const [breathProgress, setBreathProgress] = useState(0);
  const closingPrompt = s.closingPrompts[messageCount % s.closingPrompts.length];

  useEffect(() => {
    if (step !== 'breathing') return;
    const totalCycles = 3;
    if (breathCount >= totalCycles) {
      setStep('reflection');
      return;
    }
    const current = s.breathingSteps[breathStep];
    setBreathProgress(0);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setBreathProgress(Math.min((elapsed / current.duration) * 100, 100));
    }, 50);
    const timer = setTimeout(() => {
      clearInterval(interval);
      const next = (breathStep + 1) % s.breathingSteps.length;
      if (next === 0) setBreathCount(c => c + 1);
      setBreathStep(next);
    }, current.duration);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [step, breathStep, breathCount, s]);

  const handleSave = () => {
    if (note.trim() && onSaveNote) onSaveNote(note.trim());
    setStep('done');
  };

  if (step === 'intro') {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 text-center">
        <div className="text-2xl">🌿</div>
        <p className="text-sm font-medium">{s.introTitle}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {messageCount >= 5 ? s.introDescMany(messageCount) : s.introDescFew}
          {lastEmotion && s.introWithEmotion(lastEmotion)}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setStep('breathing')}
            className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            {s.btnBreathing}
          </button>
          <button
            onClick={() => setStep('reflection')}
            className="flex-1 h-10 rounded-xl border border-border text-sm text-muted-foreground"
          >
            {s.btnReflection}
          </button>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-xs text-muted-foreground underline">
            {s.btnSkip}
          </button>
        )}
      </div>
    );
  }

  if (step === 'breathing') {
    const current = s.breathingSteps[breathStep];
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (breathProgress / 100) * circumference;
    return (
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.breathingCountFmt(breathCount + 1)}</p>
        <div className="flex items-center justify-center">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
              <circle
                cx="48" cy="48" r={radius} fill="none"
                stroke="hsl(var(--primary))" strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.05s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">
                {current.phase === 'in' ? '🌬️' : current.phase === 'hold' ? '✨' : '😮‍💨'}
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm font-medium">{current.text}</p>
        <p className="text-xs text-muted-foreground">
          {s.breathDuration[current.phase]}
        </p>
      </div>
    );
  }

  if (step === 'reflection') {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="text-center">
          <div className="text-xl mb-2">✍️</div>
          <p className="text-sm font-medium">{s.reflectionTitle}</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed text-center">{closingPrompt}</p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={s.placeholder}
          className="w-full h-20 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!note.trim()}
            className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40"
          >
            {s.btnSave}
          </button>
          <button
            onClick={() => setStep('done')}
            className="h-10 px-4 rounded-xl border border-border text-sm text-muted-foreground"
          >
            {s.btnSkipReflection}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-3 text-center">
      <div className="text-3xl">🌙</div>
      <p className="text-sm font-medium">{s.doneTitle}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{s.doneDesc}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="w-full h-10 mt-2 rounded-xl border border-border text-sm text-muted-foreground"
        >
          {s.btnClose}
        </button>
      )}
    </div>
  );
}
