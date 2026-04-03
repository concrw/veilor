import { C } from '@/lib/colors';

export const ZONES = [
  { layer: 'social', title: '사회적인 나', color: C.frost, sub: '직장, 처음 만남, SNS, 공식 자리',
    items: [
      { id: 's1', name: '직장/학교에서의 나',    desc: '완벽하게 통제된 나',      sensitive: false, defaultOn: true  },
      { id: 's2', name: '처음 만나는 사람 앞',   desc: '과하게 친절한 나',        sensitive: false, defaultOn: true  },
      { id: 's3', name: 'SNS에서의 나',          desc: '보여주고 싶은 나',        sensitive: false, defaultOn: true  },
      { id: 's4', name: '공식적인 자리에서',     desc: '역할로만 존재하는 나',    sensitive: false, defaultOn: false },
    ]},
  { layer: 'daily', title: '일상적인 나', color: C.amber, sub: '가족, 친구, 연인, 혼자',
    items: [
      { id: 'd1', name: '가족 안에서의 나',       desc: '항상 괜찮은 척하는 나',  sensitive: false, defaultOn: true  },
      { id: 'd2', name: '친한 친구 앞에서',       desc: '진짜에 가장 가까운 나',  sensitive: false, defaultOn: true  },
      { id: 'd3', name: '연인/파트너 앞에서',     desc: '가장 불안한 나',         sensitive: true,  defaultOn: true  },
      { id: 'd4', name: '혼자 있을 때의 나',      desc: '아무도 없을 때 무너지는 나', sensitive: false, defaultOn: true  },
    ]},
  { layer: 'secret', title: '비밀스러운 나', color: C.amberDim, sub: '감정 비밀, 관계 비밀, 욕망, 수치심, 야망',
    items: [
      { id: 't1', name: '감정적 비밀',    desc: '말 못 한 상처들',          sensitive: true,  defaultOn: true  },
      { id: 't2', name: '관계적 비밀',    desc: '드러내기 두려운 관계 패턴', sensitive: true, defaultOn: true  },
      { id: 't3', name: '욕망/성적 영역', desc: '억눌러온 욕구들',          sensitive: true,  defaultOn: false },
      { id: 't4', name: '수치심 영역',    desc: '가장 숨기고 싶은 것',      sensitive: true,  defaultOn: false },
      { id: 't5', name: '야망/욕심 영역', desc: '인정받고 싶은 나',         sensitive: false, defaultOn: true  },
    ]},
];

export const TOTAL_ZONES = ZONES.reduce((sum, g) => sum + g.items.length, 0);

export const RADAR_DATA = {
  prev: { axes: ['애착', '소통', '욕구', '역할'], vals: [52, 44, 38, 81] },
  now:  { axes: ['애착', '소통', '욕구', '역할'], vals: [63, 59, 45, 77] },
};

export const PERSONAS = [
  { name: '"역할자" 나', color: C.frost, zone: '사회적인 나 전체',
    desc: '직장, 공식 자리, 처음 만나는 사람 앞에서 완벽하게 통제된 모습을 보여요. 실수를 용납하지 않고 항상 능숙해 보이려 해요.',
    tags: ['통제', '완벽주의', '역할 고착'],
    conflict: '혼자 있을 때의 나와 극명히 달라요. "역할자"일 때 아무것도 필요 없는 척하다가, 혼자서 무너져요.' },
  { name: '"맞춰주는" 나', color: C.amber, zone: '연인/가족 앞',
    desc: '가까운 사람 앞에서 상대의 기분에 따라 내 모습이 달라져요. 원하는 게 있어도 말하지 못하고 상대가 원하는 걸 먼저 해요.',
    tags: ['불안 애착', '자기 소거', '감정 연동'],
    conflict: '"역할자" 나는 아무것도 필요 없는 척하는데, "맞춰주는" 나는 상대에게 집착해요. 둘 다 진짜 욕구를 숨기는 방식이에요.' },
  { name: '"무너지는" 나', color: C.amberDim, zone: '혼자 있을 때',
    desc: '아무도 없을 때야 비로소 피곤함이 나와요. 낮에 쌓인 것들이 한꺼번에 무너지고, 아무것도 하기 싫어져요.',
    tags: ['감정 억압 해소', '고립', '燃盡'],
    conflict: '밖에서 완벽한 척한 대가를 혼자서 치러요. 이 나가 존재한다는 걸 아무도 몰라요.' },
  { name: '"진짜에 가까운" 나', color: C.amberGold, zone: '친한 친구 앞',
    desc: '가장 오래된 친구 앞에서만 간헐적으로 진짜가 나와요. 그런데도 전부를 보여주진 않아요. 비밀스러운 나는 여기서도 숨겨져요.',
    tags: ['간헐적 진정성', '신뢰 관계', '불완전한 개방'],
    conflict: '가장 진짜에 가깝지만, 그래도 절반만 보여줘요. 욕망과 수치심 영역은 여기서도 닫혀 있어요.' },
];

export const PEOPLE = [
  { name: '지아', rel: '연인 · 3년', color: C.amber,
    pattern: '지아의 기분이 가라앉으면 내가 뭔가 잘못한 것 같아요. 확인하고 달래주려 하고, 그게 반복돼요.',
    conflict: '나는 연인 앞에서 원하는 게 없는 척해요. 그러다 쌓이면 갑자기 냉정해져요.',
    tags: ['불안 애착', '감정 연동', '소통 단절'] },
  { name: '엄마', rel: '가족 · 핵심 관계', color: C.amberDim,
    pattern: '엄마 앞에서는 항상 "잘 지내요"예요. 힘들어도 말 안 해요. 약해 보이기 싫어서예요.',
    conflict: '"역할자" 나의 기원이 여기예요. 엄마 앞에서 처음으로 "완벽한 아이"가 됐어요.',
    tags: ['감정 억제', '역할 고착', '기원 관계'] },
  { name: '재현', rel: '친구 · 15년', color: C.frost,
    pattern: '재현한테는 가장 솔직한 편이에요. 근데 여전히 욕망이나 수치심은 말 못 해요.',
    conflict: '가장 가까운데도 전부를 못 보여줘요. "진짜에 가까운 나"가 여기서도 한계가 있어요.',
    tags: ['부분적 신뢰', '이미지 관리', '비밀 유지'] },
  { name: '팀장님', rel: '직장 · 권위 관계', color: C.text4,
    pattern: '팀장님 앞에서 실수를 절대 인정 못 해요. 인정하면 무너질 것 같아서요.',
    conflict: '권위 있는 사람 앞에서 "역할자"가 가장 극단적으로 나와요.',
    tags: ['권위 관계', '방어적 반응', '인정 욕구'] },
];

export const FRIENDS = [
  { name: '서연', av: '서', color: C.amber, match: '89%',
    reason: '애착 불안 + 관계에서 자기 소거 패턴. 비슷한 고민을 겪고 있어요.' },
  { name: '민준', av: '민', color: C.frost, match: '82%',
    reason: '역할로만 살다가 지친 패턴. 직장 맥락에서 비슷한 페르소나를 가졌어요.' },
  { name: '하은', av: '하', color: C.amberDim, match: '77%',
    reason: '감정을 말하지 못하고 혼자 삭이는 패턴. 같은 고민을 지나온 사람이에요.' },
];

export const LANG_LABELS: Record<string, string> = { ko: '한국어', en: 'English', ja: '日本語' };

export const SEED_STAGES = [
  { icon: '🌱', label: '씨앗\n심기',   threshold: 0  },
  { icon: '🌿', label: '패턴\n발견',   threshold: 40 },
  { icon: '🌳', label: '뿌리\n내리기', threshold: 65 },
  { icon: '🌸', label: '꽃\n피우기',   threshold: 85 },
];
