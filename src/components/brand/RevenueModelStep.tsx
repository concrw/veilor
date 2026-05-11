import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Lightbulb, DollarSign } from "lucide-react";
import { useState } from "react";
import { useT } from '@/i18n/useT';


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
  const t = useT();
  const s = t.brandDomain.revenueModel;

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
