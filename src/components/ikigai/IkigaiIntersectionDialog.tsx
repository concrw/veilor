/**
 * IkigaiIntersectionDialog Component
 * Shows detailed information about Ikigai intersections
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Heart, Zap, Briefcase, Target } from "lucide-react";
import { useT } from "@/i18n/useT";

interface IkigaiData {
  love: string[];
  goodAt: string[];
  worldNeeds: string[];
  paidFor: string[];
}

type IntersectionType = "passion" | "mission" | "profession" | "vocation" | "ikigai";

interface IntersectionInfo {
  type: IntersectionType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  elements: string[][];
  elementLabels: string[];
  tips: string[];
}

interface IkigaiIntersectionDialogProps {
  data: IkigaiData;
  intersectionType: IntersectionType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IkigaiIntersectionDialog({
  data,
  intersectionType,
  open,
  onOpenChange,
}: IkigaiIntersectionDialogProps) {
  const t = useT();
  const s = t.ikigaiIntersection;

  if (!intersectionType) return null;

  const intersectionMap: Record<IntersectionType, IntersectionInfo> = {
    passion: {
      type: "passion",
      title: s.passion.title,
      description: s.passion.description,
      icon: <Heart className="w-5 h-5" />,
      color: "bg-pink-100 text-pink-700",
      elements: [data.love, data.goodAt],
      elementLabels: s.passion.elementLabels,
      tips: s.passion.tips,
    },
    mission: {
      type: "mission",
      title: s.mission.title,
      description: s.mission.description,
      icon: <Target className="w-5 h-5" />,
      color: "bg-green-100 text-green-700",
      elements: [data.love, data.worldNeeds],
      elementLabels: s.mission.elementLabels,
      tips: s.mission.tips,
    },
    profession: {
      type: "profession",
      title: s.profession.title,
      description: s.profession.description,
      icon: <Briefcase className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-700",
      elements: [data.goodAt, data.paidFor],
      elementLabels: s.profession.elementLabels,
      tips: s.profession.tips,
    },
    vocation: {
      type: "vocation",
      title: s.vocation.title,
      description: s.vocation.description,
      icon: <Zap className="w-5 h-5" />,
      color: "bg-yellow-100 text-yellow-700",
      elements: [data.worldNeeds, data.paidFor],
      elementLabels: s.vocation.elementLabels,
      tips: s.vocation.tips,
    },
    ikigai: {
      type: "ikigai",
      title: s.ikigai.title,
      description: s.ikigai.description,
      icon: <Sparkles className="w-5 h-5" />,
      color: "bg-purple-100 text-purple-700",
      elements: [data.love, data.goodAt, data.worldNeeds, data.paidFor],
      elementLabels: s.ikigai.elementLabels,
      tips: s.ikigai.tips,
    },
  };

  const info = intersectionMap[intersectionType];

  // Find common elements across the intersection
  const findCommonElements = () => {
    if (info.elements.length === 0) return [];
    const [first, ...rest] = info.elements;
    return first.filter((item) =>
      rest.every((arr) => arr.some((el) => el.toLowerCase().includes(item.toLowerCase())))
    );
  };

  const commonElements = findCommonElements();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${info.color}`}>{info.icon}</div>
            <div>
              <DialogTitle>{info.title}</DialogTitle>
              <DialogDescription>{info.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Common Elements (if any) */}
          {commonElements.length > 0 && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {s.commonFound}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {commonElements.map((item, idx) => (
                    <Badge key={idx} variant="default" className="text-sm">
                      {item}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {s.commonFoundIn(info.elementLabels)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Individual Elements */}
          {info.elements.map((elements, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-sm">{info.elementLabels[idx]}</CardTitle>
              </CardHeader>
              <CardContent>
                {elements.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {elements.map((item, itemIdx) => (
                      <Badge key={itemIdx} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{s.notEntered}</p>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Action Suggestions */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">{s.suggestions}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              {info.tips.map((tip, i) => (
                <p key={i}>• {tip}</p>
              ))}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
