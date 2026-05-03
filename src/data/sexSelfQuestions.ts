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
  questionEn?: string;
  subtext?: string;
  subtextEn?: string;
  depth_warning?: string;   // 트라우마 인폼드 안내
  depth_warningEn?: string;
  choices?: { label: string; labelEn?: string; score: number }[];
  sliderMin?: string;
  sliderMax?: string;
  sliderMinEn?: string;
  sliderMaxEn?: string;
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
    questionEn: 'When sexual attraction arises — where does it usually begin for you?',
    subtext: '솔직하게 — 정답은 없어요.',
    subtextEn: 'Be honest — there are no right answers.',
    choices: [
      { label: '시각적 자극 (외모, 몸, 눈빛)', labelEn: 'Visual cues (appearance, body, eyes)', score: 70 },
      { label: '청각·언어적 자극 (목소리, 말투, 대화)', labelEn: 'Auditory or verbal cues (voice, tone, conversation)', score: 70 },
      { label: '감정적 연결 (이해받는다는 느낌)', labelEn: 'Emotional connection (feeling understood)', score: 70 },
      { label: '상황·분위기·긴장감', labelEn: 'Situation, atmosphere, or tension', score: 70 },
    ],
  },
  {
    id: 'SS02', type: 'slider', axis: 'DES', reversed: false, depth_level: 1,
    question: '나는 지금 이 순간 자신이 "성적 존재"라는 것을 온전히 느끼고 있다.',
    questionEn: 'Right now, I feel a full sense of myself as a sexual being.',
    subtext: '이상적 상태가 아니라 지금 현재를 답해 주세요.',
    subtextEn: 'Answer for how you feel right now, not how you wish you felt.',
    sliderMin: '전혀 느끼지 못한다', sliderMax: '완전히 살아있다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Fully alive',
  },
  {
    id: 'SS03', type: 'binary', axis: 'SHA', reversed: true, depth_level: 1,
    question: '내 성적 욕구나 관심에 대해 "이러면 안 되는데" 하는 느낌이 따라오는 편인가?',
    questionEn: 'Do your sexual desires or interests tend to come with a sense of "I shouldn\'t feel this way"?',
    choices: [
      { label: '그런 느낌이 자주 따라온다', labelEn: 'That feeling comes up often', score: 20 },
      { label: '별로 없다. 비교적 자연스럽다', labelEn: "Not really — it feels fairly natural", score: 85 },
    ],
  },
  {
    id: 'SS04', type: 'scenario', axis: 'CON', reversed: false, depth_level: 1,
    question: '성적 친밀감을 가질 때 내게 가장 중요한 것은?',
    questionEn: 'When engaging in sexual intimacy, what matters most to you?',
    choices: [
      { label: '충분한 감정적 안전감과 신뢰', labelEn: 'A strong sense of emotional safety and trust', score: 65 },
      { label: '상대방이 나를 진심으로 원한다는 확신', labelEn: 'Knowing my partner genuinely desires me', score: 75 },
      { label: '신체적 감각과 쾌락 그 자체', labelEn: 'Physical sensation and pleasure in itself', score: 80 },
      { label: '일상을 벗어나는 새로움·모험', labelEn: 'Novelty and adventure beyond everyday life', score: 75 },
    ],
  },
  {
    id: 'SS05', type: 'slider', axis: 'BDY', reversed: false, depth_level: 1,
    question: '나는 내 몸을 — 성적인 맥락 밖에서도 — 긍정적으로 느낀다.',
    questionEn: 'I feel positively about my body — even outside of sexual contexts.',
    subtext: '외모 평가와 무관하게, 신체 존재 자체로서.',
    subtextEn: 'As a physical being in itself, independent of how you look.',
    sliderMin: '거의 그렇지 않다', sliderMax: '자연스럽게 느낀다',
    sliderMinEn: 'Rarely', sliderMaxEn: 'Naturally and easily',
  },
  {
    id: 'SS06', type: 'scenario', axis: 'PWR', reversed: false, depth_level: 1,
    question: '성적인 관계에서 나는 어느 쪽에 더 에너지가 살아나는가?',
    questionEn: 'In a sexual relationship, which role energizes you more?',
    choices: [
      { label: '이끌고 주도하는 역할', labelEn: 'Leading and taking initiative', score: 80 },
      { label: '상대에게 완전히 내맡기는 역할', labelEn: 'Surrendering fully to my partner', score: 80 },
      { label: '상황마다 달라지고, 그 전환이 흥미롭다', labelEn: 'It varies — and that fluidity is exciting', score: 85 },
      { label: '역할에 대해 생각해본 적 없거나 불편하다', labelEn: "I haven't thought about it much, or it makes me uncomfortable", score: 25 },
    ],
  },
  {
    id: 'SS07', type: 'binary', axis: 'DES', reversed: false, depth_level: 1,
    question: '내가 실제로 원하는 것과 "원해도 된다고 허락된 것" 사이에 간격이 있다고 느끼는가?',
    questionEn: 'Do you sense a gap between what you truly desire and what you feel you\'re "allowed" to want?',
    subtext: '이것은 억압의 핵심 질문입니다.',
    subtextEn: 'This is a core question about suppression.',
    choices: [
      { label: '그 간격이 있다. 말하지 못한 것이 있다', labelEn: 'Yes, there is a gap — things I have never expressed', score: 30 },
      { label: '별로 없다. 원하는 것을 대체로 표현하며 산다', labelEn: 'Not really — I generally express what I want', score: 90 },
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
    questionEn: 'When you first experienced sexual feelings, how did your environment (family, school, religion) respond?',
    depth_warning: '과거 기억을 떠올리는 문항입니다. 불편하면 건너뛰어도 괜찮아요.',
    depth_warningEn: 'This question invites you to recall past memories. It\'s okay to skip if it feels uncomfortable.',
    subtext: '그때 받은 메시지가 지금의 나를 만들었을 수 있어요.',
    subtextEn: 'The messages you received then may have shaped who you are today.',
    choices: [
      { label: '부끄럽고 나쁜 것이라는 메시지를 받았다', labelEn: 'I received the message that it was shameful or wrong', score: 5 },
      { label: '없다는 듯 완전히 무시되거나 침묵됐다', labelEn: 'It was completely ignored or met with silence', score: 15 },
      { label: '"결혼 후에", "때가 되면"이라는 조건부 허락이었다', labelEn: '"After marriage" or "when the time comes" — conditional acceptance', score: 35 },
      { label: '비교적 자연스럽게 받아들여졌다', labelEn: 'It was received in a relatively open and natural way', score: 80 },
    ],
  },
  {
    id: 'SS09', type: 'scenario', axis: 'SHA', reversed: true, depth_level: 2,
    question: '자신의 성적 취향 중 "이건 이상한 게 아닐까" 하고 혼자 숨겨온 것이 있는가?',
    questionEn: 'Do you have sexual preferences you\'ve kept hidden, wondering if they\'re "too strange"?',
    subtext: '구체적으로 쓰지 않아도 됩니다. 존재 여부만.',
    subtextEn: 'You don\'t need to specify. Just whether it exists.',
    choices: [
      { label: '있다. 누구에게도 말한 적 없다', labelEn: "Yes — I've never told anyone", score: 10 },
      { label: '있다. 아주 가까운 한 사람에게는 말했다', labelEn: "Yes — I've told one very close person", score: 40 },
      { label: '있었지만 지금은 자연스럽다는 것을 안다', labelEn: 'I did, but now I know it\'s natural', score: 75 },
      { label: '그런 것이 없다', labelEn: "I don't have anything like that", score: 90 },
    ],
  },
  {
    id: 'SS10', type: 'slider', axis: 'PWR', reversed: false, depth_level: 2,
    question: '완전히 통제를 내려놓고 상대에게 맡기는 상상을 할 때 — 느껴지는 감정은?',
    questionEn: 'When you imagine completely letting go of control and surrendering to a partner — what do you feel?',
    subtext: '불안·흥분·혐오·호기심 — 어느 방향이든 솔직하게.',
    subtextEn: 'Anxiety, excitement, aversion, curiosity — be honest in whichever direction.',
    sliderMin: '강한 불안이나 거부감', sliderMax: '강한 흥미나 흥분',
    sliderMinEn: 'Strong anxiety or aversion', sliderMaxEn: 'Strong interest or excitement',
  },
  {
    id: 'SS11', type: 'slider', axis: 'PWR', reversed: false, depth_level: 2,
    question: '반대로 — 상대를 완전히 내 의도대로 이끌고 상대가 반응하는 상상을 할 때 느껴지는 감정은?',
    questionEn: 'Conversely — when you imagine leading a partner entirely according to your intentions and watching them respond, what do you feel?',
    sliderMin: '강한 불안이나 거부감', sliderMax: '강한 흥미나 흥분',
    sliderMinEn: 'Strong anxiety or aversion', sliderMaxEn: 'Strong interest or excitement',
  },
  {
    id: 'SS12', type: 'binary', axis: 'PWR', reversed: false, depth_level: 2,
    question: '성적인 상황에서 "지금 이건 싫다"고 말하는 것이...',
    questionEn: 'Saying "I don\'t want this right now" in a sexual situation feels...',
    choices: [
      { label: '분위기를 깨거나 상대를 실망시킬 것 같아서 그냥 참는 편이다', labelEn: "Like it would kill the mood or disappoint my partner — so I tend to go along", score: 10 },
      { label: '당연한 권리이고 말할 수 있다', labelEn: 'Like my natural right — and I can say it', score: 90 },
    ],
  },
  {
    id: 'SS13', type: 'scenario', axis: 'BDY', reversed: false, depth_level: 2,
    question: '성적인 순간에 내 몸은...',
    questionEn: 'During sexual moments, my body feels...',
    subtext: 'Masters & Johnson: 신체 반응은 뇌보다 솔직하다.',
    subtextEn: 'Masters & Johnson: the body\'s responses are more honest than the mind.',
    choices: [
      { label: '어색하거나 부끄럽고 빨리 숨기고 싶다', labelEn: 'Awkward or embarrassing — I want to hide it quickly', score: 10 },
      { label: '잊고 싶거나 의식하지 않으려 한다', labelEn: 'Something I try to forget or stop noticing', score: 25 },
      { label: '있는 그대로 존재하지만 특별히 연결되는 느낌은 없다', labelEn: 'Just present, without any particular sense of connection', score: 55 },
      { label: '살아있고 반응하는 쾌락의 원천으로 느껴진다', labelEn: 'Alive, responsive, and a source of pleasure', score: 90 },
    ],
  },
  {
    id: 'SS14', type: 'scenario', axis: 'HIS', reversed: false, depth_level: 2,
    depth_warning: '과거 경험을 다루는 구역입니다. 언제든 멈출 수 있어요.',
    depth_warningEn: 'This section explores past experiences. You can stop at any time.',
    question: '지금 나의 성적 패턴 중 — 과거 특정 경험에서 온 것이라고 느끼는 것이 있는가?',
    questionEn: 'Among your current sexual patterns, do any feel like they came from a specific past experience?',
    subtext: 'Jack Morin: 가장 강렬한 에로틱 경험은 삶의 상처에서 비롯되는 경우가 많다.',
    subtextEn: 'Jack Morin: the most intense erotic experiences often emerge from life\'s wounds.',
    choices: [
      { label: '생각해본 적 없다', labelEn: "I've never thought about it", score: 50 },
      { label: '있을 것 같지만 뭔지 모르겠다', labelEn: 'Probably, but I can\'t pinpoint what', score: 55 },
      { label: '있다. 어느 정도 연결고리가 보인다', labelEn: 'Yes — I can see some connection', score: 70 },
      { label: '분명히 있다. 어떤 경험인지 안다', labelEn: 'Clearly yes — and I know which experience', score: 85 },
    ],
  },
  {
    id: 'SS15', type: 'scenario', axis: 'FAN', reversed: false, depth_level: 2,
    question: '성적 판타지나 상상 속에서 자주 등장하는 요소가 있는가?',
    questionEn: 'Are there elements that appear repeatedly in your sexual fantasies or imagination?',
    depth_warning: '이 구역은 내면의 가장 사적인 공간입니다. 아무도 보지 않아요.',
    depth_warningEn: 'This space is the most private part of your inner world. No one is watching.',
    subtext: 'Morin: 판타지는 억압된 욕구의 신호다. 상상한다는 것이 곧 하고 싶다는 의미는 아니다.',
    subtextEn: 'Morin: fantasy is a signal of suppressed desire. Imagining something does not mean you want to act on it.',
    choices: [
      { label: '없다. 별로 상상을 하지 않는다', labelEn: "Not really — I don't fantasize much", score: 30 },
      { label: '있지만 너무 부끄러워서 직면하지 않으려 한다', labelEn: "Yes, but I'm too embarrassed to face it", score: 35 },
      { label: '있다. 반복해서 등장하는 장면이나 상황이 있다', labelEn: 'Yes — there are scenes or situations that keep recurring', score: 75 },
      { label: '있다. 그것이 나에게 무엇을 의미하는지 탐색해본 적 있다', labelEn: "Yes — and I've explored what it means for me", score: 90 },
    ],
  },
  {
    // PWR-S vs PWR-P 분기 질문 1 — 영향력의 방향성 (McClelland 사회화/개인화 구분 핵심 기준)
    id: 'SS16A', type: 'scenario', axis: 'PWR', reversed: false, depth_level: 2,
    question: '관계나 상황에서 영향력을 발휘하고 싶을 때 — 그 에너지의 방향은 주로 어디를 향하는가?',
    questionEn: 'When you want to exert influence in a relationship or situation — where does that energy mainly point?',
    subtext: '정답 없어요. 솔직한 내면의 첫 반응을 고르세요.',
    subtextEn: 'No right answer. Choose your honest first inner reaction.',
    choices: [
      { label: '상대가 잘 되고, 성장하고, 변화하는 것을 보고 싶다 (타인 지향)', labelEn: 'I want to see the other person thrive, grow, and change (other-directed)', score: 90 },  // PWR-S
      { label: '내 말대로 되거나 내가 원하는 방향으로 흘러가길 바란다 (자기 지향)', labelEn: 'I want things to go my way or in the direction I prefer (self-directed)', score: 15 },  // PWR-P
      { label: '상황이나 관계 유형에 따라 다르다', labelEn: 'It depends on the situation or type of relationship', score: 55 },
      { label: '영향력을 발휘하고 싶다는 욕구가 별로 없다', labelEn: "I don't feel a strong desire to exert influence", score: 50 },
    ],
  },
  {
    // PWR-S vs PWR-P 분기 질문 2 — 갈등/경쟁에서의 반응 (자제력·충동성 기준)
    id: 'SS16B', type: 'binary', axis: 'PWR', reversed: false, depth_level: 2,
    question: '경쟁이나 갈등 상황에서 "지는 것"에 대한 나의 반응은?',
    questionEn: 'In competitive or conflictual situations, how do you react to "losing"?',
    subtext: 'McClelland: 자제력 수준이 두 권력욕 유형을 가르는 핵심 변수다.',
    subtextEn: 'McClelland: the level of self-restraint is the key variable distinguishing the two types of power motivation.',
    choices: [
      { label: '불쾌하거나 답답하지만 상황을 받아들이고 전략을 바꾼다', labelEn: "I feel frustrated or upset, but I accept the situation and adjust my approach", score: 80 },  // PWR-S
      { label: '이기지 못하면 강한 불쾌감·반발심·복수심이 올라온다', labelEn: 'If I lose, I feel strong resentment, defiance, or a desire for revenge', score: 10 },  // PWR-P
    ],
  },
  {
    id: 'SS16', type: 'slider', axis: 'CON', reversed: false, depth_level: 2,
    question: '나에게 성적 친밀감은 관계의 깊이를 확인하는 수단인가, 독립적인 즐거움인가?',
    questionEn: 'For you, is sexual intimacy a way to confirm the depth of a relationship, or a form of independent pleasure?',
    sliderMin: '관계 깊이 확인 수단', sliderMax: '독립적인 즐거움',
    sliderMinEn: 'A way to confirm relational depth', sliderMaxEn: 'An independent pleasure',
  },
  {
    id: 'SS17', type: 'scenario', axis: 'CON', reversed: false, depth_level: 2,
    question: '상대방이 나를 원한다는 신호를 받을 때 — 내 첫 반응은?',
    questionEn: 'When you receive a signal that someone desires you — what is your first reaction?',
    subtext: '자동으로 일어나는 첫 반응을 답해 주세요.',
    subtextEn: 'Answer with the automatic response that comes first.',
    choices: [
      { label: '거부당할까봐 먼저 불안해진다', labelEn: 'I feel anxious first, afraid of being rejected', score: 20 },
      { label: '기쁘지만 내가 그럴 자격이 있는지 의심된다', labelEn: "I'm glad, but I wonder if I deserve it", score: 35 },
      { label: '받아들이되 나의 리듬으로 반응한다', labelEn: 'I receive it and respond at my own pace', score: 75 },
      { label: '즉각적으로 열리고 에너지가 살아난다', labelEn: 'I open up immediately and feel energized', score: 90 },
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
    questionEn: 'When it comes to sexually exploring your own body (including masturbation), I...',
    depth_warning: '이 질문은 직접적입니다. 건너뛰고 싶으면 가운데 값을 선택해도 돼요.',
    depth_warningEn: 'This question is direct. If you want to skip it, you can select a middle value.',
    choices: [
      { label: '죄책감·수치심·불편함이 있다. 혹은 전혀 하지 않는다', labelEn: 'Feel guilt, shame, or discomfort — or avoid it entirely', score: 15 },
      { label: '자연스러운 자기 탐색의 일부로 받아들인다', labelEn: 'Accept it as a natural part of self-exploration', score: 90 },
    ],
  },
  {
    id: 'SS19', type: 'slider', axis: 'SHA', reversed: true, depth_level: 3,
    question: '지금도 성적 욕구나 행동 뒤에 죄책감·"이러면 안 되는데"가 따라오는가?',
    questionEn: 'Even now, do feelings of guilt or "I shouldn\'t do this" follow your sexual desires or actions?',
    sliderMin: '전혀 없다', sliderMax: '거의 항상 따라온다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Almost always',
  },
  {
    id: 'SS20', type: 'binary', axis: 'SHA', reversed: true, depth_level: 3,
    question: '내 성적 욕구가 "너무 강하다" 혹은 "너무 약하다"며 스스로를 비정상으로 느낀 적이 있는가?',
    questionEn: 'Have you ever felt that your sexual desire is "too strong" or "too weak," making you feel abnormal?',
    choices: [
      { label: '있다. 내가 이상한 것 같다는 생각을 한 적 있다', labelEn: "Yes — I have thought that something is wrong with me", score: 10 },
      { label: '없다. 내 욕구의 수준을 자연스럽게 받아들인다', labelEn: 'No — I accept my level of desire as natural', score: 90 },
    ],
  },
  {
    id: 'SS21', type: 'scenario', axis: 'HIS', reversed: false, depth_level: 3,
    question: '처음으로 "진짜 원해서" 가진 성적 경험을 떠올릴 때 느껴지는 감정은?',
    questionEn: 'When you recall the first sexual experience you truly wanted — what feelings arise?',
    subtext: '없거나 기억나지 않아도 괜찮아요.',
    subtextEn: "It's okay if there isn't one or you can't remember.",
    choices: [
      { label: '그런 경험이 없다 / 기억나지 않는다', labelEn: "I haven't had that experience / I can't remember", score: 30 },
      { label: '복잡하고 불편한 감정이 섞여 있다', labelEn: 'A mix of complex and uncomfortable feelings', score: 40 },
      { label: '중립적이다', labelEn: 'Neutral', score: 55 },
      { label: '긍정적이고 자신을 더 알게 된 경험이었다', labelEn: 'Positive — an experience that helped me know myself better', score: 85 },
    ],
  },
  {
    id: 'SS22', type: 'slider', axis: 'HIS', reversed: true, depth_level: 3,
    question: '과거의 성적 경험 중 동의 없이 일어났거나, 원하지 않았지만 수용했거나, 지금도 불편한 기억이 있는가?',
    questionEn: 'Among your past sexual experiences, are there any that happened without your consent, that you accepted but didn\'t want, or that still feel uncomfortable today?',
    depth_warning: '이 질문은 트라우마를 다룰 수 있습니다. 숫자로만 답해도 됩니다. 50 이상 표시 시 전문 상담을 권합니다.',
    depth_warningEn: 'This question may touch on trauma. You may answer with a number alone. If you mark 50 or above, we encourage you to speak with a professional.',
    subtext: '"있다"고 답하는 것 자체가 잘못이 아닙니다. 그 경험이 지금의 나에게 영향을 미치고 있을 수 있어요.',
    subtextEn: 'Answering "yes" is not wrong in itself. That experience may be affecting who you are today.',
    sliderMin: '없다 (또는 영향 없음)', sliderMax: '있다 (지금도 영향 있음)',
    sliderMinEn: 'No (or no lasting impact)', sliderMaxEn: 'Yes (still affecting me)',
  },
  {
    id: 'SS23', type: 'slider', axis: 'FAN', reversed: false, depth_level: 3,
    question: '내 판타지나 성적 관심사 중 "현실에서 해선 안 된다"는 것과 "언젠가 해보고 싶다"는 것을 구분할 수 있는가?',
    questionEn: 'Can you distinguish between sexual fantasies or interests that "should never happen in reality" and those you "might actually want to explore someday"?',
    subtext: '이 구분 능력 자체가 성 심리 성숙도의 지표입니다.',
    subtextEn: 'The ability to make this distinction is itself an indicator of sexual-psychological maturity.',
    sliderMin: '구분이 어렵거나 모호하다', sliderMax: '명확하게 구분된다',
    sliderMinEn: 'Difficult or unclear to distinguish', sliderMaxEn: 'Clearly distinguishable',
  },
  {
    id: 'SS24', type: 'binary', axis: 'FAN', reversed: false, depth_level: 3,
    question: '내 판타지나 성적 상상의 내용에 대해...',
    questionEn: 'About the content of my sexual fantasies or imagination...',
    choices: [
      { label: '"이런 걸 상상하는 나는 이상하다"고 자기 비판한다', labelEn: 'I criticize myself: "Something must be wrong with me for imagining this"', score: 15 },
      { label: '"이건 그냥 내 상상이다"라고 비교적 중립적으로 본다', labelEn: 'I view it relatively neutrally: "This is just my imagination"', score: 85 },
    ],
  },
  {
    id: 'SS25', type: 'binary', axis: 'CON', reversed: false, depth_level: 3,
    question: '성과 감정을 분리할 수 있는가 — 감정 없이도 신체적 쾌락만을 경험하는 것이 가능한가?',
    questionEn: 'Can you separate sex from emotion — is it possible for you to experience physical pleasure without emotional connection?',
    subtext: '정답 없음. 어느 쪽이든 자연스러운 방식입니다.',
    subtextEn: 'No right answer. Either way is a natural way of being.',
    choices: [
      { label: '아니다. 감정적 연결 없이는 몸이 열리지 않는다', labelEn: "No — my body doesn't open without emotional connection", score: 40 },
      { label: '가능하다. 혹은 가능하다고 생각한다', labelEn: 'Yes — or I think it would be possible for me', score: 75 },
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
export const STAGE_2_END = STAGE_1.length + STAGE_2.length; // 19 (note: STAGE_2 has 11 items including SS16A, SS16B, SS16)

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
