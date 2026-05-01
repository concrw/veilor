import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunityTranslations } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

const S = {
  ko: {
    anonymousStory: '익명의 이야기',
  },
  en: {
    anonymousStory: 'Anonymous Story',
  },
} as const;
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import LearningMateCard from '@/components/community/LearningMateCard';
import DiscussionBoard from '@/components/community/DiscussionBoard';
import CohortCard from '@/components/community/CohortCard';
import PartnerCodetalk from '@/components/community/PartnerCodetalk';
import ExternalContentFeed from '@/components/community/ExternalContentFeed';


type View = 'groups' | 'posts' | 'post';

export default function CommunityPage() {
  const { user, primaryMask } = useAuth();
  const navigate = useNavigate();
  const comm = useCommunityTranslations();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const qc = useQueryClient();
  const [view, setView] = useState<View>('groups');
  const [selectedGroup, setSelectedGroup] = useState<Record<string, unknown> | null>(null);
  const [selectedPost, setSelectedPost] = useState<Record<string, unknown> | null>(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostAnon, setNewPostAnon] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentAnon, setCommentAnon] = useState(true);
  const [communityTab, setCommunityTab] = useState<'groups' | 'discuss' | 'connect' | 'content'>('groups');

  // 그룹 목록
  const { data: groups } = useQuery({
    queryKey: ['community-groups'],
    queryFn: async () => {
      const { data } = await veilorDb.from('community_groups')
        .select('*').eq('is_active', true).order('member_count', { ascending: false });
      return data ?? [];
    },
  });

  // 그룹별 게시글 — 실제 게시글 + 가상유저 게시글(tab_context 기반) 병합
  const { data: posts } = useQuery({
    queryKey: ['community-posts', selectedGroup?.id, selectedGroup?.category],
    queryFn: async () => {
      const cat = selectedGroup!.category as string | undefined;
      // tab_context 매핑: community_groups.category → community_posts.tab_context
      const TAB_MAP: Record<string, string> = {
        communication: 'vent', crisis: 'vent', culture: 'general',
        identity: 'get', relationship: 'dig', general: 'general',
      };
      const tabCtx = cat ? TAB_MAP[cat] ?? cat : undefined;

      const [groupRes, virtualRes] = await Promise.all([
        veilorDb.from('community_posts')
          .select('*')
          .eq('group_id', selectedGroup!.id as string)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(20),
        tabCtx
          ? veilorDb.from('community_posts')
              .select('id, content, is_anonymous, created_at, tab_context, upvotes, view_count')
              .eq('tab_context', tabCtx)
              .eq('is_deleted', false)
              .is('group_id', null)
              .order('created_at', { ascending: false })
              .limit(15)
          : Promise.resolve({ data: [] }),
      ]);

      const groupPosts = (groupRes.data ?? []).map(p => ({ ...p, is_virtual: false }));
      const virtualPosts = ((virtualRes as { data: unknown[] | null }).data ?? []).map((p: unknown) => ({
        ...(p as Record<string, unknown>),
        title: ((p as Record<string, unknown>).content as string | null)?.slice(0, 30) ?? s.anonymousStory,
        is_virtual: true,
        is_anonymous: true,
      }));
      const all = [...groupPosts, ...virtualPosts].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return all;
    },
    enabled: !!selectedGroup,
  });

  // 게시글 댓글
  const { data: comments } = useQuery({
    queryKey: ['community-comments', selectedPost?.id],
    queryFn: async () => {
      const { data } = await veilorDb.from('community_comments')
        .select('*')
        .eq('post_id', selectedPost!.id as string)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
      return data ?? [];
    },
    enabled: !!selectedPost,
  });

  // 게시글 작성
  const postMutation = useMutation({
    mutationFn: async () => {
      await veilorDb.from('community_posts').insert({
        user_id: user!.id,
        group_id: selectedGroup!.id as string,
        title: newPostTitle,
        content: newPostContent,
        is_anonymous: newPostAnon,
        tags: [],
        upvotes: 0,
        view_count: 0,
      });
    },
    onSuccess: () => {
      toast({ title: comm.postRegistered });
      setNewPostTitle(''); setNewPostContent(''); setShowNewPost(false);
      qc.invalidateQueries({ queryKey: ['community-posts', selectedGroup?.id] });
    },
  });

  // 댓글 작성
  const commentMutation = useMutation({
    mutationFn: async () => {
      await veilorDb.from('community_comments').insert({
        post_id: selectedPost!.id as string,
        user_id: user!.id,
        content: newComment,
        is_anonymous: commentAnon,
      });
    },
    onSuccess: () => {
      toast({ title: comm.commentRegistered });
      setNewComment('');
      qc.invalidateQueries({ queryKey: ['community-comments', selectedPost?.id] });
    },
  });

  const displayName = (isAnon: boolean) => isAnon ? comm.anonymous : (primaryMask ?? comm.anonymous);

  // 카테고리별 그룹 묶기
  const grouped = groups?.reduce<Record<string, Record<string, unknown>[]>>((acc, g) => {
    const cat = (g as Record<string, unknown>).category as string ?? 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(g as Record<string, unknown>);
    return acc;
  }, {}) ?? {};

  /* ── 댓글 상세 뷰 ── */
  if (view === 'post' && selectedPost) {
    return (
      <div className="px-4 py-6 space-y-5">
        <button onClick={() => { setView('posts'); setSelectedPost(null); }}
          className="text-xs text-muted-foreground">{comm.backToList}</button>

        <div className="bg-card border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
              {selectedPost.is_anonymous ? comm.anonymous : (primaryMask ?? comm.anonymous)}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(selectedPost.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h3 className="font-semibold">{selectedPost.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{selectedPost.content}</p>
        </div>

        {/* 댓글 목록 */}
        <div className="space-y-3">
          <p className="text-sm font-medium">{comm.commentCount.replace('{count}', String(comments?.length ?? 0))}</p>
          {comments?.map((c: Record<string, unknown>) => (
            <div key={c.id} className="bg-card border rounded-xl p-4 space-y-1.5">
              <span className="text-xs text-muted-foreground">{displayName(c.is_anonymous)}</span>
              <p className="text-sm leading-relaxed">{c.content}</p>
            </div>
          ))}
        </div>

        {/* 댓글 입력 */}
        <div className="bg-card border rounded-2xl p-4 space-y-3">
          <Textarea
            placeholder={comm.commentPlaceholder}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="h-20 resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Switch checked={commentAnon} onCheckedChange={setCommentAnon} />
              <span>{commentAnon ? comm.anonymous : comm.realName}</span>
            </div>
            <Button size="sm" onClick={() => commentMutation.mutate()}
              disabled={!newComment.trim() || commentMutation.isPending}>
              {comm.register}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 게시글 목록 뷰 ── */
  if (view === 'posts' && selectedGroup) {
    return (
      <div className="px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => { setView('groups'); setSelectedGroup(null); }}
              className="text-xs text-muted-foreground block mb-1">{comm.backToGroup}</button>
            <h2 className="text-lg font-semibold">{selectedGroup.name}</h2>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowNewPost(!showNewPost)}>
            {showNewPost ? comm.cancel : comm.writePost}
          </Button>
        </div>

        {showNewPost && (
          <div className="bg-card border rounded-2xl p-4 space-y-3">
            <input
              type="text" placeholder={comm.titlePlaceholder}
              value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)}
              className="w-full bg-transparent text-sm border-b pb-2 outline-none"
            />
            <Textarea
              placeholder={comm.postPlaceholder}
              value={newPostContent} onChange={e => setNewPostContent(e.target.value)}
              className="h-28 resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Switch checked={newPostAnon} onCheckedChange={setNewPostAnon} />
                <span>{newPostAnon ? comm.anonymous : comm.realName}</span>
              </div>
              <Button size="sm" onClick={() => postMutation.mutate()}
                disabled={!newPostTitle.trim() || !newPostContent.trim() || postMutation.isPending}>
                {comm.register}
              </Button>
            </div>
          </div>
        )}

        {(() => {
          const allPosts = posts ?? [];
          return allPosts.length > 0 ? (
            <div className="space-y-3">
              {allPosts.map((p: Record<string, unknown>) => (
              <button key={p.id}
                onClick={() => p.is_virtual ? null : (() => { setSelectedPost(p); setView('post'); })()}
                className={`w-full text-left bg-card border rounded-xl p-4 space-y-1.5 transition-colors ${!p.is_virtual ? 'hover:border-primary/50 cursor-pointer' : 'cursor-default'}`}>
                <div className="flex items-center gap-2">
                  {/* 비익명 작성자 닉네임: 터치 시 프로필 이동 */}
                  {!p.is_anonymous && p.user_id ? (
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/users/${p.user_id}`); }}
                      className="text-xs text-muted-foreground hover:underline cursor-pointer bg-transparent border-0 p-0"
                    >
                      {displayName(false)}
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">{displayName(p.is_anonymous)}</span>
                  )}
                  {p.mask && <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{p.mask}</span>}
                  <span className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm font-medium line-clamp-1">{p.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.content}</p>
                <p className="text-xs text-muted-foreground">↑ {p.upvotes ?? 0}</p>
              </button>
            ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">{comm.emptyPosts}</div>
          );
        })()}
      </div>
    );
  }

  /* ── 그룹 목록 뷰 ── */
  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{comm.header}</h2>
        <p className="text-sm text-muted-foreground mt-1">{comm.subtitle}</p>
      </div>

      {/* 커뮤니티 탭 네비 */}
      <div className="flex gap-1 bg-muted rounded-lg p-0.5">
        {([
          { key: 'groups' as const, label: comm.tabs.groups },
          { key: 'discuss' as const, label: comm.tabs.discuss },
          { key: 'connect' as const, label: comm.tabs.connect },
          { key: 'content' as const, label: comm.tabs.content },
        ]).map(t => (
          <button key={t.key} onClick={() => setCommunityTab(t.key)}
            className={`flex-1 text-xs py-2 rounded-md transition-colors ${
              communityTab === t.key ? 'bg-background text-foreground shadow-sm font-medium' : 'text-muted-foreground'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 토론 탭 (#47) */}
      {communityTab === 'discuss' && <DiscussionBoard />}

      {/* 연결 탭 (#43 러닝메이트, #51 코호트, #53 파트너 코드토크) */}
      {communityTab === 'connect' && (
        <div className="space-y-4">
          <LearningMateCard />
          <CohortCard />
          <PartnerCodetalk />
        </div>
      )}

      {/* 콘텐츠 탭 (#69 외부 콘텐츠) */}
      {communityTab === 'content' && <ExternalContentFeed />}

      {/* 그룹 탭 (기존) */}
      {communityTab === 'groups' && Object.entries(grouped).map(([cat, gs]) => (
        <div key={cat} className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            {comm.categoryLabels[cat] ?? cat}
          </p>
          <div className="space-y-2">
            {gs.map((g) => (
              <button key={g.id}
                onClick={() => { setSelectedGroup(g); setView('posts'); }}
                className="w-full text-left bg-card border rounded-xl p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{g.name}</p>
                  <span className="text-xs text-muted-foreground">{comm.memberCount.replace('{count}', String(g.member_count))}</span>
                </div>
                {g.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{g.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export { default as TabCommunityFeed } from '@/components/community/TabCommunityFeed';
