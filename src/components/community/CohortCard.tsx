// #51 100일 코호트 — 함께 진행하는 그룹
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';

export default function CohortCard() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: cohort } = useQuery({
    queryKey: ['my-cohort', user?.id],
    queryFn: async () => {
      // 사용자가 참여 중인 코호트 그룹 조회
      const { data: memberships } = await veilorDb
        .from('community_memberships')
        .select('group_id')
        .eq('user_id', user!.id);

      if (!memberships?.length) return null;

      const groupIds = memberships.map(m => m.group_id);
      const { data: groups } = await veilorDb
        .from('community_groups')
        .select('*')
        .in('id', groupIds)
        .eq('group_type', 'cohort')
        .limit(1)
        .single();

      return groups;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // 참여 가능한 코호트 찾기
  const { data: availableCohorts = [] } = useQuery({
    queryKey: ['available-cohorts'],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('community_groups')
        .select('id, name, description, cohort_start_date, cohort_day_number, max_members, member_count')
        .eq('group_type', 'cohort')
        .order('created_at', { ascending: false })
        .limit(3);
      return data ?? [];
    },
    enabled: !!user && !cohort,
  });

  const joinMutation = useMutation({
    mutationFn: async (groupId: string) => {
      if (!user) return;
      await veilorDb.from('community_memberships').insert({
        user_id: user.id,
        group_id: groupId,
        role: 'member',
        joined_at: new Date().toISOString(),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-cohort'] }),
  });

  if (cohort) {
    const daysDone = cohort.cohort_day_number ?? 0;
    return (
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{cohort.name}</p>
          <span className="text-xs text-primary font-medium">DAY {daysDone}/100</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full">
          <div className="h-1.5 bg-primary rounded-full" style={{ width: `${daysDone}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">
          {cohort.member_count ?? 0}명과 함께 진행 중 · {100 - daysDone}일 남음
        </p>
      </div>
    );
  }

  if (availableCohorts.length === 0) return null;

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <p className="text-sm font-medium">100일 코호트 참여하기</p>
      <p className="text-xs text-muted-foreground">같은 목표를 가진 사람들과 100일간 함께해요</p>
      {availableCohorts.map((c: { id: string; name: string; member_count: number | null; max_members: number | null }) => (
        <div key={c.id} className="flex items-center justify-between bg-muted/30 rounded-xl p-3">
          <div>
            <p className="text-xs font-medium">{c.name}</p>
            <p className="text-[10px] text-muted-foreground">{c.member_count ?? 0}/{c.max_members ?? '∞'}명</p>
          </div>
          <button
            onClick={() => joinMutation.mutate(c.id)}
            disabled={joinMutation.isPending}
            className="text-xs text-primary font-medium px-3 py-1.5 rounded-lg border border-primary/30 hover:bg-primary/5"
          >
            참여
          </button>
        </div>
      ))}
    </div>
  );
}
