import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MASK_PROFILES, ATTRACTION_PAIRS } from '@/lib/vfileAlgorithm';
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
        <p className="text-sm font-medium">우리의 패턴</p>
        <button
          onClick={() => disconnectPartner.mutate(connection.connectionId)}
          className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
        >
          연결 해제
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

      {attractionPair && myProfile?.pairCode === partnerMskProfile?.mskCode && (
        <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-3 space-y-1">
          <p className="text-[10px] text-pink-500 font-medium">끌림 대칭 쌍</p>
          <p className="text-xs">{attractionPair.dynamic}</p>
          <p className="text-[10px] text-muted-foreground">장기 역학: {attractionPair.longTerm}</p>
        </div>
      )}

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

      {axisDiff !== null && (
        <div className="bg-muted/20 rounded-xl p-3">
          <p className="text-[10px] text-muted-foreground mb-1">패턴 유사도</p>
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
