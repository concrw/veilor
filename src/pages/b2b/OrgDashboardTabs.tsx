import { useNavigate } from 'react-router-dom';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { B2BOrgAggregate, OrgWorkAggregate, B2BOrg } from '@/integrations/supabase/veilor-types';
import type { LocaleResource } from '@/i18n/types';

type S = LocaleResource['b2bDomain']['orgDashboard'];

interface MetricCardProps { label: string; value: string; sub?: string; accent?: boolean; }

export function MetricCard({ label, value, sub, accent }: MetricCardProps) {
  return (
    <div className={`rounded-xl border p-4 space-y-1 ${accent ? 'border-primary/30 bg-primary/5' : ''}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function RiskBadge({ level, count, s }: { level: string; count: number; s: S }) {
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

// ── OverviewTab ─────────────────────────────────────────────────────────────

interface OverviewTabProps {
  org: B2BOrg | null;
  latest: B2BOrgAggregate | null;
  perfIndex: number | null;
  members: { id: string }[];
  workAgg: OrgWorkAggregate[];
  latestWork: OrgWorkAggregate | null;
  burnoutRisk: boolean;
  radarData: { axis: string; value: number }[];
  trendData: { week: string; avg: number; rate: number }[];
  events: { id: string; event_name: string; event_date: string }[];
  s: S;
}

export function OverviewTab({
  org, latest, perfIndex, members, workAgg, latestWork, burnoutRisk,
  radarData, trendData, events, s,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-muted/40 px-4 py-3 text-xs text-muted-foreground flex items-start gap-2">
        <span>🔒</span>
        <span>{s.privacyNote}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label={s.perfIndexLabel} value={perfIndex !== null ? `${perfIndex}` : '—'} sub={s.perfIndexSub} accent />
        <MetricCard label={s.checkinRateLabel} value={latest ? `${latest.checkin_rate?.toFixed(0) ?? 0}%` : '—'} sub={s.checkinDone(latest?.checkin_count ?? 0)} />
        <MetricCard label={s.coachingSessionLabel} value={latest ? `${latest.coaching_sessions_count}` : '—'} sub={latest?.coaching_avg_rating ? s.satisfactionSub(latest.coaching_avg_rating.toFixed(1)) : ''} />
        <MetricCard label={s.totalMemberLabel} value={`${org?.member_count ?? 0}`} sub={s.activeMemberSub(members.length)} />
      </div>

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
            <p className="text-xs text-red-600 font-medium">{s.riskHighAlert(latest.risk_high_count)}</p>
          )}
        </div>
      )}

      {workAgg.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">{s.tbqcTitle}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label={s.completionRateLabel} value={`${latestWork?.completion_rate?.toFixed(0) ?? '—'}%`} accent />
            <MetricCard label={s.tbqcAccuracyLabel} value={latestWork?.avg_tbqc_accuracy != null ? `${(latestWork.avg_tbqc_accuracy * 100).toFixed(0)}%` : '—'} />
            <MetricCard label={s.rolloverLabel} value={`${latestWork?.rollover_count ?? '—'}`} />
            <MetricCard label={s.activeMembersWorkLabel} value={`${latestWork?.active_member_count ?? '—'}`} />
          </div>
          {burnoutRisk && <p className="text-xs text-red-600 font-medium">{s.burnoutAlert}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">{s.noData}</div>
          )}
        </div>

        <div className="rounded-xl border p-4">
          <h2 className="text-sm font-semibold mb-3">{s.trendTitle}</h2>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)}`, s.fourCAvgTooltip]} />
                <Line type="monotone" dataKey="avg" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">{s.noDataTrend}</div>
          )}
        </div>
      </div>

      {events.length > 0 && (
        <div className="rounded-xl border p-4 space-y-2">
          <h2 className="text-sm font-semibold">{s.upcomingEventTitle}</h2>
          <div className="space-y-1.5">
            {events.slice(0, 3).map(e => {
              const daysLeft = Math.ceil((new Date(e.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{e.event_name}</span>
                  <span className={`text-xs font-medium ${daysLeft <= 7 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                    D-{daysLeft} ({e.event_date})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MembersTab ──────────────────────────────────────────────────────────────

interface OrgMember { id: string; user_id: string; member_type: string; joined_at: string; status: string; }

interface MembersTabProps {
  members: OrgMember[];
  orgId: string;
  locale: string;
  s: S;
}

export function MembersTab({ members, orgId, locale, s }: MembersTabProps) {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{s.membersTabTitle(members.length)}</h2>
        <button onClick={() => navigate(`/b2b/invite/${orgId}`)} className="text-xs text-primary hover:underline">
          {s.addMember}
        </button>
      </div>
      {members.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">{s.noMember}</div>
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
              <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                {m.status === 'active' ? s.statusActive : s.statusInactive}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── EventsTab ───────────────────────────────────────────────────────────────

interface OrgEvent { id: string; event_name: string; event_type: string; event_date: string; auto_checkin?: boolean; }
interface EventForm { event_type: string; event_name: string; event_date: string; }

interface EventsTabProps {
  events: OrgEvent[];
  showEventForm: boolean;
  setShowEventForm: (v: boolean | ((prev: boolean) => boolean)) => void;
  eventForm: EventForm;
  setEventForm: React.Dispatch<React.SetStateAction<EventForm>>;
  handleAddEvent: () => void;
  s: S;
}

export function EventsTab({ events, showEventForm, setShowEventForm, eventForm, setEventForm, handleAddEvent, s }: EventsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{s.eventCalendarTitle}</h2>
        <button onClick={() => setShowEventForm(v => !v)} className="text-xs text-primary hover:underline">
          {s.addEvent}
        </button>
      </div>

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
            <button onClick={() => setShowEventForm(false)} className="text-xs px-3 py-1.5 border rounded-lg text-muted-foreground">
              {s.cancelBtn}
            </button>
            <button onClick={handleAddEvent} className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground">
              {s.saveBtn}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{s.autoCheckinNote}</p>
        </div>
      )}

      {events.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">{s.noEvent}</div>
      ) : (
        <div className="rounded-xl border divide-y">
          {events.map(e => {
            const daysLeft = Math.ceil((new Date(e.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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
  );
}

// ── CoachingTab ─────────────────────────────────────────────────────────────

interface CoachingTabProps {
  latest: B2BOrgAggregate | null;
  orgId: string;
  s: S;
}

export function CoachingTab({ latest, orgId, s }: CoachingTabProps) {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{s.coachingTabTitle}</h2>
        <button onClick={() => navigate(`/b2b/coach-match/${orgId}`)} className="text-xs text-primary hover:underline">
          {s.coachManage}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard label={s.thisMonthSession} value={latest ? `${latest.coaching_sessions_count}` : '—'} />
        <MetricCard label={s.avgSatisfaction} value={latest?.coaching_avg_rating ? `${latest.coaching_avg_rating.toFixed(1)} / 5` : '—'} />
        <MetricCard label={s.planIncluded} value={s.planIncludedValue} sub={s.planExtraNote} />
      </div>
      <div className="rounded-xl border p-4 text-sm text-muted-foreground text-center">
        {s.sessionPrivacy}
      </div>
    </div>
  );
}
