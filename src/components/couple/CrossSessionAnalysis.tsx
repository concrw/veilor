import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';

const AXIS_LABELS: Record<string, string> = { A: '애착', B: '소통', C: '욕구표현', D: '역할' };

interface Props {
  myUserId: string | undefined;
  partnerUserId: string | undefined;
}

export default function CrossSessionAnalysis({ myUserId, partnerUserId }: Props) {
  const { user } = useAuth();
  const uid = myUserId ?? user?.id;

  const { data } = useQuery({
    queryKey: ['cross-session', uid, partnerUserId],
    queryFn: async () => {
      if (!uid || !partnerUserId) return null;
      const [myRes, partnerRes] = await Promise.all([
        veilorDb.from('priper_sessions').select('axis_scores, primary_mask, completed_at')
          .eq('user_id', uid).eq('is_completed', true)
          .order('completed_at', { ascending: false }).limit(1).single(),
        veilorDb.from('priper_sessions').select('axis_scores, primary_mask, completed_at')
          .eq('user_id', partnerUserId).eq('is_completed', true)
          .order('completed_at', { ascending: false }).limit(1).single(),
      ]);
      return { my: myRes.data, partner: partnerRes.data };
    },
    enabled: !!uid && !!partnerUserId,
    staleTime: 1000 * 60 * 5,
  });

  if (!data?.my?.axis_scores || !data?.partner?.axis_scores) return null;

  const myScores = data.my.axis_scores as Record<string, number>;
  const partnerScores = data.partner.axis_scores as Record<string, number>;
  const axes = ['A', 'B', 'C', 'D'] as const;

  const combined = axes.map(k => ({
    axis: k,
    my: myScores[k] ?? 50,
    partner: partnerScores[k] ?? 50,
    avg: Math.round(((myScores[k] ?? 50) + (partnerScores[k] ?? 50)) / 2),
  }));

  const weakAxis = combined.reduce((min, cur) => cur.avg < min.avg ? cur : min);
  const strongAxis = combined.reduce((max, cur) => cur.avg > max.avg ? cur : max);

  return (
    <div className="border-t pt-3 mt-1 space-y-3">
      <p className="text-[10px] text-muted-foreground font-medium">4축 교차 분석</p>
      <div className="space-y-2">
        {combined.map(({ axis, my, partner, avg }) => (
          <div key={axis} className="space-y-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground w-14">{AXIS_LABELS[axis]}</span>
              <div className="flex gap-2 text-[9px]">
                <span className="text-primary">나 {my}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-violet-500">파트너 {partner}</span>
              </div>
            </div>
            <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="absolute h-full bg-primary/40 rounded-full" style={{ width: `${my}%` }} />
              <div className="absolute h-full bg-violet-500/40 rounded-full" style={{ width: `${partner}%`, left: 0 }} />
              <div
                className={`absolute h-full rounded-full transition-all ${avg < 40 ? 'bg-red-500/60' : avg > 70 ? 'bg-emerald-500/60' : 'bg-primary/20'}`}
                style={{ width: `${avg}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2 space-y-0.5">
          <p className="text-[9px] text-emerald-600 font-medium">강점 축</p>
          <p className="text-xs font-semibold">{AXIS_LABELS[strongAxis.axis]}</p>
          <p className="text-[9px] text-muted-foreground">평균 {strongAxis.avg}점</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2 space-y-0.5">
          <p className="text-[9px] text-red-500 font-medium">함께 성장할 영역</p>
          <p className="text-xs font-semibold">{AXIS_LABELS[weakAxis.axis]}</p>
          <p className="text-[9px] text-muted-foreground">평균 {weakAxis.avg}점</p>
        </div>
      </div>
    </div>
  );
}
