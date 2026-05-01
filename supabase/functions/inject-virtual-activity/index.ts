import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS 인라인 (_shared import 번들러 미지원)
function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}
function handleCorsOptions(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }
  return null;
}

const COMMUNITY_CONTENT: Record<string, string[]> = {
  반항자: [
    "아무리 좋은 관계도 나를 잃어가면 의미가 없더라고요.",
    "경계를 말했더니 오히려 관계가 더 편해졌어요. 처음엔 두려웠는데.",
    "내 방식대로 살겠다고 했을 때 떠난 사람이 있었어요. 근데 잘한 것 같아요.",
    "통제하려는 사람 앞에서 자꾸 무너지는 게 싫어서 요즘 연습 중이에요.",
    "거절했는데 상대가 화내면, 그게 나한테 맞는 관계인지 돌아봐요.",
  ],
  구원자: [
    "도움을 줬는데 당연하게 여기더라고요. 이게 반복되니까 힘드네요.",
    "먼저 손 내미는 게 습관인데, 언제부터 이랬나 생각해봤어요.",
    "상대가 괜찮다고 해도 걱정이 먼저 올라와요. 어떻게 하면 좋을까요.",
    "도움을 주는 게 진심인지, 두려워서인지 모르겠을 때가 있어요.",
    "나 자신을 돌보는 게 이상하게 느껴질 때가 있어요. 이런 분 있으신가요.",
  ],
  돌보는자: [
    "챙기다 보면 어느 순간 내가 없어지는 것 같아요.",
    "상대가 힘들어보이면 내 감정보다 그게 먼저 느껴져요.",
    "오늘은 나를 위한 시간을 만들었어요. 생각보다 어색했어요.",
    "먼저 연락하는 게 당연해졌는데, 한번 멈춰봤더니 연락이 없더라고요.",
    "소진되지 않으려면 어떻게 해야 할까요. 진심으로 궁금해요.",
  ],
  거울: [
    "상대 반응에 따라 하루가 달라지는 게 피곤해요.",
    "칭찬받으면 안심이 되고, 무반응이면 불안해져요. 이거 어떻게 하죠.",
    "내가 어떤 사람인지 모르겠을 때가 있어요. 혼자 있으면 더 그래요.",
    "인정받으려고 행동하는 건지, 진심으로 하는 건지 헷갈려요.",
    "상대 눈치를 덜 보고 싶은데 생각처럼 안 돼요.",
  ],
  승인자: [
    "싫다는 말을 못 해서 계속 맞춰왔는데 이제 한계인 것 같아요.",
    "거절하면 관계가 깨질 것 같아서 늘 참았어요. 이게 맞는 건지.",
    "오늘 처음으로 솔직하게 말했어요. 무서웠지만 해냈어요.",
    "모두에게 좋은 사람이 되려다 아무에게도 솔직하지 못했어요.",
    "갈등이 생기면 무조건 내가 먼저 사과하는 패턴이 있어요.",
  ],
  매혹자: [
    "관심을 받으면 살아있는 것 같고, 없으면 사라지는 것 같아요.",
    "진짜 나를 보여줬더니 오히려 더 좋아해줬어요. 놀랐어요.",
    "매력으로 연결됐는데 깊어지는 게 두려워요. 이런 분 있으신가요.",
    "아무도 보지 않을 때도 내가 나라는 느낌이 드는지 생각해봤어요.",
    "시선을 의식하지 않아도 되는 관계가 제일 편하더라고요.",
  ],
  유희자: [
    "진지해지는 게 왜 이렇게 불편한지 모르겠어요. 피하게 돼요.",
    "웃음으로 넘겼는데 나중에 보면 그게 상처였던 적이 있어요.",
    "가볍게 지내는 게 편한데, 가끔은 깊은 대화가 그립기도 해요.",
    "농담으로 분위기를 풀었는데 상대는 진지하게 받아들이더라고요.",
    "즐거움을 찾는 게 회피인지 진심인지 구분이 안 될 때가 있어요.",
  ],
  통제자: [
    "내가 주도하지 않으면 불안한 게 관계에서도 나오더라고요.",
    "상대 실수를 수정해주고 싶은 충동이 올라올 때 참아보려고 해요.",
    "완벽하게 하려다 상대가 지쳐했어요. 그제야 보이더라고요.",
    "통제가 안 되는 상황에서 내 감정이 어떻게 올라오는지 봤어요.",
    "믿고 맡겨보는 연습을 하고 있어요. 생각보다 어렵네요.",
  ],
  회피자: [
    "가까워지면 뭔가 잃는 것 같아서 일정 거리를 두게 돼요.",
    "연락을 미루다가 관계가 소원해진 경험이 있어요.",
    "혼자 있는 시간이 충전인데, 상대는 거부로 받아들이더라고요.",
    "침묵으로 대처하는 게 습관인데, 이게 상대를 힘들게 한다는 걸 알아요.",
    "가까워지고 싶은데 막상 가까워지면 도망가고 싶어져요.",
  ],
  탐험자: [
    "다양한 관계를 갖고 싶은데 한편으론 외롭기도 해요.",
    "새로운 사람을 만나는 게 좋은데, 깊어지는 건 부담스러워요.",
    "한 관계에 오래 머물면 정체되는 것 같아서 불안해요.",
    "넓게 연결되는 게 좋은데 진짜 가까운 사람이 없는 것 같아요.",
    "계속 새로운 걸 찾는 게 성장인지 회피인지 모르겠어요.",
  ],
  의존자: [
    "답장이 늦으면 머릿속에서 최악의 시나리오를 돌려요. 저만 이런가요.",
    "혼자 결정하는 게 무서워서 항상 누군가에게 확인해요.",
    "버려질까봐 먼저 매달리는 패턴이 있어요. 알면서도 반복돼요.",
    "함께 있으면 안심이 되는데, 그게 의존인지 사랑인지 모르겠어요.",
    "혼자 있는 연습을 하고 있어요. 생각보다 할 만해요.",
  ],
  공허자: [
    "아무것도 느껴지지 않는 날이 있어요. 이게 무감각인 건지.",
    "연결되고 싶은데 방법을 모르겠어요. 다가가면 공허해지더라고요.",
    "감정이 있는지 없는지 모를 때, 그냥 있어보려고 해요.",
    "아무것도 의미 없게 느껴질 때 어떻게 하시나요.",
    "뭔가를 느끼고 싶은데 잘 안 돼요. 그냥 이 공간에 있어봐요.",
  ],
};

const CODETALK_KEYWORDS = [
  "경계", "거부", "갈등", "감사", "거리", "기대", "나", "대화", "두려움",
  "사랑", "상처", "소통", "신뢰", "외로움", "의존", "이별", "자존감",
  "집착", "통제", "회피", "감정", "관계", "공감", "선택", "변화",
];

// 영어 커뮤니티 콘텐츠 (마스크별)
const COMMUNITY_CONTENT_EN: Record<string, string[]> = {
  반항자: [
    "No matter how good a relationship is, if I lose myself in it, it means nothing.",
    "When I spoke my boundaries, the relationship actually became easier. I was scared at first.",
    "When I said I'd live my own way, someone left. But I think I made the right choice.",
    "I'm practicing not collapsing in front of people who try to control me.",
    "When someone gets angry at my refusal, I ask myself if this relationship is right for me.",
  ],
  구원자: [
    "I helped them, but they took it for granted. It's exhausting when this keeps repeating.",
    "Reaching out first has become a habit — I've been wondering when that started.",
    "Even when they say they're fine, worry comes first. What should I do?",
    "Sometimes I can't tell if I'm helping out of sincerity or fear.",
    "It feels strange to take care of myself. Does anyone else feel this way?",
  ],
  돌보는자: [
    "The more I take care of others, the more I feel like I'm disappearing.",
    "When someone looks troubled, I feel their feelings before my own.",
    "Today I made time for myself. It felt more awkward than I expected.",
    "Reaching out first became natural — but when I stopped, there was silence.",
    "How do I avoid burning out? I'm genuinely curious.",
  ],
  거울: [
    "It's exhausting when my whole day shifts based on how others react.",
    "Praise calms me, silence makes me anxious. How do I deal with this?",
    "Sometimes I don't know who I am. It gets worse when I'm alone.",
    "I can't tell if I'm acting to be recognized or acting from the heart.",
    "I want to stop reading people so much, but it doesn't work the way I want.",
  ],
  승인자: [
    "I couldn't say no, so I kept adjusting — and now I've hit a limit.",
    "I always held back, afraid that refusing would break the relationship.",
    "Today I said what I really felt for the first time. It was scary but I did it.",
    "Trying to be good for everyone, I ended up honest with no one.",
    "I have a pattern of apologizing first whenever there's any conflict.",
  ],
  매혹자: [
    "When I'm getting attention, I feel alive. Without it, I feel like I disappear.",
    "When I showed the real me, they liked me even more. I was surprised.",
    "We connected through attraction, but deepening it feels frightening.",
    "I wondered if I still feel like myself when no one is watching.",
    "The relationships where I don't have to think about how I look — those are the most comfortable.",
  ],
  유희자: [
    "I don't understand why getting serious feels so uncomfortable. I find myself avoiding it.",
    "I brushed things off with humor, but later realized it had been a wound.",
    "Keeping things light is comfortable, but sometimes I miss deeper conversations.",
    "I tried to lighten the mood with a joke, but the other person took it seriously.",
    "I can't tell if finding joy is growth or avoidance.",
  ],
  통제자: [
    "The need to be in control comes out in relationships too.",
    "When I feel the urge to correct someone's mistake, I try to hold back.",
    "Trying to be perfect, the other person got tired. I only saw it then.",
    "I watched how my feelings rise in situations I can't control.",
    "I'm practicing trusting and letting go. It's harder than I thought.",
  ],
  회피자: [
    "When people get too close, I feel like I might lose something — so I keep a distance.",
    "I delayed contact and the relationship became distant.",
    "Time alone is recharging for me, but the other person read it as rejection.",
    "Silence is my habit in conflict — and I know it's hard on the other person.",
    "I want to get closer, but when I do, I want to run.",
  ],
  탐험자: [
    "I want various connections, but sometimes I feel lonely.",
    "I enjoy meeting new people, but deepening a relationship feels like a burden.",
    "Staying in one relationship too long makes me feel like I'm stagnating.",
    "I connect widely, but sometimes I wonder if I really have anyone close.",
    "I can't tell if constantly seeking new things is growth or avoidance.",
  ],
  의존자: [
    "When a reply is late, I run through the worst-case scenarios in my head. Is it just me?",
    "I'm scared to decide alone, so I always check with someone.",
    "I have a pattern of clinging first because I'm afraid of being abandoned. I know it, but it keeps happening.",
    "Being together brings relief — I can't tell if it's dependence or love.",
    "I'm practicing being alone. It's more manageable than I thought.",
  ],
  공허자: [
    "Some days I feel nothing at all. I wonder if this is numbness.",
    "I want to connect but don't know how. When I get close, I feel emptier.",
    "When I don't know if I'm feeling or not, I try to just stay with it.",
  ],
};

// 영어 코드탁 정의
const CODETALK_DEFINITIONS_EN: Record<string, string[]> = {
  boundary: ["A line I need to draw so I don't break down", "Not pushing others away, but protecting myself"],
  rejection: ["Feeling like my existence was denied when turned down", "An old sensation that rises when I don't get what I want"],
  conflict: ["The moment two different desires collide", "Something that grows when avoided and shrinks when faced"],
  gratitude: ["The ability to recognize what I've received", "Something that appears when even small things feel enough"],
  distance: ["The space I need to breathe", "Something I create when I'm afraid closeness will make it disappear"],
  expectation: ["The hope that someone will understand my heart", "Wanting to be understood without having to say it"],
  self: ["Something I don't want to lose within a relationship", "Whatever must remain no matter who I'm with"],
  conversation: ["Something where listening is more than speaking", "The process of confirming each other's differences"],
  fear: ["The paradoxical feeling that grows as closeness increases", "A signal that I now have something to lose"],
  love: ["A relationship that lets me be myself", "A space where it's safe to fall apart"],
  wound: ["A sensation that lingers longer than memory", "Something that hurts when touched even when it seems healed"],
  communication: ["Understanding passing between people, not just words", "A moment when I need to confirm I'm not wrong"],
  trust: ["Something that makes you try again even after betrayal", "Takes long to build, breaks in an instant"],
  loneliness: ["Something felt even in the presence of others", "A signal that I want to connect"],
  dependence: ["What comes from believing I'm incomplete alone", "When I can't tell if it's love or fear"],
  separation: ["Not an end, but a new starting point", "The moment I discover what I truly wanted"],
  selfesteem: ["My center that doesn't waver in relationships", "Something that exists independent of others' evaluations"],
  obsession: ["Anxiety wearing the clothes of love", "The fear that letting go means losing it"],
  control: ["A way to find safety in unpredictable situations", "What comes out when I can't trust"],
  avoidance: ["A defense formed from fear of getting hurt by closeness", "An old strategy to avoid being wounded"],
  emotion: ["Something that accumulates even when ignored", "Proof that I'm alive"],
  relationship: ["A mirror that reflects me", "Something that shows me what I can't know alone"],
  empathy: ["Confirmation that my feelings aren't wrong", "Feeling together, not solving together"],
  choice: ["Something that comes with letting go", "The why of choosing matters more than what"],
  change: ["Where fear and excitement coexist", "Something that takes longer when resisted"],
};

const ALIASES_EN = [
  "Quiet Moon", "Dawn Forest", "Red Sand", "White Wave", "Small Star",
  "Deep River", "Distant Cloud", "Blue Mist", "Warm Stone", "Empty Chair",
  "Still Lake", "West Wind", "Ancient Tree", "First Snow", "Dark Sea",
  "Silent Field", "Low Voice", "Cold Moonlight", "Wet Grass", "Far Mountain",
];

const CODETALK_DEFINITIONS: Record<string, string[]> = {
  경계: ["내가 무너지지 않기 위해 그어야 하는 선", "상대를 밀어내는 게 아니라 나를 지키는 것"],
  거부: ["거절당했을 때 내 존재가 부정된 것 같은 느낌", "원하는 것을 못 받았을 때 올라오는 오래된 감각"],
  갈등: ["서로 다른 두 욕구가 부딪히는 순간", "피하면 커지고 마주하면 작아지는 것"],
  감사: ["받은 것을 인식하는 능력", "작은 것도 충분히 느낄 수 있을 때 생기는 것"],
  거리: ["숨 쉬기 위해 필요한 공간", "가까워지면 사라질 것 같아서 만들게 되는 것"],
  기대: ["상대가 내 마음을 알아줬으면 하는 바람", "말하지 않아도 이해받고 싶은 마음"],
  나: ["관계 안에서 잃어버리고 싶지 않은 것", "누구와 있어도 남아있어야 할 무언가"],
  대화: ["말보다 듣는 것이 더 많은 것", "서로의 다름을 확인하는 과정"],
  두려움: ["가까워질수록 커지는 역설적인 감정", "잃을 게 생겼다는 신호"],
  사랑: ["내가 나일 수 있게 해주는 관계", "안전하게 무너져도 되는 공간"],
  상처: ["기억보다 오래 남아있는 감각", "다 나은 것 같아도 건드리면 아픈 것"],
  소통: ["말이 아니라 이해가 오가는 것", "내가 틀리지 않았다는 확인이 필요한 순간"],
  신뢰: ["배신당해도 다시 시도하게 만드는 것", "쌓이는 데 오래 걸리고 무너지는 건 순간인 것"],
  외로움: ["사람 안에 있어도 느껴지는 것", "연결되고 싶다는 신호"],
  의존: ["혼자는 불완전하다는 믿음에서 오는 것", "사랑인지 두려움인지 구분이 안 될 때"],
  이별: ["끝이 아니라 새로운 시작점", "내가 무엇을 원했는지 알게 되는 순간"],
  자존감: ["관계에서 흔들리지 않는 내 중심", "타인의 평가와 별개로 존재하는 것"],
  집착: ["불안이 사랑의 옷을 입은 것", "놓으면 사라질 것 같은 두려움"],
  통제: ["예측 불가한 상황에서 안전을 찾는 방식", "믿지 못해서 나오는 것"],
  회피: ["가까워지면 다칠 것 같아서 생긴 방어", "상처받지 않으려는 오래된 전략"],
  감정: ["무시해도 사라지지 않고 쌓이는 것", "내가 살아있다는 증거"],
  관계: ["나를 비추는 거울", "혼자서는 알 수 없는 나를 보여주는 것"],
  공감: ["내 감정이 틀리지 않았다는 확인", "함께 느끼는 것이지 해결하는 게 아닌 것"],
  선택: ["포기를 동반하는 것", "무엇을 고르는가보다 왜 고르는가가 중요한 것"],
  변화: ["두려움과 설렘이 공존하는 것", "저항하면 더 오래 걸리는 것"],
};

const ALIASES = [
  "조용한 달", "새벽의 숲", "붉은 모래", "흰 파도", "작은 별",
  "깊은 강", "먼 구름", "푸른 안개", "따뜻한 돌", "빈 의자",
  "잔잔한 호수", "서쪽 바람", "오래된 나무", "첫 눈", "어두운 바다",
  "고요한 들판", "낮은 목소리", "차가운 달빛", "젖은 풀", "먼 산",
];

function weightedHour(): number {
  const r = Math.random();
  if (r < 0.15) return 7 + Math.floor(Math.random() * 2);
  if (r < 0.35) return 12 + Math.floor(Math.random() * 2);
  if (r < 0.75) return 21 + Math.floor(Math.random() * 3);
  return Math.floor(Math.random() * 24);
}

function todayTimestamp(): string {
  const now = new Date();
  const h = weightedHour();
  const m = Math.floor(Math.random() * 60);
  const s = Math.floor(Math.random() * 60);
  now.setHours(h, m, s, 0);
  return now.toISOString();
}

Deno.serve(async (req: Request) => {
  const corsOpts = handleCorsOptions(req);
  if (corsOpts) return corsOpts;

  const headers = { ...getCorsHeaders(req), "Content-Type": "application/json" };

  try {
    // veilor 스키마를 기본 스키마로 지정
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { db: { schema: "veilor" } },
    );

    const body = await req.json().catch(() => ({}));
    const communityCount: number = body.community_count ?? 40;
    const codetalkCount: number = body.codetalk_count ?? 15;

    // 가상유저 목록 조회 (veilor.user_profiles — anon_alias 없음, nickname 사용)
    const { data: users, error: usersErr } = await supabase
      .from("user_profiles")
      .select("user_id, primary_mask, nickname")
      .eq("onboarding_step", "completed")
      .not("primary_mask", "is", null)
      .limit(995);

    if (usersErr || !users) throw new Error("유저 조회 실패: " + usersErr?.message);

    // 오늘 이미 활동한 유저 제외
    const today = new Date().toISOString().slice(0, 10);
    const { data: todayPosts } = await supabase
      .from("community_posts")
      .select("user_id")
      .gte("created_at", today + "T00:00:00Z");
    const alreadyPosted = new Set((todayPosts ?? []).map((p: { user_id: string }) => p.user_id));

    const { data: todayCodetalk } = await supabase
      .from("codetalk_entries")
      .select("user_id")
      .gte("created_at", today + "T00:00:00Z");
    const alreadyCodetalk = new Set((todayCodetalk ?? []).map((p: { user_id: string }) => p.user_id));

    // 셔플
    const shuffled = [...users].sort(() => Math.random() - 0.5);

    // 커뮤니티 포스트 삽입
    const communityUsers = shuffled
      .filter((u) => !alreadyPosted.has(u.user_id))
      .slice(0, communityCount);

    // tab_context 허용값: vent, dig, get, set, general
    const TAB_CONTEXTS = ["dig", "vent", "set", "get", "general"];

    // ko + en 양쪽 행 생성 (가상유저는 크레딧 없이 직접 이중 삽입)
    const communityRows: Record<string, unknown>[] = [];
    communityUsers.forEach((u) => {
      const mask = u.primary_mask as string;
      const poolKo = COMMUNITY_CONTENT[mask] ?? COMMUNITY_CONTENT["거울"];
      const poolEn = COMMUNITY_CONTENT_EN[mask] ?? COMMUNITY_CONTENT_EN["거울"];
      const idx = Math.floor(Math.random() * poolKo.length);
      const tab = TAB_CONTEXTS[Math.floor(Math.random() * TAB_CONTEXTS.length)];
      const ts = todayTimestamp();
      const base = {
        user_id: u.user_id,
        is_anonymous: true,
        tab_context: tab,
        upvotes: Math.floor(Math.random() * 8),
        view_count: Math.floor(Math.random() * 30) + 1,
        created_at: ts,
        updated_at: new Date().toISOString(),
      };
      communityRows.push({ ...base, content: poolKo[idx], lang: "ko" });
      communityRows.push({ ...base, content: poolEn[idx] ?? poolEn[Math.floor(Math.random() * poolEn.length)], lang: "en" });
    });

    let communityInserted = 0;
    if (communityRows.length > 0) {
      const { error: cErr } = await supabase
        .from("community_posts")
        .insert(communityRows);
      if (cErr) throw new Error("커뮤니티 삽입 실패: " + cErr.message);
      communityInserted = communityRows.length;
    }

    // 코드탁 엔트리 ko + en 이중 삽입
    const codetalkUsers = shuffled
      .filter((u) => !alreadyCodetalk.has(u.user_id))
      .slice(0, codetalkCount);

    const KEYWORD_EN_MAP: Record<string, string> = {
      "경계": "boundary", "거부": "rejection", "갈등": "conflict", "감사": "gratitude",
      "거리": "distance", "기대": "expectation", "나": "self", "대화": "conversation",
      "두려움": "fear", "사랑": "love", "상처": "wound", "소통": "communication",
      "신뢰": "trust", "외로움": "loneliness", "의존": "dependence", "이별": "separation",
      "자존감": "selfesteem", "집착": "obsession", "통제": "control", "회피": "avoidance",
      "감정": "emotion", "관계": "relationship", "공감": "empathy", "선택": "choice", "변화": "change",
    };

    const codetalkRows: Record<string, unknown>[] = [];
    codetalkUsers.forEach((u) => {
      const keyword = CODETALK_KEYWORDS[Math.floor(Math.random() * CODETALK_KEYWORDS.length)];
      const defsKo = CODETALK_DEFINITIONS[keyword] ?? ["나만의 방식으로 정의되는 것"];
      const keywordEn = KEYWORD_EN_MAP[keyword] ?? "relationship";
      const defsEn = CODETALK_DEFINITIONS_EN[keywordEn] ?? ["Something defined in my own way"];
      const defKo = defsKo[Math.floor(Math.random() * defsKo.length)];
      const defEn = defsEn[Math.floor(Math.random() * defsEn.length)];
      const aliasKo = (u as Record<string, unknown>).nickname as string
        ?? ALIASES[Math.floor(Math.random() * ALIASES.length)];
      const aliasEn = ALIASES_EN[Math.floor(Math.random() * ALIASES_EN.length)];
      const ts = todayTimestamp();
      const base = {
        user_id: u.user_id,
        keyword,
        is_public: true,
        entry_date: today,
        created_at: ts,
        updated_at: ts,
      };
      codetalkRows.push({ ...base, definition: defKo, anon_alias: aliasKo, lang: "ko" });
      codetalkRows.push({ ...base, definition: defEn, anon_alias: aliasEn, lang: "en" });
    });

    let codetalkInserted = 0;
    if (codetalkRows.length > 0) {
      const { error: ctErr } = await supabase
        .from("codetalk_entries")
        .insert(codetalkRows);
      if (ctErr) throw new Error("코드탁 삽입 실패: " + ctErr.message);
      codetalkInserted = codetalkRows.length;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        date: today,
        community_inserted: communityInserted,
        codetalk_inserted: codetalkInserted,
        skipped_community: communityCount - communityInserted,
        skipped_codetalk: codetalkCount - codetalkInserted,
      }),
      { headers },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers,
    });
  }
});
