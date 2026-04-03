import { Button } from '@/components/ui/button';
import type { AnalysisResult } from '@/types/why';
import type { WhyM43Analysis } from '@/hooks/useM43WhyIntegration';

interface StepAnalysis7Props {
  analyzing: boolean;
  analysisResult: AnalysisResult | null;
  m43Analysis: WhyM43Analysis | null;
  onNext: () => void;
}

export function StepAnalysis7({ analyzing, analysisResult, m43Analysis, onNext }: StepAnalysis7Props) {
  if (analyzing) {
    return (
      <div className="bg-card border rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="space-y-1">
          <p className="font-semibold">M43 패턴 분석 중...</p>
          <p className="text-sm text-muted-foreground">
            행복/고통의 공통 분모 추출 →<br />
            231개 도메인 매칭 →<br />
            7 프레임워크 태깅
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">7단계</p>
          <p className="font-semibold mt-0.5">1차 분석: 도메인 매칭</p>
          <p className="text-xs text-muted-foreground mt-1">
            당신의 직업 선택 패턴이 M43 관계 심리 도메인과 어떻게 연결되는지 분석했습니다.
          </p>
        </div>

        {analysisResult && (
          <div className="space-y-3">
            {analysisResult.happy_patterns?.jobs?.length > 0 && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 space-y-1.5">
                <p className="text-xs text-emerald-600 font-medium">행복 패턴 키워드</p>
                <div className="flex flex-wrap gap-1.5">
                  {(analysisResult.happy_patterns.keywords ?? []).slice(0, 6).map((kw: string, i: number) => (
                    <span key={i} className="text-xs bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full">{kw}</span>
                  ))}
                </div>
              </div>
            )}
            {analysisResult.pain_patterns?.jobs?.length > 0 && (
              <div className="bg-red-400/5 border border-red-400/20 rounded-xl p-3 space-y-1.5">
                <p className="text-xs text-red-500 font-medium">고통 패턴 키워드</p>
                <div className="flex flex-wrap gap-1.5">
                  {(analysisResult.pain_patterns.keywords ?? []).slice(0, 6).map((kw: string, i: number) => (
                    <span key={i} className="text-xs bg-red-400/10 text-red-600 px-2 py-0.5 rounded-full">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {m43Analysis?.domainMatches && m43Analysis.domainMatches.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-primary">연관 도메인 (상위)</p>
            <div className="space-y-1.5">
              {m43Analysis.domainMatches.slice(0, 7).map((dm, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                  <span className="text-xs font-mono text-muted-foreground w-12">{dm.domain.code}</span>
                  <span className="text-sm flex-1">{dm.domain.name}</span>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.round(dm.score * 100)}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{Math.round(dm.score * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {m43Analysis?.frameworkTags && m43Analysis.frameworkTags.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-primary">프레임워크 연관도</p>
            <div className="flex flex-wrap gap-2">
              {m43Analysis.frameworkTags.filter(f => f.relevance > 0.1).map((ft, i) => (
                <div key={i} className={`px-3 py-1.5 rounded-lg border text-xs transition-all
                  ${ft.relevance > 0.5 ? 'border-primary bg-primary/5 text-primary font-medium' :
                    ft.relevance > 0.2 ? 'border-primary/30 bg-primary/2' : 'border-border text-muted-foreground'}`}>
                  <span className="font-mono mr-1">{ft.framework.code}</span>
                  {ft.framework.name_ko}
                  <span className="ml-1 opacity-60">{Math.round(ft.relevance * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button className="w-full h-11" onClick={onNext}>
        각인 연결 분석 보기 →
      </Button>
    </div>
  );
}
