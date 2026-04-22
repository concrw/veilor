// V-NEED 12욕구 체계 — 점수 계산 + Gap 분류 알고리즘
// 근거: veilor_desire_system.md v2.0
//   Layer 1 BIO: BIO-SLP / BIO-EAT / BIO-SEX
//   Layer 2 SAF: SAF-SEC / SAF-CTL
//   Layer 3 CON: CON-BEL / CON-INT
//   Layer 4 GRW: GRW-ACH / GRW-REC / GRW-PWR
//   Layer 5 EXS: EXS-AUT / EXS-MNG
//
// Vansteenkiste & Ryan (2020): Desired / Satisfied — 독립 2차원
// ANXIETY_FROZEN 감지: BIO-SEX Satisfied -25 조정

export type NeedCode =
  | 'BIO-SLP' | 'BIO-EAT' | 'BIO-SEX'
  | 'SAF-SEC' | 'SAF-CTL'
  | 'CON-BEL' | 'CON-INT'
  | 'GRW-ACH' | 'GRW-REC' | 'GRW-PWR'
  | 'EXS-AUT' | 'EXS-MNG';

export type NeedLayer = 'BIO' | 'SAF' | 'CON' | 'GRW' | 'EXS';

export type NeedGapLevel =
  | 'FULFILLED'      // gap < 10
  | 'MILD_GAP'       // 10 ~ 29
  | 'MODERATE_GAP'   // 30 ~ 49
  | 'SEVERE_GAP';    // ≥ 50

export interface NeedResponse {
  desired: number;    // 0~100
  satisfied: number;  // 0~100
}

export type NeedResponses = Record<NeedCode, NeedResponse>;

export interface NeedGap {
  code: NeedCode;
  layer: NeedLayer;
  desired: number;
  satisfied: number;
  gap: number;
  level: NeedGapLevel;
}

export interface LayerSummary {
  layer: NeedLayer;
  avgGap: number;
  level: NeedGapLevel;
}

export interface NeedProfile {
  gaps: NeedGap[];
  top3Deficits: NeedCode[];
  bioSexAdjustment: number;   // ANXIETY_FROZEN 시 -25, 아니면 0
  isAnxietyFrozen: boolean;
  layerSummary: LayerSummary[];
}

// ── 욕구 코드 → 레이어 매핑 ────────────────────────────────────────
const NEED_LAYER_MAP: Record<NeedCode, NeedLayer> = {
  'BIO-SLP': 'BIO', 'BIO-EAT': 'BIO', 'BIO-SEX': 'BIO',
  'SAF-SEC': 'SAF', 'SAF-CTL': 'SAF',
  'CON-BEL': 'CON', 'CON-INT': 'CON',
  'GRW-ACH': 'GRW', 'GRW-REC': 'GRW', 'GRW-PWR': 'GRW',
  'EXS-AUT': 'EXS', 'EXS-MNG': 'EXS',
};

const LAYERS: NeedLayer[] = ['BIO', 'SAF', 'CON', 'GRW', 'EXS'];

// ── Gap 분류 ──────────────────────────────────────────────────────
export function computeNeedGap(desired: number, satisfied: number): NeedGapLevel {
  const gap = desired - satisfied;
  if (gap < 10) return 'FULFILLED';
  if (gap < 30) return 'MILD_GAP';
  if (gap < 50) return 'MODERATE_GAP';
  return 'SEVERE_GAP';
}

// ── ANXIETY_FROZEN 감지 (SexSelf 7축 기반) ─────────────────────────
// HIS < 35 && SHA < 35 && DES < 35 동시 조건 (veilor_desire_system.md v2.0)
export function detectAnxietyFrozenFromSexSelf(sexSelfScores?: {
  HIS: number; SHA: number; DES: number;
}): boolean {
  if (!sexSelfScores) return false;
  return sexSelfScores.HIS < 35 && sexSelfScores.SHA < 35 && sexSelfScores.DES < 35;
}

// ── 전체 욕구 프로파일 계산 ───────────────────────────────────────
export function analyzeNeedProfile(
  responses: NeedResponses,
  sexSelfScores?: { HIS: number; SHA: number; DES: number },
): NeedProfile {
  const isAnxietyFrozen = detectAnxietyFrozenFromSexSelf(sexSelfScores);
  const bioSexAdjustment = isAnxietyFrozen ? -25 : 0;

  // 12욕구 각각 gap 계산 (ANXIETY_FROZEN 시 BIO-SEX satisfied 조정)
  const gaps: NeedGap[] = (Object.keys(NEED_LAYER_MAP) as NeedCode[]).map(code => {
    const { desired, satisfied: rawSatisfied } = responses[code] ?? { desired: 50, satisfied: 50 };
    const satisfied = code === 'BIO-SEX'
      ? Math.max(0, rawSatisfied + bioSexAdjustment)
      : rawSatisfied;
    const gap = Math.max(0, desired - satisfied);
    return {
      code,
      layer: NEED_LAYER_MAP[code],
      desired,
      satisfied,
      gap,
      level: computeNeedGap(desired, satisfied),
    };
  });

  // top3Deficits: gap 내림차순 정렬 후 상위 3개
  const top3Deficits = [...gaps]
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3)
    .map(g => g.code);

  // layerSummary: 레이어별 평균 gap
  const layerSummary: LayerSummary[] = LAYERS.map(layer => {
    const layerGaps = gaps.filter(g => g.layer === layer);
    const avgGap = layerGaps.reduce((s, g) => s + g.gap, 0) / layerGaps.length;
    return { layer, avgGap: Math.round(avgGap), level: computeNeedGap(avgGap, 0) };
  });

  return { gaps, top3Deficits, bioSexAdjustment, isAnxietyFrozen, layerSummary };
}

// ── 빈 응답 초기화 헬퍼 ──────────────────────────────────────────
export function createEmptyNeedResponses(): NeedResponses {
  const codes = Object.keys(NEED_LAYER_MAP) as NeedCode[];
  return Object.fromEntries(
    codes.map(code => [code, { desired: 50, satisfied: 50 }])
  ) as NeedResponses;
}

// ── 욕구 코드 → 한국어 이름 ────────────────────────────────────────
export const NEED_LABELS: Record<NeedCode, string> = {
  'BIO-SLP': '수면',
  'BIO-EAT': '식욕',
  'BIO-SEX': '성욕',
  'SAF-SEC': '안전감',
  'SAF-CTL': '통제감',
  'CON-BEL': '소속감',
  'CON-INT': '친밀감',
  'GRW-ACH': '성취',
  'GRW-REC': '인정',
  'GRW-PWR': '영향력',
  'EXS-AUT': '자유',
  'EXS-MNG': '의미',
};

export const LAYER_LABELS: Record<NeedLayer, string> = {
  BIO: '신체',
  SAF: '안전',
  CON: '연결',
  GRW: '자기확장',
  EXS: '실존',
};

export const GAP_LEVEL_LABELS: Record<NeedGapLevel, string> = {
  FULFILLED: '충족',
  MILD_GAP: '약한 결핍',
  MODERATE_GAP: '중간 결핍',
  SEVERE_GAP: '심각한 결핍',
};

export const GAP_LEVEL_COLORS: Record<NeedGapLevel, string> = {
  FULFILLED: '#34c48b',
  MILD_GAP: '#f59e0b',
  MODERATE_GAP: '#f97316',
  SEVERE_GAP: '#ef4444',
};

// ── KOTE needGaps → NeedResponses 보정 (감정 분류 결과 통합) ─────────
// emotion-classify Edge Function에서 반환된 needGaps를 기존 설문 응답에 반영.
// 감정 신호 강도에 비례해 satisfied를 하향 조정 (최대 -20점).
export function applyEmotionNeedGaps(
  responses: NeedResponses,
  needGaps: Record<string, number>,  // { 'SAF-SEC': 0.8, 'CON-BEL': 0.6, ... }
): NeedResponses {
  if (!needGaps || Object.keys(needGaps).length === 0) return responses;

  const adjusted = { ...responses };
  for (const [gapCode, intensity] of Object.entries(needGaps)) {
    const code = gapCode as NeedCode;
    if (!(code in adjusted)) continue;
    // intensity 0~1 → satisfied 최대 -20 조정
    const delta = Math.round(Math.min(intensity, 1) * 20);
    adjusted[code] = {
      ...adjusted[code],
      satisfied: Math.max(0, adjusted[code].satisfied - delta),
    };
  }
  return adjusted;
}

// ── 감정 분류 API 호출 헬퍼 (클라이언트 사이드) ──────────────────────
export async function fetchEmotionNeedGaps(
  text: string,
  userId?: string,
  sessionId?: string,
): Promise<Record<string, number>> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const anonKey     = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    const res = await fetch(`${supabaseUrl}/functions/v1/emotion-classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ text, userId, sessionId }),
    });
    if (!res.ok) return {};
    const data = await res.json() as { needGaps?: Record<string, number> };
    return data.needGaps ?? {};
  } catch {
    return {};
  }
}
