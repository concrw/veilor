// #26 소통 패턴 분석 — CodeTalk 기반 소통 스타일 분석
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { C } from '@/lib/colors';
import { useMeTranslations } from '@/hooks/useTranslation';

export default function CommunicationPatternCard() {
  const { user } = useAuth();
  const me = useMeTranslations();
  const t = me.communicationPattern;

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

      const kwCount: Record<string, number> = {};
      entries.forEach(e => {
        if (e.keyword) kwCount[e.keyword] = (kwCount[e.keyword] ?? 0) + 1;
      });
      const topKeywords = Object.entries(kwCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      const withImprint = entries.filter(e => e.imprinting_moment).length;
      const withRoot = entries.filter(e => e.root_cause).length;
      const depth = Math.round(((withImprint + withRoot) / (entries.length * 2)) * 100);

      return { totalEntries: entries.length, topKeywords, depth };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  if (!data) return null;

  const depthStage = data.depth < 30 ? t.depthStages.low : data.depth < 70 ? t.depthStages.mid : t.depthStages.high;

  return (
    <div className="vr-fade-in" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 17px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 300, color: C.text }}>{t.title}</p>
        <span style={{ fontSize: 10, fontWeight: 300, color: C.text4 }}>{t.countLabel.replace('{count}', String(data.totalEntries))}</span>
      </div>
      {data.topKeywords.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: '.07em', textTransform: 'uppercase', color: C.text4, marginBottom: 6 }}>{t.topKeywords}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {data.topKeywords.map(([kw, count]) => (
              <span key={kw} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, border: `1px solid ${C.amberGold}33`, color: C.amberGold, background: `${C.amberGold}08` }}>
                {kw} <span style={{ opacity: 0.6, fontSize: 9 }}>{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      <div>
        <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: '.07em', textTransform: 'uppercase', color: C.text4, marginBottom: 5 }}>{t.depthLabel}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <div style={{ flex: 1, height: 4, background: C.border2, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg,${C.amberGold},${C.amber})`, width: `${data.depth}%`, transition: 'width .4s ease' }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 400, color: C.amberGold, minWidth: 34, textAlign: 'right', fontFamily: "'Cormorant Garamond', serif" }}>{data.depth}%</span>
        </div>
        <p style={{ fontSize: 10, fontWeight: 300, color: C.text4, lineHeight: 1.5 }}>{depthStage}</p>
      </div>
    </div>
  );
}
