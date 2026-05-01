import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MASK_PROFILES, ATTRACTION_PAIRS } from '@/lib/vfileAlgorithm';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    ourPattern: '우리의 패턴',
    disconnect: '연결 해제',
    me: '나',
    partnerFallback: '파트너',
    compat: '호환',
    relationDynamics: '관계 역학',
    bothPredatory: (cat: string) => `두 사람 모두 ${cat === 'predatory' ? '포식형' : '피식형'}이에요. 공감은 쉽지만 역할 충돌에 주의하세요.`,
    mixedCategory: (cat: string) => `${cat === 'predatory' ? '포식형-피식형' : '피식형-포식형'} 조합이에요. 자연스러운 역할 분배가 가능합니다.`,
    attractionPairLabel: '끌림 대칭 쌍',
    longTerm: (v: string) => `장기 역학: ${v}`,
    myCoreNeed: '나의 핵심 필요',
    partnerCoreNeed: '파트너의 핵심 필요',
    patternSimilarity: '패턴 유사도',
    tabMulti: '멀티페르소나',
    tabCouple: '커플 분석',
    tabMatch: '매칭',
  },
  en: {
    ourPattern: 'Our Pattern',
    disconnect: 'Disconnect',
    me: 'Me',
    partnerFallback: 'Partner',
    compat: 'Compat',
    relationDynamics: 'Relationship Dynamics',
    bothPredatory: (cat: string) => `Both are ${cat === 'predatory' ? 'predatory' : 'receptive'} types. Empathy comes easily, but watch for role conflicts.`,
    mixedCategory: (cat: string) => `${cat === 'predatory' ? 'Predatory–Receptive' : 'Receptive–Predatory'} pairing — natural role distribution is possible.`,
    attractionPairLabel: 'Attraction Symmetry Pair',
    longTerm: (v: string) => `Long-term dynamic: ${v}`,
    myCoreNeed: 'My Core Need',
    partnerCoreNeed: "Partner's Core Need",
    patternSimilarity: 'Pattern Similarity',
    tabMulti: 'Multi-Persona',
    tabCouple: 'Couple Analysis',
    tabMatch: 'Matching',
  },
};
import {
  usePartnerConnection,
  usePartnerProfile,
  useDisconnectPartner,
} from '@/hooks/usePartner';
import MultiPersonaAnalysis from './MultiPersonaAnalysis';
import InviteSection from './InviteSection';
import CrossSessionAnalysis from './CrossSessionAnalysis';
import MatchSuggestion from './MatchSuggestion';

function ConnectedCoupleProfile() {
  const { primaryMask, axisScores } = useAuth();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const { data: connection } = usePartnerConnection();
  const { data: partnerProfile } = usePartnerProfile(connection?.partnerId);
  const disconnectPartner = useDisconnectPartner();

  const myProfile = MASK_PROFILES.find(m => m.mskCode === primaryMask || m.nameKo === primaryMask);
  const partnerMskProfile = MASK_PROFILES.find(m => m.mskCode === partnerProfile?.mskCode);
  const attractionPair = myProfile ? ATTRACTION_PAIRS.find(
    p => p.predatory === myProfile.mskCode || p.prey === myProfile.mskCode
  ) : null;

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
    ? (myProfile.pairCode === partnerMskProfile.mskCode ? 90 : myProfile.category === partnerMskProfile.category ? 65 : 75)
      + (axisDiff !== null ? Math.round((100 - axisDiff) / 10) : 0)
    : null;

  if (!connection || !partnerProfile) return null;

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{s.ourPattern}</p>
        <button
          onClick={() => disconnectPartner.mutate(connection.connectionId)}
          className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
        >
          {s.disconnect}
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 py-2">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
            style={{ backgroundColor: (myProfile?.color ?? '#6366f1') + '20' }}>
            <span className="text-sm font-bold" style={{ color: myProfile?.color }}>
              {myProfile?.mskCode ?? '?'}
            </span>
          </div>
          <p className="text-[10px] mt-1">{myProfile?.nameKo ?? s.me}</p>
          <p className="text-[9px] text-muted-foreground">{s.me}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          {compatibilityScore !== null && (
            <span className="text-sm font-bold text-primary">{Math.min(compatibilityScore, 99)}%</span>
          )}
          <span className="text-base">↔</span>
          <span className="text-[9px] text-muted-foreground">{s.compat}</span>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
            style={{ backgroundColor: (partnerMskProfile?.color ?? '#6366f1') + '20' }}>
            <span className="text-sm font-bold" style={{ color: partnerMskProfile?.color }}>
              {partnerProfile.mskCode ?? '?'}
            </span>
          </div>
          <p className="text-[10px] mt-1">{partnerMskProfile?.nameKo ?? s.partnerFallback}</p>
          <p className="text-[9px] text-muted-foreground">{partnerProfile.nickname ?? s.partnerFallback}</p>
        </div>
      </div>

      {myProfile && partnerMskProfile && (
        <div className="bg-muted/30 rounded-xl p-3 space-y-1">
          <p className="text-[10px] text-muted-foreground">{s.relationDynamics}</p>
          <p className="text-xs leading-relaxed">
            {myProfile.category === partnerMskProfile.category
              ? s.bothPredatory(myProfile.category)
              : s.mixedCategory(myProfile.category)}
          </p>
        </div>
      )}

      {attractionPair && myProfile?.pairCode === partnerMskProfile?.mskCode && (
        <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-3 space-y-1">
          <p className="text-[10px] text-pink-500 font-medium">{s.attractionPairLabel}</p>
          <p className="text-xs">{attractionPair.dynamic}</p>
          <p className="text-[10px] text-muted-foreground">{s.longTerm(attractionPair.longTerm)}</p>
        </div>
      )}

      {myProfile && partnerMskProfile && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/20 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground mb-0.5">{s.myCoreNeed}</p>
            <p className="text-[10px]">{myProfile.coreNeed}</p>
          </div>
          <div className="bg-muted/20 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground mb-0.5">{s.partnerCoreNeed}</p>
            <p className="text-[10px]">{partnerMskProfile.coreNeed}</p>
          </div>
        </div>
      )}

      {axisDiff !== null && (
        <div className="bg-muted/20 rounded-xl p-3">
          <p className="text-[10px] text-muted-foreground mb-1">{s.patternSimilarity}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.max(0, 100 - axisDiff)}%` }} />
            </div>
            <span className="text-[10px] font-mono">{Math.max(0, 100 - axisDiff)}%</span>
          </div>
        </div>
      )}

      <CrossSessionAnalysis myUserId={undefined} partnerUserId={connection?.partnerId} />
    </div>
  );
}

function CoupleProfile() {
  const { data: connection, isLoading } = usePartnerConnection();

  if (isLoading) {
    return (
      <div className="bg-card border rounded-2xl p-5 flex items-center justify-center h-24">
        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return connection ? <ConnectedCoupleProfile /> : <InviteSection />;
}

export default function CoupleAnalysis() {
  const [section, setSection] = useState<'multi' | 'couple' | 'match'>('multi');
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-muted rounded-lg p-0.5">
        {([
          { key: 'multi' as const, label: s.tabMulti },
          { key: 'couple' as const, label: s.tabCouple },
          { key: 'match' as const, label: s.tabMatch },
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
