export const EMOTIONS = [
  { label: { ko: '불안해',     en: 'Anxious'   }, svg: 'anxious'  },
  { label: { ko: '슬퍼',      en: 'Sad'       }, svg: 'sad'      },
  { label: { ko: '화가 나',   en: 'Angry'     }, svg: 'angry'    },
  { label: { ko: '혼란스러워', en: 'Confused'  }, svg: 'confused' },
  { label: { ko: '외로워',    en: 'Lonely'    }, svg: 'lonely'   },
  { label: { ko: '무감각해',  en: 'Numb'      }, svg: 'numb'     },
  { label: { ko: '지쳐',      en: 'Exhausted' }, svg: 'tired'    },
  { label: { ko: '상처받았어', en: 'Hurt'      }, svg: 'hurt'     },
];

export const EMO_DATA: Record<string, {
  count: number;
  questions: [{ ko: string; en: string }, { ko: string; en: string }][];
  suggestion: { ko: string; en: string };
}> = {
  '불안해': {
    count: 142,
    questions: [
      [{ ko: "지금 불안함을 느끼는군요. 무슨 일이 있었나요?", en: "You seem to be feeling anxious. What happened?" },
       { ko: "부드럽게 · 여기 있어요", en: "Gently · I'm here" }],
      [{ ko: "언제부터 그랬어요? 무슨 계기가 있었나요?", en: "When did it start? Was there a trigger?" },
       { ko: "천천히 함께해요", en: "Taking it slowly together" }],
      [{ ko: "불안이 몸 어디에서 느껴져요?", en: "Where do you feel the anxiety in your body?" },
       { ko: "궁금해요 · 가까이 있을게요", en: "Curious · staying close" }],
      [{ ko: "혹시 두려운 게 있어요?", en: "Is there something you're afraid of?" },
       { ko: "서두르지 않아도 돼요", en: "No need to rush" }],
    ],
    suggestion: { ko: "많은 불안을 안고 계시네요. 두려운 것을 써보면 조금 느슨해질 수 있어요.", en: "You're carrying a lot of anxiety. Writing down what scares you might help loosen it a little." },
  },
  '슬퍼': {
    count: 98,
    questions: [
      [{ ko: "마음이 무거운 것 같아요. 무슨 일이에요?", en: "Your heart seems heavy. What's going on?" },
       { ko: "조용히 · 듣고 있어요", en: "Quietly · listening" }],
      [{ ko: "얼마나 됐어요, 이 감정이?", en: "How long have you been feeling this way?" },
       { ko: "함께예요 · 서두르지 않아도 돼요", en: "I'm here · no need to rush" }],
      [{ ko: "중심에 있는 사람이나 상황이 있어요?", en: "Is there a person or situation at the center of this?" },
       { ko: "부드럽게 · 여기 있어요", en: "Gently · I'm here" }],
      [{ ko: "이 슬픔이 말을 할 수 있다면 뭐라고 할 것 같아요?", en: "If this sadness could speak, what do you think it would say?" },
       { ko: "궁금해요 · 여기 있어요", en: "Curious · I'm here" }],
    ],
    suggestion: { ko: "슬픔이 찾아왔네요. 가끔은 온전히 느끼는 것만으로도 조금씩 지나가요.", en: "Sadness has come to visit. Sometimes just fully feeling it is enough for it to slowly pass." },
  },
  '화가 나': {
    count: 76,
    questions: [
      [{ ko: "화가 나는 게 당연해요. 무슨 일이에요?", en: "It makes sense that you're angry. What happened?" },
       { ko: "함께예요 · 판단하지 않아요", en: "I'm here · no judgment" }],
      [{ ko: "누구 때문인지, 아니면 어떤 상황 때문인지요?", en: "Is it because of someone, or a situation?" },
       { ko: "직접적으로 · 듣고 있어요", en: "Directly · listening" }],
      [{ ko: "필요했는데 받지 못한 게 뭐였어요?", en: "What did you need but didn't receive?" },
       { ko: "뿌리를 찾아가요", en: "Going to the root" }],
      [{ ko: "화 아래에 다른 감정이 있지 않을까요?", en: "Could there be another feeling beneath the anger?" },
       { ko: "조심스럽게 · 가까이 있을게요", en: "Carefully · staying close" }],
    ],
    suggestion: { ko: "화가 있었네요. 화는 종종 충족되지 못한 욕구를 보호하는 방식이에요.", en: "There was anger here. Anger is often a way of protecting unmet needs." },
  },
  '혼란스러워': {
    count: 54,
    questions: [
      [{ ko: "혼란스러울 때, 가장 크게 맴도는 질문이 뭐예요?", en: "When you feel confused, what question keeps circling in your mind?" },
       { ko: "천천히 · 서두르지 않아도 돼요", en: "Slowly · no need to rush" }],
      [{ ko: "상황 때문인지, 관계 때문인지, 아니면 나 때문인지요?", en: "Is it the situation, a relationship, or something inside you?" },
       { ko: "여기 있어요", en: "I'm here" }],
      [{ ko: "기대했는데 일어나지 않은 게 뭐예요?", en: "What did you expect to happen that didn't?" },
       { ko: "같이 명확해져가요", en: "Getting clearer together" }],
      [{ ko: "지금 덜 막힌 느낌이 들려면 뭐가 필요해요?", en: "What do you need to feel less stuck right now?" },
       { ko: "궁금해요 · 함께예요", en: "Curious · I'm here" }],
    ],
    suggestion: { ko: "혼란은 종종 변화 사이에 있다는 신호예요. 알던 나와 아직 만들어지는 나 사이에 있는 거예요.", en: "Confusion is often a signal that you're between changes — between the self you knew and the one still forming." },
  },
  '외로워': {
    count: 218,
    questions: [
      [{ ko: "외로움이 참 무겁죠. 어떤 종류의 외로움이에요?", en: "Loneliness is so heavy. What kind of loneliness is this?" },
       { ko: "조용히 · 여기 있어요", en: "Quietly · I'm here" }],
      [{ ko: "특정 사람 때문인지, 아니면 전반적인 느낌인지요?", en: "Is it because of a specific person, or a general feeling?" },
       { ko: "판단하지 않아요 · 여기 있어요", en: "No judgment · I'm here" }],
      [{ ko: "언제 가장 강하게 느껴요?", en: "When do you feel it most strongly?" },
       { ko: "부드럽게 궁금해요", en: "Gently curious" }],
      [{ ko: "혼자가 아닌 상태는 어떤 모습일 것 같아요?", en: "What would not being alone look like for you?" },
       { ko: "같이 상상해봐요", en: "Let's imagine together" }],
    ],
    suggestion: { ko: "외로움이 많이 찾아왔네요. 이름을 붙이는 것만으로도 조금 가벼워질 수 있어요.", en: "Loneliness has been visiting a lot. Just naming it can make it a little lighter." },
  },
  '무감각해': {
    count: 63,
    questions: [
      [{ ko: "무감각함은 더 깊은 게 있을 때 오기도 해요. 언제부터였어요?", en: "Numbness sometimes comes when something deeper is there. When did it start?" },
       { ko: "부드럽게 · 서두르지 않아도 돼요", en: "Gently · no need to rush" }],
      [{ ko: "밀어내고 있는 감정이 있어요?", en: "Is there a feeling you're pushing away?" },
       { ko: "조심스럽게 · 여기 있어요", en: "Carefully · I'm here" }],
      [{ ko: "예전엔 살아있었는데 지금은 평평한 게 뭐예요?", en: "What used to feel alive but now feels flat?" },
       { ko: "궁금해요 · 천천히 볼게요", en: "Curious · taking it slow" }],
      [{ ko: "다시 뭔가를 느끼려면 뭐가 필요할 것 같아요?", en: "What do you think you'd need to feel something again?" },
       { ko: "함께예요 · 가까이 있을게요", en: "I'm here · staying close" }],
    ],
    suggestion: { ko: "무감각함은 너무 많이 느낀 뒤 찾아오는 보호예요. 억지로 빠져나오려 하지 않아도 돼요.", en: "Numbness is a protection that comes after feeling too much. You don't have to force your way out of it." },
  },
  '지쳐': {
    count: 187,
    questions: [
      [{ ko: "지침에도 여러 종류가 있죠. 어떤 종류의 지침이에요?", en: "Exhaustion comes in many forms. What kind is this?" },
       { ko: "따뜻하게 · 여기서 쉬어요", en: "Warmly · rest here" }],
      [{ ko: "몸이 지친 건지, 마음이 지친 건지, 둘 다인지요?", en: "Is it your body, your mind, or both?" },
       { ko: "궁금해요 · 부드럽게", en: "Curious · gently" }],
      [{ ko: "요즘 가장 에너지를 빼앗아 가는 게 뭐예요?", en: "What's been draining your energy the most lately?" },
       { ko: "뿌리를 찾아가요", en: "Going to the root" }],
      [{ ko: "진짜 쉬는 게 어떤 모습일 것 같아요?", en: "What would truly resting look like for you?" },
       { ko: "같이 상상해봐요", en: "Let's imagine together" }],
    ],
    suggestion: { ko: "많이 소진됐네요. 쉰다는 건 잠만이 아니에요 — 뭔가를 내려놓는 것이기도 해요.", en: "You're deeply depleted. Rest isn't just sleep — it's also putting something down." },
  },
  '상처받았어': {
    count: 89,
    questions: [
      [{ ko: "상처받은 게 느껴져요. 무슨 일이에요?", en: "I can feel that you've been hurt. What happened?" },
       { ko: "조심스럽게 · 듣고 있어요", en: "Carefully · listening" }],
      [{ ko: "어떤 사람과 있었던 일이에요?", en: "Was it something that happened with someone?" },
       { ko: "서두르지 않아도 돼요", en: "No need to rush" }],
      [{ ko: "예상했던 건지, 갑자기 온 건지요?", en: "Did you see it coming, or did it come suddenly?" },
       { ko: "함께예요 · 부드럽게", en: "I'm here · gently" }],
      [{ ko: "조금 더 안전하게 느끼려면 뭐가 필요해요?", en: "What do you need to feel a little safer?" },
       { ko: "궁금해요 · 여기 있어요", en: "Curious · I'm here" }],
    ],
    suggestion: { ko: "상처가 있었네요. 일어난 일에 이름을 붙이는 것이 혼자 안고 있지 않는 첫 걸음이에요.", en: "There was hurt here. Naming what happened is the first step to not carrying it alone." },
  },
};

export const QUICK_CARDS = [
  { key: 'relationship', text: { ko: '가까운 사람과 무슨 일이 있었어', en: 'Something happened with someone close to me' }, emo: '상처받았어' },
  { key: 'work',         text: { ko: '해야 할 일이 자꾸 마음에 걸려',  en: "I keep worrying about things I need to do" }, emo: '불안해' },
  { key: 'self',         text: { ko: '딱히 뭐라고 할 수 없는데 뭔가 이상해', en: "I can't quite name it, but something feels off" }, emo: '무감각해' },
  { key: 'body',         text: { ko: '몸이 무겁고 피곤하고 어딘가 조여', en: 'My body feels heavy, tired, and tense' }, emo: '지쳐' },
];

export const LAYER_GROUPS = [
  { id: 'social',
    label: { ko: '사회적인 나', en: 'My Social Self' },
    sub:   { ko: '직장, 처음 만남, SNS, 공식적인 자리', en: 'Work, first meetings, SNS, formal settings' },
    items: [
      { id: 'social_work',     label: { ko: '직장 / 학교에서의 나', en: 'Me at work / school' },   sensitive: false },
      { id: 'social_stranger', label: { ko: '처음 만나는 사람 앞',  en: 'In front of strangers' }, sensitive: false },
      { id: 'social_sns',      label: { ko: 'SNS에서의 나',         en: 'My online self (SNS)' },  sensitive: false },
      { id: 'social_formal',   label: { ko: '공식적인 자리에서',    en: 'In formal settings' },    sensitive: false },
    ],
  },
  { id: 'daily',
    label: { ko: '일반적인 나', en: 'My Everyday Self' },
    sub:   { ko: '가족, 친한 친구, 연인, 혼자', en: 'Family, close friends, partner, alone' },
    items: [
      { id: 'daily_family',  label: { ko: '가족 안에서의 나',     en: 'Me within family' },    sensitive: false },
      { id: 'daily_friend',  label: { ko: '친한 친구 앞에서',     en: 'With close friends' },  sensitive: false },
      { id: 'daily_partner', label: { ko: '연인 / 파트너 앞에서', en: 'With a partner' },      sensitive: true  },
      { id: 'daily_alone',   label: { ko: '혼자 있을 때의 나',    en: "When I'm alone" },      sensitive: false },
    ],
  },
  { id: 'secret',
    label: { ko: '비밀스러운 나', en: 'My Hidden Self' },
    sub:   { ko: '감정적 비밀, 관계적 비밀, 욕망, 수치심, 야망', en: 'Emotional secrets, relational secrets, desires, shame, ambition' },
    items: [
      { id: 'secret_emotion',  label: { ko: '감정적 비밀',      en: 'Emotional secrets' },  sensitive: true,  locked: false },
      { id: 'secret_relation', label: { ko: '관계적 비밀',      en: 'Relational secrets' }, sensitive: true,  locked: false },
      { id: 'secret_desire',   label: { ko: '욕망 / 성적 영역', en: 'Desire / sexuality' }, sensitive: true,  locked: true  },
      { id: 'secret_shame',    label: { ko: '수치심 영역',      en: 'Shame' },              sensitive: true,  locked: true  },
      { id: 'secret_ambition', label: { ko: '야망 / 욕심 영역', en: 'Ambition / desire' },  sensitive: false, locked: false },
    ],
  },
];

export const COMM_GROUPS = [
  { title: { ko: '사람들 속에서 혼자인 사람들', en: 'Feeling alone in a crowd' },
    count: 98,
    desc:  { ko: '함께 있어도 연결이 안 되는 느낌', en: 'Feeling disconnected even when surrounded by people' } },
  { title: { ko: '지금 이유없이 불안한 사람들', en: 'Anxious for no clear reason' },
    count: 142,
    desc:  { ko: '뚜렷한 이유 없이 올라오는 불안 패턴', en: 'Anxiety that surfaces without a clear cause' } },
  { title: { ko: '잘 지내야 한다고 느끼는 사람들', en: 'Feeling like you have to be okay' },
    count: 67,
    desc:  { ko: '감정을 숨기고 버티는 패턴', en: 'A pattern of hiding feelings and holding on' } },
];

// Social 도메인 전용 감정 — 사회적 맥락 8종
export const SOCIAL_EMOTIONS = [
  { label: { ko: '무력감',     en: 'Powerless'  }, svg: 'numb'      },
  { label: { ko: '분노',       en: 'Outraged'   }, svg: 'angry'     },
  { label: { ko: '슬픔',       en: 'Grieving'   }, svg: 'sad'       },
  { label: { ko: '불안',       en: 'Anxious'    }, svg: 'anxious'   },
  { label: { ko: '희망',       en: 'Hopeful'    }, svg: 'calm'      },
  { label: { ko: '지침',       en: 'Burned out' }, svg: 'tired'     },
  { label: { ko: '연대감',     en: 'Connected'  }, svg: 'lonely'    },
  { label: { ko: '혼란',       en: 'Confused'   }, svg: 'confused'  },
];

// Social 도메인 전용 빠른 시작 카드 4종
export const SOCIAL_QUICK_CARDS: { text: { ko: string; en: string }; emo: string }[] = [
  {
    text: { ko: '뉴스를 보다가 무언가에 화가 났어요', en: "I got angry reading the news" },
    emo: '분노',
  },
  {
    text: { ko: '내가 할 수 있는 게 없는 것 같아요', en: "It feels like there's nothing I can do" },
    emo: '무력감',
  },
  {
    text: { ko: '이 문제가 해결될 수 있을까요?', en: "Can this problem even be solved?" },
    emo: '불안',
  },
  {
    text: { ko: '비슷한 마음인 사람들이 있다는 게 위안이 돼요', en: "It's comforting to know others feel the same way" },
    emo: '연대감',
  },
];

export function getTimeGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 9)  return { title: { ko: '좋은 아침이에요.',   en: 'Good morning.' },              placeholder: { ko: '지금 어떤 마음이에요?',     en: 'How are you feeling right now?' } };
  if (h >= 9  && h < 12) return { title: { ko: '오전이네요.',         en: 'Good morning.' },              placeholder: { ko: '지금 어떤 마음이에요?',     en: 'How are you feeling right now?' } };
  if (h >= 12 && h < 14) return { title: { ko: '점심 즈음이에요.',    en: "It's around lunchtime." },     placeholder: { ko: '지금 기분이 어떤가요?',     en: 'How are you feeling now?' } };
  if (h >= 14 && h < 18) return { title: { ko: '오후예요.',           en: 'Good afternoon.' },            placeholder: { ko: '지금 무슨 생각하고 있어요?', en: 'What are you thinking about right now?' } };
  if (h >= 18 && h < 21) return { title: { ko: '저녁이에요.',          en: 'Good evening.' },              placeholder: { ko: '오늘 하루 어떠셨어요?',     en: 'How was your day?' } };
  if (h >= 21 && h < 24) return { title: { ko: '밤이 깊었네요.',       en: "It's getting late." },         placeholder: { ko: '지금 어떤 마음이에요?',     en: 'How are you feeling right now?' } };
  return                         { title: { ko: '한밤중이에요.',        en: "It's the middle of the night." }, placeholder: { ko: '지금 무슨 생각을 하고 있어요?', en: "What's on your mind right now?" } };
}
