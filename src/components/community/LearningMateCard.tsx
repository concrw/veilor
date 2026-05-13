// #43 러닝메이트 — 같은 V-File 유형의 유저 매칭 제안 (실제 유저 우선, 부족하면 가상유저로 보완)
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/useT';
import { MASK_PROFILES } from '@/lib/vfileAlgorithm';

interface Mate {
  user_id: string;
  nickname: string | null;
  msk_code: string | null;
  primary_mask: string | null;
  is_virtual?: boolean;
}


export default function LearningMateCard() {
  const { user, primaryMask } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const s = t.communityDomain.learningMateCard;

  const { data: mates } = useQuery({
    queryKey: ['learning-mates', user?.id, primaryMask],
    queryFn: async () => {
      if (!primaryMask) return [];

      // 실제 유저 조회
      const { data: realUsers } = await veilorDb
        .from('user_profiles')
        .select('user_id, nickname, primary_mask, msk_code')
        .eq('primary_mask', primaryMask)
        .neq('user_id', user!.id)
        .limit(3);

      const real: Mate[] = (realUsers ?? []).map(u => ({ ...u, is_virtual: false }));

      // 실제 유저가 3명 미만이면 가상유저로 채움
      if (real.length < 3) {
        const needed = 3 - real.length;
        const aliases = (s.virtualNicknames[primaryMask] ?? s.defaultAliases)
          .slice(0, needed);
        const maskProfile = MASK_PROFILES.find(m => m.nameKo === primaryMask || m.mskCode === primaryMask);
        const code = maskProfile?.mskCode ?? (realUsers?.[0]?.msk_code) ?? 'UNK';
        const virtual: Mate[] = aliases.map((nickname, i) => ({
          user_id: `virtual-${code}-${i}`,
          nickname,
          msk_code: code,
          primary_mask: primaryMask,
          is_virtual: true,
        }));
        return [...real, ...virtual];
      }

      return real;
    },
    enabled: !!user && !!primaryMask,
    staleTime: 1000 * 60 * 10,
  });

  if (!mates || mates.length === 0) return null;

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{s.title}</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{s.sameMask}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {s.desc(primaryMask ?? '')}
      </p>
      <div className="space-y-2">
        {mates.map((mate) => (
          <div key={mate.user_id} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {(mate.nickname ?? '?')[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{mate.nickname ?? s.anon}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{mate.msk_code}</p>
            </div>
            {!mate.is_virtual && (
              <button
                onClick={() => navigate('/home/community')}
                className="text-[10px] text-primary font-medium"
              >
                {s.connect}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
