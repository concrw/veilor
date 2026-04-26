import { useMode } from '@/context/ModeContext';
import { ErrorState } from '@/components/ErrorState';
import { DigSearchForm } from '@/components/dig/DigSearchForm';
import { DigResultList } from '@/components/dig/DigResultList';
import { DigHistory } from '@/components/dig/DigHistory';
import PartnerPatternInference from '@/components/dig/PartnerPatternInference';
import ClearDigView from '@/components/dig/ClearDigView';
import { useDigPageData } from '@/hooks/useDigPageData';

function DigPageInner() {
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
  } = useDigPageData();

  if (selected) {
    return (
      <DigResultList
        selected={selected}
        results={results}
        situation={situation}
        domainCounts={domainCounts}
        comboPatternCounts={comboPatternCounts}
        patternProfiles={patternProfiles}
        interpretation={interpretation}
        interpreting={interpreting}
        onBack={() => { setSelected(null); }}
        onSelectResult={setSelected}
      />
    );
  }

  if (digHistoryError) {
    return <ErrorState title="Dig 데이터를 불러오지 못했습니다" onRetry={() => refetchHistory()} />;
  }

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Dig</h2>
        <p className="text-sm text-muted-foreground mt-1">왜 이런 패턴이 반복되는지 파고들어요.</p>
      </div>

      {recentVent && !ventDismissed && (
        <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-violet-400">Vent에서 이런 패턴이 보였어요</p>
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
            이 맥락으로 탐색 시작하기
          </button>
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

      <DigHistory
        digHistory={digHistory}
        domainCounts={domainCounts}
        comboPatternCounts={comboPatternCounts}
        historyPatternIndex={historyPatternIndex}
        patternProfiles={patternProfiles}
      />
    </div>
  );
}

export default function DigPage() {
  const { mode } = useMode();
  return mode === 'clear' ? <ClearDigView /> : <DigPageInner />;
}
