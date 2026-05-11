import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lightbulb } from "lucide-react";
import { useT } from '@/i18n/useT';

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
  const t = useT();
  const s = t.brandDomain.direction;

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
