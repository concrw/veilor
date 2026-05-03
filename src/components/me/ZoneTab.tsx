import { C } from '@/lib/colors';
import { ZONES } from '@/data/mePageData';
import ZoneToggle from '@/components/me/ZoneToggle';
import { useState } from 'react';
import { useMeTranslations } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/context/LanguageContext';

const ZONE_ITEM_NAME_STYLE = { fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 13.5, color: C.text, marginBottom: 1 } as const;
const ZONE_ITEM_DESC_STYLE = { fontSize: 10, fontWeight: 300, color: C.text4 } as const;
const ZONE_SENSITIVE_BADGE_STYLE = { fontSize: 9, padding: '2px 6px', borderRadius: 99, border: `1px solid ${C.amberDim}33`, color: C.amberDim, background: `${C.amberDim}0A`, flexShrink: 0 } as const;

interface ZoneTabProps {
  pct: number;
  closedCount: number;
  zoneState: Record<string, boolean>;
  toggleZone: (id: string) => void;
}

export default function ZoneTab({ pct, closedCount, zoneState, toggleZone }: ZoneTabProps) {
  const me = useMeTranslations();
  const z = me.zone;
  const { language } = useLanguageContext();
  const lang = language === 'en' ? 'en' : 'ko';
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, padding: '11px 20px 10px', borderBottom: `1px solid ${C.border2}` }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 16, color: C.text, marginBottom: 2 }}>{z.title}</p>
        <p style={{ fontSize: 10, fontWeight: 300, color: C.text4 }}>{z.subtitle}</p>
      </div>

      <div style={{ flexShrink: 0, padding: '9px 20px', borderBottom: `1px solid ${C.border2}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 300, color: C.text4, flexShrink: 0 }}>{z.precision}</span>
        <div style={{ flex: 1, height: 3, background: C.border2, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg,${C.amberGold},${C.amber})`, width: `${pct}%`, transition: 'width .4s ease' }} />
        </div>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 14, color: C.amberGold, flexShrink: 0, minWidth: 34, textAlign: 'right' }}>{pct}%</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '11px 20px 80px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {closedCount > 0 && (
          <div style={{ background: `${C.frost}08`, border: `1px solid ${C.frost}22`, borderRadius: 10, padding: '9px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ width: 17, height: 17, borderRadius: '50%', background: `${C.frost}15`, border: `1px solid ${C.frost}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: C.frost, display: 'block' }} />
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 12, color: C.text3, flex: 1, lineHeight: 1.5 }}>
              "{z.frostMessage.replace('{pct}', String(pct)).replace('{count}', String(closedCount))}"
            </p>
            <span style={{ fontSize: 9, color: C.text5, flexShrink: 0, marginTop: 2 }}>Frost</span>
          </div>
        )}

        {ZONES.map((g, gi) => {
          const groupOpen = openGroups[gi] !== false;
          return (
            <div key={gi} className="vr-fade-in" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 13, overflow: 'hidden' }}>
              <div onClick={() => setOpenGroups(prev => ({ ...prev, [gi]: !groupOpen }))}
                style={{ padding: '12px 15px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.color, flexShrink: 0, display: 'block' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 15, color: C.text, marginBottom: 2 }}>{g.title[lang]}</p>
                  <p style={{ fontSize: 10, fontWeight: 300, color: C.text4 }}>{g.sub[lang]}</p>
                </div>
                <span style={{ fontSize: 11, color: C.text5, transform: groupOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s', display: 'inline-block', flexShrink: 0 }}>›</span>
              </div>
              {groupOpen && (
                <div style={{ borderTop: `1px solid ${C.border2}` }}>
                  {g.items.map((item, ii) => (
                    <div key={item.id} style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: ii < g.items.length - 1 ? `1px solid ${C.border2}` : 'none' }}>
                      <div style={{ flex: 1 }}>
                        <p style={ZONE_ITEM_NAME_STYLE}>{item.name[lang]}</p>
                        <p style={ZONE_ITEM_DESC_STYLE}>{item.desc[lang]}</p>
                      </div>
                      {item.sensitive && <span style={ZONE_SENSITIVE_BADGE_STYLE}>{z.sensitive}</span>}
                      <ZoneToggle on={zoneState[item.id]} onToggle={() => toggleZone(item.id)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
