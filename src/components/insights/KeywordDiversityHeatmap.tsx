import type { KeywordDiversityData } from "@/hooks/codetalk_hooks/useKeywordDiversity";

interface KeywordDiversityHeatmapProps {
  data: KeywordDiversityData[];
}

export const KeywordDiversityHeatmap = ({ data }: KeywordDiversityHeatmapProps) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">키워드 다양성 히트맵</h3>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {data.map((item) => {
          const intensity = Math.min(item.diversity / 100, 1);
          const bgColor = intensity > 0.85
            ? 'bg-red-200 dark:bg-red-900/40'
            : intensity > 0.7
            ? 'bg-yellow-200 dark:bg-yellow-900/40'
            : 'bg-green-200 dark:bg-green-900/40';

          return (
            <div
              key={item.keyword}
              className={`${bgColor} rounded-lg p-2 text-center`}
            >
              <div className="text-xs font-medium truncate">{item.keyword}</div>
              <div className="text-xs text-muted-foreground">{item.diversity}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
