/**
 * emotion-anomaly — 감정 시계열 이상 감지
 *
 * Phase 2: Deno Edge Function에서 이동평균 + Z-score 기반 이상 감지
 * Phase 3: PROPHET_API_URL 환경변수 설정 시 FastAPI(Fly.io) Prophet 서버로 위임
 *
 * 흐름:
 *   1. 최근 14일 emotion_scores 집계 (일별 평균 valence 점수)
 *   2. Prophet 서버 있으면 위임, 없으면 Z-score 폴백
 *   3. 급락 감지(2주 추세 vs 최근 3일 평균) → crisis_logs에 기록
 *   4. 이상 감지 결과 반환
 *
 * 호출: pg_cron 일별 배치 (00:00 KST)
 *
 * 환경변수:
 *   PROPHET_API_URL  — FastAPI 서버 URL (선택, 없으면 폴백 사용)
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const PROPHET_API_URL         = Deno.env.get('PROPHET_API_URL') ?? '';
const SUPABASE_URL            = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// 감정 레이블 → valence 점수 매핑 (-1 ~ +1)
// 부정 감정: 낮은 값, 긍정 감정: 높은 값
const EMOTION_VALENCE: Record<string, number> = {
  '불안/걱정': -0.7, '불안함': -0.7, '걱정': -0.6, '두려움': -0.8,
  '외로움': -0.6,  '슬픔': -0.7,   '억울함': -0.65, '서운함': -0.5,
  '분노': -0.8,    '화남': -0.8,   '짜증': -0.5,    '수치/창피': -0.7,
  '죄책감': -0.65, '우울': -0.85,  '실망': -0.6,    '무기력': -0.75,
  '상처': -0.7,    '당혹감': -0.5, '혐오': -0.75,   '부러움': -0.3,
  '기쁨': +0.9,    '행복': +0.95,  '사랑': +0.9,    '감사': +0.85,
  '설렘': +0.8,    '편안': +0.7,
};

interface DailyScore {
  date: string;   // YYYY-MM-DD
  value: number;  // 평균 valence (-1 ~ +1)
  count: number;
}

interface AnomalyResult {
  userId: string;
  anomalyDetected: boolean;
  severity: 'none' | 'mild' | 'severe';
  recentAvg: number;
  baselineAvg: number;
  dropPercent: number;
  method: 'prophet' | 'zscore' | 'none';
  dailyScores: DailyScore[];
}

function computeZScore(values: number[]): { mean: number; std: number; zScores: number[] } {
  if (values.length === 0) return { mean: 0, std: 0, zScores: [] };
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);
  const zScores = values.map(v => std > 0 ? (v - mean) / std : 0);
  return { mean, std, zScores };
}

async function detectWithProphet(
  dailyScores: DailyScore[],
  userId: string,
): Promise<{ anomaly: boolean; severity: 'none' | 'mild' | 'severe' } | null> {
  if (!PROPHET_API_URL) return null;
  try {
    const resp = await fetch(`${PROPHET_API_URL}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, series: dailyScores }),
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return null;
    const data = await resp.json() as { anomaly?: boolean; severity?: string };
    return {
      anomaly: data.anomaly ?? false,
      severity: (data.severity as 'none' | 'mild' | 'severe') ?? 'none',
    };
  } catch {
    return null;
  }
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  // 서비스 롤 전용
  const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
  if (token !== SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'veilor' },
  });

  const body = await req.json().catch(() => ({}));
  // userId 지정 시 단일 사용자, 없으면 최근 7일 활성 사용자 전체 배치
  const targetUserId = body.userId as string | undefined;

  // 최근 14일 활성 사용자 또는 단일 사용자 조회
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const query = sb
    .from('emotion_scores')
    .select('user_id, top_emotions, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: true });

  if (targetUserId) query.eq('user_id', targetUserId);
  else query.limit(5000);

  const { data: rows, error } = await query;
  if (error || !rows?.length) {
    return new Response(JSON.stringify({ processed: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 사용자별 일별 valence 집계
  const userDays: Map<string, Map<string, number[]>> = new Map();
  for (const row of rows) {
    const userId = row.user_id as string;
    const date = (row.created_at as string).slice(0, 10);
    const emotions = (row.top_emotions as Array<{ label: string; score: number }>) ?? [];

    let valence = 0;
    let weight  = 0;
    for (const { label, score } of emotions) {
      const v = EMOTION_VALENCE[label];
      if (v !== undefined) { valence += v * score; weight += score; }
    }
    const dayVal = weight > 0 ? valence / weight : 0;

    if (!userDays.has(userId)) userDays.set(userId, new Map());
    const dayMap = userDays.get(userId)!;
    if (!dayMap.has(date)) dayMap.set(date, []);
    dayMap.get(date)!.push(dayVal);
  }

  const results: AnomalyResult[] = [];

  for (const [userId, dayMap] of userDays) {
    const dailyScores: DailyScore[] = Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({
        date,
        value: vals.reduce((s, v) => s + v, 0) / vals.length,
        count: vals.length,
      }));

    if (dailyScores.length < 3) continue;

    // Prophet 시도 → 실패 시 Z-score 폴백
    const prophetResult = await detectWithProphet(dailyScores, userId);

    let anomalyDetected = false;
    let severity: 'none' | 'mild' | 'severe' = 'none';
    let method: 'prophet' | 'zscore' = 'zscore';

    const allValues = dailyScores.map(d => d.value);
    const recentValues  = allValues.slice(-3);
    const baselineValues = allValues.slice(0, -3);
    const recentAvg  = recentValues.reduce((s, v) => s + v, 0) / recentValues.length;
    const baselineAvg = baselineValues.length > 0
      ? baselineValues.reduce((s, v) => s + v, 0) / baselineValues.length
      : recentAvg;
    const dropPercent = baselineAvg !== 0
      ? ((baselineAvg - recentAvg) / Math.abs(baselineAvg)) * 100
      : 0;

    if (prophetResult) {
      anomalyDetected = prophetResult.anomaly;
      severity = prophetResult.severity;
      method = 'prophet';
    } else {
      // Z-score: 최근 3일 평균이 전체 Z-score -1.5 이하
      const { mean, std } = computeZScore(allValues);
      const recentZ = std > 0 ? (recentAvg - mean) / std : 0;
      if (recentZ <= -2.0) { anomalyDetected = true; severity = 'severe'; }
      else if (recentZ <= -1.5) { anomalyDetected = true; severity = 'mild'; }
      // 또는 2주 대비 최근 3일 급락 30% 이상
      if (!anomalyDetected && dropPercent >= 30) {
        anomalyDetected = true;
        severity = dropPercent >= 50 ? 'severe' : 'mild';
      }
    }

    results.push({ userId, anomalyDetected, severity, recentAvg, baselineAvg, dropPercent, method, dailyScores });

    // 이상 감지 시 crisis_logs에 기록
    if (anomalyDetected) {
      await sb.from('crisis_logs').insert({
        user_id:       userId,
        crisis_level:  severity === 'severe' ? 'high' : 'none',
        trigger_text:  `감정 시계열 이상 감지 (${method}): 최근 3일 평균 ${recentAvg.toFixed(2)}, 기준 ${baselineAvg.toFixed(2)}, 급락 ${dropPercent.toFixed(0)}%`,
        detected_at:   new Date().toISOString(),
        metadata:      { anomalyType: 'emotion_trend', severity, dropPercent },
      }).then(({ error: e }) => {
        if (e) console.warn('crisis_logs insert:', e.message);
      });
    }
  }

  const anomalyCount = results.filter(r => r.anomalyDetected).length;
  return new Response(JSON.stringify({
    processed: results.length,
    anomalies: anomalyCount,
    results: targetUserId ? results : results.filter(r => r.anomalyDetected),
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
