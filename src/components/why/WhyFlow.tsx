// V-File Why 10단계 플로우 컴포넌트 (조합)
// 0단계: 준비 → 1단계: 직업 브레인스토밍(10분) → 2단계: 직업 정의 →
// 3단계: 각인 순간 → 4단계: 행복/고통/중립 분류 → 5단계: 이유 작성 →
// 6단계: 직접 경험 여부 → 7단계: 1차 AI 분석 → 8단계: 2차 분석 →
// 9단계: 가치관 매핑 → 10단계: Prime Perspective 도출

import { useState } from 'react';
import { useFeature } from '@growthbook/growthbook-react';
import { useWhySession } from '@/hooks/useWhySession';
import { useWhyJobs } from '@/hooks/useWhyJobs';
import { useWhyFlowAnalysis } from '@/hooks/useWhyFlowAnalysis';
import { useLanguageContext } from '@/context/LanguageContext';
import { FEATURES } from '@/lib/growthbook';
import { StepReady } from './steps/StepReady';
import { StepBrainstorm } from './steps/StepBrainstorm';
import { StepDefinition } from './steps/StepDefinition';
import { StepImprint } from './steps/StepImprint';
import { StepClassify } from './steps/StepClassify';
import { StepReason } from './steps/StepReason';
import { StepExperience } from './steps/StepExperience';
import { StepAnalysis7 } from './steps/StepAnalysis7';
import { StepImprint8 } from './steps/StepImprint8';
import { StepValueMap9 } from './steps/StepValueMap9';
import { StepPrimePerspective } from './steps/StepPrimePerspective';

const S = {
  ko: {
    stepLabels: [
      '준비',
      '직업 브레인스토밍',
      '직업 정의',
      '각인 순간',
      '행복/고통 분류',
      '이유 작성',
      '경험 여부',
      '1차 분석',
      '각인 연결',
      '가치관 매핑',
      'Prime Perspective',
    ] as string[],
  },
  en: {
    stepLabels: [
      'Ready',
      'Career Brainstorming',
      'Career Definition',
      'Imprint Moment',
      'Happy/Pain Classification',
      'Write Reason',
      'Experience Check',
      'Phase 1 Analysis',
      'Imprint Connection',
      'Value Mapping',
      'Prime Perspective',
    ] as string[],
  },
};

export default function WhyFlow() {
  const { language } = useLanguageContext();
  const loc = S[language] ?? S.ko;
  const whyHint = useFeature(FEATURES.WHY_ONBOARDING_HINT).value ?? 'none';
  const [hintDismissed, setHintDismissed] = useState(false);
  const s = useWhySession();
  const j = useWhyJobs({
    user: s.user,
    session: s.session,
    setSession: s.setSession,
    jobs: s.jobs,
    setJobs: s.setJobs,
    step: s.step,
    setStep: s.setStep,
    happySet: s.happySet,
    setHappySet: s.setHappySet,
    painSet: s.painSet,
    setPainSet: s.setPainSet,
    createSession: s.createSession,
    updateSessionStep: s.updateSessionStep,
    timerRef: s.timerRef,
  });
  const a = useWhyFlowAnalysis({
    user: s.user,
    session: s.session,
    setSession: s.setSession,
    jobs: s.jobs,
    step: s.step,
    setStep: s.setStep,
    analyzing: s.analyzing,
    setAnalyzing: s.setAnalyzing,
    analysisResult: s.analysisResult,
    setAnalysisResult: s.setAnalysisResult,
    ppText: s.ppText,
    setPpText: s.setPpText,
    ppSaving: s.ppSaving,
    setPpSaving: s.setPpSaving,
    m43: s.m43,
    updateSessionStep: s.updateSessionStep,
  });

  if (s.loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 진행바 */}
      {s.step > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{loc.stepLabels[s.step]}</span>
            <span>{s.progressPct}%</span>
          </div>
          <div className="h-1 bg-muted rounded-full">
            <div className="h-1 bg-primary rounded-full transition-all" style={{ width: `${s.progressPct}%` }} />
          </div>
        </div>
      )}

      {/* WHY 온보딩 힌트 (feature flag: why_onboarding_hint) */}
      {s.step === 0 && whyHint === 'tooltip' && !hintDismissed && (
        <div className="relative bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 text-sm text-muted-foreground">
          {language === 'en'
            ? 'Tip: WHY analysis helps you uncover the root values behind your career choices.'
            : '팁: WHY 분석은 직업 선택 이면의 핵심 가치관을 발견하는 여정입니다.'}
          <button onClick={() => setHintDismissed(true)} className="absolute top-2 right-3 text-xs opacity-40 hover:opacity-80">✕</button>
        </div>
      )}
      {s.step === 0 && whyHint === 'modal' && !hintDismissed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-base font-semibold">
              {language === 'en' ? 'Before you begin WHY' : 'WHY 시작 전 안내'}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {language === 'en'
                ? 'This 10-step journey uncovers the values that shape your career decisions. Take your time — there are no right or wrong answers.'
                : '10단계 플로우를 통해 직업 선택 이면의 가치관을 탐색합니다. 정답은 없으니 천천히 진행하세요.'}
            </p>
            <button
              onClick={() => setHintDismissed(true)}
              className="w-full py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground"
            >
              {language === 'en' ? 'Got it' : '확인'}
            </button>
          </div>
        </div>
      )}

      {s.step === 0 && (
        <StepReady onStart={async () => {
          const sess = await s.createSession();
          if (sess) s.setStep(1);
        }} />
      )}

      {s.step === 1 && (
        <StepBrainstorm
          memoText={j.memoText}
          setMemoText={j.setMemoText}
          timerRunning={s.timerRunning}
          secondsLeft={s.secondsLeft}
          formatTime={s.formatTime}
          startTimer={s.startTimer}
          onDone={j.handleStep1Done}
        />
      )}

      {s.step === 2 && j.currentJobForDef && (
        <StepDefinition
          job={j.currentJobForDef}
          jobIdx={j.jobIdx}
          totalJobs={s.jobs.length}
          defText={j.defText}
          setDefText={j.setDefText}
          onPrev={() => j.setJobIdx(j.jobIdx - 1)}
          onNext={j.handleStep2Next}
        />
      )}

      {s.step === 3 && j.currentJobForMem && (
        <StepImprint
          job={j.currentJobForMem}
          jobIdx={j.jobIdx}
          totalJobs={s.jobs.length}
          memText={j.memText}
          setMemText={j.setMemText}
          onPrev={() => j.setJobIdx(j.jobIdx - 1)}
          onNext={j.handleStep3Next}
        />
      )}

      {s.step === 4 && (
        <StepClassify
          jobs={s.jobs}
          happySet={s.happySet}
          painSet={s.painSet}
          toggleHappy={j.toggleHappy}
          togglePain={j.togglePain}
          onDone={j.handleStep4Done}
        />
      )}

      {s.step === 5 && j.currentJobForReason && (
        <StepReason
          job={j.currentJobForReason}
          reasonIdx={j.reasonIdx}
          totalClassified={j.classifiedJobs.length}
          reasonText={j.reasonText}
          setReasonText={j.setReasonText}
          onPrev={() => j.setReasonIdx(j.reasonIdx - 1)}
          onNext={j.handleStep5Next}
        />
      )}

      {s.step === 6 && j.currentJobForExp && (
        <StepExperience
          job={j.currentJobForExp}
          expIdx={j.expIdx}
          totalJobs={s.jobs.length}
          hasExp={j.hasExp}
          setHasExp={j.setHasExp}
          expNote={j.expNote}
          setExpNote={j.setExpNote}
          onPrev={() => j.setExpIdx(j.expIdx - 1)}
          onNext={() => j.handleStep6Next(a.runAnalysis)}
        />
      )}

      {s.step === 7 && (
        <StepAnalysis7
          analyzing={s.analyzing}
          analysisResult={s.analysisResult}
          m43Analysis={s.m43.analysis}
          onNext={a.advanceToStep8}
        />
      )}

      {s.step === 8 && (
        <StepImprint8
          jobs={s.jobs}
          m43Analysis={s.m43.analysis}
          onPrev={() => s.setStep(7)}
          onNext={a.advanceToStep9}
        />
      )}

      {s.step === 9 && (
        <StepValueMap9
          m43Analysis={s.m43.analysis}
          analysisResult={s.analysisResult}
          setPpText={s.setPpText}
          onPrev={() => s.setStep(8)}
          onNext={a.advanceToStep10}
        />
      )}

      {s.step === 10 && (
        <StepPrimePerspective
          session={s.session}
          analysisResult={s.analysisResult}
          m43Analysis={s.m43.analysis}
          ppText={s.ppText}
          setPpText={s.setPpText}
          ppSaving={s.ppSaving}
          onSave={a.savePrimePerspective}
          onViewAnalysis={() => s.setStep(7)}
        />
      )}
    </div>
  );
}
