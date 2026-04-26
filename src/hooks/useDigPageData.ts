import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, veilorDb } from '@/integrations/supabase/client';
import { saveDigSignal } from '@/hooks/useSignalPipeline';

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

interface DomainQuestion {
  id: string; question: string | null; keywords: string[] | null; category: string | null;
  m43_domain_answers: { answer: string; m43_researchers: { name: string; specialty: string } }[] | null;
  m43_domains: { id: string; name: string; code: string; division_id: string; m43_divisions: { code: string } } | null;
}

export type { Division, MatchResult, DigHistoryItem, PatternProfile };

export function useDigPageData() {
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
  const [ventDismissed, setVentDismissed] = useState(false);

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
      const sessionTime = new Date(data.created_at).getTime();
      if (Date.now() - sessionTime > 24 * 60 * 60 * 1000) return null;
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

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
      const { data } = await veilorDb.from('m43_divisions').select('id, code, name').order('code');
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

      const scored = (questions as DomainQuestion[]).map((q) => {
        const qText = (q.question ?? '').toLowerCase();
        const kws = (q.keywords ?? []).map((k: string) => k.toLowerCase());
        let kwScore = 0, textScore = 0;
        for (const t of tokens) {
          if (kws.some((k: string) => k.includes(t))) kwScore += 1;
          if (qText.includes(t)) textScore += 0.5;
        }
        const keywordScore = tokens.length > 0 ? (kwScore / tokens.length) * 0.6 + (textScore / tokens.length) * 0.4 : 0;
        const semScore = semanticScoreMap.get(q.id);
        const score = semScore !== undefined ? semScore * 0.7 + keywordScore * 0.3 : keywordScore;
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
        } finally { setInterpreting(false); }
      }
    },
  });

  const handleSubmit = () => {
    const query = `${situation} ${text}`.trim();
    if (!query) return;
    searchMutation.mutate(query);
  };

  return {
    user,
    axisScores,
    situation, setSituation,
    divisionId, setDivisionId,
    text, setText,
    results,
    selected, setSelected,
    interpretation,
    interpreting,
    ventDismissed, setVentDismissed,
    recentVent,
    digHistory,
    digHistoryError,
    refetchHistory,
    domainCounts,
    comboPatternCounts,
    historyPatternIndex,
    patternProfiles,
    divisions,
    searchMutation,
    handleSubmit,
  };
}
