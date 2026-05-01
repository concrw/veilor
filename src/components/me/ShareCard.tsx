// #58 공유 카드 (SNS) — V-File 결과를 이미지로 공유
import { useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MASK_PROFILES, classifyVProfile } from '@/lib/vfileAlgorithm';
import type { AxisScores } from '@/context/AuthContext';
import { C } from '@/lib/colors';
import { useMeTranslations } from '@/hooks/useTranslation';

export default function ShareCard() {
  const { primaryMask, axisScores } = useAuth();
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const me = useMeTranslations();
  const t = me.shareCard;

  if (!primaryMask || !axisScores) return null;

  const profile = MASK_PROFILES.find(m => m.nameKo === primaryMask || m.mskCode === primaryMask);
  const vProfile = classifyVProfile(axisScores as AxisScores);

  const shareText = `나의 관계 가면은 "${profile?.nameKo ?? primaryMask}" (${vProfile.code})\n${profile?.archetype ?? ''}\n\n#VEILOR #VFile #관계가면`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'VEILOR V-File', text: shareText });
      } catch { /* share cancelled by user */ }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="vr-fade-in" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
      <div ref={cardRef} style={{ padding: '16px 17px', display: 'flex', flexDirection: 'column', gap: 10, background: `linear-gradient(135deg, ${(profile?.color ?? '#6366f1') + '15'}, transparent)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: (profile?.color ?? '#6366f1') + '20' }}>
            🎭
          </div>
          <div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 18, color: profile?.color }}>{profile?.nameKo ?? primaryMask}</p>
            <p style={{ fontSize: 10, color: C.text4, fontFamily: 'monospace' }}>{vProfile.code} · {profile?.mskCode ?? ''}</p>
          </div>
        </div>
        <p style={{ fontSize: 11, fontWeight: 300, color: C.text4 }}>{profile?.archetype}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['A', 'B', 'C', 'D'] as const).map(k => (
            <div key={k} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 500, color: C.text }}>{(axisScores as Record<string, number>)[k]}</div>
              <div style={{ fontSize: 9, color: C.text4 }}>{t.axisLabels[k]}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 9, color: C.text5, textAlign: 'right' }}>VEILOR · veilor.ai</p>
      </div>
      <div style={{ display: 'flex', borderTop: `1px solid ${C.border}` }} role="group" aria-label={t.shareGroupLabel}>
        <button onClick={handleCopy} aria-label={t.copyAriaLabel}
          style={{ flex: 1, padding: '12px 0', fontSize: 11, color: C.text4, background: 'transparent', border: 'none', borderRight: `1px solid ${C.border}`, cursor: 'pointer' }}>
          {copied ? t.copyDone : t.copyButton}
        </button>
        <button onClick={handleShare} aria-label={t.shareAriaLabel}
          style={{ flex: 1, padding: '12px 0', fontSize: 11, color: C.amberGold, fontWeight: 500, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          {t.shareButton}
        </button>
      </div>
    </div>
  );
}
