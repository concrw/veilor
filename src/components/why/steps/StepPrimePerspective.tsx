import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { WhySession, AnalysisResult } from '@/types/why';
import type { WhyM43Analysis } from '@/hooks/useM43WhyIntegration';

interface StepPrimePerspectiveProps {
  session: WhySession | null;
  analysisResult: AnalysisResult | null;
  m43Analysis: WhyM43Analysis | null;
  ppText: string;
  setPpText: (text: string) => void;
  ppSaving: boolean;
  onSave: () => void;
  onViewAnalysis: () => void;
}

export function StepPrimePerspective({
  session, analysisResult, m43Analysis, ppText, setPpText, ppSaving, onSave, onViewAnalysis,
}: StepPrimePerspectiveProps) {
  return (
    <div className="space-y-4">
      {/* M43 분석 요약 카드 */}
      {m43Analysis && (
        <div className="bg-primary/3 border border-primary/10 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-medium text-primary">M43 분석 요약</p>
          <div className="flex flex-wrap gap-1.5">
            {m43Analysis.frameworkTags
              .filter(f => f.relevance > 0.2)
              .slice(0, 4)
              .map((ft, i) => (
                <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {ft.framework.code} {ft.framework.name_ko}
                </span>
              ))}
          </div>
          {m43Analysis.domainMatches.slice(0, 3).map((dm, i) => (
            <p key={i} className="text-xs text-muted-foreground">
              <span className="font-mono">{dm.domain.code}</span> {dm.domain.name} ({Math.round(dm.score * 100)}%)
            </p>
          ))}
          <button
            className="text-xs text-primary underline underline-offset-2"
            onClick={onViewAnalysis}
          >
            상세 분석 다시 보기
          </button>
        </div>
      )}

      {/* 기존 분석 결과 */}
      {analysisResult && (
        <div className="space-y-3">
          {analysisResult.happy_patterns?.jobs?.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
              <p className="text-xs text-emerald-600 font-medium">행복 패턴</p>
              <div className="flex flex-wrap gap-1.5">
                {(analysisResult.happy_patterns.keywords ?? analysisResult.happy_patterns.jobs ?? []).slice(0, 8).map((kw: string, i: number) => (
                  <span key={i} className="text-xs bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
          )}
          {analysisResult.pain_patterns?.jobs?.length > 0 && (
            <div className="bg-red-400/5 border border-red-400/20 rounded-2xl p-4 space-y-2">
              <p className="text-xs text-red-500 font-medium">고통 패턴</p>
              <div className="flex flex-wrap gap-1.5">
                {(analysisResult.pain_patterns.keywords ?? analysisResult.pain_patterns.jobs ?? []).slice(0, 8).map((kw: string, i: number) => (
                  <span key={i} className="text-xs bg-red-400/10 text-red-600 px-2 py-0.5 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
          )}
          {analysisResult.prime_perspective && !ppText && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-2">
              <p className="text-xs text-primary font-medium">AI 제안 Prime Perspective</p>
              <p className="text-sm leading-relaxed">{analysisResult.prime_perspective}</p>
              <Button size="sm" variant="outline" onClick={() => setPpText(analysisResult.prime_perspective!)}>
                이것으로 사용
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Prime Perspective 작성 */}
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">10단계 · 최종</p>
          <p className="font-semibold mt-0.5">나의 Prime Perspective</p>
          <p className="text-xs text-muted-foreground mt-1">
            "나는 [이런 이유로] [이런 환경에서] 번영한다"
          </p>
        </div>
        <Textarea
          value={ppText}
          onChange={e => setPpText(e.target.value)}
          placeholder="나는 어린 시절 경험한 돌봄의 가치를 바탕으로, 사람들과 직접 소통하며 그들의 문제를 해결할 수 있는 환경에서 가장 행복하게 일할 수 있다."
          className="h-32 resize-none text-sm"
        />
      </div>

      {session?.completed_at ? (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center space-y-1">
          <p className="text-sm font-semibold text-primary">✓ Why 분석 완료</p>
          <p className="text-xs text-muted-foreground">Get 탭 → 정체성에서 확인할 수 있어요.</p>
          <Button size="sm" variant="outline" onClick={() => {}}>다시 수정하기</Button>
        </div>
      ) : (
        <Button className="w-full h-11" onClick={onSave} disabled={ppSaving || !ppText.trim()}>
          {ppSaving ? '저장 중...' : 'Prime Perspective 완성 →'}
        </Button>
      )}
    </div>
  );
}
