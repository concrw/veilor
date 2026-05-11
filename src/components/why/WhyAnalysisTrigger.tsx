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
import { useT } from '@/i18n/useT';

interface WhyAnalysisTriggerProps {
  sessionId?: string;
  onAnalysisComplete?: () => void;
}

export function WhyAnalysisTrigger({
  sessionId,
  onAnalysisComplete,
}: WhyAnalysisTriggerProps) {
  const t = useT();
  const s = t.why.analysisTrigger;

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
                <span className="text-sm">{s.req1.replace('{current}', String(stats.total))}</span>
              </div>
              <div className="flex items-center gap-2">
                {stats.happy >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                )}
                <span className="text-sm">{s.req2.replace('{current}', String(stats.happy))}</span>
              </div>
              <div className="flex items-center gap-2">
                {stats.pain >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                )}
                <span className="text-sm">{s.req3.replace('{current}', String(stats.pain))}</span>
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
