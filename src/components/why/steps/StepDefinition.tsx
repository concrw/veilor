import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguageContext } from '@/context/LanguageContext';
import type { JobEntry } from '@/types/why';

const S = {
  ko: {
    stepLabel: '2단계',
    title: '직업 정의 작성',
    prompt: '이 직업이 나에게 어떤 의미인가요? (사전적 정의 말고, 개인적 인식으로)',
    placeholder: '예: 사람들의 고통을 덜어주는 사람',
    prev: '← 이전',
    nextCareer: '다음 직업 →',
    toImprint: '각인 순간 단계로 →',
  },
  en: {
    stepLabel: 'Step 2',
    title: 'Write Career Definition',
    prompt: 'What does this career mean to you personally? (Not a dictionary definition, but your own perception)',
    placeholder: 'e.g., Someone who relieves people\'s pain',
    prev: '← Prev',
    nextCareer: 'Next career →',
    toImprint: 'To imprint step →',
  },
};

interface StepDefinitionProps {
  job: JobEntry;
  jobIdx: number;
  totalJobs: number;
  defText: string;
  setDefText: (text: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function StepDefinition({ job, jobIdx, totalJobs, defText, setDefText, onPrev, onNext }: StepDefinitionProps) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">{s.stepLabel} · {jobIdx + 1} / {totalJobs}</p>
          <p className="font-semibold mt-0.5">{s.title}</p>
        </div>

        <div className="bg-muted/50 rounded-xl px-4 py-3">
          <p className="text-lg font-bold">{job.job_name}</p>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">{s.prompt}</p>
          <Textarea
            value={defText}
            onChange={e => setDefText(e.target.value)}
            placeholder={s.placeholder}
            className="h-24 resize-none text-sm"
            autoFocus
          />
        </div>
      </div>

      <div className="flex gap-2">
        {jobIdx > 0 && (
          <Button variant="outline" onClick={onPrev} className="flex-1">{s.prev}</Button>
        )}
        <Button className="flex-1 h-11" onClick={onNext}>
          {jobIdx < totalJobs - 1 ? s.nextCareer : s.toImprint}
        </Button>
      </div>
    </div>
  );
}
