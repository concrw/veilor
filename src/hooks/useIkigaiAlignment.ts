import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';

interface AlignmentPattern {
  id: string;
  ko: string;
  en: string;
}

interface IkigaiScores {
  self: number;
  work: number;
  relation: number;
  social: number;
}

interface UseIkigaiAlignmentParams {
  userId: string;
  ventCount?: number;
}

const PATTERNS: Array<{
  id: string;
  condition: (s: IkigaiScores) => boolean;
  ko: string;
  en: string;
  priority: number;
}> = [
  {
    id: 'all_low',
    condition: (s) => (s.self + s.work + s.relation + s.social) / 4 <= 25,
    ko: '아직 시작 단계예요. 가장 끌리는 도메인 하나에 집중해보세요.',
    en: "You're just getting started. Focus on one domain that pulls you most.",
    priority: 1,
  },
  {
    id: 'work_high_self_low',
    condition: (s) => s.work >= 70 && s.self <= 30,
    ko: '실행은 강하지만 에너지 점검이 필요해요. Vent 탭에서 감정 체크를 해보세요.',
    en: "You're executing well but energy needs checking. Try an emotional check-in on the Vent tab.",
    priority: 2,
  },
  {
    id: 'social_high_work_low',
    condition: (s) => s.social >= 60 && s.work <= 20,
    ko: '관심사는 뚜렷한데 실행이 따라오지 못하고 있어요. Set 탭에서 첫 액션을 만들어보세요.',
    en: "Your interests are clear but execution isn't keeping up. Create your first action in the Set tab.",
    priority: 3,
  },
  {
    id: 'relation_low_all',
    condition: (s) => s.relation <= 20 && s.self >= 50,
    ko: '혼자 잘 버티고 있지만 연결이 부족해요. 관계 도메인을 탐색해보는 건 어떨까요?',
    en: "You're holding up well alone, but connection is lacking. Consider exploring the Relation domain.",
    priority: 4,
  },
  {
    id: 'balanced',
    condition: (s) => s.self >= 40 && s.self <= 80 && s.work >= 40 && s.work <= 80 && s.relation >= 40 && s.relation <= 80 && s.social >= 40 && s.social <= 80,
    ko: '4축이 고르게 활성화되어 있어요.',
    en: 'All four axes are evenly activated.',
    priority: 5,
  },
];

export function useIkigaiAlignment({ userId, ventCount }: UseIkigaiAlignmentParams) {
  const selfScore = Math.min(100, ventCount * 5);

  const { data: workData, isLoading: workLoading } = useQuery({
    queryKey: ['alignment-work', userId],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('work_tasks' as never)
        .select('status')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 86400 * 1000).toISOString());
      return (data as Array<{ status: string }> | null) ?? [];
    },
    enabled: !!userId,
  });

  const { data: relationData, isLoading: relationLoading } = useQuery({
    queryKey: ['alignment-relation', userId],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('relationship_entities')
        .select('affect_valence')
        .eq('user_id', userId);
      return (data as Array<{ affect_valence: number | null }> | null) ?? [];
    },
    enabled: !!userId,
  });

  const { data: socialData, isLoading: socialLoading } = useQuery({
    queryKey: ['alignment-social', userId],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('social_interests')
        .select('id')
        .eq('user_id', userId)
        .eq('level', 1)
        .eq('status', 'active');
      return (data as Array<{ id: string }> | null) ?? [];
    },
    enabled: !!userId,
  });

  const isLoading = workLoading || relationLoading || socialLoading;

  const workScore = (() => {
    if (!workData || workData.length === 0) return 0;
    const done = workData.filter((t) => t.status === 'done').length;
    return Math.round((done / workData.length) * 100);
  })();

  const relationScore = (() => {
    if (!relationData || relationData.length === 0) return 0;
    const count = relationData.length;
    const avgValence =
      relationData.reduce((sum, r) => sum + (r.affect_valence ?? 0), 0) / count;
    return Math.min(100, count * 10 + avgValence * 20);
  })();

  const socialScore = (() => {
    if (!socialData) return 0;
    return Math.min(100, socialData.length * 20);
  })();

  const scores: IkigaiScores = {
    self: selfScore,
    work: workScore,
    relation: relationScore,
    social: socialScore,
  };

  const patterns: AlignmentPattern[] = PATTERNS
    .filter((p) => p.condition(scores))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 2)
    .map(({ id, ko, en }) => ({ id, ko, en }));

  return { scores, isLoading, patterns };
}
