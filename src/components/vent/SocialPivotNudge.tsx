import { useT } from '@/i18n/useT';

export const PIVOT_TYPES = {
  growth:     { color: '#7FB89A' },
  fatigue:    { color: '#C97A6A' },
  transition: { color: '#A89BC9' },
} as const;

type PivotTypeKey = keyof typeof PIVOT_TYPES;

interface SocialPivotNudgeProps {
  pivotType: PivotTypeKey;
  onTalkToAmber: () => void;
  onDismiss: () => void;
}

export default function SocialPivotNudge({ pivotType, onTalkToAmber, onDismiss }: SocialPivotNudgeProps) {
  const t = useT();
  const s = t.set.socialPivotNudge;
  const T = PIVOT_TYPES[pivotType] ?? PIVOT_TYPES.transition;
  const pivotI18n = s.pivotTypes[pivotType] ?? s.pivotTypes['transition'];
  const pivotLabel = pivotI18n.label;
  const pivotDesc = pivotI18n.desc;

  return (
    <div style={{ margin: '12px 16px 0', background: `color-mix(in srgb, ${T.color} 8%, #1C1917)`, border: `1px solid ${T.color}44`, borderRadius: 14 }}>
      <div style={{ padding: '14px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.color, display: 'inline-block', animation: 'pulse 1.8s ease-in-out infinite' }}/>
          <span style={{ fontSize: 10, color: T.color, fontFamily: 'monospace', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            {s.pivotDetected} · {pivotLabel}
          </span>
        </div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: '#E7E5E4', lineHeight: 1.55, fontStyle: 'italic', marginBottom: 12 }}>
          {pivotDesc}
        </p>

        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {(Object.keys(PIVOT_TYPES) as PivotTypeKey[]).map(k => {
            const tp = PIVOT_TYPES[k];
            const kI18n = s.pivotTypes[k];
            return (
              <span key={k} style={{
                flex: 1, padding: '6px 4px', fontSize: 10, textAlign: 'center',
                background: k === pivotType ? `color-mix(in srgb, ${tp.color} 14%, #242120)` : '#242120',
                border: k === pivotType ? `1px solid ${tp.color}` : '1px solid rgba(231,229,228,.06)',
                color: k === pivotType ? tp.color : '#9C9590',
                borderRadius: 8, fontFamily: 'monospace', letterSpacing: '.04em',
              }}>
                {kI18n?.label ?? k}
              </span>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onTalkToAmber}
            style={{ fontSize: 12, color: T.color, border: `1px solid ${T.color}55`, borderRadius: 8, padding: '6px 14px', background: 'transparent', cursor: 'pointer' }}
          >
            {s.talkToAmber}
          </button>
          <button
            onClick={onDismiss}
            style={{ fontSize: 12, color: '#9C9590', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {s.imFine}
          </button>
        </div>
      </div>
    </div>
  );
}
