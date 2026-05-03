export const AMBER_RESPONSES: Array<{
  keywords: string[];
  reply: { ko: string; en: string };
  followUp: { ko: string; en: string };
}> = [
  {
    keywords: ['밀어', '거리', '피해', '도망', '혼자'],
    reply: {
      ko: '가까워질수록 오히려 뒤로 물러나고 싶어지는 느낌... 그게 반복되면 스스로도 이해가 안 되죠.',
      en: "The closer you get, the more you want to pull back... when that repeats, it can be hard to understand yourself.",
    },
    followUp: {
      ko: '그 순간, 어떤 생각이 먼저 드나요? "떠날 것 같다"는 두려움인가요, 아니면 "나 혼자가 더 편해"라는 감각인가요?',
      en: 'In that moment, what comes to mind first? A fear of "they\'ll leave me," or a feeling of "I\'m better off alone"?',
    },
  },
  {
    keywords: ['매달', '불안', '연락', '확인', '집착', '걱정'],
    reply: {
      ko: '연락이 없으면 온갖 생각이 들고, 안심하려면 확인이 필요한 느낌... 그 불안이 얼마나 소진되는지 알아요.',
      en: "When there's no message, your mind goes everywhere — and you need to check just to feel okay... I know how draining that anxiety can be.",
    },
    followUp: {
      ko: '그 불안이 처음 생긴 게 언제쯤인지 떠오르는 순간이 있나요?',
      en: 'Is there a moment you can trace back to when that anxiety first started?',
    },
  },
  {
    keywords: ['말', '표현', '못해', '참아', '숨겨', '억압', '감정'],
    reply: {
      ko: '하고 싶은 말이 있는데 삼키는 연습을 너무 오래 해온 것 같네요.',
      en: "It sounds like you've been practicing swallowing your words for a very long time.",
    },
    followUp: {
      ko: '그 말을 못 꺼내는 이유가 "상처줄까봐"인가요, "무시당할까봐"인가요?',
      en: 'Is the reason you hold back "afraid of hurting them," or "afraid of being dismissed"?',
    },
  },
  {
    keywords: ['싸움', '갈등', '반복', '패턴', '같은'],
    reply: {
      ko: '다른 관계인데 왜 같은 일이 반복되는 걸까, 라는 의문... 그게 이 서비스를 시작하게 되는 가장 흔한 이유예요.',
      en: "Wondering why the same thing keeps happening in different relationships... that's one of the most common reasons people start here.",
    },
    followUp: {
      ko: '그 반복되는 장면에서 주로 어떤 역할을 하게 되나요? 참는 쪽인가요, 폭발하는 쪽인가요?',
      en: 'In those repeating scenes, which role do you usually end up in? The one who holds it in, or the one who explodes?',
    },
  },
  {
    keywords: ['외로', '혼자', '이해', '공감', '모르'],
    reply: {
      ko: '누군가와 함께 있어도 혼자인 것 같은 그 느낌, 가장 지치는 외로움이죠.',
      en: "That feeling of being alone even when you're with someone — that's one of the most exhausting kinds of loneliness.",
    },
    followUp: {
      ko: '가장 마지막으로 "이 사람은 나를 이해하는구나"라고 느꼈던 게 언제인지 기억나요?',
      en: 'Can you remember the last time you felt "this person really understands me"?',
    },
  },
];

export const DEFAULT_RESPONSE = {
  reply: {
    ko: '그 마음을 꺼내줬군요. 쉽지 않은 말인데.',
    en: "You shared that with me. That wasn't easy to say.",
  },
  followUp: {
    ko: '지금 가장 힘든 관계가 연인인가요, 가족인가요, 아니면 나 자신과의 관계인가요?',
    en: 'Right now, which relationship is the hardest — a partner, family, or your relationship with yourself?',
  },
};

export const PUBLIC_POSTS = [
  {
    id: 'p1',
    mask: '나비 가면',
    content: {
      ko: '왜 나는 항상 먼저 연락을 끊을까요. 상대가 나를 떠날 것 같은 느낌이 들면 먼저 거리를 둬버려요.',
      en: "Why do I always cut contact first? Whenever I sense someone might leave me, I distance myself before they can.",
    },
    upvotes: 14,
    group: {
      ko: '회피형 애착 극복 모임',
      en: 'Overcoming Avoidant Attachment',
    },
  },
  {
    id: 'p2',
    mask: '유리 가면',
    content: {
      ko: '감정을 표현했더니 "너무 예민하다"는 말을 들었어요. 앞으로 말을 안 하는 게 나을 것 같아서 더 무서워요.',
      en: "I expressed my feelings and was told I was \"too sensitive.\" Now I'm scared that staying silent is the safer option.",
    },
    upvotes: 31,
    group: {
      ko: '소통 & 갈등 해결',
      en: 'Communication & Conflict Resolution',
    },
  },
  {
    id: 'p3',
    mask: '안개 가면',
    content: {
      ko: '상대방이 화가 났을 때 나는 왜 무조건 내 잘못인 것 같을까요. 사과를 먼저 하고 나서야 숨을 쉴 수 있어요.',
      en: "When the other person is angry, why do I automatically assume it's my fault? I can only breathe again after I apologize first.",
    },
    upvotes: 22,
    group: {
      ko: '불안형 애착',
      en: 'Anxious Attachment',
    },
  },
];

export function getInsightTease(answer: string): { ko: string; en: string } {
  const a = answer.toLowerCase();
  if (/밀어|거리|피해|혼자|도망|push|distance|avoid|alone/.test(a))
    return { ko: '"가까워질수록 멀어지는" 패턴이 보여요.', en: 'A "the closer, the further" pattern is showing.' };
  if (/매달|불안|확인|집착|cling|anxious|check|obsess/.test(a))
    return { ko: '"연결이 끊길까봐" 두려워하는 패턴이 보여요.', en: 'A fear of "losing the connection" is showing.' };
  if (/말|표현|참아|숨겨|words|express|hold|hide/.test(a))
    return { ko: '"감정을 삼키는" 패턴이 보여요.', en: 'A "swallowing your feelings" pattern is showing.' };
  if (/싸움|갈등|반복|fight|conflict|repeat/.test(a))
    return { ko: '"같은 장면이 반복되는" 패턴이 보여요.', en: 'A "same scene on repeat" pattern is showing.' };
  return { ko: '"관계에서 내 패턴"이 보이기 시작하고 있어요.', en: 'Your relationship pattern is starting to come into view.' };
}

export function getAmberResponse(answer: string) {
  const a = answer.toLowerCase();
  for (const r of AMBER_RESPONSES) {
    if (r.keywords.some(k => a.includes(k))) return r;
  }
  return DEFAULT_RESPONSE;
}
