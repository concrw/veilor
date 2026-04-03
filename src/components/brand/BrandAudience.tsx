import { TargetAudienceStep } from './TargetAudienceStep';
import { RevenueModelStep } from './RevenueModelStep';

interface TargetAudience {
  age_range: string;
  interests: string[];
  pain_points: string[];
  preferred_channels: string[];
}

interface RevenueModel {
  primary_model: string;
  price_points: string[];
  monetization_channels: string[];
}

interface BrandAudienceProps {
  currentStep: number;
  targetAudience: TargetAudience;
  onUpdateAudience: (audience: TargetAudience) => void;
  revenueModel: RevenueModel;
  onUpdateRevenue: (model: RevenueModel) => void;
}

export function BrandAudience({
  currentStep, targetAudience, onUpdateAudience,
  revenueModel, onUpdateRevenue,
}: BrandAudienceProps) {
  return (
    <>
      {currentStep === 2 && (
        <TargetAudienceStep
          targetAudience={targetAudience}
          onUpdate={onUpdateAudience}
        />
      )}
      {currentStep === 4 && (
        <RevenueModelStep
          revenueModel={revenueModel}
          onUpdate={onUpdateRevenue}
        />
      )}
    </>
  );
}
