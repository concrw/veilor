import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useDigTranslations } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/context/LanguageContext';

const HINT_PREFIX = { ko: '힌트', en: 'Hint' } as const;

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
  const dig = useDigTranslations();
  const { language } = useLanguageContext();
  const hintPrefix = HINT_PREFIX[language] ?? HINT_PREFIX.ko;
  const [usedPrompt, setUsedPrompt] = useState<string | null>(null);
  const socraticPrompts = situation ? (dig.codetalk.socraticPrompts[situation] ?? []) : [];

  const applyPrompt = (prompt: string) => {
    setUsedPrompt(prompt);
    onTextChange(text ? `${text}\n\n(${hintPrefix}: ${prompt})\n` : `(${hintPrefix}: ${prompt})\n`);
  };

  return (
    <>
      {/* 관계 상황 선택 */}
      <div className="space-y-3">
        <p className="text-sm font-medium">{dig.situationQuestion}</p>
        <div className="grid grid-cols-3 gap-2">
          {dig.situations.map(s => (
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
            {dig.divisionQuestion}
            <span className="text-xs text-muted-foreground font-normal ml-1">({dig.optional})</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onDivisionIdChange('')}
              className={`px-2.5 py-1.5 rounded-lg border text-xs transition-colors
                ${!divisionId ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
              {dig.all}
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
          <p className="text-xs text-muted-foreground">{dig.socraticHint}</p>
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
        placeholder={dig.inputPlaceholder}
        value={text}
        onChange={e => onTextChange(e.target.value)}
        className="h-28 resize-none"
      />

      {axisScores && axisScores.C <= 35 && (
        <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          💡 {dig.lowDesireHint}
        </p>
      )}

      <Button className="w-full h-11" onClick={onSubmit}
        disabled={isPending || (!situation && !text.trim())}>
        {isPending ? dig.searching : dig.searchButton}
      </Button>
    </>
  );
}
