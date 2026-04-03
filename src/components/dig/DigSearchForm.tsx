import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const SITUATIONS = ['연인/파트너', '가족', '친구', '직장/동료', '나 자신', '기타'];

interface Division {
  id: string;
  code: string;
  name: string;
}

interface DigSearchFormProps {
  situation: string;
  onSituationChange: (s: string) => void;
  divisionId: string;
  onDivisionIdChange: (id: string) => void;
  divisions: Division[];
  text: string;
  onTextChange: (t: string) => void;
  axisScores: Record<string, number> | null | undefined;
  onSubmit: () => void;
  isPending: boolean;
}

export function DigSearchForm({
  situation, onSituationChange,
  divisionId, onDivisionIdChange,
  divisions,
  text, onTextChange,
  axisScores,
  onSubmit, isPending,
}: DigSearchFormProps) {
  return (
    <>
      {/* 관계 상황 선택 */}
      <div className="space-y-3">
        <p className="text-sm font-medium">어떤 관계 상황인가요?</p>
        <div className="grid grid-cols-3 gap-2">
          {SITUATIONS.map(s => (
            <button key={s} onClick={() => onSituationChange(s)}
              className={`px-3 py-2.5 rounded-xl border text-xs transition-colors
                ${situation === s ? 'border-primary bg-primary/5' : 'border-border'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* M43 Division 필터 */}
      {divisions.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">
            어떤 영역에서 찾아볼까요?
            <span className="text-xs text-muted-foreground font-normal ml-1">(선택)</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onDivisionIdChange('')}
              className={`px-2.5 py-1.5 rounded-lg border text-xs transition-colors
                ${!divisionId ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
              전체
            </button>
            {divisions.map(d => (
              <button key={d.id} onClick={() => onDivisionIdChange(d.id)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs transition-colors
                  ${divisionId === d.id ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
                <span className="font-mono mr-1">{d.code}</span>{d.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <Textarea
        placeholder="구체적인 상황을 입력해 주세요"
        value={text}
        onChange={e => onTextChange(e.target.value)}
        className="h-28 resize-none"
      />

      {axisScores && axisScores.C <= 35 && (
        <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          💡 욕구표현 축이 낮게 나왔어요. 원하는 것을 말하기 어려운 패턴이 있을 수 있어요.
        </p>
      )}

      <Button className="w-full h-11" onClick={onSubmit}
        disabled={isPending || (!situation && !text.trim())}>
        {isPending ? '탐색 중...' : '패턴 분석 시작'}
      </Button>
    </>
  );
}
