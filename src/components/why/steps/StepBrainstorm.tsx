import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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
  const count = memoText.split(/[,\n]/).filter(s => s.trim().length > 0).length;

  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">1단계</p>
            <p className="font-semibold">직업 브레인스토밍</p>
          </div>
          {timerRunning ? (
            <div className={`text-2xl font-mono font-bold ${secondsLeft <= 60 ? 'text-red-500' : 'text-primary'}`}>
              {formatTime(secondsLeft)}
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={startTimer}>타이머 시작</Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          알고 있는 <strong>모든 직업명</strong>을 쉼표나 줄바꿈으로 구분해 입력하세요.
          많이 적을수록 분석이 풍부해집니다 (평균 50~100개).
        </p>

        <div className="text-right text-xs text-muted-foreground">
          {count}개 입력됨
        </div>

        <Textarea
          value={memoText}
          onChange={e => setMemoText(e.target.value)}
          placeholder="의사, 선생님, 프로그래머, 작가, 유튜버, 요리사, 변호사, 디자이너..."
          className="h-48 resize-none text-sm"
          autoFocus
        />
      </div>

      <Button className="w-full h-11" onClick={onDone} disabled={count === 0}>
        직업 저장 후 다음 단계 →
      </Button>
    </div>
  );
}
