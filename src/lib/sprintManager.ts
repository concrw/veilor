import { supabase } from '@/integrations/supabase/client';

export type SprintGate = 'DOD' | 'VQ_MISSING' | 'DOUBLE_CHECK' | 'ALL_PASSED' | 'NOT_FOUND';

export interface SprintGateResult {
  ok: boolean;
  gate: SprintGate;
  message: string;
  blocked_items?: Array<{
    id: string;
    title: string;
    status?: string;
    verification_query?: string;
    reason?: string;
  }>;
  product?: string;
  sprint_id?: string;
}

export interface VeilorSprintStatus {
  id: string;
  code: string;
  sprint_number: number | null;
  title: string;
  status: string;
  priority: string;
  start_date: string | null;
  target_end_date: string | null;
  completed_at: string | null;
  total_items: number;
  done_items: number;
  pending_items: number;
  gate1_dod_ok: boolean;
  gate2_vq_ok: boolean;
  missing_vq_count: number;
  verified_items: number;
  trigger: string | null;
  root_cause: string | null;
  decision: string | null;
  new_gaps: string[];
  created_at: string;
  updated_at: string;
}

/**
 * 스프린트 종료 — 3단 gate를 통과해야만 COMPLETED 전환
 *
 * Gate 1 DoD        — 미완료 sprint_items 차단
 * Gate 2 VQ 누락    — verification_query NULL 항목 차단
 * Gate 3 Double-check — verification_query 직접 실행, 빈 행 차단
 *
 * 규칙이 아니라 DB RPC가 막는다.
 */
export async function closeSprintAndNotify(
  sprintId: string,
  onProgress?: (msg: string) => void
): Promise<SprintGateResult> {
  onProgress?.('Gate 1 DoD 확인 중…');

  const { data, error } = await supabase
    .rpc('fn_close_sprint_gate', { p_sprint_id: sprintId }, { schema: 'aosis' });

  if (error) {
    return {
      ok: false,
      gate: 'NOT_FOUND',
      message: `RPC 호출 실패: ${error.message}`,
    };
  }

  const result = data as SprintGateResult;

  if (!result.ok) {
    const gateLabel: Record<SprintGate, string> = {
      DOD: 'Gate 1 DoD',
      VQ_MISSING: 'Gate 2 VQ 누락',
      DOUBLE_CHECK: 'Gate 3 Double-check',
      ALL_PASSED: '',
      NOT_FOUND: '',
    };
    onProgress?.(`❌ ${gateLabel[result.gate] ?? result.gate} — ${result.message}`);
  } else {
    onProgress?.('✅ 3단 gate 모두 통과. 스프린트 COMPLETED.');
  }

  return result;
}

/** 베일러 스프린트 전체 현황 조회 */
export async function fetchVeilorSprints(): Promise<VeilorSprintStatus[]> {
  const { data, error } = await supabase
    .from('v_veilor_sprint_status')
    .select('*')
    .schema('aosis');

  if (error) throw error;
  return (data ?? []) as VeilorSprintStatus[];
}

/** 스프린트 단건 조회 */
export async function fetchSprintById(sprintId: string): Promise<VeilorSprintStatus | null> {
  const { data, error } = await supabase
    .from('v_veilor_sprint_status')
    .select('*')
    .eq('id', sprintId)
    .schema('aosis')
    .maybeSingle();

  if (error) throw error;
  return data as VeilorSprintStatus | null;
}
