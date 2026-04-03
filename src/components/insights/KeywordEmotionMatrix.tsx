import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { KeywordEmotionMatrix as KeywordEmotionMatrixData } from "@/hooks/codetalk_hooks/useEmotionAnalysis";

interface KeywordEmotionMatrixProps {
  isLoading: boolean;
  keywordEmotionData: KeywordEmotionMatrixData[] | null | undefined;
}

export const KeywordEmotionMatrix = ({
  isLoading,
  keywordEmotionData,
}: KeywordEmotionMatrixProps) => {
  return (
    <Card className="opacity-80">
      <CardHeader>
        <CardTitle className="text-base md:text-lg">키워드-감정 매트릭스</CardTitle>
        <CardDescription className="text-sm">
          각 키워드가 어떤 감정을 주로 유발하는지 한눈에 확인하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 md:p-6">
        <div className="space-y-4">
          {/* Headers */}
          <div className="grid grid-cols-5 gap-1 text-xs font-medium">
            <div className="text-center">키워드</div>
            <div className="text-center text-green-600">긍정</div>
            <div className="text-center text-gray-600">중성</div>
            <div className="text-center text-red-600">부정</div>
            <div className="text-center text-purple-600">복합</div>
          </div>

          {/* Matrix Data */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-sm text-muted-foreground">키워드 감정 데이터 로딩 중...</div>
            </div>
          ) : !keywordEmotionData || keywordEmotionData.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-sm text-muted-foreground">분석할 키워드 감정 데이터가 없습니다.</div>
            </div>
          ) : (
            <div className="space-y-2">
              {keywordEmotionData?.map(row => (
                <div key={row.keyword} className="grid grid-cols-5 gap-1 items-center">
                  <div className="text-sm font-medium text-center">{row.keyword}</div>

                  {/* 긍정 */}
                  <div className="relative">
                    <div className="h-6 bg-green-100 rounded-md flex items-center justify-center">
                      <div className="absolute left-0 top-0 h-full bg-green-500 rounded-md transition-all" style={{ width: `${row.긍정}%` }} />
                      <span className="relative text-xs font-medium z-10 text-green-800">{row.긍정}%</span>
                    </div>
                  </div>

                  {/* 중성 */}
                  <div className="relative">
                    <div className="h-6 bg-gray-100 rounded-md flex items-center justify-center">
                      <div className="absolute left-0 top-0 h-full bg-gray-500 rounded-md transition-all" style={{ width: `${row.중성}%` }} />
                      <span className="relative text-xs font-medium z-10 text-gray-800">{row.중성}%</span>
                    </div>
                  </div>

                  {/* 부정 */}
                  <div className="relative">
                    <div className="h-6 bg-red-100 rounded-md flex items-center justify-center">
                      <div className="absolute left-0 top-0 h-full bg-red-500 rounded-md transition-all" style={{ width: `${row.부정}%` }} />
                      <span className="relative text-xs font-medium z-10 text-red-800">{row.부정}%</span>
                    </div>
                  </div>

                  {/* 복합 */}
                  <div className="relative">
                    <div className="h-6 bg-purple-100 rounded-md flex items-center justify-center">
                      <div className="absolute left-0 top-0 h-full bg-purple-500 rounded-md transition-all" style={{ width: `${row.복합}%` }} />
                      <span className="relative text-xs font-medium z-10 text-purple-800">{row.복합}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Insights */}
          <div className="bg-muted/20 rounded-lg p-3 mt-4">
            <h4 className="text-xs font-medium mb-2">💡 패턴 발견</h4>
            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              {keywordEmotionData && keywordEmotionData.length > 0 ? (
                keywordEmotionData.slice(0, 3).map((item, index) => {
                  const dominantEmotion = Math.max(item.긍정, item.중성, item.부정, item.복합);
                  let emotionName = '';
                  if (dominantEmotion === item.긍정) emotionName = '긍정적';
                  else if (dominantEmotion === item.중성) emotionName = '중성적';
                  else if (dominantEmotion === item.부정) emotionName = '부정적';
                  else emotionName = '복합적';
                  return (
                    <div key={index}>
                      • <strong>{item.keyword}</strong>은 주로 {emotionName} ({dominantEmotion}%)
                    </div>
                  );
                })
              ) : (
                <div>• 키워드 감정 패턴 분석 중...</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

