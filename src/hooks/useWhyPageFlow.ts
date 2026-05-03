import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useLanguageContext } from "@/context/LanguageContext";
import { useWhyTimer } from "./useWhyTimer";
import { useWhyDataOps } from "./useWhyDataOps";

// Constants & Types
const DURATION_SECONDS = 600;

export interface Job {
  id: string;
  job_name: string;
  definition: string | null;
  first_memory: string | null;
  category: "happy" | "pain" | "neutral" | null;
  reason?: string | null;
}

export interface SessionInfo {
  id: string;
  status: "active" | "completed" | string | null;
  ended_at?: string | null;
}

export function useWhyPageFlow() {
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const isEn = language === 'en';

  // Global flow state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  // Step 1 state
  const [memoText, setMemoText] = useState("");

  // Step 2 state
  const [idx, setIdx] = useState(0);
  const [isNormalizing, setIsNormalizing] = useState(false);

  // Step 3 state
  const [phase, setPhase] = useState<"happy" | "pain">("happy");
  const [happySet, setHappySet] = useState<Set<string>>(new Set());
  const [painSet, setPainSet] = useState<Set<string>>(new Set());

  // Compose hooks
  const timer = useWhyTimer(step, session, setSession);
  const dataOps = useWhyDataOps(session, jobs, setJobs, setIdx, setIsNormalizing);

  // Computed values
  const current = jobs[idx];
  const total = jobs.length;
  const resultsReady = useMemo(() => jobs.length > 0 && jobs.every(j => j.category), [jobs]);
  const defsDone = useMemo(() => jobs.length > 0 && jobs.every(j => !!j.definition && !!j.first_memory), [jobs]);

  const flowProgress = useMemo(() => {
    let pct = 0;
    if (session && session.ended_at) pct += 25;
    if (defsDone) pct += 25;
    if (resultsReady) pct += 50;
    return pct;
  }, [session, defsDone, resultsReady]);

  const currentJobCount = useMemo(() => {
    if (memoText.trim().length === 0) return jobs.length;
    const memoJobs = memoText
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0).length;
    return memoJobs > 0 ? memoJobs : jobs.length;
  }, [memoText, jobs.length]);

  const canGoStep2 = jobs.length > 0;
  const canGoStep3 = defsDone;
  const canGoStep4 = resultsReady;

  // Step 3 handlers
  const toggleHappy = (id: string) => {
    setHappySet(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      setPainSet(p => { const cp = new Set(p); cp.delete(id); return cp; });
      return s;
    });
  };

  const togglePain = (id: string) => {
    setPainSet(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      setHappySet(p => { const cp = new Set(p); cp.delete(id); return cp; });
      return s;
    });
  };

  // Wrapped action delegates
  const finalizeStep1Early = async () => {
    try {
      let sessId = session?.id as string | undefined;

      if (!sessId) {
        const { data: created, error: createErr } = await supabase
          .from("brainstorm_sessions")
          .insert({ timer_duration: DURATION_SECONDS, status: "active", user_id: user?.id ?? null })
          .select("id, status, ended_at")
          .maybeSingle();

        if (createErr || !created) {
          toast({ title: isEn ? 'Failed to create session' : '세션 생성 실패', description: isEn ? 'Please try again.' : '다시 시도해주세요.', variant: "destructive" });
          return;
        }

        sessId = created.id;
        setSession({ id: created.id, status: created.status, ended_at: created.ended_at });
      }

      await dataOps.addFromMemo(memoText);

      const endedAt = new Date().toISOString();
      const { error: updErr } = await supabase
        .from("brainstorm_sessions")
        .update({ ended_at: endedAt, status: "completed", total_jobs: jobs.length })
        .eq("id", sessId);

      if (updErr) {
        toast({ title: isEn ? 'Failed to complete session' : '세션 완료 실패', description: isEn ? 'Please try again shortly.' : '잠시 후 다시 시도해주세요.', variant: "destructive" });
        return;
      }

      setSession(prev => prev ? { ...prev, ended_at: endedAt, status: "completed" } : { id: sessId!, status: "completed", ended_at: endedAt });
      toast({ title: isEn ? 'Session complete' : '세션 완료', description: isEn ? 'Proceed to the definition stage.' : '정의 단계로 이동하세요.' });

      timer.clearInterval();
      setStep(2);
    } catch (e) {
      console.error("finalizeStep1Early exception", e);
      toast({ title: isEn ? 'An error occurred' : '오류 발생', description: isEn ? 'A problem occurred while completing the session.' : '세션 완료 중 문제가 발생했습니다.', variant: "destructive" });
    }
  };

  const goBackToEditMode = () =>
    dataOps.goBackToEditMode(setStep, setMemoText, setSession, timer.resetTimer);

  const saveCurrent = (definition: string, memory: string) =>
    dataOps.saveCurrent(current, definition, memory);

  const commitClassification = () =>
    dataOps.commitClassification(happySet, painSet, setStep);

  // Effects — initial load
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const { error: tableError } = await supabase
          .from("brainstorm_sessions")
          .select("count")
          .limit(1);

        if (tableError) {
          toast({ title: isEn ? 'Database connection issue' : '데이터베이스 연결 문제', description: `${isEn ? 'Table access failed: ' : '테이블 접근 실패: '}${tableError.message}`, variant: "destructive" });
          return;
        }

        const last = await dataOps.findBestSession();
        if (!active) return;

        if (!last) { setSession(null); setJobs([]); setStep(1); return; }

        setSession({ id: last.id, status: last.status, ended_at: last.ended_at });

        const { data: entries } = await supabase
          .from("job_entries")
          .select("id, job_name, definition, first_memory, category, reason")
          .eq("session_id", last.id)
          .order("created_at", { ascending: true });

        const js = (entries || []) as Job[];
        setJobs(js);

        if (js.length > 0 && !last.ended_at) {
          setMemoText(js.map(j => j.job_name).join(', '));
        }

        if (js.length > 0) {
          const happyJobs = js.filter(j => j.category === "happy").map(j => j.id);
          const painJobs = js.filter(j => j.category === "pain").map(j => j.id);
          setHappySet(new Set(happyJobs));
          setPainSet(new Set(painJobs));

          const allClassified = js.every(j => j.category);
          if (!allClassified) {
            setPhase(happyJobs.length > 0 && painJobs.length === 0 ? "pain" : "happy");
          }
        }

        const hasAny = js.length > 0;
        const localDefsDone = hasAny && js.every(j => !!j.definition && !!j.first_memory);
        const clsDone = hasAny && js.every(j => !!j.category);

        if (!localDefsDone && hasAny) {
          const firstIncomplete = js.findIndex(j => !j.definition || !j.first_memory);
          if (firstIncomplete >= 0) setIdx(firstIncomplete);
        }

        const nextStep: 1 | 2 | 3 | 4 =
          last.ended_at && clsDone ? 4 :
          last.ended_at && localDefsDone ? 3 :
          last.ended_at && hasAny ? 2 : 1;

        setStep(nextStep);

        if (clsDone && hasAny) await dataOps.updateProfileAnalysisStatus();
      } catch (e) {
        console.error("Load error:", e);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [user?.id]);

  // Timer finalize effect
  useEffect(() => {
    if (timer.secondsLeft !== 0 || !session || session.ended_at) return;

    const finalize = async () => {
      const endedAt = new Date().toISOString();
      await dataOps.addFromMemo(memoText);

      const { error } = await supabase
        .from("brainstorm_sessions")
        .update({ ended_at: endedAt, status: "completed", total_jobs: jobs.length })
        .eq("id", session.id);

      if (error) {
        toast({ title: isEn ? 'Failed to end session' : '세션 종료 실패', description: isEn ? 'Please try again shortly.' : '잠시 후 다시 시도해주세요.', variant: "destructive" });
        return;
      }

      setSession(prev => prev ? { ...prev, ended_at: endedAt, status: "completed" } : prev);
      toast({ title: isEn ? 'Brainstorming complete' : '브레인스토밍 종료', description: isEn ? 'You can now move to the definition stage.' : '정의 단계로 이동할 수 있어요.' });

      timer.clearInterval();
      setStep(2);
    };
    finalize();
  }, [timer.secondsLeft, session, jobs.length]);

  // Step 2 normalization effect
  useEffect(() => {
    if (step !== 2) return;
    const hasCombined = jobs.some(j => j.job_name.includes(","));
    if (!hasCombined || isNormalizing) { setIsNormalizing(false); return; }

    let active = true;
    setIsNormalizing(true);
    dataOps.normalizeCombinedJobs().finally(() => {
      if (active) setIsNormalizing(false);
    });
    return () => { active = false; };
  }, [step, jobs.length]);

  return {
    step, setStep, loading, session, jobs,
    secondsLeft: timer.secondsLeft,
    memoText, setMemoText, idx, setIdx,
    isNormalizing, phase, setPhase, happySet, painSet,
    current, total, resultsReady, defsDone,
    flowProgress, currentJobCount,
    canGoStep2, canGoStep3, canGoStep4,
    finalizeStep1Early, goBackToEditMode, saveCurrent,
    toggleHappy, togglePain, commitClassification,
  };
}
