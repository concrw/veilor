// 개별 코치 프로필 페이지
// 경로: /b2b/coaches/:coachId
// 코치 전체 정보 + 포스트 피드 + 세션 예약 CTA

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCoachProfile, useCoachPosts } from '@/hooks/useB2BCoach';
import type { B2BCoachPost } from '@/integrations/supabase/veilor-types';
import { useT } from '@/i18n/useT';
import { useLanguageContext } from '@/context/LanguageContext';
import type { LocaleResource } from '@/i18n/types';

// ── 포스트 카드 ────────────────────────────────────────────────────────

function PostCard({ post, s, locale }: { post: B2BCoachPost; s: LocaleResource['b2bDomain']['coachProfile']; locale: string }) {
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
          style={{ background: '#E0B48A20', color: '#E0B48A' }}
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
        style={{ color: '#B8B3AF' }}
      >
        {isLong && !expanded ? `${post.body.slice(0, 200)}…` : post.body}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-[12px] mt-2"
          style={{ color: '#E0B48A' }}
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
              style={{ background: '#2A2624', color: '#9C9590' }}
            >
              #{t}
            </span>
          ))}
        </div>
      )}
      <p className="text-[11px] mt-3" style={{ color: '#87817C' }}>
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
  const t = useT();
  const s = t.b2bDomain.coachProfile;

  const { data: coach, isLoading: loadingCoach } = useCoachProfile(coachId ?? '');
  const { data: posts, isLoading: loadingPosts } = useCoachPosts(coachId ?? '');

  if (loadingCoach) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1C1917' }}>
        <div className="w-6 h-6 border-2 border-[#E0B48A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1C1917' }}>
        <p className="text-[14px]" style={{ color: '#9C9590' }}>{s.notFound}</p>
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
          style={{ color: '#9C9590' }}
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
              style={{ background: '#E0B48A20', color: '#E0B48A' }}
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
              <p className="text-[12px] mt-0.5" style={{ color: '#9C9590' }}>
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
                  style={{ background: '#E0B48A15', color: '#E0B48A' }}
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
                  style={{ background: '#2A2624', color: '#B8B3AF' }}
                >
                  {sp}
                </span>
              ))}
            </div>
          )}

          {/* 자격증 */}
          {coach.certifications && coach.certifications.length > 0 && (
            <p className="text-[12px] mb-3" style={{ color: '#9C9590' }}>
              {s.certifications(coach.certifications.join(', '))}
            </p>
          )}

          {/* 바이오 */}
          {coach.bio && (
            <p className="text-[14px] leading-relaxed" style={{ color: '#B8B3AF' }}>
              {coach.bio}
            </p>
          )}

          {/* 언어 */}
          {coach.languages.length > 0 && (
            <p className="text-[12px] mt-3" style={{ color: '#87817C' }}>
              {coach.languages.join(' · ')}
            </p>
          )}
        </div>

        {/* 포스트 피드 */}
        <div className="mb-4">
          <p className="text-[13px] mb-3 px-1" style={{ color: '#87817C' }}>
            {s.postFeedLabel(sortedPosts.length > 0 ? sortedPosts.length : null)}
          </p>

          {loadingPosts && (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-[#E0B48A] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loadingPosts && sortedPosts.length === 0 && (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: '#242220', border: '1px solid #2E2B28' }}
            >
              <p className="text-[13px]" style={{ color: '#87817C' }}>
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
            background: available ? '#E0B48A' : '#2A2624',
            color: available ? '#1C1917' : '#87817C',
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
