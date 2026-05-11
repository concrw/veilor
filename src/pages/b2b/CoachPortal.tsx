// 코치 포털 — 로그인한 코치 전용 대시보드
// 경로: /b2b/coach/portal

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useMyCoachProfile,
  useMyCoachSessions,
  useMyCoachMembers,
  useCreateCoachPost,
  useUpdateCoachPost,
  useDeleteCoachPost,
  useCoachPosts,
} from '@/hooks/useB2BCoach';
import type { B2BCoachPost } from '@/integrations/supabase/veilor-types';
import { useT } from '@/i18n/useT';
import { useLanguageContext } from '@/context/LanguageContext';
import type { LocaleResource } from '@/i18n/types';
import { CoachMembersTab, CoachSessionsTab } from './CoachPortalTabs';

type PortalTab = 'members' | 'sessions' | 'posts';

// ── 포스트 에디터 모달 ─────────────────────────────────────────────────────

interface PostEditorProps {
  coachId: string;
  userId: string;
  post?: B2BCoachPost;
  onClose: () => void;
  s: LocaleResource['b2bDomain']['coachPortal'];
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
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    if (isEditing) {
      await updatePost.mutateAsync({ id: post.id, coach_id: coachId, title: title.trim() || undefined, body: body.trim(), tags: tagList, is_pinned: isPinned });
    } else {
      await createPost.mutateAsync({ coach_id: coachId, user_id: userId, title: title.trim() || undefined, body: body.trim(), tags: tagList });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full rounded-t-2xl p-5 pb-10 flex flex-col gap-4" style={{ background: '#242220', maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-medium" style={{ color: '#E7E5E4' }}>{s.postEditorTitle(isEditing)}</h2>
          <button onClick={onClose} className="text-[20px]" style={{ color: '#87817C' }}>×</button>
        </div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder={s.titlePlaceholder} className="w-full bg-transparent border-b py-2 text-[14px] outline-none" style={{ borderColor: '#3C3835', color: '#E7E5E4' }} />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder={s.bodyPlaceholder} rows={6} className="w-full bg-transparent text-[14px] outline-none resize-none" style={{ color: '#E7E5E4' }} />
        <input value={tags} onChange={e => setTags(e.target.value)} placeholder={s.tagsPlaceholder} className="w-full bg-transparent border-b py-2 text-[13px] outline-none" style={{ borderColor: '#3C3835', color: '#B8B3AF' }} />
        {isEditing && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isPinned} onChange={e => setIsPinned(e.target.checked)} className="accent-amber-400" />
            <span className="text-[13px]" style={{ color: '#B8B3AF' }}>{s.pinLabel}</span>
          </label>
        )}
        <button onClick={handleSubmit} disabled={!body.trim() || isPending} className="w-full py-3 rounded-xl text-[14px] font-medium" style={{ background: body.trim() && !isPending ? '#E0B48A' : '#2A2624', color: body.trim() && !isPending ? '#1C1917' : '#87817C' }}>
          {isPending ? s.saving : s.savePost(isEditing)}
        </button>
      </div>
    </div>
  );
}

// ── 포스트 관리 목록 ───────────────────────────────────────────────────────

function PostManageList({ coachId, userId, s }: { coachId: string; userId: string; s: LocaleResource['b2bDomain']['coachPortal'] }) {
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
      <button onClick={() => setShowCreate(true)} className="w-full py-3 rounded-xl text-[14px] font-medium mb-4" style={{ background: '#E0B48A', color: '#1C1917' }}>
        {s.newPost}
      </button>
      {sorted.length === 0 && <p className="text-center py-8 text-[13px]" style={{ color: '#87817C' }}>{s.noPost}</p>}
      <div className="flex flex-col gap-3">
        {sorted.map(post => (
          <div key={post.id} className="rounded-xl p-4" style={{ background: '#2A2624', border: '1px solid #3C3835' }}>
            {post.is_pinned && <span className="text-[11px] mr-1" style={{ color: '#E0B48A' }}>📌</span>}
            {post.title && <p className="text-[14px] font-medium mb-1" style={{ color: '#E7E5E4' }}>{post.title}</p>}
            <p className="text-[12px] line-clamp-2 mb-3" style={{ color: '#B8B3AF' }}>{post.body}</p>
            <div className="flex gap-2">
              <button onClick={() => setEditTarget(post)} className="flex-1 py-1.5 rounded-lg text-[12px]" style={{ background: '#3C3835', color: '#B8B3AF' }}>{s.editPost}</button>
              <button onClick={() => { if (confirm(s.deleteConfirm)) deletePost.mutate({ id: post.id, coach_id: coachId }); }} className="flex-1 py-1.5 rounded-lg text-[12px]" style={{ background: '#3C383520', color: '#EF4444' }}>{s.deletePost}</button>
            </div>
          </div>
        ))}
      </div>
      {showCreate && <PostEditor coachId={coachId} userId={userId} s={s} onClose={() => setShowCreate(false)} />}
      {editTarget && <PostEditor coachId={coachId} userId={userId} post={editTarget} s={s} onClose={() => setEditTarget(null)} />}
    </div>
  );
}

// ── 메인 ──────────────────────────────────────────────────────────────────

export default function CoachPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PortalTab>('members');
  const { language } = useLanguageContext();
  const t = useT();
  const s = t.b2bDomain.coachPortal;

  const { data: myProfile, isLoading: loadingProfile } = useMyCoachProfile();
  const coachId = myProfile?.id ?? '';
  const userId = myProfile?.user_id ?? '';

  const { data: members, isLoading: loadingMembers } = useMyCoachMembers(coachId);
  const { data: sessions, isLoading: loadingSessions } = useMyCoachSessions(coachId);

  const tabList: { id: PortalTab; label: string }[] = [
    { id: 'members',  label: s.tabs.members },
    { id: 'sessions', label: s.tabs.sessions },
    { id: 'posts',    label: s.tabs.posts },
  ];

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1C1917' }}>
        <div className="w-6 h-6 border-2 border-[#E0B48A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!myProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ background: '#1C1917' }}>
        <div className="text-center">
          <p className="text-[14px] mb-4" style={{ color: '#9C9590' }}>{s.notCoach}</p>
          <button onClick={() => navigate(-1)} className="text-[13px]" style={{ color: '#E0B48A' }}>{s.goBack}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="sticky top-0 z-10 px-5 pt-12 pb-3" style={{ background: '#1C1917', borderBottom: '1px solid #2A2624' }}>
          <button onClick={() => navigate(-1)} className="mb-3 text-[13px]" style={{ color: '#9C9590' }}>{s.back}</button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0" style={{ background: '#E0B48A20', color: '#E0B48A' }}>
              {myProfile.display_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-[16px] font-medium" style={{ color: '#E7E5E4' }}>{myProfile.display_name}</h1>
              <p className="text-[12px]" style={{ color: '#9C9590' }}>
                {s.responsibleCount(myProfile.current_members, myProfile.max_members)} · ★ {myProfile.avg_rating.toFixed(1)}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {tabList.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 py-1.5 rounded-lg text-[12px] transition-colors"
                style={{ background: activeTab === tab.id ? '#E0B48A' : '#2A2624', color: activeTab === tab.id ? '#1C1917' : '#9C9590' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="px-4 py-4 pb-10">
          {activeTab === 'members' && (
            <CoachMembersTab members={members} loadingMembers={loadingMembers} locale={language} s={s} />
          )}
          {activeTab === 'sessions' && (
            <CoachSessionsTab sessions={sessions} loadingSessions={loadingSessions} coachId={coachId} locale={language} s={s} />
          )}
          {activeTab === 'posts' && coachId && (
            <PostManageList coachId={coachId} userId={userId} s={s} />
          )}
        </div>
      </div>
    </div>
  );
}
