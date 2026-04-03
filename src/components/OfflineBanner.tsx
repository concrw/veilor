// 네트워크 오프라인 감지 배너
import { useState, useEffect, memo } from 'react';

export const OfflineBanner = memo(function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

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
      인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있어요.
    </div>
  );
});
