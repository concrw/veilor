export type RelationPattern =
  | 'ANXIOUS_ATTACH'
  | 'AVOIDANT'
  | 'OVERCARE'
  | 'BALANCED';

// 불안 애착 관련 키워드
const ANXIOUS_KEYWORDS = [
  '불안', '걱정', '떠날까봐', '연락', '확인', '집착', '매달', '무서워', '버려질',
  'anxious', 'anxiety', 'clingy', 'worried', 'abandonment',
];

// 회피 관련 키워드
const AVOIDANT_KEYWORDS = [
  '회피', '거리', '혼자', '공간', '차갑게', '연락 안', '멀어', '감정표현', '닫혀',
  'avoidant', 'distant', 'alone', 'cold', 'space', 'detached',
];

// 과도한 배려 관련 키워드
const OVERCARE_KEYWORDS = [
  '배려', '희생', '맞춰', '참아', '나는 괜찮', '상대 우선', '내 감정', '양보', '무시',
  'sacrifice', 'overcare', 'pleasing', 'ignore myself', 'giving in',
];

function countMatches(keywords: string[], wordList: string[]): number {
  return keywords.filter(kw =>
    wordList.some(w => w.toLowerCase().includes(kw.toLowerCase()))
  ).length;
}

export function inferRelationPattern(
  ventKeywords: string[],
  boundaryCount: number,
  communicationDepth: number
): RelationPattern {
  const anxiousScore = countMatches(ANXIOUS_KEYWORDS, ventKeywords);
  const avoidantScore = countMatches(AVOIDANT_KEYWORDS, ventKeywords);
  const overcareScore = countMatches(OVERCARE_KEYWORDS, ventKeywords);

  // 경계 설정이 충분하고 소통 깊이가 높으면 BALANCED
  if (boundaryCount >= 3 && communicationDepth >= 60 && anxiousScore === 0 && avoidantScore === 0 && overcareScore === 0) {
    return 'BALANCED';
  }

  const max = Math.max(anxiousScore, avoidantScore, overcareScore);

  if (max === 0) {
    // 키워드가 없더라도 경계 부족 or 소통 낮으면 패턴 추론
    if (boundaryCount < 2) return 'AVOIDANT';
    if (communicationDepth < 30) return 'ANXIOUS_ATTACH';
    return 'BALANCED';
  }

  if (anxiousScore === max) return 'ANXIOUS_ATTACH';
  if (avoidantScore === max) return 'AVOIDANT';
  if (overcareScore === max) return 'OVERCARE';

  return 'BALANCED';
}
