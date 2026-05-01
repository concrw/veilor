import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import type { RelationCheckin } from '@/integrations/supabase/veilor-types';

export interface PersonSummary {
  name: string;
  avgWarmth: number;
  avgEnergy: number;
  count: number;
}

export function useRelationConnect() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: checkins = [], isLoading } = useQuery({
    queryKey: ['relation-checkins', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('relation_checkins')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(30);
      return (data ?? []) as RelationCheckin[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  const todayCheckins = checkins.filter(c => {
    const d = new Date(c.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const last7Days = checkins.filter(c => {
    const d = new Date(c.created_at);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return d >= cutoff;
  });

  // 사람별 집계
  const byPerson: Record<string, { warmth: number[]; energy: number[] }> = {};
  last7Days.forEach(c => {
    if (!byPerson[c.person_name]) byPerson[c.person_name] = { warmth: [], energy: [] };
    byPerson[c.person_name].warmth.push(c.warmth_score);
    byPerson[c.person_name].energy.push(c.energy_balance);
  });

  const personSummaries: PersonSummary[] = Object.entries(byPerson).map(([name, vals]) => ({
    name,
    avgWarmth: vals.warmth.reduce((a, b) => a + b, 0) / vals.warmth.length,
    avgEnergy: vals.energy.reduce((a, b) => a + b, 0) / vals.energy.length,
    count: vals.warmth.length,
  }));

  const warmest = personSummaries.length > 0
    ? personSummaries.reduce((a, b) => a.avgWarmth >= b.avgWarmth ? a : b)
    : null;

  const mostConcerning = personSummaries.length > 0
    ? personSummaries.reduce((a, b) => a.avgWarmth <= b.avgWarmth ? a : b)
    : null;

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      person_name: string;
      warmth_score: number;
      energy_balance: number;
      note: string;
      lang: string;
    }) => {
      if (!user) throw new Error('not authenticated');
      await veilorDb.from('relation_checkins').insert({
        user_id: user.id,
        ...payload,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['relation-checkins'] });
    },
  });

  return {
    checkins,
    isLoading,
    todayCheckins,
    last7Days,
    personSummaries,
    warmest,
    mostConcerning,
    saveMutation,
  };
}
