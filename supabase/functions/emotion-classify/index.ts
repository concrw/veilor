/**
 * emotion-classify — KOTE 44개 감정 분류 + M43 V-NEED 매핑
 *
 * 흐름:
 *   1. 사용자 텍스트 → HuggingFace Inference API (beomi/KcELECTRA-base-v2022 + KOTE 파인튜닝)
 *   2. 상위 5개 감정 → M43 V-NEED Gap 코드로 매핑
 *   3. 결과를 veilor.emotion_scores에 저장 + 클라이언트에 반환
 *
 * 환경변수:
 *   HUGGINGFACE_API_KEY  — HF Inference API 토큰
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { sanitizeUserInput } from "../_shared/sanitize.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const HF_API_KEY              = Deno.env.get('HUGGINGFACE_API_KEY') ?? '';
const SUPABASE_URL            = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// KOTE 파인튜닝 모델 엔드포인트
// beomi/KcELECTRA-base-v2022 기반, KOTE 44개 감정 분류 태스크
const HF_MODEL = 'searle-j/kote_for_easygoing_ai';

// ── KOTE 44개 감정 → M43 V-NEED Gap 매핑 ──────────────────────────────────
// 억울함/서운함 → ANXIETY_FROZEN
// 외로움        → CON-BEL Gap (연결-소속 욕구)
// 불안함        → SAF-SEC Gap (안전-안정 욕구)
// 분노          → PWR-AUT Gap (권력-자율 욕구)
// 수치/창피      → EST-VAL Gap (존중-가치 욕구)
const EMOTION_TO_NEED_GAP: Record<string, string[]> = {
  '불안/걱정':     ['SAF-SEC'],
  '불안함':        ['SAF-SEC'],
  '걱정':          ['SAF-SEC'],
  '두려움':        ['SAF-SEC'],
  '외로움':        ['CON-BEL'],
  '슬픔':          ['CON-BEL', 'EST-VAL'],
  '억울함':        ['ANXIETY_FROZEN', 'EST-VAL'],
  '서운함':        ['ANXIETY_FROZEN', 'CON-BEL'],
  '분노':          ['PWR-AUT'],
  '화남':          ['PWR-AUT'],
  '짜증':          ['PWR-AUT', 'SAF-SEC'],
  '수치/창피':     ['EST-VAL'],
  '죄책감':        ['EST-VAL', 'ANXIETY_FROZEN'],
  '우울':          ['CON-BEL', 'SAF-SEC'],
  '실망':          ['EST-VAL', 'CON-BEL'],
  '무기력':        ['SAF-SEC', 'ANXIETY_FROZEN'],
  '상처':          ['EST-VAL', 'CON-BEL'],
  '당혹감':        ['EST-VAL'],
  '혐오':          ['PWR-AUT'],
  '부러움':        ['EST-VAL'],
  '기쁨':          [],
  '행복':          [],
  '사랑':          [],
  '감사':          [],
  '설렘':          [],
  '편안':          [],
};

interface EmotionScore {
  label: string;
  score: number;
}

function mapToNeedGaps(emotions: EmotionScore[]): Record<string, number> {
  const gapScores: Record<string, number> = {};
  for (const { label, score } of emotions) {
    const gaps = EMOTION_TO_NEED_GAP[label] ?? [];
    for (const gap of gaps) {
      gapScores[gap] = (gapScores[gap] ?? 0) + score;
    }
  }
  return gapScores;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const rateLimitKey = body.userId ?? req.headers.get('x-forwarded-for') ?? 'anon';
    if (!checkRateLimit(rateLimitKey, 30, 60_000)) return rateLimitResponse(corsHeaders);

    const text      = sanitizeUserInput(body.text ?? '', 1000);
    const userId    = body.userId as string | undefined;
    const sessionId = body.sessionId as string | undefined;

    if (!text) {
      return new Response(JSON.stringify({ topEmotions: [], needGaps: {} }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 1. HuggingFace Inference API 호출 ────────────────────────────
    let topEmotions: EmotionScore[] = [];

    if (HF_API_KEY) {
      const hfResp = await fetch(
        `https://api-inference.huggingface.co/models/${HF_MODEL}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: text }),
        },
      );

      if (hfResp.ok) {
        // HF text-classification 응답: [[{label, score}, ...]] 또는 [{label, score}, ...]
        const raw = await hfResp.json();
        const scores: EmotionScore[] = Array.isArray(raw[0]) ? raw[0] : raw;
        // 상위 5개, score 내림차순
        topEmotions = scores
          .filter((e): e is EmotionScore => typeof e.label === 'string' && typeof e.score === 'number')
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
      } else {
        console.warn('HF API error:', hfResp.status, await hfResp.text());
      }
    } else {
      // HF API 키 없음 — 규칙 기반 폴백 (키워드 매칭)
      const lower = text.toLowerCase();
      const KEYWORD_MAP: Record<string, string> = {
        '불안': '불안/걱정', '걱정': '불안/걱정', '두려': '두려움',
        '외로': '외로움', '슬프': '슬픔', '억울': '억울함',
        '서운': '서운함', '화나': '분노', '짜증': '짜증',
        '우울': '우울', '무기력': '무기력', '상처': '상처',
        '기쁘': '기쁨', '행복': '행복', '감사': '감사',
      };
      const matched: Record<string, number> = {};
      for (const [kw, label] of Object.entries(KEYWORD_MAP)) {
        if (lower.includes(kw)) matched[label] = (matched[label] ?? 0) + 0.8;
      }
      topEmotions = Object.entries(matched)
        .map(([label, score]) => ({ label, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    }

    // ── 2. V-NEED Gap 매핑 ───────────────────────────────────────────
    const needGaps = mapToNeedGaps(topEmotions);

    // ── 3. DB 저장 (userId 있을 때만) ────────────────────────────────
    if (userId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && topEmotions.length > 0) {
      const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
        db: { schema: 'veilor' },
      });
      await sb.from('emotion_scores').insert({
        user_id:       userId,
        session_id:    sessionId ?? null,
        input_text:    text.slice(0, 500),
        top_emotions:  topEmotions,
        need_gaps:     needGaps,
        model_version: HF_API_KEY ? 'kote-kcelectra-v1' : 'keyword-fallback',
      }).then(({ error }) => {
        if (error) console.warn('emotion_scores insert error:', error.message);
      });
    }

    return new Response(JSON.stringify({ topEmotions, needGaps }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('emotion-classify error:', err);
    return new Response(JSON.stringify({ topEmotions: [], needGaps: {}, error: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
