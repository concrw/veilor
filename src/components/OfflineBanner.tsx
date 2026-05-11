import { useState, useEffect, memo } from 'react';
import { useT } from '@/i18n/useT';

export const OfflineBanner = memo(function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const t = useT();

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-white text-center py-2 text-xs font-medium"
    >
      {t.errors.offline}
    </div>
  );
});
