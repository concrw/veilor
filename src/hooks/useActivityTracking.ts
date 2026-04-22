import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import posthog from "posthog-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

// PostHog 초기화 — VITE_POSTHOG_KEY가 있을 때만 활성화
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: 'https://app.posthog.com',
    capture_pageview: false,   // 수동으로 page_view 추적
    autocapture: false,        // 알고리즘 기반 앱 — 수동 이벤트만
    session_recording: { maskAllInputs: true },
    persistence: 'localStorage',
  });
}

type ActivityType =
  | "login"
  | "logout"
  | "page_view"
  | "why_analysis_start"
  | "why_analysis_complete"
  | "ikigai_start"
  | "ikigai_complete"
  | "brand_start"
  | "brand_complete"
  | "persona_detected"
  | "match_request"
  | "message_sent"
  | "group_joined"
  // VEILOR 핵심 이벤트
  | "why_session_completed"
  | "challenge_revisit"
  | "mode_switch"
  | "crisis_detected"
  | "voice_session_start"
  | "voice_session_end"
  | "sexself_completed";

type ConversionEvent =
  | "signup"
  | "onboarding_complete"
  | "why_complete"
  | "ikigai_complete"
  | "brand_complete"
  | "first_match"
  | "upgrade_clicked"
  | "subscribed";

export function usePageTracking() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      // PostHog 사용자 식별
      if (POSTHOG_KEY) {
        posthog.identify(user.id);
        posthog.capture('$pageview', { path: location.pathname });
      }
      trackActivity("page_view", { page_path: location.pathname });
    }
  }, [location.pathname, user?.id]);
}

export async function trackActivity(
  activityType: ActivityType,
  activityData: Record<string, unknown> = {}
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // PostHog 이벤트 전송
    if (POSTHOG_KEY) {
      posthog.capture(activityType, {
        ...activityData,
        page_path: window.location.pathname,
        user_id: user.id,
      });
    }

    await supabase.from("user_activities").insert({
      user_id: user.id,
      activity_type: activityType,
      activity_data: activityData,
      page_path: window.location.pathname,
    });
  } catch (error) {
    console.error("Failed to track activity:", error);
  }
}

export async function trackConversion(
  eventName: ConversionEvent,
  eventData: Record<string, unknown> = {}
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (POSTHOG_KEY) {
      posthog.capture(eventName, { ...eventData, user_id: user.id });
    }

    await supabase.from("conversion_events").insert({
      user_id: user.id,
      event_name: eventName,
      event_data: eventData,
    });
  } catch (error) {
    console.error("Failed to track conversion:", error);
  }
}

export function useAnalytics() {
  return {
    trackActivity,
    trackConversion,
  };
}

export { posthog };
