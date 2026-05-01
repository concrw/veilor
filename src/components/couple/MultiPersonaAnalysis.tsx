import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { MASK_PROFILES } from '@/lib/vfileAlgorithm';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    title: '멀티페르소나 분석',
    emptyDesc: '2가지 이상 맥락(사회적/일반적/비밀스러운)의 V-File을 완료하면 교차 분석이 가능해요',
    emptyHint: 'Get 탭 → 세 개의 나 → 추가 진단',
    contextGeneral: '일반적인 나',
    contextSocial: '사회적인 나',
    contextSecret: '비밀스러운 나',
    allSameMask: '모든 맥락에서 같은 가면을 쓰고 있어요. 일관된 관계 패턴을 가지고 있습니다.',
    diffMask: '맥락에 따라 다른 가면이 나타나요. 상황별로 다른 전략을 사용하고 있습니다.',
  },
  en: {
    title: 'Multi-Persona Analysis',
    emptyDesc: 'Complete V-Files in 2+ contexts (social/general/secret) to unlock cross-analysis',
    emptyHint: 'Get tab → Three Selves → Additional Diagnosis',
    contextGeneral: 'General Me',
    contextSocial: 'Social Me',
    contextSecret: 'Secret Me',
    allSameMask: 'You wear the same mask in every context — consistent relational pattern.',
    diffMask: 'Different masks emerge per context — you use different strategies by situation.',
  },
};

export default function MultiPersonaAnalysis() {
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

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
                {m.mask?.nameKo ?? '?'}
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
