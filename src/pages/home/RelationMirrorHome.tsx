import { useNavigate } from 'react-router-dom';
import { useRelationTranslations } from '@/hooks/useTranslation';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { C } from '@/lib/colors';
import CommunicationPatternCard from '@/components/me/CommunicationPatternCard';
import RelationshipCoaching from '@/components/set/RelationshipCoaching';
import PartnerPatternInference from '@/components/dig/PartnerPatternInference';
import { inferRelationPattern, type RelationPattern } from '@/lib/relationPattern';
import { BOUNDARY_CATEGORY_KEYS } from '@/components/set/BoundaryTab';
import { useLanguageContext } from '@/context/LanguageContext';

// ─── 타입 ────────────────────────────────────────────────────────────────────
type Group = 'Core' | 'Middle' | 'Echo' | 'Outer';

interface RelationPerson {
  id: string;
  name: string;
  group_name: Group;
  warmth_score: number;
  updated_at: string;
}

interface Checkin {
  person_name: string;
  warmth_score: number;
  created_at: string;
}

// ─── 상수 ────────────────────────────────────────────────────────────────────
const PATTERN_COLOR: Record<RelationPattern, string> = {
  ANXIOUS_ATTACH: '#F59E0B',
  AVOIDANT: '#6366F1',
  OVERCARE: '#EC4899',
  BALANCED: '#10B981',
};

const MOCK_PEOPLE: RelationPerson[] = [
  { id: 'm1', name: '지수', group_name: 'Core', warmth_score: 7, updated_at: new Date().toISOString() },
  { id: 'm2', name: '민준', group_name: 'Core', warmth_score: 4, updated_at: new Date().toISOString() },
  { id: 'm3', name: '서연', group_name: 'Middle', warmth_score: 6, updated_at: new Date().toISOString() },
];

const MOCK_CHECKINS: Checkin[] = Array.from({ length: 14 }, (_, dayIdx) =>
  MOCK_PEOPLE.slice(0, 2).map(p => ({
    person_name: p.name,
    warmth_score: Math.max(1, Math.min(10, p.warmth_score + Math.floor(Math.random() * 3) - 1)),
    created_at: new Date(Date.now() - (13 - dayIdx) * 86400000).toISOString(),
  }))
).flat();

// ─── 서브: 히트맵 ─────────────────────────────────────────────────────────────
function RelationHeatmap({
  checkins,
  title,
  subtitle,
}: {
  checkins: Checkin[];
  title: string;
  subtitle: string;
}) {
  const days = 14;
  const now = Date.now();

  // 인물별 × 날짜별 점수 집계
  const byPerson: Record<string, Record<number, number>> = {};
  checkins.forEach(c => {
    const daysAgo = Math.floor((now - new Date(c.created_at).getTime()) / 86400000);
    if (daysAgo > days - 1) return;
    if (!byPerson[c.person_name]) byPerson[c.person_name] = {};
    byPerson[c.person_name][daysAgo] = c.warmth_score;
  });

  const people = Object.keys(byPerson).slice(0, 5);
  if (people.length === 0) return null;

  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
      <p style={{ fontSize: 12, fontWeight: 400, color: C.text, marginBottom: 2 }}>{title}</p>
      <p style={{ fontSize: 10, color: C.text4, marginBottom: 12 }}>{subtitle}</p>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 260 }}>
          {people.map(name => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 44, flexShrink: 0, fontSize: 10, color: C.text3,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {name}
              </span>
              <div style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: days }, (_, i) => {
                  const daysAgo = days - 1 - i;
                  const score = byPerson[name][daysAgo];
                  const opacity = score != null ? 0.15 + (score / 10) * 0.85 : 0.07;
                  return (
                    <div
                      key={i}
                      style={{
                        width: 14, height: 14, borderRadius: 3,
                        background: C.amberGold,
                        opacity,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 서브: 팀 적합도 카드 ─────────────────────────────────────────────────────
function TeamFitCards({
  people,
  title,
  subtitle,
}: {
  people: RelationPerson[];
  title: string;
  subtitle: string;
}) {
  const corePeople = people.filter(p => p.group_name === 'Core').slice(0, 4);
  if (corePeople.length < 2) return null;

  // 2인 조합 최대 3개
  const pairs: [RelationPerson, RelationPerson, number][] = [];
  for (let i = 0; i < corePeople.length && pairs.length < 3; i++) {
    for (let j = i + 1; j < corePeople.length && pairs.length < 3; j++) {
      const score = Math.round((corePeople[i].warmth_score + corePeople[j].warmth_score) / 2 * 10);
      pairs.push([corePeople[i], corePeople[j], score]);
    }
  }

  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
      <p style={{ fontSize: 12, fontWeight: 400, color: C.text, marginBottom: 2 }}>{title}</p>
      <p style={{ fontSize: 10, color: C.text4, marginBottom: 12 }}>{subtitle}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pairs.map(([a, b, score]) => (
          <div key={`${a.id}-${b.id}`} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 12px', borderRadius: 10,
            background: C.bg, border: `1px solid ${C.border}`,
          }}>
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: C.text, marginBottom: 2 }}>
                {a.name} × {b.name}
              </p>
            </div>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 18, color: C.amberGold, fontWeight: 400,
            }}>
              {score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export default function RelationMirrorHome() {
  const { language } = useLanguageContext();
  const t = useRelationTranslations();
  const rm = t.mirror;
  const navigate = useNavigate();
  const { user } = useAuth();

  // 경계 설정
  const { data: savedBoundaries = [] } = useQuery({
    queryKey: ['user-boundaries', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('user_boundaries')
        .select('*')
        .eq('user_id', user!.id);
      return (data ?? []) as { category: string; text: string }[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const boundaryByCategory: Record<string, boolean> = {};
  BOUNDARY_CATEGORY_KEYS.forEach(k => {
    boundaryByCategory[k] = savedBoundaries.some(b => b.category === k && b.text?.trim());
  });
  const boundaryCount = Object.values(boundaryByCategory).filter(Boolean).length;

  // Vent 키워드
  const { data: ventKeywords = [] } = useQuery({
    queryKey: ['vent-relation-keywords', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('tab_conversations')
        .select('message_content')
        .eq('user_id', user!.id)
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .limit(50);
      const texts = (data ?? []).map((d: { message_content: string }) => d.message_content ?? '');
      return texts.flatMap((t: string) => t.split(/\s+/)).filter((w: string) => w.length > 1);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  // 소통 깊이
  const { data: commDepth = 0 } = useQuery({
    queryKey: ['comm-depth', user?.id],
    queryFn: async () => {
      const { data: entries } = await veilorDb
        .from('codetalk_entries')
        .select('imprinting_moment, root_cause')
        .eq('user_id', user!.id)
        .limit(20);
      if (!entries || entries.length === 0) return 0;
      const withImprint = entries.filter((e: { imprinting_moment: unknown }) => e.imprinting_moment).length;
      const withRoot = entries.filter((e: { root_cause: unknown }) => e.root_cause).length;
      return Math.round(((withImprint + withRoot) / (entries.length * 2)) * 100);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // relation_people
  const { data: relationPeople = [] } = useQuery({
    queryKey: ['relation-people', user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await veilorDb
          .from('relation_people' as never)
          .select('id, name, group_name, warmth_score, updated_at')
          .eq('user_id', user!.id);
        if (error) return MOCK_PEOPLE;
        return ((data as RelationPerson[]) ?? []).length > 0 ? (data as RelationPerson[]) : MOCK_PEOPLE;
      } catch {
        return MOCK_PEOPLE;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  // relation_people_checkins (히트맵용)
  const { data: heatmapCheckins = [] } = useQuery({
    queryKey: ['relation-checkins-heatmap', user?.id],
    queryFn: async () => {
      try {
        const since = new Date(Date.now() - 14 * 86400000).toISOString();
        const { data, error } = await veilorDb
          .from('relation_people_checkins' as never)
          .select('person_name, warmth_score, created_at')
          .eq('user_id', user!.id)
          .gte('created_at', since);
        if (error) return MOCK_CHECKINS;
        return ((data as Checkin[]) ?? []).length > 0 ? (data as Checkin[]) : MOCK_CHECKINS;
      } catch {
        return MOCK_CHECKINS;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const pattern = inferRelationPattern(ventKeywords, boundaryCount, commDepth);
  const patternColor = PATTERN_COLOR[pattern];

  // 이번 주 패턴 요약 텍스트
  const weeklyPatternText = rm.patternLabels[pattern];
  const weeklyPatternDesc = rm.patternDescs[pattern];

  const today = new Date().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
    month: 'long', day: 'numeric', weekday: 'short',
  });

  return (
    <div style={{ minHeight: '100vh', background: C.bg, overflowY: 'auto', paddingBottom: 80 }}>
      {/* 헤더 */}
      <div style={{ padding: '20px 20px 0' }}>
        <span style={{ fontSize: 9, letterSpacing: '.15em', color: C.amberGold, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
          {rm.section}
        </span>
        <p style={{ fontSize: 10, color: C.text4, marginBottom: 2 }}>{today}</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 22, color: C.text, lineHeight: 1.3 }}>
          {rm.subtitle}
        </h1>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ① 이번 주 패턴 callout */}
        <div style={{
          background: C.bg2, border: `1px solid ${C.border}`,
          borderLeft: `2px solid ${patternColor}`,
          borderRadius: 14, padding: '14px 16px',
        }}>
          <p style={{ fontSize: 9, color: C.text4, fontFamily: 'monospace', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            {rm.weeklyPatternLabel}
          </p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: C.text, fontWeight: 400, marginBottom: 4 }}>
            {weeklyPatternText}
          </p>
          <p style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>{weeklyPatternDesc}</p>
        </div>

        {/* ② CommunicationPatternCard */}
        <CommunicationPatternCard />

        {/* ③ 관계 강도 히트맵 */}
        <RelationHeatmap
          checkins={heatmapCheckins}
          title={rm.heatmapTitle}
          subtitle={rm.heatmapDays(14)}
        />

        {/* ④ 경계 설정 요약 */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 400, color: C.text }}>{rm.boundaryTitle}</p>
            <button
              onClick={() => navigate('/set')}
              style={{ fontSize: 10, color: C.amberGold, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {rm.boundaryDetail} ›
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {BOUNDARY_CATEGORY_KEYS.map(k => (
              <div key={k} style={{
                padding: '4px 10px', borderRadius: 99, fontSize: 10,
                border: `1px solid ${boundaryByCategory[k] ? C.amberGold : C.border}`,
                background: boundaryByCategory[k] ? `${C.amberGold}15` : 'transparent',
                color: boundaryByCategory[k] ? C.amberGold : C.text5,
              }}>
                {k}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: C.text4 }}>{rm.boundaryCount(boundaryCount)}</p>
        </div>

        {/* ⑤ RelationshipCoaching */}
        <RelationshipCoaching />

        {/* ⑥ 팀 적합도 카드 */}
        <TeamFitCards
          people={relationPeople}
          title={rm.teamFitTitle}
          subtitle={rm.teamFitDesc}
        />

        {/* ⑦ PartnerPatternInference */}
        <PartnerPatternInference />

        {/* ⑧ 반복 패턴 인사이트 */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
          <p style={{ fontSize: 12, fontWeight: 400, color: C.text, marginBottom: 10 }}>{rm.patternTitle}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `${patternColor}22`, border: `2px solid ${patternColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: patternColor }} />
            </div>
            <div>
              <p style={{ fontSize: 13, color: C.text, fontWeight: 500, marginBottom: 2 }}>{rm.patternLabels[pattern]}</p>
              <p style={{ fontSize: 10, color: C.text4 }}>{pattern}</p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.65, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
            {rm.patternDescs[pattern]}
          </p>
        </div>

        {/* ⑨ Amber */}
        <div style={{ background: `${C.amberGold}08`, border: `1px solid ${C.amberGold}22`, borderRadius: 14, padding: '14px 16px' }}>
          <p style={{ fontSize: 9, color: C.amberGold, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>AMBER</p>
          <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
            {rm.amberPattern}
          </p>
        </div>

        {/* ⑩ SET 탭 이동 버튼 */}
        <button
          onClick={() => navigate('/home/set')}
          style={{
            width: '100%', padding: '13px 0', borderRadius: 12,
            border: `1px solid ${C.amberGold}44`, background: `${C.amberGold}08`,
            color: C.amberGold, fontSize: 13, cursor: 'pointer',
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          {rm.setActionBtn}
        </button>
      </div>
    </div>
  );
}
