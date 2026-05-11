t
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

// ────────────────────────────────────────────────
// SOCIAL (사회적인 나): 직장·업무·공식 모임·처음 만나는 사람
// S01~S40
// ────────────────────────────────────────────────
export const VFILE_QUESTIONS_SOCIAL: VFileQuestion[] = [

  // ── A축 (애착) ──────────────────────────────────────────────────
  {
    id: 'S01', type: 'scenario', axis: 'A', context: 'social', reversed: false,
    question: '함께 일하던 동료가 아무 말 없이 갑자기 팀을 옮겼다. 나는...',
    questionEn: 'A colleague you worked closely with suddenly transferred to another team without a word. I...',
    choices: [
      { label: '조직에서 흔한 일이라고 생각하고 별로 신경 쓰지 않는다.', labelEn: 'Think it\'s a normal thing in organizations and don\'t worry much about it.', score: 0 },
      { label: '아쉽긴 하지만 업무에 집중하며 넘긴다.', labelEn: 'Feel a little sorry to see them go but focus on work and move on.', score: 33 },
      { label: '혹시 나 때문에 떠난 건 아닌지 마음에 걸린다.', labelEn: 'Can\'t help wondering if I had something to do with why they left.', score: 66 },
      { label: '연락을 취해서 이유를 확인하고 싶어진다.', labelEn: 'Feel a strong urge to reach out and find out why.', score: 100 },
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
      { label: '직접 찾아가 "어떻게 보셨는지 여쭤봐도 될까요?"라고 확인한다.', labelEn: 'Go find them and ask, "Could I ask what you thought of it?"', score: 100 },
    ],
  },
  {
    id: 'S04', type: 'scenario', axis: 'A', context: 'social', reversed: false,
    question: '업무 협업을 잘 맺어오던 외부 파트너가 최근 연락이 뜸해졌다. 나는...',
    questionEn: 'An external partner you have been collaborating well with has gone quiet recently. I...',
    choices: [
      { label: '프로젝트 일정이 바뀌었겠거니 하고 신경 끈다.', labelEn: 'Assume their schedule changed and think nothing of it.', score: 0 },
      { label: '조금 아쉽지만 연락이 오길 기다린다.', labelEn: 'Feel a little let down but wait for them to reach out.', score: 33 },
      { label: '내가 뭔가 잘못한 건 아닌지 걱정되어 메일을 확인한다.', labelEn: 'Worry I did something wrong and review my emails.', score: 66 },
      { label: '확인 메시지를 먼저 보내서 관계를 다시 잇는다.', labelEn: 'Send a check-in message first to reconnect.', score: 100 },
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
    question: '직장 관계는 업무가 끝나면 자연스럽게 거리를 두는 것이 편하다.',
    questionEn: 'I find it comfortable to naturally keep my distance from work relationships once work is done.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S07', type: 'slider', axis: 'A', context: 'social', reversed: false,
    question: '나는 직장 동료나 업무 관계에서도 상대방이 나를 좋아하는지 확인받고 싶을 때가 있다.',
    questionEn: 'Even in work or professional relationships, I sometimes want reassurance that others like me.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S08', type: 'slider', axis: 'A', context: 'social', reversed: true,
    question: '업무 관계에서는 깊이 연결되는 것보다 적당한 거리감을 유지하는 것이 더 낫다고 느낀다.',
    questionEn: 'In professional relationships, I feel it\'s better to maintain some distance than to connect deeply.',
    sliderMin: '깊게 연결되고 싶다', sliderMax: '거리 유지가 더 낫다',
    sliderMinEn: 'I want to connect deeply', sliderMaxEn: 'I prefer keeping distance',
  },
  {
    id: 'S09', type: 'binary', axis: 'A', context: 'social', reversed: false,
    question: '직장이나 공식 모임에서 내가 더 자주 느끼는 것은?',
    questionEn: 'What do I feel more often at work or in formal settings?',
    choices: [
      { label: '내가 충분히 인정받고 있지 않은 것 같아 불안하다.', labelEn: 'I feel anxious that I\'m not getting enough recognition.', score: 0 },
      { label: '사람들이 너무 가까워지려 하면 불편하다.', labelEn: 'I feel uncomfortable when people try to get too close.', score: 100 },
    ],
  },
  {
    id: 'S10', type: 'binary', axis: 'A', context: 'social', reversed: false,
    question: '함께 일하던 동료가 다른 팀으로 떠났을 때 나는...',
    questionEn: 'When a colleague I worked with moves to another team, I...',
    choices: [
      { label: '연락이 끊기지 않도록 먼저 연락을 이어간다.', labelEn: 'Make the effort to keep in touch so the connection doesn\'t fade.', score: 0 },
      { label: '자연스럽게 서로 멀어지는 것을 받아들인다.', labelEn: 'Accept that we will naturally drift apart.', score: 100 },
    ],
  },

  // ── B축 (소통) ──────────────────────────────────────────────────
  {
    id: 'S11', type: 'scenario', axis: 'B', context: 'social', reversed: false,
    question: '회의에서 내 아이디어가 공개적으로 비판받았다. 나는...',
    questionEn: 'Your idea was publicly criticized in a meeting. I...',
    choices: [
      { label: '불쾌하지만 아무 말도 하지 않는다.', labelEn: 'Feel annoyed but say nothing.', score: 0 },
      { label: '회의 후에 따로 "그 말이 좀 당황스러웠다"고 조용히 전한다.', labelEn: 'Quietly mention after the meeting that the comment caught me off guard.', score: 33 },
      { label: '"다른 관점에서 보면요..."라고 차분히 의견을 덧붙인다.', labelEn: 'Calmly add, "From another angle..."', score: 66 },
      { label: '"제 의도는 이런데요, 어떤 부분이 문제인지 구체적으로 말씀해 주실 수 있나요?"라고 즉시 되묻는다.', labelEn: 'Immediately ask, "Here\'s what I meant — could you tell me specifically what the issue is?"', score: 100 },
    ],
  },
  {
    id: 'S12', type: 'scenario', axis: 'B', context: 'social', reversed: false,
    question: '공식 자리에서 내 생각과 반대되는 의견이 나왔다. 나는...',
    questionEn: 'In a formal setting, someone expresses an opinion that contradicts mine. I...',
    choices: [
      { label: '어색해질까봐 그냥 넘긴다.', labelEn: 'Let it pass to avoid making things awkward.', score: 0 },
      { label: '자리가 끝난 후에 따로 이야기한다.', labelEn: 'Bring it up separately after the session.', score: 33 },
      { label: '"저는 조금 다르게 보는 부분이 있어서요"라고 부드럽게 말한다.', labelEn: 'Softly say, "There\'s a part of this I see a bit differently."', score: 66 },
      { label: '"저는 이렇게 생각하고, 그 이유는 이렇습니다"라고 명확히 말한다.', labelEn: 'Clearly state, "I think this, and here\'s why."', score: 100 },
    ],
  },
  {
    id: 'S13', type: 'scenario', axis: 'B', context: 'social', reversed: false,
    question: '상사가 내 업무를 반복적으로 지적한다. 나는...',
    questionEn: 'Your manager keeps pointing out issues with your work repeatedly. I...',
    choices: [
      { label: '불만이 있어도 묵묵히 수정만 한다.', labelEn: 'Feel frustrated but quietly make the corrections.', score: 0 },
      { label: '"네, 알겠습니다"라고 하면서 속으로만 답답해한다.', labelEn: 'Say "Yes, understood" while feeling frustrated inside.', score: 33 },
      { label: '"제 방식에도 이유가 있는데, 한번 설명드려도 될까요?"라고 말한다.', labelEn: 'Say, "There\'s a reason for my approach — may I explain it?"', score: 66 },
      { label: '"저는 이 방식으로 진행하려 했고, 구체적으로 어떤 부분이 문제인지 여쭤봐도 될까요?"라고 명확히 이야기한다.', labelEn: 'Clearly ask, "I intended to go this way — could you tell me exactly what the concern is?"', score: 100 },
    ],
  },
  {
    id: 'S14', type: 'scenario', axis: 'B', context: 'social', reversed: false,
    question: '업무 협업 중 동료가 합의된 내용을 어겼다. 나는...',
    questionEn: 'A colleague broke an agreed-upon arrangement during a work collaboration. I...',
    choices: [
      { label: '그냥 내가 수습한다. 말했다가 관계가 불편해질 것 같다.', labelEn: 'Just fix it myself. Speaking up might make things awkward.', score: 0 },
      { label: '티는 내지만 직접 말하지는 않는다.', labelEn: 'Show my displeasure but never address it directly.', score: 33 },
      { label: '"지난번에 이야기한 방식과 달라서 확인하고 싶었어요"라고 조용히 말한다.', labelEn: 'Quietly say, "This is different from what we discussed — I wanted to check on that."', score: 66 },
      { label: '"우리가 합의한 내용이 있었는데, 이게 바뀐 건가요?"라고 명확히 짚는다.', labelEn: 'Directly point out, "We had an agreement — has something changed?"', score: 100 },
    ],
  },
  {
    id: 'S15', type: 'slider', axis: 'B', context: 'social', reversed: false,
    question: '나는 직장이나 공식 자리에서 내 의견이나 불편함을 직접 말로 표현하는 편이다.',
    questionEn: 'At work or in formal settings, I tend to express my opinions or discomfort directly.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S16', type: 'slider', axis: 'B', context: 'social', reversed: true,
    question: '직장 상황에서 내 말이 어떻게 받아들여질지 걱정돼서 말하기 전에 오래 망설인다.',
    questionEn: 'In work situations, I hesitate for a long time before speaking because I worry about how my words will land.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S17', type: 'slider', axis: 'B', context: 'social', reversed: false,
    question: '업무 갈등 상황에서 나는 문제를 회피하기보다 직면해서 해결하려고 한다.',
    questionEn: 'In work conflicts, I tend to face the issue head-on rather than avoid it.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S18', type: 'slider', axis: 'B', context: 'social', reversed: true,
    question: '직장 동료나 상사에게도 내 진짜 생각을 잘 꺼내지 못하는 편이다.',
    questionEn: 'Even with colleagues or managers, I tend to struggle to share what I really think.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S19', type: 'binary', axis: 'B', context: 'social', reversed: false,
    question: '직장에서 갈등이 생겼을 때 나는 주로...',
    questionEn: 'When conflict arises at work, I usually...',
    choices: [
      { label: '시간이 지나면 해결될 거라고 생각하며 먼저 꺼내지 않는다.', labelEn: 'Think it will resolve on its own and wait for it to pass.', score: 0 },
      { label: '불편하더라도 먼저 꺼내서 이야기한다.', labelEn: 'Bring it up first, even if it feels uncomfortable.', score: 100 },
    ],
  },
  {
    id: 'S20', type: 'binary', axis: 'B', context: 'social', reversed: false,
    question: '공식적인 자리에서 내 속마음이나 반대 의견을 드러내는 것이...',
    questionEn: 'Revealing my real thoughts or disagreement in a formal setting feels...',
    choices: [
      { label: '조심스럽고 어렵게 느껴진다.', labelEn: 'Careful and difficult.', score: 0 },
      { label: '자연스럽고 필요한 일로 느껴진다.', labelEn: 'Natural and necessary.', score: 100 },
    ],
  },

  // ── C축 (욕구표현) ──────────────────────────────────────────────
  {
    id: 'S21', type: 'scenario', axis: 'C', context: 'social', reversed: false,
    question: '팀 점심 메뉴를 정하는데 내가 원하는 것이 분명히 있다. 나는...',
    questionEn: 'The team is picking a lunch spot and you already know what you want. I...',
    choices: [
      { label: '"다 좋아요, 어디든요"라고 말한다.', labelEn: 'Say, "Anything\'s fine — wherever you all want."', score: 0 },
      { label: '"저는 다 괜찮아요"라고 하며 다른 사람이 정하게 둔다.', labelEn: 'Say, "I\'m okay with anything," and let others decide.', score: 33 },
      { label: '"○○ 어떤가요? 저는 거기가 좋을 것 같아서요"라고 슬쩍 제안한다.', labelEn: 'Casually suggest, "How about ○○? I think that might be nice."', score: 66 },
      { label: '"저는 ○○ 가고 싶어요"라고 바로 말한다.', labelEn: 'Say directly, "I want to go to ○○."', score: 100 },
    ],
  },
  {
    id: 'S22', type: 'scenario', axis: 'C', context: 'social', reversed: false,
    question: '직장 동료가 내가 불편해하는 행동을 계속 반복하고 있다. 나는...',
    questionEn: 'A colleague keeps repeating a behavior you find uncomfortable. I...',
    choices: [
      { label: '내가 예민한 건가 싶어 계속 참는다.', labelEn: 'Wonder if I\'m being oversensitive and keep putting up with it.', score: 0 },
      { label: '내색은 하지만 직접 말하지는 않는다.', labelEn: 'Show that something bothers me but never address it directly.', score: 33 },
      { label: '"그 부분이 저는 조금 불편해서요"라고 한번 이야기한다.', labelEn: 'At some point say, "That part is a little uncomfortable for me."', score: 66 },
      { label: '"그 행동은 제가 불편하게 느껴요, 바꿔주실 수 있을까요?"라고 명확히 말한다.', labelEn: 'Clearly say, "That behavior makes me uncomfortable — could you change it?"', score: 100 },
    ],
  },
  {
    id: 'S23', type: 'scenario', axis: 'C', context: 'social', reversed: false,
    question: '회의에서 내가 원하는 방향이 있지만 다수의 의견이 다르다. 나는...',
    questionEn: 'You have a preferred direction in a meeting, but the majority disagrees. I...',
    choices: [
      { label: '내 의견을 접고 다수를 따른다.', labelEn: 'Drop my preference and go with the majority.', score: 0 },
      { label: '속으로는 동의하지 않지만 표현하지 않는다.', labelEn: 'Disagree internally but keep it to myself.', score: 33 },
      { label: '"저는 이쪽도 검토해볼 만할 것 같아서요"라고 조심스럽게 말한다.', labelEn: 'Carefully say, "I think this direction might be worth considering too."', score: 66 },
      { label: '"저는 ○○ 방향이 더 맞다고 생각하고, 이유는..."이라고 적극 어필한다.', labelEn: 'Actively advocate, "I think ○○ makes more sense, and here\'s why..."', score: 100 },
    ],
  },
  {
    id: 'S24', type: 'scenario', axis: 'C', context: 'social', reversed: false,
    question: '업무가 과중해서 도움이 필요한 상황이다. 나는...',
    questionEn: 'Your workload is overwhelming and you need help. I...',
    choices: [
      { label: '힘들어도 혼자 처리하려고 한다.', labelEn: 'Try to handle everything alone, even if it\'s hard.', score: 0 },
      { label: '힘들다는 티는 내지만 직접 도움을 요청하지는 않는다.', labelEn: 'Signal that I\'m struggling but never directly ask for help.', score: 33 },
      { label: '가까운 동료 한 명에게 조심스럽게 부탁한다.', labelEn: 'Carefully ask one close colleague.', score: 66 },
      { label: '필요하면 망설이지 않고 팀에 도움을 요청한다.', labelEn: 'Ask the team for help without hesitation when I need it.', score: 100 },
    ],
  },
  {
    id: 'S25', type: 'slider', axis: 'C', context: 'social', reversed: false,
    question: '나는 직장이나 공식 자리에서 내가 원하는 것을 직접적으로 요청하는 편이다.',
    questionEn: 'At work or in formal settings, I tend to ask for what I want directly.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S26', type: 'slider', axis: 'C', context: 'social', reversed: true,
    question: '직장에서 내 욕구나 필요를 표현했다가 상대가 불편해할까봐 참는 경우가 많다.',
    questionEn: 'At work, I often hold back from expressing my needs, worried the other person will be uncomfortable.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S27', type: 'slider', axis: 'C', context: 'social', reversed: true,
    question: '직장에서 무언가를 원할 때 그것을 직접 말하기보다 돌려서 표현하는 편이다.',
    questionEn: 'At work, when I want something I tend to hint at it rather than say it directly.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S28', type: 'slider', axis: 'C', context: 'social', reversed: false,
    question: '나는 직장에서 내 필요를 요청하는 것이 관계를 해치지 않는다고 생각한다.',
    questionEn: 'I believe that asking for what I need at work does not damage relationships.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S29', type: 'binary', axis: 'C', context: 'social', reversed: false,
    question: '직장에서 내가 원하는 것이 있을 때...',
    questionEn: 'When I want something at work...',
    choices: [
      { label: '상대가 알아줬으면 하고 기다리는 편이다.', labelEn: 'I hope others will notice and wait for them to.', score: 0 },
      { label: '먼저 말해서 상대가 알 수 있게 한다.', labelEn: 'I say something first so they know.', score: 100 },
    ],
  },
  {
    id: 'S30', type: 'binary', axis: 'C', context: 'social', reversed: false,
    question: '공식 자리에서 내 요구를 표현하는 것이...',
    questionEn: 'Expressing my needs in a formal setting feels...',
    choices: [
      { label: '관계나 분위기를 해칠 것 같아 조심스럽다.', labelEn: 'Risky — like it might harm the relationship or atmosphere.', score: 0 },
      { label: '건강한 협업을 위해 자연스럽고 필요한 일이다.', labelEn: 'Natural and necessary for healthy collaboration.', score: 100 },
    ],
  },

  // ── D축 (역할) ──────────────────────────────────────────────────
  {
    id: 'S31', type: 'scenario', axis: 'D', context: 'social', reversed: false,
    question: '팀에서 새 프로젝트 방향을 정해야 한다. 나는...',
    questionEn: 'Your team needs to set the direction for a new project. I...',
    choices: [
      { label: '다른 사람들이 정하는 대로 따라가는 편이다.', labelEn: 'Go along with whatever others decide.', score: 0 },
      { label: '의견이 있어도 먼저 나서지는 않는다.', labelEn: 'Have opinions but don\'t step up first.', score: 33 },
      { label: '아이디어를 내고 자연스럽게 조율 역할을 맡게 된다.', labelEn: 'Contribute ideas and naturally end up coordinating.', score: 66 },
      { label: '전체 방향을 내가 주도적으로 이끌어 나간다.', labelEn: 'Take the lead and actively drive the overall direction.', score: 100 },
    ],
  },
  {
    id: 'S32', type: 'scenario', axis: 'D', context: 'social', reversed: false,
    question: '업무 회의에서 논의가 잘못된 방향으로 흐르고 있다. 나는...',
    questionEn: 'A work meeting is drifting in the wrong direction. I...',
    choices: [
      { label: '다들 그러면 그런가 보다 하고 따른다.', labelEn: 'Assume everyone else knows better and follow along.', score: 0 },
      { label: '불안하지만 굳이 나서지 않는다.', labelEn: 'Feel uneasy but don\'t bother stepping up.', score: 33 },
      { label: '의견을 내고 방향 수정을 제안한다.', labelEn: 'Voice my concern and suggest a course correction.', score: 66 },
      { label: '주도적으로 논의를 재정비하고 이끈다.', labelEn: 'Take charge and actively redirect the discussion.', score: 100 },
    ],
  },
  {
    id: 'S33', type: 'scenario', axis: 'D', context: 'social', reversed: false,
    question: '팀장이 프로젝트 결정을 팀원들에게 위임했다. 나는...',
    questionEn: 'The team leader delegates a project decision to the team members. I...',
    choices: [
      { label: '다른 팀원이 원하는 게 뭔지 파악해서 그걸 지지한다.', labelEn: 'Figure out what others want and support that.', score: 0 },
      { label: '의견은 있지만 분위기 봐가며 결정한다.', labelEn: 'Have an opinion but read the room before committing.', score: 33 },
      { label: '내 생각을 먼저 말하고 함께 합의를 이끈다.', labelEn: 'Share my thoughts first and guide the team toward a consensus.', score: 66 },
      { label: '내가 가장 잘 알 것 같으니 내가 결정을 주도한다.', labelEn: 'Take the lead on the decision, since I probably know best.', score: 100 },
    ],
  },
  {
    id: 'S34', type: 'scenario', axis: 'D', context: 'social', reversed: false,
    question: '처음 만나는 사람들과 공식 모임이 있다. 대화가 어색하게 흘러가고 있다. 나는...',
    questionEn: 'You are at a formal gathering with people you have never met and the conversation is getting awkward. I...',
    choices: [
      { label: '분위기가 풀릴 때까지 가만히 있는다.', labelEn: 'Stay quiet and wait for the atmosphere to ease.', score: 0 },
      { label: '눈치를 보다가 누군가 나서면 그때 참여한다.', labelEn: 'Read the room and join in once someone else steps up.', score: 33 },
      { label: '분위기를 살리기 위해 화제를 꺼낸다.', labelEn: 'Bring up a topic to liven things up.', score: 66 },
      { label: '자연스럽게 대화를 이끌며 모임의 흐름을 잡는다.', labelEn: 'Naturally guide the conversation and set the tone.', score: 100 },
    ],
  },
  {
    id: 'S35', type: 'slider', axis: 'D', context: 'social', reversed: false,
    question: '나는 직장이나 공식 자리에서 주도적인 역할을 맡는 것이 편하다.',
    questionEn: 'I feel comfortable taking a leading role at work or in formal settings.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S36', type: 'slider', axis: 'D', context: 'social', reversed: true,
    question: '직장에서 다른 사람이 방향을 정해주는 편이 더 편안하다.',
    questionEn: 'At work, I feel more at ease when someone else sets the direction.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S37', type: 'slider', axis: 'D', context: 'social', reversed: false,
    question: '나는 직장에서 업무가 내가 원하는 방식으로 흘러가도록 영향력을 행사하는 편이다.',
    questionEn: 'At work, I tend to exert influence to steer things in the direction I prefer.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S38', type: 'slider', axis: 'D', context: 'social', reversed: false,
    question: '직장이나 공식 자리에서 내가 먼저 방향을 제시하거나 결정을 내리는 경우가 많다.',
    questionEn: 'At work or in formal settings, I often end up being the first to propose a direction or make a call.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'S39', type: 'binary', axis: 'D', context: 'social', reversed: false,
    question: '직장에서 나는...',
    questionEn: 'At work, I...',
    choices: [
      { label: '흐름에 맞추고 상사나 동료를 따라가는 쪽이다.', labelEn: 'Adapt to the flow and follow my manager or colleagues.', score: 0 },
      { label: '방향을 잡고 이끄는 쪽이다.', labelEn: 'Set the direction and take the lead.', score: 100 },
    ],
  },
  {
    id: 'S40', type: 'binary', axis: 'D', context: 'social', reversed: false,
    question: '업무에서 중요한 결정을 앞두고 나는...',
    questionEn: 'Facing an important work decision, I...',
    choices: [
      { label: '상사나 팀의 의견에 따르는 것이 편하다.', labelEn: 'Prefer to defer to my manager or the team\'s opinion.', score: 0 },
      { label: '내가 직접 판단하고 결정하는 것이 더 낫다.', labelEn: 'Prefer to judge and decide for myself.', score: 100 },
    ],
  },
];

// ────────────────────────────────────────────────
// GENERAL (일반적인 나): 평상시·친구·가족이 아는 나
// G01~G40
// ────────────────────────────────────────────────
export const VFILE_QUESTIONS_GENERAL: VFileQuestion[] = [

  // ── A축 (애착) ──────────────────────────────────────────────────
  {
    id: 'G01', type: 'scenario', axis: 'A', context: 'general', reversed: false,
    question: '친한 친구가 평소보다 답장이 많이 늦다. 두 시간째 읽지 않은 메시지가 쌓여 있다. 나는...',
    questionEn: 'A close friend is taking much longer than usual to reply. Messages have been sitting unread for two hours. I...',
    choices: [
      { label: '바쁜가 보다 생각하고 하던 일을 계속한다.', labelEn: 'Figure they must be busy and keep doing what I was doing.', score: 0 },
      { label: '신경 쓰이지만 참고 기다린다.', labelEn: 'It\'s on my mind, but I wait patiently.', score: 33 },
      { label: '혹시 나한테 화난 건 아닌지 불안해진다.', labelEn: 'Start to worry they might be upset with me.', score: 66 },
      { label: '계속 전화를 걸거나 다른 수단으로 연락을 시도한다.', labelEn: 'Keep calling or reach out through other means.', score: 100 },
    ],
  },
  {
    id: 'G02', type: 'scenario', axis: 'A', context: 'general', reversed: false,
    question: '가장 친한 친구가 새로운 친구 무리와 자주 어울리기 시작했다. 나는...',
    questionEn: 'Your best friend has started spending a lot of time with a new group. I...',
    choices: [
      { label: '잘됐다고 생각하고 내 삶에 집중한다.', labelEn: "I'm glad for them and focus on my own life.", score: 0 },
      { label: '예전만큼 연락이 안 되는 게 아쉽지만 크게 신경 쓰지 않는다.', labelEn: 'Miss how we used to connect, but don\'t dwell on it.', score: 33 },
      { label: '"요즘 바빠?"라고 물어보며 관계가 멀어질까 걱정한다.', labelEn: 'Ask if they\'ve been busy, worried our friendship is drifting.', score: 66 },
      { label: '내가 덜 중요해진 것 같아 서운함을 직접 표현한다.', labelEn: 'Tell them directly that I feel like I matter less to them now.', score: 100 },
    ],
  },
  {
    id: 'G03', type: 'scenario', axis: 'A', context: 'general', reversed: false,
    question: '오랜 친구가 중요한 일을 앞두고 "수고해"라고만 짧게 말했다. 나는...',
    questionEn: 'An old friend said just "Good luck" right before something important for you — nothing more. I...',
    choices: [
      { label: '바쁜가 보다 생각하고 넘긴다.', labelEn: 'Figure they must be busy and let it go.', score: 0 },
      { label: '좀 더 응원해줬으면 했지만 말 안 한다.', labelEn: 'Wished for more support but say nothing.', score: 33 },
      { label: '내가 그 친구한테 별로인 건 아닐까 불안해진다.', labelEn: 'Start to wonder if I don\'t mean much to them.', score: 66 },
      { label: '"왜 그렇게 짧게 말하냐"고 바로 물어본다.', labelEn: 'Immediately ask why they said so little.', score: 100 },
    ],
  },
  {
    id: 'G04', type: 'scenario', axis: 'A', context: 'general', reversed: false,
    question: '가족 중 한 명이 최근 나에게 연락을 자주 안 하고 있다. 나는...',
    questionEn: 'A family member has been reaching out much less often lately. I...',
    choices: [
      { label: '각자 바쁠 수 있으니 크게 신경 안 쓴다.', labelEn: 'Figure everyone gets busy and don\'t think much of it.', score: 0 },
      { label: '조금 섭섭하지만 내가 먼저 연락하지는 않는다.', labelEn: 'Feel a little hurt but don\'t reach out myself.', score: 33 },
      { label: '나 때문에 불편한 게 있나 걱정되기 시작한다.', labelEn: 'Start to worry there\'s something I did that made them uncomfortable.', score: 66 },
      { label: '이유를 확인하고 싶어 먼저 연락한다.', labelEn: 'Want to find out why and reach out first.', score: 100 },
    ],
  },
  {
    id: 'G05', type: 'slider', axis: 'A', context: 'general', reversed: false,
    question: '나는 평소 친구나 가족이 나에 대해 어떻게 느끼는지 확인하고 싶을 때가 자주 있다.',
    questionEn: 'I often find myself wanting to check how my friends or family feel about me.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G06', type: 'slider', axis: 'A', context: 'general', reversed: true,
    question: '오래된 친구나 가족과 깊어지는 관계가 때로는 불편하게 느껴진다.',
    questionEn: 'A deepening relationship with old friends or family sometimes feels uncomfortable to me.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G07', type: 'slider', axis: 'A', context: 'general', reversed: false,
    question: '친한 친구나 가족이 나를 떠날 수 있다는 생각이 들면 무언가라도 해야 할 것 같은 느낌이 든다.',
    questionEn: 'When I think a close friend or family member might drift away, I feel a strong urge to do something — anything.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G08', type: 'slider', axis: 'A', context: 'general', reversed: true,
    question: '평소 혼자 있는 시간이 친구나 가족과 함께 있는 시간보다 더 편안하게 느껴진다.',
    questionEn: 'Normally, time alone feels more comfortable to me than time with friends or family.',
    sliderMin: '함께가 더 편함', sliderMax: '혼자가 더 편함',
    sliderMinEn: 'More comfortable with others', sliderMaxEn: 'More comfortable alone',
  },
  {
    id: 'G09', type: 'binary', axis: 'A', context: 'general', reversed: false,
    question: '친구나 가족과의 관계에서 내가 더 자주 경험하는 것은?',
    questionEn: 'What do I experience more often in friendships or family relationships?',
    choices: [
      { label: '상대가 나를 충분히 아껴주지 않는 것 같아 불안하다.', labelEn: 'I feel anxious that they don\'t care about me enough.', score: 0 },
      { label: '상대가 너무 가까이 다가오면 뒤로 물러서고 싶어진다.', labelEn: 'When someone gets too close, I feel the urge to pull back.', score: 100 },
    ],
  },
  {
    id: 'G10', type: 'binary', axis: 'A', context: 'general', reversed: false,
    question: '멀어진 친구를 생각할 때 나는...',
    questionEn: 'When I think of a friend I drifted away from, I...',
    choices: [
      { label: '왜 멀어졌는지, 내가 뭘 잘못했는지 자꾸 되짚는다.', labelEn: 'Keep replaying why we drifted and what I might have done wrong.', score: 0 },
      { label: '그냥 그런 거라고 생각하고 금방 털어낸다.', labelEn: 'Accept that these things happen and move on fairly quickly.', score: 100 },
    ],
  },

  // ── B축 (소통) ──────────────────────────────────────────────────
  {
    id: 'G11', type: 'scenario', axis: 'B', context: 'general', reversed: false,
    question: '친한 친구가 내가 공들인 것을 가볍게 평가했다. 나는...',
    questionEn: 'A close friend made light of something you put a lot of effort into. I...',
    choices: [
      { label: '기분이 나쁘지만 아무 말도 하지 않는다.', labelEn: 'Feel hurt but say nothing.', score: 0 },
      { label: '나중에 "그 말이 좀 상처였어"라고 조용히 전한다.', labelEn: 'Quietly tell them later that the comment hurt me.', score: 33 },
      { label: '그 자리에서 "나는 다르게 생각해"라고 차분히 말한다.', labelEn: 'Calmly say in the moment, "I see it differently."', score: 66 },
      { label: '즉시 "왜 그렇게 말하냐"고 물으며 내 감정을 표현한다.', labelEn: 'Immediately ask why they said that and express how I feel.', score: 100 },
    ],
  },
  {
    id: 'G12', type: 'scenario', axis: 'B', context: 'general', reversed: false,
    question: '가족 모임에서 내 의견과 반대되는 이야기가 나왔다. 나는...',
    questionEn: 'At a family gathering, someone says something that contradicts my view. I...',
    choices: [
      { label: '분위기 때문에 아무 말도 하지 않고 넘긴다.', labelEn: 'Stay quiet to avoid disrupting the mood.', score: 0 },
      { label: '나중에 따로 이야기한다.', labelEn: 'Bring it up privately later.', score: 33 },
      { label: '"나는 좀 다른 것 같은데"라고 부드럽게 말한다.', labelEn: 'Softly say, "I see it a bit differently."', score: 66 },
      { label: '바로 "왜 그렇게 생각해? 나는 이렇게 봐"라고 이야기한다.', labelEn: 'Directly say, "Why do you think that? Here\'s how I see it."', score: 100 },
    ],
  },
  {
    id: 'G13', type: 'scenario', axis: 'B', context: 'general', reversed: false,
    question: '친구가 약속을 또 취소했다. 나는...',
    questionEn: 'A friend cancels plans on you again. I...',
    choices: [
      { label: '짜증나지만 "괜찮아"라고 말한다.', labelEn: "I'm frustrated but say, \"It's fine.\"", score: 0 },
      { label: '"좀 아쉽긴 해"라고 작게 말하고 더 이상 언급하지 않는다.', labelEn: 'Mention briefly that I\'m a little disappointed, then drop it.', score: 33 },
      { label: '"자꾸 이러면 나는 좀 힘들어"라고 솔직하게 말한다.', labelEn: 'Honestly say, "When this keeps happening, it\'s hard for me."', score: 66 },
      { label: '지금까지 쌓인 감정까지 꺼내 제대로 이야기한다.', labelEn: 'Bring up everything that has built up and have a real conversation.', score: 100 },
    ],
  },
  {
    id: 'G14', type: 'scenario', axis: 'B', context: 'general', reversed: false,
    question: '가족 중 한 명이 내 경계를 넘는 행동을 했다 (예: 허락 없이 내 물건을 사용). 나는...',
    questionEn: 'A family member crossed a boundary (e.g., used something of yours without asking). I...',
    choices: [
      { label: '그냥 참는다. 말하면 관계가 어색해질 것 같다.', labelEn: 'Let it go. Saying something would make things awkward.', score: 0 },
      { label: '티는 내지만 직접 말하지는 않는다.', labelEn: 'Show my discomfort but never say it outright.', score: 33 },
      { label: '"그건 미리 물어봐줬으면 좋겠어"라고 조용히 말한다.', labelEn: 'Quietly say, "I\'d appreciate if you asked first next time."', score: 66 },
      { label: '"그건 내 선이야, 다음엔 꼭 물어봐"라고 명확히 말한다.', labelEn: 'Clearly state, "That\'s my boundary — please ask before doing that."', score: 100 },
    ],
  },
  {
    id: 'G15', type: 'slider', axis: 'B', context: 'general', reversed: false,
    question: '나는 친구나 가족에게 내 감정이나 불편함을 직접 말로 표현하는 편이다.',
    questionEn: 'I tend to express my feelings or discomfort to friends and family directly in words.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G16', type: 'slider', axis: 'B', context: 'general', reversed: true,
    question: '친구나 가족과 대화할 때 내 말이 어떻게 받아들여질지 걱정돼서 오래 망설인다.',
    questionEn: 'When talking with friends or family, I hesitate for a long time, worried about how my words will be received.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G17', type: 'slider', axis: 'B', context: 'general', reversed: false,
    question: '친구나 가족과의 갈등에서 나는 문제를 회피하기보다 직면해서 해결하려 한다.',
    questionEn: 'In conflicts with friends or family, I tend to face the issue head-on rather than avoid it.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G18', type: 'slider', axis: 'B', context: 'general', reversed: true,
    question: '오랜 친구나 가족에게도 내 속 이야기를 잘 꺼내지 못하는 편이다.',
    questionEn: 'Even with old friends or family, I tend to struggle to open up about what\'s really inside.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G19', type: 'binary', axis: 'B', context: 'general', reversed: false,
    question: '친구 또는 가족과 갈등이 생겼을 때 나는 주로...',
    questionEn: 'When conflict arises with a friend or family member, I usually...',
    choices: [
      { label: '시간이 지나면 해결될 거라고 생각하며 먼저 꺼내지 않는다.', labelEn: 'Think it will resolve on its own and wait for it to pass.', score: 0 },
      { label: '불편하더라도 먼저 꺼내서 이야기한다.', labelEn: 'Bring it up first, even if it feels uncomfortable.', score: 100 },
    ],
  },
  {
    id: 'G20', type: 'binary', axis: 'B', context: 'general', reversed: false,
    question: '친구나 가족에게 내 속마음을 드러내는 것이...',
    questionEn: 'Revealing my inner thoughts to friends or family feels...',
    choices: [
      { label: '조심스럽고 어렵게 느껴진다.', labelEn: 'Careful and difficult.', score: 0 },
      { label: '자연스럽고 편하게 느껴진다.', labelEn: 'Natural and comfortable.', score: 100 },
    ],
  },

  // ── C축 (욕구표현) ──────────────────────────────────────────────
  {
    id: 'G21', type: 'scenario', axis: 'C', context: 'general', reversed: false,
    question: '친구들과 어디서 만날지 정하는데 내가 가고 싶은 곳이 있다. 나는...',
    questionEn: 'Friends are deciding where to meet and you already have a place in mind. I...',
    choices: [
      { label: '"어디든 좋아, 너희가 정해"라고 말한다.', labelEn: 'Say, "Anywhere\'s fine — you all decide."', score: 0 },
      { label: '"아무데나 괜찮아"라고 하며 다른 사람이 리드하게 둔다.', labelEn: 'Say, "I don\'t mind anywhere," and let others take the lead.', score: 33 },
      { label: '"○○ 어때? 나 거기 가보고 싶었는데"라고 슬쩍 제안한다.', labelEn: 'Casually suggest, "How about ○○? I\'ve been wanting to try it."', score: 66 },
      { label: '"나 ○○ 가고 싶어"라고 바로 말한다.', labelEn: 'Say directly, "I want to go to ○○."', score: 100 },
    ],
  },
  {
    id: 'G22', type: 'scenario', axis: 'C', context: 'general', reversed: false,
    question: '오래 사귄 친구가 내가 싫어하는 행동을 반복하고 있다. 나는...',
    questionEn: 'A long-time friend keeps repeating a behavior you dislike. I...',
    choices: [
      { label: '내가 예민한 건가 싶어 계속 참는다.', labelEn: 'Wonder if I\'m being too sensitive and keep holding it in.', score: 0 },
      { label: '내색은 하지만 직접 말하지는 않는다.', labelEn: 'Show that something is off, but never say it directly.', score: 33 },
      { label: '"그게 나한테는 좀 힘들어"라고 한번 이야기한다.', labelEn: 'At some point say, "That\'s a bit hard for me."', score: 66 },
      { label: '"그 행동은 내가 별로야, 바꿔줘"라고 분명히 말한다.', labelEn: 'Clearly say, "I don\'t like that — please change it."', score: 100 },
    ],
  },
  {
    id: 'G23', type: 'scenario', axis: 'C', context: 'general', reversed: false,
    question: '친구들 사이에서 내가 원하는 것이 있지만 다수의 의견이 다르다. 나는...',
    questionEn: 'Among friends, you have a preference but the majority disagrees. I...',
    choices: [
      { label: '내 의견을 접고 다수를 따른다.', labelEn: 'Drop my preference and go with the majority.', score: 0 },
      { label: '속으로는 원하지 않지만 표현하지 않는다.', labelEn: "Don't want to go along but keep it to myself.", score: 33 },
      { label: '"나는 이쪽이 더 좋은데, 들어볼래?"라고 말한다.', labelEn: 'Say, "I actually prefer this — want to hear why?"', score: 66 },
      { label: '"나는 ○○이 더 맞는 것 같아, 왜냐면..."이라고 적극 어필한다.', labelEn: 'Actively advocate, "I think ○○ makes more sense, because..."', score: 100 },
    ],
  },
  {
    id: 'G24', type: 'scenario', axis: 'C', context: 'general', reversed: false,
    question: '힘든 상황에서 도움이 필요한데 주변 친구에게 부탁하기가 망설여진다. 나는...',
    questionEn: 'You need help in a tough situation but feel hesitant to ask a friend. I...',
    choices: [
      { label: '힘들어도 혼자 해결하려고 한다.', labelEn: 'Try to handle it alone, even if it\'s hard.', score: 0 },
      { label: '돌려서 힌트를 주지만 직접 부탁은 못 한다.', labelEn: 'Drop hints indirectly but never ask outright.', score: 33 },
      { label: '가장 가까운 친구 한 명에게 조심스럽게 부탁한다.', labelEn: 'Carefully ask one close friend.', score: 66 },
      { label: '필요하면 망설이지 않고 부탁한다.', labelEn: 'Ask without hesitation when I need to.', score: 100 },
    ],
  },
  {
    id: 'G25', type: 'slider', axis: 'C', context: 'general', reversed: false,
    question: '나는 친구나 가족에게 내가 원하는 것을 직접적으로 요청하는 편이다.',
    questionEn: 'I tend to ask for what I want from friends or family directly.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G26', type: 'slider', axis: 'C', context: 'general', reversed: true,
    question: '친구나 가족에게 내 욕구나 필요를 표현했다가 부담스러워할까봐 참는 경우가 많다.',
    questionEn: 'I often hold back from expressing my needs to friends or family, worried they will feel burdened.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G27', type: 'slider', axis: 'C', context: 'general', reversed: true,
    question: '친구나 가족 사이에서 내가 무언가를 원할 때 그것을 숨기거나 돌려 말하는 편이다.',
    questionEn: 'When I want something among friends or family, I tend to hide it or hint at it indirectly.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G28', type: 'slider', axis: 'C', context: 'general', reversed: false,
    question: '나는 내 필요를 충족시키는 것이 친구나 가족과의 관계를 해치지 않는다고 생각한다.',
    questionEn: 'I believe that meeting my own needs does not harm my friendships or family relationships.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G29', type: 'binary', axis: 'C', context: 'general', reversed: false,
    question: '친구나 가족 사이에서 내가 원하는 것이 있을 때...',
    questionEn: 'When I want something among friends or family...',
    choices: [
      { label: '상대가 알아줬으면 하고 기다리는 편이다.', labelEn: 'I hope they will notice and wait for them to.', score: 0 },
      { label: '먼저 말해서 상대가 알 수 있게 한다.', labelEn: 'I say something first so they know.', score: 100 },
    ],
  },
  {
    id: 'G30', type: 'binary', axis: 'C', context: 'general', reversed: false,
    question: '친구나 가족에게 내 욕구를 표현하는 것이...',
    questionEn: 'Expressing my needs to friends or family feels...',
    choices: [
      { label: '관계를 불편하게 만들 것 같아서 조심스럽다.', labelEn: 'Risky — like it might make the relationship uncomfortable.', score: 0 },
      { label: '건강한 관계를 위해 자연스럽고 필요한 일이다.', labelEn: 'Natural and necessary for a healthy relationship.', score: 100 },
    ],
  },

  // ── D축 (역할) ──────────────────────────────────────────────────
  {
    id: 'G31', type: 'scenario', axis: 'D', context: 'general', reversed: false,
    question: '친구들과 주말 계획을 짜고 있다. 나는...',
    questionEn: "You're planning the weekend with friends. I...",
    choices: [
      { label: '다른 사람들이 정하는 대로 따라가는 편이다.', labelEn: 'Go along with whatever others decide.', score: 0 },
      { label: '의견이 있어도 먼저 나서지는 않는다.', labelEn: "Have opinions but don't step forward first.", score: 33 },
      { label: '아이디어를 내고 자연스럽게 조율 역할을 맡게 된다.', labelEn: 'Contribute ideas and naturally end up coordinating.', score: 66 },
      { label: '자연스럽게 전체 계획을 내가 주도하게 된다.', labelEn: 'Naturally end up leading the entire planning process.', score: 100 },
    ],
  },
  {
    id: 'G32', type: 'scenario', axis: 'D', context: 'general', reversed: false,
    question: '친구들 모임에서 방향이 잘못 가고 있다고 느꼈다. 나는...',
    questionEn: 'You sense a get-together with friends is heading in the wrong direction. I...',
    choices: [
      { label: '다들 그러면 그런가 보다 하고 따른다.', labelEn: 'Figure everyone else is okay with it and go along.', score: 0 },
      { label: '불편하지만 굳이 나서지 않는다.', labelEn: "Feel uneasy but don't bother stepping up.", score: 33 },
      { label: '다른 의견을 내고 방향 수정을 제안한다.', labelEn: 'Voice my concern and suggest a different direction.', score: 66 },
      { label: '주도적으로 흐름을 바꾼다.', labelEn: 'Take the lead and actively change the direction.', score: 100 },
    ],
  },
  {
    id: 'G33', type: 'scenario', axis: 'D', context: 'general', reversed: false,
    question: '친구가 어떤 것을 함께 결정하자며 나에게 맡겼다. 나는...',
    questionEn: 'A friend hands a decision over to you and asks you to decide together. I...',
    choices: [
      { label: '친구가 원하는 게 뭔지 파악해서 그걸 따른다.', labelEn: 'Figure out what they want and go with that.', score: 0 },
      { label: '의견은 있지만 친구 눈치를 보며 결정한다.', labelEn: "Have an opinion but watch my friend's reaction and decide accordingly.", score: 33 },
      { label: '내 생각을 먼저 말하고 함께 합의한다.', labelEn: 'Share my thoughts first and reach a mutual agreement.', score: 66 },
      { label: '내가 더 잘 알 것 같으니 내가 결정한다.', labelEn: 'Decide myself, since I probably know best.', score: 100 },
    ],
  },
  {
    id: 'G34', type: 'scenario', axis: 'D', context: 'general', reversed: false,
    question: '아는 사람들과 모임이 있는데 대화가 어색하게 흘러가고 있다. 나는...',
    questionEn: "You're at a gathering with people you know and the conversation is getting awkward. I...",
    choices: [
      { label: '분위기가 풀릴 때까지 가만히 있는다.', labelEn: 'Stay quiet and wait for the atmosphere to ease.', score: 0 },
      { label: '눈치를 보다가 누군가 나서면 그때 참여한다.', labelEn: 'Read the room and join in once someone else steps up.', score: 33 },
      { label: '분위기를 살리기 위해 화제를 꺼낸다.', labelEn: 'Bring up a topic to liven things up.', score: 66 },
      { label: '자연스럽게 대화를 이끌며 모임의 흐름을 잡는다.', labelEn: "Naturally guide the conversation and set the group's tone.", score: 100 },
    ],
  },
  {
    id: 'G35', type: 'slider', axis: 'D', context: 'general', reversed: false,
    question: '나는 친구나 가족 사이에서 주도적인 역할을 맡는 것이 편하다.',
    questionEn: 'I feel comfortable taking a leading role among friends or family.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G36', type: 'slider', axis: 'D', context: 'general', reversed: true,
    question: '평소 관계에서 다른 사람이 방향을 정해주는 편이 더 편안하다.',
    questionEn: 'In everyday relationships, I feel more at ease when someone else sets the direction.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G37', type: 'slider', axis: 'D', context: 'general', reversed: false,
    question: '나는 친구 무리나 가족 안에서 흐름이 내가 원하는 방식으로 흘러가도록 영향력을 행사하는 편이다.',
    questionEn: 'Among friends or family, I tend to exert influence to steer things in the direction I prefer.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G38', type: 'slider', axis: 'D', context: 'general', reversed: false,
    question: '친구나 가족과의 상황에서 내가 먼저 방향을 제시하거나 결정을 내리게 되는 경우가 많다.',
    questionEn: 'With friends or family, I often end up being the first to propose a direction or make a decision.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'G39', type: 'binary', axis: 'D', context: 'general', reversed: false,
    question: '친구나 가족 사이에서 나는...',
    questionEn: 'Among friends or family, I...',
    choices: [
      { label: '흐름에 맞추고 상대를 따라가는 쪽이다.', labelEn: 'Adapt to the flow and follow the other person.', score: 0 },
      { label: '방향을 잡고 이끄는 쪽이다.', labelEn: 'Set the direction and take the lead.', score: 100 },
    ],
  },
  {
    id: 'G40', type: 'binary', axis: 'D', context: 'general', reversed: false,
    question: '친구나 가족과 관련된 중요한 결정을 앞두고 나는...',
    questionEn: 'Facing an important decision involving friends or family, I...',
    choices: [
      { label: '상대방 또는 다수의 의견에 따르는 것이 편하다.', labelEn: 'Prefer to defer to the other person or the majority.', score: 0 },
      { label: '내가 직접 판단하고 결정하는 것이 더 낫다.', labelEn: 'Prefer to judge and decide for myself.', score: 100 },
    ],
  },
];

// ────────────────────────────────────────────────
// SECRET (비밀스러운 나): 나만 아는 모습·연인·가장 솔직한 내면
// T01~T40
// ────────────────────────────────────────────────
export const VFILE_QUESTIONS_SECRET: VFileQuestion[] = [

  // ── A축 (애착) ──────────────────────────────────────────────────
  {
    id: 'T01', type: 'scenario', axis: 'A', context: 'secret', reversed: false,
    question: '연인이 평소보다 답장이 늦다. 두 시간째 읽지 않은 메시지가 쌓여 있다. 나는...',
    questionEn: 'Your partner is taking longer than usual to reply. Messages have been sitting unread for two hours. I...',
    choices: [
      { label: '별일 없겠지, 하던 일 계속한다.', labelEn: 'They must be busy — I keep doing what I was doing.', score: 0 },
      { label: '신경 쓰이지만 참고 기다린다.', labelEn: "It's on my mind, but I wait patiently.", score: 33 },
      { label: '혹시 나한테 화난 건 아닌지 불안해진다.', labelEn: 'I start to worry they might be upset with me.', score: 66 },
      { label: '계속 전화를 걸거나 다른 SNS로 연락을 시도한다.', labelEn: 'I keep calling or reach out through other platforms.', score: 100 },
    ],
  },
  {
    id: 'T02', type: 'scenario', axis: 'A', context: 'secret', reversed: false,
    question: '연인이 나 몰래 오랜 친구와 만났다는 것을 나중에 알게 됐다. 나는...',
    questionEn: 'You find out later that your partner met an old friend without mentioning it to you. I...',
    choices: [
      { label: '당연히 그럴 수 있다고 생각하고 별 신경 안 쓴다.', labelEn: 'Think that\'s completely fine and don\'t think much of it.', score: 0 },
      { label: '조금 서운하지만 말하지 않는다.', labelEn: 'Feel a little hurt but say nothing.', score: 33 },
      { label: '왜 말 안 했는지 이유가 궁금해지고 불안해진다.', labelEn: 'Start to feel uneasy and wonder why they didn\'t mention it.', score: 66 },
      { label: '"왜 나한테 말 안 했어?"라고 바로 물어본다.', labelEn: 'Immediately ask, "Why didn\'t you tell me?"', score: 100 },
    ],
  },
  {
    id: 'T03', type: 'scenario', axis: 'A', context: 'secret', reversed: false,
    question: '중요한 발표 직후 파트너가 "수고했어"라고만 짧게 말했다. 나는...',
    questionEn: 'Right after an important moment, your partner just said "Well done" — nothing more. I...',
    choices: [
      { label: '피곤한가 보다 생각하고 넘긴다.', labelEn: 'I figure they must be tired and let it go.', score: 0 },
      { label: '좀 더 격려해줬으면 했지만 말 안 한다.', labelEn: 'I wished for more support but say nothing.', score: 33 },
      { label: '내가 잘 못한 걸로 여기는 건 아닐까 불안해진다.', labelEn: 'I start to worry they think I did poorly.', score: 66 },
      { label: '"왜 그렇게 짧게 말하냐"고 바로 되묻는다.', labelEn: 'I immediately ask why they said so little.', score: 100 },
    ],
  },
  {
    id: 'T04', type: 'scenario', axis: 'A', context: 'secret', reversed: false,
    question: '연인이 퇴근 후 혼자 있고 싶다고 했다. 나는...',
    questionEn: 'After work, your partner says they want some alone time. I...',
    choices: [
      { label: '당연히 그럴 수 있다고 생각하며 각자 시간을 갖는다.', labelEn: 'I think that makes total sense and give us each our space.', score: 0 },
      { label: '조금 섭섭하지만 존중한다.', labelEn: "I feel a little hurt but respect their need.", score: 33 },
      { label: '나한테 지쳤거나 관계가 식은 건 아닌지 마음이 불편해진다.', labelEn: 'I feel uneasy, wondering if they are tired of me or if things are cooling off.', score: 66 },
      { label: '혼자 있고 싶은 이유를 자꾸 물어보게 된다.', labelEn: 'I keep asking why they want to be alone.', score: 100 },
    ],
  },
  {
    id: 'T05', type: 'slider', axis: 'A', context: 'secret', reversed: false,
    question: '나는 연인이나 가장 가까운 사람이 나에 대해 어떻게 느끼는지 자주 확인하고 싶어진다.',
    questionEn: 'I often find myself wanting to check how my partner or closest person feels about me.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T06', type: 'slider', axis: 'A', context: 'secret', reversed: true,
    question: '연인과 관계가 깊어질수록 오히려 불편함이나 두려움이 생긴다.',
    questionEn: 'The deeper my relationship with a partner gets, the more discomfort or fear I feel.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T07', type: 'slider', axis: 'A', context: 'secret', reversed: false,
    question: '연인이 나를 떠날 수 있다는 생각이 들면 무언가라도 해야 할 것 같은 느낌이 든다.',
    questionEn: 'When I think my partner might leave, I feel a strong urge to do something — anything.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T08', type: 'slider', axis: 'A', context: 'secret', reversed: true,
    question: '혼자 있는 시간이 연인과 함께 있는 시간보다 더 편안하게 느껴진다.',
    questionEn: 'Time alone feels more comfortable to me than time with my partner.',
    sliderMin: '연인과 함께가 더 편함', sliderMax: '혼자가 더 편함',
    sliderMinEn: 'More comfortable with partner', sliderMaxEn: 'More comfortable alone',
  },
  {
    id: 'T09', type: 'binary', axis: 'A', context: 'secret', reversed: false,
    question: '연인 관계에서 내가 더 자주 경험하는 것은?',
    questionEn: 'Which do I experience more often in romantic relationships?',
    choices: [
      { label: '상대가 나를 충분히 사랑하지 않는 것 같아 불안하다.', labelEn: "I feel anxious that my partner doesn't love me enough.", score: 0 },
      { label: '상대가 너무 가까이 다가오면 뒤로 물러서고 싶어진다.', labelEn: 'When they get too close, I feel the urge to pull back.', score: 100 },
    ],
  },
  {
    id: 'T10', type: 'binary', axis: 'A', context: 'secret', reversed: false,
    question: '헤어진 연인을 생각할 때 나는...',
    questionEn: 'When I think of an ex-partner, I...',
    choices: [
      { label: '그 사람이 왜 떠났는지, 내가 뭘 잘못했는지 자꾸 되짚는다.', labelEn: 'Keep replaying why they left and what I might have done wrong.', score: 0 },
      { label: '그냥 그런 거라고 생각하고 금방 털어낸다.', labelEn: 'Accept that these things happen and move on fairly quickly.', score: 100 },
    ],
  },

  // ── B축 (소통) ──────────────────────────────────────────────────
  {
    id: 'T11', type: 'scenario', axis: 'B', context: 'secret', reversed: false,
    question: '연인이 나의 가장 예민한 부분을 무심코 건드렸다. 나는...',
    questionEn: 'Your partner inadvertently touches on your most sensitive point. I...',
    choices: [
      { label: '기분이 상했지만 아무 말도 하지 않는다.', labelEn: 'Feel hurt but say nothing.', score: 0 },
      { label: '나중에 "그 말이 좀 마음에 걸렸어"라고 조용히 전한다.', labelEn: 'Quietly tell them later that the comment stayed with me.', score: 33 },
      { label: '그 자리에서 "그건 나한테 좀 민감한 부분이야"라고 차분히 말한다.', labelEn: 'Calmly say in the moment, "That\'s a sensitive area for me."', score: 66 },
      { label: '즉시 "그 말은 상처가 됐어"라고 분명하게 표현한다.', labelEn: 'Immediately say clearly, "That hurt me."', score: 100 },
    ],
  },
  {
    id: 'T12', type: 'scenario', axis: 'B', context: 'secret', reversed: false,
    question: '나 혼자 속으로만 알고 있던 감정이나 생각이 있다. 연인이 "요즘 어때?"라고 물었다. 나는...',
    questionEn: 'You have been holding onto a feeling or thought entirely to yourself. Your partner asks, "How have you been lately?" I...',
    choices: [
      { label: '"괜찮아"라고만 말하고 넘긴다.', labelEn: 'Just say "I\'m fine" and move on.', score: 0 },
      { label: '"좀 복잡한 거 있는데..."라고 말끝을 흐린다.', labelEn: 'Say, "There\'s some stuff going on..." and trail off.', score: 33 },
      { label: '핵심은 아니지만 주변 이야기를 살짝 꺼낸다.', labelEn: 'Share something around it, but not the core of it.', score: 66 },
      { label: '솔직하게 내 감정이나 생각을 털어놓는다.', labelEn: 'Open up honestly about what I\'ve been feeling or thinking.', score: 100 },
    ],
  },
  {
    id: 'T13', type: 'scenario', axis: 'B', context: 'secret', reversed: false,
    question: '파트너가 약속을 또 취소했다. 나는...',
    questionEn: 'Your partner cancels plans on you again. I...',
    choices: [
      { label: '짜증나지만 "괜찮아"라고 말한다.', labelEn: "I'm frustrated but say, \"It's fine.\"", score: 0 },
      { label: '"좀 아쉽긴 해"라고 작게 말하고 더 이상 언급하지 않는다.', labelEn: 'I mention briefly that I\'m a little disappointed, then drop it.', score: 33 },
      { label: '"자꾸 이러면 나는 힘들어"라고 솔직하게 말한다.', labelEn: 'I honestly say, "When this keeps happening, it\'s hard for me."', score: 66 },
      { label: '지금까지 쌓인 감정까지 꺼내 제대로 이야기한다.', labelEn: 'I bring up everything that has built up and have a real conversation.', score: 100 },
    ],
  },
  {
    id: 'T14', type: 'scenario', axis: 'B', context: 'secret', reversed: false,
    question: '연인이 나만 아는 내 취약한 모습을 봤을 때 나는...',
    questionEn: 'Your partner catches a glimpse of your most vulnerable side — something only you usually know about yourself. I...',
    choices: [
      { label: '서둘러 감추거나 화제를 돌린다.', labelEn: 'Quickly hide it or change the subject.', score: 0 },
      { label: '어색하게 웃으며 대수롭지 않은 척한다.', labelEn: 'Laugh it off awkwardly and pretend it\'s nothing.', score: 33 },
      { label: '조금 불편하지만 있는 그대로 두고 가볍게 인정한다.', labelEn: 'Feel a little uncomfortable but leave it as is and acknowledge it lightly.', score: 66 },
      { label: '이 참에 솔직하게 그 부분을 더 이야기한다.', labelEn: 'Take it as an opportunity to open up and talk about that part of me more honestly.', score: 100 },
    ],
  },
  {
    id: 'T15', type: 'slider', axis: 'B', context: 'secret', reversed: false,
    question: '나는 연인이나 가장 가까운 사람에게 내 감정이나 불편함을 직접 말로 표현하는 편이다.',
    questionEn: 'I tend to express my feelings or discomfort to my partner or closest person directly in words.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T16', type: 'slider', axis: 'B', context: 'secret', reversed: true,
    question: '가장 사랑하는 사람에게도 내 진짜 감정이 어떻게 받아들여질지 걱정돼서 말하기 전에 오래 망설인다.',
    questionEn: 'Even with the person I love most, I hesitate for a long time before sharing my real feelings, worried about how they will be received.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T17', type: 'slider', axis: 'B', context: 'secret', reversed: false,
    question: '연인과의 갈등 상황에서 나는 문제를 회피하기보다 직면해서 해결하려고 한다.',
    questionEn: 'In conflicts with my partner, I tend to face the issue head-on rather than avoid it.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T18', type: 'slider', axis: 'B', context: 'secret', reversed: true,
    question: '연인에게도 나의 가장 깊은 내면의 이야기는 잘 꺼내지 못하는 편이다.',
    questionEn: 'Even with my partner, I tend to struggle to bring up the deepest parts of my inner world.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T19', type: 'binary', axis: 'B', context: 'secret', reversed: false,
    question: '연인과 갈등이 생겼을 때 나는 주로...',
    questionEn: 'When conflict arises with my partner, I usually...',
    choices: [
      { label: '시간이 지나면 해결될 거라고 생각하며 먼저 꺼내지 않는다.', labelEn: 'Think it will resolve on its own and wait for it to pass.', score: 0 },
      { label: '불편하더라도 먼저 꺼내서 이야기한다.', labelEn: 'Bring it up first, even if it feels uncomfortable.', score: 100 },
    ],
  },
  {
    id: 'T20', type: 'binary', axis: 'B', context: 'secret', reversed: false,
    question: '연인에게 내 가장 솔직한 속마음을 드러내는 것이...',
    questionEn: 'Revealing my most honest inner feelings to my partner feels...',
    choices: [
      { label: '조심스럽고 두렵게 느껴진다.', labelEn: 'Careful and scary.', score: 0 },
      { label: '자연스럽고 편하게 느껴진다.', labelEn: 'Natural and comfortable.', score: 100 },
    ],
  },

  // ── C축 (욕구표현) ──────────────────────────────────────────────
  {
    id: 'T21', type: 'scenario', axis: 'C', context: 'secret', reversed: false,
    question: '연인과 저녁 메뉴를 고를 때 내가 먹고 싶은 게 분명히 있다. 나는...',
    questionEn: "When choosing dinner with your partner, you already know what you want. I...",
    choices: [
      { label: '"뭐든 좋아, 네가 정해"라고 말한다.', labelEn: '"Anything\'s fine — you decide."', score: 0 },
      { label: '"아무거나 괜찮긴 한데"라고 말하며 상대가 리드하도록 둔다.', labelEn: '"I don\'t really mind" — and let them take the lead.', score: 33 },
      { label: '"나는 ○○ 생각났는데, 어때?"라고 슬쩍 제안한다.', labelEn: '"I was thinking ○○ — what do you think?"', score: 66 },
      { label: '"나 오늘 ○○ 먹고 싶어"라고 바로 말한다.', labelEn: '"I want ○○ tonight." — straight out.', score: 100 },
    ],
  },
  {
    id: 'T22', type: 'scenario', axis: 'C', context: 'secret', reversed: false,
    question: '오래 사귄 파트너가 내가 싫어하는 행동을 반복하고 있다. 나는...',
    questionEn: 'Your long-term partner keeps repeating a behavior you dislike. I...',
    choices: [
      { label: '내가 예민한 건가 싶어 계속 참는다.', labelEn: 'Wonder if I\'m being too sensitive and keep holding it in.', score: 0 },
      { label: '내색은 하지만 직접 말로 표현하지는 않는다.', labelEn: 'Show that something is off, but never say it directly.', score: 33 },
      { label: '"그게 나한테는 좀 힘들어"라고 한 번쯤 이야기한다.', labelEn: 'At some point say, "That\'s a bit hard for me."', score: 66 },
      { label: '"그 행동은 내가 좋지 않아, 바꿔줘"라고 분명히 말한다.', labelEn: 'Clearly say, "I don\'t like that behavior — please change it."', score: 100 },
    ],
  },
  {
    id: 'T23', type: 'scenario', axis: 'C', context: 'secret', reversed: false,
    question: '연인과 함께할 때 내가 원하는 방식이 있지만 연인의 의견이 다르다. 나는...',
    questionEn: 'You have a preference for how to spend time together, but your partner has a different idea. I...',
    choices: [
      { label: '내 의견을 접고 연인을 따른다.', labelEn: 'Drop my preference and go along with my partner.', score: 0 },
      { label: '속으로는 원하지 않지만 표현하지 않는다.', labelEn: "Don't want to go along but keep it to myself.", score: 33 },
      { label: '"나는 이쪽이 더 좋은데, 어때?"라고 말한다.', labelEn: 'Say, "I\'d actually prefer this — what do you think?"', score: 66 },
      { label: '"나는 ○○이 더 좋아, 왜냐면..."이라고 적극적으로 표현한다.', labelEn: 'Actively express, "I really prefer ○○, because..."', score: 100 },
    ],
  },
  {
    id: 'T24', type: 'scenario', axis: 'C', context: 'secret', reversed: false,
    question: '내 안에 오래 쌓인 욕구가 있는데, 연인이 먼저 채워주길 기다리고 있었다. 나는...',
    questionEn: 'You have a need that has been building up inside you, and you have been waiting for your partner to meet it. I...',
    choices: [
      { label: '계속 기다린다. 말하지 않아도 알아줘야 한다고 생각한다.', labelEn: 'Keep waiting. I think they should be able to tell without me saying anything.', score: 0 },
      { label: '힌트를 주거나 돌려서 표현해본다.', labelEn: 'Drop hints or express it indirectly.', score: 33 },
      { label: '조심스럽지만 "나 이런 게 필요해"라고 한번 말해본다.', labelEn: 'Carefully say, "I need this from you."', score: 66 },
      { label: '망설이지 않고 "나한테 이게 필요해, 해줄 수 있어?"라고 직접 말한다.', labelEn: 'Say directly without hesitation, "I need this — can you do that for me?"', score: 100 },
    ],
  },
  {
    id: 'T25', type: 'slider', axis: 'C', context: 'secret', reversed: false,
    question: '나는 연인에게 내가 원하는 것을 직접적으로 요청하는 편이다.',
    questionEn: 'I tend to ask my partner for what I want directly.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T26', type: 'slider', axis: 'C', context: 'secret', reversed: true,
    question: '연인에게 내 욕구나 필요를 표현했다가 부담스러워할까봐 참는 경우가 많다.',
    questionEn: 'I often hold back from expressing my needs to my partner, worried they will feel burdened.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T27', type: 'slider', axis: 'C', context: 'secret', reversed: true,
    question: '연인 관계에서 내가 무언가를 원할 때 그것을 숨기거나 돌려 말하는 편이다.',
    questionEn: 'When I want something in my romantic relationship, I tend to hide it or hint at it indirectly.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T28', type: 'slider', axis: 'C', context: 'secret', reversed: false,
    question: '나는 내 필요를 충족시키는 것이 연인 관계를 해치지 않는다고 생각한다.',
    questionEn: 'I believe that meeting my own needs does not harm my romantic relationship.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T29', type: 'binary', axis: 'C', context: 'secret', reversed: false,
    question: '연인 관계 안에서 내가 원하는 것이 있을 때...',
    questionEn: 'When I want something within my romantic relationship...',
    choices: [
      { label: '연인이 알아줬으면 하고 기다리는 편이다.', labelEn: 'I hope my partner will notice and wait for them to.', score: 0 },
      { label: '먼저 말해서 연인이 알 수 있게 한다.', labelEn: 'I say something first so they know.', score: 100 },
    ],
  },
  {
    id: 'T30', type: 'binary', axis: 'C', context: 'secret', reversed: false,
    question: '연인에게 내 욕구를 표현하는 것이...',
    questionEn: 'Expressing my needs to my partner feels...',
    choices: [
      { label: '관계를 불편하게 만들 것 같아서 조심스럽다.', labelEn: 'Risky — like it might make things uncomfortable between us.', score: 0 },
      { label: '건강한 관계를 위해 자연스럽고 필요한 일이다.', labelEn: 'Natural and necessary for a healthy relationship.', score: 100 },
    ],
  },

  // ── D축 (역할) ──────────────────────────────────────────────────
  {
    id: 'T31', type: 'scenario', axis: 'D', context: 'secret', reversed: false,
    question: '연인과 여행 계획을 짜고 있다. 나는...',
    questionEn: "You're planning a trip with your partner. I...",
    choices: [
      { label: '연인이 정하는 대로 따라가는 편이다.', labelEn: 'Go along with whatever my partner decides.', score: 0 },
      { label: '의견이 있어도 먼저 나서지는 않는다.', labelEn: "Have opinions but don't step forward first.", score: 33 },
      { label: '아이디어를 내고 자연스럽게 조율 역할을 맡게 된다.', labelEn: 'Contribute ideas and naturally end up coordinating.', score: 66 },
      { label: '전체 계획을 내가 자연스럽게 주도하게 된다.', labelEn: 'Naturally end up leading the entire planning process.', score: 100 },
    ],
  },
  {
    id: 'T32', type: 'scenario', axis: 'D', context: 'secret', reversed: false,
    question: '연인과의 관계에서 방향이 잘못 가고 있다고 느꼈다. 나는...',
    questionEn: 'You sense that your relationship is heading in the wrong direction. I...',
    choices: [
      { label: '연인이 원하면 그런가 보다 하고 따른다.', labelEn: 'If that\'s what my partner wants, I just go along with it.', score: 0 },
      { label: '불안하지만 굳이 나서지 않는다.', labelEn: "Feel uneasy but don't bother stepping up.", score: 33 },
      { label: '내 생각을 말하며 변화를 제안한다.', labelEn: 'Share my thoughts and suggest a change.', score: 66 },
      { label: '관계 방향을 내가 주도적으로 바꾸려 한다.', labelEn: 'Take the lead and actively work to redirect the relationship.', score: 100 },
    ],
  },
  {
    id: 'T33', type: 'scenario', axis: 'D', context: 'secret', reversed: false,
    question: '연인이 관계의 방향에 대해 결정을 내게 맡겼다. 나는...',
    questionEn: 'Your partner leaves a relationship decision entirely up to you. I...',
    choices: [
      { label: '연인이 원하는 게 뭔지 파악해서 그걸 따른다.', labelEn: 'Figure out what they want and go with that.', score: 0 },
      { label: '의견은 있지만 연인 눈치를 보며 결정한다.', labelEn: "Have an opinion but watch my partner's reaction and decide accordingly.", score: 33 },
      { label: '내 생각을 먼저 말하고 함께 합의한다.', labelEn: 'Share my thoughts first and reach a mutual agreement.', score: 66 },
      { label: '내가 더 잘 알 것 같으니 내가 결정한다.', labelEn: 'Decide myself, since I probably know best.', score: 100 },
    ],
  },
  {
    id: 'T34', type: 'scenario', axis: 'D', context: 'secret', reversed: false,
    question: '연인과 단둘이 있을 때 분위기가 어색하게 흘러가고 있다. 나는...',
    questionEn: "You're alone with your partner and the atmosphere has gotten awkward. I...",
    choices: [
      { label: '상대가 먼저 풀어주기를 기다린다.', labelEn: 'Wait for my partner to break the ice.', score: 0 },
      { label: '눈치를 보다가 연인이 뭔가 하면 그때 따라간다.', labelEn: 'Watch and wait, then follow along once my partner does something.', score: 33 },
      { label: '분위기를 살리기 위해 먼저 화제를 꺼낸다.', labelEn: 'Bring up something first to ease the mood.', score: 66 },
      { label: '자연스럽게 대화를 이끌며 분위기를 바꾼다.', labelEn: 'Naturally take the lead in conversation and shift the mood.', score: 100 },
    ],
  },
  {
    id: 'T35', type: 'slider', axis: 'D', context: 'secret', reversed: false,
    question: '나는 연인 관계에서 주도적인 역할을 맡는 것이 편하다.',
    questionEn: 'I feel comfortable taking a leading role in my romantic relationship.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T36', type: 'slider', axis: 'D', context: 'secret', reversed: true,
    question: '연인이 관계의 방향을 정해주는 편이 더 편안하다.',
    questionEn: 'I feel more at ease when my partner sets the direction in our relationship.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T37', type: 'slider', axis: 'D', context: 'secret', reversed: false,
    question: '나는 연인 관계가 내가 원하는 방식으로 흘러가도록 영향력을 행사하는 편이다.',
    questionEn: 'I tend to exert influence to steer my romantic relationship in the direction I prefer.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T38', type: 'slider', axis: 'D', context: 'secret', reversed: false,
    question: '연인과의 상황에서 내가 먼저 방향을 제시하거나 결정을 내리게 되는 경우가 많다.',
    questionEn: 'In situations with my partner, I often end up being the first to propose a direction or make a decision.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'T39', type: 'binary', axis: 'D', context: 'secret', reversed: false,
    question: '연인 관계에서 나는...',
    questionEn: 'In my romantic relationship, I...',
    choices: [
      { label: '흐름에 맞추고 연인을 따라가는 쪽이다.', labelEn: 'Adapt to the flow and follow my partner.', score: 0 },
      { label: '방향을 잡고 이끄는 쪽이다.', labelEn: 'Set the direction and take the lead.', score: 100 },
    ],
  },
  {
    id: 'T40', type: 'binary', axis: 'D', context: 'secret', reversed: false,
    question: '연인과의 중요한 결정을 앞두고 나는...',
    questionEn: 'Facing an important decision with my partner, I...',
    choices: [
      { label: '연인의 의견에 따르는 것이 편하다.', labelEn: "Prefer to defer to my partner's opinion.", score: 0 },
      { label: '내가 직접 판단하고 결정하는 것이 더 낫다.', labelEn: 'Prefer to judge and decide for myself.', score: 100 },
    ],
  },
];

// ────────────────────────────────────────────────
// 하위 호환 export
// ────────────────────────────────────────────────
/** @deprecated Use VFILE_QUESTIONS_SOCIAL instead */
export const VFILE_QUESTIONS: VFileQuestion[] = VFILE_QUESTIONS_SOCIAL;

