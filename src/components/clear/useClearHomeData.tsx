import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useLanguageContext } from '@/context/LanguageContext';
import type { EmotionScore } from '@/components/charts/EmotionWheel';
import {
  type ClearCheckin,
  type WeeklySession,
  type ActivityKey,
  calcHealthScore,
  hasClearCheckinToday,
  markClearCheckinToday,
} from './clearHomeTypes';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export function useClearHomeData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const isEn = language === 'en';

  const [checkedToday, setCheckedToday] = useState(hasClearCheckinToday);
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [todayActivities, setTodayActivities] = useState<ActivityKey[]>([]);

  const { data: weekSessions = [] } = useQuery<WeeklySession[]>({
    queryKey: ['clear_week_sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
      weekAgo.setHours(0, 0, 0, 0);
      const { data } = await veilorDb
        .from('tab_conversations')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString());
      return (data ?? []) as WeeklySession[];
    },
    enabled: !!user,
  });

  const { data: clearCheckins = [] } = useQuery<ClearCheckin[]>({
    queryKey: ['clear_checkins', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await veilorDb
        .from('tab_conversations')
        .select('content')
        .eq('user_id', user.id)
        .eq('tab', 'clear_checkin')
        .order('created_at', { ascending: false })
        .limit(30);
      return (data ?? [])
        .map(row => {
          try { return JSON.parse(row.content ?? '{}') as ClearCheckin; }
          catch { return null; }
        })
        .filter((x): x is ClearCheckin => x !== null && typeof x.mood_score === 'number');
    },
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ['clear_profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await veilorDb
        .from('user_profiles')
        .select('nickname, streak_count')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: emotionScores } = useQuery({
    queryKey: ['emotion_scores_recent', user?.id],
    queryFn: async (): Promise<EmotionScore[]> => {
      if (!user) return [];
      const { data } = await veilorDb
        .from('emotion_scores' as never)
        .select('top_emotions')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (!data?.length) return [];
      const totals: Record<string, number> = {};
      const counts: Record<string, number> = {};
      for (const row of data as Array<{ top_emotions: Array<{ label: string; score: number }> }>) {
        for (const { label, score } of row.top_emotions ?? []) {
          totals[label] = (totals[label] ?? 0) + score;
          counts[label] = (counts[label] ?? 0) + 1;
        }
      }
      return Object.entries(totals).map(([emotion, total]) => ({
        emotion,
        score: total / counts[emotion],
      }));
    },
    enabled: !!user,
  });

  const { data: sexSelfData } = useQuery({
    queryKey: ['clear_sexself', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await veilorDb
        .from('cq_responses')
        .select('question_key, response_value')
        .eq('user_id', user.id)
        .in('question_key', [
          'sexself_profile',
          'sexself_sex_leading',
          'sexself_sex_expressiveness',
          'sexself_sex_intensity',
          'sexself_kink_role',
          'sexself_kink_intensity',
        ]);
      if (!data || data.length === 0) return null;
      return Object.fromEntries(data.map(r => [r.question_key, r.response_value])) as Record<string, string>;
    },
    enabled: !!user,
  });

  const today = new Date();
  const weekBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const count = weekSessions.filter(s => (s.created_at ?? '').startsWith(dateStr)).length;
    return { date: dateStr, count, day: DAY_LABELS[d.getDay()], isToday: i === 6 };
  });

  const weekCount = weekBars.reduce((s, b) => s + b.count, 0);
  const moodAvg =
    clearCheckins.length > 0
      ? clearCheckins.slice(0, 7).reduce((s, ch) => s + ch.mood_score, 0) /
        Math.min(clearCheckins.length, 7)
      : 5;
  const healthScore = calcHealthScore({ weekCount, moodAvg, streakCount: profile?.streak_count ?? 0 });

  const handleCheckinComplete = useCallback(
    async (moodScore: number, activities: ActivityKey[]) => {
      if (!user) return;
      const payload: ClearCheckin = {
        mood_score: moodScore,
        activities,
        checked_at: new Date().toISOString(),
      };
      await veilorDb.from('tab_conversations').insert({
        user_id: user.id,
        tab: 'clear_checkin',
        stage: 'daily',
        role: 'user',
        content: JSON.stringify(payload),
      });
      markClearCheckinToday();
      setCheckedToday(true);
      setTodayMood(moodScore);
      setTodayActivities(activities);
      if (moodScore <= 4) {
        toast({
          title: isEn ? 'Feeling low today?' : '감정이 많이 쌓인 것 같아요.',
          description: isEn ? "Vent can help you release what's building up." : 'Vent에서 털어내보는 건 어떨까요?',
          action: (
            <ToastAction altText={isEn ? 'Go to Vent' : 'Vent 이동'} onClick={() => navigate('/home/vent')}>
              {isEn ? 'Vent' : 'Vent 이동'}
            </ToastAction>
          ),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['clear_checkins', user.id] });
      queryClient.invalidateQueries({ queryKey: ['clear_week_sessions', user.id] });
    },
    [user, queryClient],
  );

  return {
    today,
    profile,
    weekBars,
    weekCount,
    healthScore,
    clearCheckins,
    emotionScores,
    sexSelfData,
    checkedToday,
    todayMood,
    todayActivities,
    handleCheckinComplete,
  };
}
