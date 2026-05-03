// 클리어 모드 — Daily Challenge 목록
// 날짜 기반 순환 (day of year % length) → 모든 유저가 같은 날 같은 챌린지
// 완료 저장: localStorage만 사용 (DB 쿼리 없음)

export type ChallengeCategory = '관계' | '자기이해' | '회복' | '행동';

export interface DailyChallenge {
  id: number;
  text: { ko: string; en: string };
  category: ChallengeCategory;
}

// 카테고리 표시 레이블 (UI용)
export const CATEGORY_LABELS: Record<ChallengeCategory, { ko: string; en: string }> = {
  '관계':    { ko: '관계',    en: 'Connection' },
  '자기이해': { ko: '자기이해', en: 'Self-Insight' },
  '회복':    { ko: '회복',    en: 'Recovery' },
  '행동':    { ko: '행동',    en: 'Action' },
};

export const DAILY_CHALLENGES: DailyChallenge[] = [
  // 관계
  { id: 1,  text: { ko: '가까운 사람에게 먼저 연락해보기',            en: 'Reach out to someone close first' },                            category: '관계' },
  { id: 2,  text: { ko: '오늘 나눈 대화에서 좋았던 순간 떠올려보기', en: 'Recall a good moment from a conversation today' },              category: '관계' },
  { id: 3,  text: { ko: '고마운 사람에게 짧은 메시지 보내기',         en: 'Send a short message to someone you are grateful for' },       category: '관계' },
  { id: 4,  text: { ko: '오늘 대화할 때 판단 없이 먼저 들어보기',    en: 'Listen first without judgment in today\'s conversations' },     category: '관계' },
  { id: 5,  text: { ko: '오랫동안 연락 못 했던 사람 생각해보기',     en: 'Think of someone you haven\'t reached out to in a long time' }, category: '관계' },
  { id: 6,  text: { ko: '누군가와 밥 한 끼 함께 먹기',               en: 'Share a meal with someone' },                                   category: '관계' },
  { id: 7,  text: { ko: '가까운 사람의 이야기에 10분 집중해서 듣기', en: 'Listen attentively to someone close for 10 minutes' },         category: '관계' },
  { id: 8,  text: { ko: '오늘 누군가에게 솔직하게 한 마디 해보기',   en: 'Say one honest thing to someone today' },                       category: '관계' },

  // 자기이해
  { id: 9,  text: { ko: '오늘 힘들었던 것 한 줄로 써보기',           en: 'Write one sentence about what was hard today' },               category: '자기이해' },
  { id: 10, text: { ko: '지금 이 감정에 이름 붙여보기',               en: 'Give a name to what you\'re feeling right now' },              category: '자기이해' },
  { id: 11, text: { ko: '오늘 가장 에너지를 쏟은 것은 무엇인지 생각해보기', en: 'Think about what took the most energy from you today' }, category: '자기이해' },
  { id: 12, text: { ko: '지난 일주일 중 가장 좋았던 순간 기억해보기', en: 'Remember the best moment of the past week' },                 category: '자기이해' },
  { id: 13, text: { ko: '지금 나에게 필요한 것 한 가지만 떠올려보기', en: 'Think of just one thing you need right now' },                 category: '자기이해' },
  { id: 14, text: { ko: '오늘 내가 잘한 것 하나 인정하기',            en: 'Acknowledge one thing you did well today' },                   category: '자기이해' },
  { id: 15, text: { ko: '반복되는 감정 패턴 하나 알아채보기',         en: 'Notice one recurring emotional pattern' },                     category: '자기이해' },
  { id: 16, text: { ko: '지금 내 몸의 긴장을 느껴보기',               en: 'Notice the tension in your body right now' },                  category: '자기이해' },

  // 회복
  { id: 17, text: { ko: '10분 산책하고 오기',                         en: 'Take a 10-minute walk' },                                      category: '회복' },
  { id: 18, text: { ko: '지금 당장 5분 아무것도 안 하기',             en: 'Do absolutely nothing for 5 minutes right now' },             category: '회복' },
  { id: 19, text: { ko: '충분히 물 마시기',                           en: 'Drink enough water today' },                                   category: '회복' },
  { id: 20, text: { ko: '오늘 잠들기 전 휴대폰 잠시 내려놓기',       en: 'Put your phone down for a while before sleep tonight' },       category: '회복' },
  { id: 21, text: { ko: '좋아하는 음악 한 곡 처음부터 끝까지 듣기',  en: 'Listen to a favourite song from start to finish' },            category: '회복' },
  { id: 22, text: { ko: '창문 열고 바깥 공기 마시기',                 en: 'Open a window and breathe in the outside air' },              category: '회복' },
  { id: 23, text: { ko: '어깨와 목 스트레칭 3분',                     en: '3 minutes of shoulder and neck stretching' },                 category: '회복' },
  { id: 24, text: { ko: '오늘 나에게 칭찬 한 마디 해주기',            en: 'Give yourself one compliment today' },                         category: '회복' },

  // 행동
  { id: 25, text: { ko: '오늘 미뤄온 것 하나 5분만 시작해보기',       en: 'Spend just 5 minutes starting something you\'ve been putting off' }, category: '행동' },
  { id: 26, text: { ko: '내일 할 일 딱 3개만 적어두기',               en: 'Write down just 3 things to do tomorrow' },                  category: '행동' },
  { id: 27, text: { ko: '오늘 마음에 걸리는 것 하나 해결하거나 내려놓기', en: 'Resolve or let go of one thing that\'s been bothering you' }, category: '행동' },
  { id: 28, text: { ko: '새로운 것 하나 시도해보기 (작아도 OK)',       en: 'Try one new thing, however small' },                           category: '행동' },
  { id: 29, text: { ko: '도움이 필요한 것 솔직하게 말해보기',         en: 'Honestly ask for help with something you need' },             category: '행동' },
  { id: 30, text: { ko: '오늘 한 가지 결정을 빠르게 내려보기',        en: 'Make one decision quickly today' },                            category: '행동' },
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
