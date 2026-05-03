import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useLanguageContext } from '@/context/LanguageContext';
import { veilorDb } from '@/integrations/supabase/client';
import type { ChangeTrainingSession, ChangeTrainingLog } from '@/integrations/supabase/veilor-types';
import { C } from '@/lib/colors';
import { Flame, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const S = {
  ko: {
    subtitle: '변화 훈련 · 일지 기록',
    cancel: '취소',
    newSession: '새 세션',
    titlePlaceholder: '훈련 주제',
    goalPlaceholder: '목표 (선택)',
    creating: '생성 중...',
    startSession: '세션 시작',
    loading: '불러오는 중...',
    empty: '훈련 세션이 없습니다',
    emptySub: '새 세션을 시작해보세요',
    notePlaceholder: '오늘의 기록...',
    saving: '저장 중...',
    addLog: '일지 추가',
    noLogs: '아직 기록이 없습니다',
    logAdded: '일지가 기록됐습니다',
    sessionCreated: '훈련 세션이 생성됐습니다',
    loginRequired: '로그인 필요',
    moodLabels: ['매우 힘듦', '힘듦', '보통', '좋음', '매우 좋음'] as string[],
  },
  en: {
    subtitle: 'Change Training · Daily Log',
    cancel: 'Cancel',
    newSession: 'New Session',
    titlePlaceholder: 'Training topic',
    goalPlaceholder: 'Goal (optional)',
    creating: 'Creating...',
    startSession: 'Start Session',
    loading: 'Loading...',
    empty: 'No training sessions',
    emptySub: 'Start a new session',
    notePlaceholder: "Today's note...",
    saving: 'Saving...',
    addLog: 'Add Log',
    noLogs: 'No logs yet',
    logAdded: 'Log recorded',
    sessionCreated: 'Training session created',
    loginRequired: 'Login required',
    moodLabels: ['Very Hard', 'Hard', 'Normal', 'Good', 'Very Good'] as string[],
  },
};

function LogItem({ log, moodLabels }: { log: ChangeTrainingLog; moodLabels: string[] }) {
  const score = log.mood_score ?? 3;
  const color = ['#C97A6A', '#C97A6A', '#9C9590', '#7FB89A', '#7FB89A'][score - 1];
  return (
    <div style={{ padding: '10px 0', borderBottom: `1px solid ${C.border2}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: C.text4 }}>{log.log_date}</span>
        <span style={{ fontSize: 11, color }}>{moodLabels[score - 1]}</span>
      </div>
      {log.note && <p style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{log.note}</p>}
    </div>
  );
}

function SessionCard({ session, s }: { session: ChangeTrainingSession; s: typeof S.ko }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState('');
  const [mood, setMood] = useState(3);

  const { data: logs = [] } = useQuery({
    queryKey: ['change_training_logs', session.id],
    enabled: expanded,
    queryFn: async () => {
      const { data } = await veilorDb.from('change_training_logs')
        .select('*').eq('session_id', session.id).order('log_date', { ascending: false });
      return (data ?? []) as ChangeTrainingLog[];
    },
  });

  const { mutate: addLog, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error(s.loginRequired);
      const { error } = await veilorDb.from('change_training_logs').insert({
        session_id: session.id, user_id: user.id, note: note || null, mood_score: mood,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['change_training_logs', session.id] });
      setNote('');
      toast({ title: s.logAdded });
    },
  });

  const statusColor = { active: '#7FB89A', completed: '#6B9EC9', paused: '#9C9590' }[session.status];

  return (
    <div style={{ background: '#1C1917', border: `1px solid ${C.border2}`, borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        onClick={() => setExpanded(p => !p)}>
        <Flame size={16} color={statusColor} />
        <div style={{ flex: 1 }}>
          <p style={{ color: C.text, fontSize: 14, fontFamily: "'Cormorant Garamond', serif", marginBottom: 2 }}>{session.title}</p>
          {session.goal && <p style={{ fontSize: 11, color: C.text4 }}>{session.goal}</p>}
        </div>
        <span style={{ fontSize: 10, color: statusColor, border: `1px solid ${statusColor}44`, borderRadius: 6, padding: '2px 8px' }}>{session.status}</span>
        {expanded ? <ChevronUp size={14} color={C.text4} /> : <ChevronDown size={14} color={C.text4} />}
      </div>

      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${C.border2}` }}>
          <div style={{ paddingTop: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setMood(s)}
                  style={{ flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 11, cursor: 'pointer', border: 'none',
                    background: mood === s ? `color-mix(in srgb, ${C.amber} 20%, #1C1917)` : '#2A2724',
                    color: mood === s ? C.amber : C.text4 }}>
                  {s}
                </button>
              ))}
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder={s.notePlaceholder} rows={2}
              style={{ width: '100%', background: '#2A2724', border: `1px solid ${C.border2}`, borderRadius: 10, padding: '8px 12px', color: C.text, fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
            <button onClick={() => addLog()} disabled={isPending}
              style={{ marginTop: 8, width: '100%', padding: '9px', borderRadius: 10, background: C.amber, color: '#1C1917', border: 'none', fontSize: 13, cursor: 'pointer' }}>
              {isPending ? s.saving : s.addLog}
            </button>
          </div>
          <div>
            {logs.map(l => <LogItem key={l.id} log={l} moodLabels={s.moodLabels} />)}
            {logs.length === 0 && <p style={{ color: C.text4, fontSize: 12, textAlign: 'center', padding: '12px 0' }}>{s.noLogs}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChangeTrainingPage() {
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['change_training_sessions', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await veilorDb.from('change_training_sessions')
        .select('*').eq('user_id', user!.id).order('started_at', { ascending: false });
      return (data ?? []) as ChangeTrainingSession[];
    },
  });

  const { mutate: createSession, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error(s.loginRequired);
      const { error } = await veilorDb.from('change_training_sessions').insert({
        user_id: user.id, title: newTitle, goal: newGoal || null, status: 'active',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['change_training_sessions', user?.id] });
      setNewTitle(''); setNewGoal(''); setCreating(false);
      toast({ title: s.sessionCreated });
    },
  });

  return (
    <div style={{ background: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${C.border2}`, display: 'flex', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 22, color: C.text, fontFamily: "'Cormorant Garamond', serif" }}>Change Training</span>
          <p style={{ fontSize: 10, color: C.text4, margin: '2px 0 0', letterSpacing: '.02em' }}>{s.subtitle}</p>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => setCreating(p => !p)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: creating ? '#2A2724' : C.amber, color: creating ? C.text4 : '#1C1917', border: 'none', fontSize: 13, cursor: 'pointer' }}>
          <Plus size={14} />{creating ? s.cancel : s.newSession}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {creating && (
          <div style={{ background: '#1C1917', border: `1px solid ${C.border2}`, borderRadius: 16, padding: '16px', marginBottom: 16 }}>
            <input placeholder={s.titlePlaceholder} value={newTitle} onChange={e => setNewTitle(e.target.value)}
              style={{ width: '100%', background: '#2A2724', border: `1px solid ${C.border2}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
            <input placeholder={s.goalPlaceholder} value={newGoal} onChange={e => setNewGoal(e.target.value)}
              style={{ width: '100%', background: '#2A2724', border: `1px solid ${C.border2}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
            <button onClick={() => createSession()} disabled={!newTitle || isPending}
              style={{ width: '100%', padding: '10px', borderRadius: 10, background: C.amber, color: '#1C1917', border: 'none', fontSize: 13, cursor: 'pointer', opacity: !newTitle ? 0.5 : 1 }}>
              {isPending ? s.creating : s.startSession}
            </button>
          </div>
        )}

        {isLoading ? (
          <div style={{ textAlign: 'center', color: C.text4, fontSize: 13, marginTop: 40 }}>{s.loading}</div>
        ) : sessions.length === 0 && !creating ? (
          <div style={{ textAlign: 'center', color: C.text4, fontSize: 13, marginTop: 60 }}>
            <Flame size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>{s.empty}</p>
            <p style={{ fontSize: 11, marginTop: 6 }}>{s.emptySub}</p>
          </div>
        ) : (
          sessions.map(session => <SessionCard key={session.id} session={session} s={s} />)
        )}
      </div>
    </div>
  );
}
