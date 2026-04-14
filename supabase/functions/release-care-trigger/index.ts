// Deno Edge Function — release-care-trigger
// 트레이니가 팀/소속에서 방출(released)될 때 30일 자동 케어 프로토콜을 시작한다.
//
// 호출 방법:
//   POST /functions/v1/release-care-trigger
//   Body: { member_id: string, org_id: string, release_date?: string (ISO) }
//
// 케어 단계:
//   Phase 1 (D+1~7)  : 즉각 안정화 — 체크인 요청 + 코치 아웃리치
//   Phase 2 (D+8~14) : 현실 수용   — 현재 감정 상태 점검
//   Phase 3 (D+15~21): 미래 탐색   — 목표 재설정 대화
//   Phase 4 (D+22~30): 독립 준비   — 자기 주도 체크인 습관화
//
// 각 단계 시작에 b2b_release_care_log에 레코드를 삽입하고,
// 담당 코치에게 알림 메일을 발송한다.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FUNCTION_BASE    = Deno.env.get('SUPABASE_FUNCTIONS_URL') ?? `${SUPABASE_URL}/functions/v1`;

const db = createClient(SUPABASE_URL, SERVICE_KEY);

// ── 케어 단계 정의 ──────────────────────────────────────────────
const CARE_PHASES = [
  {
    phase:       1,
    name:        '즉각 안정화',
    start_day:   1,
    end_day:     7,
    goal:        '방출 직후 심리적 충격을 최소화하고 안전망을 확인한다.',
    activities: [
      '방출 다음날 코치 첫 아웃리치 메시지 발송',
      '일일 체크인 리마인더 활성화',
      '위기 신호 임계값을 평소 대비 20% 낮게 설정 (민감 모드)',
    ],
    coach_message: (name: string) =>
      `[베일러 방출 케어 Phase 1] ${name}님이 소속팀을 떠났습니다. ` +
      `향후 7일은 심리적 충격이 가장 큰 시기입니다. ` +
      `오늘 중으로 첫 연락을 취해 주세요. 체크인 알림이 자동 발송됩니다.`,
  },
  {
    phase:       2,
    name:        '현실 수용',
    start_day:   8,
    end_day:     14,
    goal:        '방출 현실을 감정적으로 처리하고 자아상을 재정립한다.',
    activities: [
      'Commitment(의지) 집중 세션 예약 유도',
      '슬럼프 리커버리 세션 타입 우선 추천',
      '과거 성취 회고 리플렉션 질문 체크인에 추가',
    ],
    coach_message: (name: string) =>
      `[베일러 방출 케어 Phase 2] ${name}님 케어 2주차입니다. ` +
      `현실 수용 단계: 방출에 대한 감정 처리 및 자아상 재정립을 위해 ` +
      `Commitment 중심 세션을 권장합니다. 슬럼프 리커버리 세션을 제안해 주세요.`,
  },
  {
    phase:       3,
    name:        '미래 탐색',
    start_day:   15,
    end_day:     21,
    goal:        '새로운 목표를 설정하고 다음 커리어 방향을 구체화한다.',
    activities: [
      '커리어 앵커링 세션 예약 권장',
      'Challenge(도전) 축 회복에 집중',
      '새 팀·트레이닝 환경 탐색 대화',
    ],
    coach_message: (name: string) =>
      `[베일러 방출 케어 Phase 3] ${name}님 케어 3주차입니다. ` +
      `미래 탐색 단계: 커리어 앵커링 세션으로 다음 목표를 구체화할 시기입니다. ` +
      `Challenge 점수 회복 추이를 확인해 주세요.`,
  },
  {
    phase:       4,
    name:        '독립 준비',
    start_day:   22,
    end_day:     30,
    goal:        '자기 주도 체크인 습관을 형성하고 플랫폼 독립 사용을 준비한다.',
    activities: [
      '격일 체크인으로 리마인더 완화 (자율성 강화)',
      '에너지 관리 세션으로 지속 가능성 확인',
      '30일 완료 시 케어 리포트 자동 생성 + 코치 최종 보고',
    ],
    coach_message: (name: string) =>
      `[베일러 방출 케어 Phase 4] ${name}님 케어 최종 주차입니다. ` +
      `독립 준비 단계: 자기 주도 체크인 전환 및 에너지 관리 세션을 진행해 주세요. ` +
      `30일 완료 후 케어 종결 리포트를 작성해 주시면 됩니다.`,
  },
] as const;

// ── 유틸 ────────────────────────────────────────────────────────
function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

async function sendCoachEmail(coachUserId: string, subject: string, body: string) {
  try {
    await fetch(`${FUNCTION_BASE}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SERVICE_KEY}` },
      body: JSON.stringify({ user_id: coachUserId, subject, body }),
    });
  } catch {
    // 이메일 실패는 케어 로그 저장을 막지 않는다
  }
}

// ── 메인 핸들러 ──────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' } });
  }

  let body: { member_id: string; org_id: string; release_date?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid JSON' }), { status: 400 });
  }

  const { member_id, org_id, release_date } = body;
  if (!member_id || !org_id) {
    return new Response(JSON.stringify({ error: 'member_id and org_id are required' }), { status: 400 });
  }

  const releaseDate = release_date ? new Date(release_date) : new Date();

  // ── 1) 트레이니 프로필 조회 ────────────────────────────────────
  const { data: trainee, error: tErr } = await db
    .from('b2b_trainee_profiles')
    .select('user_id, display_name, age_group, guardian_user_id')
    .eq('user_id', member_id)
    .eq('org_id', org_id)
    .single();

  if (tErr || !trainee) {
    return new Response(JSON.stringify({ error: 'trainee not found', detail: tErr?.message }), { status: 404 });
  }

  // ── 2) 담당 코치 조회 ──────────────────────────────────────────
  const { data: session } = await db
    .from('b2b_coaching_sessions')
    .select('coach_id')
    .eq('member_id', member_id)
    .eq('org_id', org_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const coachId: string | null = session?.coach_id ?? null;

  // ── 3) b2b_org_member 상태를 released로 업데이트 ───────────────
  await db
    .from('b2b_org_members')
    .update({ status: 'released', meta: { released_at: releaseDate.toISOString() } })
    .eq('user_id', member_id)
    .eq('org_id', org_id);

  // ── 4) 각 Phase 케어 로그 삽입 + 코치 알림 ────────────────────
  const logs: Array<{ phase: number; name: string; status: string }> = [];

  for (const phase of CARE_PHASES) {
    const scheduledDate = addDays(releaseDate, phase.start_day);
    const endDate       = addDays(releaseDate, phase.end_day);

    const { error: logErr } = await db
      .from('b2b_release_care_log')
      .insert({
        member_id,
        org_id,
        phase:          phase.phase,
        phase_name:     phase.name,
        goal:           phase.goal,
        activities:     phase.activities,
        scheduled_date: scheduledDate,
        end_date:       endDate,
        status:         phase.phase === 1 ? 'active' : 'pending',
        coach_id:       coachId,
        meta: {
          release_date:  releaseDate.toISOString(),
          age_group:     trainee.age_group,
          guardian_id:   trainee.guardian_user_id,
        },
      });

    if (logErr) {
      console.error(`Phase ${phase.phase} log insert error:`, logErr.message);
    } else {
      logs.push({ phase: phase.phase, name: phase.name, status: phase.phase === 1 ? 'active' : 'pending' });
    }

    // Phase 1만 즉시 코치 알림 발송 (나머지는 scheduled_date에 별도 크론이 트리거)
    if (phase.phase === 1 && coachId) {
      await sendCoachEmail(
        coachId,
        `[베일러] 방출 케어 시작 — ${trainee.display_name ?? member_id}`,
        phase.coach_message(trainee.display_name ?? '트레이니'),
      );
    }
  }

  // ── 5) 보호자 알림 (Phase 1) ───────────────────────────────────
  if (trainee.guardian_user_id) {
    await sendCoachEmail(
      trainee.guardian_user_id,
      `[베일러] ${trainee.display_name ?? '자녀'}님 케어 프로그램 안내`,
      `${trainee.display_name ?? '자녀'}님이 소속팀을 떠나셨습니다.\n` +
      `베일러는 앞으로 30일간 심리적 지원 케어 프로그램을 자동으로 제공합니다.\n` +
      `보호자 앱에서 체크인 현황과 알림을 확인하실 수 있습니다.`,
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      member_id,
      org_id,
      release_date: releaseDate.toISOString(),
      care_phases:  logs,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
