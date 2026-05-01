import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useLanguageContext } from '@/context/LanguageContext';
import { MASK_PROFILES } from '@/lib/vfileAlgorithm';
import type { WhySession, AnalysisResult } from '@/types/why';
import type { WhyM43Analysis } from '@/hooks/useM43WhyIntegration';

const S = {
  ko: {
    maskConnectionLabel: 'V-File 가면과의 연결',
    maskDesc: (nameKo: string, coreWound: string) =>
      `당신의 가면 "${nameKo}"의 핵심 상처는 "${coreWound}"입니다.\n이 Why 분석이 그 상처가 어떤 선택 패턴으로 이어졌는지 보여줍니다.`,
    coreNeed: '핵심 필요:',
    m43Summary: 'M43 분석 요약',
    viewAnalysis: '상세 분석 다시 보기',
    happyPatterns: '행복 패턴',
    painPatterns: '고통 패턴',
    aiLabel: 'AI 제안 Prime Perspective',
    useThis: '이것으로 사용',
    stepLabel: '10단계 · 최종',
    title: '나의 Prime Perspective',
    formatHint: '"나는 [이런 이유로] [이런 환경에서] 번영한다"',
    placeholder: '나는 어린 시절 경험한 돌봄의 가치를 바탕으로, 사람들과 직접 소통하며 그들의 문제를 해결할 수 있는 환경에서 가장 행복하게 일할 수 있다.',
    completeBadge: '✓ Why 분석 완료',
    completeDesc: 'Get 탭 → 정체성에서 확인할 수 있어요.',
    editAgain: '다시 수정하기',
    saving: '저장 중...',
    save: 'Prime Perspective 완성 →',
  },
  en: {
    maskConnectionLabel: 'Connection with V-File Mask',
    maskDesc: (nameKo: string, coreWound: string) =>
      `Your mask "${nameKo}" has a core wound of "${coreWound}".\nThis Why analysis shows what choice patterns that wound has led to.`,
    coreNeed: 'Core need:',
    m43Summary: 'M43 Analysis Summary',
    viewAnalysis: 'Review detailed analysis',
    happyPatterns: 'Happy patterns',
    painPatterns: 'Pain patterns',
    aiLabel: 'AI-suggested Prime Perspective',
    useThis: 'Use this',
    stepLabel: 'Step 10 · Final',
    title: 'My Prime Perspective',
    formatHint: '"I thrive [for this reason] [in this environment]"',
    placeholder: 'I thrive in environments where I can directly connect with people...',
    completeBadge: '✓ Why Analysis Complete',
    completeDesc: 'Check it in Get tab → Identity.',
    editAgain: 'Edit again',
    saving: 'Saving...',
    save: 'Complete Prime Perspective →',
  },
};

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
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const maskProfile = primaryMask ? MASK_PROFILES.find(m => m.nameKo === primaryMask || m.mskCode === primaryMask) : null;

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
              <p className="text-sm font-semibold" style={{ color: maskProfile.color }}>{maskProfile.nameKo}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
            {s.maskDesc(maskProfile.nameKo, maskProfile.coreWound)}
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
