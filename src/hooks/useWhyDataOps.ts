import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useLanguageContext } from "@/context/LanguageContext";
import { getT } from "@/i18n/useT";
import type { Job, SessionInfo } from "./useWhyPageFlow";

export function useWhyDataOps(
  session: SessionInfo | null,
  jobs: Job[],
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>,
  setIdx: React.Dispatch<React.SetStateAction<number>>,
  setIsNormalizing: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const { user } = useAuth();
  const { language } = useLanguageContext();

  const updateProfileAnalysisStatus = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ has_completed_analysis: true })
        .eq('id', user.id);

      if (error) {
        console.error("Failed to update profile analysis status:", error);
      } else {
        console.log("✅ Profile analysis status updated successfully");
      }
    } catch (error) {
      console.error("Exception updating profile:", error);
    }
  };

  const findBestSession = async () => {
    if (!user?.id) return null;

    try {
      const { data: sessionWithJobs, error } = await supabase
        .from("brainstorm_sessions")
        .select(`
          id, status, ended_at, started_at, total_jobs,
          job_entries (id)
        `)
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });

      if (error) {
        const { data: fallback } = await supabase
          .from("brainstorm_sessions")
          .select("id, status, ended_at, started_at, total_jobs")
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        return fallback;
      }

      if (!sessionWithJobs || sessionWithJobs.length === 0) {
        return null;
      }

      const sessionWithJobData = sessionWithJobs.find(s =>
        s.job_entries && s.job_entries.length > 0
      );

      return sessionWithJobData || sessionWithJobs[0];
    } catch (error) {
      console.error("findBestSession error:", error);
      const { data: simple } = await supabase
        .from("brainstorm_sessions")
        .select("id, status, ended_at, started_at, total_jobs")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return simple;
    }
  };

  const addFromMemo = async (memoText: string) => {
    if (!session?.id) return;

    const lines = memoText
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (lines.length === 0) return;

    const existingLower = new Set(jobs.map(j => j.job_name.toLowerCase()));
    const seen = new Set<string>();
    const uniqueOriginal: string[] = [];

    for (const line of lines) {
      const low = line.toLowerCase();
      if (existingLower.has(low) || seen.has(low)) continue;
      seen.add(low);
      uniqueOriginal.push(line);
    }

    if (uniqueOriginal.length === 0) {
      const t = getT(language);
      toast({
        title: t.why.toasts.duplicateEntry,
        description: t.why.toasts.duplicateEntryDesc,
        variant: "destructive",
      });
      return;
    }

    const temps = uniqueOriginal.map(u => ({
      id: `tmp-${Math.random().toString(36).slice(2)}`,
      job_name: u,
      definition: null,
      first_memory: null,
      category: null,
    }) as Job);
    setJobs(prev => [...temps, ...prev]);

    const payload = uniqueOriginal.map(name => ({
      job_name: name,
      session_id: session.id,
      user_id: user?.id ?? null,
    }));

    const { data, error } = await supabase
      .from("job_entries")
      .insert(payload)
      .select("id, job_name, definition, first_memory, category");

    if (error) {
      const t = getT(language);
      setJobs(prev => prev.filter(p => !p.id.startsWith("tmp-")));
      toast({ title: t.why.toasts.addFailed, description: t.why.toasts.saveFailedDesc, variant: "destructive" });
      return;
    }

    setJobs(prev => [...(data as Job[]), ...prev.filter(p => !p.id.startsWith("tmp-"))]);
  };

  const normalizeCombinedJobs = async () => {
    if (!session?.id) {
      setIsNormalizing(false);
      return;
    }

    const combined = jobs.filter(j => j.job_name.includes(","));
    if (combined.length === 0) {
      setIsNormalizing(false);
      return;
    }

    const existingLower = new Set(jobs.map(j => j.job_name.trim().toLowerCase()));
    const toInsert: { job_name: string; session_id: string; user_id: string | null }[] = [];
    const added = new Set<string>();

    for (const row of combined) {
      const parts = row.job_name.split(",").map(s => s.trim()).filter(Boolean);
      for (const name of parts) {
        const low = name.toLowerCase();
        if (existingLower.has(low) || added.has(low)) continue;
        toInsert.push({
          job_name: name,
          session_id: session.id,
          user_id: user?.id ?? null,
        });
        added.add(low);
      }
    }

    if (toInsert.length > 0) {
      const { error } = await supabase
        .from("job_entries")
        .insert(toInsert)
        .select("id, job_name, definition, first_memory, category, reason");

      if (error) {
        setIsNormalizing(false);
        return;
      }
    }

    const combinedIds = combined.map(c => c.id);
    await supabase
      .from("job_entries")
      .delete()
      .in("id", combinedIds);

    const { data: refreshed } = await supabase
      .from("job_entries")
      .select("id, job_name, definition, first_memory, category, reason")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true });

    setJobs((refreshed || []) as Job[]);
    setIdx(0);
    setIsNormalizing(false);
  };

  const saveCurrent = async (current: Job | undefined, definition: string, memory: string) => {
    if (!current) return true;

    const def = definition.trim();
    const mem = memory.trim();

    if (!def || !mem) {
      const t = getT(language);
      toast({
        title: t.why.toasts.inputRequired,
        description: t.why.toasts.inputRequiredDesc,
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from("job_entries")
      .update({ definition: def, first_memory: mem })
      .eq("id", current.id);

    if (error) {
      const t = getT(language);
      toast({ title: t.why.toasts.saveFailed, description: t.why.toasts.saveFailedDesc, variant: "destructive" });
      return false;
    }

    setJobs(prev => prev.map(j => j.id === current.id ? { ...j, definition: def, first_memory: mem } : j));
    return true;
  };

  const commitClassification = async (
    happySet: Set<string>,
    painSet: Set<string>,
    setStep: (step: 1 | 2 | 3 | 4) => void,
  ) => {
    if (!session?.id) return;

    const ids = jobs.map(j => j.id);
    const happyIds = Array.from(happySet);
    const painIds = Array.from(painSet);
    const neutralIds = ids.filter(id => !happySet.has(id) && !painSet.has(id));

    try {
      if (happyIds.length) await supabase.from("job_entries").update({ category: "happy", reason: null }).in("id", happyIds);
      if (painIds.length) await supabase.from("job_entries").update({ category: "pain", reason: null }).in("id", painIds);
      if (neutralIds.length) await supabase.from("job_entries").update({ category: "neutral", reason: null }).in("id", neutralIds);

      setJobs(prev => prev.map(j =>
        happySet.has(j.id) ? { ...j, category: "happy" } :
        painSet.has(j.id) ? { ...j, category: "pain" } :
        { ...j, category: "neutral" }
      ));

      await updateProfileAnalysisStatus();

      const t = getT(language);
      toast({
        title: t.why.toasts.classificationSaved,
        description: t.why.toasts.classificationSavedDesc,
      });
      setStep(4);
    } catch (e: unknown) {
      const t = getT(language);
      console.error("Classification save error:", e);
      toast({ title: t.why.toasts.classificationFailed, description: t.why.toasts.classificationFailedDesc, variant: "destructive" });
    }
  };

  const goBackToEditMode = (
    setStep: (step: 1 | 2 | 3 | 4) => void,
    setMemoText: (text: string) => void,
    setSession: React.Dispatch<React.SetStateAction<SessionInfo | null>>,
    resetTimer: () => void,
  ) => {
    if (jobs.length > 0) {
      const t = getT(language);
      const jobNames = jobs.map(j => j.job_name).join(', ');
      setMemoText(jobNames);

      toast({
        title: t.why.toasts.editModeTitle,
        description: t.why.toasts.editModeDesc,
      });
    }

    setStep(1);

    if (session?.ended_at) {
      setSession(prev => prev ? { ...prev, ended_at: null, status: "active" } : prev);
    }

    resetTimer();
  };

  return {
    updateProfileAnalysisStatus,
    findBestSession,
    addFromMemo,
    normalizeCombinedJobs,
    saveCurrent,
    commitClassification,
    goBackToEditMode,
  };
}
