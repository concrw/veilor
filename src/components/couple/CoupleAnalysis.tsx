// #7 멀티페르소나 분석 (Become 티어)
// #38 커플 교차 분석 + #39 커플 성적 프로필
// #49 만남 제안 + #50 매칭 알고리즘
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilrumDb } from '@/integrations/supabase/client';
import { MASK_PROFILES, ATTRACTION_PAIRS } from '@/lib/vfileAlgorithm';

// #7 멀티페르소나 분석 — 3가지 맥락(사회/일반/비밀) 통합 분석
function MultiPersonaAnalysis() {
  const { user } = useAuth();

  const { data: personas } = useQuery({
    queryKey: ['multi-persona-analysis', user?.id],
    queryFn: async () => {
      const { data } = await veilrumDb.from('persona_profiles')
        .select('*').eq('user_id', user!.id).order('rank_order');
      return data ?? [];
    },
    enabled: !!user,
  });

  if (!personas || personas.length < 2) {
    return (
      <div className="bg-card border rounded-2xl p-5 space-y-2">
        <p className="text-sm font-medium">멀티페르소나 분석</p>
        <p className="text-xs text-muted-foreground">2가지 이상 맥락(사회적/일반적/비밀스러운)의 V-File을 완료하면 교차 분석이 가능해요</p>
        <p className="text-xs text-primary">Get 탭 → 세 개의 나 → 추가 진단</p>
      </div>
    );
  }

  const masks = personas.map((p: any) => ({
    context: p.vfile_context,
    mask: MASK_PROFILES.find(m => m.mskCode === p.msk_code),
    scores: p.axis_scores,
  }));

  // 일치/불일치 분석
  const allSameMask = masks.every((m: any) => m.mask?.mskCode === masks[0].mask?.mskCode);

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">멀티페르소나 분석</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500">Become</span>
      </div>
      <div className="space-y-2">
        {masks.map((m: any, i: number) => (
          <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ backgroundColor: (m.mask?.color ?? '#6366f1') + '20' }}>
              {m.context === 'general' ? '🌿' : m.context === 'social' ? '🏢' : '🌙'}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium" style={{ color: m.mask?.color }}>
                {m.mask?.nameKo ?? '?'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {m.context === 'general' ? '일반적인 나' : m.context === 'social' ? '사회적인 나' : '비밀스러운 나'}
              </p>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{m.mask?.mskCode}</span>
          </div>
        ))}
      </div>
      <div className={`rounded-xl p-3 text-xs leading-relaxed ${
        allSameMask ? 'bg-emerald-500/5 border border-emerald-500/20 text-emerald-700' :
        'bg-violet-500/5 border border-violet-500/20 text-violet-600'
      }`}>
        {allSameMask
          ? '모든 맥락에서 같은 가면을 쓰고 있어요. 일관된 관계 패턴을 가지고 있습니다.'
          : '맥락에 따라 다른 가면이 나타나요. 상황별로 다른 전략을 사용하고 있습니다.'}
      </div>
    </div>
  );
}

// #38 커플 교차 분석 + #39 커플 성적 프로필
function CoupleProfile() {
  const { user, primaryMask } = useAuth();
  const [partnerMask, setPartnerMask] = useState('');

  const myProfile = MASK_PROFILES.find(m => m.nameKo === primaryMask || m.mskCode === primaryMask);
  const partnerProfile = MASK_PROFILES.find(m => m.mskCode === partnerMask || m.nameKo === partnerMask);

  // 끌림 대칭 분석
  const attractionPair = myProfile ? ATTRACTION_PAIRS.find(
    p => p.predatory === myProfile.mskCode || p.prey === myProfile.mskCode
  ) : null;

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <p className="text-sm font-medium">커플 교차 분석</p>
      <p className="text-xs text-muted-foreground">파트너의 V-File 유형을 선택하면 관계 역학을 분석해요</p>

      <div className="flex flex-wrap gap-1.5">
        {MASK_PROFILES.map(m => (
          <button key={m.mskCode} onClick={() => setPartnerMask(m.mskCode)}
            className={`text-[10px] px-2 py-1 rounded-full transition-colors ${
              partnerMask === m.mskCode
                ? 'text-white' : 'bg-muted text-muted-foreground'
            }`}
            style={partnerMask === m.mskCode ? { backgroundColor: m.color } : undefined}>
            {m.nameKo}
          </button>
        ))}
      </div>

      {myProfile && partnerProfile && (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: myProfile.color + '20' }}>
                <span className="text-xs font-bold" style={{ color: myProfile.color }}>{myProfile.mskCode}</span>
              </div>
              <p className="text-[10px] mt-1">{myProfile.nameKo}</p>
            </div>
            <span className="text-lg">↔</span>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: partnerProfile.color + '20' }}>
                <span className="text-xs font-bold" style={{ color: partnerProfile.color }}>{partnerProfile.mskCode}</span>
              </div>
              <p className="text-[10px] mt-1">{partnerProfile.nameKo}</p>
            </div>
          </div>

          {/* 관계 역학 */}
          <div className="bg-muted/30 rounded-xl p-3 space-y-1">
            <p className="text-[10px] text-muted-foreground">관계 역학</p>
            <p className="text-xs leading-relaxed">
              {myProfile.category === partnerProfile.category
                ? `두 사람 모두 ${myProfile.category === 'predatory' ? '포식형' : '피식형'}이에요. 비슷한 전략을 사용하므로 공감은 쉽지만 역할 충돌이 올 수 있어요.`
                : `${myProfile.category === 'predatory' ? '포식형-피식형' : '피식형-포식형'} 조합이에요. 자연스러운 역할 분배가 가능하지만 권력 불균형에 주의하세요.`}
            </p>
          </div>

          {/* 끌림 대칭 */}
          {attractionPair && (myProfile.pairCode === partnerProfile.mskCode) && (
            <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-3 space-y-1">
              <p className="text-[10px] text-pink-500 font-medium">끌림 대칭 쌍</p>
              <p className="text-xs">{attractionPair.dynamic}</p>
              <p className="text-[10px] text-muted-foreground">장기 역학: {attractionPair.longTerm}</p>
            </div>
          )}

          {/* 핵심 필요 비교 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/20 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground mb-0.5">나의 핵심 필요</p>
              <p className="text-[10px]">{myProfile.coreNeed}</p>
            </div>
            <div className="bg-muted/20 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground mb-0.5">파트너의 핵심 필요</p>
              <p className="text-[10px]">{partnerProfile.coreNeed}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// #49 만남 제안 + #50 매칭 알고리즘
function MatchSuggestion() {
  const { user, primaryMask, axisScores } = useAuth();

  const { data: suggestions } = useQuery({
    queryKey: ['match-suggestions', user?.id],
    queryFn: async () => {
      if (!primaryMask) return [];
      const myProfile = MASK_PROFILES.find(m => m.nameKo === primaryMask || m.mskCode === primaryMask);
      if (!myProfile) return [];

      // 보완적 유형 찾기: 끌림 대칭 쌍 + 비슷한 축 점수
      const { data } = await veilrumDb.from('user_profiles')
        .select('user_id, nickname, primary_mask, msk_code, axis_scores')
        .neq('user_id', user!.id)
        .not('msk_code', 'is', null)
        .limit(10);

      if (!data) return [];

      return data.map((u: any) => {
        const profile = MASK_PROFILES.find(m => m.mskCode === u.msk_code);
        // 보완성 점수 계산
        const isPair = myProfile.pairCode === u.msk_code;
        const sameCategory = profile?.category === myProfile.category;
        let score = isPair ? 90 : sameCategory ? 60 : 70;
        // 축 유사도 보정
        if (u.axis_scores && axisScores) {
          const axisDiff = (['A', 'B', 'C', 'D'] as const).reduce((sum, k) =>
            sum + Math.abs((axisScores[k] ?? 50) - (u.axis_scores[k] ?? 50)), 0);
          score += Math.round((400 - axisDiff) / 40);
        }
        return { ...u, profile, compatibility: Math.min(score, 99) };
      }).sort((a: any, b: any) => b.compatibility - a.compatibility).slice(0, 5);
    },
    enabled: !!user && !!primaryMask,
    staleTime: 1000 * 60 * 10,
  });

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <p className="text-sm font-medium">추천 매칭</p>
      <p className="text-xs text-muted-foreground">V-File 기반 보완적/유사 유형</p>
      <div className="space-y-2">
        {suggestions.map((s: any) => (
          <div key={s.user_id} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: (s.profile?.color ?? '#6366f1') + '20', color: s.profile?.color }}>
              {(s.nickname ?? '?')[0]}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium">{s.nickname ?? '익명'}</p>
              <p className="text-[10px] text-muted-foreground">{s.profile?.nameKo} · {s.msk_code}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-primary">{s.compatibility}%</p>
              <p className="text-[10px] text-muted-foreground">호환</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 통합 Export
export default function CoupleAnalysis() {
  const [section, setSection] = useState<'multi' | 'couple' | 'match'>('multi');

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-muted rounded-lg p-0.5">
        {([
          { key: 'multi' as const, label: '멀티페르소나' },
          { key: 'couple' as const, label: '커플 분석' },
          { key: 'match' as const, label: '매칭' },
        ]).map(t => (
          <button key={t.key} onClick={() => setSection(t.key)}
            className={`flex-1 text-xs py-2 rounded-md transition-colors ${
              section === t.key ? 'bg-background text-foreground shadow-sm font-medium' : 'text-muted-foreground'
            }`}>
            {t.label}
          </button>
        ))}
      </div>
      {section === 'multi' && <MultiPersonaAnalysis />}
      {section === 'couple' && <CoupleProfile />}
      {section === 'match' && <MatchSuggestion />}
    </div>
  );
}
