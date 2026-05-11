import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/useT';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorState = memo(function ErrorState({
  title,
  description,
  onRetry,
}: ErrorStateProps) {
  const t = useT();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3" role="alert">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <span className="text-xl">⚠️</span>
      </div>
      <p className="text-sm font-medium text-foreground">{title ?? t.errors.dataLoadFailed}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{description ?? t.errors.dataLoadFailedDesc}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t.errors.retryButton}
        </Button>
      )}
    </div>
  );
});
