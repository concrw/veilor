// 가상유저 20명의 Codetalk 응답 시드 데이터
// auth.users FK 제약으로 DB 직접 삽입 불가 → 프론트 레이어에서 혼합 표시
// virtual_user_profiles의 writing_tone/primary_concern 기반으로 캐릭터성 반영

export interface VirtualCodetalkEntry {
  id: string;
  anon_alias: string;
  keyword: string;
  day_number: number;
  definition: string;
  imprinting_moment?: string;
  root_cause?: string;
  created_at: string;
  is_virtual: true;
}

// 가상유저 20명의 가명 (virtual_user_profiles 순서 매핑)
const ALIASES = [
  '조용한 달', '유리 거울', '깊은 안개', '차가운 불', '투명한 강',
  '느린 바람', '검은 나비', '따뜻한 벽', '흔들리는 뿌리', '작은 파도',
  '닫힌 문', '긴 밤', '무거운 빛', '얇은 숲', '고요한 비',
  '숨은 달', '갈라진 거울', '먼 별', '낮은 불꽃', '깨진 시계',
];

// DAY 1~20 키워드 (하드코딩 제거 후 알고리즘 통일을 위해 상수 유지)
const DAY_1_20_KEYWORDS: Record<number, string> = {
  1: '사랑', 2: '행복', 3: '자유', 4: '신뢰', 5: '존중',
  6: '안전', 7: '외로움', 8: '연결', 9: '경계', 10: '솔직함',
  11: '배려', 12: '기대', 13: '실망', 14: '용기', 15: '취약함',
  16: '위로', 17: '침묵', 18: '시간', 19: '거리', 20: '변화',
};

// DAY 21~100 키워드 목록 (DB codetalk_keywords 테이블과 동기화)
const EXTENDED_KEYWORDS: Record<number, string> = {
  21: '집착', 22: '포기', 23: '화해', 24: '질투', 25: '미안함',
  26: '공감', 27: '이해', 28: '거절', 29: '의존', 30: '독립',
  31: '성장', 32: '패턴', 33: '반복', 34: '회피', 35: '직면',
  36: '수용', 37: '저항', 38: '변명', 39: '책임', 40: '선택',
  41: '후회', 42: '용서', 43: '인정', 44: '부정', 45: '분노',
  46: '슬픔', 47: '기쁨', 48: '불안', 49: '평화', 50: '갈등',
  51: '타협', 52: '양보', 53: '주장', 54: '듣기', 55: '말하기',
  56: '감추기', 57: '드러내기', 58: '보호', 59: '상처', 60: '치유',
  61: '회복', 62: '재건', 63: '끝', 64: '시작', 65: '기다림',
  66: '인내', 67: '조급함', 68: '확신', 69: '의심', 70: '믿음',
  71: '약속', 72: '배신', 73: '충성', 74: '진심', 75: '거짓',
  76: '표면', 77: '깊이', 78: '가면', 79: '진짜', 80: '관계',
  81: '나', 82: '너', 83: '우리', 84: '혼자', 85: '같이',
  86: '떠남', 87: '돌아옴', 88: '놓아줌', 89: '붙잡음', 90: '균형',
  91: '과거', 92: '현재', 93: '미래', 94: '기억', 95: '잊음',
  96: '감사', 97: '원망', 98: '희망', 99: '절망', 100: '사랑의 재정의',
};

/*
  CHARACTER_TONES — 각 캐릭터별 언어 지문(linguistic fingerprint)

  설계 원칙:
  1. {keyword} 위치를 문장 초반/중반/후반에 고르게 배치 (구조 다양화)
  2. 스타일 내에서도 톤 변주: 체념 / 저항 / 성장 / 낙관 혼합
  3. 캐릭터 고유 어휘 서명(signature vocab) 사용
  4. 문장 길이 분포: 짧음(15-30자) 30% / 중간(40-70자) 40% / 긺(80자+) 30%
  5. 접속사 선호도: 각 캐릭터마다 고정 (근데/그래서/하지만/아/사실은)
*/
const CHARACTER_TONES: Record<string, {
  style: 'introspective' | 'emotional' | 'analytical' | 'poetic' | 'resistant';
  signatureVocab: string[];
  templates: string[];
  imprinting_templates: string[];
  root_templates: string[];
}> = {
  '조용한 달': {
    style: 'introspective',
    signatureVocab: ['조용히', '패턴', '인식', '어린 시절', '벗어나기'],
    templates: [
      '{keyword}은(는) 나한테 항상 조용히 다가와요. 인식하는 순간 이미 깊이 들어와 있죠.',
      '{keyword}에 대해 생각하면 어린 시절이 먼저 떠올라요. 그때부터 이미 패턴이 시작됐던 것 같아요.',
      '모든 관계에서 나는 {keyword}을(를) 반복해요. 알면서도 벗어나기가 어려워요.',
      '말하지 못하고 담아둔 게 {keyword}이(가) 되더라고요. 나도 몰랐어요.',
      '피하고 싶었는데 결국 마주쳤어요. 그게 나한테 {keyword}이었어요.',
      '왜 이게 반복되는지 생각하다 보면 항상 {keyword}이(가) 나와요.',
      '이미 알고 있었어요. 근데 인정하기가 싫었을 뿐이에요.',
      '패턴인 걸 알아도 멈추기가 어려워요. 그게 제일 이상해요.',
      '조용히 참는 게 미덕이라고 배웠는데, 그게 나를 망가뜨린 거였어요.',
      '더 이상 {keyword}을(를) 혼자 감당하지 않기로 했어요.',
    ],
    imprinting_templates: [
      '초등학교 때 선생님이 조용히 하라고 했어요. 그 뒤로 말하는 게 두려워졌어요.',
      '처음으로 울었을 때 아무도 알아차리지 못했어요. 그날 이후 혼자 감당하는 게 당연해졌어요.',
      '어떤 관계가 끝났을 때 아무 말도 못 했어요. 그 침묵이 지금도 가슴에 남아 있어요.',
      '어린 시절 부모님이 싸울 때 방에서 조용히 기다렸어요. 그게 각인됐어요.',
      '처음으로 경계를 말했을 때 상대가 화냈어요. 그때부터 말하는 게 무서워졌어요.',
    ],
    root_templates: [
      '조용히 있으면 아무도 안 건드린다고 배웠거든요. 그게 몸에 밴 것 같아요.',
      '관심받는 게 부담스러워서 스스로 작아지는 거예요. 그게 패턴이 됐어요.',
      '말해봤자 달라지는 게 없다고 믿게 됐어요. 어릴 때부터요.',
      '인정받으려면 문제없는 사람이어야 한다고 생각해왔어요.',
      '갈등을 피하는 게 습관이 됐어요. 평화가 내 몫이라고 생각했거든요.',
    ],
  },

  '유리 거울': {
    style: 'analytical',
    signatureVocab: ['정의', '설명', '경험', '상태', '결국', '떠넘긴'],
    templates: [
      '{keyword}이(가) 뭔지 정의하려고 하면 할수록 더 모르겠어요. 경험하는 것과 설명하는 건 다른 일이에요.',
      '{keyword}에 대한 내 모습이 상황마다 달라요. 조각마다 다른 내가 보여요.',
      '상대에게 {keyword}을(를) 기대했는데 그건 내가 나한테 못 주는 걸 떠넘긴 거였어요.',
      '아, 근데 사실 내가 원하는 {keyword}이(가) 뭔지를 몰랐던 거예요.',
      '관계마다 의미가 달라지더라고요. 결국 상대가 아니라 나의 상태에 달린 게 {keyword}이었어요.',
      '분석하다 보면 항상 나한테 돌아와요. 근원이 {keyword}인 경우가 많아요.',
      '결국 내 문제였어요.',
      '설명이 안 되면 느끼기로 했어요.',
      '패턴을 알게 된 것만으로도 절반은 해결된 거 아닐까요.',
      '거울이 갈라진 건 {keyword} 때문이에요. 그 전에는 하나인 줄 알았으니까요.',
    ],
    imprinting_templates: [
      '처음으로 나 자신을 거울에서 보듯 객관적으로 봤을 때, 낯선 사람 같았어요.',
      '상담에서 "당신이 원하는 게 뭐예요?"라는 질문에 답을 못 했어요. 그 순간이 각인됐어요.',
      '관계가 끝나고 나서야 내가 원한 게 뭔지 알았어요. 너무 늦게요.',
      '친구한테 "너는 왜 그렇게 분석만 해?"라는 말을 들었어요. 그때 처음 내 패턴을 봤어요.',
      '일기를 읽다가 5년 전과 똑같은 고민을 하고 있는 나를 발견했어요.',
    ],
    root_templates: [
      '느끼는 것보다 분석하는 게 편했어요. 감정이 무서웠거든요.',
      '이해하면 통제할 수 있다고 믿었어요. 근데 관계는 그게 안 됐어요.',
      '설명 못 하는 건 존재하지 않는 것처럼 대했어요. 그게 나를 작게 만들었어요.',
      '완벽하게 파악해야 실수하지 않는다고 배웠어요. 그래서 항상 관찰만 했어요.',
      '감정을 드러내면 약해 보인다고 생각했어요. 분석이 방어막이었어요.',
    ],
  },

  '깊은 안개': {
    style: 'emotional',
    signatureVocab: ['가슴', '몸', '느끼면', '무서워요', '이름을 붙이니'],
    templates: [
      '{keyword}을(를) 느끼면 가슴이 먼저 반응해요. 머리가 따라오기 전에 몸이 알아요.',
      '{keyword}이(가) 무서울 때가 있어요. 느끼는 것 자체가 위험하게 느껴질 때.',
      '지금도 {keyword}이(가) 여기 있어요. 이름을 붙이니까 조금 덜 무서워요.',
      '울고 싶을 때 {keyword}이(가) 같이 왔어요. 구분이 안 됐어요.',
      '아 맞다, 그게 {keyword}이었구나 싶을 때가 있어요. 나중에서야.',
      '몸이 먼저 굳었어요. 그게 나한테 {keyword}인 것 같아요.',
      '느끼면 이미 늦은 것 같아서 두려워요.',
      '몸은 기억해요. 오래오래.',
      '이제는 그 느낌이 올 때 도망가지 않기로 했어요.',
      '무서운 감정에도 이름을 붙이면, 조금 작아지더라고요.',
    ],
    imprinting_templates: [
      '처음으로 공황이 왔을 때 몸이 뭔지 알기 전에 심장이 먼저 도망갔어요.',
      '중요한 자리에서 울음이 터졌어요. 그게 너무 창피해서 감정을 잠갔어요.',
      '누군가 "왜 그렇게 예민해?"라고 했어요. 그 뒤로 감정이 잘못된 거라고 생각했어요.',
      '슬플 때 아무것도 느끼지 못한 적이 있어요. 그 공백이 지금도 무서워요.',
      '좋은 일이 생겼는데 기쁘지 않았어요. 그때 내 감정이 안개 같다고 생각했어요.',
    ],
    root_templates: [
      '감정을 느끼면 통제를 잃는다고 믿어서 계속 눌러왔어요.',
      '어릴 때 감정적이면 약하다고 배웠어요. 그래서 몸으로만 느꼈어요.',
      '상처받은 적이 많아서 감각을 둔하게 만들었어요. 보호 장치였어요.',
      '감정이 오면 일이 안 되니까 뒤로 미루는 게 습관이 됐어요.',
      '안개처럼 흐릿하게 있는 게 더 안전했어요. 선명하면 표적이 되니까요.',
    ],
  },

  '차가운 불': {
    style: 'analytical',
    signatureVocab: ['이성적으로', '분석', '정의', '계속 바뀌어요', '방어기제'],
    templates: [
      '{keyword}에 대한 내 정의는 계속 바뀌어요. 그게 성장인지 혼란인지 모르겠어요.',
      '{keyword}을(를) 느끼지 않으려고 분석만 했어요. 그게 제 방어기제였던 것 같아요.',
      '이성적으로 {keyword}을(를) 분석하면 답이 나오는데, 감정은 그 답을 따르지 않아요.',
      '내가 원하는 {keyword}의 정의가 상대와 달랐어요. 그 간격을 오래 몰랐어요.',
      '감정보다 논리가 먼저였는데, 그게 문제였어요. 특히 {keyword}에 대해서는.',
      '분석하다 보니 뱅글뱅글 돌기만 했어요. 중심에 {keyword}이(가) 있었어요.',
      '이성적으로는 알아요. 근데 감정이 안 따라와요.',
      '분석이 도망이었다는 걸 뒤늦게 알았어요.',
      '더 이상 {keyword}을(를) 머리로만 처리하지 않기로 했어요.',
      '차갑게 구는 게 강함인 줄 알았는데, 그냥 겁쟁이였어요.',
    ],
    imprinting_templates: [
      '"왜 그렇게 차가워?"라는 말을 들었을 때 처음으로 내가 차갑다는 걸 알았어요.',
      '가장 화났을 때 오히려 조용해졌어요. 그 고요함이 낯설었어요.',
      '좋아하는 사람 앞에서 아무것도 느끼지 못하는 척했어요. 그게 자연스러워졌어요.',
      '울고 싶었는데 눈물이 안 나왔어요. 그날 이후 뭔가 굳어버린 것 같아요.',
      '상대가 떠났을 때 슬픔보다 분석이 먼저였어요. 그게 더 이상했어요.',
    ],
    root_templates: [
      '뜨거우면 다친다는 걸 일찍 배웠어요. 그래서 차갑게 있는 게 습관이 됐어요.',
      '감정적이면 진다고 생각했어요. 늘 이성이 무기였어요.',
      '불처럼 타올랐다가 상처받은 기억이 있어요. 그 뒤로 온도를 낮췄어요.',
      '냉정하다는 말을 칭찬으로 들었어요. 그게 정체성이 됐어요.',
      '가까워질수록 잃을 게 많아지니까 거리를 유지하는 게 안전했어요.',
    ],
  },

  '투명한 강': {
    style: 'poetic',
    signatureVocab: ['물 같아요', '투명함', '감싸줘요', '흐르는', '견딜 수'],
    templates: [
      '{keyword}은(는) 물 같아요. 잡으려 하면 빠져나가고, 가만히 있으면 감싸줘요.',
      '{keyword}이(가) 흐르는 방향을 바꾸려 했어요. 결국 넘치더라고요.',
      '관계에서 {keyword}은(는) 서로의 투명함을 견딜 수 있느냐의 문제인 것 같아요.',
      '보일 수 없어서 {keyword}을(를) 숨겼어요. 강이 막히면 썩더라고요.',
      '흘러가도록 두기로 했어요. 그게 나한테 {keyword}이에요.',
      '강이 바다로 가듯이. 내가 원하는 방향이 {keyword}인 것 같아요.',
      '흘러가요. 억지로 잡으면 다 쏟아져요.',
      '투명하게 보이는 게 제일 어려워요.',
      '막히지 않고 흐를 수 있으면 좋겠어요.',
      '언젠가 {keyword}이(가) 바다처럼 넓어질 것 같아요.',
    ],
    imprinting_templates: [
      '강가에 앉아 물을 보다가 울었어요. 이유도 모르고. 그게 처음이었어요.',
      '보이는 게 전부가 아니라는 걸 누군가 말해줬을 때 처음으로 내가 보였어요.',
      '숨길 수 없는 상황에서 다 들켰어요. 근데 아무 일도 없었어요. 그날이 바뀐 점이 됐어요.',
      '처음으로 "나 사실은…"이라고 말했을 때 상대가 고개를 끄덕였어요. 그게 각인됐어요.',
      '강물처럼 가만히 흘러가는 시간이 있었어요. 그때만큼은 아무것도 붙잡지 않았어요.',
    ],
    root_templates: [
      '투명하게 보이면 이용당할 것 같아서 흐리게 있었어요.',
      '솔직하면 관계가 깨진다고 배웠어요. 그래서 흘려보내는 게 안전했어요.',
      '막으면 썩는다는 걸 알면서도 막았어요. 두려움이 더 컸거든요.',
      '보여주지 않으면 상처받지 않는다고 믿었어요. 근데 안 보여주는 것도 아팠어요.',
      '흐르는 척하면서 사실은 멈춰 있었어요. 그게 오래됐어요.',
    ],
  },

  '느린 바람': {
    style: 'introspective',
    signatureVocab: ['천천히', '느리게', '속도', '급하게', '바꿔놓고'],
    templates: [
      '{keyword}은(는) 천천히 와요. 알아차리지 못하는 사이에 나를 바꿔놓고요.',
      '{keyword}에 대해 급하게 결론 내려다 더 엉켰어요. 느리게 가야 하는 것들이 있어요.',
      '내가 원하는 {keyword}의 속도와 상대의 속도가 달랐어요. 그게 갈등의 시작이었죠.',
      '천천히 다가가려 했는데 {keyword}이(가) 먼저 와있었어요.',
      '서두르지 않기로 했어요. 그게 나한테는 {keyword}을(를) 지키는 방법이에요.',
      '느리게 가도 괜찮다는 걸 배우는 중이에요. {keyword}도 그런 것 같아요.',
      '급하게 살다가 놓친 게 너무 많아요.',
      '천천히. 그게 전부예요.',
      '느려도 괜찮아요. 내 속도가 있으니까요.',
      '{keyword}도 시간이 지나면 달라지더라고요.',
    ],
    imprinting_templates: [
      '혼자 천천히 걷다가 처음으로 주변이 보였어요. 그 전까지는 늘 달렸어요.',
      '"왜 이렇게 느려?"라는 말을 많이 들었어요. 내 속도가 잘못된 줄 알았어요.',
      '급하게 결정한 게 후회됐을 때 처음으로 멈추는 게 용기라는 걸 알았어요.',
      '늦게 도착했는데 자리가 남아 있었어요. 그때 "괜찮다"는 걸 처음 느꼈어요.',
      '천천히 한 일이 가장 오래 남았어요. 그 경험이 각인됐어요.',
    ],
    root_templates: [
      '빠르게 살아야 뒤처지지 않는다고 배웠어요. 그래서 멈추는 게 무서웠어요.',
      '느리면 사랑받지 못한다고 믿었어요. 늘 서둘렀어요.',
      '속도를 늦추면 생각이 많아져서 더 힘들었어요. 바쁜 게 차라리 편했어요.',
      '기다리는 법을 배운 적이 없어요. 모든 걸 즉시 해결하려 했어요.',
      '천천히 가면 놓칠 것 같은 불안이 항상 있었어요.',
    ],
  },

  '검은 나비': {
    style: 'poetic',
    signatureVocab: ['변태', '아프지만', '어두운 곳', '날개', '다른 사람으로'],
    templates: [
      '{keyword}은(는) 변태 같아요. 아프지만 그 과정이 나를 다른 사람으로 만들어요.',
      '{keyword}이(가) 날개가 된다면 이 무거움을 견딜 수 있을 것 같아요.',
      '어두운 곳에서 {keyword}을(를) 마주했어요. 빛이 없으니까 오히려 선명하더라고요.',
      '떠나고 싶었는데 {keyword}이(가) 나를 붙잡았어요. 지금은 고마워요.',
      '부수고 다시 짓는 것 같아요. 관계도, 나도. 그게 {keyword}인 것 같아요.',
      '가장 어두울 때 가장 솔직했어요. 그 솔직함이 {keyword}이었어요.',
      '아파야 바뀌는 것들이 있어요.',
      '날개는 아픔 뒤에 생겨요.',
      '부서져도 괜찮아요. 새로 만들면 되니까요.',
      '어두운 곳에서 나온 사람이 빛을 더 잘 알아요.',
    ],
    imprinting_templates: [
      '가장 힘든 시기를 버티고 나서 처음으로 나비 한 마리를 봤어요. 뭔가 연결된 것 같았어요.',
      '다 잃었다고 생각했을 때 의외로 가벼워졌어요. 그 감각이 잊히지 않아요.',
      '어두운 방에 혼자 있을 때 처음으로 나 자신과 대화했어요.',
      '관계가 끝나고 나서 오히려 더 나다워진 것 같았어요. 그게 이상하고도 소중했어요.',
      '아픔이 지나간 자리에 새로운 뭔가가 자라는 걸 처음 봤어요.',
    ],
    root_templates: [
      '변화는 무조건 아프다고 배웠어요. 그래서 변화를 찾아다녔어요.',
      '어두운 곳에서만 솔직해질 수 있었어요. 밝은 데서는 가면을 써야 했거든요.',
      '부서지는 게 두렵지 않았어요. 이미 여러 번 겪었으니까요.',
      '아픔이 성장의 증거라고 믿어왔어요. 그게 때로는 자해처럼 됐어요.',
      '날개를 얻으려면 고치 안에서 견뎌야 한다는 걸 몸으로 알아요.',
    ],
  },

  '따뜻한 벽': {
    style: 'introspective',
    signatureVocab: ['벽', '보호', '도망', '헷갈려요', '처음이었어요'],
    templates: [
      '{keyword}을(를) 느끼면서도 벽을 세웠어요. 보호인지 도망인지 아직도 헷갈려요.',
      '{keyword}이(가) 문을 두드렸어요. 열어야 하는 걸 알면서도 못 열겠어요.',
      '벽 너머로 {keyword}이(가) 보여요. 손을 뻗으면 닿을 것 같은데 벽이 무너질까봐 무서워요.',
      '누군가 내 벽을 존중하면서 {keyword}을(를) 건넸어요. 처음이었어요.',
      '가까이 오는 것들을 거부했어요. {keyword}이(가) 무서웠거든요.',
      '벽을 세우는 이유가 상대가 아니라 나한테 있었어요. {keyword}도 마찬가지예요.',
      '따뜻하고 싶은데 차가워져요.',
      '벽이 녹는 데 시간이 걸려요.',
      '벽이 조금 낮아졌어요. 아주 조금이지만.',
      '따뜻함을 받아들이는 법을 배우는 중이에요.',
    ],
    imprinting_templates: [
      '처음으로 누군가 내 벽을 존중해줬어요. 밀지 않고 그냥 기다려줬어요.',
      '포옹을 거부했을 때 상대가 괜찮다고 했어요. 그게 더 따뜻했어요.',
      '차갑게 굴었는데도 떠나지 않은 사람이 있었어요. 그 사람이 각인됐어요.',
      '어릴 때 안아달라고 했는데 "크면 그런 거 필요없어"라는 말을 들었어요.',
      '따뜻한 방 안에서 혼자 있을 때가 제일 편했어요. 그게 오래됐어요.',
    ],
    root_templates: [
      '가까워지면 떠날 것 같아서 먼저 벽을 쌓았어요.',
      '따뜻함을 받으면 의존하게 된다고 무서웠어요.',
      '벽이 없으면 내가 흩어질 것 같았어요. 경계가 나를 지탱해줬어요.',
      '상처받은 뒤로 따뜻한 것들을 믿지 않게 됐어요.',
      '보호받는 게 어색해요. 항상 내가 보호하는 역할이었거든요.',
    ],
  },

  '흔들리는 뿌리': {
    style: 'emotional',
    signatureVocab: ['뿌리', '가족', '단단해지고', '흔들릴 때마다', '과거가 현재를'],
    templates: [
      '{keyword}의 뿌리가 어디인지 찾고 있어요. 가족인 것 같기도 하고, 나 자신인 것 같기도 하고.',
      '{keyword}이(가) 흔들릴 때마다 내 뿌리도 흔들려요. 단단해지고 싶어요.',
      '과거의 {keyword}이(가) 현재의 나를 만들었어요. 좋든 나쁘든.',
      '흔들리면서도 {keyword}을(를) 놓지 않으려 해요. 버팀목이니까요.',
      '뿌리를 찾아가는 길에서 만나는 게 {keyword}인 것 같아요.',
      '그 모든 흔들림 뒤에 남은 게 {keyword}이었어요.',
      '흔들려도 뿌리는 있어요.',
      '가족한테서 온 게 너무 많아요.',
      '흔들릴수록 뿌리가 깊어지는 것 같아요.',
      '뿌리가 있으니까 흔들려도 돼요.',
    ],
    imprinting_templates: [
      '부모님이 싸울 때 혼자 버틴 기억이 있어요. 그때부터 혼자 서는 법을 배웠어요.',
      '이사를 자주 해서 뿌리라는 게 없다고 생각했어요. 지금도 어딘가 떠도는 느낌이에요.',
      '할머니가 돌아가셨을 때 처음으로 뿌리가 흔들리는 느낌을 알았어요.',
      '고향에 돌아갔을 때 낯설었어요. 그 낯섦이 각인됐어요.',
      '가족 중 처음으로 다른 길을 선택했을 때, 뿌리와 싸우는 것 같았어요.',
    ],
    root_templates: [
      '흔들리지 않으려고 너무 단단하게 굳어 있었어요. 그게 오히려 부러질 뻔했어요.',
      '가족의 기대를 어깨에 지고 살아왔어요. 내 것과 남의 것이 섞여 있어요.',
      '뿌리가 없으면 불안해서 모든 곳에서 뿌리를 찾았어요.',
      '과거가 현재를 자꾸 끌어당겨요. 놓아주는 법을 모르겠어요.',
      '흔들리면 안 된다는 강박이 있었어요. 근데 흔들리지 않는 건 죽은 거더라고요.',
    ],
  },

  '작은 파도': {
    style: 'emotional',
    signatureVocab: ['파도처럼', '쌓여서', '맞이하기로', '두려워하면', '잔잔할 때'],
    templates: [
      '{keyword}은(는) 파도처럼 밀려왔다 빠져요. 잔잔할 때 정리해야 해요.',
      '{keyword}을(를) 두려워하면 더 커져요. 그냥 맞이하기로 했어요.',
      '작은 {keyword}이(가) 쌓여서 큰 파도가 됐어요. 하나씩 다뤘어야 했는데.',
      '잔잔할 때 {keyword}에 대해 생각해요. 파도가 오기 전에.',
      '자꾸 밀려오는 감정이 있어요. 그 이름이 {keyword}인 것 같아요.',
      '파도는 막을 수 없어요. 그 안에서 헤엄치는 법을 배우는 게 {keyword}인 것 같아요.',
      '작은 게 쌓이면 무너져요.',
      '파도에 휩쓸리지 않으려고 해요.',
      '파도가 와도 괜찮아요. 지나가니까요.',
      '조금씩 덜 무서워지고 있어요.',
    ],
    imprinting_templates: [
      '바다에서 파도에 밀렸을 때 처음으로 감정이 그런 거라는 걸 알았어요.',
      '작은 일에 갑자기 눈물이 났어요. 쌓인 게 터진 거였는데 그때는 몰랐어요.',
      '누군가 "괜찮아?"라고 물었을 때 처음으로 "아니"라고 했어요. 그 파도가 잔잔해졌어요.',
      '잔잔하다고 생각했는데 갑자기 무너졌어요. 그 경험이 각인됐어요.',
      '파도 앞에서 도망가지 않고 서 있어봤어요. 생각보다 견딜 만했어요.',
    ],
    root_templates: [
      '작은 감정들을 무시했어요. 쌓이면 어떻게 되는지 몰랐거든요.',
      '파도가 올 때마다 피하는 게 습관이 됐어요. 직면하는 법을 배운 적이 없었어요.',
      '감정의 크기가 두려웠어요. 작게 유지하려고 억눌렀어요.',
      '잔잔할 때 불안했어요. 언제 또 파도가 올지 몰라서요.',
      '휩쓸리지 않으려고 아예 바다에 안 들어갔어요. 그게 회피였어요.',
    ],
  },

  '닫힌 문': {
    style: 'introspective',
    signatureVocab: ['문을 닫았어요', '보호인 줄', '감옥', '이미 안에', '노크'],
    templates: [
      '{keyword}에 대해 문을 닫았어요. 보호인 줄 알았는데 감옥이었어요.',
      '{keyword}이(가) 들어올까봐 두려웠어요. 근데 이미 안에 있더라고요.',
      '누군가 노크를 했어요. {keyword}에 대해 이야기하자고. 아직 열지 못했어요.',
      '문 밖에서 {keyword}을(를) 기다렸어요. 오래오래.',
      '열면 무너질 것 같아서 닫아놨어요. 그게 나한테 {keyword}이었어요.',
      '벽을 세우는 게 취미였어요. 결국 나만 갇혔어요. {keyword}처럼.',
      '열 수가 없어요.',
      '문 앞에서 오래 서있어요.',
      '이번에는 열어보기로 했어요. 조금만.',
      '더 이상 {keyword}을(를) 문 밖에 세워두지 않기로 했어요.',
    ],
    imprinting_templates: [
      '방 문을 잠그고 혼자 있던 날이 많았어요. 그게 유일하게 안전한 공간이었어요.',
      '마음을 열었다가 배신당했어요. 그 뒤로 문이 잘 안 열려요.',
      '"왜 이렇게 닫혀있어?"라는 말을 들었을 때 처음으로 내가 닫혀 있다는 걸 알았어요.',
      '중요한 말을 하려다가 삼킨 적이 있어요. 그 말이 아직도 문 앞에 있어요.',
      '처음으로 문을 열었을 때 상대가 들어오지 않았어요. 그 뒤로 더 닫았어요.',
    ],
    root_templates: [
      '열면 상처받는다는 걸 반복해서 배웠어요.',
      '닫혀 있으면 아무도 떠나지 않아요. 들어오지도 않지만요.',
      '자기보호가 자기감금이 된 거예요. 그 경계가 무너졌어요.',
      '문을 여는 방법을 배운 적이 없어요. 항상 닫는 법만 알았어요.',
      '안에서 잠그는 건 내가 하는데, 열쇠는 밖에 있는 것 같아요.',
    ],
  },

  '긴 밤': {
    style: 'poetic',
    signatureVocab: ['밤에 제일', '새벽', '낮에는', '선명해요', '잠 못 자요'],
    templates: [
      '{keyword}은(는) 밤에 제일 선명해요. 낮에는 바빠서 못 느끼는 것들이.',
      '{keyword}이(가) 떠오르면 새벽까지 잠 못 자요.',
      '긴 밤을 {keyword}과(와) 함께 보냈어요. 아침이 오면 괜찮을 줄 알았는데.',
      '자려고 누웠다가 {keyword}이(가) 생각났어요. 끝이 없어요.',
      '새벽 3시에 혼자 있을 때, {keyword}이(가) 제일 크게 느껴졌어요.',
      '낮에는 괜찮은 척했어요. 밤에만 솔직해지는 게 {keyword}이에요.',
      '밤이 길어요.',
      '아침이 오면 또 괜찮은 척이에요.',
      '긴 밤도 결국 끝이 나더라고요.',
      '새벽이 지나면 아침이 와요. 항상 그랬어요.',
    ],
    imprinting_templates: [
      '새벽 4시에 울면서 누군가에게 문자를 보냈어요. 그게 처음이었어요.',
      '잠 못 자는 밤이 이어지다가 처음으로 내 감정과 마주했어요.',
      '밤에만 솔직해질 수 있었어요. 낮에는 너무 많은 사람이 보고 있어서.',
      '긴 밤을 혼자 버텼어요. 아침이 오면 또 버텼어요. 그게 반복됐어요.',
      '새벽에 상대한테서 연락이 왔어요. 그 밤이 지금도 선명해요.',
    ],
    root_templates: [
      '낮에는 바빠야 했어요. 밤에만 겨우 나 자신이 될 수 있었어요.',
      '혼자인 시간이 두려워서 밤을 없애고 싶었어요. 그래서 더 길게 느껴졌어요.',
      '밤에 무너지고 낮에 복구하는 게 패턴이 됐어요.',
      '수면이 불안과 연결돼서 자는 것 자체가 긴장됐어요.',
      '밤에만 진심이 나왔어요. 낮에는 역할을 연기했거든요.',
    ],
  },

  '무거운 빛': {
    style: 'analytical',
    signatureVocab: ['밝은 곳에서도', '직면', '외면', '선명해져요', '보인다고'],
    templates: [
      '{keyword}은(는) 밝은 곳에서도 무거울 수 있어요. 보인다고 가벼워지는 게 아니에요.',
      '{keyword}을(를) 직면하는 건 불편해요. 하지만 외면하면 더 무거워져요.',
      '무게를 나누면 {keyword}이(가) 덜 무거워질 줄 알았는데, 나눌수록 선명해져요.',
      '빛이 있어도 {keyword}이(가) 무거운 날이 있어요. 그 차이를 이제 알아요.',
      '보이는 것과 무거운 것은 달라요. 나한테 {keyword}은(는) 그런 거예요.',
      '다 드러나 있어도 아무도 몰랐어요. 그게 {keyword}의 무게예요.',
      '무거운데 버릴 수가 없어요.',
      '빛이 있어도 무거운 날이 있어요.',
      '조금씩 가벼워지고 있어요.',
      '{keyword}이(가) 무겁다는 걸 알게 된 것만으로도 달라졌어요.',
    ],
    imprinting_templates: [
      '밝아 보이는 사람이 제일 힘들다는 걸 내가 그 사람이 되고 나서 알았어요.',
      '모든 게 잘 되고 있을 때 갑자기 무너졌어요. 그 무게가 각인됐어요.',
      '"표정이 왜 그래?"라는 말을 들었을 때 처음으로 내 무게가 보인다는 걸 알았어요.',
      '밝게 웃었는데 집에 오니까 털썩 주저앉았어요. 그 간격이 너무 컸어요.',
      '처음으로 무겁다고 말했을 때 상대가 "그랬구나"라고 했어요. 그 말이 가벼워졌어요.',
    ],
    root_templates: [
      '밝아야 사랑받는다고 믿었어요. 그래서 무거운 걸 숨겼어요.',
      '강해 보여야 했어요. 무너지면 모두가 떠날 것 같았거든요.',
      '짐을 나누는 법을 배운 적이 없어요. 혼자 드는 게 당연했어요.',
      '가벼운 척이 습관이 됐어요. 진짜 무게를 잊고 싶었거든요.',
      '빛을 발하면 주목받고, 주목받으면 상처받으니까 무겁게 있는 게 차라리 안전했어요.',
    ],
  },

  '얇은 숲': {
    style: 'poetic',
    signatureVocab: ['숲처럼', '한 걸음씩', '가깝지만', '길을 잃었어요', '닿기엔'],
    templates: [
      '{keyword}이(가) 숲처럼 둘러싸여 있어요. 빠져나가려면 한 걸음씩 가야 해요.',
      '{keyword}의 숲에서 길을 잃었어요. 잃어버린 줄도 몰랐어요.',
      '얇은 나무 사이로 {keyword}이(가) 보여요. 가깝지만 닿기엔 멀어요.',
      '숲 안에서 {keyword}을(를) 마주했어요. 도망칠 곳이 없었어요.',
      '얇아 보여도 빠져나가기 어려운 게 있어요. 나한테는 {keyword}이 그래요.',
      '길을 만들어가는 중이에요. {keyword}이라는 숲에서.',
      '숲이 너무 깊어요.',
      '한 걸음씩이에요.',
      '숲을 빠져나오면 다른 경치가 있을 것 같아요.',
      '길이 없으면 만들면 돼요.',
    ],
    imprinting_templates: [
      '길을 잃은 적이 있어요. 실제로. 그때 처음으로 혼자라는 게 뭔지 알았어요.',
      '관계 안에서 갑자기 방향을 잃었어요. 숲 같았어요.',
      '얇아 보이는 관계가 제일 빠져나오기 힘들었어요. 경계가 없어서요.',
      '혼자 걸을 때 처음으로 내 발소리를 들었어요. 그게 각인됐어요.',
      '숲 속에서 빛이 들어오는 걸 봤어요. 그 순간을 아직 기억해요.',
    ],
    root_templates: [
      '얇아 보이는 것들이 제일 단단하다는 걸 반복해서 경험했어요.',
      '관계의 복잡함을 피하다 보니 더 깊이 들어와 있었어요.',
      '길이 없으면 만들어야 하는데 그 에너지가 없었어요.',
      '숲에 들어간 걸 선택한 건 나예요. 근데 왜 들어갔는지 몰랐어요.',
      '한 걸음씩이라는 말이 위로가 됐어요. 근데 그 한 걸음조차 무거웠어요.',
    ],
  },

  '고요한 비': {
    style: 'emotional',
    signatureVocab: ['비처럼', '막을 수 없고', '스며들어요', '겉으로는', '그치길'],
    templates: [
      '{keyword}은(는) 비처럼 와요. 막을 수 없고, 그치길 기다릴 수밖에 없어요.',
      '{keyword}에 젖어본 사람만 그 무게를 알아요. 겉으로는 안 보이거든요.',
      '고요하게 내리는 {keyword}이(가) 가장 깊이 스며들어요.',
      '우산을 쓰고 싶었는데 {keyword}이(가) 이미 들어와 있었어요.',
      '피하려다 더 맞았어요. 그게 나한테는 {keyword}이에요.',
      '비를 맞으면서도 괜찮은 척했어요. 나한테 {keyword}은(는) 그래요.',
      '그치길 기다려요.',
      '비에 젖은 채로 괜찮은 척이에요.',
      '비가 그치면 맑아요. 항상.',
      '젖어도 괜찮아요. 마르니까요.',
    ],
    imprinting_templates: [
      '비 맞고 집에 들어왔을 때 아무도 없었어요. 그 고요함이 각인됐어요.',
      '비가 오는 날 처음으로 울었어요. 빗소리가 가려줬거든요.',
      '중요한 이야기를 비 오는 날 들었어요. 그 뒤로 비가 오면 그게 생각나요.',
      '비가 그치고 나서 처음으로 숨을 크게 쉬었어요. 그 순간이 아직도요.',
      '비 속에서 누군가와 같이 걸었어요. 그게 처음으로 외롭지 않았던 순간이에요.',
    ],
    root_templates: [
      '감정이 비처럼 왔다가 가도록 내버려두는 게 편했어요. 막으면 더 힘드니까요.',
      '젖는 게 두려워서 피했는데, 피하는 것도 지쳤어요.',
      '고요하게 있으면 아무도 건드리지 않았어요. 그래서 조용히 살았어요.',
      '비가 오면 멈출 수밖에 없었어요. 그 멈춤이 유일한 쉬는 방법이었어요.',
      '감정을 비처럼 대했어요. 와도 맞고 가면 마르는 거라고. 근데 폐렴이 걸렸어요.',
    ],
  },

  '숨은 달': {
    style: 'introspective',
    signatureVocab: ['숨겨왔어요', '약해 보일까봐', '혼자서', '드러나니까', '숨 쉴 수'],
    templates: [
      '{keyword}을(를) 숨겨왔어요. 보여주면 약해 보일까봐.',
      '{keyword}이(가) 드러나는 게 두려웠는데, 드러나니까 숨 쉴 수 있었어요.',
      '구름 뒤에 숨어서 {keyword}을(를) 느꼈어요. 혼자서요.',
      '보여주기 싫어서 {keyword}을(를) 감췄어요. 오래오래.',
      '아무도 몰랐어요. 나만 알고 있었어요. 그게 {keyword}이었어요.',
      '혼자 감당했어요. 그게 강한 거라고 생각했거든요. {keyword}도 그랬어요.',
      '아직 다 못 꺼냈어요.',
      '보여주는 게 무서워요.',
      '조금씩 꺼내고 있어요.',
      '숨지 않아도 괜찮다는 걸 배우는 중이에요.',
    ],
    imprinting_templates: [
      '처음으로 "사실 힘들었어"라고 말했을 때 상대가 "알고 있었어"라고 했어요.',
      '달이 구름 뒤에 있어도 빛은 새어나온다는 걸 어느 날 알았어요.',
      '혼자 해결해야 한다는 말을 어릴 때부터 들었어요. 그게 자랑인 줄 알았어요.',
      '숨고 싶었는데 누군가 찾아줬어요. 그 경험이 아직도 낯설고 소중해요.',
      '감추고 있던 게 어느 순간 드러났을 때, 세상이 무너지지 않았어요. 그게 놀라웠어요.',
    ],
    root_templates: [
      '드러내면 이용당한다는 걸 여러 번 배웠어요.',
      '강해 보여야 사랑받는다고 믿었어요. 약한 모습은 숨겼어요.',
      '혼자 해결하는 게 자랑이었어요. 도움 요청이 실패처럼 느껴졌거든요.',
      '숨어 있으면 실망시킬 일도 없어요. 그게 안전했어요.',
      '달처럼 멀리서 빛나는 게 더 편했어요. 가까이 가면 결함이 보이니까요.',
    ],
  },

  '갈라진 거울': {
    style: 'analytical',
    signatureVocab: ['갈라진', '조각마다', '원래 모양', '맞추고 있어요', '다시 맞추'],
    templates: [
      '{keyword}에 대한 내 모습이 깨져 있어요. 조각마다 다른 내가 보여요.',
      '{keyword}을(를) 통해 나를 다시 맞추고 있어요. 원래 모양은 아니지만.',
      '거울이 갈라진 건 {keyword} 때문이에요. 그 전에는 하나인 줄 알았어요.',
      '조각난 상태에서 {keyword}을(를) 보면 더 선명하게 보여요.',
      '부서진 뒤에야 내가 어떤 사람인지 알았어요. 그게 {keyword}이에요.',
      '맞추려는 과정 자체가 {keyword}인 것 같아요.',
      '조각이 많아요.',
      '맞추는 중이에요.',
      '갈라진 채로도 괜찮아요.',
      '조각들을 다 알게 됐으니까 오히려 더 나인 것 같아요.',
    ],
    imprinting_templates: [
      '거울이 깨졌을 때 조각마다 다른 내 얼굴이 보였어요. 이상하게 반가웠어요.',
      '중요한 관계가 끝나고 나서 내가 여러 조각인 걸 처음으로 알았어요.',
      '"너는 상황마다 달라"라는 말을 들었어요. 그게 각인됐어요.',
      '거울을 오래 보다가 낯선 사람을 만났어요. 나였어요.',
      '조각들을 맞추려다 포기한 순간이 있었어요. 그 포기가 역설적으로 시작이었어요.',
    ],
    root_templates: [
      '하나의 일관된 자아를 유지해야 한다는 압박이 있었어요.',
      '상황마다 다른 나를 부끄럽게 여겼어요. 그게 나를 더 갈라뜨렸어요.',
      '깨진 걸 숨기려고 에너지를 다 썼어요. 맞추는 대신 가리는 데.',
      '원래 모양이 있다고 믿었어요. 근데 원래부터 조각이었을 수도 있어요.',
      '누군가 보여주면 떠날 것 같아서 완전한 척했어요.',
    ],
  },

  '먼 별': {
    style: 'poetic',
    signatureVocab: ['별처럼', '멀리서', '뜨거운 줄도', '도착할 수 있을지', '가까이 가면'],
    templates: [
      '{keyword}은(는) 별처럼 멀리서 빛나요. 가까이 가면 뜨거운 줄도 모르고.',
      '{keyword}을(를) 향해 걸어가고 있어요. 도착할 수 있을지 모르지만.',
      '멀리서 {keyword}을(를) 바라보면 아름다운데, 가까이 가면 복잡해요.',
      '손에 닿지 않는 {keyword}이(가) 있어요. 원하는 것들이 다 그래요.',
      '닿을 수 없어서 더 아름다웠어요. 나한테 {keyword}은(는) 그런 거예요.',
      '멀리서 보는 게 더 나을 때도 있어요. {keyword}처럼.',
      '멀수록 빛나는 게 있어요.',
      '가까이 가면 복잡해요.',
      '언젠가는 닿을 것 같아요.',
      '가까워지는 중이에요. 천천히.',
    ],
    imprinting_templates: [
      '밤하늘의 별을 보다가 처음으로 작다는 느낌이 위로가 됐어요.',
      '멀리 있는 사람이 제일 그리웠어요. 가까이 있을 때는 몰랐는데.',
      '원하는 게 손에 닿기 직전에 사라진 적이 있어요. 그게 각인됐어요.',
      '멀리서 봤을 때는 완벽했어요. 가까이 가니까 달랐어요. 그게 반복됐어요.',
      '처음으로 별이 이미 사라진 빛일 수도 있다는 걸 알았을 때 슬펐어요.',
    ],
    root_templates: [
      '가까이 있으면 실망시키거나 실망하는 게 두려워서 거리를 뒀어요.',
      '멀리 있으면 상상으로 완벽하게 만들 수 있었어요.',
      '닿을 수 없는 것들을 원하는 게 습관이 됐어요. 안전하니까요.',
      '가까워지면 있는 그대로 보여야 하는데 그게 무서웠어요.',
      '이상을 추구하다 보니 현실이 항상 부족하게 느껴졌어요.',
    ],
  },

  '낮은 불꽃': {
    style: 'emotional',
    signatureVocab: ['작은 불꽃', '꺼지지 않게', '거의 꺼질 뻔', '이번에는', '온기'],
    templates: [
      '{keyword}은(는) 작은 불꽃 같아요. 꺼지지 않게 지키고 싶어요.',
      '{keyword}의 온기가 필요해요. 차가움에 익숙해지면 안 되니까요.',
      '거의 꺼질 뻔한 {keyword}을(를) 다시 살렸어요. 이번에는 혼자가 아니에요.',
      '작은 {keyword}이(가) 남아 있어요. 이걸 지키는 게 지금 제 일이에요.',
      '겨우 남은 게 있어요. 그게 {keyword}이에요.',
      '꺼지지 않게 하려고 매일 노력해요. {keyword}이 그래요.',
      '아직 꺼지지 않았어요.',
      '작아도 따뜻해요.',
      '조금씩 커지고 있어요.',
      '꺼질 것 같았는데 안 꺼졌어요.',
    ],
    imprinting_templates: [
      '모든 게 사라진 것 같았는데 아주 작은 게 남아 있었어요. 그게 나를 살렸어요.',
      '처음으로 누군가 내 불꽃을 꺼뜨리지 않으려 조심해줬어요.',
      '거의 다 포기했을 때 한마디가 다시 불을 켰어요. 그 사람을 기억해요.',
      '혼자 지키던 불꽃이 바람에 흔들렸어요. 그때 처음으로 도움을 요청했어요.',
      '작은 성공 하나가 불씨가 됐어요. 그게 각인됐어요.',
    ],
    root_templates: [
      '꺼지지 않으려고 스스로를 낮게 유지했어요. 크면 눈에 띄고, 눈에 띄면 꺼지니까요.',
      '에너지를 아껴야 했어요. 많이 쓰면 금방 꺼질 것 같았거든요.',
      '온기를 받는 게 어색했어요. 차가움에 너무 익숙해져서요.',
      '불꽃이 작아야 오래 간다고 믿었어요. 그게 자기검열이었어요.',
      '꺼질 것 같아서 아무것도 시작 못 했어요. 시작하면 잃을 게 생기니까요.',
    ],
  },

  '깨진 시계': {
    style: 'analytical',
    signatureVocab: ['멈춰 있어요', '그 순간', '수리가 필요해요', '시간이 해결', '움직이지 못하고'],
    templates: [
      '{keyword}에 대한 시간이 멈춰 있어요. 그때의 나에서 움직이지 못하고 있어요.',
      '{keyword}은(는) 시간이 해결해줄 줄 알았는데, 시간이 멈춰 있으면 소용없어요.',
      '시계가 깨진 건 {keyword}이(가) 멈춘 그 순간이에요. 다시 가려면 수리가 필요해요.',
      '멈춰 있는 {keyword}을(를) 어떻게 다시 시작해야 할지 모르겠어요.',
      '그때 이후로 바뀐 게 없어요. 나도, 관계도. 그게 {keyword}이에요.',
      '시계를 고치려면 그 순간으로 돌아가야 해요. {keyword}도 마찬가지예요.',
      '아직 그때예요.',
      '시간이 안 가요.',
      '천천히 다시 가기 시작했어요.',
      '멈춰 있어도 괜찮아요. 언젠가는 움직일 거니까요.',
    ],
    imprinting_templates: [
      '어떤 순간 이후로 시간이 이상하게 느껴졌어요. 그 전과 후가 완전히 달라요.',
      '오래된 사진을 보다가 그때 나로 돌아간 것 같았어요. 그게 무서웠어요.',
      '특정 날짜가 오면 항상 그 순간으로 돌아가요. 시계가 거기서 멈춘 것 같아요.',
      '치료를 시작했을 때 처음으로 시간이 다시 흐르는 느낌이 났어요.',
      '"그건 끝난 일이야"라는 말이 와닿지 않았어요. 나한테는 아직 진행 중이었거든요.',
    ],
    root_templates: [
      '특정 상처에서 시간이 멈췄어요. 몸은 앞으로 가는데 마음이 안 와요.',
      '그때로 자꾸 돌아가는 건 해결되지 않은 게 있어서예요.',
      '과거를 놓으면 그 관계도 없어지는 것 같아서 붙들고 있었어요.',
      '시간이 해결해준다고 기다렸는데, 기다리는 것만 반복됐어요.',
      '그 순간부터 자신을 믿지 못하게 됐어요. 판단이 틀렸다고 생각했거든요.',
    ],
  },
};

// 해시 함수: 3-seed 조합으로 동일 DAY 내 캐릭터 간 충돌 최소화
function pseudoRandom(seed1: number, seed2: number, seed3: number): number {
  const x = Math.sin(seed1 * 1009 + seed2 * 937 + seed3 * 503) * 233280;
  return x - Math.floor(x);
}

// 조사 자동 선택 후 치환 (이었어요/였어요 포함)
function applyKeyword(template: string, keyword: string): string {
  const code = keyword.charCodeAt(keyword.length - 1);
  const hasJongseong = code > 0xAC00 && (code - 0xAC00) % 28 !== 0;
  return template
    .replace(/\{keyword\}은\(는\)/g, keyword + (hasJongseong ? '은' : '는'))
    .replace(/\{keyword\}이\(가\)/g, keyword + (hasJongseong ? '이' : '가'))
    .replace(/\{keyword\}을\(를\)/g, keyword + (hasJongseong ? '을' : '를'))
    .replace(/\{keyword\}과\(와\)/g, keyword + (hasJongseong ? '과' : '와'))
    .replace(/\{keyword\}이었어요/g, keyword + (hasJongseong ? '이었어요' : '였어요'))
    .replace(/\{keyword\}이에요/g, keyword + (hasJongseong ? '이에요' : '예요'))
    .replace(/\{keyword\}/g, keyword);
}

function selectFromPool(
  pool: string[],
  aliasIndex: number,
  dayNumber: number,
  participantIdx: number,
  salt: number,
): string {
  const n = pool.length;
  const base = Math.floor(pseudoRandom(aliasIndex * salt, dayNumber * 5, participantIdx * 17) * n);
  const offset = Math.floor(dayNumber / 3) % n;
  return pool[(base + offset) % n];
}

/*
  템플릿 인덱스 구조 (캐릭터별 10개):
    0~1  keyword 초반  — 체념/중립 톤
    2~3  keyword 중반  — 인식 톤
    4~5  keyword 후반  — 인식/저항 톤
    6~7  keyword-free  — 짧은 체념/저항
    8~9  keyword-free  — 낙관/성장 톤

  DAY 구간별 낙관 톤(8~9) 선택 가중치:
    DAY  1~20  → 10% (초기: 주로 체념/인식)
    DAY 21~50  → 25% (중반: 저항 증가)
    DAY 51~100 → 45% (후반: 성장/낙관 우세)
*/
function optimismWeight(dayNumber: number): number {
  if (dayNumber <= 20) return 0.10;
  if (dayNumber <= 50) return 0.25;
  return 0.45;
}

function selectTemplateIndex(
  tone: { templates: string[] },
  aliasIndex: number,
  dayNumber: number,
  participantIdx: number,
): number {
  const total = tone.templates.length;
  const optimismStart = 8; // 낙관 톤 시작 인덱스
  const freeStart = 6;
  const optimismCount = Math.max(0, total - optimismStart);
  const freeOnly = Math.max(0, optimismStart - freeStart); // index 6~7
  const kwCount = Math.min(freeStart, total);             // index 0~5

  const roll = pseudoRandom(aliasIndex * 7, dayNumber * 3, participantIdx * 11);

  // 낙관 톤 선택
  if (optimismCount > 0 && roll < optimismWeight(dayNumber)) {
    const base = Math.floor(pseudoRandom(aliasIndex * 3, dayNumber * 7, participantIdx * 19) * optimismCount);
    const offset = Math.floor(dayNumber / 3) % optimismCount;
    return optimismStart + ((base + offset) % optimismCount);
  }

  // keyword-free(6~7) — 나머지 40% 중 절반
  const roll2 = pseudoRandom(aliasIndex * 13, dayNumber * 5, participantIdx * 7);
  if (freeOnly > 0 && roll2 < 0.20) {
    const base = Math.floor(pseudoRandom(aliasIndex * 5, dayNumber * 11, participantIdx * 23) * freeOnly);
    const offset = Math.floor(dayNumber / 4) % freeOnly;
    return freeStart + ((base + offset) % freeOnly);
  }

  // keyword 포함(0~5) — 기본
  const base = Math.floor(pseudoRandom(aliasIndex, dayNumber, participantIdx * 31) * kwCount);
  const offset = Math.floor(dayNumber / 4) % kwCount;
  return (base + offset) % kwCount;
}

// DAY 1~100에 대해 알고리즘 기반으로 가상유저 응답 생성 (definition + imprinting_moment + root_cause)
function generateVirtualEntries(dayNumber: number): Omit<VirtualCodetalkEntry, 'is_virtual'>[] {
  const keyword = EXTENDED_KEYWORDS[dayNumber] ?? ALL_KEYWORDS[dayNumber];
  if (!keyword) return [];

  const entries: Omit<VirtualCodetalkEntry, 'is_virtual'>[] = [];
  const participantCount = 3 + Math.floor(pseudoRandom(dayNumber, 7, 11) * 3);
  const usedAliases = new Set<string>();

  for (let i = 0; i < participantCount; i++) {
    const aliasIndex = Math.floor(pseudoRandom(dayNumber, i * 13, 100) * ALIASES.length);
    const alias = ALIASES[aliasIndex];
    if (usedAliases.has(alias)) continue;
    usedAliases.add(alias);

    const tone = CHARACTER_TONES[alias];
    if (!tone) continue;

    const templateIndex = selectTemplateIndex(tone, aliasIndex, dayNumber, i);
    const definition = applyKeyword(tone.templates[templateIndex], keyword);
    const imprinting_moment = applyKeyword(
      selectFromPool(tone.imprinting_templates, aliasIndex, dayNumber, i, 23),
      keyword,
    );
    const root_cause = applyKeyword(
      selectFromPool(tone.root_templates, aliasIndex, dayNumber, i, 41),
      keyword,
    );

    const hoursAgo = 3 + Math.floor(pseudoRandom(dayNumber, i * 17, 200) * 8);
    entries.push({
      id: `vc-${dayNumber}-${i + 1}`,
      anon_alias: alias,
      keyword,
      day_number: dayNumber,
      definition,
      imprinting_moment,
      root_cause,
      created_at: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
    });
  }

  return entries;
}

// 전체 키워드 맵 (DAY 1~100)
const ALL_KEYWORDS: Record<number, string> = {
  ...DAY_1_20_KEYWORDS,
  ...EXTENDED_KEYWORDS,
};

export function getVirtualCodetalkEntries(dayNumber: number): VirtualCodetalkEntry[] {
  const generated = generateVirtualEntries(dayNumber);
  return generated.map(e => ({ ...e, is_virtual: true as const }));
}

// 특정 DAY 이전의 모든 가상유저 피드 (spoiler 방지: 현재 DAY 미만만 반환)
export function getVirtualFeedUpToDay(currentDay: number, limit = 20): VirtualCodetalkEntry[] {
  const allEntries: VirtualCodetalkEntry[] = [];

  for (let d = Math.max(1, currentDay - 7); d < currentDay; d++) {
    const entries = getVirtualCodetalkEntries(d);
    allEntries.push(...entries);
  }

  return allEntries
    .sort((a, b) => b.day_number - a.day_number || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export function getParticipantCount(dayNumber: number): number {
  return getVirtualCodetalkEntries(dayNumber).length;
}

export const VIRTUAL_USER_COUNT = ALIASES.length;

export interface VirtualResonance {
  anon_alias: string;
  text: string;
}

// 실제 유저 public 항목에 가상유저 공감 반응 생성 (결정론적 — 동일 입력 → 동일 출력)
const RESONANCE_TEMPLATES = [
  '이 부분이 저한테도 있어요. 혼자가 아니라는 게 위로가 돼요.',
  '읽으면서 고개를 끄덕였어요.',
  '다른 표현인데 같은 감각이에요.',
  '이 느낌을 이렇게 말할 수 있는 게 신기해요.',
  '저도 정확히 이 지점에서 막혔어요.',
  '이걸 보고 나서 내 답이 달라질 것 같아요.',
  '같은 키워드인데 이렇게 다르게 닿을 수 있군요.',
  '공감이에요. 말하지 않아도 알 것 같아요.',
];

export function getVirtualResonances(
  dayNumber: number,
  entryIndex: number,
  count = 2,
): VirtualResonance[] {
  const resonances: VirtualResonance[] = [];
  const usedAliases = new Set<string>();

  for (let i = 0; i < count; i++) {
    const aliasIdx = Math.floor(pseudoRandom(dayNumber * 59, entryIndex * 37, i * 71) * ALIASES.length);
    const alias = ALIASES[aliasIdx];
    if (usedAliases.has(alias)) continue;
    usedAliases.add(alias);

    const textIdx = Math.floor(pseudoRandom(aliasIdx * 13, dayNumber * 29, entryIndex * 53) * RESONANCE_TEMPLATES.length);
    resonances.push({ anon_alias: alias, text: RESONANCE_TEMPLATES[textIdx] });
  }

  return resonances;
}

export const KEYWORD_MAP: Record<number, string> = ALL_KEYWORDS;
