/**
 * IkigaiVennDiagram Component
 * Interactive Venn diagram visualization for Ikigai
 * Shows 4 overlapping circles with intersection areas
 */

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { IkigaiIntersectionDialog } from "./IkigaiIntersectionDialog";
import { useLanguageContext } from "@/context/LanguageContext";

const S = {
  ko: {
    diagramTitle: "Ikigai 다이어그램",
    completeness: (pct: string, complete: boolean) => `완성도: ${pct}%${complete ? " ✨ 완성!" : ""}`,
    completeBadge: "완료",
    notEntered: "아직 입력되지 않았습니다",
    moreItems: (n: number) => `...외 ${n}개`,
    centerLabel: "완성!",
    circles: {
      love: "좋아하는 것",
      goodAt: "잘하는 것",
      worldNeeds: "세상이 필요한 것",
      paidFor: "돈 벌 수 있는 것",
    },
    intersections: {
      loveGoodAt: "열정 (Passion)",
      loveWorldNeeds: "사명 (Mission)",
      goodAtPaidFor: "직업 (Profession)",
      worldNeedsPaidFor: "천직 (Vocation)",
      center: "IKIGAI",
    },
    legend: {
      passion: "열정 (Passion): 좋아하면서 잘하는 것",
      mission: "사명 (Mission): 좋아하면서 세상이 필요로 하는 것",
      profession: "직업 (Profession): 잘하면서 돈을 벌 수 있는 것",
      vocation: "천직 (Vocation): 세상이 필요로 하고 돈을 벌 수 있는 것",
    },
  },
  en: {
    diagramTitle: "Ikigai Diagram",
    completeness: (pct: string, complete: boolean) => `Completeness: ${pct}%${complete ? " ✨ Complete!" : ""}`,
    completeBadge: "Complete",
    notEntered: "Not entered yet",
    moreItems: (n: number) => `...${n} more`,
    centerLabel: "Done!",
    circles: {
      love: "What you love",
      goodAt: "What you're good at",
      worldNeeds: "What the world needs",
      paidFor: "What you can be paid for",
    },
    intersections: {
      loveGoodAt: "Passion",
      loveWorldNeeds: "Mission",
      goodAtPaidFor: "Profession",
      worldNeedsPaidFor: "Vocation",
      center: "IKIGAI",
    },
    legend: {
      passion: "Passion: What you love and are good at",
      mission: "Mission: What you love and the world needs",
      profession: "Profession: What you're good at and can be paid for",
      vocation: "Vocation: What the world needs and you can be paid for",
    },
  },
};

type IntersectionType = "passion" | "mission" | "profession" | "vocation" | "ikigai";

interface IkigaiData {
  love: string[];
  goodAt: string[];
  worldNeeds: string[];
  paidFor: string[];
}

interface IkigaiVennDiagramProps {
  data: IkigaiData;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

// Circle positions and colors
const CIRCLE_CONFIG = {
  love:       { cx: 250, cy: 200, r: 150, fill: "#FF6B9D", fillOpacity: 0.3, position: { x: 250, y: 100 } },
  goodAt:     { cx: 350, cy: 200, r: 150, fill: "#4ECDC4", fillOpacity: 0.3, position: { x: 450, y: 100 } },
  worldNeeds: { cx: 250, cy: 300, r: 150, fill: "#95E1D3", fillOpacity: 0.3, position: { x: 150, y: 400 } },
  paidFor:    { cx: 350, cy: 300, r: 150, fill: "#FFE66D", fillOpacity: 0.3, position: { x: 450, y: 400 } },
};

// Intersection positions
const INTERSECTION_POS = {
  loveGoodAt:        { x: 300, y: 150, highlight: false },
  loveWorldNeeds:    { x: 200, y: 250, highlight: false },
  goodAtPaidFor:     { x: 400, y: 250, highlight: false },
  worldNeedsPaidFor: { x: 300, y: 350, highlight: false },
  center:            { x: 300, y: 250, highlight: true  },
};

export function IkigaiVennDiagram({
  data,
  interactive = true,
  size = "md",
  showLabels = true,
}: IkigaiVennDiagramProps) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [hoveredCircle, setHoveredCircle] = useState<keyof typeof CIRCLE_CONFIG | null>(null);
  const [hoveredIntersection, setHoveredIntersection] = useState<keyof typeof INTERSECTION_POS | null>(null);
  const [selectedIntersection, setSelectedIntersection] = useState<IntersectionType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Build circles with translated labels
  const CIRCLES = useMemo(() => ({
    love:       { ...CIRCLE_CONFIG.love,       label: s.circles.love       },
    goodAt:     { ...CIRCLE_CONFIG.goodAt,     label: s.circles.goodAt     },
    worldNeeds: { ...CIRCLE_CONFIG.worldNeeds, label: s.circles.worldNeeds },
    paidFor:    { ...CIRCLE_CONFIG.paidFor,    label: s.circles.paidFor    },
  }), [s]);

  // Build intersections with translated labels
  const INTERSECTIONS = useMemo(() => ({
    loveGoodAt:        { ...INTERSECTION_POS.loveGoodAt,        label: s.intersections.loveGoodAt        },
    loveWorldNeeds:    { ...INTERSECTION_POS.loveWorldNeeds,    label: s.intersections.loveWorldNeeds    },
    goodAtPaidFor:     { ...INTERSECTION_POS.goodAtPaidFor,     label: s.intersections.goodAtPaidFor     },
    worldNeedsPaidFor: { ...INTERSECTION_POS.worldNeedsPaidFor, label: s.intersections.worldNeedsPaidFor },
    center:            { ...INTERSECTION_POS.center,            label: s.intersections.center            },
  }), [s]);

  const handleIntersectionClick = (type: IntersectionType) => {
    setSelectedIntersection(type);
    setDialogOpen(true);
  };

  // Calculate size multiplier
  const sizeMultiplier = size === "sm" ? 0.6 : size === "lg" ? 1.2 : 1;
  const width = 600 * sizeMultiplier;
  const height = 500 * sizeMultiplier;

  // Check if data is complete
  const isComplete = useMemo(() => {
    return (
      data.love.length > 0 &&
      data.goodAt.length > 0 &&
      data.worldNeeds.length > 0 &&
      data.paidFor.length > 0
    );
  }, [data]);

  // Calculate completeness percentage
  const completeness = useMemo(() => {
    const sections = [data.love, data.goodAt, data.worldNeeds, data.paidFor];
    const filled = sections.filter((sec) => sec.length > 0).length;
    return (filled / 4) * 100;
  }, [data]);

  // suppress unused warning
  void hoveredIntersection;

  const getCircleClassName = (circle: keyof typeof CIRCLE_CONFIG) => {
    if (!interactive) return "";
    return hoveredCircle === circle
      ? "cursor-pointer opacity-100"
      : hoveredCircle
      ? "opacity-40"
      : "cursor-pointer opacity-80 hover:opacity-100";
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{s.diagramTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {s.completeness(completeness.toFixed(0), isComplete)}
            </p>
          </div>
          {isComplete && (
            <Badge variant="default" className="bg-green-500">
              {s.completeBadge}
            </Badge>
          )}
        </div>

        {/* SVG Venn Diagram */}
        <TooltipProvider>
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${600} ${500}`}
            className="mx-auto"
            style={{ maxWidth: "100%" }}
          >
            {/* Define gradients */}
            <defs>
              <radialGradient id="loveGradient">
                <stop offset="0%" stopColor={CIRCLE_CONFIG.love.fill} stopOpacity="0.5" />
                <stop offset="100%" stopColor={CIRCLE_CONFIG.love.fill} stopOpacity="0.2" />
              </radialGradient>
              <radialGradient id="goodAtGradient">
                <stop offset="0%" stopColor={CIRCLE_CONFIG.goodAt.fill} stopOpacity="0.5" />
                <stop offset="100%" stopColor={CIRCLE_CONFIG.goodAt.fill} stopOpacity="0.2" />
              </radialGradient>
              <radialGradient id="worldNeedsGradient">
                <stop offset="0%" stopColor={CIRCLE_CONFIG.worldNeeds.fill} stopOpacity="0.5" />
                <stop offset="100%" stopColor={CIRCLE_CONFIG.worldNeeds.fill} stopOpacity="0.2" />
              </radialGradient>
              <radialGradient id="paidForGradient">
                <stop offset="0%" stopColor={CIRCLE_CONFIG.paidFor.fill} stopOpacity="0.5" />
                <stop offset="100%" stopColor={CIRCLE_CONFIG.paidFor.fill} stopOpacity="0.2" />
              </radialGradient>
            </defs>

            {/* Circles */}
            {(Object.entries(CIRCLES) as [keyof typeof CIRCLES, typeof CIRCLES.love][]).map(([key, circle]) => (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <circle
                    cx={circle.cx}
                    cy={circle.cy}
                    r={circle.r}
                    fill={`url(#${key}Gradient)`}
                    stroke={circle.fill}
                    strokeWidth="2"
                    className={getCircleClassName(key)}
                    onMouseEnter={() => interactive && setHoveredCircle(key)}
                    onMouseLeave={() => interactive && setHoveredCircle(null)}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs">
                    <p className="font-semibold mb-2">{circle.label}</p>
                    {data[key as keyof IkigaiData].length > 0 ? (
                      <ul className="text-xs space-y-1">
                        {data[key as keyof IkigaiData].slice(0, 5).map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                        {data[key as keyof IkigaiData].length > 5 && (
                          <li className="text-muted-foreground">
                            {s.moreItems(data[key as keyof IkigaiData].length - 5)}
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">{s.notEntered}</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Intersection hover areas (clickable) */}
            {interactive && (
              <>
                {/* Passion: love + goodAt */}
                <circle
                  cx={INTERSECTION_POS.loveGoodAt.x}
                  cy={INTERSECTION_POS.loveGoodAt.y}
                  r={40}
                  className="fill-pink-400 opacity-0 hover:opacity-30 cursor-pointer"
                  onMouseEnter={() => setHoveredIntersection('loveGoodAt')}
                  onMouseLeave={() => setHoveredIntersection(null)}
                  onClick={() => handleIntersectionClick("passion")}
                />
                {/* Mission: love + worldNeeds */}
                <circle
                  cx={INTERSECTION_POS.loveWorldNeeds.x}
                  cy={INTERSECTION_POS.loveWorldNeeds.y}
                  r={40}
                  className="fill-green-400 opacity-0 hover:opacity-30 cursor-pointer"
                  onMouseEnter={() => setHoveredIntersection('loveWorldNeeds')}
                  onMouseLeave={() => setHoveredIntersection(null)}
                  onClick={() => handleIntersectionClick("mission")}
                />
                {/* Profession: goodAt + paidFor */}
                <circle
                  cx={INTERSECTION_POS.goodAtPaidFor.x}
                  cy={INTERSECTION_POS.goodAtPaidFor.y}
                  r={40}
                  className="fill-blue-400 opacity-0 hover:opacity-30 cursor-pointer"
                  onMouseEnter={() => setHoveredIntersection('goodAtPaidFor')}
                  onMouseLeave={() => setHoveredIntersection(null)}
                  onClick={() => handleIntersectionClick("profession")}
                />
                {/* Vocation: worldNeeds + paidFor */}
                <circle
                  cx={INTERSECTION_POS.worldNeedsPaidFor.x}
                  cy={INTERSECTION_POS.worldNeedsPaidFor.y}
                  r={40}
                  className="fill-yellow-400 opacity-0 hover:opacity-30 cursor-pointer"
                  onMouseEnter={() => setHoveredIntersection('worldNeedsPaidFor')}
                  onMouseLeave={() => setHoveredIntersection(null)}
                  onClick={() => handleIntersectionClick("vocation")}
                />
                {/* IKIGAI: center */}
                {isComplete && (
                  <circle
                    cx={INTERSECTION_POS.center.x}
                    cy={INTERSECTION_POS.center.y}
                    r={50}
                    className="fill-purple-400 opacity-0 hover:opacity-20 cursor-pointer"
                    onMouseEnter={() => setHoveredIntersection('center')}
                    onMouseLeave={() => setHoveredIntersection(null)}
                    onClick={() => handleIntersectionClick("ikigai")}
                  />
                )}
              </>
            )}

            {/* Labels */}
            {showLabels && (
              <>
                {/* Circle labels */}
                {(Object.entries(CIRCLES) as [string, typeof CIRCLES.love][]).map(([key, circle]) => (
                  <text
                    key={key}
                    x={circle.position.x}
                    y={circle.position.y}
                    textAnchor="middle"
                    className="text-sm font-semibold fill-foreground"
                    style={{ userSelect: "none" }}
                  >
                    {circle.label}
                  </text>
                ))}

                {/* Intersection labels */}
                {(Object.entries(INTERSECTIONS) as [string, typeof INTERSECTIONS.center][]).map(([key, intersection]) => (
                  <text
                    key={key}
                    x={intersection.x}
                    y={intersection.y}
                    textAnchor="middle"
                    className={`text-xs font-medium ${
                      intersection.highlight ? "fill-primary font-bold" : "fill-muted-foreground"
                    }`}
                    style={{ userSelect: "none" }}
                  >
                    {intersection.label}
                  </text>
                ))}
              </>
            )}

            {/* Center Ikigai indicator */}
            {isComplete && (
              <g>
                <circle cx="300" cy="250" r="50" fill="white" fillOpacity="0.9" />
                <circle cx="300" cy="250" r="50" fill="none" stroke="#10B981" strokeWidth="3" />
                <text
                  x="300"
                  y="245"
                  textAnchor="middle"
                  className="text-lg font-bold fill-primary"
                >
                  IKIGAI
                </text>
                <text x="300" y="262" textAnchor="middle" className="text-xs fill-green-600">
                  {s.centerLabel}
                </text>
              </g>
            )}
          </svg>
        </TooltipProvider>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          {(Object.entries(CIRCLES) as [keyof IkigaiData, typeof CIRCLES.love][]).map(([key, circle]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: circle.fill }}
              />
              <span className="text-xs font-medium">{circle.label}</span>
              <Badge variant="outline" className="ml-auto text-xs">
                {data[key].length}
              </Badge>
            </div>
          ))}
        </div>

        {/* Intersection descriptions */}
        {isComplete && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-muted rounded-lg">
              <strong>{s.intersections.loveGoodAt}:</strong> {s.legend.passion.split(": ")[1]}
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <strong>{s.intersections.loveWorldNeeds}:</strong> {s.legend.mission.split(": ")[1]}
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <strong>{s.intersections.goodAtPaidFor}:</strong> {s.legend.profession.split(": ")[1]}
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <strong>{s.intersections.worldNeedsPaidFor}:</strong> {s.legend.vocation.split(": ")[1]}
            </div>
          </div>
        )}
      </div>

      {/* Intersection Dialog */}
      <IkigaiIntersectionDialog
        data={data}
        intersectionType={selectedIntersection}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
}
