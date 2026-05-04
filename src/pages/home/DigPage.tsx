import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeature } from '@growthbook/growthbook-react';
import { FEATURES } from '@/lib/growthbook';
import { useMode } from '@/context/ModeContext';
import { useDigTranslations } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/context/LanguageContext';
import { ErrorState } from '@/components/ErrorState';
import { DigSearchForm } from '@/components/dig/DigSearchForm';
import { DigResultList } from '@/components/dig/DigResultList';
import { DigHistory } from '@/components/dig/DigHistory';
import PartnerPatternInference from '@/components/dig/PartnerPatternInference';
import ClearDigView from '@/components/dig/ClearDigView';
import CodetalkExplore from '@/components/dig/CodetalkExplore';
import { useDigPageData } from '@/hooks/useDigPageData';
import { usePremiumTrigger } from '@/hooks/usePremiumTrigger';
import UpgradeModal from '@/components/premium/UpgradeModal';
import CommunityInlineEmbed from '@/components/community/CommunityInlineEmbed';

const DIG_ACCENT = '#A78BFA';

function DigPageInner() {
  const dig = useDigTranslations();
  const navigate = useNavigate();
  const digToWhyNudge = useFeature(FEATURES.DIG_TO_WHY_NUDGE).value as string ?? 'on_back';
  const { language } = useLanguageContext();
  const [showWhyNudge, setShowWhyNudge] = useState(digToWhyNudge === 'always');
  const { isPro, modalOpen: premiumModalOpen, activeTrigger, closeModal } = usePremiumTrigger();
  const {
    situation, setSituation,
    divisionId, setDivisionId,
    text, setText,
    results,
    selected, setSelected,
    interpretation,
    interpreting,
    ventDismissed, setVentDismissed,
    recentVent,
    digHistory,
    digHistoryError,
    refetchHistory,
    domainCounts,
    comboPatternCounts,
    historyPatternIndex,
    patternProfiles,
    divisions,
    axisScores,
    searchMutation,
    handleSubmit,
  } = useDigPageData({ isPro });

  if (selected) {
    return (
      <div className="overflow-y-auto">
        <DigResultList
          selected={selected}
          results={results}
          situation={situation}
          domainCounts={domainCounts}
          comboPatternCounts={comboPatternCounts}
          patternProfiles={patternProfiles}
          interpretation={interpretation}
          interpreting={interpreting}
          onBack={() => { setSelected(null); if (digToWhyNudge === 'on_back') setShowWhyNudge(true); }}
          onSelectResult={setSelected}
        />
        <div className="px-4 pb-6 max-w-sm mx-auto">
          <CommunityInlineEmbed tab="dig" accent={DIG_ACCENT} />
        </div>
      </div>
    );
  }

  if (digHistoryError) {
    return <ErrorState title={dig.errorTitle} onRetry={() => refetchHistory()} />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-full">
      {/* 좌측: 입력 폼 영역 */}
      <div className="flex-1 px-4 py-6 space-y-5 overflow-y-auto max-w-2xl">
        <div>
          <h2 className="text-lg font-semibold">{dig.header}</h2>
          <p className="text-sm text-muted-foreground mt-1">{dig.subtitle}</p>
        </div>

        {recentVent && !ventDismissed && (
          <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-violet-400">{dig.ventPatternBanner}</p>
              </div>
              <button onClick={() => setVentDismissed(true)} className="text-xs text-muted-foreground">✕</button>
            </div>
            <p className="text-sm leading-relaxed">
              {recentVent.emotion && <span className="font-medium">{recentVent.emotion}</span>}
              {recentVent.context_summary && (
                <span className="text-muted-foreground"> — {recentVent.context_summary.slice(0, 80)}</span>
              )}
            </p>
            {recentVent.held_keywords && recentVent.held_keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(recentVent.held_keywords as string[]).slice(0, 5).map((kw: string, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400">
                    {kw.slice(0, 20)}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={() => { if (recentVent.emotion) setSituation(recentVent.emotion); setVentDismissed(true); }}
              className="text-xs text-violet-400 font-medium hover:underline"
            >
              {dig.ventPatternStart}
            </button>
          </div>
        )}

        {showWhyNudge && digToWhyNudge !== 'off' && (
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-indigo-400">
                {language === 'en' ? 'Wondering why this pattern repeats?' : '이 패턴이 반복되는 이유가 궁금하다면?'}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === 'en' ? 'WHY analysis helps uncover the root values behind the pattern.' : 'WHY 분석으로 패턴 이면의 핵심 가치관을 발견할 수 있어요.'}
              </p>
              <button
                onClick={() => navigate('/home/get')}
                className="text-xs text-indigo-400 font-medium hover:underline mt-1"
              >
                {language === 'en' ? 'Start WHY analysis →' : 'WHY 분석 시작하기 →'}
              </button>
            </div>
            <button onClick={() => setShowWhyNudge(false)} className="text-xs text-muted-foreground shrink-0">✕</button>
          </div>
        )}

        <DigSearchForm
          situation={situation}
          onSituationChange={setSituation}
          divisionId={divisionId}
          onDivisionIdChange={setDivisionId}
          divisions={divisions}
          text={text}
          onTextChange={setText}
          axisScores={axisScores}
          onSubmit={handleSubmit}
          isPending={searchMutation.isPending}
        />

        {(situation === '연인/파트너' || situation === '가족' || situation === '친구') && (
          <PartnerPatternInference
            onIntegrate={(inferredText) => setText(prev => prev ? `${prev}\n\n${inferredText}` : inferredText)}
          />
        )}

        {/* 모바일에서만 히스토리 인라인 표시 */}
        <div className="lg:hidden">
          <DigHistory
            digHistory={digHistory}
            domainCounts={domainCounts}
            comboPatternCounts={comboPatternCounts}
            historyPatternIndex={historyPatternIndex}
            patternProfiles={patternProfiles}
          />
        </div>

        {/* 자유 선택형 코드토크 탐색 */}
        <div className="border-t border-border pt-5">
          <CodetalkExplore />
        </div>
      </div>

      {/* 우측: 분석 히스토리 패널 — PC 전용 */}
      <aside className="hidden lg:block flex-shrink-0 overflow-y-auto border-l border-border"
        style={{ width: 320, padding: '24px 16px' }}>
        <p className="text-xs text-muted-foreground mb-4 tracking-wide">{dig.historyLabel}</p>
        <DigHistory
          digHistory={digHistory}
          domainCounts={domainCounts}
          comboPatternCounts={comboPatternCounts}
          historyPatternIndex={historyPatternIndex}
          patternProfiles={patternProfiles}
        />
      </aside>

      <UpgradeModal open={premiumModalOpen} trigger={activeTrigger} onClose={closeModal} />
    </div>
  );
}

export default function DigPage() {
  const { mode } = useMode();
  return mode === 'clear' ? <ClearDigView /> : <DigPageInner />;
}
