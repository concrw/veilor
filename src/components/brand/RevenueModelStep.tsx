import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Lightbulb, DollarSign } from "lucide-react";
import { useState } from "react";
import { useLanguageContext } from "@/context/LanguageContext";

const S = {
  ko: {
    cardTitle: "수익 모델",
    cardDesc: "브랜드의 수익화 전략을 구체적으로 설정하세요",
    primaryModelLabel: "주요 수익 모델",
    primaryModelPlaceholder: "직접 입력하거나 위에서 선택",
    pricePointsLabel: "가격 정책",
    pricePointPlaceholder: "새 가격 정책 입력",
    suggestedPrices: "추천 가격대:",
    channelsLabel: "수익화 채널",
    channelPlaceholder: "새 수익화 채널 입력",
    suggestedChannels: "추천 채널:",
    tipsTitle: "수익 모델 설계 팁",
    tip1: "시작",
    tip1Desc: ": 하나의 수익 모델로 시작해서 점진적 확장",
    tip2: "가격",
    tip2Desc: ": 타겟 고객의 지불 의사와 경쟁사 분석",
    tip3: "채널",
    tip3Desc: ": 고객이 자주 이용하는 플랫폼 우선",
    tip4: "검증",
    tip4Desc: ": MVP로 작게 시작해서 시장 반응 확인",
    summaryTitle: "수익 모델 요약",
    primaryModelSummary: "주요 모델:",
    primaryModelEmpty: "수익 모델을 선택하세요",
    pricePointsSummary: (n: number) => `가격 정책(${n}개):`,
    channelsSummary: (n: number) => `수익화 채널(${n}개):`,
    moreItems: (n: number) => ` 외 ${n}개`,
    projectionTitle: "💡 수익 예상",
    projectionWithData: (model: string, price: string) =>
      `${model} 모델로 ${price} 가격정책이라면, 월 10명 고객 확보 시 예상 수익을 계산해보세요.`,
    projectionEmpty: "수익 모델과 가격을 설정하면 예상 수익을 계산할 수 있습니다.",
    suggestedModelList: ["구독 서비스", "일회성 상품 판매", "컨설팅/코칭", "온라인 강의", "디지털 콘텐츠", "제휴 마케팅", "광고 수익", "커뮤니티 멤버십"],
    suggestedPriceList: ["무료 + 프리미엄", "월 9,900원", "월 29,000원", "월 99,000원", "일회성 50,000원", "일회성 100,000원", "일회성 300,000원", "시간당 50,000원", "시간당 100,000원", "프로젝트당 500,000원"],
    suggestedChannelList: ["개인 홈페이지", "클래스101", "탈잉", "인프런", "유데미", "브런치 구독", "유튜브 멤버십", "패트리온", "네이버 스마트스토어", "크몽", "숨고", "직접 판매"],
  },
  en: {
    cardTitle: "Revenue Model",
    cardDesc: "Define your brand's monetization strategy in detail",
    primaryModelLabel: "Primary Revenue Model",
    primaryModelPlaceholder: "Enter manually or select above",
    pricePointsLabel: "Pricing",
    pricePointPlaceholder: "Enter new price point",
    suggestedPrices: "Suggested price points:",
    channelsLabel: "Monetization Channels",
    channelPlaceholder: "Enter new monetization channel",
    suggestedChannels: "Suggested channels:",
    tipsTitle: "Revenue Model Design Tips",
    tip1: "Start",
    tip1Desc: ": Begin with one revenue model and expand gradually",
    tip2: "Pricing",
    tip2Desc: ": Analyze willingness to pay and competitors",
    tip3: "Channels",
    tip3Desc: ": Prioritize platforms your customers use most",
    tip4: "Validate",
    tip4Desc: ": Start small with an MVP and gauge market response",
    summaryTitle: "Revenue Model Summary",
    primaryModelSummary: "Primary Model:",
    primaryModelEmpty: "Select a revenue model",
    pricePointsSummary: (n: number) => `Pricing (${n}):`,
    channelsSummary: (n: number) => `Channels (${n}):`,
    moreItems: (n: number) => ` +${n} more`,
    projectionTitle: "💡 Revenue Estimate",
    projectionWithData: (model: string, price: string) =>
      `With a ${model} model at ${price}, calculate your expected revenue with 10 customers per month.`,
    projectionEmpty: "Set a revenue model and pricing to estimate your revenue.",
    suggestedModelList: ["Subscription Service", "One-time Product Sale", "Consulting/Coaching", "Online Courses", "Digital Content", "Affiliate Marketing", "Ad Revenue", "Community Membership"],
    suggestedPriceList: ["Free + Premium", "$9.99/mo", "$29/mo", "$99/mo", "One-time $50", "One-time $100", "One-time $300", "$50/hour", "$100/hour", "$500/project"],
    suggestedChannelList: ["Personal Website", "Teachable", "Gumroad", "Udemy", "Patreon", "YouTube Membership", "Substack", "Shopify", "Fiverr", "Direct Sales"],
  },
};

interface RevenueModel {
  primary_model: string;
  price_points: string[];
  monetization_channels: string[];
}

interface RevenueModelStepProps {
  revenueModel: RevenueModel;
  onUpdate: (model: RevenueModel) => void;
}

export const RevenueModelStep = ({
  revenueModel,
  onUpdate
}: RevenueModelStepProps) => {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [newPricePoint, setNewPricePoint] = useState("");
  const [newChannel, setNewChannel] = useState("");

  const updateField = (field: keyof RevenueModel, value: string | string[]) => {
    onUpdate({
      ...revenueModel,
      [field]: value
    });
  };

  const addItem = (field: 'price_points' | 'monetization_channels', item: string) => {
    if (item.trim() && !revenueModel[field].includes(item.trim())) {
      updateField(field, [...revenueModel[field], item.trim()]);
    }
  };

  const removeItem = (field: 'price_points' | 'monetization_channels', index: number) => {
    const newArray = [...revenueModel[field]];
    newArray.splice(index, 1);
    updateField(field, newArray);
  };

  const addSuggested = (field: 'price_points' | 'monetization_channels', item: string) => {
    if (!revenueModel[field].includes(item)) {
      updateField(field, [...revenueModel[field], item]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4" />
          {s.cardTitle}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {s.cardDesc}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Revenue Model */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">{s.primaryModelLabel}</Label>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {s.suggestedModelList.map((model) => (
              <button
                key={model}
                onClick={() => updateField('primary_model', model)}
                className={`text-xs p-2 border rounded-lg transition-all hover:border-primary/50 ${
                  revenueModel.primary_model === model
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border bg-background/50'
                }`}
              >
                {model}
              </button>
            ))}
          </div>

          <Input
            value={revenueModel.primary_model}
            onChange={(e) => updateField('primary_model', e.target.value)}
            placeholder={s.primaryModelPlaceholder}
            className="text-xs"
          />
        </div>

        {/* Price Points */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">{s.pricePointsLabel}</Label>

          {/* Current Price Points */}
          <div className="flex flex-wrap gap-1">
            {revenueModel.price_points.map((price, index) => (
              <Badge key={index} variant="default" className="text-xs bg-green-500/20">
                {price}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 w-3 h-3"
                  onClick={() => removeItem('price_points', index)}
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            ))}
          </div>

          {/* Add New Price Point */}
          <div className="flex gap-2">
            <Input
              value={newPricePoint}
              onChange={(e) => setNewPricePoint(e.target.value)}
              placeholder={s.pricePointPlaceholder}
              className="text-xs"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addItem('price_points', newPricePoint);
                  setNewPricePoint("");
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                addItem('price_points', newPricePoint);
                setNewPricePoint("");
              }}
              className="text-xs h-8"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Suggested Price Points */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">{s.suggestedPrices}</p>
            <div className="flex flex-wrap gap-1">
              {s.suggestedPriceList
                .filter(price => !revenueModel.price_points.includes(price))
                .map((price) => (
                <Button
                  key={price}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => addSuggested('price_points', price)}
                >
                  {price}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Monetization Channels */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">{s.channelsLabel}</Label>

          {/* Current Channels */}
          <div className="flex flex-wrap gap-1">
            {revenueModel.monetization_channels.map((channel, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-blue-500/20">
                {channel}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 w-3 h-3"
                  onClick={() => removeItem('monetization_channels', index)}
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
                  addItem('monetization_channels', newChannel);
                  setNewChannel("");
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                addItem('monetization_channels', newChannel);
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
                .filter(channel => !revenueModel.monetization_channels.includes(channel))
                .map((channel) => (
                <Button
                  key={channel}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => addSuggested('monetization_channels', channel)}
                >
                  {channel}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Strategy Tips */}
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

        {/* Business Model Canvas Preview */}
        <div className="border-t pt-4">
          <h5 className="text-xs font-medium mb-2">{s.summaryTitle}</h5>
          <div className="bg-background border rounded-lg p-3 space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground">{s.primaryModelSummary}</span>{" "}
              <span className="font-medium">
                {revenueModel.primary_model || s.primaryModelEmpty}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">{s.pricePointsSummary(revenueModel.price_points.length)}</span>{" "}
              {revenueModel.price_points.slice(0, 3).join(", ")}
              {revenueModel.price_points.length > 3 && s.moreItems(revenueModel.price_points.length - 3)}
            </div>
            <div>
              <span className="text-muted-foreground">{s.channelsSummary(revenueModel.monetization_channels.length)}</span>{" "}
              {revenueModel.monetization_channels.slice(0, 3).join(", ")}
              {revenueModel.monetization_channels.length > 3 && s.moreItems(revenueModel.monetization_channels.length - 3)}
            </div>
          </div>
        </div>

        {/* Revenue Projection Hint */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <h5 className="text-xs font-medium mb-1 text-primary">{s.projectionTitle}</h5>
          <p className="text-xs text-muted-foreground">
            {revenueModel.primary_model && revenueModel.price_points.length > 0
              ? s.projectionWithData(revenueModel.primary_model, revenueModel.price_points[0])
              : s.projectionEmpty}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
