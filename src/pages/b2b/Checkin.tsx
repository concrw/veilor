import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useSubmitCheckin } from '@/hooks/useB2BOrg';
import type { B2BOrgEvent } from '@/integrations/supabase/veilor-types';

// ─────────────────────────────────────────────
// 4C 축 정의 (성인 기본 언어)
// org_type별 언어 오버라이드는 meta에서 불러오거나 추후 확장
// ─────────────────────────────────────────────
const C_AXES = [
  {
    key: 'c_control' as const,
    label: 'Control',
    question: '지금 이 순간, 내 감정과 상황을 내가 조절하고 있다',
    low: '전혀 그렇지 않다',
    high: '완전히 그렇다',
  },
  {
    key: 'c_commitment' as const,
    label: 'Commitment',
    question: '지금 내 목표를 향한 의지가 흔들리지 않는다',
    low: '흔들리고 있다',
    high: '확고하다',
  },
  {
    key: 'c_challenge' as const,
    label: 'Challenge',
    question: '지금 내가 마주한 어려움이 성장의 기회로 느껴진다',
    low: '위협으로 느껴진다',
    high: '기회로 느껴진다',
  },
  {
    key: 'c_confidence' as const,
    label: 'Confidence',
    question: '지금 내 능력과 판단을 스스로 신뢰하고 있다',
    low: '자신이 없다',
    high: '자신 있다',
  },
] as const;

type CKey = typeof C_AXES[number]['key'];

export default function Checkin() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { submitCheckin, loading } = useSubmitCheckin();

  const [step, setStep] = useState<number>(0);         // 0~3: 4C 입력, 4: 텍스트, 5: 완료
  const [scores, setScores] = useState<Record<CKey, number>>({
    c_control: 5, c_commitment: 5, c_challenge: 5, c_confidence: 5,
  });
  const [freeText, setFreeText] = useState('');
  const [upcomingEvent, setUpcomingEvent] = useState<B2BOrgEvent | null>(null);
  const [result, setResult] = useState<{ risk_level: string; routing_result: string } | null>(null);

  // 가장 가까운 이벤트 조회 (컨텍스트 태깅용)
  useEffect(() => {
    if (!orgId) return;
    const today = new Date().toISOString().split('T')[0];
    veilorDb
      .from('b2b_org_events')
      .select('*')
      .eq('org_id', orgId)
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .limit(1)
      .single()
      .then(({ data }) => { if (data) setUpcomingEvent(data as B2BOrgEvent); });
  }, [orgId]);

  const currentAxis = step < 4 ? C_AXES[step] : null;

  const handleScore = (val: number) => {
    if (!currentAxis) return;
    setScores(s => ({ ...s, [currentAxis.key]: val }));
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!orgId) return;

    // days_to_event 계산
    let daysToEvent: number | undefined;
    if (upcomingEvent) {
      const diff = Math.ceil(
        (new Date(upcomingEvent.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      daysToEvent = diff >= 0 ? diff : undefined;
    }

    const res = await submitCheckin({
      org_id: orgId,
      org_event_id: upcomingEvent?.id,
      trigger_type: daysToEvent !== undefined && daysToEvent <= 21 ? 'event_pre' : 'scheduled',
      c_control: scores.c_control,
      c_commitment: scores.c_commitment,
      c_challenge: scores.c_challenge,
      c_confidence: scores.c_confidence,
      free_text: freeText.trim() || undefined,
    });

    if (res) {
      setResult({ risk_level: res.risk_level, routing_result: res.routing_result ?? 'self_care' });
      setStep(5);
    } else {
      toast({ title: '저장 실패', description: '다시 시도해주세요.', variant: 'destructive' });
    }
  };

  // ── 완료 화면 ──
  if (step === 5 && result) {
    const isRisk = result.risk_level === 'medium' || result.risk_level === 'high';
    const needsCoaching = result.routing_result === 'coaching' || result.routing_result === 'counseling';

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="text-4xl">{isRisk ? '🌧' : '☀️'}</div>
          <div>
            <h1 className="text-xl font-bold">오늘 체크인 완료</h1>
            <p className="text-muted-foreground text-sm mt-1">
              평균 4C: {((scores.c_control + scores.c_commitment + scores.c_challenge + scores.c_confidence) / 4).toFixed(1)} / 10
            </p>
          </div>

          {result.risk_level === 'high' && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 text-left space-y-2">
              <p className="font-semibold">⚠ 담당 코치에게 알림이 발송되었습니다.</p>
              <p>힘드신 경우 즉시 상담 연결을 요청하거나 자살예방상담전화 <strong>1393</strong>으로 연락하세요.</p>
            </div>
          )}

          {result.risk_level === 'medium' && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
              담당 코치가 24시간 내에 연락드릴 예정입니다.
            </div>
          )}

          {needsCoaching && result.risk_level !== 'high' && result.risk_level !== 'medium' && (
            <p className="text-sm text-muted-foreground">코칭 세션을 예약하는 것을 추천합니다.</p>
          )}

          <div className="flex gap-3">
            {needsCoaching && (
              <Button variant="outline" onClick={() => navigate(`/b2b/coach-match/${orgId}`)} className="flex-1">
                코치 세션 예약
              </Button>
            )}
            <Button onClick={() => navigate(`/b2b/dashboard/${orgId}`)} className="flex-1">
              대시보드로
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── 텍스트 입력 (선택) ──
  if (step === 4) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">선택 입력</p>
            <h1 className="text-xl font-bold">지금 하고 싶은 말이 있나요?</h1>
            <p className="text-sm text-muted-foreground mt-1">입력하지 않아도 됩니다. 소속사에는 공개되지 않습니다.</p>
          </div>

          <textarea
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            placeholder="자유롭게 적어보세요..."
            rows={5}
            className="w-full border rounded-xl p-3 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleBack} className="flex-1">이전</Button>
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? '저장 중...' : '완료'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── 4C 슬라이더 입력 ──
  if (!currentAxis) return null;

  const progress = step + 1;
  const currentScore = scores[currentAxis.key];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">

        {/* 진행 바 */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress} / 4</span>
            {upcomingEvent && (
              <span className="text-primary">
                {upcomingEvent.event_name} D-{Math.ceil(
                  (new Date(upcomingEvent.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )}
              </span>
            )}
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${(progress / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* 질문 */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-primary uppercase tracking-wider">{currentAxis.label}</p>
          <h1 className="text-lg font-semibold leading-snug">{currentAxis.question}</h1>
        </div>

        {/* 슬라이더 */}
        <div className="space-y-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currentAxis.low}</span>
            <span>{currentAxis.high}</span>
          </div>

          {/* 점수 버튼 (1~10) */}
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => handleScore(n)}
                className={`h-10 rounded-lg text-sm font-medium transition-all ${
                  currentScore === n
                    ? 'bg-primary text-primary-foreground scale-110 shadow'
                    : 'bg-muted text-muted-foreground hover:bg-primary/20'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <p className="text-center text-3xl font-bold text-primary">{currentScore}</p>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">이전</Button>
          )}
          <Button onClick={handleNext} className="flex-1">
            {step < 3 ? '다음' : '마지막으로'}
          </Button>
        </div>
      </div>
    </div>
  );
}
