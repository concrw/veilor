// #59 피드 진화 알림 — 사용 데이터가 일정 수준에 도달하면 알림
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { useState } from 'react';
import { C } from '@/lib/colors';
import { useMeTranslations } from '@/hooks/useTranslation';

interface Milestone {
  key: string;
  threshold: number;
  translationKey: string;
  icon: string;
}

const MILESTONES: Milestone[] = [
  { key: 'sessions', threshold: 5, translationKey: 'sessions5', icon: '🌱' },
  { key: 'sessions', threshold: 20, translationKey: 'sessions20', icon: '🌿' },
  { key: 'signals', threshold: 10, translationKey: 'signals10', icon: '📡' },
  { key: 'signals', threshold: 50, translationKey: 'signals50', icon: '🗺️' },
  { key: 'codetalk', threshold: 7, translationKey: 'codetalk7', icon: '💬' },
  { key: 'codetalk', threshold: 30, translationKey: 'codetalk30', icon: '🔮' },
];

export default function FeedEvolutionBanner() {
  const { user } = useAuth();
  const me = useMeTranslations();
  const t = me.feedEvolution;
  const [dismissed, setDismissed] = useState<string[]>([]);

  const { data: counts } = useQuery({
    queryKey: ['feed-evolution', user?.id],
    queryFn: async () => {
      const [sessions, signals, codetalk] = await Promise.all([
        veilorDb.from('dive_sessions').select('id', { count: 'exact', head: true }).eq('user_id', user!.id).eq('session_completed', true),
        veilorDb.from('user_signals').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
        veilorDb.from('codetalk_entries').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
      ]);
      return { sessions: sessions.count ?? 0, signals: signals.count ?? 0, codetalk: codetalk.count ?? 0 };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  if (!counts) return null;

  const achieved = MILESTONES.filter(m => {
    const val = counts[m.key as keyof typeof counts] ?? 0;
    return val >= m.threshold && !dismissed.includes(`${m.key}-${m.threshold}`);
  });

  const latest = achieved[achieved.length - 1];
  if (!latest) return null;

  const dismissKey = `${latest.key}-${latest.threshold}`;
  const milestone = t.milestones[latest.translationKey];

  return (
    <div className="vr-fade-in" style={{ background: `${C.amberGold}08`, border: `1px solid ${C.amberGold}22`, borderRadius: 14, padding: '13px 15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{latest.icon}</span>
          <p style={{ fontSize: 13, fontWeight: 400, color: C.text }}>{milestone?.title}</p>
        </div>
        <button onClick={() => setDismissed(d => [...d, dismissKey])} aria-label={t.dismissAriaLabel}
          style={{ fontSize: 11, color: C.text4, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
      </div>
      <p style={{ fontSize: 10, fontWeight: 300, color: C.text4, marginTop: 4, paddingLeft: 26 }}>{milestone?.desc}</p>
    </div>
  );
}
