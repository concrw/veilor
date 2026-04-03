import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import type { ReflectionStory } from "@/hooks/codetalk_hooks/useDeepReflectionStories";

interface DeepReflectionSectionProps {
  isLoading: boolean;
  reflectionStories: ReflectionStory[] | null | undefined;
}

const getBorderColor = (sentiment?: string) => {
  switch (sentiment) {
    case 'positive':
      return 'border-l-green-500';
    case 'negative':
      return 'border-l-blue-500';
    default:
      return 'border-l-purple-500';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
};

export const DeepReflectionSection = ({
  isLoading,
  reflectionStories,
}: DeepReflectionSectionProps) => {
  return (
    <Card className="opacity-80">
      <CardHeader>
        <CardTitle className="text-base md:text-lg">깊이 있는 사색</CardTitle>
        <CardDescription className="text-sm">
          최근 가장 깊이 있게 써진 각인 스토리들
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 md:p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground">깊이 있는 사색 로딩 중...</div>
          </div>
        ) : !reflectionStories || reflectionStories.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground">
              아직 깊이 있는 사색 스토리가 충분하지 않습니다.<br />
              더 많은 참여가 있으면 보여드릴게요!
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {reflectionStories.map((story) => (
              <Card key={story.id} className={`border-l-4 ${getBorderColor(story.sentiment)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{story.keyword}</Badge>
                      <span className="text-xs text-muted-foreground">• 익명</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>깊이: {story.depth_score}점</span>
                      <span>{formatDate(story.created_at)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">정의:</p>
                      <p className="text-sm font-medium">{story.definition}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">인상:</p>
                      <p className="text-sm leading-relaxed">{story.impression}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{story.definition.length + story.impression.length}자</span>
                    <div className="flex items-center gap-2">
                      <Heart className="h-3 w-3" />
                      <span>{Math.floor(Math.random() * 50) + 10}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
