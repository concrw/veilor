import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    step: '1단계',
    title: '직업 브레인스토밍',
    timerStart: '타이머 시작',
    desc1: '알고 있는 ',
    descBold: '모든 직업명',
    desc2: '을 쉼표나 줄바꿈으로 구분해 입력하세요.\n많이 적을수록 분석이 풍부해집니다 (평균 50~100개).',
    countSuffix: '개 입력됨',
    placeholder: '의사, 선생님, 프로그래머, 작가, 유튜버, 요리사, 변호사, 디자이너...',
    next: '직업 저장 후 다음 단계 →',
  },
  en: {
    step: 'Step 1',
    title: 'Career Brainstorming',
    timerStart: 'Start Timer',
    desc1: 'Enter ',
    descBold: 'all career names',
    desc2: ' you know, separated by commas or line breaks.\nThe more you list, the richer the analysis (average 50–100).',
    countSuffix: ' entered',
    placeholder: 'Doctor, Teacher, Programmer, Writer, YouTuber, Chef, Lawyer, Designer...',
    next: 'Save careers & next step →',
  },
};

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
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
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
