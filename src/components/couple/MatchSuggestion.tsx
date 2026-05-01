import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { MASK_PROFILES } from '@/lib/vfileAlgorithm';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    title: '추천 매칭',
    subtitle: 'V-File 기반 보완적/유사 유형',
    anonymous: '익명',
    compat: '호환',
  },
  en: {
    title: 'Recommended Matches',
    subtitle: 'Complementary/similar types based on V-File',
    anonymous: 'Anonymous',
    compat: 'Compat',
  },
};

export default function MatchSuggestion() {
  const { user, primaryMask, axisScores } = useAuth();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const { data: suggestions } = useQuery({
    queryKey: ['match-suggestions', user?.id],
    queryFn: async () => {
      if (!primaryMask) return [];
      const myProfile = MASK_PROFILES.find(m => m.nameKo === primaryMask || m.mskCode === primaryMask);
      if (!myProfile) return [];

      const { data } = await veilorDb.from('user_profiles')
        .select('user_id, nickname, primary_mask, msk_code, axis_scores')
        .neq('user_id', user!.id)
        .not('msk_code', 'is', null)
        .limit(10);

      if (!data) return [];

      return data.map((u: Record<string, unknown>) => {
        const profile = MASK_PROFILES.find(m => m.mskCode === u.msk_code);
        const isPair = myProfile.pairCode === (u.msk_code as string);
        const sameCategory = profile?.category === myProfile.category;
        let score = isPair ? 90 : sameCategory ? 60 : 70;
        const uAxisScores = u.axis_scores as Record<string, number> | null;
        if (uAxisScores && axisScores) {
          const axisDiff = (['A', 'B', 'C', 'D'] as const).reduce((sum, k) =>
            sum + Math.abs((axisScores[k] ?? 50) - (uAxisScores[k] ?? 50)), 0);
          score += Math.round((400 - axisDiff) / 40);
        }
        return { ...u, profile, compatibility: Math.min(score, 99) };
      }).sort((a, b) => b.compatibility - a.compatibility).slice(0, 5);
    },
    enabled: !!user && !!primaryMask,
    staleTime: 1000 * 60 * 10,
  });

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <p className="text-sm font-medium">{s.title}</p>
      <p className="text-xs text-muted-foreground">{s.subtitle}</p>
      <div className="space-y-2">
        {suggestions.map((item) => (
          <div key={item.user_id} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: (item.profile?.color ?? '#6366f1') + '20', color: item.profile?.color }}>
              {(item.nickname ?? '?')[0]}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium">{item.nickname ?? s.anonymous}</p>
              <p className="text-[10px] text-muted-foreground">{item.profile?.nameKo} · {item.msk_code}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-primary">{item.compatibility}%</p>
              <p className="text-[10px] text-muted-foreground">{s.compat}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
