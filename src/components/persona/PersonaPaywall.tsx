import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, Crown } from "lucide-react";
import { useLanguageContext } from "@/context/LanguageContext";

interface PersonaPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personaCount: number;
  triggerContext: "discovery" | "ikigai" | "branding";
}

const S = {
  ko: {
    triggers: {
      discovery: (n: number) => ({ title: `${n}개의 페르소나가 발견되었습니다`, description: "하지만 무료 버전에서는 가장 강한 1개 페르소나만 확인할 수 있습니다." }),
      ikigai: () => ({ title: "여러 페르소나의 Ikigai를 설계하고 싶으신가요?", description: "좋아하는 것이 너무 달라서 하나로 정리가 안 될 때, 각 페르소나별 Ikigai를 만들어보세요." }),
      branding: () => ({ title: "여러 분야를 통합한 브랜딩 전략이 필요하신가요?", description: "여러 분야를 다루고 싶지만 브랜드가 산만해 보이지 않도록 전략을 제시해드립니다." }),
      default: () => ({ title: "Pro로 업그레이드", description: "모든 페르소나를 활용하세요." }),
    },
    freeLabel: '무료 버전',
    freeFeatures: ['메인 페르소나 1개만 분석', '기본 Prime Perspective', '단일 페르소나 Ikigai'],
    proLabel: 'Pro 버전',
    recommended: '추천',
    proFeatures: (n: number) => [
      `모든 페르소나 (최대 ${n}개) 상세 분석`,
      '페르소나별 Prime Perspective 생성',
      '페르소나 간 시너지/충돌 분석',
      '통합 브랜딩 전략 (3가지 옵션)',
      '페르소나별 성장 추적',
    ],
    price: '9,900원',
    perMonth: '/월',
    annualNote: '연간 결제 시 99,000원 (2개월 무료)',
    ctaTrial: '7일 무료 체험 시작하기',
    ctaLater: '나중에 하기',
    trustNote: '언제든지 취소 가능 • 카드 정보 불필요',
  },
  en: {
    triggers: {
      discovery: (n: number) => ({ title: `${n} personas discovered`, description: "But the free version only lets you view the 1 strongest persona." }),
      ikigai: () => ({ title: "Want to design an Ikigai for each persona?", description: "When your interests are too different to consolidate, create an Ikigai for each persona." }),
      branding: () => ({ title: "Need a branding strategy across multiple areas?", description: "We'll suggest a strategy so your brand stays coherent even when spanning multiple fields." }),
      default: () => ({ title: "Upgrade to Pro", description: "Use all your personas." }),
    },
    freeLabel: 'Free',
    freeFeatures: ['Analysis of 1 main persona only', 'Basic Prime Perspective', 'Single persona Ikigai'],
    proLabel: 'Pro',
    recommended: 'Recommended',
    proFeatures: (n: number) => [
      `All personas (up to ${n}) — detailed analysis`,
      'Prime Perspective per persona',
      'Synergy / conflict analysis between personas',
      'Unified branding strategy (3 options)',
      'Growth tracking per persona',
    ],
    price: '$8.99',
    perMonth: '/mo',
    annualNote: '$89.99/year — 2 months free',
    ctaTrial: 'Start 7-day free trial',
    ctaLater: 'Maybe later',
    trustNote: 'Cancel anytime • No card required',
  },
};

export function PersonaPaywall({
  open,
  onOpenChange,
  personaCount,
  triggerContext,
}: PersonaPaywallProps) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const triggerFn = s.triggers[triggerContext] ?? s.triggers.default;
  const message = triggerFn(personaCount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-primary" />
            <DialogTitle className="text-xl">{message.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {message.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">{s.freeLabel}</p>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {s.freeFeatures.map(f => <li key={f}>• {f}</li>)}
              </ul>
            </div>

            <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium">{s.proLabel}</p>
                <Badge variant="default" className="ml-auto text-xs">{s.recommended}</Badge>
              </div>
              <ul className="text-sm space-y-2 mb-4">
                {s.proFeatures(personaCount).map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t pt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{s.price}</span>
                  <span className="text-sm text-muted-foreground">{s.perMonth}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{s.annualNote}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button size="lg" className="w-full">{s.ctaTrial}</Button>
            <Button variant="outline" size="lg" className="w-full" onClick={() => onOpenChange(false)}>
              {s.ctaLater}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">{s.trustNote}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
