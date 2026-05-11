import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Lightbulb } from "lucide-react";
import { useState } from "react";
import { useT } from '@/i18n/useT';


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
  const t = useT();
  const s = t.brandDomain.contentStrategy;

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
