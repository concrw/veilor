import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useMeTranslations } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/context/LanguageContext';
import { C } from '@/lib/colors';

type InterestStatus = 'active' | 'dormant' | 'revisit';

interface SocialInterest {
  id: string;
  issue_code: string;
  level: number;
  status: InterestStatus;
  note: string | null;
  updated_at: string;
}

interface SocialContribution {
  id: string;
  date: string;
  action_text: string;
  issue_code: string | null;
}

interface SocialPivot {
  id: string;
  pivot_type: 'growth' | 'fatigue' | 'transition';
  detected_at: string;
  note: string | null;
}

const AREA_META: Record<string, { emoji: string; ko: string; en: string; x: number; y: number }> = {
  env:       { emoji: '🌱', ko: '환경',    en: 'Env',       x:  60, y: -60 },
  edu:       { emoji: '📚', ko: '교육',    en: 'Edu',       x: -40, y:  50 },
  labor:     { emoji: '⚙️', ko: '노동',    en: 'Labour',    x:   0, y:   0 },
  health:    { emoji: '🏥', ko: '의료',    en: 'Health',    x: 100, y:  20 },
  equity:    { emoji: '⚖️', ko: '차별·인권', en: 'Equity',  x: -90, y: -50 },
  tech:      { emoji: '🤖', ko: 'AI 윤리', en: 'AI Ethics', x:  80, y:  70 },
  poverty:   { emoji: '🏠', ko: '빈곤',    en: 'Poverty',   x:-100, y:  70 },
  community: { emoji: '🤝', ko: '공동체', en: 'Community',  x:  30, y: -80 },
};

const STATUS_COLOR: Record<InterestStatus, string> = {
  active:  '#7FB89A',
  dormant: '#78716C',
  revisit: '#C4A355',
};

const PIVOT_COLOR: Record<string, string> = {
  growth:     '#7FB89A',
  fatigue:    '#C97A6A',
  transition: '#A89BC9',
};

function formatDate(iso: string) {
  return iso.slice(0, 10);
}

export default function ImpactTab() {
  const { user } = useAuth();
  const me = useMeTranslations();
  const { language } = useLanguageContext();
  const navigate = useNavigate();
  const t = me.impact;
  const isKo = language === 'ko';

  const { data: interests = [] } = useQuery<SocialInterest[]>({
    queryKey: ['social-interests-level1', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('social_interests')
        .select('*')
        .eq('user_id', user!.id)
        .eq('level', 1)
        .order('updated_at', { ascending: false });
      return (data ?? []) as SocialInterest[];
    },
    enabled: !!user,
  });

  const { data: contributions = [] } = useQuery<SocialContribution[]>({
    queryKey: ['social-contributions', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('social_contributions')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(10);
      return (data ?? []) as SocialContribution[];
    },
    enabled: !!user,
  });

  const { data: pivots = [] } = useQuery<SocialPivot[]>({
    queryKey: ['social-pivots', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('social_pivots')
        .select('*')
        .eq('user_id', user!.id)
        .order('detected_at', { ascending: false })
        .limit(5);
      return (data ?? []) as SocialPivot[];
    },
    enabled: !!user,
  });

  const pivotLabel = (type: string) => {
    if (type === 'growth')     return t.pivotGrowth;
    if (type === 'fatigue')    return t.pivotFatigue;
    if (type === 'transition') return t.pivotTransition;
    return type;
  };

  const statusLabel = (s: InterestStatus) => {
    if (s === 'active')  return t.statusActive;
    if (s === 'dormant') return t.statusDormant;
    return t.statusRevisit;
  };

  const activeCount  = interests.filter(i => i.status === 'active').length;
  const revisitCount = interests.filter(i => i.status === 'revisit').length;
  const dormantCount = interests.filter(i => i.status === 'dormant').length;

  return (
    <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* 섹션 A — 관심 지도 (SVG 별자리) */}
      <section>
        <p style={{ fontSize: 11, fontWeight: 400, color: C.text3, marginBottom: 10, letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: 'var(--mono, monospace)' }}>
          {isKo ? '관심 지도' : 'Interest Map'}
        </p>

        {interests.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 0' }}>
            <span style={{ fontSize: 13, color: C.text3, textAlign: 'center' }}>{t.empty}</span>
            <button
              onClick={() => navigate('/home/get')}
              style={{ fontSize: 12, color: '#7FB89A', background: 'transparent', border: '1px solid #7FB89A', borderRadius: 8, padding: '7px 16px', cursor: 'pointer' }}
            >
              {t.goToGet}
            </button>
          </div>
        ) : (
          <>
            <div style={{
              padding: '12px', background: C.bg2,
              border: `1px solid ${C.borderSoft ?? 'rgba(231,229,228,.06)'}`,
              borderRadius: 14, position: 'relative', height: 220,
            }}>
              <svg viewBox="-150 -100 300 200" width="100%" height="100%">
                {interests.map(item => {
                  const meta = AREA_META[item.issue_code];
                  if (!meta) return null;
                  const opa  = item.status === 'active' ? 1 : item.status === 'revisit' ? 0.55 : 0.25;
                  const r    = item.status === 'active' ? 16 : item.status === 'revisit' ? 11 : 7;
                  const col  = STATUS_COLOR[item.status];
                  const label = isKo ? meta.ko : meta.en;
                  return (
                    <g key={item.id} opacity={opa}>
                      <circle cx={meta.x} cy={meta.y} r={r} fill={col} fillOpacity={0.18}/>
                      <circle cx={meta.x} cy={meta.y} r={r * 0.45} fill={col}/>
                      <text
                        x={meta.x} y={meta.y + r + 12}
                        textAnchor="middle"
                        style={{ fontFamily: 'var(--sans, sans-serif)', fontSize: 10, fill: '#B8B3AF' }}
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10, color: C.text4, fontFamily: 'var(--mono, monospace)', letterSpacing: '.06em' }}>
              <span>● {isKo ? '살아있음' : 'Active'} {activeCount}</span>
              <span style={{ opacity: .6 }}>○ {isKo ? '다시 볼 때' : 'Revisit'} {revisitCount}</span>
              <span style={{ opacity: .35 }}>· {isKo ? '잠듦' : 'Dormant'} {dormantCount}</span>
            </div>

            {/* 이모티콘 목록 보조 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
              {interests.map(item => {
                const meta = AREA_META[item.issue_code] ?? { emoji: '◻️', ko: item.issue_code, en: item.issue_code, x: 0, y: 0 };
                const color = STATUS_COLOR[item.status] ?? C.text3;
                const label = isKo ? meta.ko : meta.en;
                const lastDate = t.lastUpdated.replace('{date}', formatDate(item.updated_at));
                return (
                  <div
                    key={item.id}
                    style={{
                      background: C.bg2,
                      border: `1px solid ${color}40`,
                      borderLeft: `3px solid ${color}`,
                      borderRadius: 10,
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 5,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 16 }}>{meta.emoji}</span>
                      <span style={{ fontSize: 12, color: C.text }}>{label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, color, background: `${color}18`, borderRadius: 4, padding: '2px 6px' }}>
                        {statusLabel(item.status)}
                      </span>
                      <span style={{ fontSize: 9, color: C.text4 }}>{lastDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* 섹션 B — 기여 타임라인 */}
      <section>
        <p style={{ fontSize: 11, fontWeight: 400, color: C.text3, marginBottom: 10, letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: 'var(--mono, monospace)' }}>
          {t.contributionTitle}
        </p>

        {contributions.length === 0 ? (
          <span style={{ fontSize: 13, color: C.text3 }}>{t.contributionEmpty}</span>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 22 }}>
            <div style={{ position: 'absolute', left: 5, top: 8, bottom: 8, width: 1, background: 'rgba(231,229,228,.06)' }}/>
            {contributions.map((c, i) => (
              <div
                key={c.id}
                style={{ marginBottom: i < contributions.length - 1 ? 14 : 0, position: 'relative' }}
              >
                <span style={{
                  position: 'absolute', left: -22, top: 4,
                  width: 11, height: 11, borderRadius: '50%',
                  background: C.bg, border: '2px solid #7FB89A',
                }}/>
                <div style={{ fontSize: 9, color: C.text4, fontFamily: 'var(--mono, monospace)', letterSpacing: '.06em' }}>{formatDate(c.date)}</div>
                <div style={{ fontFamily: 'var(--serif, serif)', fontSize: 14, color: C.text, marginTop: 2 }}>{c.action_text}</div>
                {c.issue_code && (
                  <span style={{ fontSize: 10, color: '#7FB89A', background: '#7FB89A18', borderRadius: 4, padding: '2px 7px', display: 'inline-block', marginTop: 3 }}>
                    {c.issue_code}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 섹션 C — 피보팅 기록 */}
      <section>
        <p style={{ fontSize: 11, fontWeight: 400, color: C.text3, marginBottom: 10, letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: 'var(--mono, monospace)' }}>
          {t.pivotTitle}
        </p>

        {pivots.length === 0 ? (
          <span style={{ fontSize: 13, color: C.text3 }}>{t.contributionEmpty}</span>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pivots.map(p => {
              const color = PIVOT_COLOR[p.pivot_type] ?? C.text3;
              return (
                <div
                  key={p.id}
                  style={{
                    background: C.bg2,
                    border: `1px solid ${C.border}`,
                    borderLeft: `3px solid ${color}`,
                    borderRadius: 10,
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color, fontWeight: 500 }}>{pivotLabel(p.pivot_type)}</span>
                    <span style={{ fontSize: 10, color: C.text4 }}>{formatDate(p.detected_at)}</span>
                  </div>
                  {p.note && <span style={{ fontSize: 12, color: C.text2 }}>{p.note}</span>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 하단 여백 메모 */}
      <div style={{
        padding: '12px 14px',
        background: 'linear-gradient(180deg, rgba(127,184,154,.06), transparent)',
        border: '1px dashed rgba(127,184,154,.35)',
        borderRadius: 10,
        fontSize: 11.5, color: C.text2,
        fontFamily: 'var(--serif, serif)', fontStyle: 'italic', lineHeight: 1.5,
      }}>
        {isKo ? '관심사는 바뀔 수 있어요. 지금 이 순간의 기록이에요.' : 'Interests can shift. This is your record of this moment.'}
      </div>
    </div>
  );
}
