import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useT } from '@/i18n/useT';
import { useLanguageContext } from '@/context/LanguageContext';
import { MASK_PROFILES } from '@/lib/vfileAlgorithm';
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
  const { primaryMask, axisScores: userAxisScores } = useAuth();
  const t = useT();
  const s = t.why.primePerspective;
  const { language } = useLanguageContext();
  const maskProfile = primaryMask ? MASK_PROFILES.find(m => m.nameKo === primaryMask || m.mskCode === primaryMask) : null;
  const maskName = maskProfile ? (language === 'en' ? maskProfile.nameEn : maskProfile.nameKo) : null;

  return (
    <div className="space-y-4">
      {/* V-File 가면 연결 */}
      {maskProfile && (
        <div className="bg-card border rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: maskProfile.color + '20' }}>
              🎭
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.maskConnectionLabel}</p>
              <p className="text-sm font-semibold" style={{ color: maskProfile.color }}>{maskName}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
            {s.maskDesc.replace('{nameKo}', maskName ?? maskProfile.nameKo).replace('{coreWound}', maskProfile.coreWound)}
          </p>
          <p className="text-xs text-muted-foreground">
            {s.coreNeed} <span className="text-foreground font-medium">{maskProfile.coreNeed}</span>
          </p>
        </div>
      )}

      {/* M43 분석 요약 카드 */}
      {m43Analysis && (
        <div className="bg-primary/3 border border-primary/10 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-medium text-primary">{s.m43Summary}</p>
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
            {s.viewAnalysis}
          </button>
        </div>
      )}

      {/* 기존 분석 결과 */}
      {analysisResult && (
        <div className="space-y-3">
          {analysisResult.happy_patterns?.jobs?.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
              <p className="text-xs text-emerald-600 font-medium">{s.happyPatterns}</p>
              <div className="flex flex-wrap gap-1.5">
                {(analysisResult.happy_patterns.keywords ?? analysisResult.happy_patterns.jobs ?? []).slice(0, 8).map((kw: string, i: number) => (
                  <span key={i} className="text-xs bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
          )}
          {analysisResult.pain_patterns?.jobs?.length > 0 && (
            <div className="bg-red-400/5 border border-red-400/20 rounded-2xl p-4 space-y-2">
              <p className="text-xs text-red-500 font-medium">{s.painPatterns}</p>
              <div className="flex flex-wrap gap-1.5">
                {(analysisResult.pain_patterns.keywords ?? analysisResult.pain_patterns.jobs ?? []).slice(0, 8).map((kw: string, i: number) => (
                  <span key={i} className="text-xs bg-red-400/10 text-red-600 px-2 py-0.5 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
          )}
          {analysisResult.prime_perspective && !ppText && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-2">
              <p className="text-xs text-primary font-medium">{s.aiLabel}</p>
              <p className="text-sm leading-relaxed">{analysisResult.prime_perspective}</p>
              <Button size="sm" variant="outline" onClick={() => setPpText(analysisResult.prime_perspective!)}>
                {s.useThis}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Prime Perspective 작성 */}
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">{s.stepLabel}</p>
          <p className="font-semibold mt-0.5">{s.title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {s.formatHint}
          </p>
        </div>
        <Textarea
          value={ppText}
          onChange={e => setPpText(e.target.value)}
          placeholder={s.placeholder}
          className="h-32 resize-none text-sm"
        />
      </div>

      {session?.completed_at ? (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center space-y-1">
          <p className="text-sm font-semibold text-primary">{s.completeBadge}</p>
          <p className="text-xs text-muted-foreground">{s.completeDesc}</p>
          <Button size="sm" variant="outline" onClick={() => {}}>{s.editAgain}</Button>
        </div>
      ) : (
        <Button className="w-full h-11" onClick={onSave} disabled={ppSaving || !ppText.trim()}>
          {ppSaving ? s.saving : s.save}
        </Button>
      )}
    </div>
  );
}
