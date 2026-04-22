import { GrowthBook } from "@growthbook/growthbook-react";

const GB_API_HOST = import.meta.env.VITE_GROWTHBOOK_API_HOST as string | undefined;
const GB_CLIENT_KEY = import.meta.env.VITE_GROWTHBOOK_CLIENT_KEY as string | undefined;

export const growthbook = new GrowthBook({
  apiHost: GB_API_HOST ?? "https://cdn.growthbook.io",
  clientKey: GB_CLIENT_KEY ?? "",
  enableDevMode: import.meta.env.DEV,
  trackingCallback: (experiment, result) => {
    // PostHog 또는 Supabase로 실험 노출 이벤트 전달
    if (typeof window !== "undefined" && (window as Window & { posthog?: { capture: (event: string, props: Record<string, unknown>) => void } }).posthog) {
      (window as Window & { posthog?: { capture: (event: string, props: Record<string, unknown>) => void } }).posthog!.capture("$experiment_started", {
        experiment_id: experiment.key,
        variation_id: result.variationId,
      });
    }
  },
});

// 피처 플래그 키 상수
export const FEATURES = {
  NEED_ALGORITHM_VERSION: "need_algorithm_version",   // "v2" | "v3"
  CLEAR_CHALLENGE_TIMING: "clear_challenge_timing",   // "immediate" | "delayed"
  AI_LEAD_ENTRY_POINT:    "ai_lead_entry_point",      // "button" | "auto"
} as const;
