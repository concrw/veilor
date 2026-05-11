import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { MASK_PROFILES } from '@/lib/vfileAlgorithm';
import { useT } from '@/i18n/useT';
import { useLanguageContext } from '@/context/LanguageContext';


export default function MultiPersonaAnalysis() {
  const { user } = useAuth();
  const t = useT();
  const s = t.coupleDomain.multiPersonaAnalysis;
  const { language } = useLanguageContext();

  const { data: personas } = useQuery({
    queryKey: ['multi-persona-analysis', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb.from('persona_profiles')
        .select('*').eq('user_id', user!.id).order('rank_order');
      return data ?? [];
    },
    enabled: !!user,
  });

  if (!personas || personas.length < 2) {
    return (
      <div className="bg-card border rounded-2xl p-5 space-y-2">
        <p className="text-sm font-medium">{s.title}</p>
        <p className="text-xs text-muted-foreground">{s.emptyDesc}</p>
        <p className="text-xs text-primary">{s.emptyHint}</p>
      </div>
    );
  }

  interface MaskEntry { context: string; mask: typeof MASK_PROFILES[number] | undefined; scores: Record<string, number> | null }
  const masks: MaskEntry[] = personas.map((p: Record<string, unknown>) => ({
    context: p.vfile_context as string,
    mask: MASK_PROFILES.find(m => m.mskCode === p.msk_code),
    scores: p.axis_scores as Record<string, number> | null,
  }));

  const allSameMask = masks.every((m) => m.mask?.mskCode === masks[0].mask?.mskCode);

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{s.title}</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500">Become</span>
      </div>
      <div className="space-y-2">
        {masks.map((m, i: number) => (
          <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ backgroundColor: (m.mask?.color ?? '#6366f1') + '20' }}>
              {m.context === 'general' ? '🌿' : m.context === 'social' ? '🏢' : '🌙'}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium" style={{ color: m.mask?.color }}>
                {m.mask ? (language === 'en' ? m.mask.nameEn : m.mask.nameKo) : '?'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {m.context === 'general' ? s.contextGeneral : m.context === 'social' ? s.contextSocial : s.contextSecret}
              </p>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{m.mask?.mskCode}</span>
          </div>
        ))}
      </div>
      <div className={`rounded-xl p-3 text-xs leading-relaxed ${
        allSameMask ? 'bg-emerald-500/5 border border-emerald-500/20 text-emerald-700' :
        'bg-violet-500/5 border border-violet-500/20 text-violet-600'
      }`}>
        {allSameMask ? s.allSameMask : s.diffMask}
      </div>
    </div>
  );
}
