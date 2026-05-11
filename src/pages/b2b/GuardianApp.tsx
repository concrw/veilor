import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { B2BTraineeProfile, B2BOrgEvent } from '@/integrations/supabase/veilor-types';
import { useT } from '@/i18n/useT';
import { useLanguageContext } from '@/context/LanguageContext';

// ─────────────────────────────────────────────
// 이중언어 문자열

// ──────────────────────────────────────────────────────────────
// 보호자 앱: 자녀의 체크인 완료 여부·위기 알림·코칭 일정만 표시
// 개인 점수·자유 텍스트는 절대 노출하지 않는다 (RLS + UI 레벨 이중 차단)
// ──────────────────────────────────────────────────────────────

type CheckinSummary = {
  id: string;
  created_at: string;
  risk_level: 'normal' | 'low' | 'medium' | 'high';
  routing_result: string | null;
};

type CoachingSchedule = {
  id: string;
  scheduled_at: string;
  session_type: string;
  status: string;
};

const RISK_CONFIG = {
  normal: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  low:    { bg: 'bg-sky-50',    text: 'text-sky-700',    border: 'border-sky-200'   },
  medium: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  high:   { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'   },
} as const;

function fmtDatetime(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale === 'en' ? 'en-US' : 'ko-KR', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function fmtDateOnly(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-US' : 'ko-KR');
}

export default function GuardianApp() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const { language } = useLanguageContext();
  const t = useT();
  const s = t.b2bDomain.guardianApp;

  const [trainee,   setTrainee]   = useState<B2BTraineeProfile | null>(null);
  const [checkins,  setCheckins]  = useState<CheckinSummary[]>([]);
  const [coaching,  setCoaching]  = useState<CoachingSchedule[]>([]);
  const [events,    setEvents]    = useState<B2BOrgEvent[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState<'overview' | 'alerts' | 'schedule'>('overview');

  useEffect(() => {
    if (!user || !orgId) return;
    loadAll();
  }, [user, orgId]);

  useEffect(() => {
    if (!user || !orgId || !trainee) return;
    veilorDb
      .from('b2b_guardian_access_log' as never)
      .insert({
        guardian_user_id: user.id,
        trainee_user_id: trainee.user_id ?? trainee.id,
        org_id: orgId,
        access_type: 'view',
      } as never)
      .then(() => {})
      .catch(() => { console.warn('[GuardianApp] Access log write failed'); });
  }, [user, orgId, trainee]);

  const loadAll = async () => {
    setLoading(true);
    try {
      // 1) 보호자가 접근 가능한 trainee 프로필 (guardian_user_id = user.id)
      const { data: tp } = await veilorDb
        .from('b2b_trainee_profiles')
        .select('*')
        .eq('org_id', orgId)
        .eq('guardian_user_id', user!.id)
        .single();

      if (!tp) { setLoading(false); return; }
      setTrainee(tp as B2BTraineeProfile);

      // 2) 최근 30일 체크인 요약 (점수·자유텍스트 제외)
      const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();
      const { data: ci } = await veilorDb
        .from('b2b_checkin_sessions')
        .select('id, created_at, risk_level, routing_result')
        .eq('member_id', tp.user_id)
        .gte('created_at', since30)
        .order('created_at', { ascending: false });

      setCheckins((ci ?? []) as CheckinSummary[]);

      // 3) 예약된 코칭 세션 (upcoming)
      const { data: cs } = await veilorDb
        .from('b2b_coaching_sessions')
        .select('id, scheduled_at, session_type, status')
        .eq('member_id', tp.user_id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5);

      setCoaching((cs ?? []) as CoachingSchedule[]);

      // 4) 다가오는 이벤트
      const today = new Date().toISOString().split('T')[0];
      const { data: ev } = await veilorDb
        .from('b2b_org_events')
        .select('*')
        .eq('org_id', orgId)
        .gte('event_date', today)
        .order('event_date', { ascending: true })
        .limit(3);

      setEvents((ev ?? []) as B2BOrgEvent[]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!trainee) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground text-sm">{s.noTrainee}</p>
          <button onClick={() => navigate(-1)} className="text-sm text-primary underline">{s.goBack}</button>
        </div>
      </div>
    );
  }

  // ── 집계 계산 ──
  const last7 = checkins.filter(c => {
    const d = new Date(c.created_at);
    return Date.now() - d.getTime() < 7 * 86400_000;
  });
  const alertCheckins = checkins.filter(c => c.risk_level === 'medium' || c.risk_level === 'high');
  const hasHighAlert  = checkins.some(c => c.risk_level === 'high' && Date.now() - new Date(c.created_at).getTime() < 3 * 86400_000);
  const completionRate = last7.length; // 최대 7회

  const tabItems = [
    { key: 'overview' as const,  label: s.tabs.overview },
    { key: 'alerts' as const,    label: s.tabs.alerts(alertCheckins.length) },
    { key: 'schedule' as const,  label: s.tabs.schedule },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground text-sm">←</button>
        <div>
          <h1 className="font-bold text-base">{s.headerTitle}</h1>
          <p className="text-xs text-muted-foreground">{trainee.display_name ?? s.childLabel} · {orgId}</p>
        </div>
      </div>

      {/* 위기 배너 */}
      {hasHighAlert && (
        <div className="bg-red-600 text-white px-4 py-3 text-sm">
          <p className="font-semibold">{s.highBannerTitle}</p>
          <p className="text-xs mt-0.5 opacity-90">{s.highBannerDesc}</p>
          <p className="text-xs mt-1 font-medium">{s.highBannerHotline}</p>
        </div>
      )}

      {/* 탭 */}
      <div className="flex border-b bg-white">
        {tabItems.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-5">

        {/* ── 개요 탭 ── */}
        {tab === 'overview' && (
          <>
            {/* 7일 체크인 현황 */}
            <div className="rounded-xl border bg-white p-4 space-y-3">
              <h2 className="font-semibold text-sm">{s.checkin7dTitle}</h2>
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold text-primary">{completionRate}<span className="text-lg font-normal text-muted-foreground">/7</span></div>
                <div className="flex-1 space-y-1">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(completionRate / 7) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {s.completionMsg(completionRate)}
                  </p>
                </div>
              </div>
            </div>

            {/* 최근 체크인 기록 (날짜·완료 여부만) */}
            <div className="rounded-xl border bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm">{s.checkinHistoryTitle}</h2>
                <p className="text-xs text-muted-foreground">{s.noScoreNote}</p>
              </div>
              {checkins.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{s.noHistory}</p>
              ) : (
                <div className="space-y-2">
                  {checkins.slice(0, 10).map(c => {
                    const cfg = RISK_CONFIG[c.risk_level] ?? RISK_CONFIG.normal;
                    const riskLabel = s.riskLabels[c.risk_level] ?? c.risk_level;
                    return (
                      <div key={c.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                        <span className="text-sm text-muted-foreground">{fmtDatetime(c.created_at, language)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                          {riskLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 다가오는 이벤트 */}
            {events.length > 0 && (
              <div className="rounded-xl border bg-white p-4 space-y-2">
                <h2 className="font-semibold text-sm">{s.upcomingEventsTitle}</h2>
                {events.map(ev => {
                  const days = Math.ceil(
                    (new Date(ev.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div key={ev.id} className="flex items-center justify-between text-sm py-1">
                      <span>{ev.event_name}</span>
                      <span className={`text-xs font-semibold ${days <= 7 ? 'text-primary' : 'text-muted-foreground'}`}>
                        D-{days}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 개인정보 보호 안내 */}
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{s.privacyTitle}</p>
              <p>{s.privacyDesc1}</p>
              <p>{s.privacyDesc2}</p>
            </div>
          </>
        )}

        {/* ── 알림 탭 ── */}
        {tab === 'alerts' && (
          <>
            {alertCheckins.length === 0 ? (
              <div className="rounded-xl border bg-white p-8 text-center">
                <p className="text-2xl mb-2">✅</p>
                <p className="text-sm text-muted-foreground">{s.noAlerts}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alertCheckins.map(c => {
                  const cfg = RISK_CONFIG[c.risk_level];
                  const riskLabel = s.riskLabels[c.risk_level] ?? c.risk_level;
                  return (
                    <div key={c.id} className={`rounded-xl border p-4 space-y-2 ${cfg.bg} ${cfg.border}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${cfg.text}`}>{s.alertSignal(riskLabel)}</span>
                        <span className="text-xs text-muted-foreground">{fmtDatetime(c.created_at, language)}</span>
                      </div>
                      {c.risk_level === 'high' && (
                        <p className={`text-xs ${cfg.text}`}>
                          {s.highAlertDesc}
                        </p>
                      )}
                      {c.risk_level === 'medium' && (
                        <p className={`text-xs ${cfg.text}`}>
                          {s.mediumAlertDesc}
                        </p>
                      )}
                      {c.routing_result === 'coaching' && (
                        <p className="text-xs text-muted-foreground">{s.coachingRec}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 위기 시 행동 지침 */}
            <div className="rounded-xl border bg-white p-4 space-y-3">
              <h2 className="font-semibold text-sm">{s.crisisGuideTitle}</h2>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p><span className="font-medium text-foreground">{s.crisisStep1}</span> {s.crisisStep1Desc}</p>
                <p><span className="font-medium text-foreground">{s.crisisStep2}</span> {s.crisisStep2Desc}</p>
                <p><span className="font-medium text-foreground">{s.crisisStep3}</span> {s.crisisStep3Desc}</p>
              </div>
            </div>
          </>
        )}

        {/* ── 일정 탭 ── */}
        {tab === 'schedule' && (
          <>
            <div className="rounded-xl border bg-white p-4 space-y-3">
              <h2 className="font-semibold text-sm">{s.coachSessionTitle}</h2>
              {coaching.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{s.noCoachSession}</p>
              ) : (
                <div className="space-y-3">
                  {coaching.map(cs => (
                    <div key={cs.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium">
                          {s.sessionTypeLabels[cs.session_type] ?? cs.session_type}
                        </p>
                        <p className="text-xs text-muted-foreground">{fmtDatetime(cs.scheduled_at, language)}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        cs.status === 'scheduled'
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {cs.status === 'scheduled' ? s.statusScheduled : cs.status === 'completed' ? s.statusCompleted : cs.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 이벤트 일정 */}
            {events.length > 0 && (
              <div className="rounded-xl border bg-white p-4 space-y-3">
                <h2 className="font-semibold text-sm">{s.eventScheduleTitle}</h2>
                {events.map(ev => (
                  <div key={ev.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{ev.event_name}</p>
                      <p className="text-xs text-muted-foreground">{fmtDateOnly(ev.event_date, language)}</p>
                    </div>
                    <span className="text-xs font-bold text-primary">
                      D-{Math.ceil((new Date(ev.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              {s.sessionPrivacyNote}
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
