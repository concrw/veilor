import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    ruminationComment: '반추 루프 위험 감지: pain 비율 + 세션 반복 횟수 기반',
    ruminationRiskMessage: '같은 고통을 반복해서 들여다보고 있어요. 이건 처리가 아니라 반추일 수 있습니다.',
    ruminationRiskAction: '지금은 분석보다 "다음 한 걸음"이 더 필요할 수 있어요.',
    ruminationWatchMessage: '고통스러운 부분에 오래 머물고 있어요.',
    ruminationWatchAction: '탐색은 충분히 했습니다. 이제 작은 행동으로 옮겨볼 때가 됐을 수 있어요.',
    diveButton: 'DIVE로 감정 처리하기',
    stopButton: '오늘은 여기까지',
    cardTitle: '분석 결과',
    viewResults: '자세한 결과 페이지에서 키워드·테마·AI 분석을 확인하세요',
    unlockFeatures: '분석을 완료하면 Ikigai 설계와 커뮤니티 매칭을 사용할 수 있습니다',
    processing: '처리중',
    markComplete: '분석 완료 처리',
    analysisComplete: '분석이 완료되었습니다',
    ikigaiDesign: 'Ikigai 설계',
    communityMatching: '커뮤니티 매칭',
    prevStep: '이전 단계',
    edit: '수정하기',
    noPrevSteps: '먼저 이전 단계를 완료해주세요.',
    toastCompleteTitle: '분석 완료',
    toastCompleteDesc: '이제 모든 기능을 사용할 수 있습니다.',
    toastFailTitle: '업데이트 실패',
    toastFailDesc: '잠시 후 다시 시도해주세요.',
    labelHappiness: '행복',
    labelSuffering: '고통',
    labelNeutral: '중립',
  },
  en: {
    ruminationComment: 'Rumination loop risk detected: pain ratio + session repetition count',
    ruminationRiskMessage: "You've been repeatedly looking at the same pain. This may be rumination rather than processing.",
    ruminationRiskAction: "Right now, a 'next small step' may be more useful than more analysis.",
    ruminationWatchMessage: "You've been dwelling on the painful parts for a while.",
    ruminationWatchAction: "You've explored enough. It may be time to take small action.",
    diveButton: 'Process emotions with DIVE',
    stopButton: "That's enough for today",
    cardTitle: 'Analysis Results',
    viewResults: 'View keywords, themes, and AI analysis on the detailed results page',
    unlockFeatures: 'Complete analysis to unlock Ikigai design and community matching',
    processing: 'Processing',
    markComplete: 'Mark analysis complete',
    analysisComplete: 'Analysis complete',
    ikigaiDesign: 'Ikigai Design',
    communityMatching: 'Community Matching',
    prevStep: 'Prev step',
    edit: 'Edit',
    noPrevSteps: 'Please complete the previous steps first.',
    toastCompleteTitle: 'Analysis complete',
    toastCompleteDesc: 'All features are now available.',
    toastFailTitle: 'Update failed',
    toastFailDesc: 'Please try again later.',
    labelHappiness: 'HAPPINESS',
    labelSuffering: 'SUFFERING',
    labelNeutral: 'NEUTRAL',
  },
};

// Rumination loop risk detection: pain ratio + session repetition count
function detectRuminationRisk(
  painCount: number,
  totalCount: number,
  whySessionCount: number,
  s: typeof S.ko
): { level: 'safe' | 'watch' | 'risk'; message: string; action: string } | null {
  if (totalCount === 0) return null;
  const painRatio = painCount / totalCount;

  // 3+ repetitions + pain > 70% → rumination risk
  if (whySessionCount >= 3 && painRatio >= 0.7) {
    return {
      level: 'risk',
      message: s.ruminationRiskMessage,
      action: s.ruminationRiskAction,
    };
  }
  // 2+ repetitions + pain > 80% → watch
  if (whySessionCount >= 2 && painRatio >= 0.8) {
    return {
      level: 'watch',
      message: s.ruminationWatchMessage,
      action: s.ruminationWatchAction,
    };
  }
  return null;
}

interface Job {
  id: string;
  job_name: string;
  definition: string | null;
  first_memory: string | null;
  category: "happy" | "pain" | "neutral" | null;
  reason?: string | null;
}

interface Step4ResultsSectionProps {
  jobs: Job[];
  onPrevStep: () => void;
  onGoBackToEditMode: () => void;
}

export const Step4ResultsSection = ({
  jobs,
  onPrevStep,
  onGoBackToEditMode
}: Step4ResultsSectionProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [analysisCompleted, setAnalysisCompleted] = useState<boolean | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [whySessionCount, setWhySessionCount] = useState(0);

  // Check analysis status + Why session count
  useEffect(() => {
    const checkAnalysisStatus = async () => {
      if (!user?.id) return;

      try {
        const [profileRes, sessionRes] = await Promise.all([
          supabase.from('profiles').select('has_completed_analysis').eq('id', user.id).single(),
          supabase.from('why_sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        ]);

        if (profileRes.error) {
          setAnalysisCompleted(false);
        } else {
          setAnalysisCompleted(profileRes.data.has_completed_analysis || false);
        }
        setWhySessionCount(sessionRes.count ?? 0);
      } catch {
        setAnalysisCompleted(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAnalysisStatus();
  }, [user?.id]);

  // Handle marking analysis complete
  const handleCompleteAnalysis = async () => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ has_completed_analysis: true })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setAnalysisCompleted(true);
      toast({
        title: s.toastCompleteTitle,
        description: s.toastCompleteDesc,
      });
    } catch (error: unknown) {
      console.error('Error updating analysis status:', error);
      toast({
        title: s.toastFailTitle,
        description: s.toastFailDesc,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (jobs.length === 0) {
    return (
      <section className="space-y-4" data-step-visible="4">
        <div className="py-12 text-center text-sm text-muted-foreground">
          {s.noPrevSteps}
        </div>
      </section>
    );
  }

  const happyCount = jobs.filter(j => j.category === "happy").length;
  const painCount = jobs.filter(j => j.category === "pain").length;
  const neutralCount = jobs.filter(j => j.category === "neutral").length;
  const ruminationRisk = detectRuminationRisk(painCount, jobs.length, whySessionCount, s);

  return (
    <section className="space-y-4" data-step-visible="4">
      {/* Rumination loop warning banner */}
      {ruminationRisk && (
        <div className={`rounded-xl p-4 space-y-2 border ${
          ruminationRisk.level === 'risk'
            ? 'bg-amber-500/5 border-amber-500/30'
            : 'bg-yellow-500/5 border-yellow-500/20'
        }`}>
          <div className="flex items-start gap-2">
            <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${
              ruminationRisk.level === 'risk' ? 'text-amber-500' : 'text-yellow-500'
            }`} />
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">{ruminationRisk.message}</p>
              <p className="text-xs text-muted-foreground">{ruminationRisk.action}</p>
            </div>
          </div>
          <div className="flex gap-2 pl-6">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => navigate('/dive')}
            >
              {s.diveButton}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 text-muted-foreground"
              onClick={() => navigate('/')}
            >
              {s.stopButton}
            </Button>
          </div>
        </div>
      )}

      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="text-sm">{s.cardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Simple summary */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xs text-muted-foreground mb-1">{s.labelHappiness}</div>
              <div className="text-lg font-light">{happyCount}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">{s.labelSuffering}</div>
              <div className="text-lg font-light">{painCount}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">{s.labelNeutral}</div>
              <div className="text-lg font-light">{neutralCount}</div>
            </div>
          </div>

          <div className="text-center">
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/why-analysis')}
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-4"
            >
              {s.viewResults}
            </Button>
          </div>

          {/* Analysis completion status */}
          {!isLoading && (
            <div className="border-t pt-4 space-y-3">
              {analysisCompleted === false ? (
                <>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-3">
                      {s.unlockFeatures}
                    </p>
                    <Button
                      onClick={handleCompleteAnalysis}
                      disabled={isUpdating}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          {s.processing}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {s.markComplete}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : analysisCompleted === true ? (
                <div className="text-center space-y-2">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {s.analysisComplete}
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => navigate('/ikigai')}
                      className="text-xs h-auto p-1"
                    >
                      {s.ikigaiDesign}
                    </Button>
                    <span className="text-xs text-muted-foreground self-center">·</span>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => navigate('/community')}
                      className="text-xs h-auto p-1"
                    >
                      {s.communityMatching}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between gap-2">
        <Button variant="secondary" size="sm" onClick={onPrevStep}>
          {s.prevStep}
        </Button>
        <Button size="sm" onClick={onGoBackToEditMode}>
          {s.edit}
        </Button>
      </div>
    </section>
  );
};
