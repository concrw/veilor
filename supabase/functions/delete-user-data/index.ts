// Edge Function: delete-user-data
// VS-19: 개인정보 삭제 API — GDPR/개인정보보호법 준수
// 인증된 사용자의 모든 개인 데이터를 삭제합니다.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const userId = user.id;

    // Service role client for privileged deletion
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const errors: { schema: string; table: string; message: string }[] = [];

    // 1. veilor schema tables
    const veilorTables = [
      "tab_conversations",
      "codetalk_entries",
      "cq_responses",
      "priper_sessions",
      "persona_zones",
      "compatibility_matches",
      "user_profiles",
    ];

    for (const table of veilorTables) {
      const { error } = await serviceClient
        .schema("veilor")
        .from(table)
        .delete()
        .eq("user_id", userId);
      if (error) {
        console.error(`Error deleting from veilor.${table}:`, error);
        errors.push({ schema: "veilor", table, message: error.message });
      }
    }

    // 2. public schema tables
    const publicTables = [
      "job_entries",
      "analysis_results",
      "brand_strategies",
      "brainstorm_sessions",
    ];

    for (const table of publicTables) {
      const { error } = await serviceClient
        .from(table)
        .delete()
        .eq("user_id", userId);
      if (error) {
        console.error(`Error deleting from public.${table}:`, error);
        errors.push({ schema: "public", table, message: error.message });
      }
    }

    // 3. Delete auth user (must be last)
    const { error: deleteAuthError } = await serviceClient.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError);
      throw deleteAuthError;
    }

    console.log("User data deleted:", userId);

    // 부분 실패가 있었으면 207 Multi-Status 응답
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          partial: true,
          message: "계정이 삭제되었지만 일부 데이터 정리에 실패했습니다.",
          errors,
        }),
        {
          status: 207,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "모든 개인 데이터가 삭제되었습니다." }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in delete-user-data:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  }
});
