// SeedCard — growth seed stats
import { C } from '@/lib/colors';
import { SEED_STAGES } from '@/data/mePageData';
import { useMeTranslations } from '@/hooks/useTranslation';

const SEED_STAGE_ICON_STYLE = { fontSize: 13, marginBottom: 3 } as const;

interface SeedCardProps {
  pct: number;
  seedTitle: string;
  stats: { sessionCount: number; insightCount: number; signalCount: number; patternAreaCount: number } | null;
  stageStatus: (i: number) => 'done' | 'active' | 'none';
}

export default function SeedCard({ pct, seedTitle, stats, stageStatus }: SeedCardProps) {
  const me = useMeTranslations();
  const s = me.seed;

  const statsLine = s.statsLine
    .replace('{sessions}', String(stats?.sessionCount ?? 0))
    .replace('{insights}', String(stats?.insightCount ?? 0))
    .replace('{signals}', String(stats?.signalCount ?? 0));

  const patternLine = s.patternAreasFmt.replace('{count}', String(stats?.patternAreaCount ?? 0));

  return (
    <div className="vr-fade-in" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '17px 19px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 13 }}>
        <div>
          <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: '.08em', textTransform: 'uppercase', color: C.amberGold, marginBottom: 5 }}>{s.title}</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 21, color: C.text, lineHeight: 1.2 }}>{seedTitle}</p>
          <p style={{ fontSize: 10, fontWeight: 300, color: C.text4, marginTop: 3, lineHeight: 1.4 }}>
            {statsLine}
            <br />{patternLine}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 34, color: C.text, lineHeight: 1 }}>{pct}</span>
            <span style={{ fontSize: 11, fontWeight: 300, color: C.text3 }}>%</span>
          </div>
          <p style={{ fontSize: 9, fontWeight: 300, color: C.text4, marginTop: 2 }}>{s.precision}</p>
        </div>
      </div>
      <div style={{ marginBottom: 11 }}>
        <div style={{ height: 4, background: C.border2, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg,${C.amberGold},${C.amber})`, width: `${pct}%`, transition: 'width .8s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          {s.stageLabels.map(l => <span key={l} style={{ fontSize: 9, fontWeight: 300, color: C.text5 }}>{l}</span>)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5 }}>
        {SEED_STAGES.map((st, i) => {
          const status = stageStatus(i);
          const bgColor = status === 'none' ? C.bg : status === 'active' ? `${C.amberGold}0D` : `${C.amberGold}06`;
          const borderColor = status === 'none' ? C.border : status === 'active' ? `${C.amberGold}55` : `${C.amberGold}33`;
          const textColor = status === 'none' ? C.text5 : status === 'active' ? C.amberGold : C.text3;
          return (
            <div key={i} style={{ flex: 1, background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 8, padding: '8px 6px', textAlign: 'center', transition: 'all .3s' }}>
              <div style={SEED_STAGE_ICON_STYLE}>{st.icon}</div>
              <div style={{ fontSize: 9, fontWeight: 300, color: textColor, lineHeight: 1.3, whiteSpace: 'pre-line' }}>{st.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
