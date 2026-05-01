// 코치 소개 목록 페이지
// 경로: /b2b/coaches
// 전체 활성 코치를 카드 형태로 나열, 개별 프로필로 이동

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoachList } from '@/hooks/useB2BCoach';
import type { B2BCoach } from '@/integrations/supabase/veilor-types';
import { useLanguageContext } from '@/context/LanguageContext';

// ─────────────────────────────────────────────
// 이중언어 문자열
// ─────────────────────────────────────────────
const S = {
  ko: {
    back: '← 뒤로',
    title: '코치 소개',
    subtitle: '전문 코치와 함께 성장하세요',
    allFilter: '전체',
    sessionCount: (n: number) => `세션 ${n}회`,
    available: '상담 가능',
    full: '마감',
    loadError: '코치 목록을 불러오지 못했습니다',
    noCoaches: '등록된 코치가 없습니다',
    noDomainCoaches: (domain: string) => `'${domain}' 도메인 코치가 없습니다`,
  },
  en: {
    back: '← Back',
    title: 'Meet Our Coaches',
    subtitle: 'Grow with expert coaches',
    allFilter: 'All',
    sessionCount: (n: number) => `${n} sessions`,
    available: 'Available',
    full: 'Full',
    loadError: 'Failed to load coach list',
    noCoaches: 'No coaches registered',
    noDomainCoaches: (domain: string) => `No coaches in '${domain}' domain`,
  },
} as const;

// ── 코치 카드 ──────────────────────────────────────────────────────────

function CoachCard({ coach, onClick, s }: { coach: B2BCoach; onClick: () => void; s: typeof S['ko'] }) {
  const available = coach.current_members < coach.max_members;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-5 transition-colors"
      style={{
        background: '#242220',
        border: '1px solid #2E2B28',
      }}
    >
      {/* 이름 + 가용 여부 */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* 아바타 */}
          <div
            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium"
            style={{ background: '#D4A57420', color: '#D4A574' }}
          >
            {coach.display_name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-medium truncate" style={{ color: '#E7E5E4' }}>
              {coach.display_name}
            </p>
            <p className="text-[12px]" style={{ color: '#78716C' }}>
              {s.sessionCount(coach.session_count)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {/* 별점 */}
          {coach.avg_rating > 0 && (
            <span className="text-[13px]" style={{ color: '#C4A355' }}>
              ★ {coach.avg_rating.toFixed(1)}
            </span>
          )}
          {/* 가용 뱃지 */}
          <span
            className="text-[11px] px-2 py-0.5 rounded-full"
            style={{
              background: available ? '#16A34A15' : '#57534E20',
              color: available ? '#4ADE80' : '#78716C',
            }}
          >
            {available ? s.available : s.full}
          </span>
        </div>
      </div>

      {/* 도메인 태그 */}
      {coach.domains.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {coach.domains.slice(0, 4).map((d) => (
            <span
              key={d}
              className="text-[11px] px-2 py-0.5 rounded-full"
              style={{ background: '#D4A57415', color: '#D4A574' }}
            >
              {d}
            </span>
          ))}
          {coach.domains.length > 4 && (
            <span className="text-[11px]" style={{ color: '#57534E' }}>
              +{coach.domains.length - 4}
            </span>
          )}
        </div>
      )}

      {/* 자기소개 미리보기 */}
      {coach.bio && (
        <p
          className="text-[13px] leading-relaxed line-clamp-2"
          style={{ color: '#A8A29E' }}
        >
          {coach.bio}
        </p>
      )}

      {/* 언어 */}
      {coach.languages.length > 0 && (
        <p className="text-[11px] mt-2" style={{ color: '#57534E' }}>
          {coach.languages.join(' · ')}
        </p>
      )}
    </button>
  );
}

// ── 메인 ──────────────────────────────────────────────────────────────

export default function CoachList() {
  const navigate = useNavigate();
  const { data: coaches, isLoading, error } = useCoachList();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [domainFilter, setDomainFilter] = useState<string>(s.allFilter);

  // 전체 도메인 집합 추출
  const allDomains = [s.allFilter, ...Array.from(
    new Set((coaches ?? []).flatMap((c) => c.domains))
  )];

  const filtered = domainFilter === s.allFilter
    ? (coaches ?? [])
    : (coaches ?? []).filter((c) => c.domains.includes(domainFilter));

  return (
    <div
      className="min-h-screen"
      style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div
        className="sticky top-0 z-10 px-5 pt-12 pb-4"
        style={{ background: '#1C1917', borderBottom: '1px solid #2A2624' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-[13px]"
          style={{ color: '#78716C' }}
        >
          {s.back}
        </button>
        <h1 className="text-[20px] font-medium mb-1" style={{ color: '#E7E5E4' }}>
          {s.title}
        </h1>
        <p className="text-[13px]" style={{ color: '#78716C' }}>
          {s.subtitle}
        </p>

        {/* 도메인 필터 */}
        {allDomains.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            {allDomains.map((d) => (
              <button
                key={d}
                onClick={() => setDomainFilter(d)}
                className="flex-shrink-0 text-[12px] px-3 py-1 rounded-full transition-colors"
                style={{
                  background: domainFilter === d ? '#D4A574' : '#2A2624',
                  color: domainFilter === d ? '#1C1917' : '#78716C',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="px-4 py-4 pb-10">
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#D4A574] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-[14px]" style={{ color: '#78716C' }}>
              {s.loadError}
            </p>
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[14px]" style={{ color: '#78716C' }}>
              {domainFilter === s.allFilter ? s.noCoaches : s.noDomainCoaches(domainFilter)}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {filtered.map((coach) => (
            <CoachCard
              key={coach.id}
              coach={coach}
              s={s}
              onClick={() => navigate(`/b2b/coaches/${coach.id}`)}
            />
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
