import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getAuthenticatedUser, createServiceClient } from "../_shared/auth.ts";

interface MonthData {
  vent_count: number;
  dig_count: number;
  codetalk_days: number;
  top_keywords: string[];
  top_emotions: string[];
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user } = await getAuthenticatedUser(req);
    const supabase = createServiceClient();
    const userId = user.id;
    const now = new Date();

    // Helper: get first/last day of month offset (0 = current, -1 = prev, etc.)
    const monthRange = (offset: number) => {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const start = d.toISOString();
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
      return { start, end };
    };

    const getMonthData = async (offset: number): Promise<MonthData> => {
      const { start, end } = monthRange(offset);

      // 1) Vent count: tab_conversations where tab='vent'
      const { count: ventCount } = await supabase
        .schema('veilor')
        .from("tab_conversations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("tab", "vent")
        .gte("created_at", start)
        .lt("created_at", end);

      // 2) Dig count: tab_conversations where tab='dig'
      const { count: digCount } = await supabase
        .schema('veilor')
        .from("tab_conversations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("tab", "dig")
        .gte("created_at", start)
        .lt("created_at", end);

      // 3) Codetalk: distinct entry_date count
      const { data: codetalkData } = await supabase
        .schema('veilor')
        .from("codetalk_entries")
        .select("entry_date")
        .eq("user_id", userId)
        .gte("created_at", start)
        .lt("created_at", end);

      const uniqueDays = new Set((codetalkData || []).map((r: any) => r.entry_date)).size;

      // 4) Top keywords from user_signals
      const { data: signalData } = await supabase
        .schema('veilor')
        .from("user_signals")
        .select("keyword, emotion")
        .eq("user_id", userId)
        .gte("created_at", start)
        .lt("created_at", end);

      // Count keyword frequencies
      const kwMap: Record<string, number> = {};
      const emMap: Record<string, number> = {};
      for (const row of (signalData || [])) {
        if (row.keyword) kwMap[row.keyword] = (kwMap[row.keyword] || 0) + 1;
        if (row.emotion) emMap[row.emotion] = (emMap[row.emotion] || 0) + 1;
      }

      const topKeywords = Object.entries(kwMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([k]) => k);

      const topEmotions = Object.entries(emMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([k]) => k);

      return {
        vent_count: ventCount ?? 0,
        dig_count: digCount ?? 0,
        codetalk_days: uniqueDays,
        top_keywords: topKeywords,
        top_emotions: topEmotions,
      };
    };

    // Get data for current and previous 2 months (3 months total)
    const [current, prev1, prev2] = await Promise.all([
      getMonthData(0),
      getMonthData(-1),
      getMonthData(-2),
    ]);

    // Comparison: current vs prev1
    const pctChange = (cur: number, prev: number) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return Math.round(((cur - prev) / prev) * 100);
    };

    const comparison = {
      vent: pctChange(current.vent_count, prev1.vent_count),
      dig: pctChange(current.dig_count, prev1.dig_count),
      codetalk: pctChange(current.codetalk_days, prev1.codetalk_days),
    };

    // Psych map snapshots: 최근 3개월 4축 추이
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString();
    const { data: psychSnapshots } = await supabase
      .schema('veilor')
      .from("user_psych_map_snapshots")
      .select("snapshot_date, attachment_security_score, communication_style_score, affect_regulation_score, boundary_power_score")
      .eq("user_id", userId)
      .gte("snapshot_date", threeMonthsAgo.slice(0, 10))
      .order("snapshot_date", { ascending: true });

    // Group snapshots by month, take the latest snapshot per month
    const psychByMonth: Record<string, any> = {};
    for (const snap of (psychSnapshots || [])) {
      const d = new Date(snap.snapshot_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      psychByMonth[key] = snap; // last one per month wins (sorted asc)
    }

    const psychTrend = Object.entries(psychByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-3)
      .map(([key, snap]: [string, any]) => ({
        month: `${parseInt(key.split('-')[1])}월`,
        attachment: Math.round((snap.attachment_security_score ?? 0) * 100),
        communication: Math.round((snap.communication_style_score ?? 0) * 100),
        desire: Math.round((snap.affect_regulation_score ?? 0) * 100),
        role: Math.round((snap.boundary_power_score ?? 0) * 100),
      }));

    // Month labels
    const monthLabel = (offset: number) => {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      return `${d.getMonth() + 1}월`;
    };

    // ── 아웃컴 측정: priper_sessions 축 점수 변화 (첫 진단 → 최신 진단) ──
    const { data: allSessions } = await supabase
      .schema('veilor')
      .from('priper_sessions')
      .select('axis_scores, primary_mask, completed_at')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .order('completed_at', { ascending: true });

    let outcomeMetrics: {
      firstDate: string | null;
      latestDate: string | null;
      sessionCount: number;
      axisChange: Record<string, number> | null;
      maskChanged: boolean;
      firstMask: string | null;
      latestMask: string | null;
    } = {
      firstDate: null, latestDate: null, sessionCount: 0,
      axisChange: null, maskChanged: false, firstMask: null, latestMask: null,
    };

    if (allSessions && allSessions.length >= 2) {
      const first = allSessions[0];
      const latest = allSessions[allSessions.length - 1];
      const firstScores = first.axis_scores as Record<string, number> | null;
      const latestScores = latest.axis_scores as Record<string, number> | null;

      let axisChange: Record<string, number> | null = null;
      if (firstScores && latestScores) {
        axisChange = {};
        for (const k of ['A', 'B', 'C', 'D']) {
          axisChange[k] = (latestScores[k] ?? 50) - (firstScores[k] ?? 50);
        }
      }

      outcomeMetrics = {
        firstDate: first.completed_at,
        latestDate: latest.completed_at,
        sessionCount: allSessions.length,
        axisChange,
        maskChanged: first.primary_mask !== latest.primary_mask,
        firstMask: first.primary_mask,
        latestMask: latest.primary_mask,
      };
    } else if (allSessions && allSessions.length === 1) {
      outcomeMetrics.sessionCount = 1;
      outcomeMetrics.latestDate = allSessions[0].completed_at;
      outcomeMetrics.latestMask = allSessions[0].primary_mask;
    }

    const response = {
      monthly_summary: {
        vent_count: current.vent_count,
        dig_count: current.dig_count,
        codetalk_days: current.codetalk_days,
        top_keywords: current.top_keywords,
        top_emotions: current.top_emotions,
      },
      comparison,
      top_patterns: current.top_keywords.slice(0, 3),
      chart_data: [
        { month: monthLabel(-2), vent: prev2.vent_count, dig: prev2.dig_count, codetalk: prev2.codetalk_days },
        { month: monthLabel(-1), vent: prev1.vent_count, dig: prev1.dig_count, codetalk: prev1.codetalk_days },
        { month: monthLabel(0),  vent: current.vent_count, dig: current.dig_count, codetalk: current.codetalk_days },
      ],
      psych_trend: psychTrend,
      outcome_metrics: outcomeMetrics,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
