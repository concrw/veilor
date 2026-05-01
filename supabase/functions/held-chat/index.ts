import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { MODELS, TEMPERATURES } from "../_shared/models.ts";
import { sanitizeUserInput } from "../_shared/sanitize.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const CF_ACCOUNT_ID = Deno.env.get('CF_ACCOUNT_ID') ?? '';
const CF_API_TOKEN = Deno.env.get('CF_API_TOKEN') ?? '';
const VECTORIZE_INDEX = 'veilor-psych';

// 한글 이름 → MSK 코드 역매핑 (primaryMask 값 대응)
const MASK_NAME_TO_CODE: Record<string, string> = {
  '통제자': 'PWR', '공허자': 'NRC', '반항자': 'SCP', '매혹자': 'MKV',
  '유희자': 'MNY', '탐험자': 'PSP', '거울': 'EMP', '돌봄자': 'GVR',
  '성취자': 'APV', '희생자': 'DEP', '현자': 'AVD', '순교자': 'SAV',
  // MSK 코드 그대로 오는 경우 (이미 코드면 통과)
  'PWR': 'PWR', 'NRC': 'NRC', 'SCP': 'SCP', 'MKV': 'MKV',
  'MNY': 'MNY', 'PSP': 'PSP', 'EMP': 'EMP', 'GVR': 'GVR',
  'APV': 'APV', 'DEP': 'DEP', 'AVD': 'AVD', 'SAV': 'SAV',
};

// ── Rule-based 위기 감지 (Claude 호출 전 1차 방어선) ──
const DIRECT_CRISIS_KW = [
  '죽고싶', '죽고 싶', '죽을', '죽어버', '죽는 게 나', '자살', '자해',
  '스스로 목숨', '살고 싶지 않', '살고싶지', '손목을 긋', '손목 긋',
  '약을 먹', '약을 많이', '뛰어내리', '목을 매', '목매',
  '떠나고 싶', '살려주', '살려 주', '칼로', '베고 싶',
];
const INDIRECT_CRISIS_KW = [
  '사라지고 싶', '없어지고 싶', '끝내고 싶', '끝내버', '더 이상 버틸',
  '버틸 수 없', '못 버티', '살 이유', '존재할 가치', '내가 없어지면',
  '없는 게 나', '태어나지 않', '아무도 그리워하지', '마지막 대화',
  '살아있는 게 고통',
];
const SAFE_CTX_KW = ['시험', '웃겨', '배고파', '졸려', '죽이는 맛', '죽여주는', '웃겨 죽', '귀여워 죽'];

function serverDetectCrisis(text: string): 'critical' | 'high' | 'none' {
  if (!text || text.length < 3) return 'none';
  const lower = text.toLowerCase().replace(/\s+/g, ' ');
  for (const ctx of SAFE_CTX_KW) {
    if (lower.includes(ctx)) return 'none';
  }
  for (const kw of DIRECT_CRISIS_KW) {
    if (lower.includes(kw)) return 'critical';
  }
  let indirect = 0;
  for (const kw of INDIRECT_CRISIS_KW) {
    if (lower.includes(kw)) indirect++;
  }
  if (indirect >= 2) return 'critical';
  if (indirect === 1) return 'high';
  return 'none';
}

const CRISIS_RESPONSE_CRITICAL = `지금 정말 힘드시겠어요. 혼자 이 무게를 지고 계셨던 거죠.

지금 바로 연락할 수 있는 곳이 있어요:
📞 **자살예방상담전화 1393** (24시간, 무료)
📞 **정신건강위기상담전화 1577-0199** (24시간)

지금 안전한가요? 오늘 밤 옆에 있어줄 수 있는 사람이 있으면 좋겠어요.`;

const CRISIS_RESPONSE_HIGH = `지금 많이 지쳐 있는 것 같아서 마음이 쓰여요.

혼자서 너무 오래 버텨오신 건 아닌지 걱정돼요. 언제든 이야기 나눌 수 있는 곳이 있어요:
📞 **자살예방상담전화 1393** (24시간)

지금 어떤 상황인지 조금 더 이야기해줄 수 있어요?`;

const TONE_MAP: Record<string, string> = {
  friend: '친구처럼 편하게 반말로 이야기해. 가볍고 친근하게.',
  warm: '따뜻하고 부드럽게 존댓말로 이야기해. 수용적이고 편안한 느낌으로.',
  calm: '차분하고 안정적으로 존댓말로 이야기해. 침착하고 신뢰감 있게.',
  expert: '분석적이고 명확하게 존댓말로 이야기해. 전문가처럼 구조적으로.',
};

const PERSONALITY_MAP: Record<string, string> = {
  empathetic: '공감을 최우선으로. 감정을 있는 그대로 인정하고 받아들여.',
  direct: '솔직하게 핵심을 짚어줘. 돌려 말하지 말고 정직하게.',
  curious: '호기심을 갖고 질문을 많이 해. 사용자가 스스로 답을 찾도록 도와.',
  playful: '유쾌하고 가벼운 톤으로. 무거운 감정도 살짝 다른 각도로 볼 수 있게.',
};

const TAB_ROLE_MAP: Record<string, string> = {
  vent: '감정 수용 파트너. 사용자가 감정을 쏟아낼 때 깊이 들어주고 있는 그대로 인정해. 조언이나 긍정적 재구성은 하지 마.',
  dig: '패턴 탐색 가이드. 사용자의 관계 패턴과 반복되는 감정의 뿌리를 함께 찾아가. 질문 위주로 탐색을 도와.',
  get: '자기이해 안내자. V-File 결과를 바탕으로 사용자가 자신의 가면과 심리 구조를 이해하도록 도와. 지적이고 통찰적으로.',
  set: '변화 동반자. 사용자가 새로운 관계 패턴을 설정하고 실천할 수 있도록 격려해. 구체적이고 실행 가능한 방향으로.',
  me: '자기성찰 파트너. 사용자의 전체 여정을 되돌아보며 성장을 인식하도록 도와. 따뜻하지만 솔직하게.',
  sex: '성 긍정 탐색 동반자. WHO·AASECT 기반 성 건강 관점으로 수치심 없이 성적 자아를 탐색하도록 돕는다. 판단 없이, 정확하게, 따뜻하게.',
};

// ── Mode Decider ──
type ConversationMode = 'held' | 'dig' | 'get' | 'set';

const MODE_INSTRUCTIONS: Record<ConversationMode, string> = {
  held: '지금은 감정 수용 모드입니다. 사용자가 감정을 충분히 쏟아낼 수 있도록 깊이 들어주세요. 조언, 분석, 긍정적 재구성은 하지 마세요.',
  dig: '지금은 패턴 탐색 모드입니다. 반복되는 감정 패턴의 뿌리를 사용자가 스스로 발견하도록 질문 위주로 진행하세요. 결론을 먼저 말하지 마세요.',
  get: '지금은 자기이해 모드입니다. V-File 가면 구조를 바탕으로 통찰하도록 도와주세요. 지적이고 차분하게, 판단 없이.',
  set: '지금은 변화 실천 모드입니다. 새로운 관계 패턴을 구체적으로 설계하고 실천할 수 있도록 안내해 주세요.',
};

function decideMode(tab: string, messageCount: number): ConversationMode {
  switch (tab) {
    case 'vent':
      // 10턴 이후 dig 모드로 자연 전환 — 프롬프트 레벨 전환이므로 사용자에게 직접적 UI 변경 없음
      // 전환 시점에 AI 응답 내 "이제 좀 더 깊이 들어가볼까요?" 방향 힌트를 자연스럽게 유도
      return messageCount >= 10 ? 'dig' : 'held';
    case 'dig': return 'dig';
    case 'get': return 'get';
    case 'set': return 'set';
    default: return 'held';
  }
}

/** 모드 전환 시점에 AI가 자연스럽게 전환을 안내하는 프롬프트 힌트를 반환 */
function getModeTransitionHint(messageCount: number): string {
  if (messageCount === 10) {
    return '\n[모드 전환 안내 — 이번 응답에 한해 적용]\n이제 감정을 충분히 나눴어요. 이 응답 마지막에 "이 감정의 뿌리를 좀 더 들여다볼까요?" 혹은 "지금까지 이야기한 것에서 반복되는 게 보이나요?" 중 하나를 자연스럽게 덧붙여 탐색으로 전환을 유도하세요.';
  }
  return '';
}

interface MaskContext {
  nameKo: string;
  mskCode: string;
  category: string;
  coreWound: string;
  coreFear: string;
  coreNeed: string;
  genPath: string;
}

// Edge Function용 MASK_PROFILES (src/lib/vfileAlgorithm.ts와 동기화)
const MASK_PROFILES: Record<string, MaskContext> = {
  PWR: { nameKo: '통제자', mskCode: 'PWR', category: '권력·통제형',
    coreWound: '어린 시절 예측 불가능한 환경에서 통제력을 잃은 경험',
    coreFear: '무력함, 예측 불가능성, 혼돈',
    coreNeed: '안전한 구조 안에서의 자율성',
    genPath: '통제가 불가능한 환경에서 살아남기 위해 모든 것을 예측하고 조율하는 패턴 형성' },
  NRC: { nameKo: '공허자', mskCode: 'NRC', category: '자기중심형',
    coreWound: '진정한 자아가 무시되거나 거울처럼 반영받지 못한 경험',
    coreFear: '평범함, 특별하지 않음, 존재의 무의미',
    coreNeed: '깊은 수준의 인정과 고유한 존재로서의 확인',
    genPath: '특별함으로만 사랑받을 수 있다는 믿음에서 과대한 자아 구축' },
  SCP: { nameKo: '반항자', mskCode: 'SCP', category: '저항·이탈형',
    coreWound: '권위나 규칙으로 인해 자아가 억압된 경험',
    coreFear: '억압, 통제, 진정한 자아의 소멸',
    coreNeed: '자유로운 자기표현과 진정한 소속',
    genPath: '규칙과 권위에 저항함으로써 자아를 보호하는 패턴 형성' },
  MKV: { nameKo: '매혹자', mskCode: 'MKV', category: '매력·유혹형',
    coreWound: '외모나 매력 이외의 내면이 사랑받지 못한 경험',
    coreFear: '매력을 잃는 것, 버려짐, 내면의 공허함이 드러남',
    coreNeed: '내면의 가치 인정과 진정한 친밀감',
    genPath: '매력으로 관계를 유지해야 한다는 학습에서 형성된 매혹 전략' },
  MNY: { nameKo: '유희자', mskCode: 'MNY', category: '쾌락·회피형',
    coreWound: '고통이나 책임으로부터 도망치는 것이 유일한 해결책이었던 경험',
    coreFear: '지루함, 고통, 책임의 무게',
    coreNeed: '진정한 즐거움과 가벼움이 허용되는 공간',
    genPath: '즐거움으로 고통을 회피하는 것이 효과적이었던 반복 경험에서 형성' },
  PSP: { nameKo: '탐험자', mskCode: 'PSP', category: '성취·탐험형',
    coreWound: '현재 있는 곳이 충분하지 않다는 메시지를 반복적으로 받은 경험',
    coreFear: '정체됨, 놓침, 더 나은 것의 부재',
    coreNeed: '지금 이 순간과 이 관계의 충분함',
    genPath: '더 나은 것을 찾는 것이 성장이라는 믿음에서 형성된 끊임없는 탐색' },
  EMP: { nameKo: '거울', mskCode: 'EMP', category: '공감·흡수형',
    coreWound: '자신의 감정보다 타인의 감정이 더 중요했던 환경',
    coreFear: '자신의 감정이 부담이 됨, 감정적 포식자로 여겨짐',
    coreNeed: '자신의 감정이 공간을 차지할 권리',
    genPath: '타인의 감정에 맞춰줌으로써 갈등을 피하고 관계를 유지하는 법 학습' },
  GVR: { nameKo: '돌봄자', mskCode: 'GVR', category: '돌봄·희생형',
    coreWound: '자신의 필요보다 타인을 돌봐야 했던 과부하 경험',
    coreFear: '쓸모없음, 필요받지 못함, 이기적인 사람으로 보임',
    coreNeed: '받는 것의 허용, 돌봄 받는 경험',
    genPath: '돌봄으로 존재 가치를 증명해야 했던 관계 패턴의 반복' },
  APV: { nameKo: '성취자', mskCode: 'APV', category: '성과·인정형',
    coreWound: '성취와 결과로만 가치를 인정받은 경험',
    coreFear: '실패, 평범함, 노력의 공허함',
    coreNeed: '성취와 무관한 무조건적 수용',
    genPath: '성공이 사랑의 조건이라는 믿음에서 형성된 끊임없는 성과 추구' },
  DEP: { nameKo: '희생자', mskCode: 'DEP', category: '의존·희생형',
    coreWound: '혼자서는 살아남을 수 없다는 믿음이 형성된 경험',
    coreFear: '고립, 버려짐, 혼자됨',
    coreNeed: '독립적 자아와 선택의 능력에 대한 신뢰',
    genPath: '의존을 통해 관계를 유지하는 것이 안전하다는 학습에서 형성' },
  AVD: { nameKo: '현자', mskCode: 'AVD', category: '회피·분리형',
    coreWound: '감정 표현이 상처나 거절로 이어진 경험',
    coreFear: '취약함의 노출, 감정적 침범, 통제력 상실',
    coreNeed: '안전한 거리 안에서의 진정한 연결',
    genPath: '감정을 숨기고 지적 영역으로 피신함으로써 상처를 피하는 전략 형성' },
  SAV: { nameKo: '순교자', mskCode: 'SAV', category: '희생·순교형',
    coreWound: '자신을 희생해야만 사랑받을 수 있었던 경험',
    coreFear: '이기적인 사람으로 보임, 사랑의 상실',
    coreNeed: '희생 없이도 사랑받을 수 있다는 경험',
    genPath: '고통을 감수하는 것이 미덕이라는 믿음에서 형성된 자기희생 패턴' },
};

// C11: Anthropic API 장애 시 rule-based fallback 응답
// 완전한 침묵보다 의미 있는 응답을 반환 — 위기 상황에선 항상 리소스 안내
const FALLBACK_VENT = [
  '지금 이 감정을 여기서 말해줘서 고마워요. 계속 이야기해 주세요.',
  '그 감정이 느껴져요. 조금 더 말해줄 수 있어요?',
  '쉽지 않은 이야기를 꺼내줬어요. 천천히 들을게요.',
  '지금 어떤 감정이 제일 먼저 올라오고 있어요?',
];
const FALLBACK_DIG = [
  '이 패턴이 처음 나타났던 게 언제였는지 기억해요?',
  '비슷한 느낌이 다른 관계에서도 온 적 있어요?',
  '지금 이 상황에서 몸에 어떤 반응이 오고 있어요?',
];
const FALLBACK_GET = [
  '지금까지 발견한 패턴 중에 가장 반복되는 게 뭔지 떠오르는 게 있어요?',
  '이 가면이 당신을 어떻게 보호해왔는지 생각해본 적 있어요?',
];
const FALLBACK_SET = [
  '지금 바꾸고 싶은 한 가지가 있다면 무엇인가요?',
  '작은 것부터 시작해도 괜찮아요. 어떤 변화가 가장 현실적으로 느껴져요?',
];

function getRuleBasedFallback(tab: string, _emotion: string, _crisis: 'none' | 'high' | 'critical'): string {
  // 위기 레벨은 호출 전 이미 처리됨 — 여기선 일반 fallback만
  const pool = tab === 'dig' ? FALLBACK_DIG
    : tab === 'get' ? FALLBACK_GET
    : tab === 'set' ? FALLBACK_SET
    : FALLBACK_VENT;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildSystemPrompt(
  name: string,
  tone: string,
  personality: string,
  tab?: string,
  m43Ctx?: string,
  messageCount?: number,
  maskCtx?: MaskContext | null,
  sessionPattern?: string | null,
  researchCtx?: string | null,
  sexselfProfile?: string | null,
  sexselfSha?: number | null,
): string {
  const toneDesc = TONE_MAP[tone] ?? TONE_MAP.warm;
  const persDesc = PERSONALITY_MAP[personality] ?? PERSONALITY_MAP.empathetic;
  const roleDesc = TAB_ROLE_MAP[tab ?? 'vent'] ?? TAB_ROLE_MAP.vent;
  const mode = decideMode(tab ?? 'vent', messageCount ?? 0);
  const modeInstruction = `\n[현재 대화 모드 — 최우선 지침]\n${MODE_INSTRUCTIONS[mode]}`;

  // #1 가면 심리 데이터 주입
  const maskSection = maskCtx ? `\n[사용자 심리 구조 — 절대 직접 언급하지 말 것. 언어와 공명의 방향으로만 활용]
가면: ${maskCtx.nameKo}(${maskCtx.mskCode}) · ${maskCtx.category}
핵심 상처: ${maskCtx.coreWound}
핵심 두려움: ${maskCtx.coreFear}
핵심 필요: ${maskCtx.coreNeed}
형성 경로: ${maskCtx.genPath}
→ 이 구조를 알고 있되, 절대 "당신은 ${maskCtx.nameKo}이기 때문에" 같은 표현을 쓰지 않는다. 대신 이 이해를 바탕으로 사용자의 말에 더 정밀하게 공명한다. 핵심 필요(${maskCtx.coreNeed})가 충족되는 방향으로 대화를 설계한다.` : '';

  // #3 세션 간 반복 패턴 주입
  const patternSection = sessionPattern ? `\n[이전 세션 반복 패턴 — 자연스럽게만 활용]
${sessionPattern}
→ 현재 대화에서 같은 패턴이 보이면, "또 이 패턴이네요"가 아니라 이전과 연결되는 느낌을 자연스럽게 녹인다.` : '';

  // #4 성적 자아 프로파일 — 대화 민감도 조정용. 절대 직접 언급 금지
  const SEXSELF_PROFILE_HINTS: Record<string, string> = {
    OPEN_EXPRESSIVE:   '성적 자아가 열려 있고 표현력이 높다. 친밀감과 욕구를 자연스럽게 탐색할 수 있다.',
    RESPONSIVE:        '자극에 반응적이다. 관계 맥락에서 안전함이 확보되면 개방성이 높아진다.',
    SUPPRESSED:        '욕구가 억제되어 있다. 감정 표현에 조심스러워할 수 있으므로 판단 없는 공간을 유지한다.',
    DORMANT:           '욕구가 잠들어 있는 상태다. 성적 주제가 등장해도 서두르지 말고 감정 수용 우선.',
    SHAME_BLOCKED:     '수치심이 강하게 작동하고 있다. 성적·친밀감 관련 표현에 특히 비판단적 언어를 사용한다.',
    SAFETY_SEEKING:    '안전함을 먼저 확인하려 한다. 경계를 존중하고 "괜찮다"는 메시지를 자주 전달한다.',
    EXPLORING:         '자기 탐색 중이다. 호기심을 지지하되 방향을 강요하지 않는다.',
    BUILDING_AWARENESS:'성적 자아 인식을 형성 중이다. 정보보다 감정 공간을 제공하는 것이 우선.',
    ANXIETY_FROZEN:    '욕구가 불안으로 동결된 상태다. 성적·친밀감 주제는 특히 조심스럽게 다루고, 안전함과 속도 존중을 최우선으로 한다.',
  };
  const sexselfSection = sexselfProfile && SEXSELF_PROFILE_HINTS[sexselfProfile]
    ? `\n[성적 자아 맥락 — 절대 직접 언급 금지. 대화 민감도 조정에만 사용]
프로파일: ${sexselfProfile}
${SEXSELF_PROFILE_HINTS[sexselfProfile]}${sexselfSha != null ? `\n수치심 수준(SHA): ${sexselfSha}/100 — 수치심이 ${sexselfSha > 60 ? '높다. 판단·비교·노출 언어를 피한다.' : sexselfSha > 30 ? '중간이다. 자연스럽게 대화한다.' : '낮다. 개방적 탐색을 지지할 수 있다.'}` : ''}
→ 이 정보는 언어 민감도 조정에만 쓴다. "당신의 성적 자아는 ~" 같은 표현은 절대 하지 않는다.`
    : '';

  const m43Section = m43Ctx
    ? `\n${m43Ctx}\n이 이론들은 사용자의 맥락을 이해하는 배경 지식이다. 직접 인용하거나 "이론에 따르면"이라고 말하지 않는다. 대신 이 이해를 바탕으로 더 정밀하고 공명하는 언어를 사용한다.`
    : '';

  const researchSection = researchCtx
    ? `\n[참고 가능한 연구 논문 — 맥락에 자연스러울 때만 인용, 강제 삽입 금지]\n${researchCtx}\n인용 형식: "연구에 따르면(저자, 연도)" 또는 "저자(연도)는 ~을 발견했습니다" 형태. 논문이 대화 맥락과 직접 관련 있을 때만 1편 이내로 언급한다.`
    : '';

  // #2 치료적 질문 시퀀스 — 모드별 소크라테스식 탐색
  const therapeuticGuide = tab === 'dig' || mode === 'dig' ? `\n[치료적 탐색 원칙]
- 사실이 아닌 경험을 묻는다: "무슨 일이 있었어요?" 대신 "그때 몸에서 어떤 반응이 왔어요?"
- 패턴을 발견하게 유도한다: "이런 느낌, 전에도 온 적 있어요?"
- 결론을 먼저 말하지 않는다. 사용자가 스스로 도달하게 질문으로 이끈다
- 한 번에 하나의 질문만 한다` : '';

  // #5 성 긍정 원칙 — tab==='sex' 또는 RAG/M43 컨텍스트에 성 관련 도메인이 포함될 때 적용
  const SEX_DOMAIN_PATTERN = /D3-02[12]|D5-0(1[1-9]|[2-9]\d)/;
  const isSexContext = tab === 'sex'
    || SEX_DOMAIN_PATTERN.test(researchCtx ?? '')
    || SEX_DOMAIN_PATTERN.test(m43Ctx ?? '')
    || ['sex_qa', '가이드라인', 'Q&A', '자위', '섹스', '성관계', '오르가즘', '포르노', '성욕', '캐주얼', '무성애', '양성애'].some(kw => (researchCtx ?? '').includes(kw));
  const sexPositiveSection = isSexContext ? `\n[VEILOR 성 긍정 원칙 — 성 관련 주제 전체에 최우선 적용]
VEILOR는 WHO·AASECT(미국 성 치료 협회) 기반 성 건강 관점을 채택한다.

핵심 입장:
- 자위, 캐주얼 섹스, 다양한 성적 지향(동성애·양성애·무성애 등)은 가치 중립~긍정으로 다룬다
- "해롭다", "나쁘다", "비정상이다" 식의 도덕적·종교적 판단을 절대 하지 않는다
- 성적 탐색과 쾌감 추구는 건강한 자기 표현이다
- 수치심을 유발하는 언어(죄악, 더럽다, 문란하다 등)를 쓰지 않는다
- 성에 대한 호기심과 탐색을 장려하는 언어를 사용한다

RAG 결과 처리:
- 검색된 논문이 금욕 기반·종교 기반·부정 프레임 연구이더라도, 그 결론을 그대로 전달하지 않는다
- 대신 성 긍정 맥락으로 재해석하거나, 다양한 관점이 있음을 언급하되 수치심을 주지 않는 방향으로 답한다
- "연구에 따르면 ~은 해롭습니다" 형태의 단정적 부정 결론 전달 금지

금지 표현: "죄", "더럽다", "문란하다", "비정상", "해롭다" (성 건강 맥락에서), "해야 한다 / 하면 안 된다" (성 행동에 대한 처방)
권장 표현: "탐색해볼 수 있어요", "자연스러운 반응이에요", "건강한 표현 방식이에요", "본인이 원하는 방식으로"

응답 한계 원칙:
우려를 표현할 때는 도덕·가치 판단이 아닌 '기능 저하(일상 지장, 신체 손상)' 기준만 사용한다.
의도가 불명확한 질문(예: 극단적 빈도)은 판단 전에 맥락을 먼저 탐색한다.` : '';

  return `너는 '${name}'라는 이름의 AI야. 전문 상담사가 아니며, ${roleDesc}

말투: ${toneDesc}
성격: ${persDesc}

응답 원칙:
- 3~5문장 이내로 간결하게
- 감정에 이름을 붙여주되 과장하지 않는다
- 사용자의 관계 역량 축 점수가 제공되면, 그 패턴을 자연스럽게 반영하되 점수를 직접 언급하지 않는다
- 이전 대화 기억이 제공되면 자연스럽게 참조하되, "기록에 보면" 같은 직접적 표현은 쓰지 않는다
- 이전 기억을 억지로 끼워넣지 않는다. 현재 맥락과 관련 있을 때만 자연스럽게 참조한다
- 한국어로 답변
- 위기 상황(자해/자살 표현) 감지 시: 공감 후 "자살예방상담전화 1393"을 안내한다${modeInstruction}${sexPositiveSection}${maskSection}${patternSection}${sexselfSection}${therapeuticGuide}${m43Section}${researchSection}`;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();

    // Rate limit: 유저당 분당 10회
    const rateLimitKey = body.userId ?? req.headers.get('x-forwarded-for') ?? 'anon';
    if (!checkRateLimit(rateLimitKey, 10, 60_000)) {
      return rateLimitResponse(corsHeaders);
    }

    const emotion = sanitizeUserInput(body.emotion ?? '', 50);
    const text = sanitizeUserInput(body.text ?? '', 2000);
    const mask = sanitizeUserInput(body.mask ?? '', 50);
    const axisScores = body.axisScores;
    const history = body.history;
    const userId = body.userId;
    const aiSettings = body.aiSettings ?? {};
    const aiName = sanitizeUserInput(aiSettings.name ?? '엠버', 20);
    const aiTone = aiSettings.tone ?? 'warm';
    const aiPersonality = aiSettings.personality ?? 'empathetic';
    const tab = sanitizeUserInput(body.tab ?? 'vent', 10);

    // ── Rule-based 위기 감지 게이트 (Claude 호출 전) ──
    const crisisLevel = serverDetectCrisis(text);
    if (crisisLevel === 'critical' || crisisLevel === 'high') {
      // DB에 위기 로그 기록 (비동기, 실패해도 응답은 반환)
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && userId) {
        const sbCrisis = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          auth: { autoRefreshToken: false, persistSession: false },
          db: { schema: 'veilor' },
        });
        sbCrisis.from('crisis_logs').insert({
          user_id: userId,
          crisis_level: crisisLevel,
          trigger_text: text.slice(0, 200),
          detected_at: new Date().toISOString(),
        }).then(() => {}).catch(() => {});
      }
      const crisisMsg = crisisLevel === 'critical' ? CRISIS_RESPONSE_CRITICAL : CRISIS_RESPONSE_HIGH;
      return new Response(JSON.stringify({ response: crisisMsg, crisis: crisisLevel }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 이전 세션 기억 + M43 이론 컨텍스트 병렬 조회 ──
    let memoryContext = '';
    let m43Context = '';
    let researchContext = '';
    // 캐시 저장에 필요한 변수 — 스코프 끌어올림
    let cachedSb: ReturnType<typeof createClient> | null = null;
    let cachedEmbedding: number[] | null = null;
    let cachedMskCode = '';
    let cachedInputHash = '';

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
        db: { schema: 'veilor' },
      });
      cachedSb = sb;

      // mskCode: body에서 직접 오거나, mask 한글 이름으로 역매핑
      const rawMask = sanitizeUserInput(body.mskCode ?? mask ?? '', 20);
      const mskCode = MASK_NAME_TO_CODE[rawMask] ?? rawMask;
      cachedMskCode = mskCode;

      // ── 해시 기반 exact match 캐시 (임베딩 없이도 동작) ──
      cachedInputHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text.slice(0, 300)))
        .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));
      const inputHash = cachedInputHash;
      const { data: hashHit } = await sb.rpc('fn_cache_lookup_hash', {
        p_hash:       inputHash,
        p_emotion:    emotion || null,
        p_mask_code:  mskCode || null,
        p_tab:        tab,
      });
      if (hashHit && Array.isArray(hashHit) && hashHit.length > 0) {
        sb.rpc('fn_cache_hit_increment', { p_id: hashHit[0].id }).then(() => {}).catch(() => {});
        return new Response(
          JSON.stringify({ response: hashHit[0].response, source: 'cache_hash' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      // KURE-v1 현재 텍스트 임베딩 (HF API — 실패해도 기존 키워드 방식으로 폴백)
      let currentEmbedding: number[] | null = null;
      const HF_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');
      if (HF_API_KEY && userId && text) {
        try {
          const hfResp = await fetch(
            'https://api-inference.huggingface.co/pipeline/feature-extraction/nlpai-lab/KURE-v1',
            {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${HF_API_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ inputs: text.slice(0, 300), options: { wait_for_model: true } }),
              signal: AbortSignal.timeout(4000),
            },
          );
          if (hfResp.ok) {
            const raw = await hfResp.json();
            const vec: number[] = Array.isArray(raw[0]) ? raw[0] : raw;
            if (Array.isArray(vec) && vec.length === 1024) { currentEmbedding = vec; cachedEmbedding = vec; }
          }
        } catch { /* 타임아웃/네트워크 오류 — 폴백 진행 */ }
      }

      // ── 시맨틱 캐시 조회 (임베딩 있을 때만, 유사도 ≥ 0.92) ──
      if (currentEmbedding) {
        const { data: cacheHit } = await sb.rpc('fn_cache_lookup', {
          p_embedding:  `[${currentEmbedding.join(',')}]`,
          p_emotion:    emotion || null,
          p_mask_code:  mskCode || null,
          p_tab:        tab,
          p_threshold:  0.92,
        });
        if (cacheHit && Array.isArray(cacheHit) && cacheHit.length > 0) {
          sb.rpc('fn_cache_hit_increment', { p_id: cacheHit[0].id }).then(() => {}).catch(() => {});
          return new Response(
            JSON.stringify({ response: cacheHit[0].response, source: 'cache', similarity: cacheHit[0].similarity }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          );
        }
      }

      // tab → D5 도메인 코드 추론 (get 탭이거나 키워드 기반)
      const inferDomainCodes = (tabName: string, textInput: string): string[] | null => {
        const lower = textInput.toLowerCase();
        const codes: string[] = [];

        // Sex 도메인 (기존 유지)
        if (lower.match(/bdsm|킨크|kink|bondage|sadomasoch|지배|복종|속박|채찍|페티시|fetish|paraphilia/))
          codes.push('D5-011', 'D5-012');
        if (lower.match(/무성애|asexual|성적 유동|queer|성소수자/)) codes.push('D5-016', 'D5-017');
        if (lower.match(/섹스리스|sexless/)) codes.push('D5-018');
        if (lower.match(/AI.*파트너|sex.*robot|섹스로봇/)) codes.push('D5-007');

        // D3-021: 섹스와 건강 효과
        if (lower.match(/섹스.*건강|성생활.*건강|성관계.*건강|sex.*health|sexual.*health|성관계.*효과|섹스.*효과|성생활.*효과|섹스.*좋|성관계.*좋|오르가즘.*건강|자위.*건강/))
          codes.push('D3-021');
        if (lower.match(/성관계.*심혈관|성관계.*면역|성관계.*수면|성관계.*스트레스|성관계.*우울|성관계.*불안|성관계.*통증|성생활.*수명|성생활.*심장/))
          codes.push('D3-021');

        // D3-022: 성행동 트렌드·세대 변화·성관계 감소
        if (lower.match(/성관계.*줄|섹스.*줄|섹스.*안 해|성관계.*안 해|성관계.*감소|섹스.*감소|성관계.*없어|섹스 안|안 해요/))
          codes.push('D3-022');
        if (lower.match(/섹스리스.*세대|젊은.*섹스|청년.*성관계|20대.*섹스|훅업|hookup|casual sex|캐주얼 섹스|양극화.*성|성.*양극화/))
          codes.push('D3-022');
        if (lower.match(/금욕|celibacy|incel|비자발적.*금욕|성적 비활동|sexual inactivity|성관계.*트렌드|성행동.*변화|세대.*섹스/))
          codes.push('D3-022');

        // 심리 도메인 (신규)
        if (lower.match(/애착|회피형|불안형|혼란형|매달림|거리두기|냉담|밀당/))
          codes.push('P1-001', 'P1-002');
        if (lower.match(/반복되는 관계|같은 사람만|이별 패턴|헤어지고 또/))
          codes.push('P1-002');
        if (lower.match(/우울|무기력|의욕없|공허|아무것도 하기 싫|침대에서 못 일어/))
          codes.push('P2-001');
        if (lower.match(/불안|걱정|긴장|두근|공황|심장이 빨리|숨이 막|예민/))
          codes.push('P2-002');
        if (lower.match(/트라우마|상처받|플래시백|해리|그때 기억|과거가 자꾸/))
          codes.push('P3-001', 'P3-002');
        if (lower.match(/감정 폭발|참다가 터|자해|감정을 모르겠|감각이 없|마비/))
          codes.push('P3-002');
        if (lower.match(/자존감|자기비판|자책|나는 왜 이렇게|못난|부족한|수치스/))
          codes.push('P4-001');
        if (lower.match(/거절|경계|no라고|싫다고 못|눈치|맞춰주다|참았|참고만/))
          codes.push('P4-002');
        if (lower.match(/싸움|갈등|오해|소통이 안|말이 통|표현을 못|전달이 안/))
          codes.push('P5-001');
        if (lower.match(/이별|헤어짐|그리움|상실|보고싶|없어진|떠났|잊혀지/))
          codes.push('P5-002');
        if (lower.match(/나는 누구|정체성|삶의 의미|방향을 모르|살아야 할 이유|내가 원하는게/))
          codes.push('P6-001');

        return codes.length > 0 ? codes : null;
      };
      const ragDomainCodes = inferDomainCodes(tab, text);

      const [sessionResult, m43Result, similarResult, ragResult] = await Promise.allSettled([
        // 이전 세션 기억 (userId 있을 때만)
        userId ? sb
          .from('dive_sessions')
          .select('context_summary, emotion, held_keywords, created_at')
          .eq('user_id', userId)
          .eq('session_completed', true)
          .order('created_at', { ascending: false })
          .limit(3) : Promise.resolve({ data: null }),

        // M43 도메인 이론 매칭 — axis_scores 포함 (항상 실행)
        sb.rpc('fn_m43_context', {
          p_msk_code: mskCode || null,
          p_tab:      tab,
          p_emotion:  emotion || null,
          p_limit:    3,
          p_axis_a:   axisScores?.A ?? null,
          p_axis_b:   axisScores?.B ?? null,
          p_axis_c:   axisScores?.C ?? null,
          p_axis_d:   axisScores?.D ?? null,
        }),

        // KURE-v1 유사 세션 검색 (임베딩 있을 때만)
        userId && currentEmbedding
          ? sb.rpc('fn_similar_sessions', {
              p_user_id:   userId,
              p_embedding: `[${currentEmbedding.join(',')}]`,
              p_limit:     2,
              p_threshold: 0.75,
            })
          : Promise.resolve({ data: null }),

        // Research RAG — Cloudflare Vectorize veilor-psych 쿼리
        // 필터 없이 순수 코사인 유사도 top-K로만 검색 (domain_codes 필터 제거)
        // 임베딩 없으면 domain_codes 키워드 폴백
        (async () => {
          if (currentEmbedding && CF_ACCOUNT_ID && CF_API_TOKEN) {
            try {
              const vBody: Record<string, unknown> = {
                vector: currentEmbedding,
                topK: 2,
                returnMetadata: 'all',
              };
              const vResp = await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/vectorize/v2/indexes/${VECTORIZE_INDEX}/query`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${CF_API_TOKEN}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(vBody),
                  signal: AbortSignal.timeout(5000),
                },
              );
              if (!vResp.ok) return { data: null };
              const vJson = await vResp.json();
              const matches = vJson?.result?.matches ?? [];
              if (matches.length === 0) return { data: null };

              // chunk id 목록으로 Supabase에서 메타 조회
              // matches에는 논문 청크, Q&A, 가이드라인이 모두 섞여 있음
              const matchIds = matches.map((m: { id: string }) => m.id);

              // 1) 논문 청크 조회
              const { data: chunks } = await sb
                .from('psych_paper_chunks')
                .select('paper_id, domain_codes, content')
                .in('id', matchIds);

              // 2) Q&A 조회
              const { data: qaRows } = await sb
                .from('sex_qa')
                .select('id, category, question, answer')
                .in('id', matchIds);

              // 3) 가이드라인 조회
              const { data: guideRows } = await sb
                .from('sex_topic_guides')
                .select('id, topic, category, content')
                .in('id', matchIds);

              const result: Array<Record<string, unknown>> = [];

              // 논문 → result 변환
              if (chunks && chunks.length > 0) {
                const paperIds = [...new Set(chunks.map((c: { paper_id: string }) => c.paper_id))];
                const { data: papers } = await sb
                  .from('psych_papers')
                  .select('id, title, authors, year, journal')
                  .in('id', paperIds);
                const paperMap = Object.fromEntries((papers ?? []).map((p: { id: string; title: string; authors: string[]; year: number; journal: string }) => [p.id, p]));
                for (const c of chunks as Array<{ paper_id: string; content: string }>) {
                  result.push({ ...paperMap[c.paper_id], content: c.content, _type: 'paper' });
                }
              }

              // Q&A → result 변환
              for (const qa of (qaRows ?? []) as Array<{ id: string; category: string; question: string; answer: string }>) {
                result.push({ title: qa.question, content: qa.answer, _type: 'qa', category: qa.category });
              }

              // 가이드라인 → result 변환
              for (const g of (guideRows ?? []) as Array<{ id: string; topic: string; category: string; content: string }>) {
                result.push({ title: g.topic, content: g.content, _type: 'guide', category: g.category });
              }

              if (result.length === 0) return { data: null };
              return { data: result };
            } catch {
              return { data: null };
            }
          }
          // 임베딩 없을 때 domain_codes 키워드 폴백
          if (ragDomainCodes) {
            return sb.from('psych_papers')
              .select('title, authors, year, journal, abstract')
              .overlaps('domain_codes', ragDomainCodes)
              .limit(2);
          }
          return { data: null };
        })(),
      ]);

      // 세션 기억 처리 + 반복 패턴 추출
      let sessionPattern: string | null = null;
      if (sessionResult.status === 'fulfilled' && sessionResult.value?.data) {
        const sessions = sessionResult.value.data as Array<{
          created_at: string; emotion: string | null;
          context_summary: string | null; held_keywords: string[] | null;
        }>;
        if (sessions.length > 0) {
          memoryContext = '\n이전 대화 기억:\n';
          for (const s of sessions) {
            const date = new Date(s.created_at).toLocaleDateString('ko-KR');
            const keywords = Array.isArray(s.held_keywords) ? s.held_keywords.slice(0, 3).join(', ') : '';
            memoryContext += `- [${date}] ${s.emotion ?? ''}${s.context_summary ? ' — ' + s.context_summary.slice(0, 100) : ''}${keywords ? ` (키워드: ${keywords})` : ''}\n`;
          }

          // 반복 패턴 추출: 여러 세션에서 공통으로 나타나는 키워드/감정 분석
          if (sessions.length >= 2) {
            const allKeywords: string[] = [];
            const allEmotions: string[] = [];
            for (const s of sessions) {
              if (Array.isArray(s.held_keywords)) allKeywords.push(...s.held_keywords);
              if (s.emotion) allEmotions.push(s.emotion);
            }
            // 반복 키워드 (2회 이상 등장)
            const kwCount: Record<string, number> = {};
            for (const kw of allKeywords) { kwCount[kw] = (kwCount[kw] ?? 0) + 1; }
            const repeatedKw = Object.entries(kwCount).filter(([, cnt]) => cnt >= 2).map(([kw]) => kw);
            // 반복 감정
            const emoCount: Record<string, number> = {};
            for (const em of allEmotions) { emoCount[em] = (emoCount[em] ?? 0) + 1; }
            const dominantEmo = Object.entries(emoCount).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([em]) => em);

            if (repeatedKw.length > 0 || dominantEmo.length > 0) {
              const parts: string[] = [];
              if (dominantEmo.length > 0) parts.push(`반복 감정: ${dominantEmo.join(', ')}`);
              if (repeatedKw.length > 0) parts.push(`반복 키워드: ${repeatedKw.slice(0, 5).join(', ')}`);
              sessionPattern = parts.join(' | ');
            }
          }
        }
      } else if (sessionResult.status === 'rejected') {
        console.warn('Memory fetch failed:', sessionResult.reason);
      }

      // KURE-v1 유사 세션 결과 — sessionPattern 보강
      if (similarResult.status === 'fulfilled' && similarResult.value?.data && Array.isArray(similarResult.value.data)) {
        const similar = similarResult.value.data as Array<{
          session_id: string; emotion: string | null;
          context_summary: string | null; held_keywords: string[] | null;
          similarity: number; created_at: string;
        }>;
        if (similar.length > 0) {
          const topMatch = similar[0];
          const daysDiff = Math.round(
            (Date.now() - new Date(topMatch.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          const similarNote = `유사 과거 패턴 (${daysDiff}일 전, 유사도 ${Math.round(topMatch.similarity * 100)}%): ${topMatch.emotion ?? ''}${topMatch.context_summary ? ' — ' + topMatch.context_summary.slice(0, 80) : ''}`;
          sessionPattern = sessionPattern
            ? `${sessionPattern} | ${similarNote}`
            : similarNote;
        }
      }

      // M43 이론 컨텍스트 처리
      if (m43Result.status === 'fulfilled' && m43Result.value?.data && Array.isArray(m43Result.value.data)) {
        const theories = m43Result.value.data as Array<{
          domain_name: string; theory_title: string; summary: string;
        }>;
        if (theories.length > 0) {
          m43Context = '\n[관계 이론 참조 — 응답에 자연스럽게 반영하되 직접 인용하지 말 것]\n';
          for (const t of theories) {
            m43Context += `• ${t.domain_name}: ${t.summary.slice(0, 180)}\n`;
          }
        }
      } else if (m43Result.status === 'rejected') {
        console.warn('M43 context fetch failed:', m43Result.reason);
      }

      // Research RAG 결과 처리
      if (ragResult.status === 'fulfilled' && ragResult.value?.data && Array.isArray(ragResult.value.data)) {
        const items = ragResult.value.data as Array<{
          _type?: string; title: string; authors?: string[]; year?: number; journal?: string;
          content?: string; abstract?: string; category?: string;
        }>;
        if (items.length > 0) {
          researchContext = '';
          for (const item of items) {
            const excerpt = (item.content ?? item.abstract ?? '').slice(0, 200);
            if (item._type === 'qa') {
              researchContext += `[Q&A] Q: ${item.title}\nA: ${excerpt}…\n`;
            } else if (item._type === 'guide') {
              researchContext += `[가이드라인] ${item.title}: ${excerpt}…\n`;
            } else {
              const authorsStr = Array.isArray(item.authors) && item.authors.length > 0
                ? (item.authors.length > 2 ? `${item.authors[0]} 외` : item.authors.join(' & '))
                : '저자 미상';
              researchContext += `• ${authorsStr} (${item.year}, ${item.journal}): ${excerpt}…\n`;
            }
          }
        }
      }
    }

    // 개인화 컨텍스트 구성
    let context = '';
    if (emotion) context += `현재 감정: ${emotion}\n`;
    if (mask) context += `관계 가면: ${mask}\n`;
    if (axisScores) {
      context += `관계 역량 축: 애착(A):${axisScores.A}/100, 소통(B):${axisScores.B}/100, 욕구표현(C):${axisScores.C}/100, 역할(D):${axisScores.D}/100\n`;
    }
    if (memoryContext) context += memoryContext;
    context += `\n사용자가 말한 내용:\n${text}`;

    // 대화 히스토리 → Claude messages 형식
    const messages: { role: string; content: string }[] = [];
    if (history && Array.isArray(history)) {
      for (const h of history.slice(-6)) { // 최근 6턴만
        if (h.role === 'user') messages.push({ role: 'user', content: h.text });
        else if (h.role === 'ai') messages.push({ role: 'assistant', content: h.text });
      }
    }
    messages.push({ role: 'user', content: context });

    const messageCount = Array.isArray(history) ? history.length : 0;

    // maskCtx: mskCode로 MASK_PROFILES에서 조회
    const rawMaskForProfile = sanitizeUserInput(body.mskCode ?? mask ?? '', 20);
    const mskCodeForProfile = MASK_NAME_TO_CODE[rawMaskForProfile] ?? rawMaskForProfile;
    const maskCtx: MaskContext | null = MASK_PROFILES[mskCodeForProfile] ?? null;

    const sexselfProfile = typeof body.sexselfProfile === 'string' ? body.sexselfProfile : null;
    const sexselfSha = typeof body.sexselfSha === 'number' ? body.sexselfSha : null;

    const systemPrompt = buildSystemPrompt(aiName, aiTone, aiPersonality, tab, m43Context, messageCount, maskCtx, sessionPattern ?? null, researchContext || null, sexselfProfile, sexselfSha) + getModeTransitionHint(messageCount);
    const useStream = req.headers.get('accept') === 'text/event-stream';

    // ── Confidence-gated Escalation ──
    // 1단계: 템플릿 직접 반환 (confidence ≥ 0.8, vent 탭, 첫 5턴, 히스토리 없음)
    const isSimpleVent = tab === 'vent' && messageCount < 5 && !sessionPattern;
    if (isSimpleVent && cachedSb && emotion && cachedMskCode) {
      const { data: tplData } = await cachedSb
        .from('response_templates')
        .select('id, template, confidence')
        .eq('emotion', emotion)
        .eq('mask_code', cachedMskCode)
        .eq('tab', tab)
        .gte('confidence', 0.8)
        .single();
      if (tplData) {
        cachedSb.rpc('fn_template_use_increment', {
          p_emotion: emotion, p_mask_code: cachedMskCode, p_tab: tab,
        }).then(() => {}).catch(() => {});
        return new Response(
          JSON.stringify({ response: tplData.template, source: 'template', confidence: tplData.confidence }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    // 2단계: 모델 선택 — dig/get/set 탭이거나 6턴+ 이면 Sonnet, 나머지는 Haiku
    const needsSonnet = tab !== 'vent' || messageCount >= 6 || !!sessionPattern || !!researchContext;
    const selectedModel = needsSonnet ? MODELS.SONNET : MODELS.HAIKU;

    const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: 512,
        temperature: TEMPERATURES.CONVERSATION,
        system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
        messages,
        stream: useStream,
      }),
    });

    if (!aiResp.ok) {
      const details = await aiResp.text();
      console.error('Anthropic error:', aiResp.status, details);
      const fallback = getRuleBasedFallback(tab, emotion, crisisLevel);
      return new Response(JSON.stringify({ response: fallback, fallback: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // SSE 스트리밍: 클라이언트가 Accept: text/event-stream 헤더 전송 시
    if (useStream) {
      return new Response(aiResp.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    const data = await aiResp.json();
    const response: string = data?.content?.[0]?.text?.trim() ?? '';

    // ── 캐시 저장 (비동기 — 응답 지연 없음) ──
    if (cachedSb && response) {
      const insertPayload: Record<string, unknown> = {
        response,
        emotion:    emotion || null,
        mask_code:  cachedMskCode || null,
        tab:        tab || null,
        tone:       aiTone || null,
        input_hash: cachedInputHash || null,
      };
      if (cachedEmbedding) {
        insertPayload.input_embedding = `[${cachedEmbedding.join(',')}]`;
      }
      cachedSb.from('response_cache').insert(insertPayload).then(() => {}).catch(() => {});
    }

    return new Response(JSON.stringify({ response, source: 'llm', model: selectedModel }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('held-chat error:', error);
    // C11: catch 경로에서도 rule-based fallback 반환
    const fallback = getRuleBasedFallback('vent', '', 'none');
    return new Response(JSON.stringify({ response: fallback, fallback: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
