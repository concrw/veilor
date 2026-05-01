import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { runDiagnosis, VFILE_CONTEXT_LABELS } from '@/lib/vfileAlgorithm';
import type { DiagnosisResult, VFileContext } from '@/lib/vfileAlgorithm';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { veilorDb } from '@/integrations/supabase/client';
import UpgradeModal from '@/components/premium/UpgradeModal';
import { useVeilorSubscription } from '@/hooks/useVeilorSubscription';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    subtitle: 'V-File 진단 결과',
    sidebarHeading: '당신의 관계 가면이\n이름을 얻었습니다',
    sidebarSubtext: '이 결과는 탐색의 시작입니다.\nVEILOR와 함께 더 깊이 들어가 보세요.',
    yourVFile: '당신의 V-File',
    complexSuffix: '복합형',
    radarAxes: { A: '애착', B: '소통', C: '욕구표현', D: '역할' },
    declaration: [
      '지금 보이는 것은 윤곽입니다.',
      '모든 사람에게는 보이는 얼굴과\n아직 이름 붙여지지 않은 얼굴들이 있습니다.',
      '당신에 대해 안다고 말하기엔 아직 이릅니다.\n당신 자신도 마찬가지일 수 있어요.',
      'VEILOR는 그 안으로 함께 들어갑니다.',
      '준비가 되셨다면.',
    ],
    btnStart: '여정 시작 →',
    btnDone: '결과 확인 완료',
    btnPremium: 'Premium 분석 보기',
    disclaimer: '이 결과는 자기탐색을 위한 참고 자료이며, 심리 진단이 아닙니다.\n정확한 평가를 원하시면 전문 심리상담사와 상담해 주세요.',
  },
  en: {
    subtitle: 'V-File Diagnosis Result',
    sidebarHeading: "Your relational mask\nhas been named",
    sidebarSubtext: 'This result is the beginning of exploration.\nGo deeper with VEILOR.',
    yourVFile: 'Your V-File',
    complexSuffix: 'Complex',
    radarAxes: { A: 'Attachment', B: 'Communication', C: 'Expression', D: 'Role' },
    declaration: [
      'What you see now is an outline.',
      'Everyone has a visible face\nand faces not yet named.',
      "It is too early to say we know you.\nYou yourself may feel the same.",
      'VEILOR walks with you into that space.',
      'If you are ready.',
    ],
    btnStart: 'Begin the journey →',
    btnDone: 'Done',
    btnPremium: 'View Premium analysis',
    disclaimer: 'This result is a reference for self-exploration, not a clinical diagnosis.\nFor a thorough evaluation, please consult a licensed therapist.',
  },
};

export default function PriperResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, completePriper } = useAuth();
  const { isPro } = useVeilorSubscription();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
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

    // DB 저장 (순서 보장)
    if (user) {
      (async () => {
        try {
          // 1. priper_sessions
          const { error: e1 } = await veilorDb.from('priper_sessions').insert({
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
          if (e1) console.error('[priper_sessions insert]', e1);

          // 2. cq_responses (axis 점수 + 마스크 코드)
          const cqRows = [
            { user_id: user.id, question_key: 'axis_attachment',    response_value: String(r.scores.A) },
            { user_id: user.id, question_key: 'axis_communication', response_value: String(r.scores.B) },
            { user_id: user.id, question_key: 'axis_expression',    response_value: String(r.scores.C) },
            { user_id: user.id, question_key: 'axis_role',          response_value: String(r.scores.D) },
            { user_id: user.id, question_key: 'primary_mask',       response_value: r.primary.mskCode },
            { user_id: user.id, question_key: 'vfile_context',      response_value: context },
          ];
          const { error: e2 } = await veilorDb.from('cq_responses').upsert(cqRows, { onConflict: 'user_id,question_key' });
          if (e2) console.error('[cq_responses upsert]', e2);

          // 3. persona_profiles
          const rankMap: Record<VFileContext, number> = { general: 1, social: 2, secret: 3 };
          const insightsJson = {
            summary: r.insights[0] ?? '',
            growth_edge: r.insights[1] ?? '',
            detail: r.insights[2] ?? '',
            archetype: r.primary.archetype,
            strength_score: Math.max(0, Math.round(100 - r.primaryMaskDistance / 2)),
          };
          const { error: e3 } = await veilorDb.from('persona_profiles').upsert({
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
          if (e3) console.error('[persona_profiles upsert]', e3);

          // 4. prime_perspectives (general 맥락만)
          if (context === 'general') {
            const { error: e4 } = await veilorDb.from('prime_perspectives').upsert({
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
            if (e4) console.error('[prime_perspectives upsert]', e4);
          }

          // 5. persona_contexts_completed 업데이트
          const { data: profileData } = await veilorDb
            .from('user_profiles')
            .select('persona_contexts_completed')
            .eq('user_id', user.id)
            .single();
          const existing: string[] = profileData?.persona_contexts_completed ?? [];
          if (!existing.includes(context)) {
            await veilorDb.from('user_profiles').update({
              persona_contexts_completed: [...existing, context],
            }).eq('user_id', user.id);
          }
        } catch (err) {
          console.error('[VFileResult save error]', err);
        }
      })();
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1C1917' }}>
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid #D4A574', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const radarData = [
    { axis: s.radarAxes.A, value: result.scores.A },
    { axis: s.radarAxes.B, value: result.scores.B },
    { axis: s.radarAxes.C, value: result.scores.C },
    { axis: s.radarAxes.D, value: result.scores.D },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}>
      {/* 좌측 브랜드 패널 — PC 전용 */}
      <div className="hidden lg:flex flex-col justify-between flex-1 px-16 py-14" style={{ borderRight: '1px solid #2A2624' }}>
        <div>
          <h1 className="text-4xl font-bold tracking-widest mb-3" style={{ color: '#D4A574', letterSpacing: '0.2em' }}>VEILOR</h1>
          <p className="text-base font-light" style={{ color: '#A8A29E' }}>{s.subtitle}</p>
        </div>
        <div className="space-y-4">
          <p className="text-2xl font-light leading-snug" style={{ color: '#F5F5F4' }}>
            {s.sidebarHeading.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#78716C' }}>
            {s.sidebarSubtext.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
          </p>
        </div>
        <p className="text-xs" style={{ color: '#44403C' }}>© 2026 VEILOR</p>
      </div>

      {/* 우측 결과 영역 */}
      <div className="flex flex-col flex-1 lg:flex-none lg:w-[520px] overflow-y-auto px-6 py-10">
      <div className="max-w-sm w-full mx-auto space-y-8">
        {/* 가면 공개 */}
        <div className={`text-center space-y-2 transition-all duration-700 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: result.primary.color + '20', border: `1px solid ${result.primary.color}40` }}>
            🎭
          </div>
          <p className="text-xs uppercase tracking-widest" style={{ color: '#A8A29E' }}>
            {context !== 'general' ? `${contextLabel.icon} ${contextLabel.ko}` : s.yourVFile}
          </p>
          <h1 className="text-3xl font-bold" style={{ color: result.primary.color }}>
            {result.primary.nameKo}
          </h1>
          <p className="text-sm" style={{ color: '#A8A29E' }}>{result.primary.archetype}</p>
          {result.isComplex && (
            <p className="text-xs" style={{ color: '#A8A29E' }}>
              + <span style={{ color: result.secondary.color }}>{result.secondary.nameKo}</span> {s.complexSuffix}
            </p>
          )}
        </div>

        {/* 레이더 차트 */}
        <div className={`transition-all duration-700 delay-300 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#44403C" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: '#A8A29E' }} />
              <Radar dataKey="value" fill={result.primary.color} fillOpacity={0.3}
                stroke={result.primary.color} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 설명 */}
        <div className={`space-y-4 transition-all duration-700 delay-500 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-sm leading-relaxed" style={{ color: '#A8A29E' }}>{result.primary.description}</p>

          {/* 인사이트 */}
          <div className="space-y-2">
            {result.insights.map((insight, i) => (
              <div
                key={i}
                className="rounded-xl p-3 text-xs leading-relaxed"
                style={{ background: '#292524', border: '1px solid #44403C', color: '#F5F5F4' }}
              >
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
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem', fontWeight: 300, color: '#F5F5F4', lineHeight: 1.6 }}>
              {s.declaration[0]}
            </p>
            <p style={{ fontSize: '0.8rem', fontWeight: 300, color: '#A8A29E', lineHeight: 1.8 }}>
              {s.declaration[1].split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
            </p>
            <p style={{ fontSize: '0.8rem', fontWeight: 300, color: '#A8A29E', lineHeight: 1.8 }}>
              {s.declaration[2].split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
            </p>
            <p style={{ fontSize: '0.8rem', fontWeight: 300, color: '#A8A29E', lineHeight: 1.8 }}>
              {s.declaration[3]}
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', fontWeight: 300, color: result.primary.color, lineHeight: 1.6, paddingTop: '2px' }}>
              {s.declaration[4]}
            </p>
          </div>
        </div>

        <button
          onClick={handleEnter}
          className="w-full h-12 text-base rounded-xl font-medium transition-opacity"
          style={{ background: '#D4A574', color: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}
        >
          {isOnboarding ? s.btnStart : s.btnDone}
        </button>

        {!isPro && (
          <button
            onClick={() => setPaywallOpen(true)}
            className="w-full text-xs underline underline-offset-2 py-1"
            style={{ color: '#A8A29E' }}
          >
            {s.btnPremium}
          </button>
        )}

        <p className="text-[10px] leading-relaxed text-center px-2" style={{ color: '#57534E' }}>
          {s.disclaimer.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && ' '}</span>)}
        </p>
      </div>

      <UpgradeModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        trigger={isOnboarding ? 'onboarding_complete' : 'priper_result'}
      />
      </div>
    </div>
  );
}
