// #28 패턴 이탈 감지 — 최근 감정/행동이 평소 패턴과 다를 때 알림
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';

export default function PatternDeviationCard() {
  const { user } = useAuth();

  const { data: deviation } = useQuery({
    queryKey: ['pattern-deviation', user?.id],
    queryFn: async () => {
      // 최근 7일 vs 이전 30일 감정 비교
      const now = new Date();
      const week = new Date(now.getTime() - 7 * 86400000).toISOString();
      const month = new Date(now.getTime() - 30 * 86400000).toISOString();

      const { data: recent } = await veilorDb
        .from('dive_sessions')
        .select('emotion, emotional_stability')
        .eq('user_id', user!.id)
        .gte('created_at', week);

      const { data: baseline } = await veilorDb
        .from('dive_sessions')
        .select('emotion, emotional_stability')
        .eq('user_id', user!.id)
        .gte('created_at', month)
        .lt('created_at', week);

      if (!recent?.length || !baseline?.length) return null;

      // 감정 안정도 비교
      const recentStability = recent
        .filter(r => r.emotional_stability != null)
        .reduce((s, r) => s + (r.emotional_stability ?? 50), 0) / Math.max(recent.length, 1);
      const baseStability = baseline
        .filter(b => b.emotional_stability != null)
        .reduce((s, b) => s + (b.emotional_stability ?? 50), 0) / Math.max(baseline.length, 1);

      const stabilityDiff = Math.round(recentStability - baseStability);

      // 새로운 감정 출현
      const baseEmotions = new Set(baseline.map(b => b.emotion).filter(Boolean));
      const newEmotions = recent
        .map(r => r.emotion)
        .filter((e): e is string => !!e && !baseEmotions.has(e));
      const uniqueNew = [...new Set(newEmotions)];

      if (Math.abs(stabilityDiff) < 10 && uniqueNew.length === 0) return null;

      return { stabilityDiff, recentStability: Math.round(recentStability), newEmotions: uniqueNew };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  if (!deviation) return null;

  const isPositive = deviation.stabilityDiff > 0;

  return (
    <div className={`border rounded-2xl p-5 space-y-2 ${
      isPositive ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'
    }`}>
      <div className="flex items-center gap-2">
        <span className="text-base">{isPositive ? '📈' : '📉'}</span>
        <p className="text-xs font-medium">패턴 변화 감지</p>
      </div>
      <p className="text-sm leading-relaxed">
        최근 7일 감정 안정도가{' '}
        <span className={`font-semibold ${isPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
          {isPositive ? `+${deviation.stabilityDiff}` : deviation.stabilityDiff}
        </span>
        {' '}변화했어요 (현재 {deviation.recentStability}%)
      </p>
      {deviation.newEmotions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] text-muted-foreground">새로 나타난 감정:</span>
          {deviation.newEmotions.map(e => (
            <span key={e} className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">{e}</span>
          ))}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">
        {isPositive ? '좋은 방향으로 변화하고 있어요!' : '마음에 변화가 있는 것 같아요. Vent에서 이야기해볼까요?'}
      </p>
    </div>
  );
}
