import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/i18n/useT';
import type { JobEntry } from '@/types/why';


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
  const t = useT();
  const s = t.why.experience;

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
