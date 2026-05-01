// 코치 포털 — 로그인한 코치 전용 대시보드
// 경로: /b2b/coach/portal
// 담당 멤버 목록, 세션 관리, 포스트 작성/수정/삭제

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useMyCoachProfile,
  useMyCoachSessions,
  useMyCoachMembers,
  useUpdateSessionStatus,
  useCreateCoachPost,
  useUpdateCoachPost,
  useDeleteCoachPost,
  useCoachPosts,
} from '@/hooks/useB2BCoach';
import type { B2BCoachPost, B2BCoachingSession } from '@/integrations/supabase/veilor-types';
import { useLanguageContext } from '@/context/LanguageContext';

// ─────────────────────────────────────────────
// 이중언어 문자열
// ─────────────────────────────────────────────
const S = {
  ko: {
    back: '← 뒤로',
    notCoach: '코치 계정이 아닙니다',
    goBack: '돌아가기',
    responsibleCount: (cur: number, max: number) => `담당 ${cur}/${max}명`,
    tabs: { members: '담당 멤버', sessions: '세션 관리', posts: '내 포스트' },
    noMembers: '담당 멤버가 없습니다',
    noSessions: '세션이 없습니다',
    memberId: (id: string) => `${id}…`,
    sessionCount: (n: number) => `세션 ${n}회`,
    latestCheckin: (date: string) => ` · 최근 체크인 ${date}`,
    cIndex: (v: string) => ` · C지수 ${v}`,
    statusLabels: { scheduled: '예정', completed: '완료', cancelled: '취소', no_show: '노쇼' } as Record<string, string>,
    memberId2: (id: string) => `멤버 ID: ${id}…`,
    markDone: '완료 처리',
    cancelSession: '취소',
    coachNotes: '코치 메모 (선택)',
    confirm: '확인',
    newPost: '+ 새 포스트 작성',
    noPost: '작성된 포스트가 없습니다',
    editPost: '수정',
    deletePost: '삭제',
    deleteConfirm: '포스트를 삭제할까요?',
    postEditorTitle: (isEditing: boolean) => isEditing ? '포스트 수정' : '새 포스트 작성',
    titlePlaceholder: '제목 (선택)',
    bodyPlaceholder: '내용을 입력하세요',
    tagsPlaceholder: '태그 (쉼표로 구분)',
    pinLabel: '상단 고정',
    saving: '저장 중...',
    savePost: (isEditing: boolean) => isEditing ? '수정 완료' : '게시하기',
  },
  en: {
    back: '← Back',
    notCoach: 'This is not a coach account.',
    goBack: 'Go Back',
    responsibleCount: (cur: number, max: number) => `Assigned ${cur}/${max}`,
    tabs: { members: 'My Members', sessions: 'Sessions', posts: 'My Posts' },
    noMembers: 'No assigned members',
    noSessions: 'No sessions',
    memberId: (id: string) => `${id}…`,
    sessionCount: (n: number) => `${n} sessions`,
    latestCheckin: (date: string) => ` · Last check-in ${date}`,
    cIndex: (v: string) => ` · C-index ${v}`,
    statusLabels: { scheduled: 'Scheduled', completed: 'Completed', cancelled: 'Cancelled', no_show: 'No-show' } as Record<string, string>,
    memberId2: (id: string) => `Member ID: ${id}…`,
    markDone: 'Mark as Done',
    cancelSession: 'Cancel',
    coachNotes: 'Coach notes (optional)',
    confirm: 'Confirm',
    newPost: '+ New Post',
    noPost: 'No posts yet',
    editPost: 'Edit',
    deletePost: 'Delete',
    deleteConfirm: 'Delete this post?',
    postEditorTitle: (isEditing: boolean) => isEditing ? 'Edit Post' : 'New Post',
    titlePlaceholder: 'Title (optional)',
    bodyPlaceholder: 'Write your content here',
    tagsPlaceholder: 'Tags (comma-separated)',
    pinLabel: 'Pin to top',
    saving: 'Saving...',
    savePost: (isEditing: boolean) => isEditing ? 'Save Changes' : 'Publish',
  },
} as const;

// ── 탭 타입 ──────────────────────────────────────────────────────────
type PortalTab = 'members' | 'sessions' | 'posts';

// ── 포스트 에디터 모달 ─────────────────────────────────────────────────

interface PostEditorProps {
  coachId: string;
  userId: string;
  post?: B2BCoachPost;
  onClose: () => void;
  s: typeof S['ko'];
}

function PostEditor({ coachId, userId, post, onClose, s }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title ?? '');
  const [body, setBody] = useState(post?.body ?? '');
  const [tags, setTags] = useState((post?.tags ?? []).join(', '));
  const [isPinned, setIsPinned] = useState(post?.is_pinned ?? false);

  const createPost = useCreateCoachPost();
  const updatePost = useUpdateCoachPost();

  const isEditing = !!post;
  const isPending = createPost.isPending || updatePost.isPending;

  const handleSubmit = async () => {
    if (!body.trim()) return;
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (isEditing) {
      await updatePost.mutateAsync({
        id: post.id,
        coach_id: coachId,
        title: title.trim() || undefined,
        body: body.trim(),
        tags: tagList,
        is_pinned: isPinned,
      });
    } else {
      await createPost.mutateAsync({
        coach_id: coachId,
        user_id: userId,
        title: title.trim() || undefined,
        body: body.trim(),
        tags: tagList,
      });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full rounded-t-2xl p-5 pb-10 flex flex-col gap-4"
        style={{ background: '#242220', maxHeight: '85vh', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-medium" style={{ color: '#E7E5E4' }}>
            {s.postEditorTitle(isEditing)}
          </h2>
          <button onClick={onClose} className="text-[20px]" style={{ color: '#57534E' }}>×</button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={s.titlePlaceholder}
          className="w-full bg-transparent border-b py-2 text-[14px] outline-none"
          style={{ borderColor: '#3C3835', color: '#E7E5E4' }}
        />

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={s.bodyPlaceholder}
          rows={6}
          className="w-full bg-transparent text-[14px] outline-none resize-none"
          style={{ color: '#E7E5E4' }}
        />

        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder={s.tagsPlaceholder}
          className="w-full bg-transparent border-b py-2 text-[13px] outline-none"
          style={{ borderColor: '#3C3835', color: '#A8A29E' }}
        />

        {isEditing && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="accent-amber-400"
            />
            <span className="text-[13px]" style={{ color: '#A8A29E' }}>{s.pinLabel}</span>
          </label>
        )}

        <button
          onClick={handleSubmit}
          disabled={!body.trim() || isPending}
          className="w-full py-3 rounded-xl text-[14px] font-medium"
          style={{
            background: body.trim() && !isPending ? '#D4A574' : '#2A2624',
            color: body.trim() && !isPending ? '#1C1917' : '#57534E',
          }}
        >
          {isPending ? s.saving : s.savePost(isEditing)}
        </button>
      </div>
    </div>
  );
}

// ── 세션 행 ───────────────────────────────────────────────────────────

function SessionRow({ session, coachId, s, locale }: { session: B2BCoachingSession; coachId: string; s: typeof S['ko']; locale: string }) {
  const update = useUpdateSessionStatus();
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const statusColor: Record<string, string> = {
    scheduled: '#D4A574',
    completed: '#4ADE80',
    cancelled: '#78716C',
    no_show: '#EF4444',
  };

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: '#2A2624', border: '1px solid #3C3835' }}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-[13px]" style={{ color: '#E7E5E4' }}>
          {new Date(session.scheduled_at).toLocaleString(locale === 'en' ? 'en-US' : 'ko-KR', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>
        <span className="text-[11px]" style={{ color: statusColor[session.status] }}>
          {s.statusLabels[session.status]}
        </span>
      </div>
      <p className="text-[12px]" style={{ color: '#78716C' }}>
        {s.memberId2(session.member_id.slice(0, 8))}
      </p>
      {session.status === 'scheduled' && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setShowNotes(true)}
            className="flex-1 py-1.5 rounded-lg text-[12px]"
            style={{ background: '#D4A57420', color: '#D4A574' }}
          >
            {s.markDone}
          </button>
          <button
            onClick={() => update.mutate({ sessionId: session.id, coachId, status: 'cancelled' })}
            className="flex-1 py-1.5 rounded-lg text-[12px]"
            style={{ background: '#3C3835', color: '#78716C' }}
          >
            {s.cancelSession}
          </button>
        </div>
      )}
      {showNotes && (
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={s.coachNotes}
            rows={3}
            className="w-full text-[12px] rounded-lg p-2 outline-none resize-none"
            style={{ background: '#1C1917', color: '#A8A29E', border: '1px solid #3C3835' }}
          />
          <button
            onClick={() => {
              update.mutate({
                sessionId: session.id,
                coachId,
                status: 'completed',
                coach_notes: notes.trim() || undefined,
              });
              setShowNotes(false);
            }}
            className="py-1.5 rounded-lg text-[12px]"
            style={{ background: '#D4A574', color: '#1C1917' }}
          >
            {s.confirm}
          </button>
        </div>
      )}
    </div>
  );
}

// ── 포스트 관리 목록 ───────────────────────────────────────────────────

function PostManageList({ coachId, userId, s }: { coachId: string; userId: string; s: typeof S['ko'] }) {
  const { data: posts } = useCoachPosts(coachId);
  const deletePost = useDeleteCoachPost();
  const [editTarget, setEditTarget] = useState<B2BCoachPost | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const sorted = [...(posts ?? [])].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div>
      <button
        onClick={() => setShowCreate(true)}
        className="w-full py-3 rounded-xl text-[14px] font-medium mb-4"
        style={{ background: '#D4A574', color: '#1C1917' }}
      >
        {s.newPost}
      </button>

      {sorted.length === 0 && (
        <p className="text-center py-8 text-[13px]" style={{ color: '#57534E' }}>
          {s.noPost}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {sorted.map((post) => (
          <div
            key={post.id}
            className="rounded-xl p-4"
            style={{ background: '#2A2624', border: '1px solid #3C3835' }}
          >
            {post.is_pinned && (
              <span className="text-[11px] mr-1" style={{ color: '#D4A574' }}>📌</span>
            )}
            {post.title && (
              <p className="text-[14px] font-medium mb-1" style={{ color: '#E7E5E4' }}>
                {post.title}
              </p>
            )}
            <p className="text-[12px] line-clamp-2 mb-3" style={{ color: '#A8A29E' }}>
              {post.body}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setEditTarget(post)}
                className="flex-1 py-1.5 rounded-lg text-[12px]"
                style={{ background: '#3C3835', color: '#A8A29E' }}
              >
                {s.editPost}
              </button>
              <button
                onClick={() => {
                  if (confirm(s.deleteConfirm)) {
                    deletePost.mutate({ id: post.id, coach_id: coachId });
                  }
                }}
                className="flex-1 py-1.5 rounded-lg text-[12px]"
                style={{ background: '#3C383520', color: '#EF4444' }}
              >
                {s.deletePost}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <PostEditor
          coachId={coachId}
          userId={userId}
          s={s}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editTarget && (
        <PostEditor
          coachId={coachId}
          userId={userId}
          post={editTarget}
          s={s}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}

// ── 메인 ──────────────────────────────────────────────────────────────

export default function CoachPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PortalTab>('members');
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const locale = language === 'en' ? 'en-US' : 'ko-KR';

  const { data: myProfile, isLoading: loadingProfile } = useMyCoachProfile();
  const coachId = myProfile?.id ?? '';
  const userId = myProfile?.user_id ?? '';

  const { data: members, isLoading: loadingMembers } = useMyCoachMembers(coachId);
  const { data: sessions, isLoading: loadingSessions } = useMyCoachSessions(coachId);

  const tabList: { id: PortalTab; label: string }[] = [
    { id: 'members', label: s.tabs.members },
    { id: 'sessions', label: s.tabs.sessions },
    { id: 'posts', label: s.tabs.posts },
  ];

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1C1917' }}>
        <div className="w-6 h-6 border-2 border-[#D4A574] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!myProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ background: '#1C1917' }}>
        <div className="text-center">
          <p className="text-[14px] mb-4" style={{ color: '#78716C' }}>
            {s.notCoach}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-[13px]"
            style={{ color: '#D4A574' }}
          >
            {s.goBack}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-5xl mx-auto">
      {/* 헤더 */}
      <div
        className="sticky top-0 z-10 px-5 pt-12 pb-3"
        style={{ background: '#1C1917', borderBottom: '1px solid #2A2624' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="mb-3 text-[13px]"
          style={{ color: '#78716C' }}
        >
          {s.back}
        </button>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
            style={{ background: '#D4A57420', color: '#D4A574' }}
          >
            {myProfile.display_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-[16px] font-medium" style={{ color: '#E7E5E4' }}>
              {myProfile.display_name}
            </h1>
            <p className="text-[12px]" style={{ color: '#78716C' }}>
              {s.responsibleCount(myProfile.current_members, myProfile.max_members)} ·{' '}
              ★ {myProfile.avg_rating.toFixed(1)}
            </p>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-1">
          {tabList.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex-1 py-1.5 rounded-lg text-[12px] transition-colors"
              style={{
                background: activeTab === t.id ? '#D4A574' : '#2A2624',
                color: activeTab === t.id ? '#1C1917' : '#78716C',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="px-4 py-4 pb-10">
        {/* 담당 멤버 */}
        {activeTab === 'members' && (
          <div>
            {loadingMembers && (
              <div className="flex justify-center py-10">
                <div className="w-5 h-5 border-2 border-[#D4A574] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loadingMembers && (members ?? []).length === 0 && (
              <p className="text-center py-10 text-[13px]" style={{ color: '#57534E' }}>
                {s.noMembers}
              </p>
            )}
            <div className="flex flex-col gap-3">
              {(members ?? []).map((m) => (
                <div
                  key={`${m.member_id}-${m.org_id}`}
                  className="rounded-xl p-4"
                  style={{ background: '#242220', border: '1px solid #2E2B28' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[13px]" style={{ color: '#E7E5E4' }}>
                      {m.member_id.slice(0, 8)}… · {m.org_name ?? m.org_id.slice(0, 8)}
                    </p>
                    {m.latest_risk_level && (
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{
                          background:
                            m.latest_risk_level === 'high' ? '#EF444420' :
                            m.latest_risk_level === 'medium' ? '#F9731620' :
                            '#4ADE8020',
                          color:
                            m.latest_risk_level === 'high' ? '#EF4444' :
                            m.latest_risk_level === 'medium' ? '#F97316' :
                            '#4ADE80',
                        }}
                      >
                        {m.latest_risk_level}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px]" style={{ color: '#78716C' }}>
                    {s.sessionCount(m.sessions_count)}
                    {m.latest_checkin_at ? s.latestCheckin(new Date(m.latest_checkin_at).toLocaleDateString(locale)) : ''}
                    {m.latest_c_avg != null ? s.cIndex(m.latest_c_avg.toFixed(1)) : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 세션 관리 */}
        {activeTab === 'sessions' && (
          <div>
            {loadingSessions && (
              <div className="flex justify-center py-10">
                <div className="w-5 h-5 border-2 border-[#D4A574] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loadingSessions && (sessions ?? []).length === 0 && (
              <p className="text-center py-10 text-[13px]" style={{ color: '#57534E' }}>
                {s.noSessions}
              </p>
            )}
            <div className="flex flex-col gap-3">
              {(sessions ?? []).map((sess) => (
                <SessionRow key={sess.id} session={sess} coachId={coachId} s={s} locale={language} />
              ))}
            </div>
          </div>
        )}

        {/* 포스트 관리 */}
        {activeTab === 'posts' && coachId && (
          <PostManageList coachId={coachId} userId={userId} s={s} />
        )}
      </div>
      </div>
    </div>
  );
}
