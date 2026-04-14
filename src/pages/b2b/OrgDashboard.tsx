import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { veilorDb } from '@/integrations/supabase/client';
import { useOrgAggregate, useOrgEvents, useOrgMembers } from '@/hooks/useB2BOrg';
import type { B2BOrg, B2BOrgAggregate } from '@/integrations/supabase/veilor-types';

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
function RiskBadge({ level, count }: { level: string; count: number }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    high:   { label: '즉시 대응', cls: 'bg-red-100 text-red-700 border-red-200' },
    medium: { label: '24h 내 연락', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    low:    { label: '모니터링', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    normal: { label: '정상', cls: 'bg-green-50 text-green-700 border-green-200' },
  };
  const { label, cls } = cfg[level] ?? cfg.normal;
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${cls}`}>
      <span className="font-medium">{label}</span>
      <span className="font-bold">{count}명</span>
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

  const [org, setOrg] = useState<B2BOrg | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'events' | 'coaching'>('overview');

  const { aggregates, fetchAggregate } = useOrgAggregate(orgId ?? '', 8);
  const { events, fetchEvents, addEvent } = useOrgEvents(orgId ?? '');
  const { members, fetchMembers } = useOrgMembers(orgId ?? '');

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
  }, [orgId]);

  const latest = aggregates[0] ?? null;
  const trendData = toTrendData(aggregates);
  const radarData = toRadarData(latest);

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

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{org?.name ?? '대시보드'}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {org?.org_type === 'sports' ? '스포츠' : org?.org_type === 'entertainment' ? '엔터테인먼트' : '기업'} ·{' '}
            {org?.plan?.replace('_', ' ').toUpperCase()} · 멤버 {org?.member_count ?? 0}명
          </p>
        </div>
        <button
          onClick={() => navigate(`/b2b/invite/${orgId}`)}
          className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          + 멤버 초대
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
              {{ overview: '개요', members: '멤버', events: '이벤트', coaching: '코칭' }[tab]}
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
              <span>개인 세션 내용은 표시되지 않습니다. 팀 집계 및 익명 인원 수만 표시됩니다.</span>
            </div>

            {/* 지표 카드 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard
                label="이번 주 퍼포먼스 지수"
                value={perfIndex !== null ? `${perfIndex}` : '—'}
                sub="100점 만점"
                accent
              />
              <MetricCard
                label="체크인 참여율"
                value={latest ? `${latest.checkin_rate?.toFixed(0) ?? 0}%` : '—'}
                sub={`${latest?.checkin_count ?? 0}건 완료`}
              />
              <MetricCard
                label="코칭 세션"
                value={latest ? `${latest.coaching_sessions_count}건` : '—'}
                sub={latest?.coaching_avg_rating ? `만족도 ${latest.coaching_avg_rating.toFixed(1)}/5` : ''}
              />
              <MetricCard
                label="전체 멤버"
                value={`${org?.member_count ?? 0}명`}
                sub={`활성 ${members.length}명`}
              />
            </div>

            {/* 위험 인원 현황 */}
            {latest && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold">이번 주 멘탈 컨디션 현황</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <RiskBadge level="high"   count={latest.risk_high_count} />
                  <RiskBadge level="medium" count={latest.risk_medium_count} />
                  <RiskBadge level="low"    count={latest.risk_low_count} />
                  <RiskBadge level="normal" count={latest.risk_normal_count} />
                </div>
                {latest.risk_high_count > 0 && (
                  <p className="text-xs text-red-600 font-medium">
                    ⚠ 즉시 대응 필요 인원 {latest.risk_high_count}명 — 코치 알림 발송됨 (2시간 내 연락 의무)
                  </p>
                )}
              </div>
            )}

            {/* 4C 레이더 + 트렌드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* 레이더 */}
              <div className="rounded-xl border p-4">
                <h2 className="text-sm font-semibold mb-3">이번 주 4C 팀 평균</h2>
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
                    데이터 없음
                  </div>
                )}
              </div>

              {/* 트렌드 라인 */}
              <div className="rounded-xl border p-4">
                <h2 className="text-sm font-semibold mb-3">주간 4C 평균 트렌드</h2>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(v: number) => [`${v.toFixed(1)}`, '4C 평균']}
                      />
                      <Line type="monotone" dataKey="avg" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                    데이터 없음 — 체크인 후 표시됩니다
                  </div>
                )}
              </div>
            </div>

            {/* 다음 이벤트 */}
            {events.length > 0 && (
              <div className="rounded-xl border p-4 space-y-2">
                <h2 className="text-sm font-semibold">예정 이벤트</h2>
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
              <h2 className="text-sm font-semibold">멤버 목록 ({members.length}명)</h2>
              <button
                onClick={() => navigate(`/b2b/invite/${orgId}`)}
                className="text-xs text-primary hover:underline"
              >
                + 멤버 추가
              </button>
            </div>
            {members.length === 0 ? (
              <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
                멤버가 없습니다. 초대를 시작해보세요.
              </div>
            ) : (
              <div className="rounded-xl border divide-y">
                {members.map(m => (
                  <div key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{m.user_id.slice(0, 8)}…</p>
                      <p className="text-xs text-muted-foreground">
                        {m.member_type === 'trainee' ? '트레이니' : m.member_type === 'admin' ? '어드민' : '멤버'} ·
                        {new Date(m.joined_at).toLocaleDateString('ko-KR')} 합류
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                    }`}>
                      {m.status === 'active' ? '활성' : '비활성'}
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
              <h2 className="text-sm font-semibold">이벤트 캘린더</h2>
              <button
                onClick={() => setShowEventForm(v => !v)}
                className="text-xs text-primary hover:underline"
              >
                + 이벤트 추가
              </button>
            </div>

            {/* 이벤트 추가 폼 */}
            {showEventForm && (
              <div className="rounded-xl border p-4 space-y-3">
                <h3 className="text-sm font-medium">새 이벤트</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={eventForm.event_type}
                    onChange={e => setEventForm(f => ({ ...f, event_type: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm bg-background"
                  >
                    <option value="">유형 선택</option>
                    <optgroup label="스포츠">
                      <option value="game">경기</option>
                      <option value="training_camp">전지훈련</option>
                      <option value="tryout">트라이아웃</option>
                    </optgroup>
                    <optgroup label="엔터테인먼트">
                      <option value="comeback">컴백</option>
                      <option value="audition">오디션/심사</option>
                      <option value="hiatus">활동 중단</option>
                    </optgroup>
                    <optgroup label="기업">
                      <option value="quarterly_close">분기 마감</option>
                      <option value="hr_review">인사고과</option>
                      <option value="reorg">조직 개편</option>
                    </optgroup>
                  </select>
                  <input
                    type="text"
                    placeholder="이벤트명 (예: 3분기 컴백)"
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
                    취소
                  </button>
                  <button
                    onClick={handleAddEvent}
                    className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground"
                  >
                    저장
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  * 저장 시 D-21, D-7, D-day, D+3, D+14 자동 체크인이 설정됩니다.
                </p>
              </div>
            )}

            {events.length === 0 ? (
              <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
                예정된 이벤트가 없습니다.
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
                          {e.auto_checkin && ' · 자동 체크인 ON'}
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
              <h2 className="text-sm font-semibold">코칭 현황</h2>
              <button
                onClick={() => navigate(`/b2b/coach-match/${orgId}`)}
                className="text-xs text-primary hover:underline"
              >
                코치 배정 관리 →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MetricCard
                label="이번 달 세션"
                value={latest ? `${latest.coaching_sessions_count}건` : '—'}
              />
              <MetricCard
                label="평균 만족도"
                value={latest?.coaching_avg_rating ? `${latest.coaching_avg_rating.toFixed(1)} / 5` : '—'}
              />
              <MetricCard
                label="플랜 포함 세션"
                value="2회/인/월"
                sub="추가 세션 55,000원/회"
              />
            </div>

            <div className="rounded-xl border p-4 text-sm text-muted-foreground text-center">
              세션별 상세 내용은 개인정보 보호 정책에 의해 표시되지 않습니다.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
