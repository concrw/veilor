import { useState } from 'react';
import { useRelationTranslations } from '@/hooks/useTranslation';
import { useRelationConnect } from '@/hooks/useRelationConnect';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { C } from '@/lib/colors';
import PeopleSection from '@/components/me/PeopleSection';
import CoupleAnalysis from '@/components/couple/CoupleAnalysis';
import { useLanguageContext } from '@/context/LanguageContext';

function WarmthDots({ checkins }: { checkins: { person_name: string; warmth_score: number; created_at: string }[] }) {
  if (checkins.length === 0) return null;

  const byPerson: Record<string, { score: number; date: string }[]> = {};
  checkins.forEach(c => {
    if (!byPerson[c.person_name]) byPerson[c.person_name] = [];
    byPerson[c.person_name].push({ score: c.warmth_score, date: c.created_at });
  });

  const people = Object.keys(byPerson).slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {people.map(name => {
        const vals = byPerson[name];
        return (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: C.text3, width: 60, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
              {vals.slice(0, 7).reverse().map((v, i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: v.score >= 7 ? C.amberGold : v.score >= 4 ? C.text4 : '#DC2626',
                  opacity: 0.6 + (v.score / 10) * 0.4,
                }} />
              ))}
            </div>
            <span style={{ fontSize: 11, color: C.amberGold, fontFamily: "'Cormorant Garamond', serif" }}>
              {vals[0].score}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function RelationConnectHome() {
  const { language } = useLanguageContext();
  const t = useRelationTranslations();
  const r = t.connect;
  const { user } = useAuth();
  const { checkins, last7Days, warmest, mostConcerning, saveMutation } = useRelationConnect();

  const [personName, setPersonName] = useState('');
  const [warmth, setWarmth] = useState(5);
  const [energy, setEnergy] = useState(0);
  const [note, setNote] = useState('');

  const { data: people = [], isLoading: peopleLoading } = useQuery({
    queryKey: ['relationship-entities', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('relationship_entities')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true });
      return (data ?? []).map((d: Record<string, unknown>) => ({
        id: d.id as string,
        name: d.name as string,
        relationship: d.relationship as string,
        color: (d.color as string) ?? '#EC4899',
        pattern: (d.pattern as string) ?? '',
        conflict: (d.conflict as string) ?? '',
        tags: (d.tags as string[]) ?? [],
        notes: (d.notes as string) ?? '',
      }));
    },
    enabled: !!user,
  });

  const today = new Date().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
    month: 'long', day: 'numeric', weekday: 'short',
  });

  const latestCheckin = checkins[0];
  let amberMsg = r.amberNoCheckin;
  if (latestCheckin) {
    if (latestCheckin.energy_balance <= -3) {
      amberMsg = r.amberLowEnergy;
    } else if (latestCheckin.warmth_score <= 3) {
      amberMsg = r.amberLowWarmth(latestCheckin.person_name);
    }
  }

  const handleSave = () => {
    if (!personName.trim()) return;
    saveMutation.mutate(
      { person_name: personName.trim(), warmth_score: warmth, energy_balance: energy, note: note.trim(), lang: language },
      { onSuccess: () => { setPersonName(''); setWarmth(5); setEnergy(0); setNote(''); } },
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, overflowY: 'auto', paddingBottom: 80 }}>
      {/* 헤더 */}
      <div style={{ padding: '20px 20px 0' }}>
        <span style={{ fontSize: 9, letterSpacing: '.15em', color: C.amberGold, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
          {r.section}
        </span>
        <p style={{ fontSize: 10, color: C.text4, marginBottom: 2 }}>{today}</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 22, color: C.text, lineHeight: 1.3 }}>
          {r.subtitle}
        </h1>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 체크인 카드 */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 16px' }}>
          <p style={{ fontSize: 12, fontWeight: 400, color: C.text, marginBottom: 12 }}>{r.checkinTitle}</p>
          <input
            value={personName}
            onChange={e => setPersonName(e.target.value)}
            placeholder={r.personPlaceholder}
            maxLength={20}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 9,
              border: `1px solid ${C.border}`, background: C.bg,
              color: C.text, fontSize: 13, outline: 'none', marginBottom: 12,
              boxSizing: 'border-box',
            }}
          />
          {/* 따뜻함 슬라이더 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 9, color: C.text4, letterSpacing: '.06em', textTransform: 'uppercase' }}>{r.warmthLabel}</span>
              <span style={{ fontSize: 12, color: C.amberGold, fontFamily: "'Cormorant Garamond', serif" }}>{warmth}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: C.text5, width: 36, flexShrink: 0 }}>{r.warmthLow}</span>
              <input
                type="range" min={1} max={10} value={warmth}
                onChange={e => setWarmth(Number(e.target.value))}
                style={{ flex: 1, accentColor: C.amberGold }}
              />
              <span style={{ fontSize: 10, color: C.text5, width: 36, flexShrink: 0, textAlign: 'right' }}>{r.warmthHigh}</span>
            </div>
          </div>
          {/* 에너지 슬라이더 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 9, color: C.text4, letterSpacing: '.06em', textTransform: 'uppercase' }}>{r.energyLabel}</span>
              <span style={{ fontSize: 12, color: energy >= 0 ? C.amberGold : '#DC2626', fontFamily: "'Cormorant Garamond', serif" }}>
                {energy > 0 ? `+${energy}` : energy}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: C.text5, width: 36, flexShrink: 0 }}>{r.energyLow}</span>
              <input
                type="range" min={-5} max={5} value={energy}
                onChange={e => setEnergy(Number(e.target.value))}
                style={{ flex: 1, accentColor: energy >= 0 ? C.amberGold : '#DC2626' }}
              />
              <span style={{ fontSize: 10, color: C.text5, width: 36, flexShrink: 0, textAlign: 'right' }}>{r.energyHigh}</span>
            </div>
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={r.notePlaceholder}
            maxLength={200}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 9,
              border: `1px solid ${C.border}`, background: C.bg,
              color: C.text, fontSize: 12, resize: 'none', height: 52,
              outline: 'none', marginBottom: 12, boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleSave}
            disabled={!personName.trim() || saveMutation.isPending}
            style={{
              width: '100%', padding: '10px 0', borderRadius: 10,
              border: 'none', background: C.amberGold,
              color: '#000', fontSize: 13, fontWeight: 600,
              cursor: personName.trim() ? 'pointer' : 'not-allowed',
              opacity: personName.trim() ? 1 : 0.4,
            }}
          >
            {saveMutation.isPending ? r.saving : r.save}
          </button>
        </div>

        {/* 관계 온도 히스토리 */}
        {last7Days.length > 0 && (
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ fontSize: 12, fontWeight: 400, color: C.text, marginBottom: 10 }}>{r.historyTitle}</p>
            <WarmthDots checkins={last7Days} />
            {(warmest || mostConcerning) && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                {warmest && (
                  <div style={{ flex: 1, background: `${C.amberGold}08`, border: `1px solid ${C.amberGold}22`, borderRadius: 8, padding: '8px 10px' }}>
                    <p style={{ fontSize: 9, color: C.amberGold, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2 }}>{r.warmestRelation}</p>
                    <p style={{ fontSize: 13, color: C.text, fontFamily: "'Cormorant Garamond', serif" }}>{warmest.name}</p>
                  </div>
                )}
                {mostConcerning && mostConcerning.name !== warmest?.name && (
                  <div style={{ flex: 1, background: '#DC262608', border: '1px solid #DC262622', borderRadius: 8, padding: '8px 10px' }}>
                    <p style={{ fontSize: 9, color: '#DC2626', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2 }}>{r.mostConcerning}</p>
                    <p style={{ fontSize: 13, color: C.text, fontFamily: "'Cormorant Garamond', serif" }}>{mostConcerning.name}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PeopleSection */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', minHeight: 200 }}>
          <PeopleSection people={people} peopleLoading={peopleLoading} />
        </div>

        {/* CoupleAnalysis 축약 */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <CoupleAnalysis />
        </div>

        {/* Amber 코멘트 */}
        <div style={{ background: `${C.amberGold}08`, border: `1px solid ${C.amberGold}22`, borderRadius: 14, padding: '14px 16px' }}>
          <p style={{ fontSize: 9, color: C.amberGold, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>AMBER</p>
          <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
            {amberMsg}
          </p>
        </div>
      </div>
    </div>
  );
}
