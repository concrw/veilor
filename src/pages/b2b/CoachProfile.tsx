// 개별 코치 프로필 페이지
// 경로: /b2b/coaches/:coachId
// 코치 전체 정보 + 포스트 피드 + 세션 예약 CTA

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCoachProfile, useCoachPosts } from '@/hooks/useB2BCoach';
import type { B2BCoachPost } from '@/integrations/supabase/veilor-types';
import { useLanguageContext } from '@/context/LanguageContext';

// ─────────────────────────────────────────────
// 이중언어 문자열
// ─────────────────────────────────────────────
const S = {
  ko: {
    back: '← 뒤로',
    notFound: '코치를 찾을 수 없습니다',
    sessionCount: (n: number) => `세션 ${n}회`,
    memberCount: (cur: number, max: number) => `담당 ${cur}/${max}명`,
    certifications: (certs: string) => `자격증: ${certs}`,
    pinBadge: '📌 고정 게시글',
    expand: '더 보기',
    collapse: '접기',
    postFeedLabel: (count: number | null) => count ? `코치 포스트 · ${count}개` : '코치 포스트',
    noPosts: '아직 작성된 포스트가 없습니다',
    bookSession: '세션 예약하기',
    fullSession: '현재 상담 마감',
  },
  en: {
    back: '← Back',
    notFound: 'Coach not found',
    sessionCount: (n: number) => `${n} sessions`,
    memberCount: (cur: number, max: number) => `${cur}/${max} assigned`,
    certifications: (certs: string) => `Certifications: ${certs}`,
    pinBadge: '📌 Pinned',
    expand: 'Show more',
    collapse: 'Show less',
    postFeedLabel: (count: number | null) => count ? `Coach Posts · ${count}` : 'Coach Posts',
    noPosts: 'No posts yet',
    bookSession: 'Book a Session',
    fullSession: 'Currently Full',
  },
} as const;

// ── 포스트 카드 ────────────────────────────────────────────────────────

function PostCard({ post, s, locale }: { post: B2BCoachPost; s: typeof S['ko']; locale: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = post.body.length > 200;

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#242220', border: '1px solid #2E2B28' }}
    >
      {post.is_pinned && (
        <span
          className="text-[11px] px-2 py-0.5 rounded-full mb-2 inline-block"
          style={{ background: '#D4A57420', color: '#D4A574' }}
        >
          {s.pinBadge}
        </span>
      )}
      {post.title && (
        <p className="text-[15px] font-medium mb-2" style={{ color: '#E7E5E4' }}>
          {post.title}
        </p>
      )}
      <p
        className="text-[13px] leading-relaxed whitespace-pre-line"
        style={{ color: '#A8A29E' }}
      >
        {isLong && !expanded ? `${post.body.slice(0, 200)}…` : post.body}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-[12px] mt-2"
          style={{ color: '#D4A574' }}
        >
          {expanded ? s.collapse : s.expand}
        </button>
      )}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.map((t) => (
            <span
              key={t}
              className="text-[11px] px-2 py-0.5 rounded-full"
              style={{ background: '#2A2624', color: '#78716C' }}
            >
              #{t}
            </span>
          ))}
        </div>
      )}
      <p className="text-[11px] mt-3" style={{ color: '#57534E' }}>
        {new Date(post.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'ko-KR')}
      </p>
    </div>
  );
}

// ── 메인 ──────────────────────────────────────────────────────────────

export default function CoachProfile() {
  const { coachId } = useParams<{ coachId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const { data: coach, isLoading: loadingCoach } = useCoachProfile(coachId ?? '');
  const { data: posts, isLoading: loadingPosts } = useCoachPosts(coachId ?? '');

  if (loadingCoach) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1C1917' }}>
        <div className="w-6 h-6 border-2 border-[#D4A574] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1C1917' }}>
        <p className="text-[14px]" style={{ color: '#78716C' }}>{s.notFound}</p>
      </div>
    );
  }

  const available = coach.current_members < coach.max_members;

  // 고정 포스트 먼저, 나머지는 최신순
  const sortedPosts = [...(posts ?? [])].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div
      className="min-h-screen"
      style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 px-5 pt-12 pb-3" style={{ background: '#1C1917' }}>
        <button
          onClick={() => navigate(-1)}
          className="text-[13px]"
          style={{ color: '#78716C' }}
        >
          {s.back}
        </button>
      </div>

      <div className="px-4 pb-32">
        {/* 코치 프로필 헤더 */}
        <div
          className="rounded-2xl p-6 mb-4"
          style={{ background: '#242220', border: '1px solid #2E2B28' }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-medium"
              style={{ background: '#D4A57420', color: '#D4A574' }}
            >
              {coach.display_name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[18px] font-medium" style={{ color: '#E7E5E4' }}>
                  {coach.display_name}
                </h1>
                {coach.avg_rating > 0 && (
                  <span className="text-[13px]" style={{ color: '#C4A355' }}>
                    ★ {coach.avg_rating.toFixed(1)}
                  </span>
                )}
              </div>
              <p className="text-[12px] mt-0.5" style={{ color: '#78716C' }}>
                {s.sessionCount(coach.session_count)} · {s.memberCount(coach.current_members, coach.max_members)}
              </p>
            </div>
          </div>

          {/* 도메인 */}
          {coach.domains.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {coach.domains.map((d) => (
                <span
                  key={d}
                  className="text-[11px] px-2 py-0.5 rounded-full"
                  style={{ background: '#D4A57415', color: '#D4A574' }}
                >
                  {d}
                </span>
              ))}
            </div>
          )}

          {/* 자격 / 전문분야 */}
          {coach.specialties && coach.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {coach.specialties.map((sp) => (
                <span
                  key={sp}
                  className="text-[11px] px-2 py-0.5 rounded-full"
                  style={{ background: '#2A2624', color: '#A8A29E' }}
                >
                  {sp}
                </span>
              ))}
            </div>
          )}

          {/* 자격증 */}
          {coach.certifications && coach.certifications.length > 0 && (
            <p className="text-[12px] mb-3" style={{ color: '#78716C' }}>
              {s.certifications(coach.certifications.join(', '))}
            </p>
          )}

          {/* 바이오 */}
          {coach.bio && (
            <p className="text-[14px] leading-relaxed" style={{ color: '#A8A29E' }}>
              {coach.bio}
            </p>
          )}

          {/* 언어 */}
          {coach.languages.length > 0 && (
            <p className="text-[12px] mt-3" style={{ color: '#57534E' }}>
              {coach.languages.join(' · ')}
            </p>
          )}
        </div>

        {/* 포스트 피드 */}
        <div className="mb-4">
          <p className="text-[13px] mb-3 px-1" style={{ color: '#57534E' }}>
            {s.postFeedLabel(sortedPosts.length > 0 ? sortedPosts.length : null)}
          </p>

          {loadingPosts && (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-[#D4A574] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loadingPosts && sortedPosts.length === 0 && (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: '#242220', border: '1px solid #2E2B28' }}
            >
              <p className="text-[13px]" style={{ color: '#57534E' }}>
                {s.noPosts}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {sortedPosts.map((post) => (
              <PostCard key={post.id} post={post} s={s} locale={language} />
            ))}
          </div>
        </div>
      </div>

      {/* 하단 CTA — 세션 예약 */}
      <div
        className="fixed bottom-0 inset-x-0 px-4 py-4"
        style={{ background: '#1C1917', borderTop: '1px solid #2A2624' }}
      >
        <button
          disabled={!available}
          className="w-full py-3 rounded-xl text-[15px] font-medium transition-opacity"
          style={{
            background: available ? '#D4A574' : '#2A2624',
            color: available ? '#1C1917' : '#57534E',
            opacity: available ? 1 : 0.6,
          }}
        >
          {available ? s.bookSession : s.fullSession}
        </button>
      </div>
      </div>
    </div>
  );
}
