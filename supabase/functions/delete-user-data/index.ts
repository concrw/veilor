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
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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
      return new Response(
        JSON.stringify({ success: false, error: "User not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userId = user.id;

    // Service role client for privileged deletion
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. 개인 데이터 삭제
    //
    // 기존 구현은 (a) .schema("veilor")를 썼는데 veilor 스키마가 PostgREST에
    // 노출되어 있지 않아 모든 삭제가 실패했고, (b) 실패해도 중단하지 않고
    // auth 계정만 삭제해서 "계정은 사라지고 개인정보는 남는" 상태를 만들었으며,
    // (c) 하드코딩 목록 15개만 지웠다(veilor에 user_id 보유 테이블은 68개 —
    // user_signals 38k, emotion_checkins 5.9k, crisis_flags 등이 누락).
    //
    // public.fn_delete_user_data는 카탈로그에서 user_id 보유 테이블을 동적으로
    // 찾아 전부 삭제하고, FK(NO ACTION) 순서 의존은 반복 재시도로 해소한다.
    // 마이그레이션: delete_user_data_public_wrapper
    const { data: result, error: deleteError } = await serviceClient.rpc(
      "fn_delete_user_data",
      { p_user_id: userId },
    );

    if (deleteError || !result?.ok) {
      // 데이터가 남은 채로 계정만 지우면 안 된다 — 여기서 중단한다.
      console.error("fn_delete_user_data failed:", deleteError?.message, result?.failed);
      return new Response(
        JSON.stringify({
          success: false,
          error: "DATA_DELETION_FAILED",
          message: "개인 데이터 삭제에 실패했습니다. 계정은 삭제되지 않았습니다.",
          failed: result?.failed ?? null,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. 데이터 삭제가 모두 성공한 뒤에만 auth 계정을 삭제한다.
    const { error: deleteAuthError } = await serviceClient.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError);
      throw deleteAuthError;
    }

    console.log(
      `User data deleted: ${userId} (tables=${result.tables_scanned}, rows=${result.rows_deleted})`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "모든 개인 데이터가 삭제되었습니다.",
        tables_scanned: result.tables_scanned,
        rows_deleted: result.rows_deleted,
      }),
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
