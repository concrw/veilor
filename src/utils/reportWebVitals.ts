import { onCLS, onLCP, onFCP, onTTFB, onINP, type Metric } from 'web-vitals';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const VITALS_ENDPOINT = `${SUPABASE_URL}/functions/v1/collect-vitals`;

function sendToAnalytics(metric: Metric) {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: window.location.pathname,
    timestamp: Date.now(),
  };

  // keepalive fetch — non-blocking, survives page unload (sendBeacon은 헤더 커스텀 불가)
  if (import.meta.env.PROD && SUPABASE_URL) {
    fetch(VITALS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
      },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {/* non-critical */});
  }

  // Dev mode: log to console
  if (import.meta.env.DEV) {
    const color = metric.rating === 'good' ? '#0CCE6B' : metric.rating === 'needs-improvement' ? '#FFA400' : '#FF4E42';
    console.warn(`[Vitals] %c${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`, `color: ${color}; font-weight: bold`);
  }
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onINP(sendToAnalytics);
}
