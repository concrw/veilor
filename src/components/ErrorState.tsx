import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguageContext } from '@/context/LanguageContext';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

const S = {
  ko: { title: '데이터를 불러오지 못했습니다', description: '네트워크 연결을 확인하고 다시 시도해 주세요.', retry: '다시 시도' },
  en: { title: 'Failed to load data', description: 'Please check your network connection and try again.', retry: 'Try again' },
};

export const ErrorState = memo(function ErrorState({
  title,
  description,
  onRetry,
}: ErrorStateProps) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3" role="alert">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <span className="text-xl">⚠️</span>
      </div>
      <p className="text-sm font-medium text-foreground">{title ?? s.title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{description ?? s.description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {s.retry}
        </Button>
      )}
    </div>
  );
});
