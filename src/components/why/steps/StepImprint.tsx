import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguageContext } from '@/context/LanguageContext';
import type { JobEntry } from '@/types/why';

const S = {
  ko: {
    stepLabel: '3단계',
    title: '각인 순간 기록',
    promptMain: '이 직업을 처음 알게 된 순간을 떠올려 보세요.',
    promptSub: '언제 / 어디서 / 누구와 / 무엇을 / 왜 기억나는지 / 어떤 감정이었는지',
    placeholder: '초등학교 때 할머니 병원에서 의사 선생님을 보고 처음으로 따뜻하다고 느꼈다...',
    prev: '← 이전',
    nextCareer: '다음 직업 →',
    toClassify: '분류 단계로 →',
  },
  en: {
    stepLabel: 'Step 3',
    title: 'Record Imprint Moment',
    promptMain: 'Think of the moment you first learned about this career.',
    promptSub: 'When / Where / With whom / What / Why you remember it / What feeling you had',
    placeholder: 'In elementary school, I saw a doctor at my grandmother\'s hospital and felt warmth for the first time...',
    prev: '← Prev',
    nextCareer: 'Next career →',
    toClassify: 'To classification →',
  },
};

interface StepImprintProps {
  job: JobEntry;
  jobIdx: number;
  totalJobs: number;
  memText: string;
  setMemText: (text: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function StepImprint({ job, jobIdx, totalJobs, memText, setMemText, onPrev, onNext }: StepImprintProps) {
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
          {job.definition && (
            <p className="text-xs text-muted-foreground mt-1">{job.definition}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {s.promptMain}<br />
            <span className="opacity-70">{s.promptSub}</span>
          </p>
          <Textarea
            value={memText}
            onChange={e => setMemText(e.target.value)}
            placeholder={s.placeholder}
            className="h-32 resize-none text-sm"
            autoFocus
          />
        </div>
      </div>

      <div className="flex gap-2">
        {jobIdx > 0 && (
          <Button variant="outline" onClick={onPrev} className="flex-1">{s.prev}</Button>
        )}
        <Button className="flex-1 h-11" onClick={onNext}>
          {jobIdx < totalJobs - 1 ? s.nextCareer : s.toClassify}
        </Button>
      </div>
    </div>
  );
}
