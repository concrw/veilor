// personaContradictionEngine.ts
// 시스템이 유저 응답 데이터에서 모순을 감지하고 페르소나 조각을 생성
//
// 근거:
//   - Jung: 페르소나와 그림자는 모순 구조 — 자기상과 실제 행동의 불일치
//   - IFS: 파트는 내적 양극화에서 생겨남
//   - Higgins 자기 불일치 이론: 실제 자아 vs 이상 자아 vs 당위 자아의 불일치
//
// 동작:
//   1. SexSelf 결과 + VFile(primary_mask) + CQ 응답을 입력받음
//   2. 미리 정의된 모순 규칙(CONTRADICTION_RULES)으로 비교
//   3. 모순 강도(contradiction_score) 계산
//   4. 임계값 이상이면 persona_fragments에 저장

import { veilorDb } from '@/integrations/supabase/client';
import type { SexSelfScores } from './sexSelfAlgorithm';

// ── 입력 데이터 타입 ──────────────────────────────────────────────

export interface ContradictionInput {
  userId: string;

  // SexSelf 결과
  sexSelfScores?: SexSelfScores;
  sexSelfResponses?: Record<string, string>; // 원시 응답

  // VFile / user_profiles
  primaryMask?: string | null;       // "경계가 명확한 사람"
  secondaryMask?: string | null;
  primeAttachment?: string | null;   // anxious | avoidant | secure | disorganized

  // CQ 응답 (question_key → response_value)
  cqResponses?: Record<string, string>;
}

// ── 페르소나 조각 타입 ────────────────────────────────────────────

export interface PersonaFragment {
  name_ko: string;
  context_label: string;
  description: string;
  source_a_key: string;
  source_a_value: string;
  source_a_label: string;
  source_b_key: string;
  source_b_value: string;
  source_b_label: string;
  contradiction_score: number;
  contradiction_type: ContradictionType;
}

type ContradictionType = 'value_behavior' | 'self_image' | 'desire_block' | 'role_split';

// ── 모순 감지 규칙 ────────────────────────────────────────────────
// 각 규칙은 두 데이터 포인트를 비교하고 모순 강도를 반환

interface ContradictionRule {
  id: string;
  check: (input: ContradictionInput) => PersonaFragment | null;
}

// primary_mask 키워드 → 성향 매핑
const MASK_SIGNALS: Record<string, { boundary: boolean; control: boolean; rational: boolean; independent: boolean }> = {
  '경계': { boundary: true, control: false, rational: false, independent: false },
  '통제': { boundary: false, control: true, rational: false, independent: false },
  '이성': { boundary: false, control: false, rational: true, independent: false },
  '독립': { boundary: false, control: false, rational: false, independent: true },
  '강한': { boundary: true, control: true, rational: false, independent: false },
  '명확': { boundary: true, control: false, rational: true, independent: false },
  '차분': { boundary: false, control: true, rational: true, independent: false },
  '자립': { boundary: false, control: false, rational: false, independent: true },
};

function maskHas(mask: string | null | undefined, trait: 'boundary' | 'control' | 'rational' | 'independent'): boolean {
  if (!mask) return false;
  return Object.entries(MASK_SIGNALS).some(([keyword, traits]) =>
    mask.includes(keyword) && traits[trait]
  );
}

const RULES: ContradictionRule[] = [

  // ── 규칙 1: "경계 명확" 자기상 vs SexSelf 경계 표현 낮음 ──────
  {
    id: 'boundary_vs_sexself_pwr',
    check: ({ primaryMask, sexSelfScores, sexSelfResponses }) => {
      if (!primaryMask || !sexSelfScores) return null;
      if (!maskHas(primaryMask, 'boundary') && !maskHas(primaryMask, 'control')) return null;

      // SS12: "싫다고 말할 수 없다" = 10점
      const ss12 = sexSelfResponses?.SS12 ? parseFloat(sexSelfResponses.SS12) : null;
      const pwrLow = sexSelfScores.PWR < 40 || (ss12 !== null && ss12 <= 15);
      if (!pwrLow) return null;

      const score = maskHas(primaryMask, 'boundary')
        ? 1 - (sexSelfScores.PWR / 100)
        : 0.6;

      if (score < 0.45) return null;

      return {
        name_ko: '순응하는 나',
        context_label: '친밀한 관계에서',
        description: `평소 "${primaryMask}"로 자신을 정의하지만, 성적·친밀한 관계에서는 싫은 것을 말하지 못하고 참는 패턴이 있어요. Jung은 이것을 페르소나(사회적 가면) 뒤에 숨은 그림자라고 불렀어요. 일상에서 강조하는 경계가 가장 가까운 관계에서는 작동하지 않는 자아입니다.`,
        source_a_key: 'vfile.primary_mask',
        source_a_value: primaryMask,
        source_a_label: '나의 자기상 (VFile)',
        source_b_key: 'sexself.PWR',
        source_b_value: `권력·경계 점수 ${sexSelfScores.PWR}`,
        source_b_label: '친밀한 관계에서의 경계 (SexSelf)',
        contradiction_score: Math.min(score, 1),
        contradiction_type: 'value_behavior',
      };
    },
  },

  // ── 규칙 2: 욕망 억압 — 원하는 것 vs 허락된 것의 간격 ─────────
  {
    id: 'desire_gap',
    check: ({ sexSelfScores, sexSelfResponses }) => {
      if (!sexSelfScores) return null;

      // SS07: "원하는 것 중 말하지 못한 것이 있다" = 30점
      const ss07 = sexSelfResponses?.SS07 ? parseFloat(sexSelfResponses.SS07) : null;
      const desireGap = sexSelfScores.DES >= 55 && sexSelfScores.SHA < 45;
      const hasGap = ss07 !== null && ss07 <= 35;

      if (!desireGap && !hasGap) return null;

      const score = desireGap
        ? (sexSelfScores.DES / 100) * (1 - sexSelfScores.SHA / 100)
        : 0.6;

      if (score < 0.35) return null;

      return {
        name_ko: '억압된 욕망의 나',
        context_label: '혼자일 때, 또는 원할 때',
        description: `욕구와 끌림은 분명히 느끼지만, 그것을 표현하거나 허용하는 것이 막혀 있어요. "이런 걸 원하는 나는 괜찮은가"라는 질문이 반복되는 자아입니다. Brené Brown의 연구에서 수치심은 욕구를 가장 강력하게 차단하는 감정이에요. 이 자아는 억압되어 있지만 사라진 게 아니에요.`,
        source_a_key: 'sexself.DES',
        source_a_value: `욕망 점수 ${sexSelfScores.DES}`,
        source_a_label: '욕망의 실체 (SexSelf)',
        source_b_key: 'sexself.SHA',
        source_b_value: `수치심 점수 ${sexSelfScores.SHA}`,
        source_b_label: '수치심 수준 (SexSelf)',
        contradiction_score: Math.min(score, 1),
        contradiction_type: 'desire_block',
      };
    },
  },

  // ── 규칙 3: 이성적 자기상 vs 감정 중심 연결 방식 ──────────────
  {
    id: 'rational_vs_emotional_connection',
    check: ({ primaryMask, sexSelfScores, primeAttachment }) => {
      if (!sexSelfScores) return null;
      const isRational = maskHas(primaryMask, 'rational');
      const isAnxious = primeAttachment === 'anxious';

      // CON이 낮고 (감정 없이는 열리지 않음) + 이성적 자기상
      const emotionDependent = sexSelfScores.CON < 45;
      if (!emotionDependent) return null;
      if (!isRational && !isAnxious) return null;

      const score = isRational ? 0.7 : 0.55;

      return {
        name_ko: '감정에 묶인 나',
        context_label: '가까워질수록',
        description: `평소 이성적이고 감정에 흔들리지 않는다고 생각하지만, 친밀한 연결에서는 감정적 안전감 없이는 몸과 마음이 열리지 않아요. 이성이 작동하는 자아와 감정에 의존하는 자아가 분리되어 있습니다. Esther Perel은 이것을 "욕망의 역설"이라 불렀어요 — 이성이 강할수록 감정적 취약성이 더 깊은 곳에 숨어요.`,
        source_a_key: primaryMask ? 'vfile.primary_mask' : 'psychology.attachment',
        source_a_value: primaryMask ?? `애착 유형: ${primeAttachment}`,
        source_a_label: '나의 자기상',
        source_b_key: 'sexself.CON',
        source_b_value: `연결 방식 점수 ${sexSelfScores.CON}`,
        source_b_label: '감정-성 연결 방식 (SexSelf)',
        contradiction_score: score,
        contradiction_type: 'self_image',
      };
    },
  },

  // ── 규칙 4: 독립적 자기상 vs 안전 추구형 ──────────────────────
  {
    id: 'independent_vs_safety_seeking',
    check: ({ primaryMask, sexSelfScores }) => {
      if (!primaryMask || !sexSelfScores) return null;
      if (!maskHas(primaryMask, 'independent')) return null;

      const safetySeeking = sexSelfScores.CON >= 60 && sexSelfScores.DES < 45;
      if (!safetySeeking) return null;

      const score = 0.65;

      return {
        name_ko: '안전을 원하는 나',
        context_label: '연결을 원할 때',
        description: `"나는 혼자서도 충분하다"는 자기상을 유지하지만, 친밀한 관계에서는 안전감과 신뢰가 먼저 채워져야 비로소 열려요. 독립성을 강조하는 자아와 연결을 갈망하는 자아가 같은 사람 안에 있습니다. IFS에서 이것은 "관리자 파트"가 취약한 "추방자 파트"를 보호하는 구조예요.`,
        source_a_key: 'vfile.primary_mask',
        source_a_value: primaryMask,
        source_a_label: '나의 자기상 (VFile)',
        source_b_key: 'sexself.CON',
        source_b_value: `안전 추구 패턴 감지`,
        source_b_label: '연결 방식 (SexSelf)',
        contradiction_score: score,
        contradiction_type: 'role_split',
      };
    },
  },

  // ── 규칙 5: 과거 경험이 현재 패턴에 살아있음 (트라우마 연결) ───
  {
    id: 'history_pattern_active',
    check: ({ sexSelfScores, sexSelfResponses }) => {
      if (!sexSelfScores) return null;

      // SS22 (트라우마 문항): 50 이상 = 영향 있음
      const ss22 = sexSelfResponses?.SS22 ? parseFloat(sexSelfResponses.SS22) : null;
      const traumaActive = ss22 !== null && ss22 >= 50;
      const historyLow = sexSelfScores.HIS < 45;

      if (!traumaActive && !historyLow) return null;

      const score = ss22 !== null ? ss22 / 100 : 0.5;
      if (score < 0.45) return null;

      return {
        name_ko: '과거를 안고 사는 나',
        context_label: '친밀해지는 순간',
        description: `과거의 경험이 지금의 성적 패턴이나 친밀감 반응에 영향을 미치고 있어요. 이것은 과거의 내가 지금의 나를 보호하기 위해 만들어낸 반응 패턴입니다. Jack Morin의 핵심 에로틱 주제(CET) 이론에서 가장 강렬한 반응은 종종 삶의 상처에서 비롯돼요. 이 자아는 치료가 필요한 게 아니라, 이해가 필요해요.`,
        source_a_key: 'sexself.HIS',
        source_a_value: `성적 역사 점수 ${sexSelfScores.HIS}`,
        source_a_label: '성적 역사 통합도 (SexSelf)',
        source_b_key: 'sexself.SS22',
        source_b_value: `과거 경험 영향도 ${ss22 ?? '미응답'}`,
        source_b_label: '과거 경험 영향 (SexSelf Stage 3)',
        contradiction_score: Math.min(score, 1),
        contradiction_type: 'desire_block',
      };
    },
  },

  // ── 규칙 6: 판타지 수용 vs 자기 비판 ──────────────────────────
  {
    id: 'fantasy_shame_split',
    check: ({ sexSelfScores, sexSelfResponses }) => {
      if (!sexSelfScores) return null;

      // SS15: 판타지가 있음 (75 이상) + SS24: 자기 비판 (15점)
      const ss15 = sexSelfResponses?.SS15 ? parseFloat(sexSelfResponses.SS15) : null;
      const ss24 = sexSelfResponses?.SS24 ? parseFloat(sexSelfResponses.SS24) : null;
      const hasFan = (ss15 !== null && ss15 >= 70) || sexSelfScores.FAN >= 60;
      const selfCritical = ss24 !== null && ss24 <= 20;

      if (!hasFan || !selfCritical) return null;

      return {
        name_ko: '상상하는 나 / 비판하는 나',
        context_label: '혼자 상상할 때',
        description: `머릿속에는 풍부한 판타지와 상상이 있지만, 그것을 상상하는 자신을 즉시 비판해요. "이런 걸 상상하는 나는 이상하다"는 목소리가 반복됩니다. 상상하는 자아와 그것을 검열하는 자아가 분리되어 있어요. Morin은 판타지가 억압된 욕구의 신호이며, 상상과 현실은 다르다고 강조해요.`,
        source_a_key: 'sexself.FAN',
        source_a_value: `판타지 점수 ${sexSelfScores.FAN}`,
        source_a_label: '판타지 수용도 (SexSelf)',
        source_b_key: 'sexself.SS24',
        source_b_value: '판타지에 대한 자기 비판',
        source_b_label: '자기 검열 패턴 (SexSelf)',
        contradiction_score: 0.72,
        contradiction_type: 'self_image',
      };
    },
  },
];

// ── 중복 감지 방지 ────────────────────────────────────────────────

async function getExistingFragmentKeys(userId: string): Promise<Set<string>> {
  const { data } = await veilorDb
    .from('persona_fragments')
    .select('source_a_key, source_b_key')
    .eq('user_id', userId);

  const keys = new Set<string>();
  for (const row of data ?? []) {
    keys.add(`${row.source_a_key}|${row.source_b_key}`);
  }
  return keys;
}

// ── 메인 감지 함수 ────────────────────────────────────────────────

export async function detectAndSavePersonaFragments(
  input: ContradictionInput,
): Promise<PersonaFragment[]> {
  const existing = await getExistingFragmentKeys(input.userId);
  const discovered: PersonaFragment[] = [];

  for (const rule of RULES) {
    const fragment = rule.check(input);
    if (!fragment) continue;

    // 중복 체크
    const key = `${fragment.source_a_key}|${fragment.source_b_key}`;
    if (existing.has(key)) continue;

    // 최소 모순 강도 임계값 0.4
    if (fragment.contradiction_score < 0.4) continue;

    discovered.push(fragment);
  }

  if (discovered.length === 0) return [];

  // DB 저장
  const rows = discovered.map((f) => ({
    user_id: input.userId,
    ...f,
  }));

  const { error } = await veilorDb
    .from('persona_fragments')
    .insert(rows);

  if (error) {
    console.error('[persona_fragments insert]', error);
    return [];
  }

  return discovered;
}

// ── 최근 발견된 조각 조회 ─────────────────────────────────────────

export interface PersonaFragmentRow {
  id: string;
  name_ko: string;
  context_label: string;
  description: string;
  source_a_label: string;
  source_a_value: string;
  source_b_label: string;
  source_b_value: string;
  contradiction_score: number;
  contradiction_type: ContradictionType;
  is_acknowledged: boolean;
  user_reaction: string | null;
  discovered_at: string;
}

export async function getPersonaFragments(userId: string): Promise<PersonaFragmentRow[]> {
  const { data, error } = await veilorDb
    .from('persona_fragments')
    .select('id, name_ko, context_label, description, source_a_label, source_a_value, source_b_label, source_b_value, contradiction_score, contradiction_type, is_acknowledged, user_reaction, discovered_at')
    .eq('user_id', userId)
    .order('discovered_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('[persona_fragments select]', error);
    return [];
  }

  return (data ?? []) as PersonaFragmentRow[];
}

export async function acknowledgeFragment(
  fragmentId: string,
  reaction: 'resonates' | 'surprising' | 'disagree',
): Promise<void> {
  await veilorDb
    .from('persona_fragments')
    .update({
      is_acknowledged: true,
      acknowledged_at: new Date().toISOString(),
      user_reaction: reaction,
    })
    .eq('id', fragmentId);
}
