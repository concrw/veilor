import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { veilorDb } from '@/integrations/supabase/client';
import { useOrgAggregate, useOrgEvents, useOrgMembers, useOrgWorkAggregate } from '@/hooks/useB2BOrg';
import type { B2BOrg, B2BOrgAggregate, OrgWorkAggregate } from '@/integrations/supabase/veilor-types';
import { useLanguageContext } from '@/context/LanguageContext';

// ─────────────────────────────────────────────
// 이중언어 문자열
// ─────────────────────────────────────────────
const S = {
  ko: {
    dashboard: '대시보드',
    orgTypeLabels: { sports: '스포츠', entertainment: '엔터테인먼트', corporate: '기업' } as Record<string, string>,
    memberCount: (n: number) => `멤버 ${n}명`,
    inviteMember: '+ 멤버 초대',
    tabs: { overview: '개요', members: '멤버', events: '이벤트', coaching: '코칭' } as Record<string, string>,
    privacyNote: '개인 세션 내용은 표시되지 않습니다. 팀 집계 및 익명 인원 수만 표시됩니다.',
    perfIndexLabel: '이번 주 퍼포먼스 지수',
    perfIndexSub: '100점 만점',
    checkinRateLabel: '체크인 참여율',
    checkinDone: (n: number) => `${n}건 완료`,
    coachingSessionLabel: '코칭 세션',
    satisfactionSub: (r: string) => `만족도 ${r}/5`,
    totalMemberLabel: '전체 멤버',
    activeMemberSub: (n: number) => `활성 ${n}명`,
    weekConditionTitle: '이번 주 멘탈 컨디션 현황',
    riskHighLabel: '즉시 대응',
    riskMediumLabel: '24h 내 연락',
    riskLowLabel: '모니터링',
    riskNormalLabel: '정상',
    riskHighAlert: (n: number) => `⚠ 즉시 대응 필요 인원 ${n}명 — 코치 알림 발송됨 (2시간 내 연락 의무)`,
    radarTitle: '이번 주 4C 팀 평균',
    trendTitle: '주간 4C 평균 트렌드',
    noData: '데이터 없음',
    noDataTrend: '데이터 없음 — 체크인 후 표시됩니다',
    upcomingEventTitle: '예정 이벤트',
    membersTabTitle: (n: number) => `멤버 목록 (${n}명)`,
    addMember: '+ 멤버 추가',
    noMember: '멤버가 없습니다. 초대를 시작해보세요.',
    memberType: { trainee: '트레이니', admin: '어드민', member: '멤버' } as Record<string, string>,
    joined: '합류',
    statusActive: '활성',
    statusInactive: '비활성',
    eventCalendarTitle: '이벤트 캘린더',
    addEvent: '+ 이벤트 추가',
    newEventTitle: '새 이벤트',
    eventTypeSelect: '유형 선택',
    eventOptGroups: { sports: '스포츠', entertainment: '엔터테인먼트', corporate: '기업' } as Record<string, string>,
    eventOptions: {
      game: '경기', training_camp: '전지훈련', tryout: '트라이아웃',
      comeback: '컴백', audition: '오디션/심사', hiatus: '활동 중단',
      quarterly_close: '분기 마감', hr_review: '인사고과', reorg: '조직 개편',
    } as Record<string, string>,
    eventNamePlaceholder: '이벤트명 (예: 3분기 컴백)',
    cancelBtn: '취소',
    saveBtn: '저장',
    autoCheckinNote: '* 저장 시 D-21, D-7, D-day, D+3, D+14 자동 체크인이 설정됩니다.',
    autoCheckinOn: '· 자동 체크인 ON',
    noEvent: '예정된 이벤트가 없습니다.',
    coachingTabTitle: '코칭 현황',
    coachManage: '코치 배정 관리 →',
    thisMonthSession: '이번 달 세션',
    avgSatisfaction: '평균 만족도',
    planIncluded: '플랜 포함 세션',
    planIncludedValue: '2회/인/월',
    planExtraNote: '추가 세션 55,000원/회',
    sessionPrivacy: '세션별 상세 내용은 개인정보 보호 정책에 의해 표시되지 않습니다.',
    fourCAvgTooltip: '4C 평균',
    tbqcTitle: 'Work 퍼포먼스 집계 (익명)',
    completionRateLabel: '팀 완료율',
    tbqcAccuracyLabel: 'TBQC 정확도',
    rolloverLabel: '롤오버 태스크',
    activeMembersWorkLabel: 'Work 활성 멤버',
    burnoutAlert: '팀 완료율이 낮고 롤오버가 누적되었습니다. 번아웃 리스크를 확인하세요.',
  },
  en: {
    dashboard: 'Dashboard',
    orgTypeLabels: { sports: 'Sports', entertainment: 'Entertainment', corporate: 'Corporate' } as Record<string, string>,
    memberCount: (n: number) => `${n} Members`,
    inviteMember: '+ Invite Member',
    tabs: { overview: 'Overview', members: 'Members', events: 'Events', coaching: 'Coaching' } as Record<string, string>,
    privacyNote: 'Individual session content is not shown. Only team aggregates and anonymized counts are displayed.',
    perfIndexLabel: 'Weekly Performance Index',
    perfIndexSub: 'Out of 100',
    checkinRateLabel: 'Check-in Rate',
    checkinDone: (n: number) => `${n} completed`,
    coachingSessionLabel: 'Coaching Sessions',
    satisfactionSub: (r: string) => `Satisfaction ${r}/5`,
    totalMemberLabel: 'Total Members',
    activeMemberSub: (n: number) => `${n} active`,
    weekConditionTitle: 'This Week\'s Mental Condition',
    riskHighLabel: 'Immediate Action',
    riskMediumLabel: 'Contact in 24h',
    riskLowLabel: 'Monitoring',
    riskNormalLabel: 'Normal',
    riskHighAlert: (n: number) => `⚠ ${n} members need immediate action — Coach notified (must contact within 2 hours)`,
    radarTitle: 'This Week\'s 4C Team Average',
    trendTitle: 'Weekly 4C Average Trend',
    noData: 'No data',
    noDataTrend: 'No data — Will appear after check-ins',
    upcomingEventTitle: 'Upcoming Events',
    membersTabTitle: (n: number) => `Member List (${n})`,
    addMember: '+ Add Member',
    noMember: 'No members yet. Start by inviting some.',
    memberType: { trainee: 'Trainee', admin: 'Admin', member: 'Member' } as Record<string, string>,
    joined: 'Joined',
    statusActive: 'Active',
    statusInactive: 'Inactive',
    eventCalendarTitle: 'Event Calendar',
    addEvent: '+ Add Event',
    newEventTitle: 'New Event',
    eventTypeSelect: 'Select type',
    eventOptGroups: { sports: 'Sports', entertainment: 'Entertainment', corporate: 'Corporate' } as Record<string, string>,
    eventOptions: {
      game: 'Game', training_camp: 'Training Camp', tryout: 'Tryout',
      comeback: 'Comeback', audition: 'Audition', hiatus: 'Hiatus',
      quarterly_close: 'Quarterly Close', hr_review: 'HR Review', reorg: 'Reorganization',
    } as Record<string, string>,
    eventNamePlaceholder: 'Event name (e.g. Q3 Comeback)',
    cancelBtn: 'Cancel',
    saveBtn: 'Save',
    autoCheckinNote: '* Saving will set auto check-ins at D-21, D-7, D-day, D+3, D+14.',
    autoCheckinOn: '· Auto Check-in ON',
    noEvent: 'No upcoming events.',
    coachingTabTitle: 'Coaching Status',
    coachManage: 'Manage Coach Assignment →',
    thisMonthSession: 'Sessions This Month',
    avgSatisfaction: 'Avg Satisfaction',
    planIncluded: 'Plan-included Sessions',
    planIncludedValue: '2/person/month',
    planExtraNote: 'Additional session: ₩55,000/session',
    sessionPrivacy: 'Individual session details are not shown per our privacy policy.',
    fourCAvgTooltip: '4C Avg',
    tbqcTitle: 'Work Performance (Anonymous)',
    completionRateLabel: 'Team Completion Rate',
    tbqcAccuracyLabel: 'TBQC Accuracy',
    rolloverLabel: 'Rollover Tasks',
    activeMembersWorkLabel: 'Active Work Members',
    burnoutAlert: 'Low completion rate and high rollovers detected. Check for burnout risk.',
  },
} as const;

// ─────────────────────────────────────────────
// 서브 컴포넌트: 지표 카드
// ─────────────────────────────────────────────
function MetricCard({ label, value, sub, accent }: {
  label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 space-y-1 ${accent ? 'border-primary/30 bg-primary/5' : ''}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// 서브 컴포넌트: 위험 인원 배지
// ─────────────────────────────────────────────
function RiskBadge({ level, count, s }: { level: string; count: number; s: typeof S['ko'] }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    high:   { label: s.riskHighLabel,   cls: 'bg-red-100 text-red-700 border-red-200' },
    medium: { label: s.riskMediumLabel, cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    low:    { label: s.riskLowLabel,    cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    normal: { label: s.riskNormalLabel, cls: 'bg-green-50 text-green-700 border-green-200' },
  };
  const { label, cls } = cfg[level] ?? cfg.normal;
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${cls}`}>
      <span className="font-medium">{label}</span>
      <span className="font-bold">{count}{s.memberCount(1).replace('1', '')}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// 4C 레이더 차트용 데이터 변환
// ─────────────────────────────────────────────
function toRadarData(agg: B2BOrgAggregate | null) {
  if (!agg) return [];
  return [
    { axis: 'Control',    value: Number(agg.avg_c_control    ?? 0) },
    { axis: 'Commitment', value: Number(agg.avg_c_commitment ?? 0) },
    { axis: 'Challenge',  value: Number(agg.avg_c_challenge  ?? 0) },
    { axis: 'Confidence', value: Number(agg.avg_c_confidence ?? 0) },
  ];
}

// 주간 트렌드 라인차트용 데이터 변환
function toTrendData(aggregates: B2BOrgAggregate[]) {
  return [...aggregates].reverse().map(a => ({
    week: a.week_start.slice(5),   // MM-DD
    avg: Number(a.avg_4c ?? 0),
    rate: Number(a.checkin_rate ?? 0),
  }));
}

// ─────────────────────────────────────────────
// 메인 대시보드
// ─────────────────────────────────────────────
export default function OrgDashboard() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [org, setOrg] = useState<B2BOrg | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'events' | 'coaching'>('overview');

  const { aggregates, fetchAggregate } = useOrgAggregate(orgId ?? '', 8);
  const { events, fetchEvents, addEvent } = useOrgEvents(orgId ?? '');
  const { members, fetchMembers } = useOrgMembers(orgId ?? '');
  const { data: workAgg, fetchWorkAggregate } = useOrgWorkAggregate(orgId ?? '', 4);

  // 이벤트 추가 폼 상태
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ event_type: '', event_name: '', event_date: '' });

  useEffect(() => {
    if (!orgId) return;
    // 고객사 정보 조회
    veilorDb.from('b2b_orgs').select('*').eq('id', orgId).single().then(({ data }) => {
      if (data) setOrg(data as B2BOrg);
    });
    fetchAggregate();
    fetchEvents();
    fetchMembers();
    fetchWorkAggregate();
  }, [orgId]);

  const latest = aggregates[0] ?? null;
  const trendData = toTrendData(aggregates);
  const radarData = toRadarData(latest);
  const latestWork: OrgWorkAggregate | null = workAgg[0] ?? null;
  const burnoutRisk = latestWork != null
    && (latestWork.completion_rate ?? 100) < 40
    && latestWork.rollover_count >= 3;

  // 퍼포먼스 지수 (4C avg × 10, 100점 만점)
  const perfIndex = latest ? Math.round(Number(latest.avg_4c ?? 0) * 10) : null;

  const handleAddEvent = async () => {
    if (!orgId || !eventForm.event_type || !eventForm.event_name || !eventForm.event_date) return;
    try {
      await addEvent({
        org_id: orgId,
        event_type: eventForm.event_type,
        event_name: eventForm.event_name,
        event_date: eventForm.event_date,
        auto_checkin: true,
        checkin_schedule: { d_minus_21: true, d_minus_7: true, d_day: true, d_plus_3: true, d_plus_14: true },
        meta: {},
        target_member_ids: null,
      });
      setEventForm({ event_type: '', event_name: '', event_date: '' });
      setShowEventForm(false);
    } catch (e) {
      console.error(e);
    }
  };

  const locale = language === 'en' ? 'en-US' : 'ko-KR';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{org?.name ?? s.dashboard}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {org?.org_type ? s.orgTypeLabels[org.org_type] ?? org.org_type : ''} ·{' '}
            {org?.plan?.replace('_', ' ').toUpperCase()} · {s.memberCount(org?.member_count ?? 0)}
          </p>
        </div>
        <button
          onClick={() => navigate(`/b2b/invite/${orgId}`)}
          className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {s.inviteMember}
        </button>
      </div>

      {/* 탭 */}
      <div className="border-b px-6">
        <div className="flex gap-6">
          {(['overview', 'members', 'events', 'coaching'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-foreground font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.tabs[tab]}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 max-w-5xl">

        {/* 개요 탭 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* 개인정보 보호 안내 */}
            <div className="rounded-lg bg-muted/40 px-4 py-3 text-xs text-muted-foreground flex items-start gap-2">
              <span>🔒</span>
              <span>{s.privacyNote}</span>
            </div>

            {/* 지표 카드 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard
                label={s.perfIndexLabel}
                value={perfIndex !== null ? `${perfIndex}` : '—'}
                sub={s.perfIndexSub}
                accent
              />
              <MetricCard
                label={s.checkinRateLabel}
                value={latest ? `${latest.checkin_rate?.toFixed(0) ?? 0}%` : '—'}
                sub={s.checkinDone(latest?.checkin_count ?? 0)}
              />
              <MetricCard
                label={s.coachingSessionLabel}
                value={latest ? `${latest.coaching_sessions_count}` : '—'}
                sub={latest?.coaching_avg_rating ? s.satisfactionSub(latest.coaching_avg_rating.toFixed(1)) : ''}
              />
              <MetricCard
                label={s.totalMemberLabel}
                value={`${org?.member_count ?? 0}`}
                sub={s.activeMemberSub(members.length)}
              />
            </div>

            {/* 위험 인원 현황 */}
            {latest && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold">{s.weekConditionTitle}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <RiskBadge level="high"   count={latest.risk_high_count}   s={s} />
                  <RiskBadge level="medium" count={latest.risk_medium_count} s={s} />
                  <RiskBadge level="low"    count={latest.risk_low_count}    s={s} />
                  <RiskBadge level="normal" count={latest.risk_normal_count} s={s} />
                </div>
                {latest.risk_high_count > 0 && (
                  <p className="text-xs text-red-600 font-medium">
                    {s.riskHighAlert(latest.risk_high_count)}
                  </p>
                )}
              </div>
            )}

            {/* TBQC Work 퍼포먼스 집계 */}
            {workAgg.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold">{s.tbqcTitle}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricCard
                    label={s.completionRateLabel}
                    value={`${latestWork?.completion_rate?.toFixed(0) ?? '—'}%`}
                    accent
                  />
                  <MetricCard
                    label={s.tbqcAccuracyLabel}
                    value={latestWork?.avg_tbqc_accuracy != null
                      ? `${(latestWork.avg_tbqc_accuracy * 100).toFixed(0)}%`
                      : '—'
                    }
                  />
                  <MetricCard
                    label={s.rolloverLabel}
                    value={`${latestWork?.rollover_count ?? '—'}`}
                  />
                  <MetricCard
                    label={s.activeMembersWorkLabel}
                    value={`${latestWork?.active_member_count ?? '—'}`}
                  />
                </div>
                {burnoutRisk && (
                  <p className="text-xs text-red-600 font-medium">{s.burnoutAlert}</p>
                )}
              </div>
            )}

            {/* 4C 레이더 + 트렌드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* 레이더 */}
              <div className="rounded-xl border p-4">
                <h2 className="text-sm font-semibold mb-3">{s.radarTitle}</h2>
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                      <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                    {s.noData}
                  </div>
                )}
              </div>

              {/* 트렌드 라인 */}
              <div className="rounded-xl border p-4">
                <h2 className="text-sm font-semibold mb-3">{s.trendTitle}</h2>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(v: number) => [`${v.toFixed(1)}`, s.fourCAvgTooltip]}
                      />
                      <Line type="monotone" dataKey="avg" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                    {s.noDataTrend}
                  </div>
                )}
              </div>
            </div>

            {/* 다음 이벤트 */}
            {events.length > 0 && (
              <div className="rounded-xl border p-4 space-y-2">
                <h2 className="text-sm font-semibold">{s.upcomingEventTitle}</h2>
                <div className="space-y-1.5">
                  {events.slice(0, 3).map(e => {
                    const daysLeft = Math.ceil(
                      (new Date(e.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <div key={e.id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{e.event_name}</span>
                        <span className={`text-xs font-medium ${
                          daysLeft <= 7 ? 'text-amber-600' : 'text-muted-foreground'
                        }`}>
                          D-{daysLeft} ({e.event_date})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 멤버 탭 */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{s.membersTabTitle(members.length)}</h2>
              <button
                onClick={() => navigate(`/b2b/invite/${orgId}`)}
                className="text-xs text-primary hover:underline"
              >
                {s.addMember}
              </button>
            </div>
            {members.length === 0 ? (
              <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
                {s.noMember}
              </div>
            ) : (
              <div className="rounded-xl border divide-y">
                {members.map(m => (
                  <div key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{m.user_id.slice(0, 8)}…</p>
                      <p className="text-xs text-muted-foreground">
                        {s.memberType[m.member_type] ?? m.member_type} ·
                        {new Date(m.joined_at).toLocaleDateString(locale)} {s.joined}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                    }`}>
                      {m.status === 'active' ? s.statusActive : s.statusInactive}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 이벤트 탭 */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{s.eventCalendarTitle}</h2>
              <button
                onClick={() => setShowEventForm(v => !v)}
                className="text-xs text-primary hover:underline"
              >
                {s.addEvent}
              </button>
            </div>

            {/* 이벤트 추가 폼 */}
            {showEventForm && (
              <div className="rounded-xl border p-4 space-y-3">
                <h3 className="text-sm font-medium">{s.newEventTitle}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={eventForm.event_type}
                    onChange={e => setEventForm(f => ({ ...f, event_type: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm bg-background"
                  >
                    <option value="">{s.eventTypeSelect}</option>
                    <optgroup label={s.eventOptGroups.sports}>
                      <option value="game">{s.eventOptions.game}</option>
                      <option value="training_camp">{s.eventOptions.training_camp}</option>
                      <option value="tryout">{s.eventOptions.tryout}</option>
                    </optgroup>
                    <optgroup label={s.eventOptGroups.entertainment}>
                      <option value="comeback">{s.eventOptions.comeback}</option>
                      <option value="audition">{s.eventOptions.audition}</option>
                      <option value="hiatus">{s.eventOptions.hiatus}</option>
                    </optgroup>
                    <optgroup label={s.eventOptGroups.corporate}>
                      <option value="quarterly_close">{s.eventOptions.quarterly_close}</option>
                      <option value="hr_review">{s.eventOptions.hr_review}</option>
                      <option value="reorg">{s.eventOptions.reorg}</option>
                    </optgroup>
                  </select>
                  <input
                    type="text"
                    placeholder={s.eventNamePlaceholder}
                    value={eventForm.event_name}
                    onChange={e => setEventForm(f => ({ ...f, event_name: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm bg-background"
                  />
                  <input
                    type="date"
                    value={eventForm.event_date}
                    onChange={e => setEventForm(f => ({ ...f, event_date: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm bg-background"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowEventForm(false)}
                    className="text-xs px-3 py-1.5 border rounded-lg text-muted-foreground"
                  >
                    {s.cancelBtn}
                  </button>
                  <button
                    onClick={handleAddEvent}
                    className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground"
                  >
                    {s.saveBtn}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {s.autoCheckinNote}
                </p>
              </div>
            )}

            {events.length === 0 ? (
              <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
                {s.noEvent}
              </div>
            ) : (
              <div className="rounded-xl border divide-y">
                {events.map(e => {
                  const daysLeft = Math.ceil(
                    (new Date(e.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div key={e.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{e.event_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {e.event_type} · {e.event_date}
                          {e.auto_checkin && ` ${s.autoCheckinOn}`}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        daysLeft <= 7 ? 'bg-amber-100 text-amber-700' :
                        daysLeft <= 21 ? 'bg-blue-50 text-blue-700' : 'bg-muted text-muted-foreground'
                      }`}>
                        D-{daysLeft}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 코칭 탭 */}
        {activeTab === 'coaching' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{s.coachingTabTitle}</h2>
              <button
                onClick={() => navigate(`/b2b/coach-match/${orgId}`)}
                className="text-xs text-primary hover:underline"
              >
                {s.coachManage}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MetricCard
                label={s.thisMonthSession}
                value={latest ? `${latest.coaching_sessions_count}` : '—'}
              />
              <MetricCard
                label={s.avgSatisfaction}
                value={latest?.coaching_avg_rating ? `${latest.coaching_avg_rating.toFixed(1)} / 5` : '—'}
              />
              <MetricCard
                label={s.planIncluded}
                value={s.planIncludedValue}
                sub={s.planExtraNote}
              />
            </div>

            <div className="rounded-xl border p-4 text-sm text-muted-foreground text-center">
              {s.sessionPrivacy}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
