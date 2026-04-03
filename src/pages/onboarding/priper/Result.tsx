import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { runDiagnosis } from '@/lib/priperAlgorithm';
import type { DiagnosisResult } from '@/lib/priperAlgorithm';
import { Button } from '@/components/ui/button';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { supabase, veilrumDb } from '@/integrations/supabase/client';

export default function PriperResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, completePriper } = useAuth();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const responses = (location.state as { responses?: Record<string, string> } | null)?.responses;
    if (!responses) { navigate('/onboarding/priper/questions', { replace: true }); return; }

    const r = runDiagnosis(responses);
    setResult(r);

    // DB 저장
    if (user) {
      veilrumDb.from('priper_sessions').insert({
        user_id: user.id,
        responses,
        axis_scores: r.scores,
        primary_mask: r.primary.nameKo,
        secondary_mask: r.secondary.nameKo,
        insights: r.insights,
        is_completed: true,
        completed_at: new Date().toISOString(),
      });
      // prime_perspectives 초기 레코드 생성 (첫 분석 기준)
      veilrumDb.from('prime_perspectives').upsert({
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

    // 가면 공개 애니메이션 딜레이
    setTimeout(() => setRevealed(true), 800);
  }, []);

  const qc = useQueryClient();
  const handleEnter = async () => {
    if (!result) return;
    await completePriper(result.primary.nameKo, result.secondary.nameKo, result.scores);
    // PRIPER 완료 후 관련 캐시 갱신
    qc.invalidateQueries({ queryKey: ['prime-perspective'] });
    qc.invalidateQueries({ queryKey: ['me-diagnosis'] });
    qc.invalidateQueries({ queryKey: ['me-radar'] });
    navigate('/home');
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
          <p className="text-xs text-muted-foreground uppercase tracking-widest">당신의 Prime Mask</p>
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

        <Button className="w-full h-12 text-base" onClick={handleEnter}>
          내 관계 언어 탐색 시작 →
        </Button>

        <p className="text-[10px] text-muted-foreground/50 leading-relaxed text-center px-2">
          이 결과는 자기탐색을 위한 참고 자료이며, 심리 진단이 아닙니다.
          정확한 평가를 원하시면 전문 심리상담사와 상담해 주세요.
        </p>
      </div>
    </div>
  );
}
