// #26 소통 패턴 분석 — CodeTalk 기반 소통 스타일 분석
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';

export default function CommunicationPatternCard() {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ['communication-pattern', user?.id],
    queryFn: async () => {
      const { data: entries } = await veilorDb
        .from('codetalk_entries')
        .select('keyword, definition, imprinting_moment, root_cause, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!entries || entries.length === 0) return null;

      // 키워드 빈도 분석
      const kwCount: Record<string, number> = {};
      entries.forEach(e => {
        if (e.keyword) kwCount[e.keyword] = (kwCount[e.keyword] ?? 0) + 1;
      });
      const topKeywords = Object.entries(kwCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      // 각인/뿌리 완성도
      const withImprint = entries.filter(e => e.imprinting_moment).length;
      const withRoot = entries.filter(e => e.root_cause).length;
      const depth = Math.round(((withImprint + withRoot) / (entries.length * 2)) * 100);

      return { totalEntries: entries.length, topKeywords, depth };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  if (!data) return null;

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">소통 패턴 분석</p>
        <span className="text-xs text-muted-foreground">{data.totalEntries}개 기록</span>
      </div>
      {data.topKeywords.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground mb-1.5">자주 탐색한 키워드</p>
          <div className="flex flex-wrap gap-1.5">
            {data.topKeywords.map(([kw, count]) => (
              <span key={kw} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {kw} <span className="opacity-60">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="text-[10px] text-muted-foreground mb-1">탐색 깊이</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full">
            <div className="h-1.5 bg-primary rounded-full" style={{ width: `${data.depth}%` }} />
          </div>
          <span className="text-xs font-medium">{data.depth}%</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          {data.depth < 30 ? '정의 단계 — 각인과 뿌리를 기록하면 더 깊어져요' :
           data.depth < 70 ? '각인 단계 — 뿌리까지 도달하면 패턴이 선명해져요' :
           '뿌리 단계 — 소통 패턴의 원인이 드러나고 있어요'}
        </p>
      </div>
    </div>
  );
}
