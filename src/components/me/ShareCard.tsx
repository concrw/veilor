// #58 공유 카드 (SNS) — V-File 결과를 이미지로 공유
import { useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MASK_PROFILES, classifyVProfile } from '@/lib/vfileAlgorithm';
import type { AxisScores } from '@/context/AuthContext';

export default function ShareCard() {
  const { primaryMask, axisScores } = useAuth();
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!primaryMask || !axisScores) return null;

  const profile = MASK_PROFILES.find(m => m.nameKo === primaryMask || m.mskCode === primaryMask);
  const vProfile = classifyVProfile(axisScores as AxisScores);

  const shareText = `나의 관계 가면은 "${profile?.nameKo ?? primaryMask}" (${vProfile.code})\n${profile?.archetype ?? ''}\n\n#VEILRUM #VFile #관계가면`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'VEILRUM V-File', text: shareText });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <div className="bg-card border rounded-2xl overflow-hidden">
      {/* 공유 카드 프리뷰 */}
      <div ref={cardRef} className="p-5 space-y-3" style={{ background: `linear-gradient(135deg, ${profile?.color ?? '#6366f1'}15, transparent)` }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: (profile?.color ?? '#6366f1') + '20' }}>
            🎭
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: profile?.color }}>{profile?.nameKo ?? primaryMask}</p>
            <p className="text-xs text-muted-foreground font-mono">{vProfile.code} · {profile?.mskCode ?? ''}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{profile?.archetype}</p>
        <div className="flex gap-3">
          {(['A', 'B', 'C', 'D'] as const).map(k => (
            <div key={k} className="text-center flex-1">
              <div className="text-sm font-semibold">{(axisScores as Record<string, number>)[k]}</div>
              <div className="text-[10px] text-muted-foreground">
                {k === 'A' ? '애착' : k === 'B' ? '소통' : k === 'C' ? '욕구' : '역할'}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground text-right">VEILRUM · veilor.ai</p>
      </div>
      {/* 공유 버튼 */}
      <div className="flex border-t">
        <button onClick={handleCopy} className="flex-1 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors border-r">
          {copied ? '복사됨!' : '텍스트 복사'}
        </button>
        <button onClick={handleShare} className="flex-1 py-3 text-xs text-primary font-medium hover:bg-primary/5 transition-colors">
          공유하기
        </button>
      </div>
    </div>
  );
}
