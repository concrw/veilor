export type QuestionType = 'scenario' | 'slider' | 'binary';
export type Axis = 'A' | 'B' | 'C' | 'D';

export interface VFileQuestion {
  id: string;         // Q01~Q40
  type: QuestionType;
  axis: Axis;
  reversed: boolean;  // true이면 100-점수로 역전
  question: string;
  questionEn?: string;
  choices?: { label: string; labelEn?: string; score: number }[]; // scenario(4지) / binary(2지)
  sliderMin?: string; // slider 양끝 레이블
  sliderMax?: string;
  sliderMinEn?: string;
  sliderMaxEn?: string;
}

export const VFILE_QUESTIONS: VFileQuestion[] = [
  // ── A축 (애착) ──────────────────────────────────────────────────
  {
    id: 'Q01', type: 'scenario', axis: 'A', reversed: false,
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
    id: 'Q02', type: 'scenario', axis: 'A', reversed: false,
    question: '가까운 친구가 새로운 친구 무리와 자주 어울리기 시작했다. 나는...',
    questionEn: 'A close friend has started spending a lot of time with a new group. I...',
    choices: [
      { label: '잘됐다고 생각하고 내 삶에 집중한다.', labelEn: "I'm glad for them and focus on my own life.", score: 0 },
      { label: '예전만큼 연락이 안 되는 게 아쉽지만 크게 신경 쓰지 않는다.', labelEn: "I miss how we used to connect, but don't dwell on it.", score: 33 },
      { label: '슬쩍 "요즘 바쁘냐"고 물어보며 관계가 멀어질까 걱정한다.', labelEn: 'I casually ask if they\'ve been busy, worried our friendship is drifting.', score: 66 },
      { label: '그 친구가 나를 덜 중요하게 여기는 것 같아 서운함을 직접 표현한다.', labelEn: 'I tell them directly that I feel like I matter less to them.', score: 100 },
    ],
  },
  {
    id: 'Q03', type: 'scenario', axis: 'A', reversed: false,
    question: '중요한 발표 직후 파트너가 "수고했어"라고만 짧게 말했다. 나는...',
    questionEn: 'Right after an important presentation, your partner just said "Good job" — nothing more. I...',
    choices: [
      { label: '피곤한가 보다 생각하고 넘긴다.', labelEn: 'I figure they must be tired and let it go.', score: 0 },
      { label: '좀 더 격려해줬으면 했지만 말 안 한다.', labelEn: 'I wished for more encouragement but say nothing.', score: 33 },
      { label: '내가 잘 못한 걸로 여기는 건 아닐까 불안해진다.', labelEn: 'I start to worry they think I did poorly.', score: 66 },
      { label: '"왜 그렇게 짧게 말하냐"고 바로 되묻는다.', labelEn: 'I immediately ask why they said so little.', score: 100 },
    ],
  },
  {
    id: 'Q04', type: 'scenario', axis: 'A', reversed: false,
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
    id: 'Q05', type: 'slider', axis: 'A', reversed: false,
    question: '나는 상대방이 나에 대해 어떻게 느끼는지 확인하고 싶을 때가 자주 있다.',
    questionEn: 'I often find myself wanting to check how my partner feels about me.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'Q06', type: 'slider', axis: 'A', reversed: true,
    question: '친밀한 관계가 깊어질수록 오히려 불편함이나 두려움이 생긴다.',
    questionEn: 'The deeper an intimate relationship gets, the more discomfort or fear I feel.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'Q07', type: 'slider', axis: 'A', reversed: false,
    question: '상대방이 나를 떠날 수 있다는 생각이 들면 무언가라도 해야 할 것 같은 느낌이 든다.',
    questionEn: 'When I think my partner might leave, I feel a strong urge to do something — anything.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'Q08', type: 'slider', axis: 'A', reversed: true,
    question: '혼자 있는 시간이 관계 안에 있는 시간보다 더 편안하게 느껴진다.',
    questionEn: 'Time alone feels more comfortable to me than time within a relationship.',
    sliderMin: '관계 안이 더 편함', sliderMax: '혼자가 더 편함',
    sliderMinEn: 'More comfortable in a relationship', sliderMaxEn: 'More comfortable alone',
  },
  {
    id: 'Q09', type: 'binary', axis: 'A', reversed: false,
    question: '관계에서 내가 더 자주 경험하는 것은?',
    questionEn: 'Which do I experience more often in relationships?',
    choices: [
      { label: '상대가 나를 충분히 사랑하지 않는 것 같아 불안하다.', labelEn: "I feel anxious that my partner doesn't love me enough.", score: 0 },
      { label: '상대가 너무 가까이 다가오면 뒤로 물러서고 싶어진다.', labelEn: 'When someone gets too close, I feel the urge to pull back.', score: 100 },
    ],
  },
  {
    id: 'Q10', type: 'binary', axis: 'A', reversed: false,
    question: '헤어진 연인 또는 멀어진 친구를 생각할 때 나는...',
    questionEn: 'When I think of an ex or a friend I drifted away from, I...',
    choices: [
      { label: '그 사람이 왜 떠났는지, 내가 뭘 잘못했는지 자꾸 되짚는다.', labelEn: 'Keep replaying why they left and what I might have done wrong.', score: 0 },
      { label: '그냥 그런 거라고 생각하고 금방 털어낸다.', labelEn: 'Accept that these things happen and move on fairly quickly.', score: 100 },
    ],
  },

  // ── B축 (소통) ──────────────────────────────────────────────────
  {
    id: 'Q11', type: 'scenario', axis: 'B', reversed: false,
    question: '친한 동료가 내가 시간을 많이 들인 기획안을 공개적으로 비판했다. 나는...',
    questionEn: 'A close colleague publicly criticized a proposal you worked hard on. I...',
    choices: [
      { label: '기분이 나쁘지만 아무 말도 하지 않는다.', labelEn: "I feel hurt but say nothing.", score: 0 },
      { label: '나중에 따로 "그 말이 좀 상처였어"라고 조용히 전한다.', labelEn: 'Later, I quietly tell them that what they said hurt me.', score: 33 },
      { label: '그 자리에서 "나는 다르게 생각해"라고 차분히 말한다.', labelEn: 'I calmly say in the moment, "I see it differently."', score: 66 },
      { label: '즉시 왜 그렇게 생각하는지 구체적으로 반박하고 내 입장을 밝힌다.', labelEn: 'I immediately push back with specifics and make my position clear.', score: 100 },
    ],
  },
  {
    id: 'Q12', type: 'scenario', axis: 'B', reversed: false,
    question: '모임에서 내 의견과 반대되는 이야기가 나왔다. 나는...',
    questionEn: 'At a gathering, someone says something that contradicts my view. I...',
    choices: [
      { label: '어색해질까봐 아무 말도 하지 않고 넘긴다.', labelEn: 'Stay quiet to avoid making things awkward.', score: 0 },
      { label: '분위기 봐서 나중에 따로 얘기한다.', labelEn: 'Read the room and bring it up privately later.', score: 33 },
      { label: '"나는 좀 다른 것 같은데"라고 부드럽게 말한다.', labelEn: 'Softly say, "I think I see it a bit differently."', score: 66 },
      { label: '바로 "왜 그렇게 생각하는지, 내 생각은 이렇다"고 이야기한다.', labelEn: 'Directly say, "Here\'s why I disagree — this is my take."', score: 100 },
    ],
  },
  {
    id: 'Q13', type: 'scenario', axis: 'B', reversed: false,
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
    id: 'Q14', type: 'scenario', axis: 'B', reversed: false,
    question: '누군가가 내 경계를 넘는 행동을 했다 (예: 허락 없이 내 물건을 사용). 나는...',
    questionEn: 'Someone crossed a boundary (e.g., used something of mine without asking). I...',
    choices: [
      { label: '그냥 참는다. 말하면 관계가 어색해질 것 같다.', labelEn: 'Let it go. Saying something would make things awkward.', score: 0 },
      { label: '티는 내지만 직접 말하지는 않는다.', labelEn: 'Show my discomfort but never say it outright.', score: 33 },
      { label: '"그건 미리 물어봐줬으면 좋겠어"라고 조용히 말한다.', labelEn: 'Quietly say, "I\'d appreciate if you asked first next time."', score: 66 },
      { label: '"그건 내 선이야, 다음엔 꼭 물어봐"라고 명확히 말한다.', labelEn: 'Clearly state, "That\'s my boundary — please ask before doing that."', score: 100 },
    ],
  },
  {
    id: 'Q15', type: 'slider', axis: 'B', reversed: false,
    question: '나는 내 감정이나 불편함을 상대방에게 직접 말로 표현하는 편이다.',
    questionEn: 'I tend to express my feelings or discomfort to others directly in words.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'Q16', type: 'slider', axis: 'B', reversed: true,
    question: '대화할 때 상대방이 내 말을 어떻게 받아들일지 걱정돼서 말하기 전에 오래 망설인다.',
    questionEn: "I hesitate for a long time before speaking because I'm worried about how the other person will receive my words.",
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'Q17', type: 'slider', axis: 'B', reversed: false,
    question: '갈등 상황에서 나는 문제를 회피하기보다 직면해서 해결하려고 한다.',
    questionEn: 'In conflicts, I tend to face the issue head-on rather than avoid it.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'Q18', type: 'slider', axis: 'B', reversed: true,
    question: '중요한 사람에게도 내 속 이야기를 잘 꺼내지 못하는 편이다.',
    questionEn: 'Even with people I care about, I tend to struggle to open up about what\'s really inside.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'Q19', type: 'binary', axis: 'B', reversed: false,
    question: '갈등이 생겼을 때 나는 주로...',
    questionEn: 'When conflict arises, I usually...',
    choices: [
      { label: '시간이 지나면 해결될 거라고 생각하며 먼저 꺼내지 않는다.', labelEn: 'Think it will resolve on its own and wait for it to pass.', score: 0 },
      { label: '불편하더라도 먼저 꺼내서 이야기한다.', labelEn: 'Bring it up first, even if it feels uncomfortable.', score: 100 },
    ],
  },
  {
    id: 'Q20', type: 'binary', axis: 'B', reversed: false,
    question: '친밀한 관계에서 내 속마음을 드러내는 것이...',
    questionEn: 'Revealing my inner feelings in close relationships feels...',
    choices: [
      { label: '조심스럽고 어렵게 느껴진다.', labelEn: 'Careful and difficult.', score: 0 },
      { label: '자연스럽고 편하게 느껴진다.', labelEn: 'Natural and comfortable.', score: 100 },
    ],
  },

  // ── C축 (욕구표현) ──────────────────────────────────────────────
  {
    id: 'Q21', type: 'scenario', axis: 'C', reversed: false,
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
    id: 'Q22', type: 'scenario', axis: 'C', reversed: false,
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
    id: 'Q23', type: 'scenario', axis: 'C', reversed: false,
    question: '모임에서 내가 원하는 것이 있지만 다수의 의견이 다르다. 나는...',
    questionEn: "You have a preference at a group gathering, but the majority disagrees. I...",
    choices: [
      { label: '내 의견을 접고 다수를 따른다.', labelEn: 'Drop my preference and go with the majority.', score: 0 },
      { label: '속으로는 원하지 않지만 표현하지 않는다.', labelEn: "Don't want to go along but keep it to myself.", score: 33 },
      { label: '"저는 이쪽이 좋은데 의견 들어도 될까요?" 한다.', labelEn: '"I actually prefer this — mind if I share why?"', score: 66 },
      { label: '"저는 ○○이 더 맞는 것 같아요, 이유는..."이라고 적극 어필한다.', labelEn: '"I think ○○ makes more sense, and here\'s why..." — I advocate actively.', score: 100 },
    ],
  },
  {
    id: 'Q24', type: 'scenario', axis: 'C', reversed: false,
    question: '도움이 필요한 순간인데 주변 사람에게 부탁하기가 망설여진다. 나는...',
    questionEn: "You need help but feel hesitant to ask someone. I...",
    choices: [
      { label: '힘들어도 혼자 해결하려고 한다.', labelEn: 'Try to handle it alone, even if it\'s hard.', score: 0 },
      { label: '돌려서 힌트를 주지만 직접 부탁은 못 한다.', labelEn: 'Drop hints indirectly but never ask outright.', score: 33 },
      { label: '가까운 한 명에게 조심스럽게 부탁한다.', labelEn: 'Carefully ask one close person.', score: 66 },
      { label: '필요하면 망설이지 않고 부탁한다.', labelEn: "Ask without hesitation when I need to.", score: 100 },
    ],
  },
  {
    id: 'Q25', type: 'slider', axis: 'C', reversed: false,
    question: '나는 내가 원하는 것을 상대방에게 직접적으로 요청하는 편이다.',
    questionEn: 'I tend to ask for what I want from others directly.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'Q26', type: 'slider', axis: 'C', reversed: true,
    question: '내 욕구나 필요를 표현했다가 상대가 부담스러워할까봐 참는 경우가 많다.',
    questionEn: 'I often hold back from expressing my needs, worried the other person will feel burdened.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'Q27', type: 'slider', axis: 'C', reversed: true,
    question: '관계에서 내가 무언가를 원할 때 그것을 숨기거나 돌려 말하는 편이다.',
    questionEn: 'When I want something in a relationship, I tend to hide it or hint at it indirectly.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'Q28', type: 'slider', axis: 'C', reversed: false,
    question: '나는 내 필요를 충족시키는 것이 관계를 해치지 않는다고 생각한다.',
    questionEn: 'I believe that meeting my own needs does not harm my relationships.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'Q29', type: 'binary', axis: 'C', reversed: false,
    question: '관계 안에서 내가 원하는 것이 있을 때...',
    questionEn: 'When I want something within a relationship...',
    choices: [
      { label: '상대가 알아줬으면 하고 기다리는 편이다.', labelEn: 'I hope they will notice and wait for them to.', score: 0 },
      { label: '먼저 말해서 상대가 알 수 있게 한다.', labelEn: 'I say something first so they know.', score: 100 },
    ],
  },
  {
    id: 'Q30', type: 'binary', axis: 'C', reversed: false,
    question: '내 욕구를 표현하는 것이...',
    questionEn: 'Expressing my needs feels...',
    choices: [
      { label: '관계를 불편하게 만들 것 같아서 조심스럽다.', labelEn: 'Risky — like it might make the relationship uncomfortable.', score: 0 },
      { label: '건강한 관계를 위해 자연스럽고 필요한 일이다.', labelEn: 'Natural and necessary for a healthy relationship.', score: 100 },
    ],
  },

  // ── D축 (역할) ──────────────────────────────────────────────────
  {
    id: 'Q31', type: 'scenario', axis: 'D', reversed: false,
    question: '친구들과 여행 계획을 짜고 있다. 나는...',
    questionEn: "You're planning a trip with friends. I...",
    choices: [
      { label: '다른 사람들이 정하는 대로 따라가는 편이다.', labelEn: 'Go along with whatever others decide.', score: 0 },
      { label: '의견이 있어도 먼저 나서지는 않는다.', labelEn: "Have opinions but don't step forward first.", score: 33 },
      { label: '아이디어를 내고 조율 역할을 맡게 된다.', labelEn: 'Contribute ideas and naturally end up coordinating.', score: 66 },
      { label: '자연스럽게 전체 계획을 내가 주도하게 된다.', labelEn: 'Naturally end up leading the entire planning process.', score: 100 },
    ],
  },
  {
    id: 'Q32', type: 'scenario', axis: 'D', reversed: false,
    question: '팀 프로젝트에서 방향이 잘못 가고 있다고 느꼈다. 나는...',
    questionEn: 'You sense a team project is heading in the wrong direction. I...',
    choices: [
      { label: '다들 그러면 그런가 보다 하고 따른다.', labelEn: 'Figure everyone else must know better and follow along.', score: 0 },
      { label: '불안하지만 굳이 나서지 않는다.', labelEn: "Feel uneasy but don't bother stepping up.", score: 33 },
      { label: '의견을 내고 수정을 제안한다.', labelEn: 'Voice my concern and suggest a course correction.', score: 66 },
      { label: '주도적으로 재구성을 이끈다.', labelEn: 'Take the lead and actively restructure the direction.', score: 100 },
    ],
  },
  {
    id: 'Q33', type: 'scenario', axis: 'D', reversed: false,
    question: '연인이 관계의 방향에 대해 결정을 내게 맡겼다. 나는...',
    questionEn: 'Your partner leaves a relationship decision entirely up to you. I...',
    choices: [
      { label: '상대가 원하는 게 뭔지 파악해서 그걸 따른다.', labelEn: 'Figure out what they want and go with that.', score: 0 },
      { label: '의견은 있지만 상대 눈치를 보며 결정한다.', labelEn: "Have an opinion but watch their reaction and decide accordingly.", score: 33 },
      { label: '내 생각을 먼저 말하고 함께 합의한다.', labelEn: 'Share my thoughts first and reach a mutual agreement.', score: 66 },
      { label: '내가 더 잘 알 것 같으니 내가 결정한다.', labelEn: 'Decide myself, since I probably know best.', score: 100 },
    ],
  },
  {
    id: 'Q34', type: 'scenario', axis: 'D', reversed: false,
    question: '처음 만나는 사람들과 모임이 있다. 대화가 어색하게 흘러가고 있다. 나는...',
    questionEn: "You're at a gathering with people you've never met and the conversation is getting awkward. I...",
    choices: [
      { label: '분위기가 풀릴 때까지 가만히 있는다.', labelEn: 'Stay quiet and wait for the atmosphere to ease.', score: 0 },
      { label: '눈치를 보다가 누군가 나서면 그때 참여한다.', labelEn: 'Read the room and join in once someone else steps up.', score: 33 },
      { label: '분위기를 살리기 위해 화제를 꺼낸다.', labelEn: 'Bring up a topic to liven things up.', score: 66 },
      { label: '자연스럽게 대화를 이끌며 모임의 흐름을 잡는다.', labelEn: "Naturally guide the conversation and set the group's tone.", score: 100 },
    ],
  },
  {
    id: 'Q35', type: 'slider', axis: 'D', reversed: false,
    question: '나는 관계에서 주도적인 역할을 맡는 것이 편하다.',
    questionEn: 'I feel comfortable taking a leading role in relationships.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'Q36', type: 'slider', axis: 'D', reversed: true,
    question: '상대방이 관계의 방향을 정해주는 편이 더 편안하다.',
    questionEn: 'I feel more at ease when someone else sets the direction in the relationship.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'Q37', type: 'slider', axis: 'D', reversed: false,
    question: '나는 내가 원하는 방식대로 관계가 흘러가도록 영향력을 행사하는 편이다.',
    questionEn: 'I tend to exert influence to steer relationships in the direction I prefer.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'Q38', type: 'slider', axis: 'D', reversed: false,
    question: '그룹 상황에서 내가 먼저 방향을 제시하거나 결정을 내리게 되는 경우가 많다.',
    questionEn: 'In group settings, I often end up being the first to propose a direction or make a decision.',
    sliderMin: '전혀 아니다', sliderMax: '매우 그렇다',
    sliderMinEn: 'Not at all', sliderMaxEn: 'Very much so',
  },
  {
    id: 'Q39', type: 'binary', axis: 'D', reversed: false,
    question: '관계에서 나는...',
    questionEn: 'In relationships, I...',
    choices: [
      { label: '흐름에 맞추고 상대를 따라가는 쪽이다.', labelEn: 'Adapt to the flow and follow the other person.', score: 0 },
      { label: '방향을 잡고 이끄는 쪽이다.', labelEn: 'Set the direction and take the lead.', score: 100 },
    ],
  },
  {
    id: 'Q40', type: 'binary', axis: 'D', reversed: false,
    question: '중요한 결정을 앞두고 나는...',
    questionEn: 'Facing an important decision, I...',
    choices: [
      { label: '상대방 또는 다수의 의견에 따르는 것이 편하다.', labelEn: "Prefer to defer to my partner or the majority's opinion.", score: 0 },
      { label: '내가 직접 판단하고 결정하는 것이 더 낫다.', labelEn: 'Prefer to judge and decide for myself.', score: 100 },
    ],
  },
];
