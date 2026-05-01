/**
 * WhyAnalysisTrigger Component
 * Button to trigger Why pattern analysis
 * Shows requirements and warnings before analysis
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Sparkles, AlertCircle, CheckCircle2, Info } from "lucide-react";
import {
  useJobEntryStats,
  useAnalyzeWhyPatterns,
  hasEnoughDataForAnalysis,
} from "@/hooks/useWhyAnalysis";
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    checkingData: '데이터 확인 중...',
    triggerButton: 'Why 패턴 분석하기',
    dialogTitle: 'Why 패턴 분석',
    dialogDesc: 'AI가 당신의 행복과 고통 패턴을 분석하여 Prime Perspective를 도출합니다',
    currentDataTitle: '현재 데이터 현황',
    totalCareers: '총 직업 수',
    experienced: '경험한 직업',
    happyCareers: '행복 직업',
    painCareers: '고통 직업',
    requirementsTitle: '분석 요구사항',
    req1: (current: number) => `최소 10개 이상의 직업 (현재: ${current}개)`,
    req2: (current: number) => `최소 3개 이상의 행복 직업 (현재: ${current}개)`,
    req3: (current: number) => `최소 3개 이상의 고통 직업 (현재: ${current}개)`,
    warningPartial: '현재 데이터로도 분석이 가능하지만, 더 정확한 결과를 위해서는 최소 요구사항을 충족하는 것을 권장합니다. 추가로 직업을 입력하거나 지금 바로 분석할 수 있습니다.',
    warningInsufficient: '분석을 위해 최소 5개 이상의 직업이 필요합니다. 더 많은 직업을 추가해주세요.',
    warningEnough: '충분한 데이터가 확보되었습니다. 신뢰도 높은 분석 결과를 받을 수 있습니다!',
    processTitle: '분석 과정:',
    processBullet1: 'AI가 행복/고통 직업의 키워드를 추출합니다',
    processBullet2: '반복 패턴을 분석하여 공통점을 찾습니다',
    processBullet3: '각인 순간과 연결하여 근본 원인을 파악합니다',
    processBullet4: 'Prime Perspective를 자동 생성합니다',
    processDuration: '분석은 약 30초~1분 정도 소요됩니다.',
    cancel: '취소',
    analyzing: '분석 중...',
    startAnalysis: '분석 시작',
  },
  en: {
    checkingData: 'Checking data...',
    triggerButton: 'Analyze Why Patterns',
    dialogTitle: 'Why Pattern Analysis',
    dialogDesc: 'AI analyzes your happiness and pain patterns to derive your Prime Perspective',
    currentDataTitle: 'Current Data Status',
    totalCareers: 'Total careers',
    experienced: 'Experienced',
    happyCareers: 'Happy careers',
    painCareers: 'Pain careers',
    requirementsTitle: 'Analysis Requirements',
    req1: (current: number) => `At least 10 careers required (current: ${current})`,
    req2: (current: number) => `At least 3 happy careers required (current: ${current})`,
    req3: (current: number) => `At least 3 pain careers required (current: ${current})`,
    warningPartial: 'Analysis is possible with current data, but meeting minimum requirements is recommended for more accurate results. You can add more careers or analyze now.',
    warningInsufficient: 'At least 5 careers are needed for analysis. Please add more.',
    warningEnough: 'Sufficient data acquired. You can expect reliable analysis results!',
    processTitle: 'Analysis process:',
    processBullet1: 'AI extracts keywords from happy/pain careers',
    processBullet2: 'Analyzes repeating patterns to find commonalities',
    processBullet3: 'Connects with imprint moments to identify root causes',
    processBullet4: 'Automatically generates your Prime Perspective',
    processDuration: 'Analysis takes about 30 seconds to 1 minute.',
    cancel: 'Cancel',
    analyzing: 'Analyzing...',
    startAnalysis: 'Start Analysis',
  },
};

interface WhyAnalysisTriggerProps {
  sessionId?: string;
  onAnalysisComplete?: () => void;
}

export function WhyAnalysisTrigger({
  sessionId,
  onAnalysisComplete,
}: WhyAnalysisTriggerProps) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: stats, isLoading: statsLoading } = useJobEntryStats();
  const { mutate: analyze, isPending } = useAnalyzeWhyPatterns();

  const handleAnalyze = () => {
    analyze(
      { sessionId },
      {
        onSuccess: () => {
          setDialogOpen(false);
          onAnalysisComplete?.();
        },
      }
    );
  };

  if (statsLoading) {
    return (
      <Button disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        {s.checkingData}
      </Button>
    );
  }

  if (!stats) {
    return null;
  }

  const hasEnoughData = hasEnoughDataForAnalysis(stats);
  const canAnalyze = stats.total >= 5; // Minimum requirement

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          disabled={!canAnalyze}
          className="w-full md:w-auto"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {s.triggerButton}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{s.dialogTitle}</DialogTitle>
          <DialogDescription>
            {s.dialogDesc}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Data Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{s.currentDataTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{s.totalCareers}</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.experienced}</p>
                  <p className="text-2xl font-bold">{stats.with_experience}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.happyCareers}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.happy}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.painCareers}</p>
                  <p className="text-2xl font-bold text-red-600">{stats.pain}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements Check */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{s.requirementsTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                {stats.total >= 10 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                )}
                <span className="text-sm">{s.req1(stats.total)}</span>
              </div>
              <div className="flex items-center gap-2">
                {stats.happy >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                )}
                <span className="text-sm">{s.req2(stats.happy)}</span>
              </div>
              <div className="flex items-center gap-2">
                {stats.pain >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                )}
                <span className="text-sm">{s.req3(stats.pain)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Warning or Info */}
          {!hasEnoughData && canAnalyze && (
            <Alert className="bg-orange-50 border-orange-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {s.warningPartial}
              </AlertDescription>
            </Alert>
          )}

          {!canAnalyze && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {s.warningInsufficient}
              </AlertDescription>
            </Alert>
          )}

          {hasEnoughData && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                {s.warningEnough}
              </AlertDescription>
            </Alert>
          )}

          {/* What happens next */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">{s.processTitle}</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• {s.processBullet1}</li>
                <li>• {s.processBullet2}</li>
                <li>• {s.processBullet3}</li>
                <li>• {s.processBullet4}</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                {s.processDuration}
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            {s.cancel}
          </Button>
          <Button
            onClick={handleAnalyze}
            disabled={!canAnalyze || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {s.analyzing}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {s.startAnalysis}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
