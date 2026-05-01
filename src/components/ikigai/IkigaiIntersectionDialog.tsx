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
import { useLanguageContext } from "@/context/LanguageContext";

const S = {
  ko: {
    commonFound: "공통 요소 발견!",
    commonFoundIn: (labels: string[]) => `이 요소들은 ${labels.join(", ")}에 모두 포함되어 있습니다.`,
    notEntered: "아직 입력되지 않았습니다",
    suggestions: "💡 제안",
    passion: {
      title: "열정 (Passion)",
      description: "당신이 좋아하면서 동시에 잘하는 것들입니다. 몰입과 즐거움을 느끼는 영역입니다.",
      elementLabels: ["좋아하는 것", "잘하는 것"],
      tips: [
        "이 영역의 활동을 더 자주 하고, 스킬을 갈고닦으세요",
        "취미나 사이드 프로젝트로 시작할 수 있습니다",
        "관련 커뮤니티나 동아리에 참여해보세요",
      ],
    },
    mission: {
      title: "사명 (Mission)",
      description: "당신이 좋아하면서 세상이 필요로 하는 것들입니다. 의미와 목적을 느끼는 영역입니다.",
      elementLabels: ["좋아하는 것", "세상이 필요한 것"],
      tips: [
        "사회적 임팩트를 만들 수 있는 프로젝트를 찾아보세요",
        "비영리 단체나 소셜 벤처에 참여할 수 있습니다",
        "재능 기부나 멘토링을 시작해보세요",
      ],
    },
    profession: {
      title: "직업 (Profession)",
      description: "당신이 잘하면서 돈을 벌 수 있는 것들입니다. 전문성과 수익을 만드는 영역입니다.",
      elementLabels: ["잘하는 것", "돈 벌 수 있는 것"],
      tips: [
        "현재 직업이나 프리랜서로 수익화할 수 있습니다",
        "포트폴리오를 만들고 고객을 찾아보세요",
        "관련 자격증이나 교육을 받아 전문성을 높이세요",
      ],
    },
    vocation: {
      title: "천직 (Vocation)",
      description: "세상이 필요로 하면서 돈을 벌 수 있는 것들입니다. 사회적 가치와 경제적 보상이 만나는 영역입니다.",
      elementLabels: ["세상이 필요한 것", "돈 벌 수 있는 것"],
      tips: [
        "지속 가능한 비즈니스 모델을 고민해보세요",
        "사회적 가치와 수익을 동시에 창출하는 방법을 찾으세요",
        "고객의 문제를 해결하면서 보람도 느낄 수 있습니다",
      ],
    },
    ikigai: {
      title: "IKIGAI",
      description: "네 가지 영역이 모두 만나는 중심입니다. 당신의 이키가이는 좋아하고, 잘하고, 세상이 필요로 하며, 돈을 벌 수 있는 것입니다.",
      elementLabels: ["좋아하는 것", "잘하는 것", "세상이 필요한 것", "돈 벌 수 있는 것"],
      tips: [
        "축하합니다! 네 가지 영역이 만나는 중심을 찾으셨습니다",
        "이제 구체적인 실행 계획을 세워보세요",
        "작게 시작하고 꾸준히 발전시켜 나가세요",
        "브랜드 디자인과 비즈니스 전략을 구체화해보세요",
      ],
    },
  },
  en: {
    commonFound: "Common elements found!",
    commonFoundIn: (labels: string[]) => `These elements appear in all of: ${labels.join(", ")}.`,
    notEntered: "Not entered yet",
    suggestions: "💡 Suggestions",
    passion: {
      title: "Passion",
      description: "Things you love and are good at. The zone where you feel flow and joy.",
      elementLabels: ["What you love", "What you're good at"],
      tips: [
        "Do these activities more often and sharpen your skills",
        "You can start as a hobby or side project",
        "Join relevant communities or clubs",
      ],
    },
    mission: {
      title: "Mission",
      description: "Things you love that the world needs. The zone of meaning and purpose.",
      elementLabels: ["What you love", "What the world needs"],
      tips: [
        "Look for projects where you can create social impact",
        "You can get involved with nonprofits or social ventures",
        "Start volunteering your talents or mentoring",
      ],
    },
    profession: {
      title: "Profession",
      description: "Things you're good at that you can get paid for. The zone of expertise and income.",
      elementLabels: ["What you're good at", "What you can be paid for"],
      tips: [
        "You can monetize through a job or freelancing",
        "Build a portfolio and find clients",
        "Earn certifications or training to deepen expertise",
      ],
    },
    vocation: {
      title: "Vocation",
      description: "Things the world needs that you can be paid for. Where social value meets economic reward.",
      elementLabels: ["What the world needs", "What you can be paid for"],
      tips: [
        "Think about a sustainable business model",
        "Find ways to create both social value and income",
        "You can feel fulfillment while solving clients' problems",
      ],
    },
    ikigai: {
      title: "IKIGAI",
      description: "The center where all four areas meet. Your ikigai is something you love, are good at, the world needs, and can be paid for.",
      elementLabels: ["What you love", "What you're good at", "What the world needs", "What you can be paid for"],
      tips: [
        "Congratulations! You've found the center where all four areas meet",
        "Now create a concrete action plan",
        "Start small and keep growing",
        "Develop your brand design and business strategy",
      ],
    },
  },
};

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
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

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
