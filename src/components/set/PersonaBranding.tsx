// #31 페르소나 브랜딩 — 가면별 브랜딩 전략 + #32 자기 선언문
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MASK_PROFILES } from '@/lib/vfileAlgorithm';
import { veilorDb } from '@/integrations/supabase/client';
import { useT } from '@/i18n/useT';
import { useLanguageContext } from '@/context/LanguageContext';


export default function PersonaBranding() {
  const { user, primaryMask } = useAuth();
  const t = useT();
  const s = t.personaBranding;
  const { language } = useLanguageContext();
  const [declaration, setDeclaration] = useState('');
  const [saved, setSaved] = useState(false);

  const profile = MASK_PROFILES.find(m => m.nameKo === primaryMask || m.mskCode === primaryMask);
  if (!profile) return null;
  const maskName = language === 'en' ? profile.nameEn : profile.nameKo;

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
        <h3 className="font-semibold" style={{ color: profile.color }}>{maskName}{s.rebrandingSuffix}</h3>
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
