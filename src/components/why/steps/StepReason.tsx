import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/i18n/useT';
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
  const t = useT();
  const s = t.why.reason;

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
