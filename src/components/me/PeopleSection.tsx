// PeopleSection — relationship entities list
import { useState } from 'react';
import { C } from '@/lib/colors';
import { PEOPLE } from '@/data/mePageData';

const PEOPLE_TAG_STYLE = { fontSize: 9, padding: '2px 7px', borderRadius: 99, border: `1px solid ${C.border}`, color: C.text4 } as const;

interface Person {
  name?: string;
  rel?: string;
  relationship?: string;
  color: string;
  pattern: string;
  conflict: string;
  tags: string[];
}

interface PeopleSectionProps {
  people: Person[];
  peopleLoading: boolean;
}

export default function PeopleSection({ people, peopleLoading }: PeopleSectionProps) {
  const [openPerson, setOpenPerson] = useState<number | null>(null);
  const items = people.length > 0 ? people : PEOPLE;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, padding: '11px 20px 10px', borderBottom: `1px solid ${C.border2}` }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 16, color: C.text, marginBottom: 2 }}>내 관계 안에 있는 사람들</p>
        <p style={{ fontSize: 10, fontWeight: 300, color: C.text4 }}>이 사람들과의 관계에서 패턴이 발견됐어요.</p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '11px 20px 80px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {peopleLoading && <p style={{ fontSize: 11, color: C.text4, textAlign: 'center', padding: '20px 0' }}>불러오는 중...</p>}
        {items.map((p, i) => {
          const isOpen = openPerson === i;
          const personName = 'name' in p ? (p as { name: string }).name : '';
          const personRel = 'relationship' in p ? (p as { relationship: string }).relationship : ('rel' in p ? (p as { rel: string }).rel : '');
          return (
            <div key={i} onClick={() => setOpenPerson(isOpen ? null : i)} className="vr-fade-in"
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
                  <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: '.06em', textTransform: 'uppercase', color: C.text4, marginBottom: 4 }}>발견된 패턴</p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: C.text2, lineHeight: 1.55, marginBottom: 7, fontFamily: "'Cormorant Garamond', serif" }}>{p.pattern}</p>
                  <div style={{ background: `${C.amberGold}08`, border: `1px solid ${C.amberGold}22`, borderRadius: 7, padding: '7px 9px', marginBottom: 7 }}>
                    <p style={{ fontSize: 9, color: C.amberGold, marginBottom: 2, fontWeight: 400, letterSpacing: '.05em' }}>페르소나 충돌</p>
                    <p style={{ fontSize: 11, fontWeight: 300, color: C.text2, lineHeight: 1.5 }}>{p.conflict}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {p.tags.map(tag => <span key={tag} style={PEOPLE_TAG_STYLE}>{tag}</span>)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <button style={{ padding: '11px 0', borderRadius: 11, border: `1px dashed ${C.border}`, background: 'transparent', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 300, color: C.text5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><line x1="7" y1="1" x2="7" y2="13" stroke={C.text5} strokeWidth="1.3" strokeLinecap="round"/><line x1="1" y1="7" x2="13" y2="7" stroke={C.text5} strokeWidth="1.3" strokeLinecap="round"/></svg>
          사람 추가하기
        </button>
      </div>
    </div>
  );
}
