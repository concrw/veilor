// Deno Edge Function — release-care-scheduler
// 매일 1회 Supabase Cron으로 실행 (권장: 매일 오전 9시 KST = 0시 UTC)
// 권장 cron: "0 0 * * *"
//
// 역할:
//   1) scheduled_date <= 오늘인 pending Phase를 active로 전환
//   2) 해당 Phase의 코치에게 안내 메일 발송
//   3) end_date < 오늘인 active Phase를 completed로 전환
//   4) 모든 Phase가 completed인 경우 케어 종결 처리
//      → b2b_org_members.status = 'care_complete'
//      → 코치에게 종결 보고 메일 발송

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FUNCTION_BASE = Deno.env.get('SUPABASE_FUNCTIONS_URL') ?? `${SUPABASE_URL}/functions/v1`;

const db = createClient(SUPABASE_URL, SERVICE_KEY);

const PHASE_MESSAGES: Record<number, (name: string) => string> = {
  2: (name) =>
    `[베일러 방출 케어 Phase 2] ${name}님 케어 2주차가 시작되었습니다.\n` +
    `현실 수용 단계: Commitment 중심 세션 및 슬럼프 리커버리 세션을 제안해 주세요.\n` +
    `과거 성취 회고 리플렉션 질문을 체크인에 추가하여 자아상 재정립을 지원하세요.`,
  3: (name) =>
    `[베일러 방출 케어 Phase 3] ${name}님 케어 3주차가 시작되었습니다.\n` +
    `미래 탐색 단계: 커리어 앵커링 세션 예약을 권장합니다.\n` +
    `Challenge 점수 회복 추이를 확인하고 새 환경 탐색 대화를 시작해 주세요.`,
  4: (name) =>
    `[베일러 방출 케어 Phase 4] ${name}님 케어 최종 주차가 시작되었습니다.\n` +
    `독립 준비 단계: 격일 체크인으로 전환되며 에너지 관리 세션을 진행해 주세요.\n` +
    `30일 완료 후 케어 종결 리포트를 작성해 주시면 됩니다.`,
};

async function sendEmail(userId: string, subject: string, body: string) {
  try {
    await fetch(`${FUNCTION_BASE}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SERVICE_KEY}` },
      body: JSON.stringify({ user_id: userId, subject, body }),
    });
  } catch {
    // 이메일 실패는 스케줄러 실행을 막지 않는다
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' },
    });
  }

  const today     = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const summary   = { activated: 0, completed: 0, care_closed: 0, errors: [] as string[] };

  // ── 1) pending → active: scheduled_date <= today ──────────────────
  const { data: toActivate } = await db
    .from('b2b_release_care_log')
    .select('id, phase, member_id, org_id, coach_id, meta')
    .eq('status', 'pending')
    .lte('scheduled_date', today);

  for (const row of (toActivate ?? [])) {
    const { error } = await db
      .from('b2b_release_care_log')
      .update({ status: 'active', activated_at: new Date().toISOString() })
      .eq('id', row.id);

    if (error) {
      summary.errors.push(`activate ${row.id}: ${error.message}`);
      continue;
    }

    summary.activated++;

    // 코치 알림 발송
    if (row.coach_id && PHASE_MESSAGES[row.phase]) {
      // 트레이니 이름 조회
      const { data: trainee } = await db
        .from('b2b_trainee_profiles')
        .select('display_name')
        .eq('user_id', row.member_id)
        .eq('org_id', row.org_id)
        .single();

      const name = trainee?.display_name ?? row.member_id;
      await sendEmail(
        row.coach_id,
        `[베일러] 케어 Phase ${row.phase} 시작 — ${name}`,
        PHASE_MESSAGES[row.phase](name),
      );
    }
  }

  // ── 2) active → completed: end_date < today ────────────────────────
  const { data: toComplete } = await db
    .from('b2b_release_care_log')
    .select('id, phase, member_id, org_id, coach_id')
    .eq('status', 'active')
    .lt('end_date', today);

  for (const row of (toComplete ?? [])) {
    const { error } = await db
      .from('b2b_release_care_log')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', row.id);

    if (error) {
      summary.errors.push(`complete ${row.id}: ${error.message}`);
    } else {
      summary.completed++;
    }
  }

  // ── 3) 케어 종결 처리: 4개 Phase 모두 completed인 member 찾기 ──────
  // member_id별로 케어 로그 집계
  const { data: allLogs } = await db
    .from('b2b_release_care_log')
    .select('member_id, org_id, phase, status, coach_id')
    .in('status', ['active', 'pending', 'completed']);

  // member별로 그룹핑
  const memberMap: Record<string, typeof allLogs> = {};
  for (const log of (allLogs ?? [])) {
    const key = `${log.member_id}::${log.org_id}`;
    if (!memberMap[key]) memberMap[key] = [];
    memberMap[key].push(log);
  }

  for (const [key, logs] of Object.entries(memberMap)) {
    const [member_id, org_id] = key.split('::');
    // 4개 Phase가 모두 있고 모두 completed인 경우
    if (
      logs.length === 4 &&
      logs.every((l) => l.status === 'completed')
    ) {
      // b2b_org_members 상태 업데이트
      const { error: memberErr } = await db
        .from('b2b_org_members')
        .update({ status: 'care_complete', meta: { care_completed_at: new Date().toISOString() } })
        .eq('user_id', member_id)
        .eq('org_id', org_id)
        .eq('status', 'released'); // 이미 care_complete인 경우 중복 방지

      if (!memberErr) {
        summary.care_closed++;

        // 코치에게 종결 보고 메일
        const coachId = logs.find((l) => l.coach_id)?.coach_id;
        if (coachId) {
          const { data: trainee } = await db
            .from('b2b_trainee_profiles')
            .select('display_name')
            .eq('user_id', member_id)
            .eq('org_id', org_id)
            .single();

          const name = trainee?.display_name ?? member_id;
          await sendEmail(
            coachId,
            `[베일러] ${name}님 30일 케어 프로그램 완료`,
            `[베일러 방출 케어 종결] ${name}님의 30일 케어 프로그램이 완료되었습니다.\n\n` +
            `케어 기간 동안 4단계 프로토콜을 성공적으로 완료했습니다.\n` +
            `종결 리포트를 작성하시고 필요 시 지속 코칭 여부를 ${name}님과 논의해 주세요.\n\n` +
            `베일러 코치 포털에서 전체 체크인 이력을 확인하실 수 있습니다.`,
          );
        }
      }
    }
  }

  return new Response(
    JSON.stringify({ ok: true, date: today, summary }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
