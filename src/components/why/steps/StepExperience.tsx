import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguageContext } from '@/context/LanguageContext';
import type { JobEntry } from '@/types/why';

const S = {
  ko: {
    stepLabel: '6단계',
    title: '직접 경험 여부',
    question: '이 직업을 직접 해 본 적이 있나요?',
    yes: '있어요',
    no: '없어요',
    noteLabel: '당시 어떠셨나요?',
    notePlaceholder: '실제로 해봤을 때 느낀 점을 자유롭게 적어 주세요...',
    prev: '← 이전',
    next: '다음 →',
    toAnalysis: 'AI 분석 시작 →',
  },
  en: {
    stepLabel: 'Step 6',
    title: 'Direct Experience',
    question: 'Have you directly experienced this career?',
    yes: 'Yes',
    no: 'No',
    noteLabel: 'How was it for you?',
    notePlaceholder: 'Write freely about what you felt when you tried it...',
    prev: '← Prev',
    next: 'Next →',
    toAnalysis: 'Start AI analysis →',
  },
};

interface StepExperienceProps {
  job: JobEntry;
  expIdx: number;
  totalJobs: number;
  hasExp: boolean;
  setHasExp: (v: boolean) => void;
  expNote: string;
  setExpNote: (text: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function StepExperience({ job, expIdx, totalJobs, hasExp, setHasExp, expNote, setExpNote, onPrev, onNext }: StepExperienceProps) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">{s.stepLabel} · {expIdx + 1} / {totalJobs}</p>
          <p className="font-semibold mt-0.5">{s.title}</p>
        </div>

        <div className="bg-muted/50 rounded-xl px-4 py-3">
          <p className="font-bold">{job.job_name}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{s.question}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setHasExp(true)}
              className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors
                ${hasExp ? 'border-primary bg-primary/5 text-primary' : 'border-border'}`}>
              {s.yes}
            </button>
            <button
              onClick={() => { setHasExp(false); setExpNote(''); }}
              className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors
                ${!hasExp ? 'border-primary bg-primary/5 text-primary' : 'border-border'}`}>
              {s.no}
            </button>
          </div>

          {hasExp && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">{s.noteLabel}</p>
              <Textarea
                value={expNote}
                onChange={e => setExpNote(e.target.value)}
                placeholder={s.notePlaceholder}
                className="h-24 resize-none text-sm"
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {expIdx > 0 && (
          <Button variant="outline" onClick={onPrev} className="flex-1">{s.prev}</Button>
        )}
        <Button className="flex-1 h-11" onClick={onNext}>
          {expIdx < totalJobs - 1 ? s.next : s.toAnalysis}
        </Button>
      </div>
    </div>
  );
}
