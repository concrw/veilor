import { useState } from 'react';
import { C } from '@/lib/colors';
import {
  useRelationshipTimeline,
  EVENT_TYPE_META,
  type EventType,
  type NewTimelineEvent,
} from '@/hooks/useRelationshipTimeline';
import { useMeTranslations } from '@/hooks/useTranslation';

const EVENT_TYPES = Object.entries(EVENT_TYPE_META) as [EventType, typeof EVENT_TYPE_META[EventType]][];

function ToneBar({ tone }: { tone: number }) {
  const pct = ((tone + 5) / 10) * 100;
  const color = tone > 0 ? C.amberGold : tone < 0 ? '#F87171' : '#9CA3AF';
  return (
    <div style={{ width: '100%', height: 4, background: `${C.border}`, borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .3s' }} />
    </div>
  );
}

function AddEventSheet({ onClose, onAdd, t }: {
  onClose: () => void;
  onAdd: (e: NewTimelineEvent) => Promise<void>;
  t: ReturnType<typeof useMeTranslations>['timeline'];
}) {
  const [form, setForm] = useState<NewTimelineEvent>({
    event_date: new Date().toISOString().slice(0, 10),
    event_type: 'connection',
    title: '',
    description: '',
    emotional_tone: 0,
  });
  const [saving, setSaving] = useState(false);

  const valid = form.title.trim().length > 0;

  const handleSubmit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    await onAdd(form);
    setSaving(false);
    onClose();
  };

  const toneLabel = t.toneLabels[String(form.emotional_tone)] ?? '';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div
        style={{ width: '100%', maxWidth: 480, margin: '0 auto', background: C.bg2, borderRadius: '18px 18px 0 0', padding: '20px 20px 36px' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ width: 36, height: 3, background: C.border, borderRadius: 99, margin: '0 auto 18px' }} />
        <p style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 16 }}>{t.formTitle}</p>

        <label style={{ fontSize: 11, color: C.text4, display: 'block', marginBottom: 4 }}>{t.formDate}</label>
        <input
          type="date"
          value={form.event_date}
          onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
          style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 10px', fontSize: 13, color: C.text, marginBottom: 12, boxSizing: 'border-box' }}
        />

        <label style={{ fontSize: 11, color: C.text4, display: 'block', marginBottom: 6 }}>{t.formType}</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {EVENT_TYPES.map(([key, meta]) => (
            <button key={key} onClick={() => setForm(f => ({ ...f, event_type: key }))}
              style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 99,
                border: `1px solid ${form.event_type === key ? meta.color : C.border}`,
                background: form.event_type === key ? `${meta.color}18` : 'transparent',
                color: form.event_type === key ? meta.color : C.text4,
              }}>
              {meta.emoji} {meta.label}
            </button>
          ))}
        </div>

        <label style={{ fontSize: 11, color: C.text4, display: 'block', marginBottom: 4 }}>{t.formEventTitle}</label>
        <input
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder={t.formEventTitlePlaceholder}
          style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 10px', fontSize: 13, color: C.text, marginBottom: 12, boxSizing: 'border-box' }}
        />

        <label style={{ fontSize: 11, color: C.text4, display: 'block', marginBottom: 4 }}>{t.formNotes}</label>
        <textarea
          value={form.description ?? ''}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={2}
          placeholder={t.formNotesPlaceholder}
          style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 10px', fontSize: 12, color: C.text, resize: 'none', marginBottom: 14, boxSizing: 'border-box' }}
        />

        <label style={{ fontSize: 11, color: C.text4, display: 'block', marginBottom: 6 }}>
          {t.formTone} &nbsp;
          <span style={{ color: form.emotional_tone > 0 ? C.amberGold : form.emotional_tone < 0 ? '#F87171' : '#9CA3AF', fontWeight: 600 }}>
            {form.emotional_tone > 0 ? '+' : ''}{form.emotional_tone} ({toneLabel})
          </span>
        </label>
        <input
          type="range" min={-5} max={5} step={1}
          value={form.emotional_tone}
          onChange={e => setForm(f => ({ ...f, emotional_tone: Number(e.target.value) }))}
          style={{ width: '100%', marginBottom: 18 }}
        />

        <button
          onClick={handleSubmit}
          disabled={!valid || saving}
          style={{
            width: '100%', padding: '11px 0', borderRadius: 10, border: 'none',
            background: valid ? C.amberGold : C.border,
            color: valid ? '#000' : C.text4, fontSize: 14, fontWeight: 600,
            cursor: valid ? 'pointer' : 'default', transition: 'background .2s',
          }}
        >
          {saving ? t.formSaving : t.formSave}
        </button>
      </div>
    </div>
  );
}

export default function RelationshipTimeline() {
  const { events, isLoading, addEvent, deleteEvent, recentAvg, olderAvg } = useRelationshipTimeline();
  const me = useMeTranslations();
  const t = me.timeline;
  const [adding, setAdding] = useState(false);

  const delta = recentAvg !== null && olderAvg !== null ? recentAvg - olderAvg : null;

  if (isLoading) return null;

  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '15px 17px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 16, color: C.text }}>
          {t.title}
        </span>
        <button
          onClick={() => setAdding(true)}
          style={{ fontSize: 10, padding: '3px 9px', borderRadius: 99, border: `1px solid ${C.border}`, color: C.text4, background: 'transparent', cursor: 'pointer' }}
        >
          {t.addButton}
        </button>
      </div>

      {(recentAvg !== null || olderAvg !== null) && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {olderAvg !== null && (
            <div style={{ flex: 1, background: C.bg, borderRadius: 10, padding: '8px 10px' }}>
              <p style={{ fontSize: 9, color: C.text4, marginBottom: 3 }}>{t.olderAvg}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: olderAvg > 0 ? C.amberGold : olderAvg < 0 ? '#F87171' : '#9CA3AF' }}>
                {olderAvg > 0 ? '+' : ''}{olderAvg}
              </p>
            </div>
          )}
          {recentAvg !== null && (
            <div style={{ flex: 1, background: C.bg, borderRadius: 10, padding: '8px 10px' }}>
              <p style={{ fontSize: 9, color: C.text4, marginBottom: 3 }}>{t.recentAvg}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: recentAvg > 0 ? C.amberGold : recentAvg < 0 ? '#F87171' : '#9CA3AF' }}>
                {recentAvg > 0 ? '+' : ''}{recentAvg}
              </p>
            </div>
          )}
          {delta !== null && (
            <div style={{ flex: 1, background: C.bg, borderRadius: 10, padding: '8px 10px' }}>
              <p style={{ fontSize: 9, color: C.text4, marginBottom: 3 }}>{t.changeLabel}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: delta > 0 ? C.amberGold : delta < 0 ? '#F87171' : '#9CA3AF' }}>
                {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'} {Math.abs(delta).toFixed(1)}
              </p>
            </div>
          )}
        </div>
      )}

      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>🕰️</p>
          <p style={{ fontSize: 12, color: C.text4, lineHeight: 1.6 }}>
            {t.emptyDesc.split('\n').map((line, i) => <span key={i}>{line}{i === 0 ? <br /> : null}</span>)}
          </p>
          <button
            onClick={() => setAdding(true)}
            style={{ marginTop: 12, fontSize: 12, padding: '7px 16px', borderRadius: 99, border: `1px solid ${C.amberGold}44`, color: C.amberGold, background: `${C.amberGold}0A`, cursor: 'pointer' }}
          >
            {t.firstRecord}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {events.slice(0, 10).map(ev => {
            const meta = EVENT_TYPE_META[ev.event_type];
            return (
              <div key={ev.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 10px', background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 18, lineHeight: 1, marginTop: 1 }}>{meta.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</span>
                    <span style={{ fontSize: 9, color: meta.color, flexShrink: 0 }}>{meta.label}</span>
                  </div>
                  <ToneBar tone={ev.emotional_tone} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 9, color: C.text4 }}>{ev.event_date}</span>
                    <span style={{ fontSize: 9, color: ev.emotional_tone > 0 ? C.amberGold : ev.emotional_tone < 0 ? '#F87171' : '#9CA3AF' }}>
                      {ev.emotional_tone > 0 ? '+' : ''}{ev.emotional_tone}
                    </span>
                  </div>
                  {ev.description && (
                    <p style={{ fontSize: 10, color: C.text4, marginTop: 4, lineHeight: 1.5 }}>{ev.description}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteEvent.mutate(ev.id)}
                  style={{ fontSize: 10, color: C.text4, background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', marginTop: 1, opacity: 0.5 }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {adding && (
        <AddEventSheet
          onClose={() => setAdding(false)}
          onAdd={async (ev) => { await addEvent.mutateAsync(ev); }}
          t={t}
        />
      )}
    </div>
  );
}
