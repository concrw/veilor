import { BrandDirectionStep } from './BrandDirectionStep';
import { BrandNamingStep } from './BrandNamingStep';

interface BrandDirection {
  field: string;
  positioning: string;
  core_message: string;
}

interface BrandOverviewProps {
  currentStep: number;
  brandDirection: BrandDirection;
  onUpdateDirection: (direction: BrandDirection) => void;
  brandNames: string[];
  selectedBrandName: string;
  onNameSelect: (name: string) => void;
  onUpdateNames: (names: string[]) => void;
}

export function BrandOverview({
  currentStep, brandDirection, onUpdateDirection,
  brandNames, selectedBrandName, onNameSelect, onUpdateNames,
}: BrandOverviewProps) {
  return (
    <>
      {currentStep === 0 && (
        <BrandDirectionStep
          brandDirection={brandDirection}
          onUpdate={onUpdateDirection}
        />
      )}
      {currentStep === 3 && (
        <BrandNamingStep
          brandNames={brandNames}
          selectedName={selectedBrandName}
          onNameSelect={onNameSelect}
          onUpdateNames={onUpdateNames}
        />
      )}
    </>
  );
}
