// 클리어 모드 — Daily Challenge 목록
// 날짜 기반 순환 (day of year % length) → 모든 유저가 같은 날 같은 챌린지
// 완료 저장: localStorage만 사용 (DB 쿼리 없음)

export interface DailyChallenge {
  id: number;
  text: string;
  category: '관계' | '자기이해' | '회복' | '행동';
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  // 관계
  { id: 1,  text: '가까운 사람에게 먼저 연락해보기',            category: '관계' },
  { id: 2,  text: '오늘 나눈 대화에서 좋았던 순간 떠올려보기', category: '관계' },
  { id: 3,  text: '고마운 사람에게 짧은 메시지 보내기',         category: '관계' },
  { id: 4,  text: '오늘 대화할 때 판단 없이 먼저 들어보기',    category: '관계' },
  { id: 5,  text: '오랫동안 연락 못 했던 사람 생각해보기',     category: '관계' },
  { id: 6,  text: '누군가와 밥 한 끼 함께 먹기',               category: '관계' },
  { id: 7,  text: '가까운 사람의 이야기에 10분 집중해서 듣기', category: '관계' },
  { id: 8,  text: '오늘 누군가에게 솔직하게 한 마디 해보기',   category: '관계' },

  // 자기이해
  { id: 9,  text: '오늘 힘들었던 것 한 줄로 써보기',           category: '자기이해' },
  { id: 10, text: '지금 이 감정에 이름 붙여보기',               category: '자기이해' },
  { id: 11, text: '오늘 가장 에너지를 쏟은 것은 무엇인지 생각해보기', category: '자기이해' },
  { id: 12, text: '지난 일주일 중 가장 좋았던 순간 기억해보기', category: '자기이해' },
  { id: 13, text: '지금 나에게 필요한 것 한 가지만 떠올려보기', category: '자기이해' },
  { id: 14, text: '오늘 내가 잘한 것 하나 인정하기',            category: '자기이해' },
  { id: 15, text: '반복되는 감정 패턴 하나 알아채보기',         category: '자기이해' },
  { id: 16, text: '지금 내 몸의 긴장을 느껴보기',               category: '자기이해' },

  // 회복
  { id: 17, text: '10분 산책하고 오기',                         category: '회복' },
  { id: 18, text: '지금 당장 5분 아무것도 안 하기',             category: '회복' },
  { id: 19, text: '충분히 물 마시기',                           category: '회복' },
  { id: 20, text: '오늘 잠들기 전 휴대폰 잠시 내려놓기',       category: '회복' },
  { id: 21, text: '좋아하는 음악 한 곡 처음부터 끝까지 듣기',  category: '회복' },
  { id: 22, text: '창문 열고 바깥 공기 마시기',                 category: '회복' },
  { id: 23, text: '어깨와 목 스트레칭 3분',                     category: '회복' },
  { id: 24, text: '오늘 나에게 칭찬 한 마디 해주기',            category: '회복' },

  // 행동
  { id: 25, text: '오늘 미뤄온 것 하나 5분만 시작해보기',       category: '행동' },
  { id: 26, text: '내일 할 일 딱 3개만 적어두기',               category: '행동' },
  { id: 27, text: '오늘 마음에 걸리는 것 하나 해결하거나 내려놓기', category: '행동' },
  { id: 28, text: '새로운 것 하나 시도해보기 (작아도 OK)',       category: '행동' },
  { id: 29, text: '도움이 필요한 것 솔직하게 말해보기',         category: '행동' },
  { id: 30, text: '오늘 한 가지 결정을 빠르게 내려보기',        category: '행동' },
] as const;

// ── 오늘 챌린지 선택 ────────────────────────────────────────────────────────

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000);
}

export function getTodayChallenge(): DailyChallenge {
  return DAILY_CHALLENGES[getDayOfYear() % DAILY_CHALLENGES.length];
}

// 점수 구간별 챌린지 카테고리 매핑
export function getChallengeByScore(score: number): DailyChallenge {
  const day = getDayOfYear();
  if (score >= 70) {
    // 안정 → 관계/행동 챌린지
    const pool = DAILY_CHALLENGES.filter(c => c.category === '관계' || c.category === '행동');
    return pool[day % pool.length];
  } else if (score >= 40) {
    // 보통 → 기본 순환
    return DAILY_CHALLENGES[day % DAILY_CHALLENGES.length];
  } else {
    // 낮음 → 회복/자기이해 챌린지
    const pool = DAILY_CHALLENGES.filter(c => c.category === '회복' || c.category === '자기이해');
    return pool[day % pool.length];
  }
}

// ── localStorage 완료 관리 ──────────────────────────────────────────────────

const todayDate = () => new Date().toISOString().split('T')[0];

export function isChallengeCompletedToday(): boolean {
  try {
    return localStorage.getItem(`veilor_challenge_${todayDate()}`) === 'done';
  } catch {
    return false;
  }
}

export function markChallengeCompleted(): void {
  try {
    localStorage.setItem(`veilor_challenge_${todayDate()}`, 'done');
  } catch {
    // silent
  }
}
