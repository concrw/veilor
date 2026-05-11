import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/useT';


interface StepReadyProps {
  onStart: () => void;
}

export function StepReady({ onStart }: StepReadyProps) {
  const t = useT();
  const s = t.why.ready;

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
