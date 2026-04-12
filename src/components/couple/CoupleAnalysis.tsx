// #7 멀티페르소나 분석 (Become 티어)
// #38 커플 교차 분석 + #39 커플 성적 프로필
// #49 만남 제안 + #50 매칭 알고리즘
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { MASK_PROFILES, ATTRACTION_PAIRS } from '@/lib/vfileAlgorithm';
import {
  usePartnerConnection,
  usePartnerProfile,
  useCreateInvite,
  useInviteCodeInput,
  useDisconnectPartner,
} from '@/hooks/usePartner';

// ─────────────────────────────────────────────
// #7 멀티페르소나 분석
// ─────────────────────────────────────────────
function MultiPersonaAnalysis() {
  const { user } = useAuth();

  const { data: personas } = useQuery({
    queryKey: ['multi-persona-analysis', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb.from('persona_profiles')
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

  interface MaskEntry { context: string; mask: typeof MASK_PROFILES[number] | undefined; scores: Record<string, number> | null }
  const masks: MaskEntry[] = personas.map((p: Record<string, unknown>) => ({
    context: p.vfile_context as string,
    mask: MASK_PROFILES.find(m => m.mskCode === p.msk_code),
    scores: p.axis_scores as Record<string, number> | null,
  }));

  const allSameMask = masks.every((m) => m.mask?.mskCode === masks[0].mask?.mskCode);

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">멀티페르소나 분석</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500">Become</span>
      </div>
      <div className="space-y-2">
        {masks.map((m, i: number) => (
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

// ─────────────────────────────────────────────
// 파트너 초대코드 발급 UI
// ─────────────────────────────────────────────
function InviteSection() {
  const createInvite = useCreateInvite();
  const [copied, setCopied] = useState(false);
  const inviteInput = useInviteCodeInput();
  const [showInput, setShowInput] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-3">
      {/* 초대코드 발급 */}
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <p className="text-sm font-medium">파트너 초대하기</p>
        <p className="text-xs text-muted-foreground">
          초대코드를 파트너에게 보내세요. 파트너가 코드를 입력하면 두 사람의 V-프로필이 연결됩니다.
        </p>
        {createInvite.data ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-4 py-3">
              <span className="flex-1 text-lg font-mono font-bold tracking-widest text-center">
                {createInvite.data.inviteCode}
              </span>
              <button
                onClick={() => handleCopy(createInvite.data!.inviteCode)}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-primary text-primary-foreground"
              >
                {copied ? '복사됨' : '복사'}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              7일 후 만료 · 1회 사용 가능
            </p>
          </div>
        ) : (
          <button
            onClick={() => createInvite.mutate()}
            disabled={createInvite.isPending}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            {createInvite.isPending ? '발급 중...' : '초대코드 발급'}
          </button>
        )}
      </div>

      {/* 초대코드 입력 */}
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <button
          onClick={() => setShowInput(v => !v)}
          className="w-full text-left"
        >
          <p className="text-sm font-medium">초대코드 입력하기</p>
          <p className="text-xs text-muted-foreground">파트너에게 받은 코드를 입력하세요</p>
        </button>
        {showInput && (
          <div className="space-y-2">
            <input
              value={inviteInput.code}
              onChange={e => inviteInput.setCode(e.target.value)}
              placeholder="XXXXXXXX"
              maxLength={8}
              className="w-full text-center text-lg font-mono tracking-widest bg-muted/40 rounded-xl px-4 py-3 outline-none border border-transparent focus:border-primary"
            />
            {inviteInput.error && (
              <p className="text-[11px] text-destructive text-center">{inviteInput.error}</p>
            )}
            {inviteInput.isSuccess && (
              <p className="text-[11px] text-emerald-600 text-center">연결 완료! 파트너 분석을 확인해보세요.</p>
            )}
            <button
              onClick={inviteInput.handleSubmit}
              disabled={inviteInput.isPending}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              {inviteInput.isPending ? '연결 중...' : '연결하기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// #38 커플 교차 분석 — 실제 연결된 파트너 기반
// ─────────────────────────────────────────────
function ConnectedCoupleProfile() {
  const { primaryMask, axisScores } = useAuth();
  const { data: connection } = usePartnerConnection();
  const { data: partnerProfile } = usePartnerProfile(connection?.partnerId);
  const disconnectPartner = useDisconnectPartner();

  const myProfile = MASK_PROFILES.find(m => m.mskCode === primaryMask || m.nameKo === primaryMask);
  const partnerMskProfile = MASK_PROFILES.find(m => m.mskCode === partnerProfile?.mskCode);

  const attractionPair = myProfile ? ATTRACTION_PAIRS.find(
    p => p.predatory === myProfile.mskCode || p.prey === myProfile.mskCode
  ) : null;

  // 축 점수 차이 계산 (A/B/C/D 또는 attachment/communication/expression/role 매핑)
  const partnerAxisScores = partnerProfile?.axisScores;
  let axisDiff: number | null = null;
  if (axisScores && partnerAxisScores) {
    const keys = Object.keys(axisScores).filter(k => partnerAxisScores[k] !== undefined);
    if (keys.length > 0) {
      axisDiff = Math.round(
        keys.reduce((sum, k) => sum + Math.abs((axisScores[k] ?? 50) - (partnerAxisScores[k] ?? 50)), 0) / keys.length
      );
    }
  }

  const compatibilityScore = myProfile && partnerMskProfile
    ? (myProfile.pairCode === partnerMskProfile.mskCode
      ? 90
      : myProfile.category === partnerMskProfile.category
        ? 65 : 75) + (axisDiff !== null ? Math.round((100 - axisDiff) / 10) : 0)
    : null;

  if (!connection || !partnerProfile) return null;

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">우리의 패턴</p>
        <button
          onClick={() => disconnectPartner.mutate(connection.connectionId)}
          className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
        >
          연결 해제
        </button>
      </div>

      {/* 두 사람 프로필 */}
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
            style={{ backgroundColor: (myProfile?.color ?? '#6366f1') + '20' }}>
            <span className="text-sm font-bold" style={{ color: myProfile?.color }}>
              {myProfile?.mskCode ?? '?'}
            </span>
          </div>
          <p className="text-[10px] mt-1">{myProfile?.nameKo ?? '나'}</p>
          <p className="text-[9px] text-muted-foreground">나</p>
        </div>

        <div className="flex flex-col items-center gap-1">
          {compatibilityScore !== null && (
            <span className="text-sm font-bold text-primary">{Math.min(compatibilityScore, 99)}%</span>
          )}
          <span className="text-base">↔</span>
          <span className="text-[9px] text-muted-foreground">호환</span>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
            style={{ backgroundColor: (partnerMskProfile?.color ?? '#6366f1') + '20' }}>
            <span className="text-sm font-bold" style={{ color: partnerMskProfile?.color }}>
              {partnerProfile.mskCode ?? '?'}
            </span>
          </div>
          <p className="text-[10px] mt-1">{partnerMskProfile?.nameKo ?? '파트너'}</p>
          <p className="text-[9px] text-muted-foreground">{partnerProfile.nickname ?? '파트너'}</p>
        </div>
      </div>

      {/* 관계 역학 */}
      {myProfile && partnerMskProfile && (
        <div className="bg-muted/30 rounded-xl p-3 space-y-1">
          <p className="text-[10px] text-muted-foreground">관계 역학</p>
          <p className="text-xs leading-relaxed">
            {myProfile.category === partnerMskProfile.category
              ? `두 사람 모두 ${myProfile.category === 'predatory' ? '포식형' : '피식형'}이에요. 공감은 쉽지만 역할 충돌에 주의하세요.`
              : `${myProfile.category === 'predatory' ? '포식형-피식형' : '피식형-포식형'} 조합이에요. 자연스러운 역할 분배가 가능합니다.`}
          </p>
        </div>
      )}

      {/* 끌림 대칭 쌍 */}
      {attractionPair && myProfile?.pairCode === partnerMskProfile?.mskCode && (
        <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-3 space-y-1">
          <p className="text-[10px] text-pink-500 font-medium">끌림 대칭 쌍</p>
          <p className="text-xs">{attractionPair.dynamic}</p>
          <p className="text-[10px] text-muted-foreground">장기 역학: {attractionPair.longTerm}</p>
        </div>
      )}

      {/* 핵심 필요 비교 */}
      {myProfile && partnerMskProfile && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/20 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground mb-0.5">나의 핵심 필요</p>
            <p className="text-[10px]">{myProfile.coreNeed}</p>
          </div>
          <div className="bg-muted/20 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground mb-0.5">파트너의 핵심 필요</p>
            <p className="text-[10px]">{partnerMskProfile.coreNeed}</p>
          </div>
        </div>
      )}

      {/* 축 점수 차이 */}
      {axisDiff !== null && (
        <div className="bg-muted/20 rounded-xl p-3">
          <p className="text-[10px] text-muted-foreground mb-1">패턴 유사도</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.max(0, 100 - axisDiff)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono">{Math.max(0, 100 - axisDiff)}%</span>
          </div>
        </div>
      )}

      {/* priper_sessions 교차 분석 */}
      <CrossSessionAnalysis myUserId={undefined} partnerUserId={connection?.partnerId} />
    </div>
  );
}

// ─────────────────────────────────────────────
// #38 커플 교차 분석 — priper_sessions 기반 4축 비교
// ─────────────────────────────────────────────
const AXIS_LABELS: Record<string, string> = { A: '애착', B: '소통', C: '욕구표현', D: '역할' };

function CrossSessionAnalysis({
  myUserId,
  partnerUserId,
}: {
  myUserId: string | undefined;
  partnerUserId: string | undefined;
}) {
  const { user } = useAuth();
  const uid = myUserId ?? user?.id;

  const { data } = useQuery({
    queryKey: ['cross-session', uid, partnerUserId],
    queryFn: async () => {
      if (!uid || !partnerUserId) return null;
      const [myRes, partnerRes] = await Promise.all([
        veilorDb
          .from('priper_sessions')
          .select('axis_scores, primary_mask, completed_at')
          .eq('user_id', uid)
          .eq('is_completed', true)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single(),
        veilorDb
          .from('priper_sessions')
          .select('axis_scores, primary_mask, completed_at')
          .eq('user_id', partnerUserId)
          .eq('is_completed', true)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single(),
      ]);
      return {
        my: myRes.data,
        partner: partnerRes.data,
      };
    },
    enabled: !!uid && !!partnerUserId,
    staleTime: 1000 * 60 * 5,
  });

  if (!data?.my?.axis_scores || !data?.partner?.axis_scores) return null;

  const myScores = data.my.axis_scores as Record<string, number>;
  const partnerScores = data.partner.axis_scores as Record<string, number>;

  const axes = ['A', 'B', 'C', 'D'] as const;

  // 상호 보완 분석: 합이 낮은 축 = 두 사람 모두 약한 영역 (위험 구간)
  const combined = axes.map(k => ({
    axis: k,
    my: myScores[k] ?? 50,
    partner: partnerScores[k] ?? 50,
    avg: Math.round(((myScores[k] ?? 50) + (partnerScores[k] ?? 50)) / 2),
  }));

  const weakAxis = combined.reduce((min, cur) => cur.avg < min.avg ? cur : min);
  const strongAxis = combined.reduce((max, cur) => cur.avg > max.avg ? cur : max);

  return (
    <div className="border-t pt-3 mt-1 space-y-3">
      <p className="text-[10px] text-muted-foreground font-medium">4축 교차 분석</p>
      <div className="space-y-2">
        {combined.map(({ axis, my, partner, avg }) => (
          <div key={axis} className="space-y-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground w-14">{AXIS_LABELS[axis]}</span>
              <div className="flex gap-2 text-[9px]">
                <span className="text-primary">나 {my}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-violet-500">파트너 {partner}</span>
              </div>
            </div>
            <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="absolute h-full bg-primary/40 rounded-full" style={{ width: `${my}%` }} />
              <div className="absolute h-full bg-violet-500/40 rounded-full" style={{ width: `${partner}%`, left: 0 }} />
              <div
                className={`absolute h-full rounded-full transition-all ${avg < 40 ? 'bg-red-500/60' : avg > 70 ? 'bg-emerald-500/60' : 'bg-primary/20'}`}
                style={{ width: `${avg}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2 space-y-0.5">
          <p className="text-[9px] text-emerald-600 font-medium">강점 축</p>
          <p className="text-xs font-semibold">{AXIS_LABELS[strongAxis.axis]}</p>
          <p className="text-[9px] text-muted-foreground">평균 {strongAxis.avg}점</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2 space-y-0.5">
          <p className="text-[9px] text-red-500 font-medium">함께 성장할 영역</p>
          <p className="text-xs font-semibold">{AXIS_LABELS[weakAxis.axis]}</p>
          <p className="text-[9px] text-muted-foreground">평균 {weakAxis.avg}점</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// #38 커플 교차 분석 — 진입점 (연결 여부에 따라 분기)
// ─────────────────────────────────────────────
function CoupleProfile() {
  const { data: connection, isLoading } = usePartnerConnection();

  if (isLoading) {
    return (
      <div className="bg-card border rounded-2xl p-5 flex items-center justify-center h-24">
        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (connection) {
    return <ConnectedCoupleProfile />;
  }

  return <InviteSection />;
}

// ─────────────────────────────────────────────
// #49 만남 제안 + #50 매칭 알고리즘
// ─────────────────────────────────────────────
function MatchSuggestion() {
  const { user, primaryMask, axisScores } = useAuth();

  const { data: suggestions } = useQuery({
    queryKey: ['match-suggestions', user?.id],
    queryFn: async () => {
      if (!primaryMask) return [];
      const myProfile = MASK_PROFILES.find(m => m.nameKo === primaryMask || m.mskCode === primaryMask);
      if (!myProfile) return [];

      const { data } = await veilorDb.from('user_profiles')
        .select('user_id, nickname, primary_mask, msk_code, axis_scores')
        .neq('user_id', user!.id)
        .not('msk_code', 'is', null)
        .limit(10);

      if (!data) return [];

      return data.map((u: Record<string, unknown>) => {
        const profile = MASK_PROFILES.find(m => m.mskCode === u.msk_code);
        const isPair = myProfile.pairCode === (u.msk_code as string);
        const sameCategory = profile?.category === myProfile.category;
        let score = isPair ? 90 : sameCategory ? 60 : 70;
        const uAxisScores = u.axis_scores as Record<string, number> | null;
        if (uAxisScores && axisScores) {
          const axisDiff = (['A', 'B', 'C', 'D'] as const).reduce((sum, k) =>
            sum + Math.abs((axisScores[k] ?? 50) - (uAxisScores[k] ?? 50)), 0);
          score += Math.round((400 - axisDiff) / 40);
        }
        return { ...u, profile, compatibility: Math.min(score, 99) };
      }).sort((a, b) => b.compatibility - a.compatibility).slice(0, 5);
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
        {suggestions.map((s) => (
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

// ─────────────────────────────────────────────
// 통합 Export
// ─────────────────────────────────────────────
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
