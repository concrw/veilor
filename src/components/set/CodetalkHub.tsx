// CodetalkHub — Rapaille Imprint Method 3-mode 선택 화면
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { C, alpha } from '@/lib/colors';
import { useLanguageContext } from '@/context/LanguageContext';
import type { VeilorCodetalkKeyword } from '@/integrations/supabase/veilor-types';

type CodetalkMode = 'hub' | 'daily' | 'category' | 'relation';

interface CodetalkHubProps {
  onModeSelect: (mode: CodetalkMode) => void;
  keyword: VeilorCodetalkKeyword | null | undefined;
  todayEntry: unknown;
}

const REL_CHIPS = [
  { code: 'rel_lover',   label: 'LOVER' },
  { code: 'rel_family',  label: 'FAMILY' },
  { code: 'rel_friend',  label: 'FRIEND' },
  { code: 'rel_self',    label: 'SELF' },
  { code: 'rel_society', label: 'SOCIETY' },
];

const PSYCH_CHIPS = [
  { code: 'psych_boundary', label: 'BOUNDARY' },
  { code: 'psych_emotion',  label: 'EMOTION' },
  { code: 'psych_desire',   label: 'DESIRE' },
  { code: 'psych_attachment', label: 'ATTACHMENT' },
  { code: 'psych_growth',   label: 'GROWTH' },
];

const TEXTS = {
  ko: {
    header: '◇ RAPAILLE IMPRINT METHOD · 3 MODES',
    daily: {
      title: '① 그날의 코드토크 · DAILY',
      badge: '오늘 06:00 도착',
      desc: '정의 + 각인을 쓰면, 같은 키워드를 작성한 N명의 익명 코드토크를 열람할 수 있어요.',
      cta: '오늘 작성하기 →',
      done: '오늘 작성 완료 ✓',
    },
    category: {
      title: '② 카테고리별 · DEEP DIVE',
      desc: '관계·심리 카테고리별로 원하는 키워드를 골라 각인할 수 있어요.',
    },
    relation: {
      title: '③ 관계별 · WITH',
      desc: '파트너와 함께 같은 키워드를 탐색해요. PairTrust 승인이 필요합니다.',
      addBtn: '+ 파트너 추가',
      partnerCount: (n: number) => `활성 파트너 ${n}명`,
      noneDesc: 'PairTrust로 파트너를 연결해요',
      goBtn: '파트너 연결하기 →',
    },
    weeklyLabel: (n: number, streak: number) => `이번 주 ${n}/7 · 연속 ${streak}일`,
  },
  en: {
    header: '◇ RAPAILLE IMPRINT METHOD · 3 MODES',
    daily: {
      title: '① Daily Codetalk · DAILY',
      badge: 'Arrives 06:00 today',
      desc: 'Write a definition + imprint to read anonymous codetalk from others with the same keyword.',
      cta: 'Write today →',
      done: 'Today complete ✓',
    },
    category: {
      title: '② By Category · DEEP DIVE',
      desc: 'Choose any keyword by relationship or psychology category.',
    },
    relation: {
      title: '③ By Relation · WITH',
      desc: 'Explore the same keyword with a partner. PairTrust approval required.',
      addBtn: '+ Add partner',
      partnerCount: (n: number) => `${n} active partner${n !== 1 ? 's' : ''}`,
      noneDesc: 'Connect partners via PairTrust',
      goBtn: 'Connect partner →',
    },
    weeklyLabel: (n: number, streak: number) => `This week ${n}/7 · ${streak}-day streak`,
  },
};

export default function CodetalkHub({ onModeSelect, keyword, todayEntry }: CodetalkHubProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const t = TEXTS[language === 'ko' ? 'ko' : 'en'];

  const { data: profile } = useQuery({
    queryKey: ['user-profile-streak', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await veilorDb
        .from('user_profiles')
        .select('codetalk_day, streak_count')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: weeklyEntries } = useQuery({
    queryKey: ['codetalk-weekly', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const start = new Date();
      start.setDate(start.getDate() - start.getDay());
      const startStr = start.toLocaleDateString('sv-SE');
      const { data } = await veilorDb
        .from('codetalk_entries')
        .select('entry_date')
        .eq('user_id', user.id)
        .gte('entry_date', startStr);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: partners } = useQuery({
    queryKey: ['pair-trust-active', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await veilorDb
        .from('pair_trust_grants')
        .select('id, grantor_id, grantee_id, trust_level')
        .or(`grantor_id.eq.${user.id},grantee_id.eq.${user.id}`)
        .eq('is_active', true)
        .limit(3);
      return data ?? [];
    },
    enabled: !!user,
  });

  const dayNumber = profile?.codetalk_day ?? 1;
  const streak = profile?.streak_count ?? 0;
  const weekCount = weeklyEntries?.length ?? 0;
  const hasTodayEntry = !!todayEntry;
  const partnerCount = partners?.length ?? 0;

  const accentColor = '#7FB89A';
  const relationColor = '#95BDD6';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 헤더 */}
      <p style={{
        fontFamily: 'monospace',
        fontSize: 10,
        letterSpacing: '0.1em',
        color: C.text3,
        paddingLeft: 2,
        marginBottom: 4,
      }}>
        {t.header}
      </p>

      {/* 카드 1 — Daily */}
      <button
        onClick={() => onModeSelect('daily')}
        style={{
          background: C.bg2,
          border: `1px solid ${C.border}`,
          borderLeft: `2px solid ${accentColor}`,
          borderRadius: 16,
          padding: '16px 16px 16px 18px',
          textAlign: 'left',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{
            fontFamily: 'monospace',
            fontSize: 11,
            color: accentColor,
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}>
            {t.daily.title}
          </span>
          <span style={{
            fontFamily: 'monospace',
            fontSize: 9,
            color: C.text3,
            letterSpacing: '0.05em',
            flexShrink: 0,
            marginLeft: 8,
            marginTop: 1,
          }}>
            D{dayNumber} · {t.daily.badge}
          </span>
        </div>

        {keyword?.keyword && (
          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: 28,
            fontWeight: 400,
            color: C.text,
            lineHeight: 1.2,
            margin: '8px 0',
            letterSpacing: '-0.02em',
          }}>
            {keyword.keyword}
          </p>
        )}

        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.6, marginBottom: 10 }}>
          {t.daily.desc}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{
            fontSize: 12,
            color: hasTodayEntry ? accentColor : C.text,
            background: hasTodayEntry ? alpha(accentColor, 0.12) : alpha(accentColor, 0.08),
            border: `1px solid ${alpha(accentColor, 0.3)}`,
            borderRadius: 20,
            padding: '5px 14px',
            fontWeight: 500,
          }}>
            {hasTodayEntry ? t.daily.done : t.daily.cta}
          </span>
          <span style={{
            fontFamily: 'monospace',
            fontSize: 10,
            color: C.text3,
            letterSpacing: '0.03em',
          }}>
            {t.weeklyLabel(weekCount, streak)}
          </span>
        </div>
      </button>

      {/* 카드 2 — Category */}
      <button
        onClick={() => onModeSelect('category')}
        style={{
          background: C.bg2,
          border: `1px solid ${C.border}`,
          borderLeft: `2px solid ${C.text3}`,
          borderRadius: 16,
          padding: '16px 16px 14px 18px',
          textAlign: 'left',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        <span style={{
          fontFamily: 'monospace',
          fontSize: 11,
          color: C.text3,
          fontWeight: 600,
          letterSpacing: '0.05em',
          display: 'block',
          marginBottom: 6,
        }}>
          {t.category.title}
        </span>

        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.6, marginBottom: 10 }}>
          {t.category.desc}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[...REL_CHIPS, ...PSYCH_CHIPS].map(chip => (
            <span key={chip.code} style={{
              fontFamily: 'monospace',
              fontSize: 9,
              color: C.text3,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '3px 8px',
              letterSpacing: '0.06em',
            }}>
              {chip.label}
            </span>
          ))}
        </div>
      </button>

      {/* 카드 3 — Relation */}
      <button
        onClick={() => partnerCount > 0 ? onModeSelect('relation') : navigate('/home/pair-trust')}
        style={{
          background: C.bg2,
          border: `1px solid ${C.border}`,
          borderLeft: `2px solid ${relationColor}`,
          borderRadius: 16,
          padding: '16px 16px 14px 18px',
          textAlign: 'left',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{
            fontFamily: 'monospace',
            fontSize: 11,
            color: relationColor,
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}>
            {t.relation.title}
          </span>
          {partnerCount > 0 && (
            <span style={{
              fontFamily: 'monospace',
              fontSize: 9,
              color: relationColor,
              background: alpha(relationColor, 0.1),
              border: `1px solid ${alpha(relationColor, 0.25)}`,
              borderRadius: 8,
              padding: '2px 8px',
              letterSpacing: '0.04em',
            }}>
              {t.relation.partnerCount(partnerCount)}
            </span>
          )}
        </div>

        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.6, marginBottom: 10 }}>
          {t.relation.desc}
        </p>

        {partnerCount > 0 ? (
          <div style={{ display: 'flex', gap: 8 }}>
            {(partners ?? []).slice(0, 2).map((p, i) => (
              <div key={p.id ?? i} style={{
                flex: 1,
                background: alpha(relationColor, 0.06),
                border: `1px solid ${alpha(relationColor, 0.2)}`,
                borderRadius: 10,
                padding: '8px 10px',
              }}>
                <p style={{ fontSize: 11, color: C.text2, fontFamily: 'monospace' }}>
                  Lv.{p.trust_level}
                </p>
                <p style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>
                  {p.grantor_id === user?.id ? '→ 부여' : '← 수신'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            border: `1px dashed ${alpha(relationColor, 0.3)}`,
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, color: C.text3 }}>{t.relation.noneDesc}</span>
            <span style={{ fontSize: 12, color: relationColor }}>{t.relation.goBtn}</span>
          </div>
        )}
      </button>
    </div>
  );
}
