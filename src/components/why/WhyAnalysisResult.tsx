/**
 * WhyAnalysisResult Component
 * Displays the results of Why pattern analysis including:
 * - Prime Perspective
 * - Happy/Pain keywords
 * - Pattern analysis
 * - Root causes
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  Info,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import {
  AnalysisResult,
  getAnalysisQuality,
  getConsistencyPercentage,
} from "@/hooks/useWhyAnalysis";
import { useT } from '@/i18n/useT';

interface WhyAnalysisResultProps {
  analysis: AnalysisResult;
  showDetailedPatterns?: boolean;
}

export function WhyAnalysisResult({
  analysis,
  showDetailedPatterns = true,
}: WhyAnalysisResultProps) {
  const t = useT();
  const s = t.why.analysisResult;

  const { analysis_data } = analysis;
  const quality = getAnalysisQuality(analysis_data);
  const consistencyPercentage = getConsistencyPercentage(
    analysis_data.root_causes.consistency_score
  );

  return (
    <div className="space-y-6">
      {/* Quality Indicator */}
      <Alert
        className={
          quality.quality === "excellent"
            ? "bg-green-50 border-green-200"
            : quality.quality === "good"
            ? "bg-blue-50 border-blue-200"
            : quality.quality === "fair"
            ? "bg-yellow-50 border-yellow-200"
            : "bg-orange-50 border-orange-200"
        }
      >
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>{quality.message}</span>
            <Badge variant="outline" className="ml-2">
              {s.jobsAnalyzed.replace('{n}', String(analysis_data.total_jobs))}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Prime Perspective - Main Result */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>{s.primePerspectiveTitle}</CardTitle>
          </div>
          <CardDescription>
            {s.primePerspectiveDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-semibold leading-relaxed text-center py-4">
            "{analysis.prime_perspective}"
          </p>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">{s.happyCareers}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-2xl font-bold">{analysis_data.happy_count}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">{s.painCareers}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-2xl font-bold">{analysis_data.pain_count}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">{s.experienceRate}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span className="text-2xl font-bold">
                {Math.round(analysis_data.experience_ratio * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">{s.consistency}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-500" />
              <span className="text-2xl font-bold">{consistencyPercentage}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keywords and Patterns */}
      <Tabs defaultValue="happy" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="happy">
            <TrendingUp className="w-4 h-4 mr-2" />
            {s.happyPatterns}
          </TabsTrigger>
          <TabsTrigger value="pain">
            <TrendingDown className="w-4 h-4 mr-2" />
            {s.painPatterns}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="happy" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{s.happyElementsTitle}</CardTitle>
              <CardDescription>
                {s.happyElementsDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Keywords */}
              <div>
                <h4 className="text-sm font-medium mb-2">{s.coreKeywords}</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.happy_keywords.slice(0, 10).map((keyword, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Patterns */}
              {showDetailedPatterns && analysis_data.happy_patterns.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">{s.topPatterns}</h4>
                  <div className="space-y-3">
                    {analysis_data.happy_patterns.slice(0, 5).map((pattern, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{pattern.keyword}</span>
                          <span className="text-xs text-muted-foreground">
                            {s.appearedTimes.replace('{n}', String(pattern.frequency))}
                          </span>
                        </div>
                        <Progress
                          value={(pattern.frequency / analysis_data.happy_count) * 100}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {s.relatedCareers}{pattern.jobs.slice(0, 3).join(", ")}
                          {pattern.jobs.length > 3 && s.moreCareers.replace('{n}', String(pattern.jobs.length - 3))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Root Cause */}
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {s.rootCause}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {analysis_data.root_causes.happy_root}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pain" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{s.painElementsTitle}</CardTitle>
              <CardDescription>
                {s.painElementsDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Keywords */}
              <div>
                <h4 className="text-sm font-medium mb-2">{s.coreKeywords}</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.pain_keywords.slice(0, 10).map((keyword, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-red-100 text-red-700"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Patterns */}
              {showDetailedPatterns && analysis_data.pain_patterns.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">{s.topPatterns}</h4>
                  <div className="space-y-3">
                    {analysis_data.pain_patterns.slice(0, 5).map((pattern, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{pattern.keyword}</span>
                          <span className="text-xs text-muted-foreground">
                            {s.appearedTimes.replace('{n}', String(pattern.frequency))}
                          </span>
                        </div>
                        <Progress
                          value={(pattern.frequency / analysis_data.pain_count) * 100}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {s.relatedCareers}{pattern.jobs.slice(0, 3).join(", ")}
                          {pattern.jobs.length > 3 && s.moreCareers.replace('{n}', String(pattern.jobs.length - 3))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Root Cause */}
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {s.rootCause}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {analysis_data.root_causes.pain_root}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Next Steps Suggestion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{s.nextStepsTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              <span>
                <strong>{s.nextStep1Strong}</strong> {s.nextStep1Body}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              <span>
                <strong>{s.nextStep2Strong}</strong> {s.nextStep2Body}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              <span>
                <strong>{s.nextStep3Strong}</strong> {s.nextStep3Body}
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
