import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { runDiagnosis, VFILE_CONTEXT_LABELS } from '@/lib/vfileAlgorithm';
import type { DiagnosisResult, VFileContext } from '@/lib/vfileAlgorithm';
import { Button } from '@/components/ui/button';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { veilorDb } from '@/integrations/supabase/client';
import UpgradeModal from '@/components/premium/UpgradeModal';
import { useVeilorSubscription } from '@/hooks/useVeilorSubscription';

export default function PriperResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, completePriper } = useAuth();
  const { isPro } = useVeilorSubscription();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const stateData = location.state as { responses?: Record<string, string>; context?: VFileContext } | null;
  const context: VFileContext = stateData?.context ?? 'general';
  const contextLabel = VFILE_CONTEXT_LABELS[context];

  useEffect(() => {
    const responses = stateData?.responses;
    if (!responses) { navigate('/onboarding/vfile/questions', { replace: true }); return; }

    const r = runDiagnosis(responses, context);
    setResult(r);

    // DB 저장
    if (user) {
      veilorDb.from('priper_sessions').insert({
        user_id: user.id,
        responses,
        axis_scores: r.scores,
        primary_mask: r.primary.nameKo,
        secondary_mask: r.secondary.nameKo,
        msk_code: r.primary.mskCode,
        insights: r.insights,
        is_completed: true,
        completed_at: new Date().toISOString(),
        data_source: 'priper',
        context,
      });

      // V-File 40문항 응답 → cq_responses 저장 (개인화 피드 기반 데이터)
      const cqRows = [
        { user_id: user.id, question_key: 'axis_attachment',    response_value: String(r.scores.A) },
        { user_id: user.id, question_key: 'axis_communication', response_value: String(r.scores.B) },
        { user_id: user.id, question_key: 'axis_expression',    response_value: String(r.scores.C) },
        { user_id: user.id, question_key: 'axis_role',          response_value: String(r.scores.D) },
        { user_id: user.id, question_key: 'primary_mask',       response_value: r.primary.mskCode },
        { user_id: user.id, question_key: 'vfile_context',      response_value: context },
      ];
      veilorDb.from('cq_responses').upsert(cqRows, { onConflict: 'user_id,question_key' })
        .then(({ error }) => { if (error) console.error('[cq_responses upsert]', error); });

      // persona_profiles에 맥락별 페르소나 저장 (upsert)
      const rankMap: Record<VFileContext, number> = { general: 1, social: 2, secret: 3 };
      // insights를 detect-personas와 동일한 JSON 구조로 저장
      // (archetype, strength_score 포함해야 멀티 페르소나 뷰에서 일관성 유지됨)
      const insightsJson = {
        summary: r.insights[0] ?? '',
        growth_edge: r.insights[1] ?? '',
        detail: r.insights[2] ?? '',
        archetype: r.primary.archetype,
        strength_score: Math.max(0, Math.round(100 - r.primaryMaskDistance / 2)),
      };
      veilorDb.from('persona_profiles').upsert({
        user_id: user.id,
        vfile_context: context,
        msk_code: r.primary.mskCode,
        primary_mask: r.primary.nameKo,
        secondary_mask: r.secondary.nameKo,
        axis_scores: r.scores,
        is_complex: r.isComplex,
        insights: insightsJson,
        persona_name: contextLabel.ko,
        color_hex: r.primary.color,
        rank_order: rankMap[context],
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,rank_order' });

      // general 맥락일 때만 prime_perspectives 업데이트
      if (context === 'general') {
        veilorDb.from('prime_perspectives').upsert({
          user_id: user.id,
          version: 1,
          attachment_type: r.primary.id,
          persona_type: r.primary.nameKo,
          confidence_score: Math.round(100 - (r.primary.scores.A - r.scores.A) ** 2 / 100),
          data_source: 'priper',
          is_complete: false,
          signal_count: 0,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      }

      // 완료된 맥락 목록 업데이트
      veilorDb.rpc('array_append_unique', {
        p_user_id: user.id,
        p_context: context,
      }).then(() => {}).catch(() => {
        // RPC가 없을 수 있음 — fallback: 직접 업데이트
        veilorDb.from('user_profiles')
          .select('persona_contexts_completed')
          .eq('user_id', user.id)
          .single()
          .then(({ data }) => {
            const existing: string[] = data?.persona_contexts_completed ?? [];
            if (!existing.includes(context)) {
              veilorDb.from('user_profiles').update({
                persona_contexts_completed: [...existing, context],
              }).eq('user_id', user.id);
            }
          });
      });
    }

    // 가면 공개 → 온보딩 완료 시 페이월 모달 (무료 유저 + general 맥락만)
    setTimeout(() => setRevealed(true), 800);
    const isOnboardingContext = (stateData?.context ?? 'general') === 'general' && !stateData?.fromGet;
    if (!isPro && isOnboardingContext) {
      setTimeout(() => setPaywallOpen(true), 3000);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const qc = useQueryClient();
  const isOnboarding = context === 'general' && !location.state?.fromGet;

  const handleEnter = async () => {
    if (!result) return;
    if (isOnboarding) {
      await completePriper(result.primary.nameKo, result.secondary.nameKo, result.scores, result.primary.mskCode);
    }
    // V-File 완료 후 관련 캐시 갱신
    qc.invalidateQueries({ queryKey: ['prime-perspective'] });
    qc.invalidateQueries({ queryKey: ['me-diagnosis'] });
    qc.invalidateQueries({ queryKey: ['me-radar'] });
    qc.invalidateQueries({ queryKey: ['persona-profiles'] });
    navigate(isOnboarding ? '/home' : '/home/get');
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const radarData = [
    { axis: '애착', value: result.scores.A },
    { axis: '소통', value: result.scores.B },
    { axis: '욕구표현', value: result.scores.C },
    { axis: '역할', value: result.scores.D },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-10">
      <div className="max-w-sm w-full mx-auto space-y-8">
        {/* 가면 공개 */}
        <div className={`text-center space-y-2 transition-all duration-700 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: result.primary.color + '20' }}>
            🎭
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            {context !== 'general' ? `${contextLabel.icon} ${contextLabel.ko}` : '당신의 V-File'}
          </p>
          <h1 className="text-3xl font-bold" style={{ color: result.primary.color }}>
            {result.primary.nameKo}
          </h1>
          <p className="text-sm text-muted-foreground">{result.primary.archetype}</p>
          {result.isComplex && (
            <p className="text-xs text-muted-foreground">
              + <span style={{ color: result.secondary.color }}>{result.secondary.nameKo}</span> 복합형
            </p>
          )}
        </div>

        {/* 레이더 차트 */}
        <div className={`transition-all duration-700 delay-300 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12 }} />
              <Radar dataKey="value" fill={result.primary.color} fillOpacity={0.3}
                stroke={result.primary.color} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 설명 */}
        <div className={`space-y-4 transition-all duration-700 delay-500 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-sm leading-relaxed text-muted-foreground">{result.primary.description}</p>

          {/* 인사이트 */}
          <div className="space-y-2">
            {result.insights.map((insight, i) => (
              <div key={i} className="bg-card border rounded-xl p-3 text-xs leading-relaxed">
                {insight}
              </div>
            ))}
          </div>
        </div>

        {/* VEILOR 여정 선언 */}
        <div className={`transition-all duration-700 delay-700 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
          <div
            className="rounded-2xl px-5 py-6 space-y-4"
            style={{
              background: `linear-gradient(135deg, ${result.primary.color}08, transparent)`,
              border: `1px solid ${result.primary.color}22`,
            }}
          >
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem', fontWeight: 300, color: 'var(--foreground)', lineHeight: 1.6 }}>
              지금 보이는 것은 윤곽입니다.
            </p>
            <p style={{ fontSize: '0.8rem', fontWeight: 300, color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
              모든 사람에게는 보이는 얼굴과<br />
              아직 이름 붙여지지 않은 얼굴들이 있습니다.
            </p>
            <p style={{ fontSize: '0.8rem', fontWeight: 300, color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
              당신에 대해 안다고 말하기엔 아직 이릅니다.<br />
              당신 자신도 마찬가지일 수 있어요.
            </p>
            <p style={{ fontSize: '0.8rem', fontWeight: 300, color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
              VEILOR는 그 안으로 함께 들어갑니다.
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', fontWeight: 300, color: result.primary.color, lineHeight: 1.6, paddingTop: '2px' }}>
              준비가 되셨다면.
            </p>
          </div>
        </div>

        <Button className="w-full h-12 text-base" onClick={handleEnter}>
          {isOnboarding ? '여정 시작 →' : '결과 확인 완료'}
        </Button>

        {!isPro && (
          <button
            onClick={() => setPaywallOpen(true)}
            className="w-full text-xs text-muted-foreground underline underline-offset-2 py-1"
          >
            Premium 분석 보기
          </button>
        )}

        <p className="text-[10px] text-muted-foreground/50 leading-relaxed text-center px-2">
          이 결과는 자기탐색을 위한 참고 자료이며, 심리 진단이 아닙니다.
          정확한 평가를 원하시면 전문 심리상담사와 상담해 주세요.
        </p>
      </div>

      <UpgradeModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        trigger={isOnboarding ? 'onboarding_complete' : 'priper_result'}
      />
    </div>
  );
}
