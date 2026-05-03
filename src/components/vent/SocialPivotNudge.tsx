export const PIVOT_TYPES = {
  growth:     { color: '#7FB89A', label: { ko: '성장형', en: 'Growth' },     desc: { ko: '더 깊고 구체적인 결로 가는 중이에요', en: 'Going deeper and more specific' } },
  fatigue:    { color: '#C97A6A', label: { ko: '피로형', en: 'Fatigue' },     desc: { ko: '마음이 지쳐 있을 수 있어요. 쉬어도 괜찮아요', en: 'You may be worn out. Rest is okay.' } },
  transition: { color: '#A89BC9', label: { ko: '전환형', en: 'Transition' },  desc: { ko: '새로운 챕터가 열리고 있어요', en: 'A new chapter is opening.' } },
} as const;

type PivotTypeKey = keyof typeof PIVOT_TYPES;

interface SocialPivotNudgeProps {
  pivotType: PivotTypeKey;
  isKo: boolean;
  onTalkToAmber: () => void;
  onDismiss: () => void;
}

export default function SocialPivotNudge({ pivotType, isKo, onTalkToAmber, onDismiss }: SocialPivotNudgeProps) {
  const T = PIVOT_TYPES[pivotType] ?? PIVOT_TYPES.transition;
  const label = isKo ? T.label.ko : T.label.en;
  const desc = isKo ? T.desc.ko : T.desc.en;

  return (
    <div style={{ margin: '12px 16px 0', background: `color-mix(in srgb, ${T.color} 8%, #1C1917)`, border: `1px solid ${T.color}44`, borderRadius: 14 }}>
      <div style={{ padding: '14px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.color, display: 'inline-block', animation: 'pulse 1.8s ease-in-out infinite' }}/>
          <span style={{ fontSize: 10, color: T.color, fontFamily: 'monospace', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            {isKo ? '피보팅 감지' : 'Pivot detected'} · {label}
          </span>
        </div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: '#E7E5E4', lineHeight: 1.55, fontStyle: 'italic', marginBottom: 12 }}>
          {desc}
        </p>

        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {(Object.entries(PIVOT_TYPES) as [PivotTypeKey, typeof PIVOT_TYPES[PivotTypeKey]][]).map(([k, tp]) => (
            <span key={k} style={{
              flex: 1, padding: '6px 4px', fontSize: 10, textAlign: 'center',
              background: k === pivotType ? `color-mix(in srgb, ${tp.color} 14%, #242120)` : '#242120',
              border: k === pivotType ? `1px solid ${tp.color}` : '1px solid rgba(231,229,228,.06)',
              color: k === pivotType ? tp.color : '#9C9590',
              borderRadius: 8, fontFamily: 'monospace', letterSpacing: '.04em',
            }}>
              {isKo ? tp.label.ko : tp.label.en}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onTalkToAmber}
            style={{ fontSize: 12, color: T.color, border: `1px solid ${T.color}55`, borderRadius: 8, padding: '6px 14px', background: 'transparent', cursor: 'pointer' }}
          >
            {isKo ? 'Amber와 이야기하기' : 'Talk to Amber'}
          </button>
          <button
            onClick={onDismiss}
            style={{ fontSize: 12, color: '#9C9590', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {isKo ? '괜찮아요' : "I'm fine"}
          </button>
        </div>
      </div>
    </div>
  );
}
