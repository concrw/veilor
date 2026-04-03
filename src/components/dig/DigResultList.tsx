import type { PatternProfile } from './DigHistory';

interface MatchResult {
  question: string;
  answer: string;
  researcher: string;
  domain: string;
  divisionCode: string;
  score: number;
}

interface DigResultListProps {
  selected: MatchResult;
  results: MatchResult[];
  situation: string;
  domainCounts: Record<string, number>;
  comboPatternCounts: Record<string, number>;
  patternProfiles: PatternProfile[];
  interpretation: string;
  interpreting: boolean;
  onBack: () => void;
  onSelectResult: (r: MatchResult) => void;
}

export function DigResultList({
  selected, results, situation,
  domainCounts, comboPatternCounts, patternProfiles,
  interpretation, interpreting,
  onBack, onSelectResult,
}: DigResultListProps) {
  return (
    <div className="px-4 py-6 max-w-sm mx-auto space-y-5">
      <button onClick={onBack} className="text-xs text-muted-foreground">← 돌아가기</button>

      {/* 반복 패턴 배너 */}
      {selected.domain && (domainCounts[selected.domain] ?? 0) >= 2 && (() => {
        const count = domainCounts[selected.domain];
        const comboKey = `${selected.domain}::${situation}`;
        const comboCount = comboPatternCounts[comboKey] ?? 0;
        const profile = patternProfiles.find(p => p.pattern_axis === selected.domain);
        const trendLabel = profile?.trend === 'rising' ? '증가 추세' : profile?.trend === 'declining' ? '감소 추세' : '유지 중';
        return (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs">
                <span className="font-medium text-amber-700 dark:text-amber-400">
                  이번 달 {count}번째
                </span>
                <span className="text-amber-600 dark:text-amber-500"> — "{selected.domain}" 패턴이 반복되고 있어요.</span>
              </div>
              {profile && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 whitespace-nowrap">
                  {trendLabel}
                </span>
              )}
            </div>
            {comboCount >= 2 && situation && (
              <p className="text-[11px] text-amber-600 dark:text-amber-500">
                "{situation}" 상황에서만 {comboCount}회 반복 — 특정 관계에서 패턴이 작동하고 있어요.
              </p>
            )}
          </div>
        );
      })()}

      {/* AI 패턴 해석 */}
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <p className="text-xs text-muted-foreground">패턴 해석</p>
        {interpreting ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            분석 중...
          </div>
        ) : interpretation ? (
          <p className="text-sm leading-relaxed">{interpretation}</p>
        ) : null}
      </div>

      {/* M43 연구 매칭 */}
      <div className="bg-card border rounded-2xl p-5 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {selected.divisionCode && (
              <span className="text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                {selected.divisionCode}
              </span>
            )}
            <span className="text-xs text-muted-foreground">{selected.domain}</span>
          </div>
          <p className="font-medium mt-1">{selected.question}</p>
        </div>
        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground mb-2">— {selected.researcher}</p>
          <p className="text-sm leading-relaxed">{selected.answer}</p>
        </div>
      </div>

      {results.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">다른 관련 답변</p>
          {results.slice(1).map((r, i) => (
            <button key={i} onClick={() => onSelectResult(r)}
              className="w-full text-left bg-card border rounded-xl p-3 text-xs hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-1.5 mb-1">
                {r.divisionCode && (
                  <span className="font-mono bg-primary/10 text-primary px-1 py-0.5 rounded text-[10px]">
                    {r.divisionCode}
                  </span>
                )}
                <span className="text-muted-foreground">{r.domain} · {r.researcher}</span>
              </div>
              <p className="line-clamp-2">{r.question}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
