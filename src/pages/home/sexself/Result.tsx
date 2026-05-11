// SexSelf — 성적 자아 진단 결과 페이지
// psychology.attachment_style + core_wound 연동으로 개인화 인사이트 제공

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { runSexSelfDiagnosis } from '@/lib/sexSelfAlgorithm';
import type { SexSelfResult } from '@/lib/sexSelfAlgorithm';
import { computeKinkLanguage } from '@/lib/kinkLanguageAlgorithm';
import type { KinkLanguageResult } from '@/lib/kinkLanguageAlgorithm';
import KinkLanguageSection from '@/components/sexself/KinkLanguageSection';
import { veilorDb } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { C, alpha } from '@/lib/colors';
import { useLanguageContext } from '@/context/LanguageContext';
import { useT } from '@/i18n/useT';

export default function SexSelfResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { language } = useLanguageContext();
  const t = useT();
  const s = t.sexSelfResult;

  const [result, setResult] = useState<SexSelfResult | null>(null);
  const [kinkResult, setKinkResult] = useState<KinkLanguageResult | null>(null);
  const [revealed, setRevealed] = useState(false);

  const stateData = location.state as { responses?: Record<string, string> } | null;

  useEffect(() => {
    const responses = stateData?.responses;
    if (!responses) {
      navigate('/home/sexself/questions', { replace: true });
      return;
    }
    const runDiagnosis = async () => {
      // psychology 컬럼에서 attachment_style + core_wound 로드 (개인화 인사이트)
      let attachmentStyle: string | undefined;
      let coreWound: string | undefined;

      if (user) {
        const { data } = await veilorDb
          .from('virtual_user_profiles')
          .select('character_id')
          .eq('user_id', user.id)
          .maybeSingle();

        // 실제 user_profiles에서 psychology 로드 — characters_core FK 없을 시 fallback
        const { data: profile } = await veilorDb
          .from('user_profiles')
          .select('prime_perspectives')
          .eq('user_id', user.id)
          .maybeSingle();

        // prime_perspectives → attachment_type으로 attachment 유추
        const pp = profile?.prime_perspectives as Record<string, unknown> | null;
        if (pp?.attachment_type) {
          attachmentStyle = String(pp.attachment_type);
        }

        void data; // character_id는 향후 사용 예정
      }

      const r = runSexSelfDiagnosis(responses, attachmentStyle, coreWound);
      setResult(r);
      const kr = computeKinkLanguage(r.scores, r.profileType, language === 'en' ? 'en' : 'ko');
      setKinkResult(kr);

      // DB 저장 — user_signals에 sexself 완료 신호 저장
      if (user) {
        await veilorDb.from('user_signals').insert({
          user_id: user.id,
          signal_type: 'set',
          content: JSON.stringify({
            type: 'sexself_completed',
            profile_type: r.profileType,
            scores: r.scores,
          }),
          created_at: new Date().toISOString(),
        }).then(({ error }) => {
          if (error) console.error('[sexself signal]', error);
        });

        // cq_responses에 SexSelf 축 점수 저장 (개인화 피드 기반)
        const cqRows = [
          { user_id: user.id, question_key: 'sexself_des', response_value: String(r.scores.DES) },
          { user_id: user.id, question_key: 'sexself_sha', response_value: String(r.scores.SHA) },
          { user_id: user.id, question_key: 'sexself_pwr', response_value: String(r.scores.PWR) },
          { user_id: user.id, question_key: 'sexself_bdy', response_value: String(r.scores.BDY) },
          { user_id: user.id, question_key: 'sexself_his', response_value: String(r.scores.HIS) },
          { user_id: user.id, question_key: 'sexself_fan', response_value: String(r.scores.FAN) },
          { user_id: user.id, question_key: 'sexself_con', response_value: String(r.scores.CON) },
          { user_id: user.id, question_key: 'sexself_profile', response_value: r.profileType },
          // PWR S/P 하위 유형 (McClelland 사회화/개인화 분기)
          { user_id: user.id, question_key: 'sexself_pwr_subtype', response_value: r.pwrAnalysis.subtype },
          { user_id: user.id, question_key: 'sexself_pwr_sscore', response_value: String(r.pwrAnalysis.sScore) },
          // KinkLanguage SEX 3축 + 역할/강도/SHA 하위 유형
          { user_id: user.id, question_key: 'sexself_sex_leading', response_value: String(kr.sexAxes.leading) },
          { user_id: user.id, question_key: 'sexself_sex_expressiveness', response_value: String(kr.sexAxes.expressiveness) },
          { user_id: user.id, question_key: 'sexself_sex_intensity', response_value: String(kr.sexAxes.intensity) },
          { user_id: user.id, question_key: 'sexself_kink_role', response_value: kr.roleLabel },
          { user_id: user.id, question_key: 'sexself_kink_intensity', response_value: kr.intensityLabel },
          { user_id: user.id, question_key: 'sexself_sha_subtype', response_value: kr.shaSubtype },
        ];
        await veilorDb.from('cq_responses')
          .upsert(cqRows, { onConflict: 'user_id,question_key' })
          .then(({ error }) => { if (error) console.error('[cq_responses sexself]', error); });

        // ── 페르소나 모순 감지 엔진 실행 (DB RPC) ────────────────
        await veilorDb.rpc('detect_persona_fragments', { p_user_id: user.id });

        // 페르소나 조각 발견 시 ME탭 캐시 무효화
        qc.invalidateQueries({ queryKey: ['me-persona-fragments'] });
      }

      setTimeout(() => setRevealed(true), 600);
    };

    runDiagnosis();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDone = () => {
    qc.invalidateQueries({ queryKey: ['me-radar'] });
    qc.invalidateQueries({ queryKey: ['me-diagnosis'] });
    navigate('/home/set', { replace: true });
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${C.amber} transparent ${C.amber} ${C.amber}` }} />
      </div>
    );
  }

  const profileColor = result.profile.color;

  return (
    <div className="min-h-screen flex flex-col px-6 py-10" style={{ background: C.bg }}>
      <div className="max-w-2xl w-full mx-auto space-y-8">

        {/* 프로파일 공개 */}
        <div
          className={`text-center space-y-2 transition-all duration-700 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl"
            style={{ background: alpha(profileColor, 0.12) }}
          >
            🌸
          </div>
          <p className="text-xs uppercase tracking-widest" style={{ color: C.text4 }}>
            {s.profileLabel}
          </p>
          <h1 className="text-3xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: profileColor }}>
            {result.profile.nameKo}
          </h1>
          <p className="text-sm" style={{ color: C.text4 }}>{result.profile.tagline}</p>
        </div>

        {/* 레이더 차트 */}
        <div className={`transition-all duration-700 delay-300 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={result.radarData}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fontSize: 11, fill: C.text4 }}
              />
              <Radar
                dataKey="value"
                fill={profileColor}
                fillOpacity={0.25}
                stroke={profileColor}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>

          {/* 축 점수 요약 */}
          <div className="grid grid-cols-4 gap-1 mt-2">
            {[
              { label: s.scoreLabels[0], value: result.scores.DES, color: '#10b981' },
              { label: s.scoreLabels[1], value: result.scores.SHA, color: '#ec4899' },
              { label: s.scoreLabels[2], value: result.scores.PWR, color: '#f59e0b' },
              { label: s.scoreLabels[3], value: result.scores.BDY, color: '#3b82f6' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className="text-[10px] mb-1" style={{ color: C.text4 }}>{label}</div>
                <div className="text-sm font-medium" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 인사이트 카드 */}
        <div className={`space-y-3 transition-all duration-700 delay-500 ${revealed ? 'opacity-100' : 'opacity-0'}`}>

          {/* 핵심 인사이트 (1번) */}
          <div
            className="rounded-xl p-4"
            style={{ background: alpha(profileColor, 0.06), border: `1px solid ${alpha(profileColor, 0.2)}` }}
          >
            <p className="text-xs font-medium mb-1.5" style={{ color: profileColor }}>{s.insightLabels[0]}</p>
            <p className="text-sm font-light leading-relaxed" style={{ color: C.text }}>
              {result.insights[0]}
            </p>
          </div>

          {/* 억제 + 수치심 분석 (2번) */}
          <div
            className="rounded-xl p-4"
            style={{ background: C.bg2, border: `1px solid ${C.border}` }}
          >
            <p className="text-xs font-medium mb-1.5" style={{ color: C.text4 }}>{s.insightLabels[1]}</p>
            <p className="text-xs font-light leading-relaxed" style={{ color: C.text2 }}>
              {result.insights[1]}
            </p>
          </div>

          {/* 표현 능력 (3번) */}
          <div
            className="rounded-xl p-4"
            style={{ background: C.bg2, border: `1px solid ${C.border}` }}
          >
            <p className="text-xs font-medium mb-1.5" style={{ color: C.text4 }}>{s.insightLabels[2]}</p>
            <p className="text-xs font-light leading-relaxed" style={{ color: C.text2 }}>
              {result.insights[2]}
            </p>
          </div>

          {/* 심리 연결 또는 원인 탐색 (4번) */}
          <div
            className="rounded-xl p-4"
            style={{ background: C.bg2, border: `1px solid ${C.border}` }}
          >
            <p className="text-xs font-medium mb-1.5" style={{ color: C.text4 }}>{s.insightLabels[3]}</p>
            <p className="text-xs font-light leading-relaxed" style={{ color: C.text2 }}>
              {result.insights[3]}
            </p>
          </div>

          {/* 성장 과제 (5번) */}
          <div
            className="rounded-xl p-4"
            style={{ background: alpha(profileColor, 0.04), border: `1px solid ${alpha(profileColor, 0.15)}` }}
          >
            <p className="text-xs font-medium mb-1.5" style={{ color: profileColor }}>{s.insightLabels[4]}</p>
            <p className="text-xs font-light leading-relaxed" style={{ color: C.text }}>
              {result.insights[4]}
            </p>
          </div>
        </div>

        {/* 억제 요인 태그 */}
        {result.profile.brakeFactors.length > 0 && (
          <div className={`transition-all duration-700 delay-700 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-[10px] mb-2" style={{ color: C.text4 }}>{s.brakeTitle}</p>
            <div className="flex flex-wrap gap-2">
              {result.profile.brakeFactors.map((factor) => (
                <span
                  key={factor}
                  className="text-[10px] px-2.5 py-1 rounded-full"
                  style={{ background: alpha('#ef4444', 0.08), color: '#ef4444' }}
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 나의 성적 언어 섹션 */}
        {kinkResult && (
          <div className={`transition-all duration-700 delay-700 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
            <KinkLanguageSection kinkResult={kinkResult} sha={result.scores.SHA} />
          </div>
        )}

        {/* ANXIETY_FROZEN 전용 안전 메시지 + 전문 상담 안내 */}
        {result.profileType === 'ANXIETY_FROZEN' && (
          <div className={`space-y-3 transition-all duration-700 delay-700 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
            {/* 안전 메시지 카드 */}
            <div
              className="rounded-xl p-4"
              style={{ background: alpha('#64748b', 0.08), border: `1px solid ${alpha('#64748b', 0.25)}` }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>{s.anxietyFrozenSafeTitle}</p>
              <p className="text-sm font-light leading-relaxed" style={{ color: C.text }}>
                {s.anxietyFrozenSafeBody.split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </p>
            </div>
            {/* 전문 상담 안내 카드 */}
            <div
              className="rounded-xl p-4"
              style={{ background: alpha('#3b82f6', 0.06), border: `1px solid ${alpha('#3b82f6', 0.2)}` }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: '#60a5fa' }}>{s.anxietyFrozenCounselTitle}</p>
              <p className="text-xs font-light leading-relaxed" style={{ color: C.text2 }}>
                {s.anxietyFrozenCounselBody.split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </p>
              <p className="text-[10px] mt-2" style={{ color: alpha('#60a5fa', 0.7) }}>
                {s.crisisHotline}
              </p>
            </div>
          </div>
        )}

        {/* NeedAssessment 진입 — ANXIETY_FROZEN 제외 */}
        {result.profileType !== 'ANXIETY_FROZEN' && (
          <button
            onClick={() => navigate('/home/sexself/need-assessment')}
            className="w-full rounded-xl p-4 text-left"
            style={{ background: alpha(profileColor, 0.06), border: `1px solid ${alpha(profileColor, 0.2)}` }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: profileColor }}>
              {s.needAssessmentTitle}
            </p>
            <p className="text-[10px]" style={{ color: C.text4 }}>
              {s.needAssessmentSub}
            </p>
          </button>
        )}

        {/* 결과 후 Vent 연결 — 감정이 올라왔을 때 받아줄 공간 */}
        <button
          onClick={() => navigate('/home/vent', { state: { prefillText: '' } })}
          className="w-full rounded-xl p-4 text-left"
          style={{ background: 'transparent', border: `1px solid ${alpha(C.amber, 0.2)}` }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: C.amber }}>
            {s.ventTitle}
          </p>
          <p className="text-[10px]" style={{ color: C.text4 }}>
            {s.ventSub}
          </p>
        </button>

        <Button
          className="w-full h-12 text-base"
          onClick={handleDone}
          style={{ background: profileColor, borderColor: profileColor }}
        >
          {s.btnDone}
        </Button>

        <p className="text-[10px] leading-relaxed text-center px-2" style={{ color: alpha(C.text4, 0.5) }}>
          {s.disclaimer.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && ' '}</span>)}
        </p>
      </div>
    </div>
  );
}
