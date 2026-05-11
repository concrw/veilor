import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { veilorDb } from '@/integrations/supabase/client';
import { useOrgAggregate, useOrgEvents, useOrgMembers, useOrgWorkAggregate } from '@/hooks/useB2BOrg';
import type { B2BOrg, B2BOrgAggregate, OrgWorkAggregate } from '@/integrations/supabase/veilor-types';
import { useT } from '@/i18n/useT';
import { useLanguageContext } from '@/context/LanguageContext';
import { OverviewTab, MembersTab, EventsTab, CoachingTab } from './OrgDashboardTabs';

function toRadarData(agg: B2BOrgAggregate | null) {
  if (!agg) return [];
  return [
    { axis: 'Control',    value: Number(agg.avg_c_control    ?? 0) },
    { axis: 'Commitment', value: Number(agg.avg_c_commitment ?? 0) },
    { axis: 'Challenge',  value: Number(agg.avg_c_challenge  ?? 0) },
    { axis: 'Confidence', value: Number(agg.avg_c_confidence ?? 0) },
  ];
}

function toTrendData(aggregates: B2BOrgAggregate[]) {
  return [...aggregates].reverse().map(a => ({
    week: a.week_start.slice(5),
    avg: Number(a.avg_4c ?? 0),
    rate: Number(a.checkin_rate ?? 0),
  }));
}

export default function OrgDashboard() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const t = useT();
  const s = t.b2bDomain.orgDashboard;

  const [org, setOrg] = useState<B2BOrg | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'events' | 'coaching'>('overview');
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ event_type: '', event_name: '', event_date: '' });

  const { aggregates, fetchAggregate } = useOrgAggregate(orgId ?? '', 8);
  const { events, fetchEvents, addEvent } = useOrgEvents(orgId ?? '');
  const { members, fetchMembers } = useOrgMembers(orgId ?? '');
  const { data: workAgg, fetchWorkAggregate } = useOrgWorkAggregate(orgId ?? '', 4);

  useEffect(() => {
    if (!orgId) return;
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
  const burnoutRisk = latestWork != null && (latestWork.completion_rate ?? 100) < 40 && latestWork.rollover_count >= 3;
  const perfIndex = latest ? Math.round(Number(latest.avg_4c ?? 0) * 10) : null;
  const locale = language === 'en' ? 'en-US' : 'ko-KR';

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
          {activeTab === 'overview' && (
            <OverviewTab
              org={org} latest={latest} perfIndex={perfIndex} members={members}
              workAgg={workAgg} latestWork={latestWork} burnoutRisk={burnoutRisk}
              radarData={radarData} trendData={trendData} events={events} s={s}
            />
          )}
          {activeTab === 'members' && (
            <MembersTab members={members} orgId={orgId ?? ''} locale={locale} s={s} />
          )}
          {activeTab === 'events' && (
            <EventsTab
              events={events} showEventForm={showEventForm} setShowEventForm={setShowEventForm}
              eventForm={eventForm} setEventForm={setEventForm} handleAddEvent={handleAddEvent} s={s}
            />
          )}
          {activeTab === 'coaching' && (
            <CoachingTab latest={latest} orgId={orgId ?? ''} s={s} />
          )}
        </div>
      </div>
    </div>
  );
}
