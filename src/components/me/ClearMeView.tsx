import { useState, useEffect } from 'react';
import { veilorDb } from '@/integrations/supabase/client';
import EmotionWheel, { type EmotionScore } from '@/components/charts/EmotionWheel';
import { useClearTranslations, useCommonTranslations } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/context/LanguageContext';

interface MonthCheckin {
  mood_score: number;
  created_at: string;
}

function getMonthRange(now: Date): { firstDay: string; lastDay: string } {
  const y = now.getFullYear();
  const m = now.getMonth();
  return {
    firstDay: new Date(y, m, 1).toISOString(),
    lastDay: new Date(y, m + 1, 0, 23, 59, 59, 999).toISOString(),
  };
}

// DOW_LABELS injected via translations
const LEGEND = [
  { color: '#F59E0B33', border: '#F59E0B', label: '1–4' },
  { color: '#4AAEFF33', border: '#4AAEFF', label: '5–7' },
  { color: '#34C48B33', border: '#34C48B', label: '8–10' },
];

function getMoodColor(score: number | null): string {
  if (score === null) return '#1e2a38';
  if (score <= 4) return '#F59E0B33';
  if (score <= 7) return '#4AAEFF33';
  return '#34C48B33';
}

function getMoodBorderColor(score: number | null): string {
  if (score === null) return '#1e2a38';
  if (score <= 4) return '#F59E0B';
  if (score <= 7) return '#4AAEFF';
  return '#34C48B';
}

export default function ClearMeView({ userId }: { userId: string }) {
  const cl = useClearTranslations();
  const common = useCommonTranslations();
  const { language } = useLanguageContext();
  const DOW_LABELS = cl.dowLabels;

  const [checkins, setCheckins] = useState<MonthCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [emotionScores, setEmotionScores] = useState<EmotionScore[]>([]);

  const now = new Date();
  const { firstDay, lastDay } = getMonthRange(now);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    veilorDb
      .from('tab_conversations')
      .select('content, created_at')
      .eq('user_id', userId)
      .eq('tab', 'clear_checkin')
      .gte('created_at', firstDay)
      .lte('created_at', lastDay)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        const parsed: MonthCheckin[] = ((data ?? []) as { content: string; created_at: string }[])
          .map(row => {
            try {
              const obj = JSON.parse(row.content) as { mood_score?: number };
              return { mood_score: typeof obj.mood_score === 'number' ? obj.mood_score : 0, created_at: row.created_at };
            } catch { return null; }
          })
          .filter((x): x is MonthCheckin => x !== null);
        setCheckins(parsed);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setCheckins([]); setLoading(false); } });
    return () => { cancelled = true; };
  }, [userId, firstDay, lastDay]);

  useEffect(() => {
    let cancelled = false;
    veilorDb
      .from('emotion_scores' as never)
      .select('top_emotions')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (cancelled || !data?.length) return;
        const totals: Record<string, number> = {};
        const counts: Record<string, number> = {};
        for (const row of data as Array<{ top_emotions: Array<{ label: string; score: number }> }>) {
          for (const { label, score } of row.top_emotions ?? []) {
            totals[label] = (totals[label] ?? 0) + score;
            counts[label] = (counts[label] ?? 0) + 1;
          }
        }
        setEmotionScores(Object.entries(totals).map(([emotion, total]) => ({ emotion, score: total / counts[emotion] })));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userId]);

  const dayMap = new Map<string, number>();
  for (const c of checkins) dayMap.set(c.created_at.slice(0, 10), c.mood_score);

  const year = now.getFullYear();
  const month = now.getMonth();
  const todayStr = now.toISOString().slice(0, 10);
  const moodValues = [...dayMap.values()].filter(v => v > 0);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const calCells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (calCells.length % 7 !== 0) calCells.push(null);

  const summaryItems = [
    { label: cl.summaryRecords, value: cl.summaryDaysFmt.replace('{count}', String(dayMap.size)) },
    { label: cl.summaryAvg, value: moodValues.length > 0 ? (moodValues.reduce((a, b) => a + b, 0) / moodValues.length).toFixed(1) : '—' },
    { label: cl.summaryBest, value: moodValues.length > 0 ? String(Math.max(...moodValues)) : '—' },
  ];

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontSize: 12 }}>
        {common.loading}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 80px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {summaryItems.map(({ label, value }) => (
          <div key={label} style={{ flex: 1, background: '#111318', border: '1px solid #4AAEFF22', borderRadius: 14, padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#4AAEFF', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
            <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ background: '#111318', border: '1px solid #4AAEFF22', borderRadius: 16, padding: '14px 12px' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#475569', marginBottom: 10 }}>
          {cl.calendarTitle.replace('{month}', language === 'en'
            ? now.toLocaleString('en-US', { month: 'long' })
            : String(month + 1))}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {DOW_LABELS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 9, color: '#334155' }}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {calCells.map((day, idx) => {
            if (day === null) return <div key={`e-${idx}`} style={{ width: 24, height: 24 }} />;
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const score = dayMap.get(dateKey) ?? null;
            const isToday = dateKey === todayStr;
            const textColor = score !== null ? (score <= 4 ? '#FCD34D' : score <= 7 ? '#7DD3FC' : '#6EE7B7') : '#475569';
            return (
              <div key={dateKey} style={{ width: 24, height: 24, borderRadius: 6, background: getMoodColor(score), border: `1px solid ${isToday ? getMoodBorderColor(score) : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                <span style={{ fontSize: 10, color: textColor, lineHeight: 1 }}>{day}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
          {LEGEND.map(({ color, border, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: color, border: `1px solid ${border}44` }} />
              <span style={{ fontSize: 9, color: '#475569' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {emotionScores.length > 0 && (
        <div style={{ background: '#111318', border: '1px solid #4AAEFF22', borderRadius: 16, padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#475569', marginBottom: 12, alignSelf: 'flex-start' }}>{cl.emotionDist}</p>
          <EmotionWheel scores={emotionScores} size={200} />
        </div>
      )}
    </div>
  );
}
