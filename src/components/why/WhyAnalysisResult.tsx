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
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    jobsAnalyzed: (n: number) => `${n}개 직업 분석`,
    primePerspectiveTitle: '당신의 Prime Perspective',
    primePerspectiveDesc: '당신을 나답게 만드는 가장 근원적인 관점',
    happyCareers: '행복 직업',
    painCareers: '고통 직업',
    experienceRate: '경험 비율',
    consistency: '일관성',
    happyPatterns: '행복 패턴',
    painPatterns: '고통 패턴',
    happyElementsTitle: '행복을 느끼는 요소',
    happyElementsDesc: '당신이 행복을 느끼는 직업에서 발견된 공통 패턴',
    coreKeywords: '핵심 키워드',
    topPatterns: '상위 패턴',
    appearedTimes: (n: number) => `${n}회 등장`,
    relatedCareers: '관련 직업: ',
    moreCareers: (n: number) => ` 외 ${n}개`,
    rootCause: '근본 원인',
    painElementsTitle: '고통을 느끼는 요소',
    painElementsDesc: '당신이 피하고 싶어하는 직업에서 발견된 공통 패턴',
    nextStepsTitle: '다음 단계',
    nextStep1Strong: 'Ikigai 설계:',
    nextStep1Body: 'Prime Perspective를 바탕으로 나만의 Ikigai를 완성하세요',
    nextStep2Strong: '브랜드 디자인:',
    nextStep2Body: '발견된 패턴을 활용해 퍼스널 브랜드를 만들어보세요',
    nextStep3Strong: '커뮤니티 매칭:',
    nextStep3Body: '비슷한 Prime Perspective를 가진 사람들을 만나보세요',
  },
  en: {
    jobsAnalyzed: (n: number) => `${n} careers analyzed`,
    primePerspectiveTitle: 'Your Prime Perspective',
    primePerspectiveDesc: 'The most fundamental perspective that makes you yourself',
    happyCareers: 'Happy careers',
    painCareers: 'Pain careers',
    experienceRate: 'Experience rate',
    consistency: 'Consistency',
    happyPatterns: 'Happy patterns',
    painPatterns: 'Pain patterns',
    happyElementsTitle: 'Elements that bring happiness',
    happyElementsDesc: 'Common patterns found in careers that bring you happiness',
    coreKeywords: 'Core keywords',
    topPatterns: 'Top patterns',
    appearedTimes: (n: number) => `Appeared ${n} times`,
    relatedCareers: 'Related careers: ',
    moreCareers: (n: number) => ` +${n} more`,
    rootCause: 'Root cause',
    painElementsTitle: 'Elements that cause pain',
    painElementsDesc: 'Common patterns found in careers you want to avoid',
    nextStepsTitle: 'Next steps',
    nextStep1Strong: 'Ikigai Design:',
    nextStep1Body: 'Complete your Ikigai based on your Prime Perspective',
    nextStep2Strong: 'Brand Design:',
    nextStep2Body: 'Build your personal brand using discovered patterns',
    nextStep3Strong: 'Community Matching:',
    nextStep3Body: 'Meet people with similar Prime Perspectives',
  },
};

interface WhyAnalysisResultProps {
  analysis: AnalysisResult;
  showDetailedPatterns?: boolean;
}

export function WhyAnalysisResult({
  analysis,
  showDetailedPatterns = true,
}: WhyAnalysisResultProps) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

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
              {s.jobsAnalyzed(analysis_data.total_jobs)}
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
                            {s.appearedTimes(pattern.frequency)}
                          </span>
                        </div>
                        <Progress
                          value={(pattern.frequency / analysis_data.happy_count) * 100}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {s.relatedCareers}{pattern.jobs.slice(0, 3).join(", ")}
                          {pattern.jobs.length > 3 && s.moreCareers(pattern.jobs.length - 3)}
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
                            {s.appearedTimes(pattern.frequency)}
                          </span>
                        </div>
                        <Progress
                          value={(pattern.frequency / analysis_data.pain_count) * 100}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {s.relatedCareers}{pattern.jobs.slice(0, 3).join(", ")}
                          {pattern.jobs.length > 3 && s.moreCareers(pattern.jobs.length - 3)}
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
