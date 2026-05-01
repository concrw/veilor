import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, TrendingUp, Users } from "lucide-react";
import { useKeywordDetails } from "@/hooks/useKeywordDetails";
import { useLanguageContext } from "@/context/LanguageContext";

const S = {
  ko: {
    definitionCount: (n: number) => `${n}개 정의`,
    statsSummary: '통계 요약',
    mostEmotion: '가장 많은 감정',
    loading: '로딩 중...',
    emotionDesc: (e: string) => `이 키워드는 주로 ${e}적인 감정으로 해석됩니다.`,
    noData: '데이터를 불러올 수 없습니다.',
    avgLikes: '평균 공감도',
    avgLikesDesc: (n: number) => `정의당 평균 ${n}개의 좋아요를 받고 있습니다.`,
    participants: '참여자 수',
    participantsDesc: (n: number) => `총 ${n}명이 참여했습니다.`,
    avgLength: '평균 길이',
    avgLengthDesc: (n: number) => `평균 ${n}자로 작성됩니다.`,
    keyDefinitions: '주요 정의들',
    loadingDefs: '정의를 불러오는 중...',
    noDefinitions: '아직 정의가 없습니다.',
  },
  en: {
    definitionCount: (n: number) => `${n} definitions`,
    statsSummary: 'Stats Summary',
    mostEmotion: 'Top Emotion',
    loading: 'Loading...',
    emotionDesc: (e: string) => `This keyword is mostly interpreted with a ${e} emotion.`,
    noData: 'Unable to load data.',
    avgLikes: 'Avg. Resonance',
    avgLikesDesc: (n: number) => `Averaging ${n} likes per definition.`,
    participants: 'Participants',
    participantsDesc: (n: number) => `${n} people have participated.`,
    avgLength: 'Avg. Length',
    avgLengthDesc: (n: number) => `Averaging ${n} characters per definition.`,
    keyDefinitions: 'Key Definitions',
    loadingDefs: 'Loading definitions...',
    noDefinitions: 'No definitions yet.',
  },
} as const;

interface KeywordDialogProps {
  keyword: string;
  definitionCount: number;
  children: React.ReactNode;
}

export const KeywordDialog = ({ keyword, definitionCount, children }: KeywordDialogProps) => {
  const { data: keywordDetails, isLoading } = useKeywordDetails(keyword);
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto m-2">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-2xl font-bold flex items-center gap-2">
            {keyword}
            <Badge variant="secondary" className="text-xs">
              {s.definitionCount(definitionCount)}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* 통계 요약 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{s.statsSummary}</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4" />
                    <span className="font-medium">{s.mostEmotion}</span>
                  </div>
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">{s.loading}</p>
                  ) : keywordDetails ? (
                    <p className="text-sm text-muted-foreground">
                      {s.emotionDesc(keywordDetails.insights.mostCommonEmotion)}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">{s.noData}</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">{s.avgLikes}</span>
                  </div>
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">{s.loading}</p>
                  ) : keywordDetails ? (
                    <p className="text-sm text-muted-foreground">
                      {s.avgLikesDesc(keywordDetails.insights.averageLikes)}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">{s.noData}</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{s.participants}</span>
                  </div>
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">{s.loading}</p>
                  ) : keywordDetails ? (
                    <p className="text-sm text-muted-foreground">
                      {s.participantsDesc(keywordDetails.insights.uniqueAuthors)}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">{s.noData}</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">{s.avgLength}</span>
                  </div>
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">{s.loading}</p>
                  ) : keywordDetails ? (
                    <p className="text-sm text-muted-foreground">
                      {s.avgLengthDesc(keywordDetails.insights.averageLength)}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">{s.noData}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 주요 정의들 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{s.keyDefinitions}</h3>
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">{s.loadingDefs}</p>
                </div>
              ) : keywordDetails && keywordDetails.definitions.length > 0 ? (
                keywordDetails.definitions.map((def, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <p className="text-sm mb-2">"{def.text}"</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>- {def.author}</span>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="text-xs">
                            {def.emotion}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{def.likes}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">{s.noDefinitions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};