// #43 러닝메이트 — 비슷한 V-File 유형의 유저 매칭 제안
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilrumDb } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function LearningMateCard() {
  const { user, primaryMask } = useAuth();
  const navigate = useNavigate();

  const { data: mates } = useQuery({
    queryKey: ['learning-mates', user?.id, primaryMask],
    queryFn: async () => {
      if (!primaryMask) return [];
      // 같은 가면 유형의 다른 유저 찾기 (최대 3명)
      const { data } = await veilrumDb
        .from('user_profiles')
        .select('user_id, nickname, primary_mask, msk_code')
        .eq('primary_mask', primaryMask)
        .neq('user_id', user!.id)
        .limit(3);
      return data ?? [];
    },
    enabled: !!user && !!primaryMask,
    staleTime: 1000 * 60 * 10,
  });

  if (!mates || mates.length === 0) return null;

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">러닝메이트</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">같은 가면</span>
      </div>
      <p className="text-xs text-muted-foreground">
        "{primaryMask}" 가면을 가진 다른 분들이에요. 함께 탐색하면 더 깊어져요.
      </p>
      <div className="space-y-2">
        {mates.map((mate: any) => (
          <div key={mate.user_id} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {(mate.nickname ?? '?')[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{mate.nickname ?? '익명'}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{mate.msk_code}</p>
            </div>
            <button
              onClick={() => navigate('/home/community')}
              className="text-[10px] text-primary font-medium"
            >
              연결
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
