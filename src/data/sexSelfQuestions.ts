// SexSelf — 성적 자아 심층 진단 문항 (v3 — 적응형 단계 시스템)
//
// 3단계 적응형 구조:
//   Stage 1 (depth_level: 1) — 비위협적 게이트웨이 질문 (7문항)
//                              결과에 따라 Stage 2 진입 여부 결정
//   Stage 2 (depth_level: 2) — 중층 탐색 (10문항)
//                              개방성이 높으면 Stage 3 진입
//   Stage 3 (depth_level: 3) — 가장 깊은 층 (8문항)
//                              자발적으로 탐색하기로 선택한 사람만 도달
//
// unlock_threshold: Stage 1/2 마지막 문항 이후 다음 단계 진입 기준 점수 (0~100)
//   Stage 1 → Stage 2: 평균 개방성 점수 ≥ 45 면 Stage 2 자동 진입
//                       < 45 이면 "여기서 마칠 수 있어요" 선택지 제공
//   Stage 2 → Stage 3: 평균 ≥ 60 이면 Stage 3 진입 여부 묻는 안내 표시
//
// 7개 축:
//   DES  — 욕망의 실체
//   SHA  — 수치심의 뿌리
//   PWR  — 권력·통제 역학
//   BDY  — 몸과의 관계
//   HIS  — 성적 역사
//   FAN  — 판타지·금기
//   CON  — 연결 방식
//
// 근거: Jack Morin CET + Esther Perel + Nagoski SES/SIS +
//       Brené Brown + Masters & Johnson

export type SexSelfAxis = 'DES' | 'SHA' | 'PWR' | 'BDY' | 'HIS' | 'FAN' | 'CON';
export type SexSelfQuestionType = 'scenario' | 'slider' | 'binary' | 'open';
export type SexSelfDepthLevel = 1 | 2 | 3;

export interface SexSelfQuestion {
  id: string;
  type: SexSelfQuestionType;
  axis: SexSelfAxis;
  reversed: boolean;
  depth_level: SexSelfDepthLevel;
  question: string;
  subtext?: string;
  depth_warning?: string;   // 트라우마 인폼드 안내
  choices?: { label: string; score: number }[];
  sliderMin?: string;
  sliderMax?: string;
}

// ══════════════════════════════════════════════════════════════
// STAGE 1 — 게이트웨이 (7문항)
// 비위협적, 자기 인식 탐색 수준
// 이 단계의 평균 openness 점수로 Stage 2 진입 여부 결정
// ══════════════════════════════════════════════════════════════

const STAGE_1: SexSelfQuestion[] = [
  {
    id: 'SS01', type: 'scenario', axis: 'DES', reversed: false, depth_level: 1,
    question: '성적으로 끌리는 감정이 생길 때 — 그 끌림은 주로 어디서 시작되는가?',
    subtext: '솔직하게 — 정답은 없어요.',
    choices: [
      { label: '시각적 자극 (외모, 몸, 눈빛)', score: 70 },
      { label: '청각·언어적 자극 (목소리, 말투, 대화)', score: 70 },
      { label: '감정적 연결 (이해받는다는 느낌)', score: 70 },
      { label: '상황·분위기·긴장감', score: 70 },
    ],
  },
  {
    id: 'SS02', type: 'slider', axis: 'DES', reversed: false, depth_level: 1,
    question: '나는 지금 이 순간 자신이 "성적 존재"라는 것을 온전히 느끼고 있다.',
    subtext: '이상적 상태가 아니라 지금 현재를 답해 주세요.',
    sliderMin: '전혀 느끼지 못한다', sliderMax: '완전히 살아있다',
  },
  {
    id: 'SS03', type: 'binary', axis: 'SHA', reversed: true, depth_level: 1,
    question: '내 성적 욕구나 관심에 대해 "이러면 안 되는데" 하는 느낌이 따라오는 편인가?',
    choices: [
      { label: '그런 느낌이 자주 따라온다', score: 20 },
      { label: '별로 없다. 비교적 자연스럽다', score: 85 },
    ],
  },
  {
    id: 'SS04', type: 'scenario', axis: 'CON', reversed: false, depth_level: 1,
    question: '성적 친밀감을 가질 때 내게 가장 중요한 것은?',
    choices: [
      { label: '충분한 감정적 안전감과 신뢰', score: 65 },
      { label: '상대방이 나를 진심으로 원한다는 확신', score: 75 },
      { label: '신체적 감각과 쾌락 그 자체', score: 80 },
      { label: '일상을 벗어나는 새로움·모험', score: 75 },
    ],
  },
  {
    id: 'SS05', type: 'slider', axis: 'BDY', reversed: false, depth_level: 1,
    question: '나는 내 몸을 — 성적인 맥락 밖에서도 — 긍정적으로 느낀다.',
    subtext: '외모 평가와 무관하게, 신체 존재 자체로서.',
    sliderMin: '거의 그렇지 않다', sliderMax: '자연스럽게 느낀다',
  },
  {
    id: 'SS06', type: 'scenario', axis: 'PWR', reversed: false, depth_level: 1,
    question: '성적인 관계에서 나는 어느 쪽에 더 에너지가 살아나는가?',
    choices: [
      { label: '이끌고 주도하는 역할', score: 80 },
      { label: '상대에게 완전히 내맡기는 역할', score: 80 },
      { label: '상황마다 달라지고, 그 전환이 흥미롭다', score: 85 },
      { label: '역할에 대해 생각해본 적 없거나 불편하다', score: 25 },
    ],
  },
  {
    id: 'SS07', type: 'binary', axis: 'DES', reversed: false, depth_level: 1,
    question: '내가 실제로 원하는 것과 "원해도 된다고 허락된 것" 사이에 간격이 있다고 느끼는가?',
    subtext: '이것은 억압의 핵심 질문입니다.',
    choices: [
      { label: '그 간격이 있다. 말하지 못한 것이 있다', score: 30 },
      { label: '별로 없다. 원하는 것을 대체로 표현하며 산다', score: 90 },
    ],
  },
];

// ══════════════════════════════════════════════════════════════
// STAGE 2 — 중층 탐색 (10문항)
// Stage 1 평균 openness ≥ 45 이면 진입
// ══════════════════════════════════════════════════════════════

const STAGE_2: SexSelfQuestion[] = [
  {
    id: 'SS08', type: 'scenario', axis: 'SHA', reversed: true, depth_level: 2,
    question: '처음으로 성적인 감정을 느꼈을 때, 주변 환경(가정·학교·종교)의 반응은?',
    depth_warning: '과거 기억을 떠올리는 문항입니다. 불편하면 건너뛰어도 괜찮아요.',
    subtext: '그때 받은 메시지가 지금의 나를 만들었을 수 있어요.',
    choices: [
      { label: '부끄럽고 나쁜 것이라는 메시지를 받았다', score: 5 },
      { label: '없다는 듯 완전히 무시되거나 침묵됐다', score: 15 },
      { label: '"결혼 후에", "때가 되면"이라는 조건부 허락이었다', score: 35 },
      { label: '비교적 자연스럽게 받아들여졌다', score: 80 },
    ],
  },
  {
    id: 'SS09', type: 'scenario', axis: 'SHA', reversed: true, depth_level: 2,
    question: '자신의 성적 취향 중 "이건 이상한 게 아닐까" 하고 혼자 숨겨온 것이 있는가?',
    subtext: '구체적으로 쓰지 않아도 됩니다. 존재 여부만.',
    choices: [
      { label: '있다. 누구에게도 말한 적 없다', score: 10 },
      { label: '있다. 아주 가까운 한 사람에게는 말했다', score: 40 },
      { label: '있었지만 지금은 자연스럽다는 것을 안다', score: 75 },
      { label: '그런 것이 없다', score: 90 },
    ],
  },
  {
    id: 'SS10', type: 'slider', axis: 'PWR', reversed: false, depth_level: 2,
    question: '완전히 통제를 내려놓고 상대에게 맡기는 상상을 할 때 — 느껴지는 감정은?',
    subtext: '불안·흥분·혐오·호기심 — 어느 방향이든 솔직하게.',
    sliderMin: '강한 불안이나 거부감', sliderMax: '강한 흥미나 흥분',
  },
  {
    id: 'SS11', type: 'slider', axis: 'PWR', reversed: false, depth_level: 2,
    question: '반대로 — 상대를 완전히 내 의도대로 이끌고 상대가 반응하는 상상을 할 때 느껴지는 감정은?',
    sliderMin: '강한 불안이나 거부감', sliderMax: '강한 흥미나 흥분',
  },
  {
    id: 'SS12', type: 'binary', axis: 'PWR', reversed: false, depth_level: 2,
    question: '성적인 상황에서 "지금 이건 싫다"고 말하는 것이...',
    choices: [
      { label: '분위기를 깨거나 상대를 실망시킬 것 같아서 그냥 참는 편이다', score: 10 },
      { label: '당연한 권리이고 말할 수 있다', score: 90 },
    ],
  },
  {
    id: 'SS13', type: 'scenario', axis: 'BDY', reversed: false, depth_level: 2,
    question: '성적인 순간에 내 몸은...',
    subtext: 'Masters & Johnson: 신체 반응은 뇌보다 솔직하다.',
    choices: [
      { label: '어색하거나 부끄럽고 빨리 숨기고 싶다', score: 10 },
      { label: '잊고 싶거나 의식하지 않으려 한다', score: 25 },
      { label: '있는 그대로 존재하지만 특별히 연결되는 느낌은 없다', score: 55 },
      { label: '살아있고 반응하는 쾌락의 원천으로 느껴진다', score: 90 },
    ],
  },
  {
    id: 'SS14', type: 'scenario', axis: 'HIS', reversed: false, depth_level: 2,
    depth_warning: '과거 경험을 다루는 구역입니다. 언제든 멈출 수 있어요.',
    question: '지금 나의 성적 패턴 중 — 과거 특정 경험에서 온 것이라고 느끼는 것이 있는가?',
    subtext: 'Jack Morin: 가장 강렬한 에로틱 경험은 삶의 상처에서 비롯되는 경우가 많다.',
    choices: [
      { label: '생각해본 적 없다', score: 50 },
      { label: '있을 것 같지만 뭔지 모르겠다', score: 55 },
      { label: '있다. 어느 정도 연결고리가 보인다', score: 70 },
      { label: '분명히 있다. 어떤 경험인지 안다', score: 85 },
    ],
  },
  {
    id: 'SS15', type: 'scenario', axis: 'FAN', reversed: false, depth_level: 2,
    question: '성적 판타지나 상상 속에서 자주 등장하는 요소가 있는가?',
    depth_warning: '이 구역은 내면의 가장 사적인 공간입니다. 아무도 보지 않아요.',
    subtext: 'Morin: 판타지는 억압된 욕구의 신호다. 상상한다는 것이 곧 하고 싶다는 의미는 아니다.',
    choices: [
      { label: '없다. 별로 상상을 하지 않는다', score: 30 },
      { label: '있지만 너무 부끄러워서 직면하지 않으려 한다', score: 35 },
      { label: '있다. 반복해서 등장하는 장면이나 상황이 있다', score: 75 },
      { label: '있다. 그것이 나에게 무엇을 의미하는지 탐색해본 적 있다', score: 90 },
    ],
  },
  {
    // PWR-S vs PWR-P 분기 질문 1 — 영향력의 방향성 (McClelland 사회화/개인화 구분 핵심 기준)
    id: 'SS16A', type: 'scenario', axis: 'PWR', reversed: false, depth_level: 2,
    question: '관계나 상황에서 영향력을 발휘하고 싶을 때 — 그 에너지의 방향은 주로 어디를 향하는가?',
    subtext: '정답 없어요. 솔직한 내면의 첫 반응을 고르세요.',
    choices: [
      { label: '상대가 잘 되고, 성장하고, 변화하는 것을 보고 싶다 (타인 지향)', score: 90 },  // PWR-S
      { label: '내 말대로 되거나 내가 원하는 방향으로 흘러가길 바란다 (자기 지향)', score: 15 },  // PWR-P
      { label: '상황이나 관계 유형에 따라 다르다', score: 55 },
      { label: '영향력을 발휘하고 싶다는 욕구가 별로 없다', score: 50 },
    ],
  },
  {
    // PWR-S vs PWR-P 분기 질문 2 — 갈등/경쟁에서의 반응 (자제력·충동성 기준)
    id: 'SS16B', type: 'binary', axis: 'PWR', reversed: false, depth_level: 2,
    question: '경쟁이나 갈등 상황에서 "지는 것"에 대한 나의 반응은?',
    subtext: 'McClelland: 자제력 수준이 두 권력욕 유형을 가르는 핵심 변수다.',
    choices: [
      { label: '불쾌하거나 답답하지만 상황을 받아들이고 전략을 바꾼다', score: 80 },  // PWR-S
      { label: '이기지 못하면 강한 불쾌감·반발심·복수심이 올라온다', score: 10 },  // PWR-P
    ],
  },
  {
    id: 'SS16', type: 'slider', axis: 'CON', reversed: false, depth_level: 2,
    question: '나에게 성적 친밀감은 관계의 깊이를 확인하는 수단인가, 독립적인 즐거움인가?',
    sliderMin: '관계 깊이 확인 수단', sliderMax: '독립적인 즐거움',
  },
  {
    id: 'SS17', type: 'scenario', axis: 'CON', reversed: false, depth_level: 2,
    question: '상대방이 나를 원한다는 신호를 받을 때 — 내 첫 반응은?',
    subtext: '자동으로 일어나는 첫 반응을 답해 주세요.',
    choices: [
      { label: '거부당할까봐 먼저 불안해진다', score: 20 },
      { label: '기쁘지만 내가 그럴 자격이 있는지 의심된다', score: 35 },
      { label: '받아들이되 나의 리듬으로 반응한다', score: 75 },
      { label: '즉각적으로 열리고 에너지가 살아난다', score: 90 },
    ],
  },
];

// ══════════════════════════════════════════════════════════════
// STAGE 3 — 바닥까지 (8문항)
// Stage 2 평균 openness ≥ 60 이면 진입 안내 표시
// 사용자가 "계속 탐색하겠다"고 선택한 경우에만 진행
// ══════════════════════════════════════════════════════════════

const STAGE_3: SexSelfQuestion[] = [
  {
    id: 'SS18', type: 'binary', axis: 'BDY', reversed: false, depth_level: 3,
    question: '자기 자신을 성적으로 탐색하는 것(자위 포함)에 대해 나는...',
    depth_warning: '이 질문은 직접적입니다. 건너뛰고 싶으면 가운데 값을 선택해도 돼요.',
    choices: [
      { label: '죄책감·수치심·불편함이 있다. 혹은 전혀 하지 않는다', score: 15 },
      { label: '자연스러운 자기 탐색의 일부로 받아들인다', score: 90 },
    ],
  },
  {
    id: 'SS19', type: 'slider', axis: 'SHA', reversed: true, depth_level: 3,
    question: '지금도 성적 욕구나 행동 뒤에 죄책감·"이러면 안 되는데"가 따라오는가?',
    sliderMin: '전혀 없다', sliderMax: '거의 항상 따라온다',
  },
  {
    id: 'SS20', type: 'binary', axis: 'SHA', reversed: true, depth_level: 3,
    question: '내 성적 욕구가 "너무 강하다" 혹은 "너무 약하다"며 스스로를 비정상으로 느낀 적이 있는가?',
    choices: [
      { label: '있다. 내가 이상한 것 같다는 생각을 한 적 있다', score: 10 },
      { label: '없다. 내 욕구의 수준을 자연스럽게 받아들인다', score: 90 },
    ],
  },
  {
    id: 'SS21', type: 'scenario', axis: 'HIS', reversed: false, depth_level: 3,
    question: '처음으로 "진짜 원해서" 가진 성적 경험을 떠올릴 때 느껴지는 감정은?',
    subtext: '없거나 기억나지 않아도 괜찮아요.',
    choices: [
      { label: '그런 경험이 없다 / 기억나지 않는다', score: 30 },
      { label: '복잡하고 불편한 감정이 섞여 있다', score: 40 },
      { label: '중립적이다', score: 55 },
      { label: '긍정적이고 자신을 더 알게 된 경험이었다', score: 85 },
    ],
  },
  {
    id: 'SS22', type: 'slider', axis: 'HIS', reversed: true, depth_level: 3,
    question: '과거의 성적 경험 중 동의 없이 일어났거나, 원하지 않았지만 수용했거나, 지금도 불편한 기억이 있는가?',
    depth_warning: '이 질문은 트라우마를 다룰 수 있습니다. 숫자로만 답해도 됩니다. 50 이상 표시 시 전문 상담을 권합니다.',
    subtext: '"있다"고 답하는 것 자체가 잘못이 아닙니다. 그 경험이 지금의 나에게 영향을 미치고 있을 수 있어요.',
    sliderMin: '없다 (또는 영향 없음)', sliderMax: '있다 (지금도 영향 있음)',
  },
  {
    id: 'SS23', type: 'slider', axis: 'FAN', reversed: false, depth_level: 3,
    question: '내 판타지나 성적 관심사 중 "현실에서 해선 안 된다"는 것과 "언젠가 해보고 싶다"는 것을 구분할 수 있는가?',
    subtext: '이 구분 능력 자체가 성 심리 성숙도의 지표입니다.',
    sliderMin: '구분이 어렵거나 모호하다', sliderMax: '명확하게 구분된다',
  },
  {
    id: 'SS24', type: 'binary', axis: 'FAN', reversed: false, depth_level: 3,
    question: '내 판타지나 성적 상상의 내용에 대해...',
    choices: [
      { label: '"이런 걸 상상하는 나는 이상하다"고 자기 비판한다', score: 15 },
      { label: '"이건 그냥 내 상상이다"라고 비교적 중립적으로 본다', score: 85 },
    ],
  },
  {
    id: 'SS25', type: 'binary', axis: 'CON', reversed: false, depth_level: 3,
    question: '성과 감정을 분리할 수 있는가 — 감정 없이도 신체적 쾌락만을 경험하는 것이 가능한가?',
    subtext: '정답 없음. 어느 쪽이든 자연스러운 방식입니다.',
    choices: [
      { label: '아니다. 감정적 연결 없이는 몸이 열리지 않는다', score: 40 },
      { label: '가능하다. 혹은 가능하다고 생각한다', score: 75 },
    ],
  },
];

// ── 전체 문항 배열 (순서대로 Stage 1 → 2 → 3)
export const SEX_SELF_QUESTIONS: SexSelfQuestion[] = [
  ...STAGE_1,
  ...STAGE_2,
  ...STAGE_3,
];

// ── Stage 경계 인덱스 (Questions.tsx에서 단계 전환에 사용)
export const STAGE_1_END = STAGE_1.length;           // 7
export const STAGE_2_END = STAGE_1.length + STAGE_2.length; // 19

// ── Stage 진입 임계값
export const STAGE_2_THRESHOLD = 45; // Stage 1 평균 ≥ 45 → Stage 2 자동 진행
export const STAGE_3_THRESHOLD = 60; // Stage 2 평균 ≥ 60 → Stage 3 진입 안내

// 축별 문항 수 요약
// DES: SS01 SS02 SS07 — 3문항
// SHA: SS03 SS08 SS09 SS19 SS20 — 5문항
// PWR: SS06 SS10 SS11 SS12 SS16A SS16B — 6문항
//      ↑ SS16A·SS16B: PWR-S(사회화) vs PWR-P(개인화) 구분 전용 질문
//      SS06: 성적 역할 방향성 / SS10·SS11: Dom·Sub 반응 / SS12: 경계 설정
//      SS16A: 영향력 방향성 (타인 vs 자기) / SS16B: 갈등 자제력
// BDY: SS05 SS13 SS18 — 3문항
// HIS: SS14 SS21 SS22 — 3문항
// FAN: SS15 SS23 SS24 — 3문항
// CON: SS04 SS16 SS17 SS25 — 4문항
// 총 27문항
