import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/i18n/useT';


interface StepBrainstormProps {
  memoText: string;
  setMemoText: (text: string) => void;
  timerRunning: boolean;
  secondsLeft: number;
  formatTime: (s: number) => string;
  startTimer: () => void;
  onDone: () => void;
}

export function StepBrainstorm({
  memoText, setMemoText, timerRunning, secondsLeft, formatTime, startTimer, onDone,
}: StepBrainstormProps) {
  const t = useT();
  const s = t.why.brainstorm;
  const count = memoText.split(/[,\n]/).filter(s => s.trim().length > 0).length;

  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{s.step}</p>
            <p className="font-semibold">{s.title}</p>
          </div>
          {timerRunning ? (
            <div className={`text-2xl font-mono font-bold ${secondsLeft <= 60 ? 'text-red-500' : 'text-primary'}`}>
              {formatTime(secondsLeft)}
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={startTimer}>{s.timerStart}</Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {s.desc1}<strong>{s.descBold}</strong>{s.desc2}
        </p>

        <div className="text-right text-xs text-muted-foreground">
          {count}{s.countSuffix}
        </div>

        <Textarea
          value={memoText}
          onChange={e => setMemoText(e.target.value)}
          placeholder={s.placeholder}
          className="h-48 resize-none text-sm"
          autoFocus
        />
      </div>

      <Button className="w-full h-11" onClick={onDone} disabled={count === 0}>
        {s.next}
      </Button>
    </div>
  );
}
