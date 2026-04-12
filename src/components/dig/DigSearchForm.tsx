import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const SITUATIONS = ['연인/파트너', '가족', '친구', '직장/동료', '나 자신', '기타'];

// #8 소크라테스식 유도 질문 — 상황별 깊이 있는 탐색을 위한 프롬프트
const SOCRATIC_PROMPTS: Record<string, string[]> = {
  '연인/파트너': [
    '그 순간 가장 먼저 든 감정은 무엇이었나요?',
    '이런 패턴이 이전 관계에서도 반복된 적 있나요?',
    '상대가 아니라 나 자신에게 화가 난 부분도 있나요?',
  ],
  '가족': [
    '어릴 때 이 관계에서 배운 패턴이 지금도 작동하고 있을까요?',
    '가족 안에서 내가 맡아온 역할이 있나요?',
    '그 역할이 지금의 나에게 여전히 필요한가요?',
  ],
  '친구': [
    '이 관계에서 내가 원하는 것은 무엇인가요?',
    '나는 이 관계에서 얼마나 솔직하게 나를 보여주나요?',
    '에너지를 받는 관계인가요, 빼앗기는 관계인가요?',
  ],
  '직장/동료': [
    '이 상황에서 나를 가장 불편하게 만드는 핵심은 무엇인가요?',
    '비슷한 불편함이 다른 환경에서도 온 적 있나요?',
    '내 반응 중 과한 부분이 있다면, 그 뿌리는 어디서 왔을까요?',
  ],
  '나 자신': [
    '나에게 가장 자주 하는 비판적인 말은 무엇인가요?',
    '내가 가장 두려워하는 나의 모습은 어떤 건가요?',
    '10년 전의 나라면 지금의 나에게 뭐라고 할까요?',
  ],
  '기타': [
    '이 상황에서 가장 충족되지 못한 욕구는 무엇인가요?',
    '비슷한 감정, 언제 또 느꼈나요?',
    '이 패턴을 알아챈 것이 처음인가요?',
  ],
};

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
  const [usedPrompt, setUsedPrompt] = useState<string | null>(null);
  const socraticPrompts = situation ? SOCRATIC_PROMPTS[situation] ?? [] : [];

  const applyPrompt = (prompt: string) => {
    setUsedPrompt(prompt);
    onTextChange(text ? `${text}\n\n(힌트: ${prompt})\n` : `(힌트: ${prompt})\n`);
  };

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

      {/* #8 소크라테스식 탐색 유도 질문 */}
      {socraticPrompts.length > 0 && !usedPrompt && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">탐색에 도움이 될 질문이에요 (선택)</p>
          <div className="space-y-1.5">
            {socraticPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => applyPrompt(prompt)}
                className="w-full text-left px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
              >
                {prompt}
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
