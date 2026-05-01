// #28 패턴 이탈 감지 — 최근 감정/행동이 평소 패턴과 다를 때 알림
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { C } from '@/lib/colors';
import { useMeTranslations } from '@/hooks/useTranslation';

export default function PatternDeviationCard() {
  const { user } = useAuth();
  const me = useMeTranslations();
  const t = me.patternDeviation;

  const { data: deviation } = useQuery({
    queryKey: ['pattern-deviation', user?.id],
    queryFn: async () => {
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

      const recentStability = recent
        .filter(r => r.emotional_stability != null)
        .reduce((s, r) => s + (r.emotional_stability ?? 50), 0) / Math.max(recent.length, 1);
      const baseStability = baseline
        .filter(b => b.emotional_stability != null)
        .reduce((s, b) => s + (b.emotional_stability ?? 50), 0) / Math.max(baseline.length, 1);

      const stabilityDiff = Math.round(recentStability - baseStability);

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
  const borderColor = isPositive ? `rgba(16,185,129,0.2)` : `rgba(245,158,11,0.2)`;
  const bgColor = isPositive ? `rgba(16,185,129,0.05)` : `rgba(245,158,11,0.05)`;
  const accentColor = isPositive ? '#10B981' : '#F59E0B';

  const deltaStr = isPositive ? `+${deviation.stabilityDiff}` : String(deviation.stabilityDiff);
  const stabilityLine = t.stabilityChangeFmt
    .replace('{delta}', `<b style="color:${accentColor}">${deltaStr}</b>`)
    .replace('{current}', String(deviation.recentStability));

  return (
    <div className="vr-fade-in" style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 14, padding: '14px 17px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>{isPositive ? '📈' : '📉'}</span>
        <p style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{t.title}</p>
      </div>
      <p
        style={{ fontSize: 13, fontWeight: 300, color: C.text2, lineHeight: 1.6, marginBottom: deviation.newEmotions.length > 0 ? 8 : 0 }}
        dangerouslySetInnerHTML={{ __html: stabilityLine }}
      />
      {deviation.newEmotions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 10, color: C.text4 }}>{t.newEmotionsLabel}</span>
          {deviation.newEmotions.map(e => (
            <span key={e} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: `${C.amberGold}10`, color: C.amberGold, border: `1px solid ${C.amberGold}33` }}>{e}</span>
          ))}
        </div>
      )}
      <p style={{ fontSize: 10, fontWeight: 300, color: C.text4 }}>
        {isPositive ? t.positive : t.negative}
      </p>
    </div>
  );
}
