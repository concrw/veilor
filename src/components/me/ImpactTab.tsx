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

const AREA_META: Record<string, { emoji: string; ko: string; en: string }> = {
  env:       { emoji: '🌱', ko: '환경·기후',    en: 'Environment & Climate' },
  edu:       { emoji: '📚', ko: '교육·성장',    en: 'Education & Growth' },
  labor:     { emoji: '⚒️', ko: '노동·일',      en: 'Labor & Work' },
  health:    { emoji: '🏥', ko: '건강·복지',    en: 'Health & Welfare' },
  equity:    { emoji: '⚖️', ko: '평등·인권',    en: 'Equity & Rights' },
  tech:      { emoji: '💡', ko: '기술·혁신',    en: 'Tech & Innovation' },
  poverty:   { emoji: '🤝', ko: '빈곤·나눔',    en: 'Poverty & Giving' },
  community: { emoji: '🏘️', ko: '지역·공동체', en: 'Community' },
};

const STATUS_COLOR: Record<InterestStatus, string> = {
  active:  '#2DD4BF',
  dormant: '#78716C',
  revisit: '#C4A355',
};

const PIVOT_COLOR: Record<string, string> = {
  growth:     '#2DD4BF',
  fatigue:    '#FB7185',
  transition: '#C4A355',
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

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* 섹션 A — 관심 지도 */}
      <section>
        <p style={{ fontSize: 11, fontWeight: 400, color: C.text3, marginBottom: 12, letterSpacing: '.04em', textTransform: 'uppercase' }}>
          {t.title}
        </p>

        {interests.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 0' }}>
            <span style={{ fontSize: 13, color: C.text3, textAlign: 'center' }}>{t.empty}</span>
            <button
              onClick={() => navigate('/home/get')}
              style={{ fontSize: 12, color: '#2DD4BF', background: 'transparent', border: `1px solid #2DD4BF`, borderRadius: 8, padding: '7px 16px', cursor: 'pointer' }}
            >
              {t.goToGet}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {interests.map(item => {
              const meta = AREA_META[item.issue_code] ?? { emoji: '◻️', ko: item.issue_code, en: item.issue_code };
              const color = STATUS_COLOR[item.status] ?? C.text3;
              const label = language === 'ko' ? meta.ko : meta.en;
              const lastDate = t.lastUpdated.replace('{date}', formatDate(item.updated_at));
              return (
                <div
                  key={item.id}
                  style={{
                    background: C.bg2,
                    border: `1px solid ${color}40`,
                    borderLeft: `3px solid ${color}`,
                    borderRadius: 10,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 18 }}>{meta.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 400, color: C.text }}>{label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color, fontWeight: 500, background: `${color}18`, borderRadius: 4, padding: '2px 7px' }}>
                      {statusLabel(item.status)}
                    </span>
                    <span style={{ fontSize: 9, color: C.text4 }}>{lastDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 섹션 B — 기여 기록 */}
      <section>
        <p style={{ fontSize: 11, fontWeight: 400, color: C.text3, marginBottom: 12, letterSpacing: '.04em', textTransform: 'uppercase' }}>
          {t.contributionTitle}
        </p>

        {contributions.length === 0 ? (
          <span style={{ fontSize: 13, color: C.text3 }}>{t.contributionEmpty}</span>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {contributions.map((c, i) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  paddingBottom: i < contributions.length - 1 ? 14 : 0,
                  marginBottom: i < contributions.length - 1 ? 0 : 0,
                  borderLeft: `2px solid ${C.border}`,
                  paddingLeft: 14,
                  position: 'relative',
                }}
              >
                <div style={{
                  position: 'absolute', left: -5, top: 4,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#2DD4BF', flexShrink: 0,
                }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 11, color: C.text4 }}>{formatDate(c.date)}</span>
                  <span style={{ fontSize: 13, color: C.text }}>{c.action_text}</span>
                  {c.issue_code && (
                    <span style={{ fontSize: 10, color: '#2DD4BF', background: '#2DD4BF18', borderRadius: 4, padding: '2px 7px', alignSelf: 'flex-start' }}>
                      {c.issue_code}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 섹션 C — 피보팅 기록 */}
      <section>
        <p style={{ fontSize: 11, fontWeight: 400, color: C.text3, marginBottom: 12, letterSpacing: '.04em', textTransform: 'uppercase' }}>
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
                  {p.note && (
                    <span style={{ fontSize: 12, color: C.text2 }}>{p.note}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
