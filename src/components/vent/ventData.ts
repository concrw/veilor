export const EMOTIONS = [
  { label: '불안해',     svg: 'anxious'  },
  { label: '슬퍼',      svg: 'sad'      },
  { label: '화가 나',   svg: 'angry'    },
  { label: '혼란스러워', svg: 'confused' },
  { label: '외로워',    svg: 'lonely'   },
  { label: '무감각해',  svg: 'numb'     },
  { label: '지쳐',      svg: 'tired'    },
  { label: '상처받았어', svg: 'hurt'    },
];

export const EMO_DATA: Record<string, { count: number; questions: [string, string][]; suggestion: string }> = {
  '불안해':    { count: 142, questions: [["지금 불안함을 느끼는군요. 무슨 일이 있었나요?","부드럽게 · 여기 있어요"],["언제부터 그랬어요? 무슨 계기가 있었나요?","천천히 함께해요"],["불안이 몸 어디에서 느껴져요?","궁금해요 · 가까이 있을게요"],["혹시 두려운 게 있어요?","서두르지 않아도 돼요"]], suggestion: "많은 불안을 안고 계시네요. 두려운 것을 써보면 조금 느슨해질 수 있어요." },
  '슬퍼':     { count: 98,  questions: [["마음이 무거운 것 같아요. 무슨 일이에요?","조용히 · 듣고 있어요"],["얼마나 됐어요, 이 감정이?","함께예요 · 서두르지 않아도 돼요"],["중심에 있는 사람이나 상황이 있어요?","부드럽게 · 여기 있어요"],["이 슬픔이 말을 할 수 있다면 뭐라고 할 것 같아요?","궁금해요 · 여기 있어요"]], suggestion: "슬픔이 찾아왔네요. 가끔은 온전히 느끼는 것만으로도 조금씩 지나가요." },
  '화가 나':  { count: 76,  questions: [["화가 나는 게 당연해요. 무슨 일이에요?","함께예요 · 판단하지 않아요"],["누구 때문인지, 아니면 어떤 상황 때문인지요?","직접적으로 · 듣고 있어요"],["필요했는데 받지 못한 게 뭐였어요?","뿌리를 찾아가요"],["화 아래에 다른 감정이 있지 않을까요?","조심스럽게 · 가까이 있을게요"]], suggestion: "화가 있었네요. 화는 종종 충족되지 못한 욕구를 보호하는 방식이에요." },
  '혼란스러워':{ count: 54,  questions: [["혼란스러울 때, 가장 크게 맴도는 질문이 뭐예요?","천천히 · 서두르지 않아도 돼요"],["상황 때문인지, 관계 때문인지, 아니면 나 때문인지요?","여기 있어요"],["기대했는데 일어나지 않은 게 뭐예요?","같이 명확해져가요"],["지금 덜 막힌 느낌이 들려면 뭐가 필요해요?","궁금해요 · 함께예요"]], suggestion: "혼란은 종종 변화 사이에 있다는 신호예요. 알던 나와 아직 만들어지는 나 사이에 있는 거예요." },
  '외로워':   { count: 218, questions: [["외로움이 참 무겁죠. 어떤 종류의 외로움이에요?","조용히 · 여기 있어요"],["특정 사람 때문인지, 아니면 전반적인 느낌인지요?","판단하지 않아요 · 여기 있어요"],["언제 가장 강하게 느껴요?","부드럽게 궁금해요"],["혼자가 아닌 상태는 어떤 모습일 것 같아요?","같이 상상해봐요"]], suggestion: "외로움이 많이 찾아왔네요. 이름을 붙이는 것만으로도 조금 가벼워질 수 있어요." },
  '무감각해': { count: 63,  questions: [["무감각함은 더 깊은 게 있을 때 오기도 해요. 언제부터였어요?","부드럽게 · 서두르지 않아도 돼요"],["밀어내고 있는 감정이 있어요?","조심스럽게 · 여기 있어요"],["예전엔 살아있었는데 지금은 평평한 게 뭐예요?","궁금해요 · 천천히 볼게요"],["다시 뭔가를 느끼려면 뭐가 필요할 것 같아요?","함께예요 · 가까이 있을게요"]], suggestion: "무감각함은 너무 많이 느낀 뒤 찾아오는 보호예요. 억지로 빠져나오려 하지 않아도 돼요." },
  '지쳐':     { count: 187, questions: [["지침에도 여러 종류가 있죠. 어떤 종류의 지침이에요?","따뜻하게 · 여기서 쉬어요"],["몸이 지친 건지, 마음이 지친 건지, 둘 다인지요?","궁금해요 · 부드럽게"],["요즘 가장 에너지를 빼앗아 가는 게 뭐예요?","뿌리를 찾아가요"],["진짜 쉬는 게 어떤 모습일 것 같아요?","같이 상상해봐요"]], suggestion: "많이 소진됐네요. 쉰다는 건 잠만이 아니에요 — 뭔가를 내려놓는 것이기도 해요." },
  '상처받았어':{ count: 89,  questions: [["상처받은 게 느껴져요. 무슨 일이에요?","조심스럽게 · 듣고 있어요"],["어떤 사람과 있었던 일이에요?","서두르지 않아도 돼요"],["예상했던 건지, 갑자기 온 건지요?","함께예요 · 부드럽게"],["조금 더 안전하게 느끼려면 뭐가 필요해요?","궁금해요 · 여기 있어요"]], suggestion: "상처가 있었네요. 일어난 일에 이름을 붙이는 것이 혼자 안고 있지 않는 첫 걸음이에요." },
};

export const QUICK_CARDS = [
  { key: 'relationship', text: '가까운 사람과 무슨 일이 있었어', emo: '상처받았어' },
  { key: 'work',         text: '해야 할 일이 자꾸 마음에 걸려', emo: '불안해' },
  { key: 'self',         text: '딱히 뭐라고 할 수 없는데 뭔가 이상해', emo: '무감각해' },
  { key: 'body',         text: '몸이 무겁고 피곤하고 어딘가 조여', emo: '지쳐' },
];

export const LAYER_GROUPS = [
  { id: 'social', label: '사회적인 나', sub: '직장, 처음 만남, SNS, 공식적인 자리',
    items: [
      { id: 'social_work',     label: '직장 / 학교에서의 나', sensitive: false },
      { id: 'social_stranger', label: '처음 만나는 사람 앞',  sensitive: false },
      { id: 'social_sns',      label: 'SNS에서의 나',         sensitive: false },
      { id: 'social_formal',   label: '공식적인 자리에서',    sensitive: false },
    ],
  },
  { id: 'daily', label: '일반적인 나', sub: '가족, 친한 친구, 연인, 혼자',
    items: [
      { id: 'daily_family',  label: '가족 안에서의 나',     sensitive: false },
      { id: 'daily_friend',  label: '친한 친구 앞에서',     sensitive: false },
      { id: 'daily_partner', label: '연인 / 파트너 앞에서', sensitive: true  },
      { id: 'daily_alone',   label: '혼자 있을 때의 나',    sensitive: false },
    ],
  },
  { id: 'secret', label: '비밀스러운 나', sub: '감정적 비밀, 관계적 비밀, 욕망, 수치심, 야망',
    items: [
      { id: 'secret_emotion',  label: '감정적 비밀',      sensitive: true,  locked: false },
      { id: 'secret_relation', label: '관계적 비밀',      sensitive: true,  locked: false },
      { id: 'secret_desire',   label: '욕망 / 성적 영역', sensitive: true,  locked: true  },
      { id: 'secret_shame',    label: '수치심 영역',      sensitive: true,  locked: true  },
      { id: 'secret_ambition', label: '야망 / 욕심 영역', sensitive: false, locked: false },
    ],
  },
];

export const COMM_GROUPS = [
  { title: '사람들 속에서 혼자인 사람들', count: 98,  desc: '함께 있어도 연결이 안 되는 느낌' },
  { title: '지금 이유없이 불안한 사람들', count: 142, desc: '뚜렷한 이유 없이 올라오는 불안 패턴' },
  { title: '잘 지내야 한다고 느끼는 사람들', count: 67, desc: '감정을 숨기고 버티는 패턴' },
];

export function getTimeGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 9)  return { title: '좋은 아침이에요.',   placeholder: '지금 어떤 마음이에요?' };
  if (h >= 9  && h < 12) return { title: '오전이네요.',         placeholder: '지금 어떤 마음이에요?' };
  if (h >= 12 && h < 14) return { title: '점심 즈음이에요.',    placeholder: '지금 기분이 어떤가요?' };
  if (h >= 14 && h < 18) return { title: '오후예요.',           placeholder: '지금 무슨 생각하고 있어요?' };
  if (h >= 18 && h < 21) return { title: '저녁이에요.',          placeholder: '오늘 하루 어떠셨어요?' };
  if (h >= 21 && h < 24) return { title: '밤이 깊었네요.',       placeholder: '지금 어떤 마음이에요?' };
  return { title: '한밤중이에요.', placeholder: '지금 무슨 생각을 하고 있어요?' };
}
