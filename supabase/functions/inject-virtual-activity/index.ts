import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

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

// 실제 사람 활동 패턴을 모방한 시간대 가중치
function weightedHour(): number {
  const r = Math.random();
  if (r < 0.15) return 7 + Math.floor(Math.random() * 2);   // 7~8시 (아침)
  if (r < 0.35) return 12 + Math.floor(Math.random() * 2);  // 12~13시 (점심)
  if (r < 0.75) return 21 + Math.floor(Math.random() * 3);  // 21~23시 (저녁)
  return Math.floor(Math.random() * 24);                      // 나머지 랜덤
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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const communityCount: number = body.community_count ?? 40;
    const codetalkCount: number = body.codetalk_count ?? 15;

    // 가상유저 목록 조회
    const { data: users, error: usersErr } = await supabase
      .from("user_profiles")
      .select("user_id, primary_mask, anon_alias")
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

    const TAB_CONTEXTS = ["dig", "vent", "set", "get", "me"];

    const communityRows = communityUsers.map((u) => {
      const mask = u.primary_mask as string;
      const pool = COMMUNITY_CONTENT[mask] ?? COMMUNITY_CONTENT["거울"];
      const content = pool[Math.floor(Math.random() * pool.length)];
      const tab = TAB_CONTEXTS[Math.floor(Math.random() * TAB_CONTEXTS.length)];
      return {
        user_id: u.user_id,
        content,
        is_anonymous: true,
        tab_context: tab,
        upvotes: Math.floor(Math.random() * 8),
        view_count: Math.floor(Math.random() * 30) + 1,
        created_at: todayTimestamp(),
        updated_at: new Date().toISOString(),
      };
    });

    let communityInserted = 0;
    if (communityRows.length > 0) {
      const { error: cErr } = await supabase
        .from("community_posts")
        .insert(communityRows);
      if (cErr) throw new Error("커뮤니티 삽입 실패: " + cErr.message);
      communityInserted = communityRows.length;
    }

    // 코드탁 엔트리 삽입
    const codetalkUsers = shuffled
      .filter((u) => !alreadyCodetalk.has(u.user_id))
      .slice(0, codetalkCount);

    const codetalkRows = codetalkUsers.map((u) => {
      const mask = u.primary_mask as string;
      const keyword = CODETALK_KEYWORDS[Math.floor(Math.random() * CODETALK_KEYWORDS.length)];
      const defs = CODETALK_DEFINITIONS[keyword] ?? ["나만의 방식으로 정의되는 것"];
      const definition = defs[Math.floor(Math.random() * defs.length)];
      const alias = u.anon_alias ?? ALIASES[Math.floor(Math.random() * ALIASES.length)];
      const ts = todayTimestamp();
      return {
        user_id: u.user_id,
        keyword,
        definition,
        is_public: true,
        anon_alias: alias,
        entry_date: today,
        created_at: ts,
        updated_at: ts,
      };
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
