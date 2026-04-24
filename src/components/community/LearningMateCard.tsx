// #43 러닝메이트 — 같은 V-File 유형의 유저 매칭 제안 (실제 유저 우선, 부족하면 가상유저로 보완)
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Mate {
  user_id: string;
  nickname: string | null;
  msk_code: string | null;
  primary_mask: string | null;
  is_virtual?: boolean;
}

const VIRTUAL_NICKNAMES: Record<string, string[]> = {
  '반항자': ['조용한 달', '깊은 안개', '차가운 불'],
  '돌보는자': ['따뜻한 벽', '느린 바람', '고요한 비'],
  '거울': ['유리 거울', '갈라진 거울', '투명한 강'],
  '구원자': ['숨은 달', '낮은 불꽃', '흔들리는 뿌리'],
  '매혹자': ['검은 나비', '먼 별', '작은 파도'],
  '유희자': ['무거운 빛', '긴 밤', '얇은 숲'],
  '승인자': ['닫힌 문', '깨진 시계', '조용한 달'],
  '탐험자': ['먼 별', '차가운 불', '깊은 안개'],
  '의존자': ['흔들리는 뿌리', '고요한 비', '따뜻한 벽'],
  '회피자': ['긴 밤', '닫힌 문', '얇은 숲'],
  '통제자': ['무거운 빛', '갈라진 거울', '낮은 불꽃'],
  '공허자': ['깨진 시계', '숨은 달', '유리 거울'],
};

export default function LearningMateCard() {
  const { user, primaryMask } = useAuth();
  const navigate = useNavigate();

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
        const aliases = (VIRTUAL_NICKNAMES[primaryMask] ?? ['익명의 탐험자', '조용한 달', '깊은 안개'])
          .slice(0, needed);
        // msk_code는 primary_mask로 역조회
        const MSK_CODE_MAP: Record<string, string> = {
          '반항자':'SCP','돌보는자':'GVR','거울':'EMP','구원자':'SAV','매혹자':'MKV',
          '유희자':'MNY','승인자':'APV','탐험자':'PSP','의존자':'DEP','회피자':'AVD',
          '통제자':'PWR','공허자':'NRC',
        };
        const code = MSK_CODE_MAP[primaryMask] ?? 'UNK';
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
        <p className="text-sm font-medium">러닝메이트</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">같은 가면</span>
      </div>
      <p className="text-xs text-muted-foreground">
        "{primaryMask}" 가면을 가진 분들이에요. 함께 탐색하면 더 깊어져요.
      </p>
      <div className="space-y-2">
        {mates.map((mate) => (
          <div key={mate.user_id} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {(mate.nickname ?? '?')[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{mate.nickname ?? '익명'}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{mate.msk_code}</p>
            </div>
            {!mate.is_virtual && (
              <button
                onClick={() => navigate('/home/community')}
                className="text-[10px] text-primary font-medium"
              >
                연결
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
