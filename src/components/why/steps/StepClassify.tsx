import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/useT';
import type { JobEntry } from '@/types/why';


interface StepClassifyProps {
  jobs: JobEntry[];
  happySet: Set<string>;
  painSet: Set<string>;
  toggleHappy: (id: string) => void;
  togglePain: (id: string) => void;
  onDone: () => void;
}

export function StepClassify({ jobs, happySet, painSet, toggleHappy, togglePain, onDone }: StepClassifyProps) {
  const t = useT();
  const s = t.why.classify;

  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">{s.step}</p>
          <p className="font-semibold mt-0.5">{s.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{s.question}</p>
        </div>

        <div className="flex gap-2 text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />{s.happy} {happySet.size}</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />{s.pain} {painSet.size}</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40 inline-block" />{s.neutral} {jobs.length - happySet.size - painSet.size}</span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {jobs.map(j => (
            <div key={j.id} className="flex items-center gap-2">
              <span className="flex-1 text-sm truncate">{j.job_name}</span>
              <button
                onClick={() => toggleHappy(j.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border
                  ${happySet.has(j.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border text-muted-foreground'}`}>
                {s.btnHappy}
              </button>
              <button
                onClick={() => togglePain(j.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border
                  ${painSet.has(j.id) ? 'bg-red-400 border-red-400 text-white' : 'border-border text-muted-foreground'}`}>
                {s.btnPain}
              </button>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full h-11" onClick={onDone} disabled={happySet.size === 0}>
        {s.next}
      </Button>
    </div>
  );
}
