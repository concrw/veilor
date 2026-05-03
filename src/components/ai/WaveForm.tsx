import { C } from '@/lib/colors';

export function WaveForm({ active }: { active: boolean }) {
  return (
    <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 3, height: 32 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 3, borderRadius: 99,
            background: active ? C.amberGold : C.border,
            height: active ? undefined : 8,
            animation: active ? `vr-wave 0.8s ease-in-out ${i * 0.1}s infinite alternate` : 'none',
            transition: 'background 0.3s',
          }}
        />
      ))}
    </div>
  );
}
