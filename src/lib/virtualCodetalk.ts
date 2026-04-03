// 가상유저 20명의 Codetalk 응답 시드 데이터
// auth.users FK 제약으로 DB 직접 삽입 불가 → 프론트 레이어에서 혼합 표시
// virtual_user_profiles의 writing_tone/primary_concern 기반으로 캐릭터성 반영

export interface VirtualCodetalkEntry {
  id: string;
  anon_alias: string;
  keyword: string;
  day_number: number;
  definition: string;
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

// 키워드별 가상유저 응답 (DAY 1~20, 각 키워드에 3~5명의 가상유저 응답)
const VIRTUAL_RESPONSES: Record<number, Omit<VirtualCodetalkEntry, 'is_virtual'>[]> = {
  1: [ // 사랑
    { id: 'vc-1-1', anon_alias: '조용한 달', keyword: '사랑', day_number: 1,
      definition: '사랑은 상대가 없어도 사라지지 않는 감정이라고 생각했어요. 근데 없어지더라고요. 그래서 사랑이 뭔지 다시 모르겠어요.',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
    { id: 'vc-1-2', anon_alias: '유리 거울', keyword: '사랑', day_number: 1,
      definition: '내가 원하는 대로 반응해주는 게 사랑이라고 착각했던 것 같아요. 그건 통제였죠.',
      created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
    { id: 'vc-1-3', anon_alias: '흔들리는 뿌리', keyword: '사랑', day_number: 1,
      definition: '사랑은 선택이에요. 매일 다시 선택하는 거예요. 감정은 오고 가지만 선택은 남으니까.',
      created_at: new Date(Date.now() - 7 * 3600000).toISOString() },
    { id: 'vc-1-4', anon_alias: '깊은 안개', keyword: '사랑', day_number: 1,
      definition: '어떤 날은 사랑이 너무 무거워서 도망가고 싶고, 어떤 날은 그게 유일한 이유가 돼요.',
      created_at: new Date(Date.now() - 9 * 3600000).toISOString() },
  ],
  2: [ // 행복
    { id: 'vc-2-1', anon_alias: '차가운 불', keyword: '행복', day_number: 2,
      definition: '행복은 아무도 나를 평가하지 않는 순간이에요. 혼자 커피 마시면서 아무 생각 없을 때.',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString() },
    { id: 'vc-2-2', anon_alias: '작은 파도', keyword: '행복', day_number: 2,
      definition: '행복해야 한다는 압박이 없어질 때 비로소 행복해지는 것 같아요.',
      created_at: new Date(Date.now() - 6 * 3600000).toISOString() },
    { id: 'vc-2-3', anon_alias: '느린 바람', keyword: '행복', day_number: 2,
      definition: '관계 안에서의 행복은 상대가 나를 이해해준다는 느낌이 들 때예요. 근데 그게 참 어렵더라고요.',
      created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  ],
  3: [ // 자유
    { id: 'vc-3-1', anon_alias: '검은 나비', keyword: '자유', day_number: 3,
      definition: '자유는 혼자 있는 게 아니라 함께 있으면서도 나일 수 있는 거예요. 아직 한 번도 경험 못했지만.',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
    { id: 'vc-3-2', anon_alias: '닫힌 문', keyword: '자유', day_number: 3,
      definition: '관계에서 자유로워지고 싶다는 말이 떠나고 싶다는 뜻은 아닌데, 상대는 항상 그렇게 받아들여요.',
      created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
    { id: 'vc-3-3', anon_alias: '따뜻한 벽', keyword: '자유', day_number: 3,
      definition: '"너 없이도 괜찮아"라고 말할 수 있을 때가 진짜 자유인 것 같아요. 그런데 그 말이 너무 무섭기도 해요.',
      created_at: new Date(Date.now() - 7 * 3600000).toISOString() },
    { id: 'vc-3-4', anon_alias: '먼 별', keyword: '자유', day_number: 3,
      definition: '자유라는 단어를 들으면 제일 먼저 떠오르는 건 이별이에요. 왜 항상 자유와 이별이 같이 오는 걸까요.',
      created_at: new Date(Date.now() - 10 * 3600000).toISOString() },
  ],
  4: [ // 신뢰
    { id: 'vc-4-1', anon_alias: '갈라진 거울', keyword: '신뢰', day_number: 4,
      definition: '신뢰는 한 번 깨지면 복구가 아니라 재건이에요. 같은 건물을 짓는 게 아니라 새로 설계해야 해요.',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString() },
    { id: 'vc-4-2', anon_alias: '투명한 강', keyword: '신뢰', day_number: 4,
      definition: '신뢰는 말이 아니라 시간으로 증명되는 것 같아요. 말로 "믿어"라고 하는 사람을 제일 못 믿게 됐어요.',
      created_at: new Date(Date.now() - 6 * 3600000).toISOString() },
    { id: 'vc-4-3', anon_alias: '고요한 비', keyword: '신뢰', day_number: 4,
      definition: '전 남자친구가 거짓말을 반복하면서도 "왜 못 믿어?"라고 했어요. 그 이후로 신뢰라는 말 자체가 트리거예요.',
      created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  ],
  5: [ // 존중
    { id: 'vc-5-1', anon_alias: '무거운 빛', keyword: '존중', day_number: 5,
      definition: '존중은 내 "아니오"를 받아들여주는 거예요. 이유를 묻지 않고.',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
    { id: 'vc-5-2', anon_alias: '조용한 달', keyword: '존중', day_number: 5,
      definition: '존중받고 있다는 걸 느끼려면 먼저 내가 나를 존중해야 하는 것 같아요. 근데 그게 제일 어려워요.',
      created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
    { id: 'vc-5-3', anon_alias: '낮은 불꽃', keyword: '존중', day_number: 5,
      definition: '"네 감정도 중요해"라는 한마디가 관계를 바꿨어요. 그 전까지 내 감정은 항상 두 번째였거든요.',
      created_at: new Date(Date.now() - 7 * 3600000).toISOString() },
  ],
  6: [ // 안전
    { id: 'vc-6-1', anon_alias: '따뜻한 벽', keyword: '안전', day_number: 6,
      definition: '안전한 관계는 실수해도 버림받지 않는다는 확신이 있는 관계예요.',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString() },
    { id: 'vc-6-2', anon_alias: '깨진 시계', keyword: '안전', day_number: 6,
      definition: '한 번도 안전하다고 느낀 적이 없어요. 관계에서도, 혼자서도. 그래서 뭘 기준으로 안전을 판단해야 하는지 모르겠어요.',
      created_at: new Date(Date.now() - 6 * 3600000).toISOString() },
    { id: 'vc-6-3', anon_alias: '작은 파도', keyword: '안전', day_number: 6,
      definition: '안전감은 상대가 화났을 때 어떻게 행동하느냐로 결정되는 것 같아요.',
      created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  ],
  7: [ // 외로움
    { id: 'vc-7-1', anon_alias: '긴 밤', keyword: '외로움', day_number: 7,
      definition: '옆에 사람이 있는데 외로운 게 혼자 있는 것보다 훨씬 외로워요.',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
    { id: 'vc-7-2', anon_alias: '깊은 안개', keyword: '외로움', day_number: 7,
      definition: '내 이야기를 하는데 상대의 눈이 딴 데 있을 때. 그때 제일 외로워요.',
      created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
    { id: 'vc-7-3', anon_alias: '숨은 달', keyword: '외로움', day_number: 7,
      definition: '외로움이 무서워서 아무나 만났어요. 그게 더 외로웠어요.',
      created_at: new Date(Date.now() - 7 * 3600000).toISOString() },
    { id: 'vc-7-4', anon_alias: '유리 거울', keyword: '외로움', day_number: 7,
      definition: '외로움을 인정하는 데 3년 걸렸어요. 인정하고 나니까 오히려 편해졌어요.',
      created_at: new Date(Date.now() - 9 * 3600000).toISOString() },
  ],
  8: [ // 연결
    { id: 'vc-8-1', anon_alias: '흔들리는 뿌리', keyword: '연결', day_number: 8,
      definition: '진짜 연결은 말 없이도 통하는 게 아니라, 말해야 할 때 말할 수 있는 거예요.',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString() },
    { id: 'vc-8-2', anon_alias: '차가운 불', keyword: '연결', day_number: 8,
      definition: '연결되고 싶은데 연결되면 도망가고 싶어지는 이 모순을 아직 해결 못 했어요.',
      created_at: new Date(Date.now() - 6 * 3600000).toISOString() },
    { id: 'vc-8-3', anon_alias: '얇은 숲', keyword: '연결', day_number: 8,
      definition: '서로의 상처를 보여줄 수 있을 때 연결이 시작되는 것 같아요.',
      created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  ],
  9: [ // 경계
    { id: 'vc-9-1', anon_alias: '닫힌 문', keyword: '경계', day_number: 9,
      definition: '경계를 세우면 이기적이라고 들었어요. 그래서 경계가 뭔지 배울 수가 없었어요.',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
    { id: 'vc-9-2', anon_alias: '검은 나비', keyword: '경계', day_number: 9,
      definition: '내 경계를 알게 된 건 누군가 그걸 넘었을 때예요. 그 전까지는 경계가 있는지도 몰랐어요.',
      created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
    { id: 'vc-9-3', anon_alias: '무거운 빛', keyword: '경계', day_number: 9,
      definition: '"싫어"라고 말하는 연습을 3개월째 하고 있어요. 아직도 목에서 막혀요.',
      created_at: new Date(Date.now() - 7 * 3600000).toISOString() },
  ],
  10: [ // 솔직함
    { id: 'vc-10-1', anon_alias: '투명한 강', keyword: '솔직함', day_number: 10,
      definition: '솔직하면 상처받을까봐 거짓말했는데, 거짓말이 더 상처를 줬어요.',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString() },
    { id: 'vc-10-2', anon_alias: '느린 바람', keyword: '솔직함', day_number: 10,
      definition: '솔직한 게 아니라 솔직할 수 있는 환경이 먼저인 것 같아요. 안전하지 않으면 솔직할 수 없어요.',
      created_at: new Date(Date.now() - 6 * 3600000).toISOString() },
    { id: 'vc-10-3', anon_alias: '갈라진 거울', keyword: '솔직함', day_number: 10,
      definition: '나한테 솔직한 게 제일 어려워요. 남들 앞에서보다.',
      created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  ],
  11: [ // 배려
    { id: 'vc-11-1', anon_alias: '고요한 비', keyword: '배려', day_number: 11,
      definition: '배려인 줄 알았는데 통제였어요. "너를 위해서"라는 말 뒤에 숨은 게 뭔지 이제 봐요.',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
    { id: 'vc-11-2', anon_alias: '조용한 달', keyword: '배려', day_number: 11,
      definition: '나를 배려하는 건 항상 후순위였어요. 다른 사람 먼저, 나는 나중에. 그게 미덕이라고 배웠거든요.',
      created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
    { id: 'vc-11-3', anon_alias: '낮은 불꽃', keyword: '배려', day_number: 11,
      definition: '진짜 배려는 상대가 원하는 걸 물어보는 거예요. 내가 생각하는 좋은 걸 주는 게 아니라.',
      created_at: new Date(Date.now() - 7 * 3600000).toISOString() },
  ],
  12: [ // 기대
    { id: 'vc-12-1', anon_alias: '작은 파도', keyword: '기대', day_number: 12,
      definition: '기대를 낮추면 실망도 없다고 하는데, 기대 없는 관계가 관계인가요?',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString() },
    { id: 'vc-12-2', anon_alias: '먼 별', keyword: '기대', day_number: 12,
      definition: '상대에게 기대하는 게 아니라 나한테 기대하기로 했어요. 그게 덜 아파요.',
      created_at: new Date(Date.now() - 6 * 3600000).toISOString() },
    { id: 'vc-12-3', anon_alias: '긴 밤', keyword: '기대', day_number: 12,
      definition: '기대는 말하지 않으면 원망이 되더라고요. 그걸 너무 늦게 알았어요.',
      created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  ],
  13: [ // 실망
    { id: 'vc-13-1', anon_alias: '깨진 시계', keyword: '실망', day_number: 13,
      definition: '가장 깊이 실망한 건 상대가 아니라 나한테였어요. 왜 그때 말하지 못했을까.',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
    { id: 'vc-13-2', anon_alias: '숨은 달', keyword: '실망', day_number: 13,
      definition: '실망은 기대가 있었다는 증거잖아요. 그래서 실망할 수 있다는 건 아직 포기 안 했다는 뜻이에요.',
      created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
    { id: 'vc-13-3', anon_alias: '따뜻한 벽', keyword: '실망', day_number: 13,
      definition: '"다음엔 다를 거야"라고 믿었던 열두 번째에서 멈췄어요.',
      created_at: new Date(Date.now() - 7 * 3600000).toISOString() },
  ],
  14: [ // 용기
    { id: 'vc-14-1', anon_alias: '유리 거울', keyword: '용기', day_number: 14,
      definition: '"우리 이야기 좀 하자"라고 먼저 말하는 게 제 인생에서 가장 큰 용기였어요.',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString() },
    { id: 'vc-14-2', anon_alias: '흔들리는 뿌리', keyword: '용기', day_number: 14,
      definition: '용기는 두렵지 않은 게 아니라 두려우면서도 하는 거라고 하잖아요. 매일 연습 중이에요.',
      created_at: new Date(Date.now() - 6 * 3600000).toISOString() },
    { id: 'vc-14-3', anon_alias: '검은 나비', keyword: '용기', day_number: 14,
      definition: '떠나는 것도 용기지만 남아서 바꾸려고 하는 것도 용기라는 걸 알았어요.',
      created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  ],
  15: [ // 취약함
    { id: 'vc-15-1', anon_alias: '닫힌 문', keyword: '취약함', day_number: 15,
      definition: '취약해지는 게 무서운 게 아니라, 취약해졌을 때 이용당할까봐 무서운 거예요.',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
    { id: 'vc-15-2', anon_alias: '깊은 안개', keyword: '취약함', day_number: 15,
      definition: '울고 싶을 때 울 수 있는 관계가 있으면 좋겠어요. 아직은 혼자 욕실에서 울어요.',
      created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
    { id: 'vc-15-3', anon_alias: '차가운 불', keyword: '취약함', day_number: 15,
      definition: '취약함을 보여줬더니 상대가 더 가까이 와줬어요. 처음이었어요.',
      created_at: new Date(Date.now() - 7 * 3600000).toISOString() },
  ],
  16: [ // 위로
    { id: 'vc-16-1', anon_alias: '무거운 빛', keyword: '위로', day_number: 16,
      definition: '"괜찮아"보다 "괜찮지 않아도 돼"가 더 위로가 돼요.',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString() },
    { id: 'vc-16-2', anon_alias: '얇은 숲', keyword: '위로', day_number: 16,
      definition: '가만히 옆에 앉아있어주는 거요. 말 안 해도 되고. 그게 제일 좋아요.',
      created_at: new Date(Date.now() - 6 * 3600000).toISOString() },
    { id: 'vc-16-3', anon_alias: '작은 파도', keyword: '위로', day_number: 16,
      definition: '위로를 받는 법을 모르겠어요. 누가 다가와도 "괜찮아"라고 먼저 말해버려요.',
      created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  ],
  17: [ // 침묵
    { id: 'vc-17-1', anon_alias: '긴 밤', keyword: '침묵', day_number: 17,
      definition: '편한 침묵이 있고 무거운 침묵이 있어요. 같은 사람인데 달라져요.',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
    { id: 'vc-17-2', anon_alias: '고요한 비', keyword: '침묵', day_number: 17,
      definition: '상대가 침묵하면 제 머릿속에서 최악의 시나리오가 시작돼요. 1분이 1시간 같아요.',
      created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
    { id: 'vc-17-3', anon_alias: '조용한 달', keyword: '침묵', day_number: 17,
      definition: '침묵이 답인 줄 알았는데 침묵이 문제였어요. 말을 안 한 게 아니라 못 한 거였거든요.',
      created_at: new Date(Date.now() - 7 * 3600000).toISOString() },
  ],
  18: [ // 시간
    { id: 'vc-18-1', anon_alias: '느린 바람', keyword: '시간', day_number: 18,
      definition: '혼자만의 시간이 필요하다고 하면 상대가 상처받아요. 그래서 말 못하고 같이 있어요.',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString() },
    { id: 'vc-18-2', anon_alias: '투명한 강', keyword: '시간', day_number: 18,
      definition: '시간을 많이 보내는 게 사랑의 증거는 아닌 것 같아요. 질이 중요한 거지.',
      created_at: new Date(Date.now() - 6 * 3600000).toISOString() },
    { id: 'vc-18-3', anon_alias: '갈라진 거울', keyword: '시간', day_number: 18,
      definition: '헤어진 후에야 그 시간이 얼마나 소중했는지 알게 되더라고요.',
      created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  ],
  19: [ // 거리
    { id: 'vc-19-1', anon_alias: '먼 별', keyword: '거리', day_number: 19,
      definition: '가까워지면 질식하고 멀어지면 불안해요. 적당한 거리를 아직 못 찾았어요.',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
    { id: 'vc-19-2', anon_alias: '숨은 달', keyword: '거리', day_number: 19,
      definition: '거리를 두는 게 보호인지 도망인지 구분이 안 돼요.',
      created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
    { id: 'vc-19-3', anon_alias: '낮은 불꽃', keyword: '거리', day_number: 19,
      definition: '적당한 거리는 서로가 함께 정하는 거라는 걸 이번 관계에서 처음 배웠어요.',
      created_at: new Date(Date.now() - 7 * 3600000).toISOString() },
  ],
  20: [ // 변화
    { id: 'vc-20-1', anon_alias: '따뜻한 벽', keyword: '변화', day_number: 20,
      definition: '변하고 싶은데 변하면 상대가 날 못 알아볼까봐 두려워요.',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString() },
    { id: 'vc-20-2', anon_alias: '깨진 시계', keyword: '변화', day_number: 20,
      definition: '안정을 원한다고 했는데 사실은 변하는 게 무서웠던 거예요.',
      created_at: new Date(Date.now() - 6 * 3600000).toISOString() },
    { id: 'vc-20-3', anon_alias: '유리 거울', keyword: '변화', day_number: 20,
      definition: '관계가 변하지 않으면 끝나더라고요. 변화를 두려워하면서 안정을 바라는 건 모순이었어요.',
      created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  ],
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

// 가상유저별 캐릭터 톤 (writing_tone 기반 응답 생성)
const CHARACTER_TONES: Record<string, {
  style: 'introspective' | 'emotional' | 'analytical' | 'poetic';
  templates: string[];
}> = {
  '조용한 달':     { style: 'introspective', templates: [
    '{keyword}은(는) 나한테 항상 조용히 다가와요. 인식하는 순간 이미 깊이 들어와 있죠.',
    '{keyword}에 대해 생각하면 어린 시절이 떠올라요. 그때 이미 시작된 것 같아요.',
    '모든 관계에서 {keyword}이(가) 반복돼요. 패턴인 걸 알면서도 빠져나오기 어려워요.',
  ]},
  '유리 거울':     { style: 'analytical', templates: [
    '{keyword}이(가) 뭔지 정의하려고 하면 할수록 더 모르겠어요. 경험하는 것과 설명하는 건 다른 일이에요.',
    '상대에게 {keyword}을(를) 기대했는데 그건 내가 나한테 못 주는 걸 떠넘긴 거였어요.',
    '{keyword}의 의미가 관계마다 달라지더라고요. 결국 상대가 아니라 나의 상태에 달린 거예요.',
  ]},
  '깊은 안개':     { style: 'emotional', templates: [
    '{keyword}을(를) 느끼면 가슴이 먼저 반응해요. 머리가 따라오기 전에 몸이 알아요.',
    '{keyword}이(가) 무서울 때가 있어요. 느끼는 것 자체가 위험하게 느껴질 때.',
    '지금 이 순간에도 {keyword}이(가) 여기 있어요. 이름을 붙이니까 조금 덜 무서워요.',
  ]},
  '차가운 불':     { style: 'analytical', templates: [
    '{keyword}에 대한 내 정의는 계속 바뀌어요. 그게 성장인지 혼란인지 모르겠어요.',
    '이성적으로 {keyword}을(를) 분석하면 답이 나오는데, 감정은 그 답을 따르지 않아요.',
    '{keyword}을(를) 느끼지 않으려고 분석만 했어요. 그게 제 방어기제였던 것 같아요.',
  ]},
  '투명한 강':     { style: 'poetic', templates: [
    '{keyword}은(는) 물 같아요. 잡으려 하면 빠져나가고, 가만히 있으면 감싸줘요.',
    '관계에서 {keyword}은(는) 서로의 투명함을 견딜 수 있느냐의 문제인 것 같아요.',
    '{keyword}이(가) 흐르는 방향을 바꾸려 했어요. 결국 넘치더라고요.',
  ]},
  '느린 바람':     { style: 'introspective', templates: [
    '{keyword}은(는) 천천히 와요. 알아차리지 못하는 사이에 나를 바꿔놓고요.',
    '급하게 {keyword}을(를) 해결하려다 더 엉켰어요. 느리게 가야 하는 것들이 있어요.',
    '내가 원하는 {keyword}의 속도와 상대의 속도가 달랐어요. 그게 갈등의 시작이었죠.',
  ]},
  '검은 나비':     { style: 'poetic', templates: [
    '{keyword}은(는) 변태 같아요. 아프지만 그 과정이 나를 다른 사람으로 만들어요.',
    '어두운 곳에서 {keyword}을(를) 마주했어요. 빛이 없으니까 오히려 선명하더라고요.',
    '{keyword}이(가) 날개가 된다면 이 무거움을 견딜 수 있을 것 같아요.',
  ]},
  '따뜻한 벽':     { style: 'introspective', templates: [
    '{keyword}을(를) 느끼면서도 벽을 세웠어요. 보호인지 도망인지 아직도 헷갈려요.',
    '벽 너머로 {keyword}이(가) 보여요. 손을 뻗으면 닿을 것 같은데 벽이 무너질까 봐 무서워요.',
    '누군가 내 벽을 존중하면서 {keyword}을(를) 건넸어요. 처음이었어요.',
  ]},
  '흔들리는 뿌리': { style: 'emotional', templates: [
    '{keyword}의 뿌리가 어디인지 찾고 있어요. 가족인 것 같기도 하고 나 자신인 것 같기도 하고.',
    '{keyword}이(가) 흔들릴 때마다 내 뿌리도 흔들려요. 단단해지고 싶어요.',
    '과거의 {keyword}이(가) 현재의 나를 만들었어요. 좋든 나쁘든.',
  ]},
  '작은 파도':     { style: 'emotional', templates: [
    '{keyword}은(는) 파도처럼 밀려왔다 빠져요. 잔잔할 때 정리해야 해요.',
    '작은 {keyword}이(가) 쌓여서 큰 파도가 됐어요. 하나씩 다뤘어야 했는데.',
    '{keyword}을(를) 두려워하면 더 커져요. 그냥 맞이하기로 했어요.',
  ]},
  '닫힌 문':       { style: 'introspective', templates: [
    '{keyword}에 대해 문을 닫았어요. 보호인 줄 알았는데 감옥이었어요.',
    '문을 열면 {keyword}이(가) 들어올까 봐 두려웠어요. 근데 이미 안에 있더라고요.',
    '누군가 노크를 했어요. {keyword}에 대해 이야기하자고. 아직 열지 못했어요.',
  ]},
  '긴 밤':         { style: 'poetic', templates: [
    '{keyword}은(는) 밤에 제일 선명해요. 낮에는 바빠서 못 느끼는 것들이.',
    '긴 밤을 {keyword}과(와) 함께 보냈어요. 아침이 오면 괜찮을 줄 알았는데.',
    '잠들기 전에 {keyword}이(가) 떠오르면 새벽까지 잠 못 자요.',
  ]},
  '무거운 빛':     { style: 'analytical', templates: [
    '{keyword}은(는) 밝은 곳에서도 무거울 수 있어요. 보인다고 가벼워지는 게 아니에요.',
    '{keyword}을(를) 직면하는 건 불편해요. 하지만 외면하면 더 무거워져요.',
    '무게를 나누면 덜 무거워질 줄 알았는데, {keyword}은(는) 나눌수록 선명해져요.',
  ]},
  '얇은 숲':       { style: 'poetic', templates: [
    '{keyword}이(가) 숲처럼 둘러싸여 있어요. 빠져나가려면 한 걸음씩 가야 해요.',
    '얇은 나무 사이로 {keyword}이(가) 보여요. 가깝지만 닿기엔 멀어요.',
    '{keyword}의 숲에서 길을 잃었어요. 근데 잃어버린 줄도 몰랐어요.',
  ]},
  '고요한 비':     { style: 'emotional', templates: [
    '{keyword}은(는) 비처럼 와요. 막을 수 없고, 그치길 기다릴 수밖에 없어요.',
    '고요하게 내리는 {keyword}이(가) 가장 깊이 스며들어요.',
    '{keyword}에 젖어본 사람만 그 무게를 알아요. 겉으로는 안 보이거든요.',
  ]},
  '숨은 달':       { style: 'introspective', templates: [
    '{keyword}을(를) 숨겨왔어요. 보여주면 약해 보일까 봐.',
    '구름 뒤에 숨어서 {keyword}을(를) 느꼈어요. 혼자서요.',
    '{keyword}이(가) 드러나는 게 두려웠는데, 드러나니까 숨 쉴 수 있었어요.',
  ]},
  '갈라진 거울':   { style: 'analytical', templates: [
    '{keyword}에 대한 내 모습이 깨져 있어요. 조각마다 다른 내가 보여요.',
    '거울이 갈라진 건 {keyword} 때문이에요. 그 전에는 하나인 줄 알았어요.',
    '{keyword}을(를) 통해 나를 다시 맞추고 있어요. 원래 모양은 아니지만.',
  ]},
  '먼 별':         { style: 'poetic', templates: [
    '{keyword}은(는) 별처럼 멀리서 빛나요. 가까이 가면 뜨거운 줄도 모르고.',
    '멀리서 {keyword}을(를) 바라보면 아름다운데, 가까이 가면 복잡해요.',
    '{keyword}을(를) 향해 걸어가고 있어요. 도착할 수 있을지 모르지만.',
  ]},
  '낮은 불꽃':     { style: 'emotional', templates: [
    '{keyword}은(는) 작은 불꽃 같아요. 꺼지지 않게 지키고 싶어요.',
    '거의 꺼질 뻔한 {keyword}을(를) 다시 살렸어요. 이번에는 혼자가 아니에요.',
    '{keyword}의 온기가 필요해요. 차가움에 익숙해지면 안 되니까요.',
  ]},
  '깨진 시계':     { style: 'analytical', templates: [
    '{keyword}에 대한 시간이 멈춰 있어요. 그때의 나에서 움직이지 못하고 있어요.',
    '시계가 깨진 건 {keyword}이(가) 멈춘 그 순간이에요. 다시 가려면 수리가 필요해요.',
    '{keyword}은(는) 시간이 해결해줄 줄 알았는데, 시간이 멈춰 있으면 소용없어요.',
  ]},
};

// 해시 기반 결정론적 난수 (동일 입력 → 동일 출력)
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// DAY 21~100에 대해 알고리즘 기반으로 가상유저 응답 생성
function generateVirtualEntries(dayNumber: number): Omit<VirtualCodetalkEntry, 'is_virtual'>[] {
  const keyword = EXTENDED_KEYWORDS[dayNumber];
  if (!keyword) return [];

  const entries: Omit<VirtualCodetalkEntry, 'is_virtual'>[] = [];
  // 각 DAY에 3~5명의 가상유저 응답 (해시로 결정)
  const participantCount = 3 + Math.floor(seededRandom(dayNumber * 7) * 3); // 3~5명
  const usedAliases = new Set<string>();

  for (let i = 0; i < participantCount; i++) {
    const aliasIndex = Math.floor(seededRandom(dayNumber * 100 + i * 13) * ALIASES.length);
    const alias = ALIASES[aliasIndex];
    if (usedAliases.has(alias)) continue;
    usedAliases.add(alias);

    const tone = CHARACTER_TONES[alias];
    if (!tone) continue;

    const templateIndex = Math.floor(seededRandom(dayNumber * 50 + i * 31) * tone.templates.length);
    const definition = tone.templates[templateIndex].replace(/\{keyword\}/g, keyword);

    const hoursAgo = 3 + Math.floor(seededRandom(dayNumber * 200 + i * 17) * 8); // 3~10시간 전
    entries.push({
      id: `vc-${dayNumber}-${i + 1}`,
      anon_alias: alias,
      keyword,
      day_number: dayNumber,
      definition,
      created_at: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
    });
  }

  return entries;
}

export function getVirtualCodetalkEntries(dayNumber: number): VirtualCodetalkEntry[] {
  // DAY 1~20: 하드코딩 데이터
  const hardcoded = VIRTUAL_RESPONSES[dayNumber];
  if (hardcoded) {
    return hardcoded.map(e => ({ ...e, is_virtual: true as const }));
  }

  // DAY 21~100: 알고리즘 생성
  const generated = generateVirtualEntries(dayNumber);
  return generated.map(e => ({ ...e, is_virtual: true as const }));
}

// 특정 DAY 이전의 모든 가상유저 피드 (spoiler 방지: 현재 DAY 미만만 반환)
export function getVirtualFeedUpToDay(currentDay: number, limit = 20): VirtualCodetalkEntry[] {
  const allEntries: VirtualCodetalkEntry[] = [];

  // 현재 DAY의 이전 DAY만 노출 (spoiler 방지)
  for (let d = Math.max(1, currentDay - 7); d < currentDay; d++) {
    const entries = getVirtualCodetalkEntries(d);
    allEntries.push(...entries);
  }

  // 최신순 정렬 후 limit 적용
  return allEntries
    .sort((a, b) => b.day_number - a.day_number || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

// DAY별 참여자 수 (실제 + 가상)
export function getParticipantCount(dayNumber: number): number {
  return getVirtualCodetalkEntries(dayNumber).length;
}

// 전체 가상유저 수
export const VIRTUAL_USER_COUNT = ALIASES.length;

// DAY 21~100 키워드 참조용 (UI에서 마일스톤 표시에 사용)
export const KEYWORD_MAP: Record<number, string> = {
  1: '사랑', 2: '행복', 3: '자유', 4: '신뢰', 5: '존중',
  6: '안전', 7: '외로움', 8: '연결', 9: '경계', 10: '솔직함',
  11: '배려', 12: '기대', 13: '실망', 14: '용기', 15: '취약함',
  16: '위로', 17: '침묵', 18: '시간', 19: '거리', 20: '변화',
  ...EXTENDED_KEYWORDS,
};
