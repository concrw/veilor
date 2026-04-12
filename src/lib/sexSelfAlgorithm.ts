// SexSelf 알고리즘 (v3)
// 7축 점수 → SexSelf 프로파일 타입 → 인사이트 + 심리 원인 분석
// 근거: Nagoski 듀얼 컨트롤 + Brené Brown + Jack Morin CET + Esther Perel

import type { SexSelfAxis } from '@/data/sexSelfQuestions';
import { SEX_SELF_QUESTIONS } from '@/data/sexSelfQuestions';

// ── 7축 점수 ────────────────────────────────────────────────────
export interface SexSelfScores {
  DES: number; // 욕망의 실체 (0~100, 높을수록 욕구 명확)
  SHA: number; // 수치심 (0~100, 높을수록 수치심 낮음 = 건강)
  PWR: number; // 권력·통제 역학 (0~100, 높을수록 개방적)
  BDY: number; // 몸과의 관계 (0~100)
  HIS: number; // 성적 역사 통합도 (0~100)
  FAN: number; // 판타지 수용도 (0~100)
  CON: number; // 연결 방식 다양성 (0~100)
}

// ── 8가지 프로파일 ─────────────────────────────────────────────
export type SexSelfProfileType =
  | 'OPEN_EXPRESSIVE'     // DES↑ SHA↑ FAN↑ — 욕구를 자연스럽게 표현
  | 'RESPONSIVE'          // DES↑ SHA↑ CON↑ — 반응형 욕구, 조건이 맞으면 풍부
  | 'SUPPRESSED'          // DES↑ SHA↓       — 욕구는 있지만 수치심이 막음
  | 'DORMANT'             // DES↓ SHA↓       — 욕구 자체가 잠들어 있음
  | 'SHAME_BLOCKED'       // DES↑ SHA↓ HIS↑  — 역사적 상처 + 수치심이 주요 차단
  | 'SAFETY_SEEKING'      // CON↑ DES↓       — 안전감이 욕구보다 먼저
  | 'EXPLORING'           // HIS↑ FAN↑       — 패턴 인식 높고 탐색 의지 강함
  | 'BUILDING_AWARENESS'; // 전반 중간값 — 인식 형성 중

export interface SexSelfProfile {
  type: SexSelfProfileType;
  nameKo: string;
  tagline: string;
  description: string;
  coreWoundLink: string;
  brakeFactors: string[];
  growthEdge: string;
  color: string;
}

const PROFILES: Record<SexSelfProfileType, SexSelfProfile> = {
  OPEN_EXPRESSIVE: {
    type: 'OPEN_EXPRESSIVE',
    nameKo: '열린 표현형',
    tagline: '욕구를 자연스럽게 인식하고 표현합니다',
    description: '성적 욕구가 자연스럽게 올라오고, 수치심이 낮으며, 자신의 판타지와 욕구를 비교적 편안하게 수용하는 상태입니다. 억제 요인도 낮아 다양한 조건에서 연결감을 느낄 수 있습니다. 당신의 과제는 이 개방성을 상대방의 속도와 조율하는 것입니다.',
    coreWoundLink: '초기 성 교육에서 긍정적 메시지를 받았거나, 수용적인 관계 경험이 있을 가능성이 높습니다.',
    brakeFactors: ['과도한 파트너 의존', '성과 압박'],
    growthEdge: '자신의 개방성을 파트너에게 압박으로 전달하지 않는 균형 연습',
    color: '#10b981',
  },
  RESPONSIVE: {
    type: 'RESPONSIVE',
    nameKo: '반응형',
    tagline: '조건이 맞으면 풍부하게 반응합니다',
    description: '자발적 욕구(spontaneous desire)보다 반응적 욕구(responsive desire)가 강한 유형입니다. 먼저 감각과 친밀감이 제공될 때 욕구가 뒤따라 올라옵니다. 이것은 결함이 아니라 — Emily Nagoski의 연구에 따르면 많은 사람에게 자연스러운 방식입니다. 당신에게 필요한 것은 "먼저 시작해야 한다"는 압박을 내려놓는 것입니다.',
    coreWoundLink: '"먼저 원해야 정상이다"는 잘못된 기준을 내면화했을 가능성이 있습니다.',
    brakeFactors: ['자발적 욕구 부재에 대한 불안', '성과 기대'],
    growthEdge: '반응적 욕구를 있는 그대로 수용하고 파트너에게 설명하는 연습',
    color: '#3b82f6',
  },
  SUPPRESSED: {
    type: 'SUPPRESSED',
    nameKo: '억압형',
    tagline: '욕구는 있지만 표현이 막혀 있습니다',
    description: '성적 욕구와 끌림은 분명히 있지만, 수치심이나 과거 메시지로 인해 표현하거나 허용하는 것이 어렵습니다. "이런 걸 원하면 안 된다"거나 "이건 더러운 것"이라는 내면화된 목소리가 욕구를 막고 있습니다. 억압이 장기화되면 욕구 자체가 사라지는 것처럼 느껴질 수 있습니다.',
    coreWoundLink: '성에 대한 부정적 메시지를 어린 시절 가정이나 사회에서 강하게 받았을 가능성이 높습니다.',
    brakeFactors: ['수치심', '내면화된 금기', '종교적·문화적 억압'],
    growthEdge: '욕구를 느끼는 것 자체가 괜찮다는 비판단적 자기 허용부터 시작하기',
    color: '#f59e0b',
  },
  DORMANT: {
    type: 'DORMANT',
    nameKo: '잠재형',
    tagline: '성적 에너지가 깊이 잠들어 있습니다',
    description: '현재 성적 욕구가 거의 느껴지지 않고, 친밀감에 대한 관심 자체가 낮은 상태입니다. 이것은 무성애(asexuality) 스펙트럼일 수도 있고, 장기 스트레스·우울·트라우마로 인한 일시적 상태일 수도 있습니다. 어느 쪽이든 "고쳐야 할 결함"이 아닙니다.',
    coreWoundLink: '장기 소진, 관계 트라우마, 또는 원래부터 성적 욕구가 낮은 무성애 스펙트럼일 수 있습니다.',
    brakeFactors: ['만성 피로/소진', '트라우마 영향', '관계 안전감 부재'],
    growthEdge: '"욕구가 없는 나"를 결함으로 보지 않고, 지금 상태를 이해하는 자기 탐색',
    color: '#6366f1',
  },
  SHAME_BLOCKED: {
    type: 'SHAME_BLOCKED',
    nameKo: '수치심 차단형',
    tagline: '욕구는 있지만 수치심과 과거 상처가 가로막습니다',
    description: '성적 욕구도 있고 자신의 역사적 패턴도 어느 정도 인식하지만, 수치심이라는 내면의 목소리가 연결을 차단합니다. "원하는 게 들키면 어떡하지", "이상하게 볼까봐" 같은 생각들이 반복됩니다. Brené Brown의 연구에서 수치심은 연결을 가장 강력하게 방해하는 감정입니다.',
    coreWoundLink: '인정받기 위해 욕구를 숨겨야 했던 경험, 또는 욕구를 드러냈을 때 비판받은 경험이 핵심 상처일 수 있습니다.',
    brakeFactors: ['수치심', '거절 공포', '노출 불안'],
    growthEdge: '수치심을 느끼는 순간을 알아차리고, 신뢰하는 한 사람에게 작은 욕구부터 표현해 보기',
    color: '#ec4899',
  },
  SAFETY_SEEKING: {
    type: 'SAFETY_SEEKING',
    nameKo: '안전 추구형',
    tagline: '안전감과 신뢰가 욕구보다 먼저입니다',
    description: '성적 연결감은 충분한 안전감과 신뢰가 전제될 때만 가능합니다. 억제(SIS)가 강하고 안전 신호가 작동해야만 가속(SES)이 시작됩니다. 이것은 애착 불안이나 과거의 상처가 성적 영역에도 반영된 것으로, 관계의 질과 친밀감이 쌓이면 자연스럽게 열릴 수 있습니다.',
    coreWoundLink: '애착 불안, 또는 과거 관계에서 안전하지 않은 경험이 성적 영역에도 영향을 미치고 있을 가능성이 높습니다.',
    brakeFactors: ['신뢰 부재', '애착 불안', '관계 안전감 결핍'],
    growthEdge: '성적 연결 전에 감정적 안전감 먼저 구축하고, 그 필요를 파트너에게 언어로 전달하기',
    color: '#14b8a6',
  },
  EXPLORING: {
    type: 'EXPLORING',
    nameKo: '탐색형',
    tagline: '자신을 알아가는 여정 위에 있습니다',
    description: '자신이 성적으로 어떤 존재인지 궁금하고, 패턴의 원인을 찾고 싶은 동기가 강합니다. 과거 경험과 현재 패턴의 연결고리를 인식하고 있으며, 판타지를 탐색하는 능력도 있습니다. 이 탐색 의지 자체가 이미 중요한 시작입니다.',
    coreWoundLink: '자기 이해가 형성되는 단계이거나, 과거 억압으로 인해 자기 탐색이 늦어진 경우일 수 있습니다.',
    brakeFactors: ['답을 빨리 찾아야 한다는 압박', '비교'],
    growthEdge: '정답 없이 탐색하는 것을 허용하기. SexSelf 세션을 반복하며 패턴 발견하기',
    color: '#8b5cf6',
  },
  BUILDING_AWARENESS: {
    type: 'BUILDING_AWARENESS',
    nameKo: '인식 형성 중',
    tagline: '모든 축에서 자기 이해를 쌓아가는 중입니다',
    description: '아직 자신의 성적 패턴이나 욕구, 억제 요인에 대한 인식이 형성되는 단계입니다. 이 진단이 자기 탐색의 시작점이 될 수 있습니다. 틀린 답은 없습니다 — 지금 어디 있든 그것이 출발점입니다.',
    coreWoundLink: '아직 탐색 전 단계. 성적 자아에 대해 생각해볼 기회가 없었거나 억압되어 있을 수 있습니다.',
    brakeFactors: ['자기 인식 부재', '탐색 기회 결핍'],
    growthEdge: 'SexSelf 세션을 반복하며 조금씩 자신의 패턴을 발견해 나가기',
    color: '#94a3b8',
  },
};

// ── 점수 계산 (7축) ────────────────────────────────────────────

export function computeSexSelfScores(
  responses: Record<string, string>,
): SexSelfScores {
  // SEX_SELF_QUESTIONS에서 축·반전 정보 직접 가져옴
  const axisMap: Record<string, { axis: SexSelfAxis; reversed: boolean }> = {};
  for (const q of SEX_SELF_QUESTIONS) {
    axisMap[q.id] = { axis: q.axis, reversed: q.reversed };
  }

  const sums: Record<SexSelfAxis, number[]> = {
    DES: [], SHA: [], PWR: [], BDY: [], HIS: [], FAN: [], CON: [],
  };

  for (const [qid, val] of Object.entries(responses)) {
    const meta = axisMap[qid];
    if (!meta) continue;
    let score = parseFloat(val);
    if (isNaN(score)) continue;
    if (meta.reversed) score = 100 - score;
    sums[meta.axis].push(score);
  }

  const avg = (arr: number[]) =>
    arr.length === 0 ? 50 : Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

  return {
    DES: avg(sums.DES),
    SHA: avg(sums.SHA),
    PWR: avg(sums.PWR),
    BDY: avg(sums.BDY),
    HIS: avg(sums.HIS),
    FAN: avg(sums.FAN),
    CON: avg(sums.CON),
  };
}

// ── 프로파일 분류 ──────────────────────────────────────────────

// 프로파일 분류 룩업 — '욕구높음|수치심건강|판타지수용|연결중심|역사인식' 비트맵
const PROFILE_MAP: [boolean, boolean, boolean, boolean, boolean, SexSelfProfileType][] = [
  // des  sha   fan   con   his
  [true,  true,  true,  false, false, 'OPEN_EXPRESSIVE'],
  [true,  true,  false, true,  false, 'RESPONSIVE'],
  [true,  true,  false, false, false, 'RESPONSIVE'],
  [true,  false, false, false, true,  'SHAME_BLOCKED'],
  [true,  false, false, false, false, 'SUPPRESSED'],
  [false, false, false, true,  false, 'SAFETY_SEEKING'],
  [false, false, false, false, false, 'DORMANT'],
];

export function classifyProfile(scores: SexSelfScores): SexSelfProfileType {
  const desHigh = scores.DES >= 60;
  const shaHigh = scores.SHA >= 60;
  const fanHigh = scores.FAN >= 60;
  const conHigh = scores.CON >= 60;
  const hisHigh = scores.HIS >= 60;

  if (hisHigh && fanHigh && scores.DES >= 50) return 'EXPLORING';

  for (const [d, s, f, c, h, type] of PROFILE_MAP) {
    if (desHigh === d && shaHigh === s && fanHigh === f && conHigh === c && hisHigh === h) {
      return type;
    }
  }

  return 'BUILDING_AWARENESS';
}

// ── 인사이트 생성 ──────────────────────────────────────────────

function desireInsight(des: number): string {
  if (des < 35) return '현재 성적 욕구가 거의 느껴지지 않는 상태예요. 이것은 무성애 스펙트럼일 수도 있고, 스트레스·소진·트라우마의 영향일 수도 있어요.';
  if (des < 60) return '욕구가 일부 있지만 그것을 온전히 허용하거나 인식하는 것이 어려운 상태예요.';
  return '성적 욕구와 끌림이 비교적 명확하게 느껴지는 상태예요.';
}

function shameInsight(sha: number): string {
  if (sha < 35) return '수치심이 성적 표현을 강하게 막고 있어요. "이런 걸 원하는 나는 이상한가"라는 내면의 목소리를 알아차리는 것이 시작이에요.';
  if (sha < 60) return '수치심이 일부 있어요. 신뢰하는 한 사람에게 작은 욕구부터 표현해 보는 연습이 도움이 될 수 있어요.';
  return '수치심이 낮고 자신의 욕구를 비교적 자연스럽게 받아들이는 편이에요.';
}

function pwrInsight(pwr: number): string {
  if (pwr < 40) return '권력·통제 역학에 대해 불편함이나 불안이 있어요. 주도와 복종 사이의 자신의 선호를 천천히 탐색해 보는 것이 도움이 될 수 있어요.';
  if (pwr < 65) return '역할 역학에 대한 탐색이 진행 중이에요.';
  return '주도와 내맡김 사이의 역학을 편안하게 탐색할 수 있는 상태예요.';
}

export function generateSexSelfInsights(
  scores: SexSelfScores,
  profile: SexSelfProfile,
  attachmentStyle?: string,
  coreWound?: string,
): string[] {
  const insights: string[] = [];

  // 1번: 프로파일 핵심 설명
  insights.push(profile.description);

  // 2번: 욕구 + 수치심 분석
  const des = desireInsight(scores.DES);
  const sha = shameInsight(scores.SHA);
  insights.push(`${des} ${sha}`);

  // 3번: 권력·통제 + 신체 연결
  const pwr = pwrInsight(scores.PWR);
  const bdyNote = scores.BDY < 45
    ? ' 신체와의 연결감도 아직 형성 중이에요 — 성적 맥락 밖에서 자기 몸을 탐색하는 것부터 시작할 수 있어요.'
    : '';
  insights.push(`${pwr}${bdyNote}`);

  // 4번: 심리 연결 (psychology 컬럼 연동 시 개인화)
  if (attachmentStyle && coreWound) {
    const attachMap: Record<string, string> = {
      anxious: '불안 애착 패턴은 성적 친밀감에서도 나타나요 — 상대가 원하는지 확인하고 싶은 욕구, 거절받을 것 같은 두려움이 성적 표현을 위축시킬 수 있어요.',
      avoidant: '회피 애착 패턴은 성적 친밀감에서도 거리 두기로 나타날 수 있어요 — 너무 가까워지면 통제력을 잃을 것 같은 느낌이 브레이크로 작용할 수 있어요.',
      disorganized: '혼란 애착 패턴은 "원하지만 두렵다"는 이중적 경험을 만들 수 있어요 — 친밀해질수록 두렵고, 멀어지면 공허한 역설이 성적 영역에도 반영되고 있을 수 있어요.',
      secure: '안정 애착이 기반이 되어 성적 친밀감에서도 비교적 편안한 연결이 가능해요.',
    };
    const attachInsight = attachMap[attachmentStyle] ?? '';
    if (attachInsight) {
      insights.push(`심리 연결: ${attachInsight}\n\n핵심 상처와 연결: ${profile.coreWoundLink}`);
    } else {
      insights.push(`원인 탐색: ${profile.coreWoundLink}`);
    }
  } else {
    insights.push(`원인 탐색: ${profile.coreWoundLink}`);
  }

  // 5번: 성장 과제
  insights.push(`지금 당신의 성장 과제: ${profile.growthEdge}`);

  return insights;
}

// ── 메인 진단 함수 ─────────────────────────────────────────────

export interface SexSelfResult {
  scores: SexSelfScores;
  profile: SexSelfProfile;
  profileType: SexSelfProfileType;
  insights: string[];
  radarData: { axis: string; value: number }[];
  completedAt: string;
}

export function runSexSelfDiagnosis(
  responses: Record<string, string>,
  attachmentStyle?: string,
  coreWound?: string,
): SexSelfResult {
  const scores = computeSexSelfScores(responses);
  const profileType = classifyProfile(scores);
  const profile = PROFILES[profileType];
  const insights = generateSexSelfInsights(scores, profile, attachmentStyle, coreWound);

  const radarData = [
    { axis: '욕망', value: scores.DES },
    { axis: '수치심↓', value: scores.SHA },
    { axis: '권력역학', value: scores.PWR },
    { axis: '신체연결', value: scores.BDY },
    { axis: '판타지', value: scores.FAN },
  ];

  return {
    scores,
    profile,
    profileType,
    insights,
    radarData,
    completedAt: new Date().toISOString(),
  };
}

export { PROFILES as SEX_SELF_PROFILES };
