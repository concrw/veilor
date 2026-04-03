import { memo } from 'react';
import { C } from '@/lib/colors';

const ZoneToggle = memo(function ZoneToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onToggle(); }}
      style={{
        width: 36, height: 20, borderRadius: 99, flexShrink: 0, cursor: 'pointer', position: 'relative',
        background: on ? `${C.amberGold}33` : C.border2,
        border: `1px solid ${on ? `${C.amberGold}66` : C.border}`,
        transition: 'all .25s',
      }}
    >
      <span style={{
        width: 14, height: 14, borderRadius: '50%', position: 'absolute', top: 2,
        left: on ? 18 : 2, background: on ? C.amberGold : C.text4, transition: 'all .25s', display: 'block',
      }} />
    </button>
  );
});

export default ZoneToggle;
