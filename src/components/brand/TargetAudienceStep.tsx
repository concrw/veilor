import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Lightbulb, Users } from "lucide-react";
import { useState } from "react";
import { useLanguageContext } from "@/context/LanguageContext";

const S = {
  ko: {
    cardTitle: "타겟 고객",
    cardDesc: "브랜드가 타겟하는 고객층을 구체적으로 정의하세요",
    ageRangeLabel: "연령대",
    ageRangePlaceholder: "예: 25-35세, 30대, 20대 후반-30대 초반",
    ageRangeHint: "주요 타겟 고객의 연령대를 설정하세요",
    interestsLabel: "관심사",
    interestPlaceholder: "새 관심사 입력",
    suggestedInterests: "추천 관심사:",
    painPointsLabel: "페인포인트",
    painPointPlaceholder: "새 페인포인트 입력",
    suggestedPainPoints: "추천 페인포인트:",
    channelsLabel: "선호 채널",
    channelPlaceholder: "새 채널 입력",
    suggestedChannels: "추천 채널:",
    tipsTitle: "타겟 고객 설정 팁",
    tip1: "연령대",
    tip1Desc: ": 너무 넓지 않게, 구체적으로 설정하세요",
    tip2: "관심사",
    tip2Desc: ": 브랜드와 관련성이 높은 관심사 우선",
    tip3: "페인포인트",
    tip3Desc: ": 브랜드가 해결할 수 있는 문제들",
    tip4: "선호 채널",
    tip4Desc: ": 타겟이 실제로 활용하는 플랫폼",
    profileTitle: "타겟 고객 프로필",
    ageRangeSummary: "연령대:",
    ageRangeEmpty: "연령대를 설정하세요",
    interestsSummary: (n: number) => `관심사(${n}개):`,
    painPointsSummary: (n: number) => `페인포인트(${n}개):`,
    channelsSummary: (n: number) => `선호 채널(${n}개):`,
    moreItems: (n: number) => ` 외 ${n}개`,
    suggestedInterestList: ["자기계발", "커리어", "창업", "투자", "마케팅", "디자인", "기술", "라이프스타일", "건강", "여행", "요리", "패션", "뷰티", "육아", "교육", "문화예술"],
    suggestedPainPointList: ["시간 부족", "정보 부족", "스킬 부족", "동기 부족", "방향성 혼란", "업무 스트레스", "번아웃", "인간관계", "재정 관리", "일-생활 균형", "진로 고민", "학습 어려움", "의사결정 어려움", "변화 적응"],
    suggestedChannelList: ["유튜브", "인스타그램", "블로그", "팟캐스트", "뉴스레터", "온라인 강의", "웨비나", "커뮤니티", "메신저", "소셜미디어", "오프라인 모임"],
  },
  en: {
    cardTitle: "Target Audience",
    cardDesc: "Define the customer segment your brand is targeting",
    ageRangeLabel: "Age Range",
    ageRangePlaceholder: "e.g. 25-35, 30s, late 20s - early 30s",
    ageRangeHint: "Set the age range of your primary target customers",
    interestsLabel: "Interests",
    interestPlaceholder: "Enter new interest",
    suggestedInterests: "Suggested interests:",
    painPointsLabel: "Pain Points",
    painPointPlaceholder: "Enter new pain point",
    suggestedPainPoints: "Suggested pain points:",
    channelsLabel: "Preferred Channels",
    channelPlaceholder: "Enter new channel",
    suggestedChannels: "Suggested channels:",
    tipsTitle: "Target Audience Tips",
    tip1: "Age Range",
    tip1Desc: ": Keep it specific, not too broad",
    tip2: "Interests",
    tip2Desc: ": Prioritize interests highly relevant to your brand",
    tip3: "Pain Points",
    tip3Desc: ": Problems your brand can solve",
    tip4: "Preferred Channels",
    tip4Desc: ": Platforms your target actually uses",
    profileTitle: "Target Audience Profile",
    ageRangeSummary: "Age Range:",
    ageRangeEmpty: "Set age range",
    interestsSummary: (n: number) => `Interests (${n}):`,
    painPointsSummary: (n: number) => `Pain Points (${n}):`,
    channelsSummary: (n: number) => `Preferred Channels (${n}):`,
    moreItems: (n: number) => ` +${n} more`,
    suggestedInterestList: ["Self-improvement", "Career", "Entrepreneurship", "Investing", "Marketing", "Design", "Technology", "Lifestyle", "Health", "Travel", "Cooking", "Fashion", "Beauty", "Parenting", "Education", "Arts & Culture"],
    suggestedPainPointList: ["Lack of time", "Lack of information", "Lack of skills", "Lack of motivation", "Direction confusion", "Work stress", "Burnout", "Relationships", "Financial management", "Work-life balance", "Career concerns", "Learning difficulties", "Decision-making", "Adapting to change"],
    suggestedChannelList: ["YouTube", "Instagram", "Blog", "Podcast", "Newsletter", "Online Courses", "Webinars", "Community", "Messaging Apps", "Social Media", "Offline Events"],
  },
};

interface TargetAudience {
  age_range: string;
  interests: string[];
  pain_points: string[];
  preferred_channels: string[];
}

interface TargetAudienceStepProps {
  targetAudience: TargetAudience;
  onUpdate: (audience: TargetAudience) => void;
}

export const TargetAudienceStep = ({
  targetAudience,
  onUpdate
}: TargetAudienceStepProps) => {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [newInterest, setNewInterest] = useState("");
  const [newPainPoint, setNewPainPoint] = useState("");
  const [newChannel, setNewChannel] = useState("");

  const updateField = (field: keyof TargetAudience, value: string | string[]) => {
    onUpdate({
      ...targetAudience,
      [field]: value
    });
  };

  const addItem = (field: 'interests' | 'pain_points' | 'preferred_channels', item: string) => {
    if (item.trim() && !targetAudience[field].includes(item.trim())) {
      updateField(field, [...targetAudience[field], item.trim()]);
    }
  };

  const removeItem = (field: 'interests' | 'pain_points' | 'preferred_channels', index: number) => {
    const newArray = [...targetAudience[field]];
    newArray.splice(index, 1);
    updateField(field, newArray);
  };

  const addSuggested = (field: 'interests' | 'pain_points' | 'preferred_channels', item: string) => {
    if (!targetAudience[field].includes(item)) {
      updateField(field, [...targetAudience[field], item]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4" />
          {s.cardTitle}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {s.cardDesc}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Age Range */}
        <div className="space-y-2">
          <Label htmlFor="age-range" className="text-xs font-medium">
            {s.ageRangeLabel}
          </Label>
          <Input
            id="age-range"
            value={targetAudience.age_range}
            onChange={(e) => updateField('age_range', e.target.value)}
            placeholder={s.ageRangePlaceholder}
            className="text-xs"
          />
          <p className="text-xs text-muted-foreground">
            {s.ageRangeHint}
          </p>
        </div>

        {/* Interests */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">{s.interestsLabel}</Label>

          {/* Current Interests */}
          <div className="flex flex-wrap gap-1">
            {targetAudience.interests.map((interest, index) => (
              <Badge key={index} variant="default" className="text-xs bg-blue-500/20">
                {interest}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 w-3 h-3"
                  onClick={() => removeItem('interests', index)}
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            ))}
          </div>

          {/* Add New Interest */}
          <div className="flex gap-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder={s.interestPlaceholder}
              className="text-xs"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addItem('interests', newInterest);
                  setNewInterest("");
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                addItem('interests', newInterest);
                setNewInterest("");
              }}
              className="text-xs h-8"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Suggested Interests */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">{s.suggestedInterests}</p>
            <div className="flex flex-wrap gap-1">
              {s.suggestedInterestList
                .filter(interest => !targetAudience.interests.includes(interest))
                .map((interest) => (
                <Button
                  key={interest}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => addSuggested('interests', interest)}
                >
                  {interest}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Pain Points */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">{s.painPointsLabel}</Label>

          {/* Current Pain Points */}
          <div className="flex flex-wrap gap-1">
            {targetAudience.pain_points.map((pain, index) => (
              <Badge key={index} variant="destructive" className="text-xs bg-red-500/20">
                {pain}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 w-3 h-3"
                  onClick={() => removeItem('pain_points', index)}
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            ))}
          </div>

          {/* Add New Pain Point */}
          <div className="flex gap-2">
            <Input
              value={newPainPoint}
              onChange={(e) => setNewPainPoint(e.target.value)}
              placeholder={s.painPointPlaceholder}
              className="text-xs"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addItem('pain_points', newPainPoint);
                  setNewPainPoint("");
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                addItem('pain_points', newPainPoint);
                setNewPainPoint("");
              }}
              className="text-xs h-8"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Suggested Pain Points */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">{s.suggestedPainPoints}</p>
            <div className="flex flex-wrap gap-1">
              {s.suggestedPainPointList
                .filter(pain => !targetAudience.pain_points.includes(pain))
                .map((pain) => (
                <Button
                  key={pain}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => addSuggested('pain_points', pain)}
                >
                  {pain}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Preferred Channels */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">{s.channelsLabel}</Label>

          {/* Current Channels */}
          <div className="flex flex-wrap gap-1">
            {targetAudience.preferred_channels.map((channel, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-green-500/20">
                {channel}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 w-3 h-3"
                  onClick={() => removeItem('preferred_channels', index)}
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
                  addItem('preferred_channels', newChannel);
                  setNewChannel("");
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                addItem('preferred_channels', newChannel);
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
                .filter(channel => !targetAudience.preferred_channels.includes(channel))
                .map((channel) => (
                <Button
                  key={channel}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => addSuggested('preferred_channels', channel)}
                >
                  {channel}
                </Button>
              ))}
            </div>
          </div>
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
          <h5 className="text-xs font-medium mb-2">{s.profileTitle}</h5>
          <div className="bg-background border rounded-lg p-3 space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground">{s.ageRangeSummary}</span>{" "}
              <span className="font-medium">
                {targetAudience.age_range || s.ageRangeEmpty}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">{s.interestsSummary(targetAudience.interests.length)}</span>{" "}
              {targetAudience.interests.slice(0, 3).join(", ")}
              {targetAudience.interests.length > 3 && s.moreItems(targetAudience.interests.length - 3)}
            </div>
            <div>
              <span className="text-muted-foreground">{s.painPointsSummary(targetAudience.pain_points.length)}</span>{" "}
              {targetAudience.pain_points.slice(0, 3).join(", ")}
              {targetAudience.pain_points.length > 3 && s.moreItems(targetAudience.pain_points.length - 3)}
            </div>
            <div>
              <span className="text-muted-foreground">{s.channelsSummary(targetAudience.preferred_channels.length)}</span>{" "}
              {targetAudience.preferred_channels.slice(0, 3).join(", ")}
              {targetAudience.preferred_channels.length > 3 && s.moreItems(targetAudience.preferred_channels.length - 3)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
