import { Button } from '@/components/ui/button';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    label: 'V-File Why 분석',
    title: '나의 Why를 찾는 여정',
    desc: '행복과 고통의 패턴, 그 뿌리를 10단계로 탐색합니다.\n직관과 기억을 살려 솔직하게 답해 주세요.',
    items: [
      { icon: '⏱', text: '총 2~3시간 소요 (여러 세션에 나눠 진행 가능)' },
      { icon: '🧠', text: '알고 있는 직업을 10분 동안 최대한 많이 떠올려요' },
      { icon: '📝', text: '각 직업에 나만의 정의와 기억을 기록해요' },
      { icon: '🔍', text: 'AI가 패턴을 분석해 Prime Perspective를 도출해요' },
      { icon: '💾', text: '진행 상황은 자동 저장됩니다' },
    ],
    start: 'Why 분석 시작 →',
  },
  en: {
    label: 'V-File Why Analysis',
    title: 'A Journey to Find My Why',
    desc: 'Explore the patterns of happiness and pain — and their roots — across 10 steps.\nAnswer honestly using your intuition and memory.',
    items: [
      { icon: '⏱', text: '2–3 hours total (can be split across multiple sessions)' },
      { icon: '🧠', text: 'Think of as many careers as you can in 10 minutes' },
      { icon: '📝', text: 'Record your personal definition and memory for each career' },
      { icon: '🔍', text: 'AI analyzes patterns to derive your Prime Perspective' },
      { icon: '💾', text: 'Your progress is automatically saved' },
    ],
    start: 'Start Why Analysis →',
  },
};

interface StepReadyProps {
  onStart: () => void;
}

export function StepReady({ onStart }: StepReadyProps) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  return (
    <div className="bg-card border rounded-2xl p-6 space-y-5">
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
        <h3 className="text-xl font-bold">{s.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {s.desc}
        </p>
      </div>

      <div className="space-y-2.5">
        {s.items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <span>{item.icon}</span>
            <span className="text-muted-foreground leading-relaxed">{item.text}</span>
          </div>
        ))}
      </div>

      <Button className="w-full h-11" onClick={onStart}>
        {s.start}
      </Button>
    </div>
  );
}
