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

  const domainCount = m43Analysis?.domainMatches?.length ?? 0;
  const fwCount = m43Analysis?.frameworkTags?.filter(f => f.relevance > 0.1).length ?? 0;

  return (
    <div className="space-y-4">
      {/* 3단 분석 헤더 */}
      <div className="bg-card border rounded-2xl p-5 space-y-2">
        <p className="text-xs text-muted-foreground">7단계</p>
        <p className="font-semibold">Why 분석 3단</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          당신의 선택 패턴을 3단계로 분석합니다
        </p>
        <div className="flex gap-2 pt-1">
          <div className="flex-1 text-center bg-emerald-500/5 border border-emerald-500/20 rounded-lg py-2">
            <p className="text-lg font-bold text-emerald-600">{analysisResult?.happy_patterns?.keywords?.length ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">행복 키워드</p>
          </div>
          <div className="flex-1 text-center bg-primary/5 border border-primary/20 rounded-lg py-2">
            <p className="text-lg font-bold text-primary">{domainCount}</p>
            <p className="text-[10px] text-muted-foreground">도메인 매칭</p>
          </div>
          <div className="flex-1 text-center bg-violet-500/5 border border-violet-500/20 rounded-lg py-2">
            <p className="text-lg font-bold text-violet-500">{fwCount}</p>
            <p className="text-[10px] text-muted-foreground">프레임워크</p>
          </div>
        </div>
      </div>

      {/* 1단: 키워드 패턴 추출 */}
      {analysisResult && (
        <div className="bg-card border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs flex items-center justify-center font-bold">1</span>
            <p className="text-sm font-medium">키워드 패턴 추출</p>
          </div>
          {analysisResult.happy_patterns?.jobs?.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 space-y-1.5">
              <p className="text-xs text-emerald-600 font-medium">행복 패턴</p>
              <div className="flex flex-wrap gap-1.5">
                {(analysisResult.happy_patterns.keywords ?? []).slice(0, 8).map((kw: string, i: number) => (
                  <span key={i} className="text-xs bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
          )}
          {analysisResult.pain_patterns?.jobs?.length > 0 && (
            <div className="bg-red-400/5 border border-red-400/20 rounded-xl p-3 space-y-1.5">
              <p className="text-xs text-red-500 font-medium">고통 패턴</p>
              <div className="flex flex-wrap gap-1.5">
                {(analysisResult.pain_patterns.keywords ?? []).slice(0, 8).map((kw: string, i: number) => (
                  <span key={i} className="text-xs bg-red-400/10 text-red-600 px-2 py-0.5 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2단: M43 도메인 매칭 */}
      {m43Analysis?.domainMatches && m43Analysis.domainMatches.length > 0 && (
        <div className="bg-card border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">2</span>
            <p className="text-sm font-medium">M43 도메인 매칭</p>
          </div>
          <p className="text-xs text-muted-foreground">231개 관계 심리 도메인 중 상위 매칭</p>
          <div className="space-y-1.5">
            {m43Analysis.domainMatches.slice(0, 7).map((dm, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                <span className="text-[10px] font-mono text-muted-foreground w-10 flex-shrink-0">{dm.domain.code}</span>
                <span className="text-sm flex-1 truncate">{dm.domain.name}</span>
                <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden flex-shrink-0">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${Math.round(dm.score * 100)}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground w-7 text-right flex-shrink-0">{Math.round(dm.score * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3단: 프레임워크 태깅 */}
      {m43Analysis?.frameworkTags && m43Analysis.frameworkTags.length > 0 && (
        <div className="bg-card border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-violet-500/10 text-violet-500 text-xs flex items-center justify-center font-bold">3</span>
            <p className="text-sm font-medium">7 프레임워크 태깅</p>
          </div>
          <p className="text-xs text-muted-foreground">당신의 패턴이 어떤 관계 프레임워크와 연결되는지</p>
          <div className="space-y-2">
            {m43Analysis.frameworkTags
              .filter(f => f.relevance > 0.05)
              .sort((a, b) => b.relevance - a.relevance)
              .map((ft, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-16 flex-shrink-0">
                  <span className="text-xs font-mono">{ft.framework.code}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs">{ft.framework.name_ko}</span>
                    <span className="text-[10px] text-muted-foreground">{Math.round(ft.relevance * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.round(ft.relevance * 100)}%`,
                        backgroundColor: ft.relevance > 0.5 ? '#8B5CF6' : ft.relevance > 0.2 ? '#A78BFA' : '#C4B5FD',
                      }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button className="w-full h-11" onClick={onNext}>
        각인 연결 분석 보기 →
      </Button>
    </div>
  );
}
