export const AMBER_RESPONSES: Array<{ keywords: string[]; reply: string; followUp: string }> = [
  {
    keywords: ['밀어', '거리', '피해', '도망', '혼자'],
    reply: '가까워질수록 오히려 뒤로 물러나고 싶어지는 느낌... 그게 반복되면 스스로도 이해가 안 되죠.',
    followUp: '그 순간, 어떤 생각이 먼저 드나요? "떠날 것 같다"는 두려움인가요, 아니면 "나 혼자가 더 편해"라는 감각인가요?',
  },
  {
    keywords: ['매달', '불안', '연락', '확인', '집착', '걱정'],
    reply: '연락이 없으면 온갖 생각이 들고, 안심하려면 확인이 필요한 느낌... 그 불안이 얼마나 소진되는지 알아요.',
    followUp: '그 불안이 처음 생긴 게 언제쯤인지 떠오르는 순간이 있나요?',
  },
  {
    keywords: ['말', '표현', '못해', '참아', '숨겨', '억압', '감정'],
    reply: '하고 싶은 말이 있는데 삼키는 연습을 너무 오래 해온 것 같네요.',
    followUp: '그 말을 못 꺼내는 이유가 "상처줄까봐"인가요, "무시당할까봐"인가요?',
  },
  {
    keywords: ['싸움', '갈등', '반복', '패턴', '같은'],
    reply: '다른 관계인데 왜 같은 일이 반복되는 걸까, 라는 의문... 그게 이 서비스를 시작하게 되는 가장 흔한 이유예요.',
    followUp: '그 반복되는 장면에서 주로 어떤 역할을 하게 되나요? 참는 쪽인가요, 폭발하는 쪽인가요?',
  },
  {
    keywords: ['외로', '혼자', '이해', '공감', '모르'],
    reply: '누군가와 함께 있어도 혼자인 것 같은 그 느낌, 가장 지치는 외로움이죠.',
    followUp: '가장 마지막으로 "이 사람은 나를 이해하는구나"라고 느꼈던 게 언제인지 기억나요?',
  },
];

export const DEFAULT_RESPONSE = {
  reply: '그 마음을 꺼내줬군요. 쉽지 않은 말인데.',
  followUp: '지금 가장 힘든 관계가 연인인가요, 가족인가요, 아니면 나 자신과의 관계인가요?',
};

export const PUBLIC_POSTS = [
  {
    id: 'p1',
    mask: '나비 가면',
    content: '왜 나는 항상 먼저 연락을 끊을까요. 상대가 나를 떠날 것 같은 느낌이 들면 먼저 거리를 둬버려요.',
    upvotes: 14,
    group: '회피형 애착 극복 모임',
  },
  {
    id: 'p2',
    mask: '유리 가면',
    content: '감정을 표현했더니 "너무 예민하다"는 말을 들었어요. 앞으로 말을 안 하는 게 나을 것 같아서 더 무서워요.',
    upvotes: 31,
    group: '소통 & 갈등 해결',
  },
  {
    id: 'p3',
    mask: '안개 가면',
    content: '상대방이 화가 났을 때 나는 왜 무조건 내 잘못인 것 같을까요. 사과를 먼저 하고 나서야 숨을 쉴 수 있어요.',
    upvotes: 22,
    group: '불안형 애착',
  },
];

export function getInsightTease(answer: string): string {
  const a = answer.toLowerCase();
  if (/밀어|거리|피해|혼자|도망/.test(a)) return '"가까워질수록 멀어지는" 패턴이 보여요.';
  if (/매달|불안|확인|집착/.test(a)) return '"연결이 끊길까봐" 두려워하는 패턴이 보여요.';
  if (/말|표현|참아|숨겨/.test(a)) return '"감정을 삼키는" 패턴이 보여요.';
  if (/싸움|갈등|반복/.test(a)) return '"같은 장면이 반복되는" 패턴이 보여요.';
  return '"관계에서 내 패턴"이 보이기 시작하고 있어요.';
}

export function getAmberResponse(answer: string) {
  const a = answer.toLowerCase();
  for (const r of AMBER_RESPONSES) {
    if (r.keywords.some(k => a.includes(k))) return r;
  }
  return DEFAULT_RESPONSE;
}
