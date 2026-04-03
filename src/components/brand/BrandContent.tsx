import { ContentStrategyStep } from './ContentStrategyStep';

interface ContentStrategy {
  topics: string[];
  formats: string[];
  channels: string[];
  cadence: string;
}

interface BrandContentProps {
  contentStrategy: ContentStrategy;
  onUpdate: (strategy: ContentStrategy) => void;
}

export function BrandContent({ contentStrategy, onUpdate }: BrandContentProps) {
  return (
    <ContentStrategyStep
      contentStrategy={contentStrategy}
      onUpdate={onUpdate}
    />
  );
}
