// 재사용 가능한 에러 상태 컴포넌트
import { memo } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorState = memo(function ErrorState({
  title = '데이터를 불러오지 못했습니다',
  description = '네트워크 연결을 확인하고 다시 시도해 주세요.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3" role="alert">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <span className="text-xl">⚠️</span>
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
});
