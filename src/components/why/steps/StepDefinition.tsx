import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/i18n/useT';
import type { JobEntry } from '@/types/why';


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
  const t = useT();
  const s = t.why.definition;

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
