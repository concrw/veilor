import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Lightbulb, Users } from "lucide-react";
import { useState } from "react";
import { useT } from '@/i18n/useT';


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
  const t = useT();
  const s = t.brandDomain.targetAudience;

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
