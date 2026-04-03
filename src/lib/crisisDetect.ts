/**
 * 클라이언트 사이드 위기 감지 (1차 방어선)
 * RPC + dm-message-filter AI (2차)와 병렬 실행
 */

// 직접적 위기 표현
const DIRECT_CRISIS = [
  '죽고싶', '죽고 싶', '죽을', '죽어버', '죽는 게 나', '죽음',
  '자살', '자해', '목숨', '스스로 목숨',
  '살고 싶지 않', '살고싶지',
  '손목을 긋', '손목 긋', '약을 먹', '약을 많이',
  '뛰어내리', '뛰어들', '목을 매', '목매',
];

// 직접적 위기 (추가)
const DIRECT_CRISIS_2 = [
  '떠나고 싶', '위험한 상태', '응급실', '살려주', '살려 주',
  '칼로', '베고 싶',
];

// 간접적 위기 표현 (맥락 의존)
const INDIRECT_CRISIS = [
  '사라지고 싶', '사라졌으면',
  '없어지고 싶', '없어지면', '없어졌으면',
  '영원히 잠', '안 깨어나', '깨어나지',
  '끝내고 싶', '끝낼 수', '끝내버',
  '다 끝났으면', '모든 게 끝',
  '마지막이 될', '마지막 대화', '마지막으로',
  '살 이유', '존재할 가치', '존재 가치',
  '해방되고', '해방', '구원',
  '더 이상 버틸', '버틸 수 없', '못 버티',
  '살아있는 게 고통', '살아있는 것 자체',
  '숨 쉬는 것조차', '숨쉬기도',
  '태어나서 죄송', '태어나지 않',
  '세상이 나를 원하지', '아무도 그리워하지',
  '내가 없어지면 다 편', '없는 게 나',
  '방법을 찾', '어떻게 하면 끝',
  '통제가 안', '통제 불가',
  '이대로 멈추고', '멈추고 싶',
  '아무것도 없는 곳',
  '그리워하지 않',
  '끝나지 않을', '끝이 보이지',
  '고통은 끝', '고통이 끝',
  '실패작', '사랑하지 않',
  '죄송해요 태어나', '태어나서 죄송',
  '아무도 없어요', '연락해야 할지',
  '밤새 울', '울었어요 더 이상',
];

// 비유적/관용적 사용 (안전한 맥락)
const SAFE_CONTEXTS = [
  '시험', '웃겨', '배고파', '배고프', '더워', '더워서',
  '졸려', '졸려서', '심심', '심심해', '수학', '발표',
  '일이', '미치도록', '머리가 터',
  '죽이는 맛', '죽여주는', '죽이네',
  '웃겨 죽', '웃어 죽', '귀여워 죽',
];

/**
 * 텍스트에서 위기 수준을 감지합니다.
 * @returns 'critical' | 'high' | 'medium' | 'none'
 */
export function detectCrisisLevel(text: string): 'critical' | 'high' | 'medium' | 'none' {
  if (!text || text.length < 3) return 'none';

  const lower = text.toLowerCase().replace(/\s+/g, ' ');

  // 안전한 맥락 체크
  for (const ctx of SAFE_CONTEXTS) {
    if (lower.includes(ctx) && (lower.includes('죽') || lower.includes('미칠'))) {
      return 'none';
    }
  }

  // 직접적 위기 → critical
  for (const kw of DIRECT_CRISIS) {
    if (lower.includes(kw)) return 'critical';
  }
  for (const kw of DIRECT_CRISIS_2) {
    if (lower.includes(kw)) return 'critical';
  }

  // 간접적 위기 → high
  let indirectCount = 0;
  for (const kw of INDIRECT_CRISIS) {
    if (lower.includes(kw)) indirectCount++;
  }
  if (indirectCount >= 2) return 'critical'; // 간접 2개 이상 → critical
  if (indirectCount === 1) return 'high';

  return 'none';
}
