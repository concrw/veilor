import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, CheckCircle, Zap, Star, TrendingUp } from "lucide-react";
import { INSIGHT_CONSTANTS } from "@/lib/insightConstants";
import { KeywordDiversityHeatmap } from "@/components/insights/KeywordDiversityHeatmap";
import type { KeywordDiversityData } from "@/hooks/codetalk_hooks/useKeywordDiversity";
import type { DynamicInsight } from "@/hooks/codetalk_hooks/useDynamicInsights";
import type { LucideIcon } from "lucide-react";

interface KeywordStat {
  keyword: string;
  diversity: number;
  definitions: number;
}

interface DiversityStats {
  consensusKeywords: number;
  balancedKeywords: number;
  diverseKeywords: number;
  totalKeywords: number;
  mostConsensus: KeywordStat | null;
  mostDiverse: KeywordStat | null;
  mostBalanced: KeywordStat | null;
}

interface KeywordDiversityCardProps {
  isLoading: boolean;
  displayedKeywordData: KeywordDiversityData[];
  diversityStats: DiversityStats | null | undefined;
  dynamicInsights: DynamicInsight[];
}

const InsightCard = ({ icon: Icon, label, color, stat, suffix }: {
  icon: LucideIcon; label: string; color: string; stat: KeywordStat | null | undefined; suffix: string;
}) => (
  <div className={`bg-${color}-50 dark:bg-${color}-950/20 border border-${color}-200 dark:border-${color}-800 rounded-lg p-4`}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`h-4 w-4 text-${color}-600`} />
      <span className={`text-sm font-medium text-${color}-700 dark:text-${color}-300`}>{label}</span>
    </div>
    {stat ? (
      <>
        <p className={`text-lg font-bold text-${color}-800 dark:text-${color}-200`}>
          {stat.keyword} ({stat.diversity}%)
        </p>
        <p className={`text-xs text-${color}-600 dark:text-${color}-400`}>
          {stat.definitions}개 정의, {suffix}
        </p>
      </>
    ) : (
      <p className="text-sm text-muted-foreground">데이터 로딩 중...</p>
    )}
  </div>
);

const DistributionBar = ({ count, total, label, colorClass }: {
  count: number; total: number; label: string; colorClass: string;
}) => (
  <div className="text-center">
    <div className={`text-2xl font-bold ${colorClass}`}>{count}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className={`w-full bg-${colorClass.replace('text-', '')}/20 rounded-full h-2 mt-2`}>
      <div className={`${colorClass.replace('text-', 'bg-')} h-2 rounded-full`}
        style={{ width: `${total ? count / total * 100 : 0}%` }} />
    </div>
  </div>
);

export const KeywordDiversityCard = ({
  isLoading, displayedKeywordData, diversityStats, dynamicInsights,
}: KeywordDiversityCardProps) => {
  const { CONSENSUS, DIVERSE } = INSIGHT_CONSTANTS.DIVERSITY_THRESHOLDS;

  return (
    <Card className="opacity-80">
      <CardHeader>
        <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Brain className="h-4 w-4 md:h-5 md:w-5" />
              키워드별 해석 다양성
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              집단지성이 만들어낸 해석의 다양성을 통계적으로 분석합니다.
              <br />
              더 다양한 키워드별 해석 다양성이 궁금하시면 AI 프리미엄 집단지성 인사이트를 참고하세요.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-6 space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground">키워드 다양성 분석 중...</div>
          </div>
        ) : displayedKeywordData.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground">분석할 키워드 데이터가 없습니다.</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InsightCard icon={CheckCircle} label="가장 합의된 키워드" color="green" stat={diversityStats?.mostConsensus} suffix="높은 일치도" />
              <InsightCard icon={Zap} label="가장 논란 많은 키워드" color="red" stat={diversityStats?.mostDiverse} suffix="매우 다양한 해석" />
              <InsightCard icon={Star} label="균형잡힌 키워드" color="blue" stat={diversityStats?.mostBalanced} suffix="적절한 다양성" />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">다양성 분포</h3>
              <div className="grid grid-cols-3 gap-4">
                <DistributionBar count={diversityStats?.consensusKeywords || 0} total={diversityStats?.totalKeywords || 0} label={`합의형 (${CONSENSUS}% 미만)`} colorClass="text-green-600" />
                <DistributionBar count={diversityStats?.balancedKeywords || 0} total={diversityStats?.totalKeywords || 0} label={`균형형 (${CONSENSUS}-${DIVERSE}%)`} colorClass="text-yellow-600" />
                <DistributionBar count={diversityStats?.diverseKeywords || 0} total={diversityStats?.totalKeywords || 0} label={`다양형 (${DIVERSE}% 이상)`} colorClass="text-red-600" />
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                흥미로운 발견
              </h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="text-xs text-muted-foreground">인사이트 생성 중...</div>
                  </div>
                ) : dynamicInsights.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-xs text-muted-foreground">충분한 데이터가 없어 인사이트를 생성할 수 없습니다.</div>
                  </div>
                ) : (
                  dynamicInsights.map(insight => (
                    <div key={insight.id} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                      <span>{insight.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <KeywordDiversityHeatmap data={displayedKeywordData} />
          </>
        )}
      </CardContent>
    </Card>
  );
};
