import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguageContext } from '@/context/LanguageContext';
import type { JobEntry } from '@/types/why';

const S = {
  ko: {
    stepLabel: '5단계',
    title: '이유 작성',
    labelHappy: '✅ 행복',
    labelPain: '❌ 고통',
    promptHappy: '왜 행복할 것 같은가요?\n구체적인 감정과 이유를 적어 주세요.',
    promptPain: '왜 고통스러울 것 같은가요?\n구체적인 감정과 이유를 적어 주세요.',
    placeholderHappy: '사람들에게 직접적인 도움을 줄 수 있어서...',
    placeholderPain: '혼자 반복적인 일만 하는 게 답답할 것 같아서...',
    prev: '← 이전',
    next: '다음 →',
    toExperience: '경험 여부 단계로 →',
  },
  en: {
    stepLabel: 'Step 5',
    title: 'Write Reason',
    labelHappy: '✅ Happy',
    labelPain: '❌ Pain',
    promptHappy: 'Why do you think you\'d be happy?\nWrite specific emotions and reasons.',
    promptPain: 'Why do you think you\'d be in pain?\nWrite specific emotions and reasons.',
    placeholderHappy: 'Because I can directly help people...',
    placeholderPain: 'Because doing repetitive work alone would feel suffocating...',
    prev: '← Prev',
    next: 'Next →',
    toExperience: 'To experience step →',
  },
};

interface StepReasonProps {
  job: JobEntry;
  reasonIdx: number;
  totalClassified: number;
  reasonText: string;
  setReasonText: (text: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function StepReason({ job, reasonIdx, totalClassified, reasonText, setReasonText, onPrev, onNext }: StepReasonProps) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const isHappy = job.category === 'happy';

  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">{s.stepLabel} · {reasonIdx + 1} / {totalClassified}</p>
          <p className="font-semibold mt-0.5">{s.title}</p>
        </div>

        <div className={`rounded-xl px-4 py-3 ${isHappy ? 'bg-emerald-500/10' : 'bg-red-400/10'}`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${isHappy ? 'text-emerald-600' : 'text-red-500'}`}>
              {isHappy ? s.labelHappy : s.labelPain}
            </span>
            <p className="font-bold">{job.job_name}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground whitespace-pre-line">
            {isHappy ? s.promptHappy : s.promptPain}
          </p>
          <Textarea
            value={reasonText}
            onChange={e => setReasonText(e.target.value)}
            placeholder={isHappy ? s.placeholderHappy : s.placeholderPain}
            className="h-28 resize-none text-sm"
            autoFocus
          />
        </div>
      </div>

      <div className="flex gap-2">
        {reasonIdx > 0 && (
          <Button variant="outline" onClick={onPrev} className="flex-1">{s.prev}</Button>
        )}
        <Button className="flex-1 h-11" onClick={onNext}>
          {reasonIdx < totalClassified - 1 ? s.next : s.toExperience}
        </Button>
      </div>
    </div>
  );
}
