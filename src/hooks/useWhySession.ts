// WhyFlow 세션 관리 + 타이머 로직
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { veilrumDb } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useM43WhyIntegration } from '@/hooks/useM43WhyIntegration';
import type { WhySession, JobEntry, AnalysisResult } from '@/types/why';
import { TIMER_SECONDS } from '@/types/why';

export function useWhySession() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<WhySession | null>(null);
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [step, setStep] = useState(0);

  // 타이머
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  // 분류 상태
  const [happySet, setHappySet] = useState<Set<string>>(new Set());
  const [painSet, setPainSet] = useState<Set<string>>(new Set());

  // 분석 결과
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Prime Perspective
  const [ppText, setPpText] = useState('');
  const [ppSaving, setPpSaving] = useState(false);

  // M43
  const m43 = useM43WhyIntegration();

  // ── 초기 로드 ──
  useEffect(() => {
    if (!user) return;
    loadSession();
  }, [user?.id]);

  const loadSession = async () => {
    setLoading(true);
    try {
      const { data: sessions } = await veilrumDb
        .from('why_sessions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!sessions || sessions.length === 0) {
        setSession(null);
        setStep(0);
        setLoading(false);
        return;
      }

      const s = sessions[0] as WhySession;
      setSession(s);

      const { data: entries } = await veilrumDb
        .from('why_job_entries')
        .select('*')
        .eq('session_id', s.id)
        .order('sort_order', { ascending: true });

      const js = (entries ?? []) as JobEntry[];
      setJobs(js);

      // 분류 상태 복원
      setHappySet(new Set(js.filter(j => j.category === 'happy').map(j => j.id)));
      setPainSet(new Set(js.filter(j => j.category === 'pain').map(j => j.id)));

      // 단계 복원
      if (s.completed_at) {
        setStep(10);
        setPpText(s.prime_perspective ?? '');
      } else {
        setStep(s.current_step ?? 0);
      }

      if (s.prime_perspective) setPpText(s.prime_perspective);
      if (s.happy_patterns || s.pain_patterns) {
        setAnalysisResult({
          happy_patterns: s.happy_patterns,
          pain_patterns: s.pain_patterns,
          value_alignment: s.value_alignment,
        });
      }

      // M43 분석 결과 복원
      if (s.m43_domain_matches || s.m43_framework_tags) {
        m43.setAnalysis({
          domainMatches: s.m43_domain_matches ?? [],
          frameworkTags: s.m43_framework_tags ?? [],
          imprintConnections: s.m43_imprint_connections ?? [],
          valueMap: s.m43_value_map ?? [],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── 세션 생성 ──
  const createSession = async () => {
    const { data, error } = await veilrumDb
      .from('why_sessions')
      .insert({ user_id: user!.id, current_step: 1 })
      .select()
      .single();
    if (error || !data) {
      toast({ title: '세션 생성 실패', variant: 'destructive' });
      return null;
    }
    setSession(data as WhySession);
    return data as WhySession;
  };

  const updateSessionStep = async (newStep: number) => {
    if (!session) return;
    await veilrumDb
      .from('why_sessions')
      .update({ current_step: newStep, updated_at: new Date().toISOString() })
      .eq('id', session.id);
    setSession(prev => prev ? { ...prev, current_step: newStep } : prev);
  };

  // ── 타이머 ──
  const handleTimerEnd = async () => {
    toast({ title: '10분 종료!', description: '입력한 직업들을 저장하세요.' });
  };

  const startTimer = useCallback(() => {
    endTimeRef.current = Date.now() + TIMER_SECONDS * 1000;
    setSecondsLeft(TIMER_SECONDS);
    setTimerRunning(true);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (!endTimeRef.current) return;
      const diff = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff === 0) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        setTimerRunning(false);
        handleTimerEnd();
      }
    }, 1000);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, []);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── 진행률 ──
  const progressPct = Math.round((step / 10) * 100);

  return {
    user,
    loading,
    session, setSession,
    jobs, setJobs,
    step, setStep,
    secondsLeft, timerRunning, startTimer, formatTime, timerRef,
    happySet, setHappySet,
    painSet, setPainSet,
    analyzing, setAnalyzing,
    analysisResult, setAnalysisResult,
    ppText, setPpText,
    ppSaving, setPpSaving,
    m43,
    progressPct,
    createSession,
    updateSessionStep,
  };
}
