import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Lightbulb } from "lucide-react";
import { useState } from "react";
import { useLanguageContext } from "@/context/LanguageContext";

const S = {
  ko: {
    cardTitle: "콘텐츠 전략",
    cardDesc: "브랜드 콘텐츠의 주제, 형식, 채널을 설정하세요",
    topicsLabel: "콘텐츠 주제",
    topicPlaceholder: "새 주제 입력",
    suggestedTopics: "추천 주제:",
    formatsLabel: "콘텐츠 형식",
    formatPlaceholder: "새 형식 입력",
    suggestedFormats: "추천 형식:",
    channelsLabel: "배포 채널",
    channelPlaceholder: "새 채널 입력",
    suggestedChannels: "추천 채널:",
    cadenceLabel: "발행 빈도",
    cadencePlaceholder: "예: 주 3회, 매일, 격주",
    cadenceHint: "지속 가능한 빈도로 설정하세요",
    tipsTitle: "콘텐츠 전략 팁",
    tip1: "주제",
    tip1Desc: ": 타겟 고객의 관심사와 일치하는 주제 선택",
    tip2: "형식",
    tip2Desc: ": 본인이 잘 만들 수 있는 형식부터 시작",
    tip3: "채널",
    tip3Desc: ": 타겟이 많이 이용하는 플랫폼 우선",
    tip4: "빈도",
    tip4Desc: ": 꾸준함이 가장 중요합니다",
    summaryTitle: "콘텐츠 전략 요약",
    topicsSummary: (n: number) => `주제(${n}개):`,
    formatsSummary: (n: number) => `형식(${n}개):`,
    channelsSummary: (n: number) => `채널(${n}개):`,
    cadenceSummary: "빈도:",
    cadenceEmpty: "빈도를 설정하세요",
    moreItems: (n: number) => ` 외 ${n}개`,
    suggestedTopicList: ["실무 팁", "트렌드 분석", "케이스 스터디", "인사이트", "경험담", "튜토리얼", "리뷰", "인터뷰", "Q&A", "라이프스타일"],
    suggestedFormatList: ["블로그 포스트", "숏폼 영상", "긴 영상", "인포그래픽", "팟캐스트", "뉴스레터", "라이브 방송", "웨비나", "이미지 카드", "캐러셀"],
    suggestedChannelList: ["인스타그램", "유튜브", "블로그", "링크드인", "틱톡", "브런치", "네이버 블로그", "페이스북", "트위터", "개인 홈페이지"],
  },
  en: {
    cardTitle: "Content Strategy",
    cardDesc: "Set topics, formats, and channels for your brand content",
    topicsLabel: "Content Topics",
    topicPlaceholder: "Enter new topic",
    suggestedTopics: "Suggested topics:",
    formatsLabel: "Content Formats",
    formatPlaceholder: "Enter new format",
    suggestedFormats: "Suggested formats:",
    channelsLabel: "Distribution Channels",
    channelPlaceholder: "Enter new channel",
    suggestedChannels: "Suggested channels:",
    cadenceLabel: "Publishing Frequency",
    cadencePlaceholder: "e.g. 3x/week, daily, bi-weekly",
    cadenceHint: "Set a sustainable frequency",
    tipsTitle: "Content Strategy Tips",
    tip1: "Topics",
    tip1Desc: ": Choose topics that align with your target audience's interests",
    tip2: "Formats",
    tip2Desc: ": Start with formats you can create well",
    tip3: "Channels",
    tip3Desc: ": Prioritize platforms your target uses most",
    tip4: "Frequency",
    tip4Desc: ": Consistency is the most important factor",
    summaryTitle: "Content Strategy Summary",
    topicsSummary: (n: number) => `Topics (${n}):`,
    formatsSummary: (n: number) => `Formats (${n}):`,
    channelsSummary: (n: number) => `Channels (${n}):`,
    cadenceSummary: "Frequency:",
    cadenceEmpty: "Set publishing frequency",
    moreItems: (n: number) => ` +${n} more`,
    suggestedTopicList: ["Practical Tips", "Trend Analysis", "Case Studies", "Insights", "Personal Stories", "Tutorials", "Reviews", "Interviews", "Q&A", "Lifestyle"],
    suggestedFormatList: ["Blog Post", "Short-form Video", "Long Video", "Infographic", "Podcast", "Newsletter", "Live Stream", "Webinar", "Image Card", "Carousel"],
    suggestedChannelList: ["Instagram", "YouTube", "Blog", "LinkedIn", "TikTok", "Medium", "Naver Blog", "Facebook", "Twitter", "Personal Website"],
  },
};

interface ContentStrategy {
  topics: string[];
  formats: string[];
  channels: string[];
  cadence: string;
}

interface ContentStrategyStepProps {
  contentStrategy: ContentStrategy;
  onUpdate: (strategy: ContentStrategy) => void;
}

export const ContentStrategyStep = ({
  contentStrategy,
  onUpdate
}: ContentStrategyStepProps) => {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [newTopic, setNewTopic] = useState("");
  const [newFormat, setNewFormat] = useState("");
  const [newChannel, setNewChannel] = useState("");

  const updateField = (field: keyof ContentStrategy, value: string | string[]) => {
    onUpdate({
      ...contentStrategy,
      [field]: value
    });
  };

  const addItem = (field: 'topics' | 'formats' | 'channels', item: string) => {
    if (item.trim() && !contentStrategy[field].includes(item.trim())) {
      updateField(field, [...contentStrategy[field], item.trim()]);
    }
  };

  const removeItem = (field: 'topics' | 'formats' | 'channels', index: number) => {
    const newArray = [...contentStrategy[field]];
    newArray.splice(index, 1);
    updateField(field, newArray);
  };

  const addSuggested = (field: 'topics' | 'formats' | 'channels', item: string) => {
    if (!contentStrategy[field].includes(item)) {
      updateField(field, [...contentStrategy[field], item]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <span className="w-4 h-4 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center">📝</span>
          {s.cardTitle}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {s.cardDesc}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Topics */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">{s.topicsLabel}</Label>

          {/* Current Topics */}
          <div className="flex flex-wrap gap-1">
            {contentStrategy.topics.map((topic, index) => (
              <Badge key={index} variant="default" className="text-xs">
                {topic}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 w-3 h-3"
                  onClick={() => removeItem('topics', index)}
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            ))}
          </div>

          {/* Add New Topic */}
          <div className="flex gap-2">
            <Input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder={s.topicPlaceholder}
              className="text-xs"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addItem('topics', newTopic);
                  setNewTopic("");
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                addItem('topics', newTopic);
                setNewTopic("");
              }}
              className="text-xs h-8"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Suggested Topics */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">{s.suggestedTopics}</p>
            <div className="flex flex-wrap gap-1">
              {s.suggestedTopicList
                .filter(topic => !contentStrategy.topics.includes(topic))
                .map((topic) => (
                <Button
                  key={topic}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => addSuggested('topics', topic)}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Formats */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">{s.formatsLabel}</Label>

          {/* Current Formats */}
          <div className="flex flex-wrap gap-1">
            {contentStrategy.formats.map((format, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {format}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 w-3 h-3"
                  onClick={() => removeItem('formats', index)}
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            ))}
          </div>

          {/* Add New Format */}
          <div className="flex gap-2">
            <Input
              value={newFormat}
              onChange={(e) => setNewFormat(e.target.value)}
              placeholder={s.formatPlaceholder}
              className="text-xs"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addItem('formats', newFormat);
                  setNewFormat("");
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                addItem('formats', newFormat);
                setNewFormat("");
              }}
              className="text-xs h-8"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Suggested Formats */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">{s.suggestedFormats}</p>
            <div className="flex flex-wrap gap-1">
              {s.suggestedFormatList
                .filter(format => !contentStrategy.formats.includes(format))
                .map((format) => (
                <Button
                  key={format}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => addSuggested('formats', format)}
                >
                  {format}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Channels */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">{s.channelsLabel}</Label>

          {/* Current Channels */}
          <div className="flex flex-wrap gap-1">
            {contentStrategy.channels.map((channel, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {channel}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 w-3 h-3"
                  onClick={() => removeItem('channels', index)}
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            ))}
          </div>

          {/* Add New Channel */}
          <div className="flex gap-2">
            <Input
              value={newChannel}
              onChange={(e) => setNewChannel(e.target.value)}
              placeholder={s.channelPlaceholder}
              className="text-xs"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addItem('channels', newChannel);
                  setNewChannel("");
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                addItem('channels', newChannel);
                setNewChannel("");
              }}
              className="text-xs h-8"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Suggested Channels */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">{s.suggestedChannels}</p>
            <div className="flex flex-wrap gap-1">
              {s.suggestedChannelList
                .filter(channel => !contentStrategy.channels.includes(channel))
                .map((channel) => (
                <Button
                  key={channel}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => addSuggested('channels', channel)}
                >
                  {channel}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Cadence */}
        <div className="space-y-2">
          <Label htmlFor="cadence" className="text-xs font-medium">
            {s.cadenceLabel}
          </Label>
          <Input
            id="cadence"
            value={contentStrategy.cadence}
            onChange={(e) => updateField('cadence', e.target.value)}
            placeholder={s.cadencePlaceholder}
            className="text-xs"
          />
          <p className="text-xs text-muted-foreground">
            {s.cadenceHint}
          </p>
        </div>

        {/* Tips */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5" />
            <div>
              <h5 className="text-xs font-medium mb-1">{s.tipsTitle}</h5>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>{s.tip1}</strong>{s.tip1Desc}</li>
                <li>• <strong>{s.tip2}</strong>{s.tip2Desc}</li>
                <li>• <strong>{s.tip3}</strong>{s.tip3Desc}</li>
                <li>• <strong>{s.tip4}</strong>{s.tip4Desc}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="border-t pt-4">
          <h5 className="text-xs font-medium mb-2">{s.summaryTitle}</h5>
          <div className="bg-background border rounded-lg p-3 space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground">{s.topicsSummary(contentStrategy.topics.length)}</span>{" "}
              {contentStrategy.topics.slice(0, 3).join(", ")}
              {contentStrategy.topics.length > 3 && s.moreItems(contentStrategy.topics.length - 3)}
            </div>
            <div>
              <span className="text-muted-foreground">{s.formatsSummary(contentStrategy.formats.length)}</span>{" "}
              {contentStrategy.formats.slice(0, 3).join(", ")}
              {contentStrategy.formats.length > 3 && s.moreItems(contentStrategy.formats.length - 3)}
            </div>
            <div>
              <span className="text-muted-foreground">{s.channelsSummary(contentStrategy.channels.length)}</span>{" "}
              {contentStrategy.channels.slice(0, 3).join(", ")}
              {contentStrategy.channels.length > 3 && s.moreItems(contentStrategy.channels.length - 3)}
            </div>
            <div>
              <span className="text-muted-foreground">{s.cadenceSummary}</span>{" "}
              {contentStrategy.cadence || s.cadenceEmpty}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
