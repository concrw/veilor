// #59 피드 진화 알림 — 사용 데이터가 일정 수준에 도달하면 알림
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilrumDb } from '@/integrations/supabase/client';
import { useState } from 'react';

interface Milestone {
  key: string;
  threshold: number;
  title: string;
  desc: string;
  icon: string;
}

const MILESTONES: Milestone[] = [
  { key: 'sessions', threshold: 5, title: '5번째 대화 완료', desc: '패턴 감지가 활성화됩니다', icon: '🌱' },
  { key: 'sessions', threshold: 20, title: '20번째 대화 달성', desc: '정밀도가 크게 올라갔어요', icon: '🌿' },
  { key: 'signals', threshold: 10, title: '10개 시그널 수집', desc: 'Dig 분석이 더 정확해집니다', icon: '📡' },
  { key: 'signals', threshold: 50, title: '50개 시그널 달성', desc: '관계 패턴 지도가 완성되어가요', icon: '🗺️' },
  { key: 'codetalk', threshold: 7, title: '코드토크 7일차', desc: '첫 번째 주간 패턴이 보여요', icon: '💬' },
  { key: 'codetalk', threshold: 30, title: '코드토크 30일차', desc: '소통 스타일이 선명해지고 있어요', icon: '🔮' },
];

export default function FeedEvolutionBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState<string[]>([]);

  const { data: counts } = useQuery({
    queryKey: ['feed-evolution', user?.id],
    queryFn: async () => {
      const [sessions, signals, codetalk] = await Promise.all([
        veilrumDb.from('dive_sessions').select('id', { count: 'exact', head: true }).eq('user_id', user!.id).eq('session_completed', true),
        veilrumDb.from('user_signals').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
        veilrumDb.from('codetalk_entries').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
      ]);
      return { sessions: sessions.count ?? 0, signals: signals.count ?? 0, codetalk: codetalk.count ?? 0 };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  if (!counts) return null;

  // 가장 최근 달성한 마일스톤 찾기
  const achieved = MILESTONES.filter(m => {
    const val = counts[m.key as keyof typeof counts] ?? 0;
    return val >= m.threshold && !dismissed.includes(`${m.key}-${m.threshold}`);
  });

  // 가장 높은 마일스톤만 표시
  const latest = achieved[achieved.length - 1];
  if (!latest) return null;

  const dismissKey = `${latest.key}-${latest.threshold}`;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{latest.icon}</span>
          <p className="text-sm font-medium">{latest.title}</p>
        </div>
        <button onClick={() => setDismissed(d => [...d, dismissKey])} className="text-xs text-muted-foreground">✕</button>
      </div>
      <p className="text-xs text-muted-foreground pl-7">{latest.desc}</p>
    </div>
  );
}
