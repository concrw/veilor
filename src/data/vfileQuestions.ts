export type QuestionType = 'scenario' | 'slider' | 'binary';
export type Axis = 'A' | 'B' | 'C' | 'D';
export type Context = 'social' | 'general' | 'secret';

export interface VFileQuestion {
  id: string;
  type: QuestionType;
  axis: Axis;
  context: Context;
  reversed: boolean;
  question: string;
  questionEn?: string;
  choices?: { label: string; labelEn?: string; score: number }[];
  sliderMin?: string;
  sliderMax?: string;
  sliderMinEn?: string;
  sliderMaxEn?: string;
}

// ════════════════════════════════════════════════════════════════
// V-NEED 욕구 패턴 ↔ 4축 매핑 원칙
//   A (애착/Attachment)  : SAF-SEC↑ = 불안형(고득점), EXS-AUT↑ = 회피형(저득점)
//   B (소통/Communication): CON-INT↑ = 개방(고득점), SAF-CTL↑ = 폐쇄(저득점)
//   C (욕구표현/Expression): EXS-AUT↑ = 직접표현(고득점), GRW-REC 과잉 = 억압(저득점)
//   D (역할/Role)         : GRW-PWR-P↑ = 주도(고득점), SAF-SEC 과잉 = 수용(저득점)
//
// reversed=true → 원점수 반전 후 축 점수에 합산
//
// 컨텍스트별 시나리오 원칙
//   Social  : 직장·업무·공식 모임·처음 만나는 사람
//   General : 평상시·친구·가족
//   Secret  : 연인·배우자·혼자 있을 때의 내면
// ════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────
// SOCIAL (S01~S40) — 직장·업무·공식 모임
// ────────────────────────────────────────────────────────────────
export const VFILE_QUESTIONS_SOCIAL: VFileQuestion[] = [

  // ── A축 (애착 / SAF-SEC ↔ EXS-AUT) ─────────────────────────────
  // A-고득점: 상대의 반응에 집착, 승인 확인, 거절 공포(SAF-SEC↑)
  // A-저득점: 관계를 툭 끊어내거나 미리 거리를 둠(EXS-AUT↑ 회피)
  {
    id: 'S01', type: 'scenario', axis: 'A', context: 'social', reversed: false,
    question: '함께 일하던 동료가 아무 말 없이 갑자기 팀을 옮겼다. 나는...',
    questionEn: 'A colleague you worked closely with suddenly transferred to another team without a word. I...',
    choices: [
      { label: '조직에서 흔한 일이라고 생각하고 별로 신경 쓰지 않는다.', labelEn: 'Think it\'s a normal thing in organizations and don\'t worry much about it.', score: 0 },
      { label: '아쉽긴 하지만 업무에 집중하며 넘긴다.', labelEn: 'Feel a little sorry to see them go but focus on work and move on.', score: 33 },
      { label: '혹시 나 때문에 떠난 건 아닌지 마음에 걸린다.', labelEn: 'Can\'t help wondering if I had something to do with why they left.', score: 66 },
      { label: '연락을 취해서 이유를 꼭 확인하고 싶어진다.', labelEn: 'Feel a strong urge to reach out and find out why.', score: 100 },
    ],
  },
  {
    id: 'S02', type: 'scenario', axis: 'A', context: 'social', reversed: false,
    question: '평소 친하게 지내던 직장 동료가 요즘 나를 피하는 것 같다. 나는...',
    questionEn: 'A colleague you have been close with seems to be avoiding you lately. I...',
    choices: [
      { label: '바쁜가 보다 생각하고 그냥 내 일을 한다.', labelEn: 'Figure they must be busy and just get on with my work.', score: 0 },
      { label: '신경은 쓰이지만 직접 묻기보다는 기다려본다.', labelEn: 'It bothers me a bit, but I wait rather than asking directly.', score: 33 },
      { label: '내가 무슨 실수를 했나 반복적으로 돌이켜본다.', labelEn: 'Keep replaying things, wondering if I made some mistake.', score: 66 },
      { label: '직접 다가가 "무슨 일 있어?"라고 물어본다.', labelEn: 'Walk up to them and ask, "Is everything okay?"', score: 100 },
    ],
  },
  {
    id: 'S03', type: 'scenario', axis: 'A', context: 'social', reversed: false,
    question: '발표 후 상사가 별다른 피드백 없이 자리를 떠났다. 나는...',
    questionEn: 'After your presentation, your manager left without giving any feedback. I...',
    choices: [
      { label: '바쁜 분이라고 생각하고 다음 업무로 넘어간다.', labelEn: 'Assume they are busy and move on to the next task.', score: 0 },
      { label: '피드백이 있었으면 했지만 크게 개의치 않는다.', labelEn: 'Wished for feedback but don\'t let it bother me much.', score: 33 },
      { label: '혹시 발표가 마음에 안 들었던 건 아닐까 불안해진다.', labelEn: 'Start to worry they may not have liked the presentation.', score: 66 },
      { label: '직접 찾아가 평가를 확인해야 마음이 놓인다.', labelEn: 'Need to go find them and confirm their opinion to feel at ease.', score: 100 },
    ],
  },
  {
    id: 'S04', type: 'scenario', axis: 'A', context: 'social', reversed: false,
    question: '협업해온 외부 파트너가 최근 연락이 뜸해졌다. 나는...',
    questionEn: 'An external partner you have been collaborating with has gone quiet recently. I...',
    choices: [
      { label: '프로젝트 일정이 바뀌었겠거니 하고 신경 끈다.', labelEn: 'Assume their schedule changed and think nothing of it.', score: 0 },
      { label: '조금 아쉽지만 연락이 오길 기다린다.', labelEn: 'Feel a little let down but wait for them to reach out.', score: 33 },
      { label: '내가 뭔가 실수한 건 아닌지 걱정되어 메일을 확인한다.', labelEn: 'Worry I did something wrong and review my emails.', score: 66 },
      { label: '확인 메시지를 먼저 보내서 관계를 다시 이어야 안심된다.', labelEn: 'Must send a check-in first to reconnect — that is the only way I can relax.', score: 100 },
    ],
  },
  {
    id: 'S05', type: 'slider', axis: 'A', context: 'social', reversed: false,
    question: '직장이나 공식적인 자리에서 나는 다른 사람들이 나를 어떻게 평가하는지 자주 신경이 쓰인다.',
    questionEn: 'At work or in formal settings, I often find myself concerned about how others are evaluating me.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S06', type: 'slider', axis: 'A', context: 'social', reversed: true,
    question: '직장 동료나 상사에게 정이 들기 전까지는 일부러 거리를 유지하는 편이다.',
    questionEn: 'I tend to keep deliberate distance from colleagues or managers until I feel some affinity for them.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S07', type: 'slider', axis: 'A', context: 'social', reversed: false,
    question: '중요한 프로젝트에서 팀 리더가 내 의견을 무시했을 때 느끼는 불안감의 크기는?',
    questionEn: 'When a team leader dismisses your idea on an important project, how much anxiety does that trigger in you?',
    sliderMin: '거의 없다', sliderMax: '매우 크다',
    sliderMinEn: 'Almost none', sliderMaxEn: 'Very intense',
  },
  {
    id: 'S08', type: 'slider', axis: 'A', context: 'social', reversed: true,
    question: '직장 내 관계가 복잡해지면 아예 교류를 줄이고 혼자 일하는 방식을 선호한다.',
    questionEn: 'When workplace relationships get complicated, I prefer to reduce contact and work alone.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S09', type: 'binary', axis: 'A', context: 'social', reversed: false,
    question: '업무 그룹 채팅에 내 메시지가 한참 동안 읽히지 않을 때, 나의 반응에 더 가까운 것은?',
    questionEn: 'When your message in a work group chat goes unread for a long time, which reaction is closer to yours?',
    choices: [
      { label: '별로 신경 쓰지 않는다. 다들 바쁜 거겠지.', labelEn: 'I don\'t really mind. Everyone is probably busy.', score: 0 },
      { label: '읽었는지 계속 확인하게 된다.', labelEn: 'I keep checking to see if it\'s been read.', score: 100 },
    ],
  },
  {
    id: 'S10', type: 'binary', axis: 'A', context: 'social', reversed: false,
    question: '면접이나 중요한 발표 직전, 나는...',
    questionEn: 'Right before a job interview or important presentation, I...',
    choices: [
      { label: '긴장되지만 준비한 것을 믿고 집중한다.', labelEn: 'Feel nervous but trust my preparation and stay focused.', score: 0 },
      { label: '평가받는 상황 자체가 너무 불안해서 잠을 못 잔다.', labelEn: 'Feel so anxious about being evaluated that I can\'t sleep.', score: 100 },
    ],
  },

  // ── B축 (소통 / CON-INT ↔ SAF-CTL) ─────────────────────────────
  // B-고득점: 속마음을 꺼내고 감정을 공유, 친밀감 개방(CON-INT↑)
  // B-저득점: 정보와 감정을 통제·유보, 필요 이상 드러내지 않음(SAF-CTL↑)
  {
    id: 'S11', type: 'scenario', axis: 'B', context: 'social', reversed: false,
    question: '같은 팀 동료가 "요즘 힘들어 보여, 무슨 일 있어?"라고 물어왔다. 나는...',
    questionEn: 'A teammate says, "You look like you\'re having a rough time lately, is everything okay?" I...',
    choices: [
      { label: '"괜찮아"라고 짧게 넘기고 대화를 마무리한다.', labelEn: 'Say "I\'m fine" briefly and close the conversation.', score: 0 },
      { label: '업무 스트레스 정도만 언급하고 깊은 이야기는 피한다.', labelEn: 'Mention work stress but avoid going deeper.', score: 33 },
      { label: '조금 털어놓되 핵심적인 부분은 남겨둔다.', labelEn: 'Open up a little but hold back the core issue.', score: 66 },
      { label: '솔직하게 속마음을 이야기한다.', labelEn: 'Speak honestly about what\'s really going on.', score: 100 },
    ],
  },
  {
    id: 'S12', type: 'scenario', axis: 'B', context: 'social', reversed: false,
    question: '부당한 업무 지시를 받았을 때 나는...',
    questionEn: 'When you receive an unreasonable work instruction, I...',
    choices: [
      { label: '불만이 있어도 내색하지 않고 그냥 따른다.', labelEn: 'Follow it without showing my dissatisfaction.', score: 0 },
      { label: '신뢰할 수 있는 동료에게만 조심스럽게 털어놓는다.', labelEn: 'Carefully confide only in a trusted colleague.', score: 33 },
      { label: '직속 상사에게 내 의견을 전달한다.', labelEn: 'Communicate my view to my direct manager.', score: 66 },
      { label: '그 자리에서 이유를 묻고 내 생각을 명확하게 말한다.', labelEn: 'Ask why right then and clearly state my position.', score: 100 },
    ],
  },
  {
    id: 'S13', type: 'scenario', axis: 'B', context: 'social', reversed: false,
    question: '회의 중 내 아이디어가 묵살됐을 때 나는...',
    questionEn: 'When your idea is dismissed in a meeting, I...',
    choices: [
      { label: '내 생각을 다시 꺼내지 않고 조용히 넘어간다.', labelEn: 'Let it go quietly and don\'t bring it up again.', score: 0 },
      { label: '회의 후 개인적으로 관련자에게만 이야기한다.', labelEn: 'Bring it up privately to the relevant person after the meeting.', score: 33 },
      { label: '다음 발언 기회를 기다려 보충 설명을 한다.', labelEn: 'Wait for the next opening and add clarification.', score: 66 },
      { label: '즉시 "잠깐, 제 의도를 정확히 설명하고 싶어요"라고 말한다.', labelEn: 'Immediately say, "Wait, I\'d like to clarify what I meant."', score: 100 },
    ],
  },
  {
    id: 'S14', type: 'scenario', axis: 'B', context: 'social', reversed: false,
    question: '처음 합류한 팀에서 자기소개를 해야 한다. 나는...',
    questionEn: 'You have to introduce yourself to a new team you just joined. I...',
    choices: [
      { label: '이름과 담당 업무만 간단히 말한다.', labelEn: 'Say only my name and role briefly.', score: 0 },
      { label: '업무 경력 위주로 간략하게 소개한다.', labelEn: 'Give a brief introduction focused on work experience.', score: 33 },
      { label: '업무 이야기에 짧은 개인 취향 하나를 덧붙인다.', labelEn: 'Add one brief personal touch alongside my work intro.', score: 66 },
      { label: '나를 잘 알 수 있도록 업무 스타일과 개인 이야기를 함께 공유한다.', labelEn: 'Share both my work style and personal details so the team can really know me.', score: 100 },
    ],
  },
  {
    id: 'S15', type: 'slider', axis: 'B', context: 'social', reversed: false,
    question: '직장 내 갈등이나 불편한 감정을 상대방에게 직접 전달하는 편이다.',
    questionEn: 'I tend to directly communicate conflicts or uncomfortable feelings to the other person at work.',
    sliderMin: '절대 그렇지 않다', sliderMax: '항상 그렇게 한다',
    sliderMinEn: 'Never', sliderMaxEn: 'Always',
  },
  {
    id: 'S16', type: 'slider', axis: 'B', context: 'social', reversed: true,
    question: '직장에서 내 속마음을 드러내면 약점이 될 수 있다고 생각한다.',
    questionEn: 'I think showing my true feelings at work can become a weakness.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S17', type: 'slider', axis: 'B', context: 'social', reversed: false,
    question: '동료에게 도움이 필요하다고 직접 말하는 것이 얼마나 자연스럽게 느껴지는가?',
    questionEn: 'How natural does it feel to directly tell a colleague that you need their help?',
    sliderMin: '매우 어색하다', sliderMax: '매우 자연스럽다',
    sliderMinEn: 'Very awkward', sliderMaxEn: 'Very natural',
  },
  {
    id: 'S18', type: 'slider', axis: 'B', context: 'social', reversed: true,
    question: '회의나 공식 자리에서 개인적인 이야기는 최대한 배제하려 한다.',
    questionEn: 'In meetings or formal settings, I try to keep personal matters out as much as possible.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S19', type: 'binary', axis: 'B', context: 'social', reversed: false,
    question: '동료가 업무 실수를 했을 때 직접 말해주는 편인가, 아니면 조용히 넘어가는 편인가?',
    questionEn: 'When a colleague makes a mistake at work, do you tend to tell them directly or let it go quietly?',
    choices: [
      { label: '조용히 넘어간다. 괜히 불편해질 수 있다.', labelEn: 'Let it go. It could make things awkward.', score: 0 },
      { label: '직접 말해준다. 알아야 고칠 수 있다.', labelEn: 'Tell them directly. They need to know to improve.', score: 100 },
    ],
  },
  {
    id: 'S20', type: 'binary', axis: 'B', context: 'social', reversed: false,
    question: '업무 협상에서 내가 원하는 것을 선제적으로 먼저 꺼내는 편인가?',
    questionEn: 'In work negotiations, do you tend to proactively state what you want first?',
    choices: [
      { label: '상대가 먼저 제안할 때까지 기다리는 편이다.', labelEn: 'I usually wait for the other side to make an offer first.', score: 0 },
      { label: '내가 원하는 것을 먼저 분명하게 말하는 편이다.', labelEn: 'I tend to clearly state what I want first.', score: 100 },
    ],
  },

  // ── C축 (욕구표현 / EXS-AUT ↔ GRW-REC 과잉) ────────────────────
  // C-고득점: 필요·욕구를 직접·자율적으로 표현(EXS-AUT↑)
  // C-저득점: 인정·칭찬에 의존, 욕구를 억압하거나 우회(GRW-REC 과잉)
  {
    id: 'S21', type: 'scenario', axis: 'C', context: 'social', reversed: false,
    question: '직장에서 맡기 싫은 업무를 배정받았을 때 나는...',
    questionEn: 'When you are assigned a task you don\'t want at work, I...',
    choices: [
      { label: '싫어도 그냥 한다. 직장이니까.', labelEn: 'Do it anyway. That\'s what work is.', score: 0 },
      { label: '마음속으로는 불만이지만 아무 말 하지 않는다.', labelEn: 'Feel dissatisfied internally but say nothing.', score: 33 },
      { label: '우회적으로 부담을 표현하거나 힌트를 준다.', labelEn: 'Drop hints or express the burden indirectly.', score: 66 },
      { label: '"이 업무보다 제가 더 잘할 수 있는 게 있어요"라고 말한다.', labelEn: 'Say, "There\'s something I could do better than this task."', score: 100 },
    ],
  },
  {
    id: 'S22', type: 'scenario', axis: 'C', context: 'social', reversed: false,
    question: '열심히 한 프로젝트에 대해 상사에게 아무 칭찬도 받지 못했을 때 나는...',
    questionEn: 'After giving a project your all, your manager says nothing about it. I...',
    choices: [
      { label: '칭찬이 없어도 결과가 좋으면 충분하다.', labelEn: 'A good result is enough, whether or not there is praise.', score: 100 },
      { label: '아쉽지만 인정받는 게 내 일의 목적은 아니다.', labelEn: 'It\'s a shame, but getting recognized isn\'t the point of my work.', score: 66 },
      { label: '인정받지 못한 것 같아 의욕이 떨어진다.', labelEn: 'Feel unmotivated because I don\'t feel recognized.', score: 33 },
      { label: '칭찬을 못 받으면 내가 잘못한 건지 내내 신경 쓰인다.', labelEn: 'Without praise I keep wondering if I did something wrong.', score: 0 },
    ],
  },
  {
    id: 'S23', type: 'scenario', axis: 'C', context: 'social', reversed: false,
    question: '팀 회의에서 내 의견과 반대되는 결정이 내려졌을 때 나는...',
    questionEn: 'When the team makes a decision that goes against your opinion, I...',
    choices: [
      { label: '결정을 따르되 이유가 궁금하지도 않다.', labelEn: 'Follow the decision and don\'t even wonder why.', score: 0 },
      { label: '결정을 따르지만 속으로 불만을 삼킨다.', labelEn: 'Follow it but swallow my frustration.', score: 33 },
      { label: '나중에 기회를 봐서 재검토를 제안한다.', labelEn: 'Wait for an opportunity and suggest revisiting it later.', score: 66 },
      { label: '그 자리에서 "저는 다른 이유로 반대합니다"라고 말한다.', labelEn: 'Say right then, "I disagree for a different reason."', score: 100 },
    ],
  },
  {
    id: 'S24', type: 'scenario', axis: 'C', context: 'social', reversed: false,
    question: '업무 과부하 상태에서 상사가 또 일을 맡기려 할 때 나는...',
    questionEn: 'When you are already overloaded and your manager tries to assign you more work, I...',
    choices: [
      { label: '거절하지 못하고 받아들인다.', labelEn: 'Cannot say no and accept it.', score: 0 },
      { label: '수락하면서 어렵다는 눈치만 준다.', labelEn: 'Accept it but hint that it\'s difficult.', score: 33 },
      { label: '현재 업무량을 설명하고 우선순위를 상의한다.', labelEn: 'Explain my current workload and discuss priorities.', score: 66 },
      { label: '"지금 상황에서는 수락하기 어렵습니다"라고 명확하게 말한다.', labelEn: 'Say clearly, "I\'m unable to take this on right now."', score: 100 },
    ],
  },
  {
    id: 'S25', type: 'slider', axis: 'C', context: 'social', reversed: false,
    question: '직장에서 나는 내가 원하는 것을 상대방에게 직접적으로 요청하는 편이다.',
    questionEn: 'At work, I tend to ask for what I want directly from the other person.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S26', type: 'slider', axis: 'C', context: 'social', reversed: true,
    question: '직장에서 칭찬이나 인정을 받지 못하면 내 노력의 의미가 희미해진다.',
    questionEn: 'When I don\'t receive praise or recognition at work, the meaning of my effort fades.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S27', type: 'slider', axis: 'C', context: 'social', reversed: false,
    question: '업무 방식이나 조건에 대해 협상하거나 조율을 요청하는 것이 얼마나 자연스럽게 느껴지는가?',
    questionEn: 'How natural does it feel for you to negotiate or request adjustments to work conditions or methods?',
    sliderMin: '매우 어색하다', sliderMax: '매우 자연스럽다',
    sliderMinEn: 'Very awkward', sliderMaxEn: 'Very natural',
  },
  {
    id: 'S28', type: 'slider', axis: 'C', context: 'social', reversed: true,
    question: '상사나 동료에게 좋게 보이기 위해 정작 내가 원하는 것을 숨기거나 포기한 적이 있다.',
    questionEn: 'I have hidden or given up what I really wanted in order to look good to a manager or colleague.',
    sliderMin: '전혀 없다', sliderMax: '자주 그렇다',
    sliderMinEn: 'Never', sliderMaxEn: 'Frequently',
  },
  {
    id: 'S29', type: 'binary', axis: 'C', context: 'social', reversed: false,
    question: '연봉 협상이나 업무 계약에서 나는...',
    questionEn: 'In salary negotiations or work contracts, I...',
    choices: [
      { label: '제시된 조건을 그냥 받아들이는 편이다.', labelEn: 'Tend to accept the offered terms as they are.', score: 0 },
      { label: '원하는 조건을 명확하게 요구하는 편이다.', labelEn: 'Tend to clearly state my desired terms.', score: 100 },
    ],
  },
  {
    id: 'S30', type: 'binary', axis: 'C', context: 'social', reversed: false,
    question: '업무적으로 도움이 필요할 때 나는...',
    questionEn: 'When I need help with work, I...',
    choices: [
      { label: '최대한 혼자 해결하려 하고, 정말 못할 때만 부탁한다.', labelEn: 'Try to handle it alone as much as possible and only ask when truly stuck.', score: 0 },
      { label: '필요하다고 판단되면 주저 없이 요청한다.', labelEn: 'Ask without hesitation when I judge it necessary.', score: 100 },
    ],
  },

  // ── D축 (역할 / GRW-PWR-P ↔ SAF-SEC 수용) ──────────────────────
  // D-고득점: 관계·팀·흐름을 주도, 결정을 내림(GRW-PWR-P↑)
  // D-저득점: 타인의 흐름에 맞추고, 결정을 위임하며 안전을 확보(SAF-SEC→수용)
  {
    id: 'S31', type: 'scenario', axis: 'D', context: 'social', reversed: false,
    question: '새 프로젝트 팀이 구성됐다. 리더 역할이 필요한 상황에서 나는...',
    questionEn: 'A new project team has been formed. The team needs someone to take a leadership role. I...',
    choices: [
      { label: '누군가 나서기를 기다린다.', labelEn: 'Wait for someone else to step up.', score: 0 },
      { label: '적임자가 없으면 소극적으로 맡는다.', labelEn: 'Reluctantly take it on only if no one else is suitable.', score: 33 },
      { label: '역할 분담을 제안하고 일부를 담당한다.', labelEn: 'Propose a division of roles and take on part of it.', score: 66 },
      { label: '자연스럽게 주도하며 방향을 잡는다.', labelEn: 'Naturally take charge and set the direction.', score: 100 },
    ],
  },
  {
    id: 'S32', type: 'scenario', axis: 'D', context: 'social', reversed: false,
    question: '팀 의견이 갈려 결론이 나지 않을 때 나는...',
    questionEn: 'When the team is divided and can\'t reach a conclusion, I...',
    choices: [
      { label: '결정권자가 판단해주기를 기다린다.', labelEn: 'Wait for whoever has the authority to decide.', score: 0 },
      { label: '가장 많은 의견을 따르는 것이 안전하다고 생각한다.', labelEn: 'Think it\'s safest to follow the majority view.', score: 33 },
      { label: '근거를 제시하며 특정 방향을 제안한다.', labelEn: 'Present reasoning and suggest a specific direction.', score: 66 },
      { label: '내가 직접 정리하고 결론을 내린다.', labelEn: 'Step in, summarize, and draw a conclusion myself.', score: 100 },
    ],
  },
  {
    id: 'S33', type: 'scenario', axis: 'D', context: 'social', reversed: false,
    question: '업무 방향에 대해 내 판단과 상사의 지시가 다를 때 나는...',
    questionEn: 'When your judgment about work direction differs from your manager\'s instruction, I...',
    choices: [
      { label: '일단 지시를 따른다. 맞다고 확신할 수 없으니까.', labelEn: 'Follow the instruction for now. I can\'t be certain I\'m right.', score: 0 },
      { label: '내심 불편하지만 겉으로는 따른다.', labelEn: 'Feel uncomfortable internally but comply outwardly.', score: 33 },
      { label: '조심스럽게 내 판단을 말하고 의견을 구한다.', labelEn: 'Carefully share my view and ask for their input.', score: 66 },
      { label: '내 판단의 근거를 설명하고 조율을 요청한다.', labelEn: 'Explain my reasoning and request an alignment discussion.', score: 100 },
    ],
  },
  {
    id: 'S34', type: 'scenario', axis: 'D', context: 'social', reversed: false,
    question: '공식 모임에서 진행이 지지부진해질 때 나는...',
    questionEn: 'When an official meeting or event starts to drag, I...',
    choices: [
      { label: '그냥 기다린다. 내가 나설 자리가 아니다.', labelEn: 'Just wait. It\'s not my place to step in.', score: 0 },
      { label: '옆 사람과 조용히 이야기를 나눈다.', labelEn: 'Quietly chat with the person next to me.', score: 33 },
      { label: '분위기를 띄울 말을 한두 마디 던진다.', labelEn: 'Throw out a word or two to lift the mood.', score: 66 },
      { label: '직접 나서서 흐름을 바꾼다.', labelEn: 'Step in directly to shift the dynamic.', score: 100 },
    ],
  },
  {
    id: 'S35', type: 'slider', axis: 'D', context: 'social', reversed: false,
    question: '직장이나 공식적인 자리에서 나는 자연스럽게 주도적인 역할을 맡으려 하는 편이다.',
    questionEn: 'At work or in formal settings, I naturally tend to take on a leading role.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S36', type: 'slider', axis: 'D', context: 'social', reversed: true,
    question: '직장에서 내가 어느 위치에 있어야 하는지보다 주어진 역할 안에서 안정적으로 수행하는 것이 더 중요하다.',
    questionEn: 'At work, performing stably within my assigned role matters more to me than worrying about where I stand.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S37', type: 'slider', axis: 'D', context: 'social', reversed: false,
    question: '나는 팀 안에서 흐름을 만들고 방향을 설정하는 역할을 즐긴다.',
    questionEn: 'I enjoy the role of creating momentum and setting direction within a team.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S38', type: 'slider', axis: 'D', context: 'social', reversed: true,
    question: '직장에서 내 의견보다 다수가 원하는 방향을 따를 때 더 마음이 편하다.',
    questionEn: 'At work, I feel more at ease going along with what most people want rather than pushing my own view.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S39', type: 'binary', axis: 'D', context: 'social', reversed: false,
    question: '누군가 나서야 하는 상황에서 나는...',
    questionEn: 'In a situation where someone needs to step up, I...',
    choices: [
      { label: '다른 사람이 나서주기를 기다린다.', labelEn: 'Wait for someone else to do it.', score: 0 },
      { label: '내가 먼저 나서는 편이다.', labelEn: 'Tend to be the one who steps up first.', score: 100 },
    ],
  },
  {
    id: 'S40', type: 'binary', axis: 'D', context: 'social', reversed: false,
    question: '프로젝트 성공에서 가장 중요하게 생각하는 것은?',
    questionEn: 'What do you consider most important for a project\'s success?',
    choices: [
      { label: '모든 구성원이 조화롭게 역할을 수행하는 것.', labelEn: 'All members fulfilling their roles in harmony.', score: 0 },
      { label: '명확한 리더십과 결단력 있는 방향 설정.', labelEn: 'Clear leadership and decisive direction-setting.', score: 100 },
    ],
  },
];

// ────────────────────────────────────────────────────────────────
// GENERAL (G01~G40) — 평상시·친구·가족
// ────────────────────────────────────────────────────────────────
export const VFILE_QUESTIONS_GENERAL: VFileQuestion[] = [

  // ── A축 (애착 / SAF-SEC ↔ EXS-AUT) ─────────────────────────────
  {
    id: 'G01', type: 'scenario', axis: 'A', context: 'general', reversed: false,
    question: '오랜 친구가 연락도 없이 갑자기 만남을 줄이기 시작했다. 나는...',
    questionEn: 'A long-time friend has started pulling back from plans without any explanation. I...',
    choices: [
      { label: '친구도 바쁜 시기가 있다고 생각하고 기다린다.', labelEn: 'Figure they have a busy phase and wait.', score: 0 },
      { label: '조금 서운하지만 내 일상을 이어간다.', labelEn: 'Feel a little hurt but carry on with my life.', score: 33 },
      { label: '내가 무언가 잘못한 건 아닐까 계속 되짚는다.', labelEn: 'Keep turning over whether I did something wrong.', score: 66 },
      { label: '직접 연락해서 우리 사이에 무슨 일이 있는지 확인한다.', labelEn: 'Reach out directly to check if something happened between us.', score: 100 },
    ],
  },
  {
    id: 'G02', type: 'scenario', axis: 'A', context: 'general', reversed: false,
    question: '가족 모임에서 내가 한 말이 갑자기 분위기를 어색하게 만들었다. 나는...',
    questionEn: 'Something you said at a family gathering suddenly made the atmosphere awkward. I...',
    choices: [
      { label: '이런 일은 가끔 있는 거라 크게 신경 쓰지 않는다.', labelEn: 'These things happen sometimes and I don\'t worry much.', score: 0 },
      { label: '어색했지만 금방 잊는다.', labelEn: 'It was awkward but I forget about it quickly.', score: 33 },
      { label: '그 순간이 계속 머릿속에 맴돌고 자책한다.', labelEn: 'That moment keeps replaying in my head and I blame myself.', score: 66 },
      { label: '모임 후 한 명 한 명 연락해서 괜찮은지 확인한다.', labelEn: 'After the gathering I contact each person to check they are okay.', score: 100 },
    ],
  },
  {
    id: 'G03', type: 'scenario', axis: 'A', context: 'general', reversed: false,
    question: '친한 친구가 요즘 다른 친구들과 더 자주 어울리는 것 같다. 나는...',
    questionEn: 'A close friend seems to be spending more time with other friends lately. I...',
    choices: [
      { label: '친구에게도 다양한 인간관계가 있는 법이라고 생각한다.', labelEn: 'Think it\'s natural for friends to have various relationships.', score: 0 },
      { label: '조금 섭섭하지만 내 생활에 집중한다.', labelEn: 'Feel a bit left out but focus on my own life.', score: 33 },
      { label: '내가 그 친구에게 덜 중요해진 건 아닌지 걱정된다.', labelEn: 'Worry that I have become less important to them.', score: 66 },
      { label: '"우리 따로 시간 좀 갖자"라고 먼저 제안한다.', labelEn: 'Proactively suggest, "Let\'s spend some time just the two of us."', score: 100 },
    ],
  },
  {
    id: 'G04', type: 'scenario', axis: 'A', context: 'general', reversed: false,
    question: '가까운 지인이 중요한 일을 혼자 결정하고 나중에 알려줬다. 나는...',
    questionEn: 'Someone close to you made an important decision alone and only told you afterward. I...',
    choices: [
      { label: '그 사람의 결정을 존중하고 특별히 개의치 않는다.', labelEn: 'Respect their decision and don\'t mind much.', score: 0 },
      { label: '조금 섭섭하지만 표현하지 않는다.', labelEn: 'Feel a little hurt but don\'t express it.', score: 33 },
      { label: '나는 그 사람에게 중요한 사람이 아닌 것 같아 씁쓸하다.', labelEn: 'Feel a bitter sense that I may not be important to them.', score: 66 },
      { label: '"왜 미리 말해주지 않았어?"라고 직접 물어본다.', labelEn: 'Ask directly, "Why didn\'t you tell me beforehand?"', score: 100 },
    ],
  },
  {
    id: 'G05', type: 'slider', axis: 'A', context: 'general', reversed: false,
    question: '친구나 가족이 나에게 덜 연락하는 시기에 내가 잘못한 건 아닐까 생각하게 된다.',
    questionEn: 'When friends or family contact me less, I start to wonder if I did something wrong.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G06', type: 'slider', axis: 'A', context: 'general', reversed: true,
    question: '일상에서 사람들과 어느 정도 거리를 두는 것이 편하다.',
    questionEn: 'In everyday life, I feel comfortable keeping a certain distance from people.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G07', type: 'slider', axis: 'A', context: 'general', reversed: false,
    question: '가까운 사람의 기분 변화를 빠르게 알아채고 이유가 나 때문인지 확인하고 싶어진다.',
    questionEn: 'I quickly notice mood changes in close people and want to check whether I caused them.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G08', type: 'slider', axis: 'A', context: 'general', reversed: true,
    question: '친밀한 관계가 많아질수록 오히려 부담감을 느낀다.',
    questionEn: 'The more intimate relationships I have, the more burdened I feel.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G09', type: 'binary', axis: 'A', context: 'general', reversed: false,
    question: '친구가 내 연락에 늦게 답장할 때 나는...',
    questionEn: 'When a friend is slow to reply to my message, I...',
    choices: [
      { label: '바쁜가 보다 하고 신경 끈다.', labelEn: 'Assume they are busy and stop thinking about it.', score: 0 },
      { label: '뭔가 나한테 서운한 게 있는 건 아닐까 걱정된다.', labelEn: 'Worry that they might be upset with me about something.', score: 100 },
    ],
  },
  {
    id: 'G10', type: 'binary', axis: 'A', context: 'general', reversed: false,
    question: '인간관계에서 나의 기본 태도에 가까운 것은?',
    questionEn: 'Which is closer to your default attitude in relationships?',
    choices: [
      { label: '독립적으로 지내는 것이 자연스럽다.', labelEn: 'Being independent feels natural to me.', score: 0 },
      { label: '연결되어 있다는 느낌이 있어야 안심된다.', labelEn: 'I need to feel connected to others to feel at ease.', score: 100 },
    ],
  },

  // ── B축 (소통 / CON-INT ↔ SAF-CTL) ─────────────────────────────
  {
    id: 'G11', type: 'scenario', axis: 'B', context: 'general', reversed: false,
    question: '친한 친구가 내 고민을 물어봤을 때 나는...',
    questionEn: 'A close friend asks about what is worrying you. I...',
    choices: [
      { label: '"별거 아니야"라고 하고 화제를 바꾼다.', labelEn: 'Say "It\'s nothing" and change the subject.', score: 0 },
      { label: '약간 이야기하되 진짜 핵심은 꺼내지 않는다.', labelEn: 'Talk a little but leave out the real core.', score: 33 },
      { label: '솔직하게 말하지만 감정 표현은 절제한다.', labelEn: 'Speak honestly but restrain my emotional expression.', score: 66 },
      { label: '감정과 상황을 모두 자세히 털어놓는다.', labelEn: 'Share both the situation and my feelings in full detail.', score: 100 },
    ],
  },
  {
    id: 'G12', type: 'scenario', axis: 'B', context: 'general', reversed: false,
    question: '가족과 의견 충돌이 생겼을 때 나는...',
    questionEn: 'When you have a disagreement with a family member, I...',
    choices: [
      { label: '갈등이 커질까 봐 내 의견을 접는다.', labelEn: 'Back down from my view to avoid escalating the conflict.', score: 0 },
      { label: '분위기를 보면서 조심스럽게 의견을 낸다.', labelEn: 'Read the atmosphere and cautiously voice my opinion.', score: 33 },
      { label: '내 의견을 말하되 타협점을 찾으려 한다.', labelEn: 'State my view but try to find a middle ground.', score: 66 },
      { label: '내 입장과 이유를 분명하게 설명한다.', labelEn: 'Clearly explain my position and reasons.', score: 100 },
    ],
  },
  {
    id: 'G13', type: 'scenario', axis: 'B', context: 'general', reversed: false,
    question: '친구가 나에게 상처가 되는 말을 했을 때 나는...',
    questionEn: 'When a friend says something that hurts you, I...',
    choices: [
      { label: '티 안 나게 넘어가고 혼자 삭인다.', labelEn: 'Let it pass without showing it and process it alone.', score: 0 },
      { label: '시간이 지난 후 우회적으로 표현한다.', labelEn: 'Express it indirectly some time later.', score: 33 },
      { label: '부드럽게 "그 말이 좀 상처가 됐어"라고 말한다.', labelEn: 'Gently say, "That comment hurt a little."', score: 66 },
      { label: '그 자리에서 어떤 부분이 왜 상처가 됐는지 말한다.', labelEn: 'Say right there which part hurt and why.', score: 100 },
    ],
  },
  {
    id: 'G14', type: 'scenario', axis: 'B', context: 'general', reversed: false,
    question: '새로 사귄 친구와 더 가까워지고 싶을 때 나는...',
    questionEn: 'When you want to get closer to a new friend, I...',
    choices: [
      { label: '상대가 먼저 다가오기를 기다린다.', labelEn: 'Wait for them to take the first step.', score: 0 },
      { label: '가끔 가벼운 대화로 거리를 좁힌다.', labelEn: 'Gradually close the distance through light conversation.', score: 33 },
      { label: '먼저 식사나 약속을 제안한다.', labelEn: 'Suggest a meal or plans first.', score: 66 },
      { label: '솔직하게 "우리 더 자주 보자"고 말한다.', labelEn: 'Say openly, "Let\'s see each other more often."', score: 100 },
    ],
  },
  {
    id: 'G15', type: 'slider', axis: 'B', context: 'general', reversed: false,
    question: '친한 친구나 가족에게 내 감정을 솔직하게 표현하는 것이 자연스럽다.',
    questionEn: 'It feels natural to express my emotions honestly to close friends or family.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G16', type: 'slider', axis: 'B', context: 'general', reversed: true,
    question: '가까운 사람에게도 내 속마음을 전부 보여주는 건 불편하다.',
    questionEn: 'Even with close people, showing my true inner self feels uncomfortable.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G17', type: 'slider', axis: 'B', context: 'general', reversed: false,
    question: '갈등 상황에서 내 감정과 입장을 상대방에게 직접 전달할 수 있다.',
    questionEn: 'In conflict situations I am able to communicate my feelings and position directly to the other person.',
    sliderMin: '전혀 못한다', sliderMax: '충분히 할 수 있다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Absolutely can',
  },
  {
    id: 'G18', type: 'slider', axis: 'B', context: 'general', reversed: true,
    question: '관계에서 내 감정 상태를 드러내면 상대방이 나를 다르게 볼까 봐 걱정된다.',
    questionEn: 'I worry that if I reveal my emotional state in a relationship, the other person will see me differently.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G19', type: 'binary', axis: 'B', context: 'general', reversed: false,
    question: '친한 친구에게 고민을 털어놓는 것이 편한가, 아니면 혼자 해결하는 것이 편한가?',
    questionEn: 'Is it more comfortable to share worries with a close friend, or to work through them alone?',
    choices: [
      { label: '혼자 해결하는 게 편하다.', labelEn: 'Working through it alone feels more comfortable.', score: 0 },
      { label: '친구에게 털어놓는 게 편하다.', labelEn: 'Sharing with a friend feels more comfortable.', score: 100 },
    ],
  },
  {
    id: 'G20', type: 'binary', axis: 'B', context: 'general', reversed: false,
    question: '친구와 의견이 다를 때 나는...',
    questionEn: 'When my opinion differs from a friend\'s, I...',
    choices: [
      { label: '굳이 부딪히지 않고 그냥 넘어간다.', labelEn: 'Let it go rather than creating friction.', score: 0 },
      { label: '내 의견을 분명히 말한다.', labelEn: 'State my opinion clearly.', score: 100 },
    ],
  },

  // ── C축 (욕구표현 / EXS-AUT ↔ GRW-REC 과잉) ────────────────────
  {
    id: 'G21', type: 'scenario', axis: 'C', context: 'general', reversed: false,
    question: '친구들이 내가 원하지 않는 장소로 약속을 잡으려 할 때 나는...',
    questionEn: 'When friends are making plans at a venue you don\'t want to go to, I...',
    choices: [
      { label: '다들 원하는 거면 따라간다.', labelEn: 'Go along since everyone else wants to.', score: 0 },
      { label: '내심 불만이지만 말하지 않는다.', labelEn: 'Feel reluctant internally but say nothing.', score: 33 },
      { label: '다른 후보를 슬쩍 제안해본다.', labelEn: 'Casually suggest an alternative.', score: 66 },
      { label: '"나는 거기보다 여기가 좋아"라고 직접 말한다.', labelEn: 'Say directly, "I\'d prefer somewhere else."', score: 100 },
    ],
  },
  {
    id: 'G22', type: 'scenario', axis: 'C', context: 'general', reversed: false,
    question: '오랫동안 도와주던 친구가 별 감사 표현 없이 부탁을 계속 해올 때 나는...',
    questionEn: 'A friend you have been helping for a long time keeps asking for favors without much gratitude. I...',
    choices: [
      { label: '도움 자체가 의미 있으니까 그냥 계속 돕는다.', labelEn: 'The help itself is meaningful so I just keep helping.', score: 100 },
      { label: '서운하지만 참고 계속 도와준다.', labelEn: 'Feel hurt but hold it in and continue helping.', score: 66 },
      { label: '슬쩍 "나도 요즘 좀 힘들어"라고 한마디 한다.', labelEn: 'Drop a hint: "Things have been a bit hard for me too lately."', score: 33 },
      { label: '"솔직히 좀 지쳐가고 있어, 나도 한계가 있거든"이라고 말한다.', labelEn: 'Say honestly, "I\'m getting tired, I have my limits too."', score: 0 },
    ],
  },
  {
    id: 'G23', type: 'scenario', axis: 'C', context: 'general', reversed: false,
    question: '오랜 친구가 내 생일을 잊었을 때 나는...',
    questionEn: 'When an old friend forgets your birthday, I...',
    choices: [
      { label: '별거 아니라 생각하고 넘어간다.', labelEn: 'Think nothing of it and move on.', score: 100 },
      { label: '서운하지만 먼저 말하지는 않는다.', labelEn: 'Feel hurt but don\'t bring it up.', score: 66 },
      { label: '나중에 농담처럼 "야, 내 생일 잊었지?"라고 말한다.', labelEn: 'Jokingly say later, "Hey, you forgot my birthday, didn\'t you?"', score: 33 },
      { label: '"솔직히 좀 서운했어"라고 직접 말한다.', labelEn: 'Say directly, "I\'m honestly a little hurt by that."', score: 0 },
    ],
  },
  {
    id: 'G24', type: 'scenario', axis: 'C', context: 'general', reversed: false,
    question: '가족 모임에서 내 의사와 다른 결정이 내려졌을 때 나는...',
    questionEn: 'When the family makes a decision that goes against your wishes, I...',
    choices: [
      { label: '가족 결정이니까 따른다.', labelEn: 'Go along with it because it\'s a family decision.', score: 0 },
      { label: '속으로 불만이지만 말하지 않는다.', labelEn: 'Feel dissatisfied inside but say nothing.', score: 33 },
      { label: '부드럽게 내 생각을 표현해본다.', labelEn: 'Try to express my thoughts gently.', score: 66 },
      { label: '내 의견과 이유를 분명하게 말한다.', labelEn: 'State my opinion and reasons clearly.', score: 100 },
    ],
  },
  {
    id: 'G25', type: 'slider', axis: 'C', context: 'general', reversed: false,
    question: '친구나 가족에게 내가 원하는 것을 명확하게 말할 수 있다.',
    questionEn: 'I am able to clearly tell friends or family what I want.',
    sliderMin: '전혀 그렇지 않다', sliderMax: '매우 잘 한다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very well',
  },
  {
    id: 'G26', type: 'slider', axis: 'C', context: 'general', reversed: true,
    question: '가까운 사람에게 칭찬이나 인정을 받아야 내가 제대로 된 것 같은 느낌이 든다.',
    questionEn: 'I need to receive praise or acknowledgment from people close to me to feel like I am doing things right.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G27', type: 'slider', axis: 'C', context: 'general', reversed: false,
    question: '관계에서 내가 불편한 것을 상대방에게 솔직하게 말할 수 있다.',
    questionEn: 'In relationships I can honestly tell the other person what makes me uncomfortable.',
    sliderMin: '전혀 못한다', sliderMax: '충분히 한다',
    sliderMinEn: 'Never', sliderMaxEn: 'Freely',
  },
  {
    id: 'G28', type: 'slider', axis: 'C', context: 'general', reversed: true,
    question: '가까운 사람의 기대에 부응하기 위해 내가 원하는 것을 포기한 경험이 있다.',
    questionEn: 'I have given up what I wanted in order to meet the expectations of someone close to me.',
    sliderMin: '전혀 없다', sliderMax: '자주 있다',
    sliderMinEn: 'Never', sliderMaxEn: 'Frequently',
  },
  {
    id: 'G29', type: 'binary', axis: 'C', context: 'general', reversed: false,
    question: '친구들이 원하는 것과 내가 원하는 것이 다를 때 나는...',
    questionEn: 'When what friends want differs from what I want, I...',
    choices: [
      { label: '대부분 친구들에게 맞춰주는 편이다.', labelEn: 'Usually adjust to what my friends want.', score: 0 },
      { label: '내가 원하는 것을 솔직하게 말하는 편이다.', labelEn: 'Tend to honestly say what I want.', score: 100 },
    ],
  },
  {
    id: 'G30', type: 'binary', axis: 'C', context: 'general', reversed: false,
    question: '일상에서 경계선이 무너졌다고 느낄 때 나는...',
    questionEn: 'When you feel your boundaries have been crossed in everyday life, I...',
    choices: [
      { label: '불편해도 참고 맞춰준다.', labelEn: 'Endure the discomfort and adapt.', score: 0 },
      { label: '불편함을 분명하게 표현한다.', labelEn: 'Clearly express my discomfort.', score: 100 },
    ],
  },

  // ── D축 (역할 / GRW-PWR-P ↔ SAF-SEC 수용) ──────────────────────
  {
    id: 'G31', type: 'scenario', axis: 'D', context: 'general', reversed: false,
    question: '친구 모임에서 어디에 갈지 정해지지 않을 때 나는...',
    questionEn: 'When a group of friends can\'t decide where to go, I...',
    choices: [
      { label: '다수가 결정할 때까지 기다린다.', labelEn: 'Wait until the majority decides.', score: 0 },
      { label: '의견이 있어도 먼저 꺼내기 부담스럽다.', labelEn: 'Have an opinion but feel hesitant to bring it up first.', score: 33 },
      { label: '후보를 몇 가지 제안해본다.', labelEn: 'Suggest a few options.', score: 66 },
      { label: '"나는 여기 어때?"라고 먼저 방향을 잡아준다.', labelEn: 'Take the lead and say, "How about here?"', score: 100 },
    ],
  },
  {
    id: 'G32', type: 'scenario', axis: 'D', context: 'general', reversed: false,
    question: '친구들 사이에서 갈등이 생겼을 때 나는...',
    questionEn: 'When conflict arises among your friends, I...',
    choices: [
      { label: '관여하지 않고 알아서 해결되기를 기다린다.', labelEn: 'Stay uninvolved and wait for it to resolve on its own.', score: 0 },
      { label: '조용히 중립을 유지한다.', labelEn: 'Quietly keep a neutral position.', score: 33 },
      { label: '양쪽 말을 들으며 중재를 시도한다.', labelEn: 'Listen to both sides and try to mediate.', score: 66 },
      { label: '직접 나서서 상황을 정리하고 해결책을 제시한다.', labelEn: 'Step in directly, clarify the situation, and offer a solution.', score: 100 },
    ],
  },
  {
    id: 'G33', type: 'scenario', axis: 'D', context: 'general', reversed: false,
    question: '가족 중 중요한 결정을 내려야 하는 상황에서 나는...',
    questionEn: 'When the family needs to make an important decision, I...',
    choices: [
      { label: '어른들이 결정해줄 때까지 기다린다.', labelEn: 'Wait for the elders to decide.', score: 0 },
      { label: '의견이 있어도 굳이 꺼내지 않는다.', labelEn: 'Have an opinion but don\'t bother bringing it up.', score: 33 },
      { label: '신중하게 내 의견을 말한다.', labelEn: 'Share my opinion carefully.', score: 66 },
      { label: '적극적으로 정보를 모으고 방향을 제안한다.', labelEn: 'Actively gather information and propose a direction.', score: 100 },
    ],
  },
  {
    id: 'G34', type: 'scenario', axis: 'D', context: 'general', reversed: false,
    question: '모임에서 새로운 활동이나 계획을 만들어가는 역할을 맡게 될 때 나는...',
    questionEn: 'When you end up in the role of planning a new activity for a group, I...',
    choices: [
      { label: '되도록 빠지고 싶다.', labelEn: 'Try to get out of it if possible.', score: 0 },
      { label: '부탁을 받으면 어쩔 수 없이 맡는다.', labelEn: 'Reluctantly take it on only when asked.', score: 33 },
      { label: '맡게 되면 충실하게 한다.', labelEn: 'If I take it on I do it thoroughly.', score: 66 },
      { label: '주도하는 것을 즐긴다.', labelEn: 'I enjoy being the one to lead it.', score: 100 },
    ],
  },
  {
    id: 'G35', type: 'slider', axis: 'D', context: 'general', reversed: false,
    question: '친구나 가족과 함께할 때 내가 방향이나 계획을 이끌어가는 편이다.',
    questionEn: 'When with friends or family, I tend to be the one who leads the direction or plans.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G36', type: 'slider', axis: 'D', context: 'general', reversed: true,
    question: '일상에서는 누군가가 이끌어주는 역할을 해줄 때 더 편안하다.',
    questionEn: 'In everyday life, I feel more comfortable when someone else takes the leading role.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G37', type: 'slider', axis: 'D', context: 'general', reversed: false,
    question: '모임의 분위기가 어색할 때 내가 나서서 분위기를 바꾸려 한다.',
    questionEn: 'When the mood in a gathering gets awkward, I try to step in and shift it.',
    sliderMin: '전혀 그렇지 않다', sliderMax: '거의 항상 그렇다',
    sliderMinEn: 'Never', sliderMaxEn: 'Almost always',
  },
  {
    id: 'G38', type: 'slider', axis: 'D', context: 'general', reversed: true,
    question: '관계에서 내가 주도하는 위치보다 따라가는 위치가 더 자연스럽게 느껴진다.',
    questionEn: 'In relationships, being in a following role feels more natural to me than a leading one.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G39', type: 'binary', axis: 'D', context: 'general', reversed: false,
    question: '친구 모임을 직접 기획하고 이끄는 역할을 즐기는 편인가?',
    questionEn: 'Do you tend to enjoy planning and leading friend gatherings yourself?',
    choices: [
      { label: '다른 사람이 해주면 더 좋다.', labelEn: 'I prefer it when someone else does it.', score: 0 },
      { label: '내가 직접 기획하고 이끄는 게 좋다.', labelEn: 'I like to plan and lead it myself.', score: 100 },
    ],
  },
  {
    id: 'G40', type: 'binary', axis: 'D', context: 'general', reversed: false,
    question: '새로운 모임에서 내 포지션을 찾는 방식은?',
    questionEn: 'How do you find your position in a new group?',
    choices: [
      { label: '자연스럽게 적응하며 나중에 자리가 잡힌다.', labelEn: 'I adapt naturally and settle into a role over time.', score: 0 },
      { label: '초반부터 능동적으로 역할을 만들어간다.', labelEn: 'I actively create my role from the beginning.', score: 100 },
    ],
  },
];

// ────────────────────────────────────────────────────────────────
// SECRET (T01~T40) — 연인·배우자·혼자 있을 때의 내면
// ────────────────────────────────────────────────────────────────
export const VFILE_QUESTIONS_SECRET: VFileQuestion[] = [

  // ── A축 (애착 / SAF-SEC ↔ EXS-AUT) ─────────────────────────────
  {
    id: 'T01', type: 'scenario', axis: 'A', context: 'secret', reversed: false,
    question: '연인이나 가장 가까운 사람이 아무 이유 없이 갑자기 차가워졌을 때 나는...',
    questionEn: 'When your partner or closest person suddenly turns cold without any apparent reason, I...',
    choices: [
      { label: '잠시 힘든 시기겠거니 하고 기다린다.', labelEn: 'Figure they are going through a rough patch and wait.', score: 0 },
      { label: '마음에 걸리지만 상대의 공간을 준다.', labelEn: 'It bothers me but I give them space.', score: 33 },
      { label: '내가 뭔가 잘못한 게 있는지 계속 생각한다.', labelEn: 'Keep thinking about whether I did something wrong.', score: 66 },
      { label: '즉시 확인하고 싶어서 연락을 하게 된다.', labelEn: 'Feel compelled to reach out immediately to check.', score: 100 },
    ],
  },
  {
    id: 'T02', type: 'scenario', axis: 'A', context: 'secret', reversed: false,
    question: '연인이 나에게 화가 났지만 직접 말하지 않는 것 같다. 나는...',
    questionEn: 'Your partner seems angry with you but isn\'t saying it directly. I...',
    choices: [
      { label: '상대가 말할 준비가 됐을 때까지 기다린다.', labelEn: 'Wait until they are ready to talk.', score: 0 },
      { label: '분위기가 풀리기를 기다리며 약간의 배려를 한다.', labelEn: 'Show a little care while waiting for the mood to lift.', score: 33 },
      { label: '불안해서 계속 눈치를 살핀다.', labelEn: 'Feel anxious and keep watching for cues.', score: 66 },
      { label: '"뭔가 화가 난 것 같은데, 우리 얘기 좀 할 수 있을까?"라고 먼저 꺼낸다.', labelEn: 'Bring it up first: "You seem upset — can we talk?"', score: 100 },
    ],
  },
  {
    id: 'T03', type: 'scenario', axis: 'A', context: 'secret', reversed: false,
    question: '혼자 있는 시간이 길어질 때 나는...',
    questionEn: 'When I have been alone for a long stretch of time, I...',
    choices: [
      { label: '혼자 있는 게 편하고 충전이 된다.', labelEn: 'Feel comfortable and recharged being alone.', score: 0 },
      { label: '괜찮지만 사람이 그리워지기 시작한다.', labelEn: 'Feel okay but start to miss people.', score: 33 },
      { label: '외로움이 커지고 연결이 필요해진다.', labelEn: 'Feel growing loneliness and need for connection.', score: 66 },
      { label: '불안해지고 가장 가까운 사람에게 연락하고 싶어진다.', labelEn: 'Feel anxious and want to reach out to the closest person.', score: 100 },
    ],
  },
  {
    id: 'T04', type: 'scenario', axis: 'A', context: 'secret', reversed: false,
    question: '오래된 관계에서 상대방이 예전처럼 관심을 주지 않는다고 느낄 때 나는...',
    questionEn: 'When I feel that someone in a long-term relationship is no longer as attentive as before, I...',
    choices: [
      { label: '자연스러운 변화라고 받아들이고 개의치 않는다.', labelEn: 'Accept it as a natural change and don\'t mind.', score: 0 },
      { label: '조금 서운하지만 관계는 변하는 것이라 생각한다.', labelEn: 'Feel a little hurt but think relationships change.', score: 33 },
      { label: '내가 덜 매력적이거나 덜 중요해진 건 아닐까 걱정된다.', labelEn: 'Worry I have become less attractive or less important to them.', score: 66 },
      { label: '이 관계가 괜찮은지 확인하고 싶어서 대화를 요청한다.', labelEn: 'Ask for a conversation to make sure the relationship is still okay.', score: 100 },
    ],
  },
  {
    id: 'T05', type: 'slider', axis: 'A', context: 'secret', reversed: false,
    question: '가장 가까운 사람이 나의 감정이나 상태에 관심을 가져주지 않으면 불안해진다.',
    questionEn: 'I feel anxious when the person closest to me shows no interest in my feelings or state.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T06', type: 'slider', axis: 'A', context: 'secret', reversed: true,
    question: '친밀한 관계에서도 나만의 공간과 독립성을 유지해야 안심된다.',
    questionEn: 'Even in an intimate relationship I need to maintain my own space and independence to feel at ease.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T07', type: 'slider', axis: 'A', context: 'secret', reversed: false,
    question: '상대방이 나를 정말 사랑하는지 자주 확인하고 싶어진다.',
    questionEn: 'I often want to confirm whether the other person truly loves me.',
    sliderMin: '전혀 아니다', sliderMax: '매우 자주',
    sliderMinEn: 'Never', sliderMaxEn: 'Very often',
  },
  {
    id: 'T08', type: 'slider', axis: 'A', context: 'secret', reversed: true,
    question: '가장 가까운 사람과 며칠 연락이 없어도 크게 불안하지 않다.',
    questionEn: 'I don\'t feel particularly anxious if I don\'t hear from the person closest to me for a few days.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T09', type: 'binary', axis: 'A', context: 'secret', reversed: false,
    question: '연인이나 가장 친밀한 사람이 갑자기 연락이 안 될 때 나는...',
    questionEn: 'When my partner or closest person suddenly becomes unreachable, I...',
    choices: [
      { label: '바쁜가 보다 하고 기다린다.', labelEn: 'Assume they are busy and wait.', score: 0 },
      { label: '혹시 무슨 일이 있나 불안해서 연락을 계속 시도한다.', labelEn: 'Feel anxious that something is wrong and keep trying to reach them.', score: 100 },
    ],
  },
  {
    id: 'T10', type: 'binary', axis: 'A', context: 'secret', reversed: false,
    question: '깊은 관계에서 나는...',
    questionEn: 'In a deep relationship, I...',
    choices: [
      { label: '상대의 감정 변화와 상관없이 내 중심을 잡는 편이다.', labelEn: 'Tend to stay centered regardless of the other person\'s emotional changes.', score: 0 },
      { label: '상대의 감정 변화에 예민하게 반응하는 편이다.', labelEn: 'Tend to react sensitively to the other person\'s emotional changes.', score: 100 },
    ],
  },

  // ── B축 (소통 / CON-INT ↔ SAF-CTL) ─────────────────────────────
  {
    id: 'T11', type: 'scenario', axis: 'B', context: 'secret', reversed: false,
    question: '연인에게 내가 진짜로 두려워하는 것을 털어놓으려 할 때 나는...',
    questionEn: 'When you are about to share something you truly fear with your partner, I...',
    choices: [
      { label: '말하지 않는다. 너무 약해 보일 것 같다.', labelEn: 'Don\'t share it. I\'d seem too vulnerable.', score: 0 },
      { label: '가볍게 둘러서 말하지만 핵심은 꺼내지 않는다.', labelEn: 'Speak around it lightly but leave out the real point.', score: 33 },
      { label: '조심스럽게 꺼내보되 반응을 보면서 조절한다.', labelEn: 'Cautiously bring it up and adjust based on their reaction.', score: 66 },
      { label: '솔직하게 "나 사실 이게 많이 무서워"라고 말한다.', labelEn: 'Honestly say, "I\'m actually really scared of this."', score: 100 },
    ],
  },
  {
    id: 'T12', type: 'scenario', axis: 'B', context: 'secret', reversed: false,
    question: '가장 가까운 사람과 오해가 생겼을 때 나는...',
    questionEn: 'When a misunderstanding arises with your closest person, I...',
    choices: [
      { label: '시간이 지나면 자연스럽게 해소되겠지라고 생각한다.', labelEn: 'Think it will resolve naturally with time.', score: 0 },
      { label: '먼저 다가가기 어렵고 상대를 기다린다.', labelEn: 'Find it hard to approach first and wait for them.', score: 33 },
      { label: '불편하지만 용기 내서 먼저 이야기를 꺼낸다.', labelEn: 'Feel uncomfortable but gather courage to bring it up first.', score: 66 },
      { label: '바로 "우리 이거 짚고 넘어가야 할 것 같아"라고 말한다.', labelEn: 'Say right away, "I think we need to address this."', score: 100 },
    ],
  },
  {
    id: 'T13', type: 'scenario', axis: 'B', context: 'secret', reversed: false,
    question: '나 혼자만 알고 있는 비밀이나 수치스러운 과거를 연인에게 말하려 할 때 나는...',
    questionEn: 'When thinking about telling your partner a secret or shameful past only you know, I...',
    choices: [
      { label: '절대 말하지 않는다.', labelEn: 'Would never share it.', score: 0 },
      { label: '관계가 매우 깊어지면 혹시 모를 일이다.', labelEn: 'Maybe someday if the relationship becomes very deep.', score: 33 },
      { label: '신뢰가 충분히 쌓이면 말할 수 있다.', labelEn: 'Can share it once enough trust is built.', score: 66 },
      { label: '깊은 관계에서 나를 온전히 알아달라는 마음으로 이야기할 수 있다.', labelEn: 'Can share it in a deep relationship, wanting to be fully known.', score: 100 },
    ],
  },
  {
    id: 'T14', type: 'scenario', axis: 'B', context: 'secret', reversed: false,
    question: '연인 사이에서 성적인 욕구나 선호를 표현하려 할 때 나는...',
    questionEn: 'When thinking about expressing sexual desires or preferences to your partner, I...',
    choices: [
      { label: '먼저 꺼내기 어렵고 상대가 이끌어주기를 기다린다.', labelEn: 'Find it hard to bring up first and wait for them to lead.', score: 0 },
      { label: '표현하고 싶지만 어떻게 말할지 몰라 머뭇거린다.', labelEn: 'Want to express it but hesitate not knowing how to say it.', score: 33 },
      { label: '가볍게 힌트를 주면서 상대의 반응을 본다.', labelEn: 'Drop light hints and gauge their response.', score: 66 },
      { label: '편하게 내가 원하는 것을 솔직하게 말한다.', labelEn: 'Comfortably and honestly say what I want.', score: 100 },
    ],
  },
  {
    id: 'T15', type: 'slider', axis: 'B', context: 'secret', reversed: false,
    question: '내 진짜 감정을 가장 가까운 사람에게 솔직하게 보여주는 것이 자연스럽다.',
    questionEn: 'It feels natural to show my true feelings honestly to the person closest to me.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T16', type: 'slider', axis: 'B', context: 'secret', reversed: true,
    question: '가장 친밀한 관계에서도 내 일부는 절대 드러내지 않는 영역이 있다.',
    questionEn: 'Even in my most intimate relationship there is a part of me I would never reveal.',
    sliderMin: '전혀 아니다', sliderMax: '분명히 있다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Definitely yes',
  },
  {
    id: 'T17', type: 'slider', axis: 'B', context: 'secret', reversed: false,
    question: '감정적으로 가장 취약한 순간에 내 상태를 연인이나 가장 가까운 사람에게 솔직하게 말할 수 있다.',
    questionEn: 'At my most emotionally vulnerable moments I can honestly tell my partner or closest person how I feel.',
    sliderMin: '전혀 못한다', sliderMax: '충분히 할 수 있다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Absolutely can',
  },
  {
    id: 'T18', type: 'slider', axis: 'B', context: 'secret', reversed: true,
    question: '친밀한 관계에서 내 감정이 드러나면 통제력을 잃는 것 같아 불편하다.',
    questionEn: 'In an intimate relationship, having my emotions exposed feels like losing control and makes me uncomfortable.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T19', type: 'binary', axis: 'B', context: 'secret', reversed: false,
    question: '연인에게 나의 내면을 드러내는 것이 편한가, 아니면 불편한가?',
    questionEn: 'Is it comfortable or uncomfortable to reveal your inner self to your partner?',
    choices: [
      { label: '불편하다. 취약해지는 것 같다.', labelEn: 'Uncomfortable. It feels like becoming vulnerable.', score: 0 },
      { label: '편하다. 알려지고 싶은 마음이 더 크다.', labelEn: 'Comfortable. The desire to be known feels stronger.', score: 100 },
    ],
  },
  {
    id: 'T20', type: 'binary', axis: 'B', context: 'secret', reversed: false,
    question: '깊은 관계에서 내가 상처받은 것을 직접 말할 수 있는가?',
    questionEn: 'In a deep relationship can you directly say when you have been hurt?',
    choices: [
      { label: '대부분 말하지 못하고 혼자 삭인다.', labelEn: 'Usually cannot say it and process it alone.', score: 0 },
      { label: '조금 어렵지만 말하려고 노력한다.', labelEn: 'It is a bit hard but I try to say it.', score: 100 },
    ],
  },

  // ── C축 (욕구표현 / EXS-AUT ↔ GRW-REC 과잉) ────────────────────
  {
    id: 'T21', type: 'scenario', axis: 'C', context: 'secret', reversed: false,
    question: '성적인 면에서 내가 원하는 것과 연인이 원하는 것이 다를 때 나는...',
    questionEn: 'When what you want sexually differs from what your partner wants, I...',
    choices: [
      { label: '상대에게 맞추고 내 욕구는 접어둔다.', labelEn: 'Adapt to them and set aside my own desires.', score: 0 },
      { label: '내 욕구가 있다는 것을 내색하지 않는다.', labelEn: 'Don\'t let on that I have my own desires.', score: 33 },
      { label: '분위기를 보면서 조심스럽게 표현해본다.', labelEn: 'Read the mood and cautiously express myself.', score: 66 },
      { label: '"나는 이게 좋아"라고 편하게 말한다.', labelEn: 'Comfortably say, "I like this."', score: 100 },
    ],
  },
  {
    id: 'T22', type: 'scenario', axis: 'C', context: 'secret', reversed: false,
    question: '연인에게 "오늘은 나를 먼저 챙겨줬으면 해"라는 말을 하는 것이...',
    questionEn: 'Saying to your partner "I\'d like you to focus on me today" feels...',
    choices: [
      { label: '거의 불가능하다. 요구처럼 느껴져서 말하기 어렵다.', labelEn: 'Nearly impossible. It feels like a demand and is hard to say.', score: 0 },
      { label: '말하고 싶지만 실제로는 잘 못한다.', labelEn: 'I want to say it but actually struggle to.', score: 33 },
      { label: '가끔 할 수 있지만 여전히 조금 어색하다.', labelEn: 'Sometimes I can, but it still feels a bit awkward.', score: 66 },
      { label: '자연스럽게 말할 수 있다.', labelEn: 'Natural and easy to say.', score: 100 },
    ],
  },
  {
    id: 'T23', type: 'scenario', axis: 'C', context: 'secret', reversed: false,
    question: '나만의 시간과 공간이 필요할 때 연인에게 나는...',
    questionEn: 'When you need your own time and space, to your partner I...',
    choices: [
      { label: '말하지 못하고 참거나 대충 넘긴다.', labelEn: 'Cannot say it and endure or brush it off.', score: 0 },
      { label: '지쳐 보이면 상대가 알아주길 기다린다.', labelEn: 'Wait for them to notice I look drained.', score: 33 },
      { label: '"나 좀 피곤해"라고 돌려 말한다.', labelEn: 'Hint at it by saying, "I\'m a bit tired."', score: 66 },
      { label: '"오늘은 혼자 있고 싶어"라고 직접 말한다.', labelEn: 'Say directly, "I need some time alone today."', score: 100 },
    ],
  },
  {
    id: 'T24', type: 'scenario', axis: 'C', context: 'secret', reversed: false,
    question: '혼자 있을 때 욕구나 감정을 억누르는 일이 있다면...',
    questionEn: 'When alone, if you suppress a desire or feeling, it is usually because...',
    choices: [
      { label: '그 욕구가 나쁘거나 부끄럽다고 느껴서.', labelEn: 'The desire feels wrong or shameful.', score: 0 },
      { label: '표현해도 이루어지지 않을 것 같아서.', labelEn: 'It feels pointless to express since it won\'t be fulfilled.', score: 33 },
      { label: '표현하는 방법을 잘 몰라서.', labelEn: 'I don\'t quite know how to express it.', score: 66 },
      { label: '억누르는 일이 별로 없다. 내 욕구는 내 것이다.', labelEn: 'I rarely suppress things. My desires are my own.', score: 100 },
    ],
  },
  {
    id: 'T25', type: 'slider', axis: 'C', context: 'secret', reversed: false,
    question: '친밀한 관계에서 나는 내가 원하는 것을 직접 요구할 수 있다.',
    questionEn: 'In an intimate relationship I am able to directly ask for what I want.',
    sliderMin: '전혀 그렇지 않다', sliderMax: '매우 잘 한다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very well',
  },
  {
    id: 'T26', type: 'slider', axis: 'C', context: 'secret', reversed: true,
    question: '연인에게 인정받고 사랑받는다는 확인이 없으면 스스로 충분하지 않다는 생각이 든다.',
    questionEn: 'Without confirmation of being loved and valued by my partner I feel like I am not enough.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T27', type: 'slider', axis: 'C', context: 'secret', reversed: false,
    question: '성적인 욕구나 선호를 연인에게 솔직하게 말하는 것이 자연스럽다.',
    questionEn: 'It feels natural to honestly tell my partner about my sexual desires or preferences.',
    sliderMin: '전혀 그렇지 않다', sliderMax: '매우 자연스럽다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very natural',
  },
  {
    id: 'T28', type: 'slider', axis: 'C', context: 'secret', reversed: true,
    question: '나 자신의 욕구보다 상대방의 만족이 더 중요하다고 느끼는 경향이 있다.',
    questionEn: 'I tend to feel that my partner\'s satisfaction matters more than my own desires.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T29', type: 'binary', axis: 'C', context: 'secret', reversed: false,
    question: '가장 친밀한 관계에서 "나는 이게 싫어"라고 말하는 것이...',
    questionEn: 'Saying "I don\'t like this" in your most intimate relationship is...',
    choices: [
      { label: '어렵다. 관계가 불편해질까 봐.', labelEn: 'Difficult. I worry it will make things uncomfortable.', score: 0 },
      { label: '자연스럽다. 내 느낌은 당연히 말할 수 있다.', labelEn: 'Natural. Of course I can say how I feel.', score: 100 },
    ],
  },
  {
    id: 'T30', type: 'binary', axis: 'C', context: 'secret', reversed: false,
    question: '혼자 있을 때 나는...',
    questionEn: 'When alone, I...',
    choices: [
      { label: '내 욕구나 감정을 억누르거나 판단하는 경향이 있다.', labelEn: 'Tend to suppress or judge my desires and emotions.', score: 0 },
      { label: '내 욕구와 감정을 있는 그대로 받아들이는 편이다.', labelEn: 'Tend to accept my desires and emotions as they are.', score: 100 },
    ],
  },

  // ── D축 (역할 / GRW-PWR-P ↔ SAF-SEC 수용) ──────────────────────
  {
    id: 'T31', type: 'scenario', axis: 'D', context: 'secret', reversed: false,
    question: '친밀한 관계에서 리드하고 이끄는 역할에 대해 나는...',
    questionEn: 'Regarding the role of leading and guiding in an intimate relationship, I...',
    choices: [
      { label: '부담스럽고 상대가 이끌어주는 게 편하다.', labelEn: 'Find it burdensome and prefer my partner to lead.', score: 0 },
      { label: '상황에 따라 따라가는 게 자연스럽다.', labelEn: 'Find it natural to follow depending on the situation.', score: 33 },
      { label: '때로는 리드하고 싶기도 하다.', labelEn: 'Sometimes want to take the lead.', score: 66 },
      { label: '자연스럽게 내가 방향을 잡는 것이 좋다.', labelEn: 'Naturally prefer to be the one who sets the direction.', score: 100 },
    ],
  },
  {
    id: 'T32', type: 'scenario', axis: 'D', context: 'secret', reversed: false,
    question: '관계의 깊이나 속도를 정하는 것에 있어서 나는...',
    questionEn: 'When it comes to setting the depth or pace of a relationship, I...',
    choices: [
      { label: '상대의 페이스에 따라가는 게 더 안전하다.', labelEn: 'Prefer to follow the other person\'s pace — it feels safer.', score: 0 },
      { label: '상대가 결정하도록 두고 나는 반응한다.', labelEn: 'Let them decide and I respond.', score: 33 },
      { label: '함께 조율하면서 맞춰가고 싶다.', labelEn: 'Want to work it out together through mutual adjustment.', score: 66 },
      { label: '내가 먼저 방향을 잡는 것이 편하다.', labelEn: 'Feel more comfortable being the one to set the direction first.', score: 100 },
    ],
  },
  {
    id: 'T33', type: 'scenario', axis: 'D', context: 'secret', reversed: false,
    question: '성적인 상황에서 나의 자연스러운 역할은...',
    questionEn: 'In sexual situations my natural role is...',
    choices: [
      { label: '주도보다는 따르는 것이 편하다.', labelEn: 'More comfortable following than leading.', score: 0 },
      { label: '상대에 따라 달라지지만 대개 수동적이다.', labelEn: 'Depends on the partner but usually more passive.', score: 33 },
      { label: '상대에 따라 달라지며 유연하다.', labelEn: 'Depends on the partner and flexible.', score: 66 },
      { label: '자연스럽게 리드하는 편이다.', labelEn: 'Tend to naturally lead.', score: 100 },
    ],
  },
  {
    id: 'T34', type: 'scenario', axis: 'D', context: 'secret', reversed: false,
    question: '두 사람 사이에서 중요한 결정을 내려야 할 때 나는...',
    questionEn: 'When an important decision must be made between the two of you, I...',
    choices: [
      { label: '상대방이 결정해주기를 바라고 따른다.', labelEn: 'Hope the other person decides and follow along.', score: 0 },
      { label: '의견이 있지만 상대의 결정을 존중하며 맞춘다.', labelEn: 'Have an opinion but respect their decision and adapt.', score: 33 },
      { label: '함께 충분히 이야기하고 공동으로 결정한다.', labelEn: 'Talk it through fully and decide jointly.', score: 66 },
      { label: '내 판단으로 방향을 이끌어가는 것이 자연스럽다.', labelEn: 'Guiding the direction with my own judgment feels natural.', score: 100 },
    ],
  },
  {
    id: 'T35', type: 'slider', axis: 'D', context: 'secret', reversed: false,
    question: '친밀한 관계에서 내가 방향을 잡고 리드하는 것이 편하다.',
    questionEn: 'In an intimate relationship I feel comfortable being the one who sets the direction and leads.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T36', type: 'slider', axis: 'D', context: 'secret', reversed: true,
    question: '연인이나 가장 가까운 사람이 관계를 이끌어줄 때 더 안심된다.',
    questionEn: 'I feel more at ease when my partner or closest person is the one steering the relationship.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T37', type: 'slider', axis: 'D', context: 'secret', reversed: false,
    question: '두 사람 사이에서 주도적인 위치를 유지하는 것이 자연스럽다.',
    questionEn: 'Maintaining the dominant position between the two of us feels natural.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T38', type: 'slider', axis: 'D', context: 'secret', reversed: true,
    question: '친밀한 관계에서 내가 결정하고 주도하는 것보다 따르는 것이 더 자연스럽다.',
    questionEn: 'In an intimate relationship following feels more natural to me than deciding and leading.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T39', type: 'binary', axis: 'D', context: 'secret', reversed: false,
    question: '두 사람이 함께 새로운 경험을 시작할 때 나는...',
    questionEn: 'When the two of you start a new experience together, I...',
    choices: [
      { label: '상대가 먼저 제안하거나 이끌기를 기다린다.', labelEn: 'Wait for the other person to suggest or lead.', score: 0 },
      { label: '내가 먼저 시작하거나 방향을 잡는다.', labelEn: 'Start first or set the direction myself.', score: 100 },
    ],
  },
  {
    id: 'T40', type: 'binary', axis: 'D', context: 'secret', reversed: false,
    question: '가장 친밀한 관계에서 "우리 이런 방향으로 가보자"라고 먼저 제안하는 사람은...',
    questionEn: 'In your most intimate relationship, who tends to be the first to say "Let\'s go in this direction"?',
    choices: [
      { label: '대개 상대방이다.', labelEn: 'Usually the other person.', score: 0 },
      { label: '대개 나다.', labelEn: 'Usually me.', score: 100 },
    ],
  },
];

// 하위 호환성 유지
export const VFILE_QUESTIONS = VFILE_QUESTIONS_SOCIAL;
