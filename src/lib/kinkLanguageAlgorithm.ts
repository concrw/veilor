// KinkLanguage Algorithm — Phase 1
// SexSelf 7축 → SEX 3축 변환 + 취향 언어 매핑 + SHA 4 하위 유형 + ANXIETY_FROZEN 감지
//
// 근거:
//   SEX 3축 변환: veilor_sexself_kink_mapping.md §3-1 변환 공식
//   취향 언어 매핑: §4-1 ~ §4-3
//   SHA 하위 유형: §8-1 (Brené Brown + DCM)
//   ANXIETY_FROZEN: §8-3 (HIS↓ + SHA↓ + DES↓ 동시)
//   이중 통제 모델: Janssen & Bancroft (1999/2007)

import type { SexSelfScores, SexSelfProfileType } from './sexSelfAlgorithm';

// ── SEX 3축 좌표 (-1.0 ~ +1.0) ──────────────────────────────────
export interface SexAxes {
  leading: number;       // 주도(+) ↔ 복종(-). PWR 기반
  expressiveness: number; // 표현(+) ↔ 억제(-). CON·SHA·DES 가중합
  intensity: number;     // 강도(+) ↔ 온화(-). FAN·DES·PWR 가중합
}

// ── SHA 4 하위 유형 ────────────────────────────────────────────
export type ShaSubtype =
  | 'PERFORMANCE'    // 수행 수치심 — "충분히 잘하지 못할까봐"
  | 'BODY'           // 신체 수치심 — "내 몸이 아름답지 않을까봐"
  | 'NON_TRADITIONAL' // 비전통 수치심 — "이런 걸 원하는 게 이상한 걸까봐"
  | 'INEXPERIENCE'   // 경험 수치심 — "경험이 없어서/적어서 창피한"
  | 'LOW';           // SIS 낮음 — 수치심 브레이크 약함

// ── 취향 언어 결과 구조 ──────────────────────────────────────────
export interface KinkLanguageResult {
  sexAxes: SexAxes;
  roleLabel: string;        // "Dom" | "Dom-leaning" | "Switch" | "Sub-leaning" | "Sub"
  intensityLabel: string;   // "Vanilla" | "Soft Kink" | "Moderate Kink" | "Hard Kink" | "Edge Play"
  expressLabel: string;     // "Vocal/Expressive" | "Communicative" | "Balanced" | "Non-verbal" | "Internal/Quiet"
  kinkTags: string[];       // 3개 이하 취향 언어 태그
  summaryText: string;      // 종합 문장
  eroticEmotions: string[]; // 에로틱 정서 언어 1~2개
  shaSubtype: ShaSubtype;   // SHA 하위 유형
  isAnxietyFrozen: boolean; // ANXIETY_FROZEN 패턴 감지 여부
}

// ── Step 1: SexSelf 7축 → SEX 3축 변환 ──────────────────────────
// veilor_sexself_kink_mapping.md §3-1 공식 그대로
export function convertToSexAxes(scores: SexSelfScores): SexAxes {
  const leading = (scores.PWR - 50) / 50;

  const expRaw = (scores.CON * 0.5 + scores.SHA * 0.3 + scores.DES * 0.2 - 50) / 50;
  const expressiveness = Math.max(-1, Math.min(1, expRaw));

  const intRaw = (scores.FAN * 0.5 + scores.DES * 0.3 + scores.PWR * 0.2 - 50) / 50;
  const intensity = Math.max(-1, Math.min(1, intRaw));

  return {
    leading: Math.max(-1, Math.min(1, leading)),
    expressiveness,
    intensity,
  };
}

// ── Step 2: Leading 축 → 역할 레이블 ────────────────────────────
function getRoleLabel(leading: number): string {
  if (leading >= 0.7) return 'Dom';
  if (leading >= 0.4) return 'Dom-leaning';
  if (leading >= -0.3) return 'Switch';
  if (leading >= -0.7) return 'Sub-leaning';
  return 'Sub';
}

// ── Step 3: Intensity 축 → 강도 레이블 ──────────────────────────
function getIntensityLabel(intensity: number): string {
  if (intensity >= 0.8) return 'Edge Play';
  if (intensity >= 0.5) return 'Hard Kink';
  if (intensity >= 0.2) return 'Moderate Kink';
  if (intensity >= -0.2) return 'Soft Kink';
  return 'Vanilla';
}

// ── Step 4: Expressiveness 축 → 표현 레이블 ─────────────────────
function getExpressLabel(expressiveness: number): string {
  if (expressiveness >= 0.6) return 'Vocal/Expressive';
  if (expressiveness >= 0.2) return 'Communicative';
  if (expressiveness >= -0.2) return 'Balanced';
  if (expressiveness >= -0.6) return 'Non-verbal';
  return 'Internal/Quiet';
}

// ── Step 5: 3축 조합 → 취향 언어 태그 (최대 3개) ─────────────────
function getKinkTags(axes: SexAxes, scores: SexSelfScores): string[] {
  const tags: string[] = [];

  // Leading 축 기반
  if (axes.leading >= 0.7) tags.push('Dom');
  else if (axes.leading <= -0.7) tags.push('Sub');
  else if (Math.abs(axes.leading) <= 0.3) tags.push('Switch');

  // Intensity 축 기반
  if (axes.intensity >= 0.8) tags.push('Edge Play');
  else if (axes.intensity >= 0.5) {
    if (axes.leading <= -0.3 && scores.FAN >= 65) tags.push('Primal Sub');
    else tags.push('Impact Play');
  } else if (axes.intensity >= 0.2) {
    if (scores.FAN >= 60 && scores.SHA >= 55) tags.push('Role Play');
    if (scores.BDY >= 65) tags.push('Sensation Play');
    if (axes.leading >= 0.4 || axes.leading <= -0.4) tags.push('Rope Bondage');
  }

  // Expressiveness 축 기반
  if (axes.expressiveness >= 0.6) {
    if (axes.leading <= -0.3) tags.push('Praise Kink');
    else tags.push('Dirty Talk');
  } else if (axes.expressiveness <= -0.5) {
    tags.push('Voyeurism');
  }

  // Vanilla 결과 처리 — 태그 없이 안전한 레이블만
  if (axes.intensity <= -0.2 && tags.length === 0) {
    tags.push('Vanilla');
  }

  // 중복 제거 후 최대 3개
  return [...new Set(tags)].slice(0, 3);
}

// ── Step 6: 에로틱 정서 언어 (1~2개) ────────────────────────────
function getEroticEmotions(axes: SexAxes, scores: SexSelfScores): string[] {
  const emotions: string[] = [];

  if (axes.leading >= 0.5 && scores.DES >= 60) emotions.push('지배 쾌감');
  if (axes.leading <= -0.5 && scores.CON >= 55) emotions.push('보호받음');
  if (axes.leading <= -0.3 && axes.intensity >= 0.3) emotions.push('무기력함의 해방');
  if (scores.FAN >= 70 && axes.intensity >= 0.5) emotions.push('야성');
  if (axes.expressiveness <= -0.5) emotions.push('내향적 관찰');
  if (scores.DES >= 70 && scores.FAN >= 70) emotions.push('욕망 강도');
  if (axes.intensity <= -0.2) emotions.push('정서적 연결');

  return emotions.slice(0, 2);
}

// ── Step 7: SHA 4 하위 유형 분류 ────────────────────────────────
// SHA가 낮을 때(브레이크 강함) 어떤 종류의 수치심인지 추론
// BDY 축과 HIS 축, FAN 축을 보조 신호로 활용
export function classifyShaSubtype(scores: SexSelfScores): ShaSubtype {
  if (scores.SHA >= 60) return 'LOW'; // 수치심 브레이크 낮음

  // 신체 수치심: BDY 낮고 SHA도 낮음
  if (scores.BDY < 45 && scores.SHA < 50) return 'BODY';

  // 비전통 수치심: FAN이 있는데 SHA 낮음 (취향 자체에 수치 느낌)
  if (scores.FAN >= 45 && scores.SHA < 45) return 'NON_TRADITIONAL';

  // 경험 수치심: HIS 낮고 SHA 낮음
  if (scores.HIS < 45 && scores.SHA < 50) return 'INEXPERIENCE';

  // 수행 수치심: DES 있는데 SHA 낮음 (기본값 — 반응 기대 불안)
  return 'PERFORMANCE';
}

// ── Step 8: ANXIETY_FROZEN 감지 ─────────────────────────────────
// sexSelfAlgorithm.ts classifyProfile()과 동일 임계값 사용
export function detectAnxietyFrozen(scores: SexSelfScores): boolean {
  return scores.HIS < 35 && scores.SHA < 35 && scores.DES < 35;
}

// ── Step 9: 종합 문장 생성 ───────────────────────────────────────
function buildSummaryText(
  roleLabel: string,
  expressLabel: string,
  intensityLabel: string,
  eroticEmotions: string[],
  isAnxietyFrozen: boolean,
): string {
  if (isAnxietyFrozen) {
    return '지금은 취향 언어보다 먼저 안전함이 필요한 상태예요. 이것은 욕구의 부재가 아니라 시스템이 스스로를 보호하는 신호입니다.';
  }

  if (intensityLabel === 'Vanilla') {
    return `당신의 성적 에너지는 정서적 연결과 신뢰에서 가장 잘 활성화됩니다(Vanilla). ${expressLabel} 방식으로 파트너와 깊이 연결될 때 충족감을 느낍니다. 이것은 풍부하고 완전한 성적 자아의 한 형태입니다.`;
  }

  const emotionPart = eroticEmotions.length > 0
    ? ` 당신의 에로틱 에너지는 '${eroticEmotions.join('\'과 \'')}\'에서 옵니다.`
    : '';

  return `당신은 ${roleLabel} 성향이며, ${expressLabel} 방식으로 소통하고, ${intensityLabel} 수준의 경험에서 가장 활성화됩니다.${emotionPart}`;
}

// ── 메인 함수 ────────────────────────────────────────────────────
export function computeKinkLanguage(
  scores: SexSelfScores,
  profileType: SexSelfProfileType,
): KinkLanguageResult {
  const isAnxietyFrozen = detectAnxietyFrozen(scores) || profileType === 'ANXIETY_FROZEN';
  const sexAxes = convertToSexAxes(scores);

  const roleLabel = getRoleLabel(sexAxes.leading);
  const intensityLabel = getIntensityLabel(sexAxes.intensity);
  const expressLabel = getExpressLabel(sexAxes.expressiveness);

  // ANXIETY_FROZEN이면 취향 태그·에로틱 정서 비생성
  const kinkTags = isAnxietyFrozen ? [] : getKinkTags(sexAxes, scores);
  const eroticEmotions = isAnxietyFrozen ? [] : getEroticEmotions(sexAxes, scores);

  const shaSubtype = classifyShaSubtype(scores);
  const summaryText = buildSummaryText(roleLabel, expressLabel, intensityLabel, eroticEmotions, isAnxietyFrozen);

  return {
    sexAxes,
    roleLabel,
    intensityLabel,
    expressLabel,
    kinkTags,
    summaryText,
    eroticEmotions,
    shaSubtype,
    isAnxietyFrozen,
  };
}
