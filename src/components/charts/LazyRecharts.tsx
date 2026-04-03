// recharts lazy loading 래퍼
// 차트가 필요한 컴포넌트에서 import해서 사용
import { lazy, Suspense } from 'react';

const RechartsModule = lazy(() =>
  import('recharts').then((mod) => ({ default: () => null, ...mod }))
);

// 개별 컴포넌트 lazy export
export const LazyRadarChart = lazy(() =>
  import('recharts').then((mod) => ({ default: mod.RadarChart }))
);

export const LazyResponsiveContainer = lazy(() =>
  import('recharts').then((mod) => ({ default: mod.ResponsiveContainer }))
);

export const LazyPolarGrid = lazy(() =>
  import('recharts').then((mod) => ({ default: mod.PolarGrid }))
);

export const LazyPolarAngleAxis = lazy(() =>
  import('recharts').then((mod) => ({ default: mod.PolarAngleAxis }))
);

export const LazyRadar = lazy(() =>
  import('recharts').then((mod) => ({ default: mod.Radar }))
);

export const LazyLineChart = lazy(() =>
  import('recharts').then((mod) => ({ default: mod.LineChart }))
);

export const LazyLine = lazy(() =>
  import('recharts').then((mod) => ({ default: mod.Line }))
);

export const LazyXAxis = lazy(() =>
  import('recharts').then((mod) => ({ default: mod.XAxis }))
);

export const LazyYAxis = lazy(() =>
  import('recharts').then((mod) => ({ default: mod.YAxis }))
);

export const LazyTooltip = lazy(() =>
  import('recharts').then((mod) => ({ default: mod.Tooltip }))
);

export const LazyCartesianGrid = lazy(() =>
  import('recharts').then((mod) => ({ default: mod.CartesianGrid }))
);

// 차트 로딩 폴백
export function ChartFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Suspense 래퍼
export function ChartSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<ChartFallback />}>{children}</Suspense>;
}
