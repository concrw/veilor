import type { LocaleResource } from '@/i18n/types';
import type { B2BCoachingSession } from '@/integrations/supabase/veilor-types';

type S = LocaleResource['b2bDomain']['coachPortal'];

interface CoachMember {
  member_id: string;
  org_id: string;
  org_name?: string | null;
  latest_risk_level?: string | null;
  sessions_count: number;
  latest_checkin_at?: string | null;
  latest_c_avg?: number | null;
}

// ── MembersTab ──────────────────────────────────────────────────────────────

interface MembersTabProps {
  members: CoachMember[] | undefined;
  loadingMembers: boolean;
  locale: string;
  s: S;
}

export function CoachMembersTab({ members, loadingMembers, locale, s }: MembersTabProps) {
  return (
    <div>
      {loadingMembers && (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-[#E0B48A] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {!loadingMembers && (members ?? []).length === 0 && (
        <p className="text-center py-10 text-[13px]" style={{ color: '#87817C' }}>{s.noMembers}</p>
      )}
      <div className="flex flex-col gap-3">
        {(members ?? []).map(m => (
          <div
            key={`${m.member_id}-${m.org_id}`}
            className="rounded-xl p-4"
            style={{ background: '#242220', border: '1px solid #2E2B28' }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[13px]" style={{ color: '#E7E5E4' }}>
                {m.member_id.slice(0, 8)}… · {m.org_name ?? m.org_id.slice(0, 8)}
              </p>
              {m.latest_risk_level && (
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full"
                  style={{
                    background:
                      m.latest_risk_level === 'high' ? '#EF444420' :
                      m.latest_risk_level === 'medium' ? '#F9731620' :
                      '#4ADE8020',
                    color:
                      m.latest_risk_level === 'high' ? '#EF4444' :
                      m.latest_risk_level === 'medium' ? '#F97316' :
                      '#4ADE80',
                  }}
                >
                  {m.latest_risk_level}
                </span>
              )}
            </div>
            <p className="text-[12px]" style={{ color: '#9C9590' }}>
              {s.sessionCount(m.sessions_count)}
              {m.latest_checkin_at ? s.latestCheckin(new Date(m.latest_checkin_at).toLocaleDateString(locale)) : ''}
              {m.latest_c_avg != null ? s.cIndex(m.latest_c_avg.toFixed(1)) : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SessionsTab ─────────────────────────────────────────────────────────────

interface SessionRowProps {
  session: B2BCoachingSession;
  coachId: string;
  s: S;
  locale: string;
}

import { useState } from 'react';
import { useUpdateSessionStatus } from '@/hooks/useB2BCoach';

export function SessionRow({ session, coachId, s, locale }: SessionRowProps) {
  const update = useUpdateSessionStatus();
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const statusColor: Record<string, string> = {
    scheduled: '#E0B48A',
    completed: '#4ADE80',
    cancelled: '#9C9590',
    no_show: '#EF4444',
  };

  return (
    <div className="rounded-xl p-4" style={{ background: '#2A2624', border: '1px solid #3C3835' }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[13px]" style={{ color: '#E7E5E4' }}>
          {new Date(session.scheduled_at).toLocaleString(locale === 'en' ? 'en-US' : 'ko-KR', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>
        <span className="text-[11px]" style={{ color: statusColor[session.status] }}>
          {s.statusLabels[session.status]}
        </span>
      </div>
      <p className="text-[12px]" style={{ color: '#9C9590' }}>{s.memberId2(session.member_id.slice(0, 8))}</p>
      {session.status === 'scheduled' && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setShowNotes(true)}
            className="flex-1 py-1.5 rounded-lg text-[12px]"
            style={{ background: '#E0B48A20', color: '#E0B48A' }}
          >
            {s.markDone}
          </button>
          <button
            onClick={() => update.mutate({ sessionId: session.id, coachId, status: 'cancelled' })}
            className="flex-1 py-1.5 rounded-lg text-[12px]"
            style={{ background: '#3C3835', color: '#9C9590' }}
          >
            {s.cancelSession}
          </button>
        </div>
      )}
      {showNotes && (
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={s.coachNotes}
            rows={3}
            className="w-full text-[12px] rounded-lg p-2 outline-none resize-none"
            style={{ background: '#1C1917', color: '#B8B3AF', border: '1px solid #3C3835' }}
          />
          <button
            onClick={() => {
              update.mutate({ sessionId: session.id, coachId, status: 'completed', coach_notes: notes.trim() || undefined });
              setShowNotes(false);
            }}
            className="py-1.5 rounded-lg text-[12px]"
            style={{ background: '#E0B48A', color: '#1C1917' }}
          >
            {s.confirm}
          </button>
        </div>
      )}
    </div>
  );
}

interface SessionsTabProps {
  sessions: B2BCoachingSession[] | undefined;
  loadingSessions: boolean;
  coachId: string;
  locale: string;
  s: S;
}

export function CoachSessionsTab({ sessions, loadingSessions, coachId, locale, s }: SessionsTabProps) {
  return (
    <div>
      {loadingSessions && (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-[#E0B48A] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {!loadingSessions && (sessions ?? []).length === 0 && (
        <p className="text-center py-10 text-[13px]" style={{ color: '#87817C' }}>{s.noSessions}</p>
      )}
      <div className="flex flex-col gap-3">
        {(sessions ?? []).map(sess => (
          <SessionRow key={sess.id} session={sess} coachId={coachId} s={s} locale={locale} />
        ))}
      </div>
    </div>
  );
}
