import { useDigTranslations } from '@/hooks/useTranslation';

export interface PatternProfile {
  id: string;
  pattern_axis: string;
  score: number;
  confidence: number;
  trend: 'rising' | 'stable' | 'declining';
}

interface DigHistoryItem {
  id: string;
  domain: string;
  content: string;
  score: number;
  situation: string;
  emotion: string;
  created_at: string;
}

interface DigHistoryProps {
  digHistory: DigHistoryItem[];
  domainCounts: Record<string, number>;
  comboPatternCounts: Record<string, number>;
  historyPatternIndex: Record<string, number>;
  patternProfiles: PatternProfile[];
}

export function DigHistory({
  digHistory, domainCounts, comboPatternCounts,
  historyPatternIndex, patternProfiles,
}: DigHistoryProps) {
  const dig = useDigTranslations();

  if (digHistory.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{dig.historyTitle}</p>
        <span className="text-xs text-muted-foreground">{dig.historyCount.replace('{count}', String(digHistory.length))}</span>
      </div>

      {/* 반복 패턴 요약 */}
      {Object.entries(domainCounts).filter(([, c]) => c >= 2).length > 0 && (
        <div className="bg-muted/50 rounded-xl px-3 py-2.5 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{dig.monthlyPatterns}</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(domainCounts)
              .filter(([, c]) => c >= 2)
              .sort(([, a], [, b]) => b - a)
              .map(([domain, count]) => {
                const profile = patternProfiles.find(p => p.pattern_axis === domain);
                const trendIcon = profile?.trend === 'rising' ? ' ^' : profile?.trend === 'declining' ? ' v' : '';
                return (
                  <span key={domain} className="text-xs px-2 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary">
                    {domain} x{count}{trendIcon}
                  </span>
                );
              })}
          </div>
          {/* 상황별 조합 패턴 */}
          {Object.entries(comboPatternCounts).filter(([, c]) => c >= 2).length > 0 && (
            <div className="pt-1 space-y-1">
              {Object.entries(comboPatternCounts)
                .filter(([, c]) => c >= 2)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([key, count]) => {
                  const [domain, sit] = key.split('::');
                  return sit ? (
                    <p key={key} className="text-[11px] text-muted-foreground">
                      "{sit}" + "{domain}" x{count}
                    </p>
                  ) : null;
                })}
            </div>
          )}
        </div>
      )}

      {digHistory.map(h => {
        const idx = historyPatternIndex[h.id];
        const totalForDomain = domainCounts[h.domain] ?? 0;
        return (
          <div key={h.id} className="bg-card border rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {h.situation && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{h.situation}</span>
                )}
                {h.domain && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-primary/20 text-primary">{h.domain}</span>
                )}
                {idx && totalForDomain >= 2 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                    {idx}/{totalForDomain}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {new Date(h.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{h.content}</p>
          </div>
        );
      })}
    </div>
  );
}
