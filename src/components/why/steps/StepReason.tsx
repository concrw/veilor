import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { JobEntry } from '@/types/why';

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
  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">5단계 · {reasonIdx + 1} / {totalClassified}</p>
          <p className="font-semibold mt-0.5">이유 작성</p>
        </div>

        <div className={`rounded-xl px-4 py-3 ${job.category === 'happy' ? 'bg-emerald-500/10' : 'bg-red-400/10'}`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${job.category === 'happy' ? 'text-emerald-600' : 'text-red-500'}`}>
              {job.category === 'happy' ? '✅ 행복' : '❌ 고통'}
            </span>
            <p className="font-bold">{job.job_name}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">
            왜 {job.category === 'happy' ? '행복할' : '고통스러울'} 것 같은가요?
            구체적인 감정과 이유를 적어 주세요.
          </p>
          <Textarea
            value={reasonText}
            onChange={e => setReasonText(e.target.value)}
            placeholder={job.category === 'happy'
              ? '사람들에게 직접적인 도움을 줄 수 있어서...'
              : '혼자 반복적인 일만 하는 게 답답할 것 같아서...'}
            className="h-28 resize-none text-sm"
            autoFocus
          />
        </div>
      </div>

      <div className="flex gap-2">
        {reasonIdx > 0 && (
          <Button variant="outline" onClick={onPrev} className="flex-1">← 이전</Button>
        )}
        <Button className="flex-1 h-11" onClick={onNext}>
          {reasonIdx < totalClassified - 1 ? '다음 →' : '경험 여부 단계로 →'}
        </Button>
      </div>
    </div>
  );
}
