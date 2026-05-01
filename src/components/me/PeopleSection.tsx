// PeopleSection — relationship entities list + add/edit
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { C } from '@/lib/colors';
import { PEOPLE } from '@/data/mePageData';
import { useMeTranslations } from '@/hooks/useTranslation';

const PEOPLE_TAG_STYLE = { fontSize: 9, padding: '2px 7px', borderRadius: 99, border: `1px solid ${C.border}`, color: C.text4 } as const;

const REL_COLORS = ['#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

interface Person {
  id?: string;
  name?: string;
  rel?: string;
  relationship?: string;
  color: string;
  pattern: string;
  conflict: string;
  tags: string[];
  notes?: string;
}

interface PeopleSectionProps {
  people: Person[];
  peopleLoading: boolean;
}

export default function PeopleSection({ people: externalPeople, peopleLoading }: PeopleSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const me = useMeTranslations();
  const p_ = me.people;
  const [openPerson, setOpenPerson] = useState<number | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', relationship: p_.relTypes[0], color: REL_COLORS[0], notes: '' });

  const { data: dbPeople = [] } = useQuery({
    queryKey: ['relationship-entities', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb.from('relationship_entities')
        .select('*').eq('user_id', user!.id).order('created_at', { ascending: true });
      return (data ?? []).map((d: Record<string, unknown>) => ({
        id: d.id, name: d.name, relationship: d.relationship, color: d.color ?? REL_COLORS[0],
        pattern: d.pattern ?? '', conflict: d.conflict ?? '',
        tags: d.tags ?? [], notes: d.notes ?? '',
      }));
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user || !editForm.name.trim()) return;
      await veilorDb.from('relationship_entities').insert({
        user_id: user.id,
        name: editForm.name.trim(),
        relationship: editForm.relationship,
        color: editForm.color,
        notes: editForm.notes.trim() || null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['relationship-entities'] });
      setAddMode(false);
      setEditForm({ name: '', relationship: p_.relTypes[0], color: REL_COLORS[0], notes: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await veilorDb.from('relationship_entities').delete().eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['relationship-entities'] }),
  });

  const items: Person[] = dbPeople.length > 0 ? dbPeople : (externalPeople.length > 0 ? externalPeople : PEOPLE);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, padding: '11px 20px 10px', borderBottom: `1px solid ${C.border2}` }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 16, color: C.text, marginBottom: 2 }}>{p_.title}</p>
        <p style={{ fontSize: 10, fontWeight: 300, color: C.text4 }}>{p_.subtitle}</p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '11px 20px 80px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {peopleLoading && <p style={{ fontSize: 11, color: C.text4, textAlign: 'center', padding: '20px 0' }}>{p_.loading}</p>}
        {items.map((p, i) => {
          const isOpen = openPerson === i;
          const personName = 'name' in p ? (p as { name: string }).name : '';
          const personRel = 'relationship' in p ? (p as { relationship: string }).relationship : ('rel' in p ? (p as { rel: string }).rel : '');
          return (
            <div key={i} onClick={() => p.id ? navigate(`/users/${p.id}`) : setOpenPerson(isOpen ? null : i)} className="vr-fade-in"
              style={{ background: isOpen ? `${C.amberGold}04` : C.bg2, border: `1px solid ${isOpen ? `${C.amberGold}44` : C.border}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all .2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: p.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 14, color: C.bg }}>{personName[0] ?? '?'}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 15, color: C.text, marginBottom: 2 }}>{personName}</p>
                  <p style={{ fontSize: 10, fontWeight: 300, color: C.text4 }}>{personRel}</p>
                </div>
                <span style={{ fontSize: 12, color: C.text5, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s', display: 'inline-block' }}>›</span>
              </div>
              {isOpen && (
                <div style={{ paddingTop: 10, marginTop: 10, borderTop: `1px solid ${C.border2}` }}>
                  <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: '.06em', textTransform: 'uppercase', color: C.text4, marginBottom: 4 }}>{p_.discoveredPattern}</p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: C.text2, lineHeight: 1.55, marginBottom: 7, fontFamily: "'Cormorant Garamond', serif" }}>{p.pattern}</p>
                  <div style={{ background: `${C.amberGold}08`, border: `1px solid ${C.amberGold}22`, borderRadius: 7, padding: '7px 9px', marginBottom: 7 }}>
                    <p style={{ fontSize: 9, color: C.amberGold, marginBottom: 2, fontWeight: 400, letterSpacing: '.05em' }}>{p_.personaConflict}</p>
                    <p style={{ fontSize: 11, fontWeight: 300, color: C.text2, lineHeight: 1.5 }}>{p.conflict}</p>
                  </div>
                  {p.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {p.tags.map(tag => <span key={tag} style={PEOPLE_TAG_STYLE}>{tag}</span>)}
                    </div>
                  )}
                  {p.notes && (
                    <p style={{ fontSize: 10, color: C.text4, marginTop: 6 }}>{p.notes}</p>
                  )}
                  {p.id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(p.id!); }}
                      style={{ fontSize: 10, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8, padding: 0 }}
                    >
                      {p_.delete}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {addMode ? (
          <div style={{ background: C.bg2, border: `1px solid ${C.amberGold}44`, borderRadius: 12, padding: '14px 14px' }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: C.text, marginBottom: 10 }}>{p_.formTitle}</p>
            <input
              value={editForm.name}
              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
              placeholder={p_.formNamePlaceholder}
              maxLength={20}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 13, marginBottom: 8, outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
              {p_.relTypes.map(r => (
                <button key={r} onClick={() => setEditForm(f => ({ ...f, relationship: r }))}
                  style={{
                    padding: '4px 10px', borderRadius: 7, fontSize: 11, cursor: 'pointer',
                    border: editForm.relationship === r ? `1px solid ${C.amberGold}` : `1px solid ${C.border}`,
                    background: editForm.relationship === r ? `${C.amberGold}15` : 'transparent',
                    color: editForm.relationship === r ? C.amberGold : C.text4,
                  }}>
                  {r}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
              {REL_COLORS.map(c => (
                <button key={c} onClick={() => setEditForm(f => ({ ...f, color: c }))}
                  style={{
                    width: 24, height: 24, borderRadius: '50%', background: c, border: editForm.color === c ? '2px solid #fff' : '2px solid transparent',
                    cursor: 'pointer', boxShadow: editForm.color === c ? `0 0 0 1px ${c}` : 'none',
                  }} />
              ))}
            </div>
            <textarea
              value={editForm.notes}
              onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
              placeholder={p_.formNotesPlaceholder}
              maxLength={200}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12, resize: 'none', height: 50, outline: 'none', marginBottom: 8 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setAddMode(false)}
                style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.text4, fontSize: 11, cursor: 'pointer' }}>
                {p_.cancel}
              </button>
              <button onClick={() => saveMutation.mutate()}
                disabled={!editForm.name.trim() || saveMutation.isPending}
                style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', background: C.amberGold, color: '#000', fontSize: 11, fontWeight: 600, cursor: 'pointer', opacity: editForm.name.trim() ? 1 : 0.4 }}>
                {saveMutation.isPending ? p_.saving : p_.save}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddMode(true)} style={{ padding: '11px 0', borderRadius: 11, border: `1px dashed ${C.border}`, background: 'transparent', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 300, color: C.text5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%' }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><line x1="7" y1="1" x2="7" y2="13" stroke={C.text5} strokeWidth="1.3" strokeLinecap="round"/><line x1="1" y1="7" x2="13" y2="7" stroke={C.text5} strokeWidth="1.3" strokeLinecap="round"/></svg>
            {p_.addPerson}
          </button>
        )}
      </div>
    </div>
  );
}
