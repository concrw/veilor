import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import type { CommunityEvent, EventParticipant } from '@/integrations/supabase/veilor-types';
import { C } from '@/lib/colors';
import { Calendar, MapPin, Users, Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useT } from '@/i18n/useT';

type EventWithCount = CommunityEvent & { participant_count?: number };

function CreateEventModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const s = useT().eventsPage;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [eventType, setEventType] = useState<'meetup' | 'online' | 'workshop'>('meetup');

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Login required');
      const { error } = await veilorDb.from('community_events').insert({
        creator_id: user.id, title, description, location,
        starts_at: new Date(startsAt).toISOString(),
        event_type: eventType, is_public: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community_events'] });
      toast({ title: s.created });
      onClose();
    },
    onError: () => toast({ title: s.createFailed, variant: 'destructive' }),
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', background: '#1C1917', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ color: C.text, fontSize: 16, fontFamily: "'Cormorant Garamond', serif" }}>{s.newEvent}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.text4, cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            placeholder={s.titlePlaceholder} value={title} onChange={e => setTitle(e.target.value)}
            style={{ background: '#2A2724', border: `1px solid ${C.border2}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 14, outline: 'none' }}
          />
          <textarea
            placeholder={s.descPlaceholder} value={description} onChange={e => setDescription(e.target.value)} rows={3}
            style={{ background: '#2A2724', border: `1px solid ${C.border2}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 14, outline: 'none', resize: 'none' }}
          />
          <input
            placeholder={s.locationPlaceholder} value={location} onChange={e => setLocation(e.target.value)}
            style={{ background: '#2A2724', border: `1px solid ${C.border2}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 14, outline: 'none' }}
          />
          <input
            type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)}
            style={{ background: '#2A2724', border: `1px solid ${C.border2}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 14, outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            {(['meetup', 'online', 'workshop'] as const).map(t => (
              <button key={t} onClick={() => setEventType(t)}
                style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                  background: eventType === t ? `color-mix(in srgb, ${C.amber} 15%, #1C1917)` : '#2A2724',
                  border: `1px solid ${eventType === t ? C.amber : C.border2}`,
                  color: eventType === t ? C.amber : C.text4 }}>
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => mutate()} disabled={!title || !startsAt || isPending}
            style={{ marginTop: 4, padding: '12px', borderRadius: 12, background: C.amber, color: '#1C1917', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: (!title || !startsAt) ? 0.5 : 1 }}>
            {isPending ? s.creating : s.createButton}
          </button>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: EventWithCount }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const s = useT().eventsPage;

  const { data: myParticipation } = useQuery({
    queryKey: ['event_participant', event.id, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await veilorDb.from('event_participants')
        .select('*').eq('event_id', event.id).eq('user_id', user!.id).maybeSingle();
      return data as EventParticipant | null;
    },
  });

  const { mutate: join, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Login required');
      if (myParticipation) {
        const { error } = await veilorDb.from('event_participants').delete()
          .eq('event_id', event.id).eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await veilorDb.from('event_participants').insert({ event_id: event.id, user_id: user.id, status: 'going' });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event_participant', event.id] }),
  });

  const date = new Date(event.starts_at);
  const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
  const typeColor = { meetup: '#7FB89A', online: '#6B9EC9', workshop: '#C97A6A' }[event.event_type] ?? C.amber;

  return (
    <div style={{ background: '#1C1917', border: `1px solid ${C.border2}`, borderRadius: 16, padding: '16px', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 10, color: typeColor, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '.06em' }}>{event.event_type}</span>
          <p style={{ color: C.text, fontSize: 15, fontFamily: "'Cormorant Garamond', serif", margin: '2px 0 6px' }}>{event.title}</p>
          {event.description && <p style={{ color: C.text4, fontSize: 12, lineHeight: 1.5 }}>{event.description}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.text4 }}>
          <Calendar size={11} />{dateStr}
        </span>
        {event.location && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.text4 }}>
            <MapPin size={11} />{event.location}
          </span>
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.text4 }}>
          <Users size={11} />{s.participantCount(event.participant_count ?? 0)}
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={() => join()} disabled={isPending}
          style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: myParticipation ? `color-mix(in srgb, ${C.amber} 15%, #1C1917)` : '#2A2724',
            color: myParticipation ? C.amber : C.text4 }}>
          {myParticipation ? s.cancelJoin : s.join}
        </button>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const s = useT().eventsPage;

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['community_events'],
    queryFn: async () => {
      const { data, error } = await veilorDb.from('community_events')
        .select('*').eq('is_public', true).order('starts_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as CommunityEvent[];
    },
  });

  return (
    <div style={{ background: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${C.border2}`, display: 'flex', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 22, color: C.text, fontFamily: "'Cormorant Garamond', serif" }}>{s.pageTitle}</span>
          <p style={{ fontSize: 10, color: C.text4, margin: '2px 0 0', letterSpacing: '.02em' }}>{s.subtitle}</p>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowCreate(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: C.amber, color: '#1C1917', border: 'none', fontSize: 13, cursor: 'pointer' }}>
          <Plus size={14} />{s.newEvent}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: C.text4, fontSize: 13, marginTop: 40 }}>{s.loading}</div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.text4, fontSize: 13, marginTop: 60 }}>
            <Calendar size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>{s.empty}</p>
            <p style={{ fontSize: 11, marginTop: 6 }}>{s.emptyHint}</p>
          </div>
        ) : (
          events.map(ev => <EventCard key={ev.id} event={ev} />)
        )}
      </div>

      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
