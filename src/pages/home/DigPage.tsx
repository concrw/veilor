// Dig — 왜 내가 이런지 알고 싶다
// 기능: 상황 입력 → Division 선택 → 반복 구조 탐지 → M43 매칭 + AI 패턴 해석

import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useMode } from '@/context/ModeContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, veilorDb } from '@/integrations/supabase/client';
import { saveDigSignal } from '@/hooks/useSignalPipeline';
import { ErrorState } from '@/components/ErrorState';
import { DigSearchForm } from '@/components/dig/DigSearchForm';
import { DigResultList } from '@/components/dig/DigResultList';
import { DigHistory } from '@/components/dig/DigHistory';
import PartnerPatternInference from '@/components/dig/PartnerPatternInference';

// ─────────────────────────────────────────────────────────────────────────────
// ClearDigView — 클리어 모드 Dig 데이터 시각화
// ─────────────────────────────────────────────────────────────────────────────

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

  // 날짜순 정렬 (오래된 것 → 최신)
  const sorted = [...checkins].sort((a, b) => a.created_at.localeCompare(b.created_at));

  // 최고점 / 최저점
  let maxScore = -Infinity;
  let minScore = Infinity;
  let maxDate = '';
  let minDate = '';
  for (const c of sorted) {
    if (c.mood_score > maxScore) { maxScore = c.mood_score; maxDate = c.created_at.split('T')[0]; }
    if (c.mood_score < minScore) { minScore = c.mood_score; minDate = c.created_at.split('T')[0]; }
  }

  // SVG 꺾은선 그래프
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

  const formatDate = (d: string) => {
    const parts = d.split('-');
    return `${parts[1]}/${parts[2]}`;
  };

  return (
    <div
      className="rounded-2xl border p-5 space-y-3"
      style={{ background: '#111318', borderColor: '#4AAEFF22' }}
    >
      <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500">최근 30일 감정 흐름</p>

      <svg
        width={svgW}
        height={svgH}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* 수평 기준선 (y=5 위치) */}
        {[2, 5, 8].map(v => {
          const y = padT + innerH - ((v - 1) / 9) * innerH;
          return (
            <line
              key={v}
              x1={padL} y1={y} x2={padL + innerW} y2={y}
              stroke="#1e2a38" strokeWidth={1}
            />
          );
        })}

        {/* 꺾은선 */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#4AAEFF"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* 점 */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill="#4AAEFF"
            stroke="#0D1117"
            strokeWidth={1.5}
          />
        ))}
      </svg>

      {/* 최고/최저 */}
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
      <div
        className="rounded-2xl border p-5 text-center"
        style={{ background: '#111318', borderColor: '#4AAEFF22' }}
      >
        <p className="text-sm text-slate-400">아직 기록이 없어요.</p>
      </div>
    );
  }

  // 활동별 mood 집계
  const activityMoods: Record<string, number[]> = {};
  for (const c of checkins) {
    for (const act of c.activities) {
      if (!activityMoods[act]) activityMoods[act] = [];
      activityMoods[act].push(c.mood_score);
    }
  }

  // 기록 2개 이상인 활동만, 평균 계산
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
      <div
        className="rounded-2xl border p-5 text-center"
        style={{ background: '#111318', borderColor: '#4AAEFF22' }}
      >
        <p className="text-sm text-slate-400">활동별 분석을 위해 더 많은 기록이 필요해요.</p>
        <p className="text-xs text-slate-600 mt-1">각 활동을 2번 이상 기록해보세요.</p>
      </div>
    );
  }

  const maxAvg = rows[0].avg;
  const minAvg = rows[rows.length - 1].avg;

  return (
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: '#111318', borderColor: '#4AAEFF22' }}
    >
      <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500">활동별 평균 기분</p>
      <div className="space-y-3">
        {rows.map(({ act, avg }) => {
          const color =
            avg === maxAvg ? '#34C48B' :
            avg === minAvg ? '#F59E0B' :
            '#4AAEFF';
          const barWidth = Math.round((avg / 10) * 100);
          return (
            <div key={act} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-8 shrink-0">{act}</span>
              <div className="flex-1 h-2 rounded-full" style={{ background: '#1e2a38' }}>
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${barWidth}%`, background: color }}
                />
              </div>
              <span className="text-xs tabular-nums w-8 text-right" style={{ color }}>
                {avg.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClearDigView() {
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
      {/* 헤더 */}
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Dig</h2>
        <p className="text-sm text-slate-500 mt-1">내 감정 패턴을 데이터로 들여다보기</p>
      </div>

      {/* 탭 */}
      <div
        className="flex rounded-2xl p-1 gap-1"
        style={{ background: '#111318', border: '1px solid #4AAEFF22' }}
      >
        {(['trend', 'activity'] as const).map(tab => {
          const label = tab === 'trend' ? '감정 트렌드' : '활동 분석';
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 text-sm font-medium rounded-xl transition-all"
              style={{
                background: active ? '#4AAEFF' : 'transparent',
                color: active ? '#0D1117' : '#64748b',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 탭 콘텐츠 */}
      {isLoading ? (
        <div
          className="rounded-2xl border p-5 text-center"
          style={{ background: '#111318', borderColor: '#4AAEFF22' }}
        >
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

interface Division {
  id: string;
  code: string;
  name: string;
}

interface MatchResult {
  question: string;
  answer: string;
  researcher: string;
  domain: string;
  divisionCode: string;
  score: number;
}

interface DigHistoryItem {
  id: string;
  domain: string;
  content: string;
  score: number;
  situation: string;
  emotion: string;
  created_at: string;
}

interface PatternProfile {
  id: string;
  pattern_axis: string;
  score: number;
  confidence: number;
  trend: 'rising' | 'stable' | 'declining';
}

function DigPageInner() {
  const { user, axisScores } = useAuth();
  const location = useLocation();
  const prefillText = (location.state as { prefillText?: string } | null)?.prefillText ?? '';
  const qc = useQueryClient();
  const [situation, setSituation] = useState(prefillText);
  const [divisionId, setDivisionId] = useState<string>('');
  const [text, setText] = useState('');
  const [results, setResults] = useState<MatchResult[]>([]);
  const [selected, setSelected] = useState<MatchResult | null>(null);
  const [interpretation, setInterpretation] = useState('');
  const [interpreting, setInterpreting] = useState(false);

  // Vent→Dig 맥락 연결: 최근 Vent 세션 요약 조회
  const { data: recentVent } = useQuery({
    queryKey: ['recent-vent-session', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('dive_sessions')
        .select('emotion, context_summary, held_keywords, created_at')
        .eq('user_id', user!.id)
        .eq('session_completed', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!data) return null;
      // 24시간 이내 세션만 표시
      const sessionTime = new Date(data.created_at).getTime();
      if (Date.now() - sessionTime > 24 * 60 * 60 * 1000) return null;
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
  const [ventDismissed, setVentDismissed] = useState(false);

  // Dig 히스토리 (최근 20건)
  const { data: digHistory = [], isError: digHistoryError, refetch: refetchHistory } = useQuery<DigHistoryItem[]>({
    queryKey: ['dig-history', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('user_signals')
        .select('id, domain, content, score, meta, created_at')
        .eq('user_id', user!.id)
        .eq('signal_type', 'dig')
        .order('created_at', { ascending: false })
        .limit(20);
      return (data ?? []).map((d: Record<string, unknown>) => ({
        id: d.id, domain: d.domain ?? '', content: d.content ?? '',
        score: d.score ?? 0, situation: d.meta?.situation ?? '',
        emotion: d.meta?.emotion ?? '', created_at: d.created_at,
      }));
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  // 도메인별 반복 횟수 (이번 달)
  const domainCounts = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const counts: Record<string, number> = {};
    digHistory.filter(h => h.created_at >= monthStart).forEach(h => {
      if (h.domain) counts[h.domain] = (counts[h.domain] ?? 0) + 1;
    });
    return counts;
  }, [digHistory]);

  const comboPatternCounts = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const counts: Record<string, number> = {};
    digHistory.filter(h => h.created_at >= monthStart).forEach(h => {
      const key = `${h.domain}::${h.situation}`;
      if (h.domain) counts[key] = (counts[key] ?? 0) + 1;
    });
    return counts;
  }, [digHistory]);

  const historyPatternIndex = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const domainOrder: Record<string, number> = {};
    const indexMap: Record<string, number> = {};
    const monthItems = digHistory
      .filter(h => h.created_at >= monthStart && h.domain)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    monthItems.forEach(h => {
      domainOrder[h.domain] = (domainOrder[h.domain] ?? 0) + 1;
      indexMap[h.id] = domainOrder[h.domain];
    });
    return indexMap;
  }, [digHistory]);

  const { data: patternProfiles = [] } = useQuery<PatternProfile[]>({
    queryKey: ['pattern-profiles', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('pattern_profiles')
        .select('id, pattern_axis, score, confidence, trend')
        .eq('user_id', user!.id);
      return (data ?? []) as PatternProfile[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const { data: divisions = [] } = useQuery<Division[]>({
    queryKey: ['m43-divisions'],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('m43_divisions')
        .select('id, code, name')
        .order('code');
      return (data ?? []) as Division[];
    },
    staleTime: 1000 * 60 * 60,
  });

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

      let domainFilter: string[] = [];
      if (divisionId) {
        const { data: domainRows } = await veilorDb
          .from('m43_domains').select('id').eq('division_id', divisionId);
        domainFilter = (domainRows ?? []).map((d: { id: string }) => d.id);
      }

      // 키워드 검색 + 시맨틱 검색 병렬 실행
      const [questionResult, semanticResult] = await Promise.all([
        (() => {
          let q = veilorDb
            .from('m43_domain_questions')
            .select(`id, question, keywords, category,
              m43_domain_answers(answer, m43_researchers(name, specialty)),
              m43_domains(id, name, code, division_id, m43_divisions(code))`)
            .limit(300);
          if (domainFilter.length > 0) q = q.in('domain_id', domainFilter);
          return q;
        })(),
        supabase.functions.invoke('dig-semantic-search', {
          body: { query, divisionId: divisionId || null, limit: 5, userId: user?.id },
        }).catch(() => ({ data: { results: [], fallback: true }, error: null })),
      ]);

      const { data: questions } = questionResult;
      if (!questions) return [];

      // 시맨틱 결과 맵 (question_id → similarity score)
      const semanticScoreMap = new Map<string, number>();
      const semanticFallback = (semanticResult as { data: { results: unknown[]; fallback?: boolean } }).data?.fallback !== false;
      if (!semanticFallback) {
        const semResults = (semanticResult as { data: { results: Array<{ question_id: string; similarity: number }> } }).data?.results ?? [];
        for (const r of semResults) {
          if (r.question_id && typeof r.similarity === 'number') {
            semanticScoreMap.set(r.question_id, r.similarity);
          }
        }
      }

      interface DomainQuestion {
        id: string; question: string | null; keywords: string[] | null; category: string | null;
        m43_domain_answers: { answer: string; m43_researchers: { name: string; specialty: string } }[] | null;
        m43_domains: { id: string; name: string; code: string; division_id: string; m43_divisions: { code: string } } | null;
      }
      const scored = (questions as DomainQuestion[]).map((q) => {
        const qText = (q.question ?? '').toLowerCase();
        const kws = (q.keywords ?? []).map((k: string) => k.toLowerCase());
        let kwScore = 0, textScore = 0;
        for (const t of tokens) {
          if (kws.some((k: string) => k.includes(t))) kwScore += 1;
          if (qText.includes(t)) textScore += 0.5;
        }
        const keywordScore = tokens.length > 0 ? (kwScore / tokens.length) * 0.6 + (textScore / tokens.length) * 0.4 : 0;
        // 시맨틱 스코어가 있으면 가중 평균 (시맨틱 70%, 키워드 30%)
        const semScore = semanticScoreMap.get(q.id);
        const score = semScore !== undefined
          ? semScore * 0.7 + keywordScore * 0.3
          : keywordScore;
        return { q, score };
      }).filter(x => x.score >= 0.2).sort((a, b) => b.score - a.score).slice(0, 5);

      if (user && scored.length > 0) {
        await veilorDb.from('m43_user_question_logs').insert({
          user_id: user.id, user_question: query,
          matched_question_id: scored[0].q.id, match_score: scored[0].score, mode: 'T',
        });
      }

      return scored.map(({ q, score }) => ({
        question: q.question, answer: q.m43_domain_answers?.[0]?.answer ?? '',
        researcher: q.m43_domain_answers?.[0]?.m43_researchers?.name ?? '연구원',
        domain: q.m43_domains?.name ?? '', divisionCode: q.m43_domains?.m43_divisions?.code ?? '', score,
      })) as MatchResult[];
    },
    onSuccess: async (data) => {
      setResults(data);
      if (data.length > 0) {
        const top = data[0];
        setSelected(top);
        if (user) {
          saveDigSignal(user.id, { situation, text, matchedQuestion: top.question, domain: top.domain, score: top.score });
          qc.invalidateQueries({ queryKey: ['dig-history', user.id] });

          const currentDomainCount = (domainCounts[top.domain] ?? 0) + 1;
          const patternScore = Math.min(100, currentDomainCount * 15);
          const confidence = Math.min(100, top.score * 100);
          const trend = currentDomainCount >= 3 ? 'rising' : 'stable';
          try {
            await veilorDb.from('pattern_profiles').upsert({
              user_id: user.id, pattern_axis: top.domain, score: patternScore,
              confidence, trend, updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id,pattern_axis' });
            qc.invalidateQueries({ queryKey: ['pattern-profiles', user.id] });
          } catch (e) { console.error('pattern_profiles upsert error:', e); }
        }
        setInterpreting(true);
        setInterpretation('');
        try {
          const { data: res, error } = await supabase.functions.invoke('dig-interpret', {
            body: { situation, text, matchedQuestion: top.question, matchedAnswer: top.answer, researcher: top.researcher, domain: top.domain, axisScores, userId: user?.id },
          });
          if (!error) setInterpretation(res?.interpretation ?? '');
        } catch (e) {
          console.error('dig-interpret error:', e);
          setInterpretation('AI 해석을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
        finally { setInterpreting(false); }
      }
    },
  });

  const handleSubmit = () => {
    const query = `${situation} ${text}`.trim();
    if (!query) return;
    searchMutation.mutate(query);
  };

  if (selected) {
    return (
      <DigResultList
        selected={selected}
        results={results}
        situation={situation}
        domainCounts={domainCounts}
        comboPatternCounts={comboPatternCounts}
        patternProfiles={patternProfiles}
        interpretation={interpretation}
        interpreting={interpreting}
        onBack={() => { setSelected(null); setInterpretation(''); }}
        onSelectResult={setSelected}
      />
    );
  }

  if (digHistoryError) {
    return <ErrorState title="Dig 데이터를 불러오지 못했습니다" onRetry={() => refetchHistory()} />;
  }

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Dig</h2>
        <p className="text-sm text-muted-foreground mt-1">왜 이런 패턴이 반복되는지 파고들어요.</p>
      </div>

      {/* Vent→Dig 맥락 연결 배너 */}
      {recentVent && !ventDismissed && (
        <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🔗</span>
              <p className="text-xs font-medium text-violet-400">Vent에서 이런 패턴이 보였어요</p>
            </div>
            <button onClick={() => setVentDismissed(true)} className="text-xs text-muted-foreground">✕</button>
          </div>
          <p className="text-sm leading-relaxed">
            {recentVent.emotion && <span className="font-medium">{recentVent.emotion}</span>}
            {recentVent.context_summary && (
              <span className="text-muted-foreground"> — {recentVent.context_summary.slice(0, 80)}</span>
            )}
          </p>
          {recentVent.held_keywords && recentVent.held_keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(recentVent.held_keywords as string[]).slice(0, 5).map((kw: string, i: number) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400">
                  {kw.slice(0, 20)}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={() => {
              if (recentVent.emotion) setSituation(recentVent.emotion);
              setVentDismissed(true);
            }}
            className="text-xs text-violet-400 font-medium hover:underline"
          >
            이 맥락으로 탐색 시작하기
          </button>
        </div>
      )}

      <DigSearchForm
        situation={situation}
        onSituationChange={setSituation}
        divisionId={divisionId}
        onDivisionIdChange={setDivisionId}
        divisions={divisions}
        text={text}
        onTextChange={setText}
        axisScores={axisScores}
        onSubmit={handleSubmit}
        isPending={searchMutation.isPending}
      />

      {/* #9 상대방 패턴 추론 */}
      {(situation === '연인/파트너' || situation === '가족' || situation === '친구') && (
        <PartnerPatternInference
          onIntegrate={(inferredText) => setText(prev => prev ? `${prev}\n\n${inferredText}` : inferredText)}
        />
      )}

      <DigHistory
        digHistory={digHistory}
        domainCounts={domainCounts}
        comboPatternCounts={comboPatternCounts}
        historyPatternIndex={historyPatternIndex}
        patternProfiles={patternProfiles}
      />
    </div>
  );
}

export default function DigPage() {
  const { mode } = useMode();
  return mode === 'clear' ? <ClearDigView /> : <DigPageInner />;
}
