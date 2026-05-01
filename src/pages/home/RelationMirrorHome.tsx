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

const PATTERN_COLOR: Record<RelationPattern, string> = {
  ANXIOUS_ATTACH: '#F59E0B',
  AVOIDANT: '#6366F1',
  OVERCARE: '#EC4899',
  BALANCED: '#10B981',
};

export default function RelationMirrorHome() {
  const { language } = useLanguageContext();
  const t = useRelationTranslations();
  const m = t.mirror;
  const navigate = useNavigate();
  const { user } = useAuth();

  // 경계 설정 데이터
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

  // 경계 카테고리별 설정 수
  const boundaryByCategory: Record<string, boolean> = {};
  BOUNDARY_CATEGORY_KEYS.forEach(k => {
    boundaryByCategory[k] = savedBoundaries.some(b => b.category === k && b.text?.trim());
  });
  const boundaryCount = Object.values(boundaryByCategory).filter(Boolean).length;

  // Vent 키워드 (관계 패턴 추론용)
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

  // 소통 깊이 (CommunicationPatternCard와 동일한 로직)
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

  const pattern = inferRelationPattern(ventKeywords, boundaryCount, commDepth);
  const patternColor = PATTERN_COLOR[pattern];

  const today = new Date().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
    month: 'long', day: 'numeric', weekday: 'short',
  });

  return (
    <div style={{ minHeight: '100vh', background: C.bg, overflowY: 'auto', paddingBottom: 80 }}>
      {/* 헤더 */}
      <div style={{ padding: '20px 20px 0' }}>
        <span style={{ fontSize: 9, letterSpacing: '.15em', color: C.amberGold, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
          {m.section}
        </span>
        <p style={{ fontSize: 10, color: C.text4, marginBottom: 2 }}>{today}</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 22, color: C.text, lineHeight: 1.3 }}>
          {m.subtitle}
        </h1>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* CommunicationPatternCard */}
        <CommunicationPatternCard />

        {/* 경계 설정 요약 카드 */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 400, color: C.text }}>{m.boundaryTitle}</p>
            <button
              onClick={() => navigate('/set')}
              style={{ fontSize: 10, color: C.amberGold, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {m.boundaryDetail} ›
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
          <p style={{ fontSize: 11, color: C.text4 }}>{m.boundaryCount(boundaryCount)}</p>
        </div>

        {/* RelationshipCoaching */}
        <RelationshipCoaching />

        {/* PartnerPatternInference */}
        <PartnerPatternInference />

        {/* 반복 패턴 인사이트 */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
          <p style={{ fontSize: 12, fontWeight: 400, color: C.text, marginBottom: 10 }}>{m.patternTitle}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `${patternColor}22`, border: `2px solid ${patternColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: patternColor }} />
            </div>
            <div>
              <p style={{ fontSize: 13, color: C.text, fontWeight: 500, marginBottom: 2 }}>{m.patternLabels[pattern]}</p>
              <p style={{ fontSize: 10, color: C.text4 }}>{pattern}</p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.65, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
            {m.patternDescs[pattern]}
          </p>
        </div>

        {/* Amber 코멘트 */}
        <div style={{ background: `${C.amberGold}08`, border: `1px solid ${C.amberGold}22`, borderRadius: 14, padding: '14px 16px' }}>
          <p style={{ fontSize: 9, color: C.amberGold, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>AMBER</p>
          <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
            {m.amberPattern}
          </p>
        </div>
      </div>
    </div>
  );
}
