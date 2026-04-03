import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import type { SessionInfo } from "./useWhyPageFlow";

const DURATION_SECONDS = 600;

export function useWhyTimer(
  step: number,
  session: SessionInfo | null,
  setSession: React.Dispatch<React.SetStateAction<SessionInfo | null>>,
) {
  const { user } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState<number>(DURATION_SECONDS);
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Timer effect for Step 1
  useEffect(() => {
    if (step !== 1 || session?.ended_at) return;

    const startTimer = () => {
      endTimeRef.current = Date.now() + DURATION_SECONDS * 1000;
      setSecondsLeft(DURATION_SECONDS);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        if (!endTimeRef.current) return;
        const diff = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        setSecondsLeft(diff);
      }, 1000);
    };

    const ensureSession = async () => {
      if (session) return session;

      const { data, error } = await supabase
        .from("brainstorm_sessions")
        .insert({
          timer_duration: DURATION_SECONDS,
          status: "active",
          user_id: user?.id ?? null,
        })
        .select("id, status, ended_at")
        .maybeSingle();

      if (error || !data) {
        toast({
          title: "세션 생성 실패",
          description: error?.message || "다시 시도해주세요.",
          variant: "destructive",
        });
        return null;
      }

      setSession({
        id: data.id,
        status: data.status,
        ended_at: data.ended_at,
      });
      return { id: data.id } as SessionInfo;
    };

    ensureSession().then((s) => {
      if (!s) return;
      startTimer();
    });

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [step, session, user?.id]);

  const resetTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSecondsLeft(DURATION_SECONDS);
    endTimeRef.current = null;
  };

  const clearInterval = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
  };

  return {
    secondsLeft,
    endTimeRef,
    intervalRef,
    resetTimer,
    clearInterval,
    DURATION_SECONDS,
  };
}
