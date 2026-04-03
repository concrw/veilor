// 가상 유저 20명 — 커뮤니티 활성감 시드 데이터
// auth.users FK 제약으로 DB 직접 삽입 불가 → 프론트 레이어에서 혼합 표시

export interface VirtualPost {
  id: string;
  group_id: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  upvotes: number;
  view_count: number;
  created_at: string;
  mask: string;
  is_virtual: true;
}

// 그룹 ID는 실제 community_groups에서 조회해 매핑
// 여기서는 category 기반으로 연결
export const VIRTUAL_POSTS: Omit<VirtualPost, 'group_id'>[] = [
  {
    id: 'vp-01', title: '왜 나는 항상 먼저 연락을 끊을까요',
    content: '상대가 나를 떠날 것 같은 느낌이 들면 먼저 거리를 둬버려요. 그러고 나서 후회하는 패턴이 반복됩니다.',
    is_anonymous: true, upvotes: 14, view_count: 87, mask: '나비 가면',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(), is_virtual: true,
  },
  {
    id: 'vp-02', title: '감정을 표현했더니 "너무 예민하다"는 말을 들었어요',
    content: '솔직하게 말했더니 오히려 제가 문제인 것처럼 됐어요. 앞으로 말을 안 하는 게 나을 것 같아서 더 무서워요.',
    is_anonymous: true, upvotes: 31, view_count: 156, mask: '유리 가면',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(), is_virtual: true,
  },
  {
    id: 'vp-03', title: '10년 만에 이혼 결정을 앞두고 있어요',
    content: '틀린 선택은 없다고 하지만 이게 맞는 건지 계속 흔들려요. 이미 결정했는데도 자꾸 되돌아봐요.',
    is_anonymous: true, upvotes: 22, view_count: 203, mask: '안개 가면',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(), is_virtual: true,
  },
  {
    id: 'vp-04', title: '파트너가 "너는 항상 분석만 한다"고 해요',
    content: '감정적으로 반응하는 게 어렵고 상황을 파악하려는 게 자연스럽데 상대는 그게 차갑게 느껴진대요.',
    is_anonymous: true, upvotes: 18, view_count: 112, mask: '독수리 가면',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(), is_virtual: true,
  },
  {
    id: 'vp-05', title: '연락이 없으면 불안해서 아무것도 못 해요',
    content: '1시간만 답장 없어도 머릿속으로 최악의 시나리오를 돌려요. 이게 나만 이런 건지 궁금해요.',
    is_anonymous: true, upvotes: 45, view_count: 289, mask: '거미 가면',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(), is_virtual: true,
  },
  {
    id: 'vp-06', title: '내가 잘해야 사랑받는다는 생각이 떠나질 않아요',
    content: '뭔가를 성취하거나 도움이 될 때만 가치 있는 사람인 것 같아요. 그냥 있는 것만으로 충분하다는 게 안 느껴져요.',
    is_anonymous: true, upvotes: 37, view_count: 198, mask: '황금 가면',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(), is_virtual: true,
  },
  {
    id: 'vp-07', title: '상대의 기분이 나쁘면 제 탓인 것 같아요',
    content: '파트너가 조용하면 내가 뭔가 잘못한 건 아닌지 자꾸 확인하게 돼요.',
    is_anonymous: true, upvotes: 29, view_count: 143, mask: '거울 가면',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(), is_virtual: true,
  },
  {
    id: 'vp-08', title: '헤어지고 6개월, 아직도 꿈에 나와요',
    content: '상대가 먼저 떠났는데 왜 나만 이렇게 긴 것 같은지 모르겠어요. 정상인가요?',
    is_anonymous: true, upvotes: 52, view_count: 341, mask: '달 가면',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(), is_virtual: true,
  },
];

// category별 가상 게시글 매핑
export const VIRTUAL_POST_CATEGORY: Record<string, string[]> = {
  crisis:        ['vp-01', 'vp-03', 'vp-05', 'vp-08'],
  communication: ['vp-02', 'vp-04', 'vp-07'],
  identity:      ['vp-06'],
  relationship:  ['vp-01', 'vp-05', 'vp-07', 'vp-08'],
};

export function getVirtualPostsForCategory(category: string): Omit<VirtualPost, 'group_id'>[] {
  const ids = VIRTUAL_POST_CATEGORY[category] ?? [];
  return VIRTUAL_POSTS.filter(p => ids.includes(p.id));
}
