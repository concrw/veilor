// #31 페르소나 브랜딩 — 가면별 브랜딩 전략 + #32 자기 선언문
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MASK_PROFILES } from '@/lib/vfileAlgorithm';
import { veilorDb } from '@/integrations/supabase/client';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    sectionTitle: '페르소나 브랜딩',
    rebrandingSuffix: '의 리브랜딩',
    strengthLabel: '강점',
    shadowLabel: '그림자',
    reframeLabel: '리프레이밍',
    declarationTitle: '나의 관계 선언문',
    declarationHint: (coreNeed: string) => `"${coreNeed}"를 바탕으로, 당신만의 관계 선언문을 작성해보세요.`,
    placeholder: (reframe: string, coreNeed: string) => `예: 나는 ${reframe}이다. ${coreNeed}를 위해 매일 한 걸음씩 나아간다.`,
    save: '선언문 저장',
    saved: '저장 완료',
    brandStrategy: {
      PWR: { strength: '결단력과 리더십', shadow: '통제 욕구', reframe: '안전한 공간을 만드는 사람' },
      NRC: { strength: '독립성과 자기보호', shadow: '고립과 불신', reframe: '경계를 아는 사람' },
      SCP: { strength: '자율성과 자기표현', shadow: '반항적 패턴', reframe: '자유와 연결을 함께 추구하는 사람' },
      MKV: { strength: '매력과 영향력', shadow: '진짜 자아 숨김', reframe: '가면 없이도 빛나는 사람' },
      MNY: { strength: '유머와 자원 활용', shadow: '감정 회피', reframe: '진지함과 유쾌함을 겸비한 사람' },
      PSP: { strength: '탐구심과 개방성', shadow: '안전기지 부재', reframe: '안전한 모험가' },
      EMP: { strength: '공감력과 연결', shadow: '자기 소거', reframe: '자기와 타인을 동시에 돌보는 사람' },
      GVR: { strength: '헌신과 관대함', shadow: '경계 부재', reframe: '건강하게 주고받는 사람' },
      APV: { strength: '성취력과 끈기', shadow: '조건부 자기가치', reframe: '존재 자체로 충분한 사람' },
      DEP: { strength: '연결 욕구와 정서적 깊이', shadow: '의존 패턴', reframe: '혼자서도 단단한 사람' },
      AVD: { strength: '분석력과 통찰', shadow: '감정 회피', reframe: '감정과 이성을 통합하는 사람' },
      SAV: { strength: '도덕성과 헌신', shadow: '구원자 컴플렉스', reframe: '자신도 구원받을 수 있는 사람' },
      _default: { strength: '고유한 강점', shadow: '무의식 패턴', reframe: '성장하는 사람' },
    } as Record<string, { strength: string; shadow: string; reframe: string }>,
  },
  en: {
    sectionTitle: 'Persona Branding',
    rebrandingSuffix: "'s Rebranding",
    strengthLabel: 'Strength',
    shadowLabel: 'Shadow',
    reframeLabel: 'Reframing',
    declarationTitle: 'My Relationship Declaration',
    declarationHint: (coreNeed: string) => `Based on "${coreNeed}", write your own relationship declaration.`,
    placeholder: (reframe: string, coreNeed: string) => `e.g., I am ${reframe}. I take one step each day toward ${coreNeed}.`,
    save: 'Save Declaration',
    saved: 'Saved',
    brandStrategy: {
      PWR: { strength: 'Decisiveness & Leadership', shadow: 'Need for control', reframe: 'Someone who creates safe spaces' },
      NRC: { strength: 'Independence & Self-protection', shadow: 'Isolation & distrust', reframe: 'Someone who knows their boundaries' },
      SCP: { strength: 'Autonomy & Self-expression', shadow: 'Rebellious patterns', reframe: 'Someone who seeks both freedom and connection' },
      MKV: { strength: 'Charm & influence', shadow: 'Hiding the true self', reframe: 'Someone who shines without a mask' },
      MNY: { strength: 'Humor & resourcefulness', shadow: 'Emotional avoidance', reframe: 'Someone who balances seriousness and playfulness' },
      PSP: { strength: 'Curiosity & openness', shadow: 'Lack of a safe base', reframe: 'A safe adventurer' },
      EMP: { strength: 'Empathy & connection', shadow: 'Self-erasure', reframe: 'Someone who cares for self and others simultaneously' },
      GVR: { strength: 'Dedication & generosity', shadow: 'Lack of boundaries', reframe: 'Someone who gives and receives healthily' },
      APV: { strength: 'Achievement & persistence', shadow: 'Conditional self-worth', reframe: 'Someone who is enough just by existing' },
      DEP: { strength: 'Desire for connection & emotional depth', shadow: 'Dependency patterns', reframe: 'Someone who stands firm alone' },
      AVD: { strength: 'Analytical insight', shadow: 'Emotional avoidance', reframe: 'Someone who integrates emotion and reason' },
      SAV: { strength: 'Morality & dedication', shadow: 'Savior complex', reframe: 'Someone who can also be saved' },
      _default: { strength: 'Unique strengths', shadow: 'Unconscious patterns', reframe: 'Someone who is growing' },
    } as Record<string, { strength: string; shadow: string; reframe: string }>,
  },
};

export default function PersonaBranding() {
  const { user, primaryMask } = useAuth();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const [declaration, setDeclaration] = useState('');
  const [saved, setSaved] = useState(false);

  const profile = MASK_PROFILES.find(m => m.nameKo === primaryMask || m.mskCode === primaryMask);
  if (!profile) return null;

  const brandStrategy = s.brandStrategy[profile.mskCode] ?? s.brandStrategy._default;

  const handleSave = async () => {
    if (!user || !declaration.trim()) return;
    await veilorDb.from('user_profiles').update({
      declaration: declaration.trim(),
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id);
    setSaved(true);
  };

  return (
    <div className="space-y-4">
      {/* 페르소나 브랜딩 (#31) */}
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <p className="text-xs text-muted-foreground">{s.sectionTitle}</p>
        <h3 className="font-semibold" style={{ color: profile.color }}>{profile.nameKo}{s.rebrandingSuffix}</h3>
        <div className="space-y-2">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-3 py-2">
            <p className="text-[10px] text-emerald-600">{s.strengthLabel}</p>
            <p className="text-xs">{brandStrategy.strength}</p>
          </div>
          <div className="bg-red-400/5 border border-red-400/20 rounded-xl px-3 py-2">
            <p className="text-[10px] text-red-500">{s.shadowLabel}</p>
            <p className="text-xs">{brandStrategy.shadow}</p>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-3 py-2">
            <p className="text-[10px] text-primary">{s.reframeLabel}</p>
            <p className="text-xs font-medium">{brandStrategy.reframe}</p>
          </div>
        </div>
      </div>

      {/* 자기 선언문 (#32) */}
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <p className="text-xs text-muted-foreground">{s.declarationTitle}</p>
        <p className="text-xs text-muted-foreground">
          {s.declarationHint(profile.coreNeed)}
        </p>
        <textarea
          value={declaration}
          onChange={e => setDeclaration(e.target.value)}
          placeholder={s.placeholder(brandStrategy.reframe, profile.coreNeed)}
          maxLength={300}
          className="w-full bg-background border rounded-lg p-2.5 text-sm resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button onClick={handleSave} disabled={!declaration.trim() || saved}
          className="w-full text-xs py-2.5 rounded-lg bg-primary text-white disabled:opacity-40">
          {saved ? s.saved : s.save}
        </button>
      </div>
    </div>
  );
}
