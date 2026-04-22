/**
 * recommend-content — LightFM 스타일 개인화 콘텐츠 추천
 *
 * Phase 3: 행동 데이터 기반 협업 필터링
 *   - V-File 가면 + 욕구 결핍 + 최근 감정 패턴 → 콘텐츠 매칭
 *   - LIGHTFM_API_URL 설정 시 Python FastAPI 위임 (주간 배치 학습)
 *   - 미설정 시 규칙 기반 폴백 (가면 코드 → 태그 매핑)
 *
 * 환경변수:
 *   LIGHTFM_API_URL  — FastAPI 서버 URL (선택)
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const LIGHTFM_API_URL           = Deno.env.get('LIGHTFM_API_URL') ?? '';
const SUPABASE_URL              = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const MASK_CONTENT_TAGS: Record<string, string[]> = {
  PWR: ['경계설정', '자율성', '통제해제', '신뢰관계'],
  NRC: ['자기수용', '내면가치', '진정성', '취약성'],
  SCP: ['소속감', '자기표현', '규칙재정의', '자유'],
  MKV: ['내면탐구', '진정한친밀감', '자기공개', '취약성'],
  MNY: ['책임감', '깊이있는연결', '회피패턴', '현존'],
  PSP: ['현재순간', '만족감', '놓아주기', '충분함'],
  EMP: ['자기감정', '경계설정', '자기공간', '자아회복'],
  GVR: ['수용능력', '자기돌봄', '받기연습', '균형'],
  APV: ['무조건적수용', '과정중심', '실패회복', '자기가치'],
  DEP: ['자기신뢰', '독립성', '결정능력', '자아강화'],
  AVD: ['취약성', '감정표현', '안전한연결', '신뢰'],
  SAV: ['자기사랑', '경계설정', '희생탈출', '자기가치'],
};

const NEED_GAP_TAGS: Record<string, string[]> = {
  'SAF-SEC': ['안전감', '안정관계', '신뢰구축'],
  'CON-BEL': ['소속감', '연결심화', '외로움극복'],
  'CON-INT': ['친밀감', '자기공개', '깊은대화'],
  'GRW-REC': ['인정욕구', '자기인정', '외부인정독립'],
  'GRW-PWR': ['영향력', '리더십', '자기효능감'],
  'EXS-AUT': ['자유', '경계', '자기결정'],
  'EXS-MNG': ['의미찾기', '가치관', '삶의목적'],
  'ANXIETY_FROZEN': ['성적자아', '수치심치유', '친밀감재건'],
};

interface RecommendItem {
  id: string;
  type: 'challenge' | 'reflection' | 'article' | 'exercise';
  title: string;
  description: string;
  tags: string[];
  relevanceScore: number;
  source: 'lightfm' | 'rule';
}

const CONTENT_POOL: Omit<RecommendItem, 'relevanceScore' | 'source'>[] = [
  { id: 'c1', type: 'challenge', title: '오늘 한 가지 경계 설정하기', description: '작은 "아니요"에서 시작하는 자기존중 연습', tags: ['경계설정', '자기가치', '자아강화'] },
  { id: 'c2', type: 'challenge', title: '취약한 감정 한 문장으로 표현하기', description: '감추지 않고 솔직하게 — 가까운 사람에게', tags: ['취약성', '자기공개', '감정표현'] },
  { id: 'c3', type: 'challenge', title: '칭찬을 "감사해요"로만 받기', description: '부정하거나 돌려주지 않고 온전히 받아들이기', tags: ['수용능력', '받기연습', '자기가치'] },
  { id: 'c4', type: 'challenge', title: '오늘 나를 위한 시간 30분', description: '타인이 아닌 오직 나를 위한 활동', tags: ['자기돌봄', '자기사랑', '균형'] },
  { id: 'r1', type: 'reflection', title: '"충분하다"는 느낌이 언제 오나요?', description: '만족의 조건을 탐색하는 내면 질문', tags: ['만족감', '충분함', '자기수용'] },
  { id: 'r2', type: 'reflection', title: '지금 가장 원하는 게 뭔가요?', description: '욕구와 현실 사이의 간극 탐색', tags: ['욕구탐색', '자기이해', '현존'] },
  { id: 'r3', type: 'reflection', title: '이 관계에서 내가 잃고 있는 건?', description: '관계 비용을 솔직하게 바라보기', tags: ['경계설정', '관계건강', '자기돌봄'] },
  { id: 'r4', type: 'reflection', title: '내 화는 실제로 무엇에 대한 화인가요?', description: '표면 감정 아래의 진짜 욕구 찾기', tags: ['분노탐색', '욕구탐색', '자기이해'] },
  { id: 'e1', type: 'exercise', title: '몸에서 감정 찾기 — 5분 바디스캔', description: '머리가 아닌 몸으로 느끼는 감정 인식 훈련', tags: ['현존', '감정표현', '자기인식'] },
  { id: 'e2', type: 'exercise', title: '오늘의 감정 온도 측정하기', description: '감정을 0~10으로 표현하는 간단한 자기추적', tags: ['감정표현', '자기인식', '패턴인식'] },
  { id: 'e3', type: 'exercise', title: '감사 3개 + 필요한 것 1개', description: '긍정성과 욕구를 동시에 인식하는 균형 연습', tags: ['균형', '자기돌봄', '의미찾기'] },
  { id: 'a1', type: 'article', title: '외로움은 연결의 신호다', description: 'CON-BEL 욕구와 외로움의 관계 이해', tags: ['소속감', '외로움극복', '연결심화'] },
  { id: 'a2', type: 'article', title: '경계는 벽이 아니라 문이다', description: '건강한 경계가 오히려 더 깊은 관계를 만드는 이유', tags: ['경계설정', '친밀감', '안전감'] },
  { id: 'a3', type: 'article', title: '성취 없이도 사랑받을 수 있다', description: 'GRW-REC 욕구와 무조건적 수용에 대해', tags: ['무조건적수용', '자기가치', '인정욕구'] },
];

function scoreContent(item: Omit<RecommendItem, 'relevanceScore' | 'source'>, targetTags: string[]): number {
  const matches = item.tags.filter(t => targetTags.includes(t)).length;
  return matches / Math.max(item.tags.length, targetTags.length, 1);
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const rateLimitKey = body.userId ?? req.headers.get('x-forwarded-for') ?? 'anon';
    if (!checkRateLimit(rateLimitKey, 20, 60_000)) return rateLimitResponse(corsHeaders);

    const userId    = body.userId as string | undefined;
    const mskCode   = body.mskCode as string | undefined;
    const top3Needs = (body.top3Needs ?? []) as string[];
    const limit     = Math.min(Number(body.limit ?? 5), 10);

    // LightFM API 시도
    if (LIGHTFM_API_URL && userId) {
      try {
        const lfResp = await fetch(`${LIGHTFM_API_URL}/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, msk_code: mskCode, top3_needs: top3Needs, limit }),
          signal: AbortSignal.timeout(5000),
        });
        if (lfResp.ok) {
          const lfData = await lfResp.json() as { items?: RecommendItem[] };
          if (lfData.items?.length) {
            return new Response(JSON.stringify({ items: lfData.items, source: 'lightfm' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch { /* 폴백 진행 */ }
    }

    // 규칙 기반 폴백
    const targetTags: string[] = [];
    if (mskCode) targetTags.push(...(MASK_CONTENT_TAGS[mskCode] ?? []));
    for (const need of top3Needs) targetTags.push(...(NEED_GAP_TAGS[need] ?? []));

    if (userId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
        db: { schema: 'veilor' },
      });
      const { data: recent } = await sb
        .from('emotion_scores')
        .select('need_gaps')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recent?.length) {
        for (const r of recent) {
          const gaps = r.need_gaps as Record<string, number> ?? {};
          for (const [k, v] of Object.entries(gaps)) {
            if (v > 0.4) targetTags.push(...(NEED_GAP_TAGS[k] ?? []));
          }
        }
      }
    }

    const uniqueTags = [...new Set(targetTags)];
    const scored = CONTENT_POOL
      .map(item => ({ ...item, relevanceScore: scoreContent(item, uniqueTags), source: 'rule' as const }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return new Response(JSON.stringify({ items: scored, source: 'rule' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('recommend-content error:', err);
    return new Response(JSON.stringify({ items: [], source: 'error' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
