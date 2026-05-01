import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { B2BCoach } from '@/integrations/supabase/veilor-types';
import { useLanguageContext } from '@/context/LanguageContext';

// ─────────────────────────────────────────────
// 이중언어 문자열
// ─────────────────────────────────────────────
const S = {
  ko: {
    bookError: '예약 실패',
    retryMsg: '다시 시도해주세요.',
    doneTitle: '코칭 세션 예약 완료',
    donePrivacy: '세션 내용은 소속사에 공개되지 않습니다.',
    toDashboard: '대시보드로',
    backToList: '← 코치 목록으로',
    bookTitle: '세션 예약',
    sessionTypeLabel: '세션 유형',
    scheduledAtLabel: '희망 일시',
    privacyNote: '세션 내용은 소속사에 공개되지 않습니다. 코치와의 대화는 비밀이 보장됩니다.',
    cancel: '취소',
    booking: '예약 중...',
    confirm: '예약 확정',
    toDashboardBack: '← 대시보드',
    selectTitle: '코치 선택',
    selectSubtitle: '나에게 맞는 코치를 선택하고 세션을 예약하세요.',
    noCoach: '현재 배정 가능한 코치가 없습니다. 잠시 후 다시 시도해주세요.',
    sessionCount: (n: number) => `${n}회 진행`,
    memberCount: (cur: number, max: number) => `${cur}/${max}명`,
    bookWith: (name: string) => `${name} 코치와 세션 예약하기`,
    domainLabels: { sports: '스포츠', entertainment: '엔터테인먼트', corporate: '기업' } as Record<string, string>,
    sessionTypeOptions: [
      { value: 'performance_routine',  label: '퍼포먼스 루틴 세팅' },
      { value: 'pressure_training',    label: '압박 대응 트레이닝' },
      { value: 'slump_recovery',       label: '슬럼프 리커버리' },
      { value: 'career_anchoring',     label: '커리어 앵커링' },
      { value: 'team_dynamics',        label: '팀 다이나믹스' },
      { value: 'energy_management',    label: '에너지 관리' },
    ],
  },
  en: {
    bookError: 'Booking failed',
    retryMsg: 'Please try again.',
    doneTitle: 'Coaching Session Booked',
    donePrivacy: 'Session content will not be shared with your organization.',
    toDashboard: 'Go to Dashboard',
    backToList: '← Back to Coach List',
    bookTitle: 'Book a Session',
    sessionTypeLabel: 'Session Type',
    scheduledAtLabel: 'Preferred Date & Time',
    privacyNote: 'Session content will not be shared with your organization. Conversations with your coach are confidential.',
    cancel: 'Cancel',
    booking: 'Booking...',
    confirm: 'Confirm Booking',
    toDashboardBack: '← Dashboard',
    selectTitle: 'Select a Coach',
    selectSubtitle: 'Choose the right coach and book a session.',
    noCoach: 'No available coaches at the moment. Please try again later.',
    sessionCount: (n: number) => `${n} sessions`,
    memberCount: (cur: number, max: number) => `${cur}/${max}`,
    bookWith: (name: string) => `Book a session with ${name}`,
    domainLabels: { sports: 'Sports', entertainment: 'Entertainment', corporate: 'Corporate' } as Record<string, string>,
    sessionTypeOptions: [
      { value: 'performance_routine',  label: 'Performance Routine Setup' },
      { value: 'pressure_training',    label: 'Pressure Response Training' },
      { value: 'slump_recovery',       label: 'Slump Recovery' },
      { value: 'career_anchoring',     label: 'Career Anchoring' },
      { value: 'team_dynamics',        label: 'Team Dynamics' },
      { value: 'energy_management',    label: 'Energy Management' },
    ],
  },
} as const;

export default function CoachMatch() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [coaches, setCoaches] = useState<B2BCoach[]>([]);
  const [selected, setSelected] = useState<B2BCoach | null>(null);
  const [step, setStep] = useState<'list' | 'book' | 'done'>('list');
  const [loading, setLoading] = useState(false);

  // 예약 폼
  const [bookForm, setBookForm] = useState({
    session_type: 'performance_routine',
    scheduled_at: '',
  });

  useEffect(() => {
    // 활성 코치 목록 조회
    veilorDb
      .from('b2b_coaches')
      .select('*')
      .eq('status', 'active')
      .lt('current_members', veilorDb.from('b2b_coaches').select('max_members') as unknown as number)
      .order('avg_rating', { ascending: false })
      .then(({ data }) => {
        // current_members < max_members 필터는 클라이언트에서 처리
        const available = (data ?? []).filter(
          (c: B2BCoach) => c.current_members < c.max_members
        ) as B2BCoach[];
        setCoaches(available);
      });
  }, []);

  const handleBook = async () => {
    if (!selected || !user || !orgId || !bookForm.scheduled_at) return;
    setLoading(true);

    try {
      const { error } = await veilorDb
        .from('b2b_coaching_sessions')
        .insert({
          member_id: user.id,
          org_id: orgId,
          coach_id: selected.user_id,
          trigger_type: 'member_request',
          session_type: bookForm.session_type,
          scheduled_at: new Date(bookForm.scheduled_at).toISOString(),
          status: 'scheduled',
          followup_needed: false,
          escalated_to_counseling: false,
        });

      if (error) throw new Error(error.message);

      setStep('done');
    } catch (e) {
      toast({
        title: s.bookError,
        description: e instanceof Error ? e.message : s.retryMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ── 완료 ──
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="text-4xl">✅</div>
          <div>
            <h1 className="text-xl font-bold">{s.doneTitle}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {selected?.display_name} · {bookForm.scheduled_at}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {s.donePrivacy}
          </p>
          <Button onClick={() => navigate(`/b2b/dashboard/${orgId}`)} className="w-full">
            {s.toDashboard}
          </Button>
        </div>
      </div>
    );
  }

  // ── 예약 폼 ──
  if (step === 'book' && selected) {
    // 가능한 날짜: 오늘 이후 30일 (최소 tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().slice(0, 16);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <button onClick={() => setStep('list')} className="text-sm text-muted-foreground hover:text-foreground">
            {s.backToList}
          </button>

          <div>
            <h1 className="text-xl font-bold">{s.bookTitle}</h1>
            <p className="text-muted-foreground text-sm mt-1">{selected.display_name}</p>
          </div>

          {/* 세션 유형 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{s.sessionTypeLabel}</p>
            <div className="space-y-1.5">
              {s.sessionTypeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setBookForm(f => ({ ...f, session_type: opt.value }))}
                  className={`w-full p-3 rounded-lg border text-left text-sm transition-colors ${
                    bookForm.session_type === opt.value
                      ? 'border-primary bg-primary/5 font-medium'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 일시 선택 */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium">{s.scheduledAtLabel}</p>
            <input
              type="datetime-local"
              min={minDate}
              value={bookForm.scheduled_at}
              onChange={e => setBookForm(f => ({ ...f, scheduled_at: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
            />
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            {s.privacyNote}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('list')} className="flex-1">{s.cancel}</Button>
            <Button
              onClick={handleBook}
              disabled={loading || !bookForm.scheduled_at}
              className="flex-1"
            >
              {loading ? s.booking : s.confirm}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── 코치 목록 ──
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <button onClick={() => navigate(`/b2b/dashboard/${orgId}`)} className="text-sm text-muted-foreground hover:text-foreground mb-2 block">
            {s.toDashboardBack}
          </button>
          <h1 className="text-2xl font-bold">{s.selectTitle}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {s.selectSubtitle}
          </p>
        </div>

        {coaches.length === 0 ? (
          <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
            {s.noCoach}
          </div>
        ) : (
          <div className="space-y-3">
            {coaches.map(coach => (
              <div
                key={coach.id}
                className={`rounded-xl border p-4 cursor-pointer transition-all ${
                  selected?.id === coach.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/40'
                }`}
                onClick={() => setSelected(coach)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{coach.display_name}</p>
                      {coach.avg_rating > 0 && (
                        <span className="text-xs text-amber-500 font-medium">
                          ★ {coach.avg_rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {coach.domains.map(d => (
                        <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {s.domainLabels[d] ?? d}
                        </span>
                      ))}
                      {coach.specialties?.map(sp => (
                        <span key={sp} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                          {sp}
                        </span>
                      ))}
                    </div>
                    {coach.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{coach.bio}</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-muted-foreground shrink-0">
                    <p>{s.sessionCount(coach.session_count)}</p>
                    <p>{s.memberCount(coach.current_members, coach.max_members)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <Button onClick={() => setStep('book')} className="w-full">
            {s.bookWith(selected.display_name)}
          </Button>
        )}
      </div>
    </div>
  );
}
