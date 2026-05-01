import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lightbulb } from "lucide-react";
import { useLanguageContext } from "@/context/LanguageContext";

const S = {
  ko: {
    cardTitle: "브랜드 방향",
    cardDesc: "브랜드의 핵심 방향성을 설정하세요",
    fieldLabel: "활동 분야",
    fieldPlaceholder: "예: 디지털 마케팅, 라이프스타일 콘텐츠, 교육 기술",
    fieldHint: "어떤 분야에서 활동할지 명확히 정의하세요",
    positioningLabel: "포지셔닝",
    positioningPlaceholder: "예: 실무진을 위한 마케팅 전문가, 20대를 위한 라이프 멘토",
    positioningHint: "타겟 고객에게 어떤 전문가로 인식되고 싶은지 설정하세요",
    coreMessageLabel: "핵심 메시지",
    coreMessagePlaceholder: "예: 복잡한 마케팅을 단순하게, 실무에서 바로 쓸 수 있는 인사이트를 제공합니다",
    coreMessageHint: "브랜드가 전달하고자 하는 핵심 가치와 메시지를 작성하세요",
    tipsTitle: "브랜드 방향 설정 팁",
    tip1: "분야",
    tip1Desc: ": 너무 넓지 않게, 구체적인 영역으로 좁히세요",
    tip2: "포지셔닝",
    tip2Desc: ': "누구를 위한 어떤 전문가"인지 명확히 하세요',
    tip3: "메시지",
    tip3Desc: ": 타겟의 문제를 어떻게 해결하는지 담으세요",
    previewTitle: "브랜드 방향 미리보기",
    previewField: "분야:",
    previewFieldEmpty: "분야를 입력하세요",
    previewPositioning: "포지셔닝:",
    previewPositioningEmpty: "포지셔닝을 입력하세요",
    previewMessage: "메시지:",
    previewMessageEmpty: "핵심 메시지를 입력하세요",
  },
  en: {
    cardTitle: "Brand Direction",
    cardDesc: "Set the core direction of your brand",
    fieldLabel: "Activity Field",
    fieldPlaceholder: "e.g. Digital Marketing, Lifestyle Content, EdTech",
    fieldHint: "Clearly define the field you will operate in",
    positioningLabel: "Positioning",
    positioningPlaceholder: "e.g. Marketing expert for practitioners, Life mentor for 20s",
    positioningHint: "Define how you want to be perceived by your target audience",
    coreMessageLabel: "Core Message",
    coreMessagePlaceholder: "e.g. Simplifying complex marketing — delivering actionable insights you can use right away",
    coreMessageHint: "Write the core value and message your brand wants to convey",
    tipsTitle: "Brand Direction Tips",
    tip1: "Field",
    tip1Desc: ": Narrow it down to a specific area, not too broad",
    tip2: "Positioning",
    tip2Desc: ': Be clear about "what kind of expert for whom"',
    tip3: "Message",
    tip3Desc: ": Include how you solve your target's problems",
    previewTitle: "Brand Direction Preview",
    previewField: "Field:",
    previewFieldEmpty: "Enter your field",
    previewPositioning: "Positioning:",
    previewPositioningEmpty: "Enter positioning",
    previewMessage: "Message:",
    previewMessageEmpty: "Enter core message",
  },
};

interface BrandDirection {
  field: string;
  positioning: string;
  core_message: string;
}

interface BrandDirectionStepProps {
  brandDirection: BrandDirection;
  onUpdate: (direction: BrandDirection) => void;
}

export const BrandDirectionStep = ({
  brandDirection,
  onUpdate
}: BrandDirectionStepProps) => {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const handleFieldChange = (field: keyof BrandDirection, value: string) => {
    onUpdate({
      ...brandDirection,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">🎯</span>
          {s.cardTitle}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {s.cardDesc}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Field */}
        <div className="space-y-2">
          <Label htmlFor="field" className="text-xs font-medium">
            {s.fieldLabel}
          </Label>
          <Input
            id="field"
            value={brandDirection.field}
            onChange={(e) => handleFieldChange('field', e.target.value)}
            placeholder={s.fieldPlaceholder}
            className="text-xs"
          />
          <p className="text-xs text-muted-foreground">
            {s.fieldHint}
          </p>
        </div>

        {/* Positioning */}
        <div className="space-y-2">
          <Label htmlFor="positioning" className="text-xs font-medium">
            {s.positioningLabel}
          </Label>
          <Input
            id="positioning"
            value={brandDirection.positioning}
            onChange={(e) => handleFieldChange('positioning', e.target.value)}
            placeholder={s.positioningPlaceholder}
            className="text-xs"
          />
          <p className="text-xs text-muted-foreground">
            {s.positioningHint}
          </p>
        </div>

        {/* Core Message */}
        <div className="space-y-2">
          <Label htmlFor="core-message" className="text-xs font-medium">
            {s.coreMessageLabel}
          </Label>
          <Textarea
            id="core-message"
            value={brandDirection.core_message}
            onChange={(e) => handleFieldChange('core_message', e.target.value)}
            placeholder={s.coreMessagePlaceholder}
            className="text-xs min-h-20"
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            {s.coreMessageHint}
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
              </ul>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="border-t pt-4">
          <h5 className="text-xs font-medium mb-2">{s.previewTitle}</h5>
          <div className="bg-background border rounded-lg p-3">
            <div className="text-xs space-y-2">
              <div>
                <span className="text-muted-foreground">{s.previewField}</span>{" "}
                <span className="font-medium">
                  {brandDirection.field || s.previewFieldEmpty}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">{s.previewPositioning}</span>{" "}
                <span className="font-medium">
                  {brandDirection.positioning || s.previewPositioningEmpty}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">{s.previewMessage}</span>{" "}
                <span className="italic">
                  {brandDirection.core_message || s.previewMessageEmpty}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
