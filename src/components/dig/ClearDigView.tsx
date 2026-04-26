import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';

interface ClearCheckinRow {
  content: string;
  created_at: string;
}

interface ParsedCheckin {
  mood_score: number;
  activities: string[];
  checked_at: string;
  created_at: string;
}

const ACTIVITY_OPTIONS = ['관계', '일', '운동', '혼자', '휴식', '공부'] as const;

function MoodTrendTab({ checkins }: { checkins: ParsedCheckin[] }) {
  const navigate = useNavigate();

  if (checkins.length === 0) {
    return (
      <div
        className="rounded-2xl border p-5 text-center space-y-3"
        style={{ background: '#111318', borderColor: '#4AAEFF22' }}
      >
        <p className="text-sm text-slate-400">아직 기록이 없어요. 체크인부터 시작해보세요.</p>
        <button
          onClick={() => navigate('/home/vent')}
          className="text-xs font-medium"
          style={{ color: '#4AAEFF' }}
        >
          Vent 탭으로 이동 →
        </button>
      </div>
    );
  }

  const sorted = [...checkins].sort((a, b) => a.created_at.localeCompare(b.created_at));

  let maxScore = -Infinity;
  let minScore = Infinity;
  let maxDate = '';
  let minDate = '';
  for (const c of sorted) {
    if (c.mood_score > maxScore) { maxScore = c.mood_score; maxDate = c.created_at.split('T')[0]; }
    if (c.mood_score < minScore) { minScore = c.mood_score; minDate = c.created_at.split('T')[0]; }
  }

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth - 32 : 320;
  const svgW = viewportWidth;
  const svgH = 120;
  const padL = 8;
  const padR = 8;
  const padT = 10;
  const padB = 10;
  const innerW = svgW - padL - padR;
  const innerH = svgH - padT - padB;

  const n = sorted.length;
  const points = sorted.map((c, i) => {
    const x = n > 1 ? padL + (i / (n - 1)) * innerW : padL + innerW / 2;
    const y = padT + innerH - ((c.mood_score - 1) / 9) * innerH;
    return { x, y, score: c.mood_score, date: c.created_at.split('T')[0] };
  });

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
  const formatDate = (d: string) => { const parts = d.split('-'); return `${parts[1]}/${parts[2]}`; };

  return (
    <div
      className="rounded-2xl border p-5 space-y-3"
      style={{ background: '#111318', borderColor: '#4AAEFF22' }}
    >
      <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500">최근 30일 감정 흐름</p>
      <svg width={svgW} height={svgH} style={{ display: 'block', overflow: 'visible' }}>
        {[2, 5, 8].map(v => {
          const y = padT + innerH - ((v - 1) / 9) * innerH;
          return <line key={v} x1={padL} y1={y} x2={padL + innerW} y2={y} stroke="#1e2a38" strokeWidth={1} />;
        })}
        <polyline points={polyline} fill="none" stroke="#4AAEFF" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="#4AAEFF" stroke="#0D1117" strokeWidth={1.5} />
        ))}
      </svg>
      <div className="flex justify-between pt-1" style={{ borderTop: '1px solid #1e2a38' }}>
        <div className="space-y-0.5">
          <p className="text-[10px] text-slate-600">최고</p>
          <p className="text-sm font-semibold" style={{ color: '#34C48B' }}>
            {maxScore}점 <span className="text-xs font-normal text-slate-500">{formatDate(maxDate)}</span>
          </p>
        </div>
        <div className="space-y-0.5 text-right">
          <p className="text-[10px] text-slate-600">최저</p>
          <p className="text-sm font-semibold" style={{ color: '#F59E0B' }}>
            {minScore}점 <span className="text-xs font-normal text-slate-500">{formatDate(minDate)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ActivityAnalysisTab({ checkins }: { checkins: ParsedCheckin[] }) {
  if (checkins.length === 0) {
    return (
      <div className="rounded-2xl border p-5 text-center" style={{ background: '#111318', borderColor: '#4AAEFF22' }}>
        <p className="text-sm text-slate-400">아직 기록이 없어요.</p>
      </div>
    );
  }

  const activityMoods: Record<string, number[]> = {};
  for (const c of checkins) {
    for (const act of c.activities) {
      if (!activityMoods[act]) activityMoods[act] = [];
      activityMoods[act].push(c.mood_score);
    }
  }

  const rows = ACTIVITY_OPTIONS
    .map(act => {
      const scores = activityMoods[act] ?? [];
      if (scores.length < 2) return null;
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
      return { act, avg };
    })
    .filter((r): r is { act: string; avg: number } => r !== null)
    .sort((a, b) => b.avg - a.avg);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border p-5 text-center" style={{ background: '#111318', borderColor: '#4AAEFF22' }}>
        <p className="text-sm text-slate-400">활동별 분석을 위해 더 많은 기록이 필요해요.</p>
        <p className="text-xs text-slate-600 mt-1">각 활동을 2번 이상 기록해보세요.</p>
      </div>
    );
  }

  const maxAvg = rows[0].avg;
  const minAvg = rows[rows.length - 1].avg;

  return (
    <div className="rounded-2xl border p-5 space-y-4" style={{ background: '#111318', borderColor: '#4AAEFF22' }}>
      <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500">활동별 평균 기분</p>
      <div className="space-y-3">
        {rows.map(({ act, avg }) => {
          const color = avg === maxAvg ? '#34C48B' : avg === minAvg ? '#F59E0B' : '#4AAEFF';
          const barWidth = Math.round((avg / 10) * 100);
          return (
            <div key={act} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-8 shrink-0">{act}</span>
              <div className="flex-1 h-2 rounded-full" style={{ background: '#1e2a38' }}>
                <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${barWidth}%`, background: color }} />
              </div>
              <span className="text-xs tabular-nums w-8 text-right" style={{ color }}>{avg.toFixed(1)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ClearDigView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'trend' | 'activity'>('trend');

  const { data: checkins = [], isLoading } = useQuery<ParsedCheckin[]>({
    queryKey: ['clear-dig-checkins', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data } = await veilorDb
        .from('tab_conversations')
        .select('content, created_at')
        .eq('user_id', user.id)
        .eq('tab', 'clear_checkin')
        .order('created_at', { ascending: false })
        .limit(90);

      return ((data ?? []) as ClearCheckinRow[])
        .filter(row => row.created_at >= thirtyDaysAgo.toISOString())
        .map(row => {
          try {
            const parsed = JSON.parse(row.content ?? '{}') as {
              mood_score?: number;
              activities?: string[];
              checked_at?: string;
            };
            if (typeof parsed.mood_score !== 'number') return null;
            return {
              mood_score: parsed.mood_score,
              activities: Array.isArray(parsed.activities) ? parsed.activities : [],
              checked_at: parsed.checked_at ?? row.created_at,
              created_at: row.created_at,
            } satisfies ParsedCheckin;
          } catch {
            return null;
          }
        })
        .filter((x): x is ParsedCheckin => x !== null);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="px-4 py-6 space-y-4" style={{ background: '#0D1117', minHeight: '100%' }}>
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Dig</h2>
        <p className="text-sm text-slate-500 mt-1">내 감정 패턴을 데이터로 들여다보기</p>
      </div>

      <div className="flex rounded-2xl p-1 gap-1" style={{ background: '#111318', border: '1px solid #4AAEFF22' }}>
        {(['trend', 'activity'] as const).map(tab => {
          const label = tab === 'trend' ? '감정 트렌드' : '활동 분석';
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 text-sm font-medium rounded-xl transition-all"
              style={{ background: active ? '#4AAEFF' : 'transparent', color: active ? '#0D1117' : '#64748b' }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="rounded-2xl border p-5 text-center" style={{ background: '#111318', borderColor: '#4AAEFF22' }}>
          <p className="text-sm text-slate-500">불러오는 중...</p>
        </div>
      ) : activeTab === 'trend' ? (
        <MoodTrendTab checkins={checkins} />
      ) : (
        <ActivityAnalysisTab checkins={checkins} />
      )}
    </div>
  );
}
