// #56 레이더 차트 시간 비교 + #60 페르소나 변화 추적
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { useGetTranslations, useMeTranslations } from '@/hooks/useTranslation';

export default function RadarTimeCompare() {
  const { user, axisScores } = useAuth();
  const get = useGetTranslations();
  const me = useMeTranslations();
  const t = get.radarCompare;

  const { data: history } = useQuery({
    queryKey: ['vfile-history-radar', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('priper_sessions')
        .select('axis_scores, primary_mask, msk_code, completed_at')
        .eq('user_id', user!.id)
        .eq('is_completed', true)
        .eq('context', 'general')
        .order('completed_at', { ascending: false })
        .limit(3);
      return data ?? [];
    },
    enabled: !!user,
  });

  if (!axisScores || !history || history.length < 2) return null;

  const current = axisScores as Record<string, number>;
  const previous = history[1]?.axis_scores as Record<string, number> | null;
  if (!previous) return null;

  const axisShortLabels = get.monthlyReport.axisShortLabels;

  const nowLabel = me.now;
  const prevLabel = me.monthAgo;

  const radarData = (['A', 'B', 'C', 'D'] as const).map(k => ({
    axis: axisShortLabels[k] ?? k,
    [nowLabel]: current[k] ?? 50,
    [prevLabel]: previous[k] ?? 50,
  }));

  // #60 페르소나 변화 추적
  const maskChanged = history[0]?.primary_mask !== history[1]?.primary_mask;

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{t.axisChange}</p>
        {maskChanged && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500">
            {t.maskChanged}
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <RadarChart data={radarData}>
          <PolarGrid strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
          <Radar name={prevLabel} dataKey={prevLabel} fill="#94A3B8" fillOpacity={0.15} stroke="#94A3B8" strokeWidth={1} strokeDasharray="4 4" />
          <Radar name={nowLabel} dataKey={nowLabel} fill="#8B5CF6" fillOpacity={0.25} stroke="#8B5CF6" strokeWidth={2} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </RadarChart>
      </ResponsiveContainer>

      {maskChanged && (
        <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-3 space-y-1">
          <p className="text-xs font-medium text-violet-500">{t.personaChange}</p>
          <p className="text-sm">
            <span className="text-muted-foreground">{history[1]?.primary_mask}</span>
            <span className="mx-2">→</span>
            <span className="font-semibold">{history[0]?.primary_mask}</span>
          </p>
          <p className="text-[10px] text-muted-foreground">
            {new Date(history[1]?.completed_at).toLocaleDateString('ko-KR')} →{' '}
            {new Date(history[0]?.completed_at).toLocaleDateString('ko-KR')}
          </p>
        </div>
      )}
    </div>
  );
}
