import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export type EventType = 'turning_point' | 'conflict' | 'growth' | 'distance' | 'connection';

export interface TimelineEvent {
  id: string;
  user_id: string;
  partner_id: string | null;
  event_date: string;
  event_type: EventType;
  title: string;
  description: string | null;
  emotional_tone: number;
  created_at: string;
}

export interface NewTimelineEvent {
  event_date: string;
  event_type: EventType;
  title: string;
  description?: string;
  emotional_tone: number;
  partner_id?: string | null;
}

export const EVENT_TYPE_META: Record<EventType, { label: string; emoji: string; color: string }> = {
  turning_point: { label: '전환점',  emoji: '⚡', color: '#F5C842' },
  conflict:      { label: '갈등',    emoji: '🌩️', color: '#F87171' },
  growth:        { label: '성장',    emoji: '🌱', color: '#6EE7B7' },
  distance:      { label: '거리',    emoji: '🌫️', color: '#9CA3AF' },
  connection:    { label: '연결',    emoji: '🤝', color: '#8B9EFF' },
};

export function useRelationshipTimeline() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['relationship-timeline', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await veilorDb
        .from('relationship_timeline')
        .select('*')
        .order('event_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as TimelineEvent[];
    },
  });

  const addEvent = useMutation({
    mutationFn: async (payload: NewTimelineEvent) => {
      if (!user) throw new Error('로그인 필요');
      const { error } = await veilorDb
        .from('relationship_timeline')
        .insert({ ...payload, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['relationship-timeline', user?.id] }),
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await veilorDb
        .from('relationship_timeline')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['relationship-timeline', user?.id] }),
  });

  // 3개월 전 vs 지금 평균 감정 온도 비교
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const recent = events.filter(e => new Date(e.event_date) >= threeMonthsAgo);
  const older  = events.filter(e => new Date(e.event_date) < threeMonthsAgo);

  const avg = (arr: TimelineEvent[]) =>
    arr.length === 0 ? null : Math.round(arr.reduce((s, e) => s + e.emotional_tone, 0) / arr.length * 10) / 10;

  const recentAvg = avg(recent);
  const olderAvg  = avg(older);

  return { events, isLoading, addEvent, deleteEvent, recentAvg, olderAvg };
}
