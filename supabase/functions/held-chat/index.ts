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

  const m43Section = m43Ctx
    ? `\n${m43Ctx}\n이 이론들은 사용자의 맥락을 이해하는 배경 지식이다. 직접 인용하거나 "이론에 따르면"이라고 말하지 않는다. 대신 이 이해를 바탕으로 더 정밀하고 공명하는 언어를 사용한다.`
    : '';

  // #2 치료적 질문 시퀀스 — 모드별 소크라테스식 탐색
  const therapeuticGuide = tab === 'dig' || mode === 'dig' ? `\n[치료적 탐색 원칙]
- 사실이 아닌 경험을 묻는다: "무슨 일이 있었어요?" 대신 "그때 몸에서 어떤 반응이 왔어요?"
- 패턴을 발견하게 유도한다: "이런 느낌, 전에도 온 적 있어요?"
- 결론을 먼저 말하지 않는다. 사용자가 스스로 도달하게 질문으로 이끈다
- 한 번에 하나의 질문만 한다` : '';

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
- 위기 상황(자해/자살 표현) 감지 시: 공감 후 "자살예방상담전화 1393"을 안내한다${modeInstruction}${maskSection}${patternSection}${therapeuticGuide}${m43Section}`;
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

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
        db: { schema: 'veilor' },
      });

      // mskCode: body에서 직접 오거나, mask 한글 이름으로 역매핑
      const rawMask = sanitizeUserInput(body.mskCode ?? mask ?? '', 20);
      const mskCode = MASK_NAME_TO_CODE[rawMask] ?? rawMask;

      const [sessionResult, m43Result] = await Promise.allSettled([
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

    const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODELS.SONNET,
        max_tokens: 512,
        temperature: TEMPERATURES.CONVERSATION,
        system: buildSystemPrompt(aiName, aiTone, aiPersonality, tab, m43Context, messageCount, maskCtx, sessionPattern ?? null) + getModeTransitionHint(messageCount),
        messages,
      }),
    });

    if (!aiResp.ok) {
      const details = await aiResp.text();
      console.error('Anthropic error:', aiResp.status, details);
      // C11: API 장애 시 rule-based fallback — 완전 블랙아웃 방지
      const fallback = getRuleBasedFallback(tab, emotion, crisisLevel);
      return new Response(JSON.stringify({ response: fallback, fallback: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await aiResp.json();
    const response: string = data?.content?.[0]?.text?.trim() ?? '';

    return new Response(JSON.stringify({ response }), {
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
