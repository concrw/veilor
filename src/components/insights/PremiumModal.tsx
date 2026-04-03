import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Star, Zap, Brain, Users, CheckCircle, CreditCard } from "lucide-react";

interface PremiumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: (plan: string) => void;
}

export const PremiumModal = ({
  open,
  onOpenChange,
  onCheckout,
}: PremiumModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-sm border-purple-200 shadow-[0_0_30px_rgba(147,51,234,0.3)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className="bg-gradient-to-r from-purple-600 to-yellow-500 bg-clip-text text-transparent">프리미엄 기능 소개</span>
          </DialogTitle>
          <div className="text-xs text-muted-foreground">
            집단지성 인사이트는 프리미엄 서비스입니다
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feature List */}
          <div className="space-y-4">
            <FeatureItem icon={Star} title="집단지성 인사이트 열람" description="모든 사용자의 데이터로 만든 통계와 분석" />
            <FeatureItem icon={Zap} title="AI 관계 분석 무제한" description="AI가 분석하는 관계 패턴과 조언" />
            <FeatureItem icon={Brain} title="AI전문가 조언 주 3회" description="전문가 수준의 개인 맞춤 조언" />
            <FeatureItem icon={Users} title="모든 관계 유형 지원" description="연인, 비즈니스, 사용자 정의 관계 모두 지원" />
            <FeatureItem icon={CheckCircle} title="광고 없는 경험" description="깔끔하고 집중할 수 있는 환경" />
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-br from-purple-50 to-yellow-50 dark:from-purple-950/20 dark:to-yellow-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">프리미엄 요금제</h3>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-base text-muted-foreground line-through">$15</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-yellow-500 bg-clip-text text-transparent">$10</span>
                </div>
                <div className="text-xs text-muted-foreground">월 단위</div>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            className="w-full flex items-center gap-2 bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white shadow-lg"
            size="lg"
            onClick={() => onCheckout('premium')}
          >
            <CreditCard className="w-4 h-4" />
            프리미엄 구독하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FeatureItem = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) => (
  <div className="flex items-center gap-3">
    <Icon className="w-5 h-5 text-primary" />
    <div>
      <h4 className="text-sm font-medium">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);
