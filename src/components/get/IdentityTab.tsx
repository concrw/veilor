// IdentityTab — mask display, axis scores, attachment type, persona map, pattern analysis
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MASK_LABELS: Record<string, string> = {
  NRC: '나르시시스트', MKV: '마키아벨리', SCP: '소시오패스', PSP: '사이코패스',
  MNY: '머니', PWR: '파워', EMP: '엠패스', APV: '어프루벌',
  SAV: '세이버', AVD: '어보이던트', DEP: '디펜던트', GVR: '기버',
};

const AXIS_LABELS: Record<string, string> = {
  A: '자기인식', B: '감정조절', C: '욕구표현', D: '관계유지',
};

const ATTACHMENT_LABELS: Record<string, string> = {
  secure: '안정형', anxious: '불안형', avoidant: '회피형', disorganized: '혼란형',
};

function PremiumLock({ label, onUnlock }: { label: string; onUnlock?: () => void }) {
  return (
    <div
      className="bg-card border border-dashed rounded-2xl p-6 text-center space-y-2 opacity-70 cursor-pointer hover:opacity-90 transition-opacity"
      onClick={onUnlock}
    >
      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">프리미엄</span>
      <p className="text-sm text-muted-foreground mt-2">{label}</p>
      <p className="text-xs text-muted-foreground">탭하면 Pro 플랜을 확인할 수 있어요</p>
    </div>
  );
}

interface IdentityTabProps {
  primaryMask: string | null;
  axisScores: Record<string, number> | null;
  pp: any;
  isPro: boolean;
  tryAccess: (feature: string) => void;
  totalSessions: number;
  ventCount: number;
  digCount: number;
  setCount: number;
  topEmotions: [string, number][];
  topDomain: { domain: string; cnt: number } | undefined;
  recentKeywords: string[];
  signalTotal: number;
}

export default function IdentityTab({
  primaryMask, axisScores, pp, isPro, tryAccess,
  totalSessions, ventCount, digCount, setCount,
  topEmotions, topDomain, recentKeywords, signalTotal,
}: IdentityTabProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* 가면 */}
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <p className="text-xs text-muted-foreground">나의 가면</p>
        <p className="text-2xl font-bold">
          {primaryMask ? (MASK_LABELS[primaryMask] ?? primaryMask) : '—'}
        </p>
        {primaryMask && (
          <p className="text-xs text-muted-foreground">코드: {primaryMask}</p>
        )}
      </div>

      {/* 축 점수 */}
      {axisScores && (
        <div className="bg-card border rounded-2xl p-5 space-y-3">
          <p className="text-xs text-muted-foreground">관계 역량 4축</p>
          <div className="space-y-2">
            {(Object.entries(axisScores) as [string, number][]).map(([axis, score]) => (
              <div key={axis} className="flex items-center gap-3">
                <span className="text-xs w-20 text-muted-foreground">{AXIS_LABELS[axis] ?? axis}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full">
                  <div className="h-1.5 bg-primary rounded-full transition-all" style={{ width: `${score}%` }} />
                </div>
                <span className="text-xs font-medium w-8 text-right">{score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 애착 유형 */}
      {pp?.attachment_type && (
        <div className="bg-card border rounded-2xl p-5 space-y-1">
          <p className="text-xs text-muted-foreground">애착 유형</p>
          <p className="font-semibold">{ATTACHMENT_LABELS[pp.attachment_type] ?? pp.attachment_type}</p>
        </div>
      )}

      {/* Prime Perspective */}
      {pp?.perspective_text && (
        <div className="bg-card border rounded-2xl p-5 space-y-2">
          <p className="text-xs text-muted-foreground">Prime Perspective</p>
          <p className="font-semibold">{pp.perspective_text}</p>
        </div>
      )}

      {/* 멀티페르소나 맵 */}
      {isPro ? (
        <div className="bg-card border rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">멀티페르소나 맵</p>
            <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">활성</span>
          </div>
          <div className="space-y-2">
            {[pp?.persona_type].filter(Boolean).map((persona: string, i: number) => (
              <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <p className="text-sm">{persona}</p>
              </div>
            ))}
            {!pp?.persona_type && (
              <p className="text-xs text-muted-foreground">PRIPER 분석 후 페르소나가 등록됩니다</p>
            )}
          </div>
        </div>
      ) : (
        <PremiumLock
          label="멀티페르소나 맵 — 각 페르소나의 자원 배분과 시간축 변화를 시각화합니다."
          onUnlock={() => tryAccess('multi_persona_analysis')}
        />
      )}

      {/* 누적 신호 패턴 분석 */}
      {totalSessions > 0 && (
        <div className="bg-card border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">누적 패턴 분석</p>
            <span className="text-xs font-medium text-primary">총 {totalSessions}회 입력</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ventCount > 0 && (
              <div className="bg-muted/50 rounded-xl p-3 text-center space-y-1">
                <p className="text-xl font-bold">{ventCount}</p>
                <p className="text-xs text-muted-foreground">Vent 대화</p>
              </div>
            )}
            {digCount > 0 && (
              <div className="bg-muted/50 rounded-xl p-3 text-center space-y-1">
                <p className="text-xl font-bold">{digCount}</p>
                <p className="text-xs text-muted-foreground">Dig 탐색</p>
              </div>
            )}
            {setCount > 0 && (
              <div className="bg-muted/50 rounded-xl p-3 text-center space-y-1">
                <p className="text-xl font-bold">{setCount}</p>
                <p className="text-xs text-muted-foreground">Set 기록</p>
              </div>
            )}
          </div>
          {topEmotions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">자주 느끼는 감정</p>
              <div className="flex flex-wrap gap-1.5">
                {topEmotions.map(([emo, count]) => (
                  <span key={emo} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                    {emo} <span className="opacity-60">{count}회</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          {topDomain && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">반복 탐색 패턴</p>
              <p className="text-sm font-medium">
                {topDomain.domain}
                <span className="text-xs text-muted-foreground font-normal ml-1">({topDomain.cnt}회 탐색)</span>
              </p>
            </div>
          )}
          {recentKeywords.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">최근 Set 키워드</p>
              <div className="flex flex-wrap gap-1.5">
                {recentKeywords.map((kw: string, i: number) => (
                  <span key={i} className="text-xs bg-muted px-2.5 py-1 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
          )}
          {signalTotal > 0 && (
            <p className="text-xs text-muted-foreground border-t pt-3">
              총 {signalTotal}개 신호 누적 — 사용할수록 분석이 정교해져요
            </p>
          )}
        </div>
      )}

      <Button variant="outline" className="w-full" onClick={() => navigate('/onboarding/priper/start')}>
        PRIPER 재분석
      </Button>
    </>
  );
}
