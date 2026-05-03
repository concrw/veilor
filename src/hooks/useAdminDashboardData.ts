import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FunnelRow = {
  stage: string;
  label_ko: string;
  label_en: string;
  count: number;
};

export type DashboardRow = {
  id: string; seq: number; primary_concern: string; relationship_status: string;
  axis_attachment: number; axis_communication: number; axis_expression: number; axis_role: number;
  mask_type: string; attachment_type: string; fragment_count: number; session_count: number;
};

export type GroupMembership = { user_id: string; group_code: string; source: string };

export function useAdminDashboardData() {
  const [rows, setRows] = useState<DashboardRow[]>([]);
  const [fragments, setFragments] = useState<{ name_ko: string }[]>([]);
  const [memberships, setMemberships] = useState<GroupMembership[]>([]);
  const [funnel, setFunnel] = useState<FunnelRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [
        { data: vData },
        { data: fData },
        { data: mData },
        { count: s0 },
        { count: s2 },
        { count: s3 },
        { count: s4 },
        { count: s5 },
        { count: s6 },
      ] = await Promise.all([
        supabase.from("admin_dashboard_stats" as never).select("*").limit(2000),
        supabase.from("persona_fragments" as never).select("name_ko"),
        supabase.from("user_group_memberships" as never).select("user_id,group_code,source").limit(5000),
        supabase.from("user_profiles" as never).select("*", { count: "exact", head: true }),
        supabase.from("dive_sessions" as never).select("user_id", { count: "exact", head: true }).eq("mode" as never, "F"),
        supabase.from("dive_sessions" as never).select("user_id", { count: "exact", head: true }).eq("mode" as never, "D"),
        supabase.from("why_sessions" as never).select("user_id", { count: "exact", head: true }),
        supabase.from("why_sessions" as never).select("user_id", { count: "exact", head: true }).not("completed_at" as never, "is", null),
        supabase.from("persona_instances" as never).select("user_id", { count: "exact", head: true }),
      ]);
      setRows((vData as DashboardRow[]) || []);
      setFragments((fData as { name_ko: string }[]) || []);
      setMemberships((mData as GroupMembership[]) || []);
      setFunnel([
        { stage: 'S0', label_ko: '가입',      label_en: 'Sign Up',      count: s0 ?? 0 },
        { stage: 'S2', label_ko: '첫 Vent',   label_en: 'First Vent',   count: s2 ?? 0 },
        { stage: 'S3', label_ko: '첫 Dig',    label_en: 'First Dig',    count: s3 ?? 0 },
        { stage: 'S4', label_ko: 'WHY 시작',  label_en: 'WHY Start',    count: s4 ?? 0 },
        { stage: 'S5', label_ko: 'WHY 완료',  label_en: 'WHY Done',     count: s5 ?? 0 },
        { stage: 'S6', label_ko: '페르소나 검출', label_en: 'Persona Found', count: s6 ?? 0 },
      ]);
      setLoading(false);
    }
    load();
  }, []);

  return { rows, fragments, memberships, funnel, loading };
}
