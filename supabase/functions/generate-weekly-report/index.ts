import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// 주간 리포트 생성 Edge Function
// 역할: 유저의 이번 주 신호(user_signals)를 집계하고 Claude로 인사이트 생성
// 저장: user_psych_map_snapshots (snapshot_type='weekly')

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

import { getCorsHeaders } from "../_shared/cors.ts";

async function dbQuery(query: string, method = 'GET', body?: string) {
  const url = `${SUPABASE_URL}/rest/v1/${query}`;
  const res = await fetch(url, {
    method,
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Accept-Profile': 'veilrum',
      'Content-Profile': 'veilrum',
      'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal',
    },
    ...(body ? { body } : {}),
  });
  if (!res.ok) throw new Error(`DB 오류: ${await res.text()}`);
  return method === 'GET' ? res.json() : null;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    if (!userId) throw new Error('userId 필수');

    // 이번 주 월요일 기준
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    const weekStart = monday.toISOString();

    // 이번 주 신호 조회
    const signals = await dbQuery(
      `user_signals?user_id=eq.${userId}&created_at=gte.${weekStart}&order=created_at.asc&limit=100`
    );

    if (!signals || signals.length === 0) {
      return new Response(JSON.stringify({
        ok: true,
        report: null,
        reason: '이번 주 수집된 신호가 없습니다.',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 신호 집계
    const emotionCounts: Record<string, number> = {};
    const domainCounts: Record<string, number> = {};
    const signalTypes: Record<string, number> = {};
    const contents: string[] = [];

    for (const s of signals) {
      if (s.emotion) emotionCounts[s.emotion] = (emotionCounts[s.emotion] ?? 0) + 1;
      if (s.domain) domainCounts[s.domain] = (domainCounts[s.domain] ?? 0) + 1;
      signalTypes[s.signal_type] = (signalTypes[s.signal_type] ?? 0) + 1;
      if (s.content) contents.push(s.content.slice(0, 200));
    }

    const topEmotions = Object.entries(emotionCounts).sort(([,a],[,b]) => b - a).slice(0, 3);
    const topDomains = Object.entries(domainCounts).sort(([,a],[,b]) => b - a).slice(0, 3);

    // Claude로 주간 인사이트 생성
    const prompt = `당신은 관계 심리 분석가입니다. 아래는 이번 주 사용자의 관계 신호 데이터입니다.

## 이번 주 신호 요약
- 총 신호 수: ${signals.length}건
- 탭별: ${Object.entries(signalTypes).map(([k,v]) => `${k}=${v}`).join(', ')}
- 주요 감정: ${topEmotions.map(([e,c]) => `${e}(${c}회)`).join(', ') || '없음'}
- 반복 도메인: ${topDomains.map(([d,c]) => `${d}(${c}회)`).join(', ') || '없음'}

## 대표 신호 내용 (최대 5개)
${contents.slice(0, 5).map((c, i) => `${i+1}. ${c}`).join('\n')}

## 요청
1. 이번 주 관계 패턴 요약 (2-3문장)
2. 발견된 핵심 패턴 3개 (각 1문장)
3. 아직 해결되지 않은 갈등 1개 (1문장)
4. 격려 메시지 (1문장)

JSON으로 답하세요:
{"summary": "...", "patterns": ["...", "...", "..."], "unresolved": "...", "encouragement": "..."}`;

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    let reportData = { summary: '', patterns: [] as string[], unresolved: '', encouragement: '' };
    if (aiRes.ok) {
      const aiBody = await aiRes.json();
      const raw = aiBody.content?.[0]?.text ?? '{}';
      try { reportData = JSON.parse(raw); } catch { /* fallback */ }
    }

    // user_psych_map_snapshots에 저장
    const snapshotDate = now.toISOString().slice(0, 10);
    await dbQuery('user_psych_map_snapshots', 'POST', JSON.stringify({
      user_id: userId,
      snapshot_date: snapshotDate,
      snapshot_type: 'weekly',
      top_patterns: reportData.patterns.map(p => ({ summary: p })),
      unresolved_conflicts: reportData.unresolved ? [{ description: reportData.unresolved }] : [],
      top_entities: topEmotions.map(([e, c]) => ({ label: e, count: c })),
      current_goals: reportData.encouragement ? [{ text: reportData.encouragement }] : [],
      confidence_bands: {
        signal_count: signals.length,
        emotion_diversity: Object.keys(emotionCounts).length,
        domain_diversity: Object.keys(domainCounts).length,
      },
    }));

    return new Response(JSON.stringify({
      ok: true,
      report: {
        weekOf: snapshotDate,
        signalCount: signals.length,
        topEmotions,
        topDomains,
        ...reportData,
      },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[generate-weekly-report]', msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
