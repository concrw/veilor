// WeeklyReportSection — weekly report card
import { C } from '@/lib/colors';
import { useMeTranslations } from '@/hooks/useTranslation';

const PATTERN_DOT_STYLE = { width: 5, height: 5, borderRadius: '50%', background: C.amber, flexShrink: 0, marginTop: 4 } as const;
const PATTERN_ITEM_STYLE = { display: 'flex' as const, alignItems: 'flex-start' as const, gap: 7, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 10px' } as const;
const PATTERN_TEXT_STYLE = { fontSize: 11, fontWeight: 300, color: C.text2, lineHeight: 1.5 } as const;
const EMOTION_BADGE_STYLE = { display: 'flex' as const, alignItems: 'center' as const, gap: 4, padding: '4px 9px', background: `${C.frost}08`, border: `1px solid ${C.frost}22`, borderRadius: 99 } as const;
const EMOTION_LABEL_STYLE = { fontSize: 10, fontWeight: 300, color: C.frost } as const;
const EMOTION_COUNT_STYLE = { fontSize: 9, fontWeight: 400, color: C.text4 } as const;

interface WeeklyReport {
  weekOf?: string;
  signalCount?: number;
  patterns: string[];
  topEmotions?: { label: string; count: number }[];
  unresolved?: string;
  encouragement?: string;
}

interface WeeklyReportSectionProps {
  weeklyReport: WeeklyReport | null;
  weeklyReportLoading: boolean;
}

export default function WeeklyReportSection({ weeklyReport: wr, weeklyReportLoading: wrLoading }: WeeklyReportSectionProps) {
  const me = useMeTranslations();
  const wr_ = me.weeklyReport;

  const weekLabel = (() => {
    const d = wr?.weekOf ? new Date(wr.weekOf) : new Date();
    const month = d.getMonth() + 1;
    const week = Math.ceil(d.getDate() / 7);
    return wr_.weekLabelFmt.replace('{month}', String(month)).replace('{week}', String(week));
  })();

  const badgeLabel = wr_.weekReportBadge.replace('{label}', weekLabel);

  return (
    <div className="vr-fade-in" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 17px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 99, border: `1px solid ${C.frost}33`, background: `${C.frost}08` }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: C.frost, display: 'block' }} />
          <span style={{ fontSize: 9, fontWeight: 400, color: C.frost }}>{badgeLabel}</span>
        </div>
        {wr && <span style={{ fontSize: 9, fontWeight: 300, color: C.text4 }}>{wr_.signalCount.replace('{count}', String(wr.signalCount))}</span>}
      </div>
      {wrLoading && <p style={{ fontSize: 11, fontWeight: 300, color: C.text4 }}>{wr_.loading}</p>}
      {!wrLoading && !wr && (
        <div style={{ textAlign: 'center', padding: '10px 0 6px' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 14, color: C.text3, marginBottom: 4 }}>{wr_.empty}</p>
          <p style={{ fontSize: 10, fontWeight: 300, color: C.text4, lineHeight: 1.5 }}>{wr_.emptyDesc}</p>
        </div>
      )}
      {!wrLoading && wr && (
        <>
          {wr.patterns.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: '.07em', textTransform: 'uppercase', color: C.text4, marginBottom: 6 }}>{wr_.patterns}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {wr.patterns.map((p: string, i: number) => (
                  <div key={i} style={PATTERN_ITEM_STYLE}>
                    <span style={PATTERN_DOT_STYLE} />
                    <p style={PATTERN_TEXT_STYLE}>{p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {wr.topEmotions && wr.topEmotions.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: '.07em', textTransform: 'uppercase', color: C.text4, marginBottom: 6 }}>{wr_.mainEmotions}</p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {wr.topEmotions.map((e: { label: string; count: number }, i: number) => (
                  <div key={i} style={EMOTION_BADGE_STYLE}>
                    <span style={EMOTION_LABEL_STYLE}>{e.label}</span>
                    <span style={EMOTION_COUNT_STYLE}>{wr_.emotionCountFmt.replace('{count}', String(e.count))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {wr.unresolved && (
            <div style={{ background: `${C.amberGold}06`, border: `1px solid ${C.amberGold}22`, borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
              <p style={{ fontSize: 9, fontWeight: 400, color: C.amberGold, letterSpacing: '.05em', marginBottom: 3 }}>{wr_.unresolved}</p>
              <p style={{ fontSize: 11, fontWeight: 300, color: C.text2, lineHeight: 1.5 }}>{wr.unresolved}</p>
            </div>
          )}
          {wr.encouragement && (
            <div style={{ background: `${C.frost}08`, border: `1px solid ${C.frost}22`, borderRadius: 8, padding: '8px 11px', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
              <div style={{ width: 15, height: 15, borderRadius: '50%', background: `${C.frost}15`, border: `1px solid ${C.frost}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.frost, display: 'block' }} />
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 12, color: C.text3, flex: 1, lineHeight: 1.5 }}>
                "{wr.encouragement}"
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
