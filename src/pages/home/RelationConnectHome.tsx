import { useState } from 'react';
import { useRelationTranslations } from '@/hooks/useTranslation';
import { useRelationConnect } from '@/hooks/useRelationConnect';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { C } from '@/lib/colors';
import PeopleSection from '@/components/me/PeopleSection';
import CoupleAnalysis from '@/components/couple/CoupleAnalysis';
import RelationAddPerson from '@/components/me/RelationAddPerson';
import { useLanguageContext } from '@/context/LanguageContext';

// ─── 타입 ───────────────────────────────────────────────────────────────────
type Group = 'Core' | 'Middle' | 'Echo' | 'Outer';

interface RelationPerson {
  id: string;
  name: string;
  group_name: Group;
  relation_type: string;
  strength: string;
  need: string;
  current_state: string;
  warmth_score: number;
  last_met: string | null;
  updated_at: string;
}

// ─── 상수 ────────────────────────────────────────────────────────────────────
const GROUP_COLORS: Record<Group, string> = {
  Core: C.amberGold,
  Middle: C.text2,
  Echo: C.text4,
  Outer: C.text5,
};

const MOCK_PEOPLE: RelationPerson[] = [
  { id: 'm1', name: '지수', group_name: 'Core', relation_type: '친구', strength: '공감 능력', need: '안정감', current_state: '새 직장 적응 중', warmth_score: 7, last_met: null, updated_at: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: 'm2', name: '민준', group_name: 'Core', relation_type: '동료', strength: '논리적 사고', need: '인정', current_state: '프로젝트 마감 압박', warmth_score: 4, last_met: null, updated_at: new Date(Date.now() - 35 * 86400000).toISOString() },
];

// ─── 서브 컴포넌트: 따뜻함 닷 로우 ──────────────────────────────────────────
function WarmthDotRow({ score }: { score: number }) {
  const total = 14;
  return (
    <div style={{ display: 'flex', gap: 3, marginTop: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 5, height: 5, borderRadius: '50%',
            background: C.amberGold,
            opacity: i < Math.round((score / 10) * total) ? 0.9 : 0.12,
          }}
        />
      ))}
    </div>
  );
}

// ─── 서브 컴포넌트: 기존 체크인 히스토리 ─────────────────────────────────────
function WarmthHistory({ checkins }: { checkins: { person_name: string; warmth_score: number; created_at: string }[] }) {
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

// ─── 서브 컴포넌트: 동심원 다이어그램 ────────────────────────────────────────
function ConcentricDiagram({
  groupCounts,
  rc,
}: {
  groupCounts: Record<Group, number>;
  rc: ReturnType<typeof useRelationTranslations>['connect'];
}) {
  const radii = [140, 110, 78, 44];
  const groups: Group[] = ['Outer', 'Echo', 'Middle', 'Core'];
  const size = 300;
  const center = size / 2;

  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 16px' }}>
      <p style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: C.text4, marginBottom: 14 }}>
        {rc.concentricTitle}
      </p>

      {/* SVG 동심원 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
            {radii.map((r, i) => (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke={C.border}
                strokeWidth={1}
                strokeDasharray={i === 0 ? '0' : '3 4'}
              />
            ))}
          </svg>
          {/* 그룹 라벨 오버레이 */}
          {groups.map((g, i) => {
            const r = radii[i];
            return (
              <div
                key={g}
                style={{
                  position: 'absolute',
                  left: center + r * 0.55,
                  top: center - 6,
                  fontSize: 9,
                  color: GROUP_COLORS[g],
                  letterSpacing: '.05em',
                  whiteSpace: 'nowrap',
                }}
              >
                {g}
              </div>
            );
          })}
          {/* 중앙 ME */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 10, color: C.amberGold,
            fontFamily: 'monospace', letterSpacing: '.15em',
          }}>
            ME
          </div>
        </div>
      </div>

      {/* 2×2 그룹 카운트 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {(['Core', 'Middle', 'Echo', 'Outer'] as Group[]).map(g => (
          <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: GROUP_COLORS[g], flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: C.text3, fontFamily: 'monospace' }}>{g}</span>
            <span style={{ fontSize: 11, color: C.text4, marginLeft: 'auto', fontFamily: 'monospace' }}>
              {rc.groupSuffix(groupCounts[g] ?? 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 서브 컴포넌트: 지인 카드 ────────────────────────────────────────────────
function PersonCard({
  person,
  rc,
}: {
  person: RelationPerson;
  rc: ReturnType<typeof useRelationTranslations>['connect'];
}) {
  const daysAgo = person.updated_at
    ? Math.floor((Date.now() - new Date(person.updated_at).getTime()) / 86400000)
    : 0;

  return (
    <div style={{
      background: C.bg2, border: `1px solid ${C.border}`,
      borderLeft: `2px solid ${C.amberGold}`,
      borderRadius: 12, padding: '12px 14px',
    }}>
      {/* 상단: 이름 + 마지막 날짜 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.text }}>
          {person.name}
        </span>
        <span style={{ fontSize: 10, color: C.text4, fontFamily: 'monospace' }}>
          {person.relation_type} · {rc.cardLastContact(daysAgo)}
        </span>
      </div>

      {/* 2컬럼 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginBottom: 8 }}>
        {([
          [rc.cardStrength, person.strength],
          [rc.cardNeed, person.need],
          [rc.cardState, person.current_state],
        ] as [string, string][]).map(([label, value]) => value ? (
          <div key={label}>
            <span style={{ fontSize: 9, color: C.text5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 2 }}>
              {label}
            </span>
            <span style={{ fontSize: 11, color: C.text3 }}>{value}</span>
          </div>
        ) : null)}
      </div>

      {/* warmth dot row */}
      <WarmthDotRow score={person.warmth_score} />
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export default function RelationConnectHome() {
  const { language } = useLanguageContext();
  const t = useRelationTranslations();
  const rc = t.connect;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { checkins, last7Days, warmest, mostConcerning, saveMutation } = useRelationConnect();

  const [personName, setPersonName] = useState('');
  const [warmth, setWarmth] = useState(5);
  const [energy, setEnergy] = useState(0);
  const [note, setNote] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // relation_people 조회 (테이블 없으면 mock fallback)
  const { data: relationPeople = [], refetch: refetchPeople } = useQuery({
    queryKey: ['relation-people', user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await veilorDb
          .from('relation_people' as never)
          .select('*')
          .eq('user_id', user!.id)
          .order('updated_at', { ascending: false });
        if (error) return MOCK_PEOPLE;
        return ((data as RelationPerson[]) ?? []).length > 0 ? (data as RelationPerson[]) : MOCK_PEOPLE;
      } catch {
        return MOCK_PEOPLE;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  // relation_entities (기존)
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

  // 그룹 카운트
  const groupCounts = relationPeople.reduce<Record<Group, number>>(
    (acc, p) => { acc[p.group_name] = (acc[p.group_name] ?? 0) + 1; return acc; },
    { Core: 0, Middle: 0, Echo: 0, Outer: 0 },
  );

  // Core 인원만
  const corePeople = relationPeople.filter(p => p.group_name === 'Core');

  // AI 제안 — warmth 낮고 마지막 연락 오래된 사람
  const aiSuggestion = corePeople.find(p => {
    const days = Math.floor((Date.now() - new Date(p.updated_at).getTime()) / 86400000);
    return days >= 14 && p.warmth_score <= 5;
  });
  const aiWeeks = aiSuggestion
    ? Math.floor((Date.now() - new Date(aiSuggestion.updated_at).getTime()) / (7 * 86400000))
    : 0;

  const today = new Date().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
    month: 'long', day: 'numeric', weekday: 'short',
  });

  const latestCheckin = checkins[0];
  let amberMsg = rc.amberNoCheckin;
  if (latestCheckin) {
    if (latestCheckin.energy_balance <= -3) amberMsg = rc.amberLowEnergy;
    else if (latestCheckin.warmth_score <= 3) amberMsg = rc.amberLowWarmth(latestCheckin.person_name);
  }

  const handleSave = () => {
    if (!personName.trim()) return;
    saveMutation.mutate(
      { person_name: personName.trim(), warmth_score: warmth, energy_balance: energy, note: note.trim(), lang: language },
      { onSuccess: () => { setPersonName(''); setWarmth(5); setEnergy(0); setNote(''); } },
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, overflowY: 'auto', paddingBottom: 100 }}>
      {/* 헤더 */}
      <div style={{ padding: '20px 20px 0' }}>
        <span style={{ fontSize: 9, letterSpacing: '.15em', color: C.amberGold, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
          {rc.section}
        </span>
        <p style={{ fontSize: 10, color: C.text4, marginBottom: 2 }}>{today}</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 22, color: C.text, lineHeight: 1.3 }}>
          {rc.subtitle}
        </h1>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ① 동심원 다이어그램 */}
        <ConcentricDiagram groupCounts={groupCounts} rc={rc} />

        {/* ② Core 지인 카드 목록 */}
        <div>
          <p style={{ fontSize: 10, color: C.text4, fontFamily: 'monospace', letterSpacing: '.06em', marginBottom: 10 }}>
            {rc.coreSectionLabel(corePeople.length)}
          </p>

          {corePeople.length === 0 ? (
            <div style={{
              background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: '24px 16px', textAlign: 'center',
            }}>
              <p style={{ fontSize: 12, color: C.text4, marginBottom: 12 }}>{rc.emptyPeople}</p>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  padding: '8px 20px', borderRadius: 99,
                  border: `1px solid ${C.amberGold}`, background: 'transparent',
                  color: C.amberGold, fontSize: 12, cursor: 'pointer',
                }}
              >
                {rc.addPersonCta}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {corePeople.map(p => (
                <PersonCard key={p.id} person={p} rc={rc} />
              ))}
            </div>
          )}

          {/* AI 제안 카드 */}
          {aiSuggestion && (
            <div style={{
              marginTop: 10,
              background: `color-mix(in srgb, ${C.amberGold} 8%, transparent)`,
              border: `1px solid ${C.amberGold}22`,
              borderRadius: 12, padding: '12px 14px',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <span style={{ fontSize: 16 }}>✦</span>
              <div>
                <p style={{ fontSize: 12, color: C.amberGold, marginBottom: 4 }}>
                  {rc.aiSuggestionPrefix} — {aiSuggestion.name}
                </p>
                <p style={{ fontSize: 11, color: C.text3 }}>
                  {rc.aiWeeksAgo(aiWeeks)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ③ 체크인 카드 */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 16px' }}>
          <p style={{ fontSize: 12, fontWeight: 400, color: C.text, marginBottom: 12 }}>{rc.checkinTitle}</p>
          <input
            value={personName}
            onChange={e => setPersonName(e.target.value)}
            placeholder={rc.personPlaceholder}
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
              <span style={{ fontSize: 9, color: C.text4, letterSpacing: '.06em', textTransform: 'uppercase' }}>{rc.warmthLabel}</span>
              <span style={{ fontSize: 12, color: C.amberGold, fontFamily: "'Cormorant Garamond', serif" }}>{warmth}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: C.text5, width: 36, flexShrink: 0 }}>{rc.warmthLow}</span>
              <input type="range" min={1} max={10} value={warmth} onChange={e => setWarmth(Number(e.target.value))} style={{ flex: 1, accentColor: C.amberGold }} />
              <span style={{ fontSize: 10, color: C.text5, width: 36, flexShrink: 0, textAlign: 'right' }}>{rc.warmthHigh}</span>
            </div>
          </div>
          {/* 에너지 슬라이더 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 9, color: C.text4, letterSpacing: '.06em', textTransform: 'uppercase' }}>{rc.energyLabel}</span>
              <span style={{ fontSize: 12, color: energy >= 0 ? C.amberGold : '#DC2626', fontFamily: "'Cormorant Garamond', serif" }}>
                {energy > 0 ? `+${energy}` : energy}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: C.text5, width: 36, flexShrink: 0 }}>{rc.energyLow}</span>
              <input type="range" min={-5} max={5} value={energy} onChange={e => setEnergy(Number(e.target.value))} style={{ flex: 1, accentColor: energy >= 0 ? C.amberGold : '#DC2626' }} />
              <span style={{ fontSize: 10, color: C.text5, width: 36, flexShrink: 0, textAlign: 'right' }}>{rc.energyHigh}</span>
            </div>
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={rc.notePlaceholder}
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
            {saveMutation.isPending ? rc.saving : rc.save}
          </button>
        </div>

        {/* ④ 관계 온도 히스토리 */}
        {last7Days.length > 0 && (
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ fontSize: 12, fontWeight: 400, color: C.text, marginBottom: 10 }}>{rc.historyTitle}</p>
            <WarmthHistory checkins={last7Days} />
            {(warmest || mostConcerning) && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                {warmest && (
                  <div style={{ flex: 1, background: `${C.amberGold}08`, border: `1px solid ${C.amberGold}22`, borderRadius: 8, padding: '8px 10px' }}>
                    <p style={{ fontSize: 9, color: C.amberGold, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2 }}>{rc.warmestRelation}</p>
                    <p style={{ fontSize: 13, color: C.text, fontFamily: "'Cormorant Garamond', serif" }}>{warmest.name}</p>
                  </div>
                )}
                {mostConcerning && mostConcerning.name !== warmest?.name && (
                  <div style={{ flex: 1, background: '#DC262608', border: '1px solid #DC262622', borderRadius: 8, padding: '8px 10px' }}>
                    <p style={{ fontSize: 9, color: '#DC2626', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2 }}>{rc.mostConcerning}</p>
                    <p style={{ fontSize: 13, color: C.text, fontFamily: "'Cormorant Garamond', serif" }}>{mostConcerning.name}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ⑤ PeopleSection */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', minHeight: 200 }}>
          <PeopleSection people={people} peopleLoading={peopleLoading} />
        </div>

        {/* ⑥ CoupleAnalysis */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <CoupleAnalysis />
        </div>

        {/* ⑦ Amber */}
        <div style={{ background: `${C.amberGold}08`, border: `1px solid ${C.amberGold}22`, borderRadius: 14, padding: '14px 16px' }}>
          <p style={{ fontSize: 9, color: C.amberGold, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>AMBER</p>
          <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
            {amberMsg}
          </p>
        </div>
      </div>

      {/* 지인 추가 floating 버튼 */}
      <div style={{
        position: 'fixed', bottom: 90, right: 20, zIndex: 100,
      }}>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '10px 18px', borderRadius: 99,
            border: 'none', background: C.amberGold,
            color: '#000', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          + {rc.addPersonBtn}
        </button>
      </div>

      {/* 지인 추가 모달 */}
      {showAddModal && (
        <RelationAddPerson
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['relation-people', user?.id] });
            refetchPeople();
          }}
        />
      )}
    </div>
  );
}
