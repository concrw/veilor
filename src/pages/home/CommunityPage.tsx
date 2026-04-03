import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, veilrumDb } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { getVirtualPostsForCategory } from '@/lib/virtualUsers';

const CATEGORY_LABEL: Record<string, string> = {
  communication: '소통', crisis: '위기·회복', culture: '문화',
  identity: '정체성', relationship: '관계', general: '일반',
};

type View = 'groups' | 'posts' | 'post';

export default function CommunityPage() {
  const { user, primaryMask } = useAuth();
  const qc = useQueryClient();
  const [view, setView] = useState<View>('groups');
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostAnon, setNewPostAnon] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentAnon, setCommentAnon] = useState(true);

  // 그룹 목록
  const { data: groups } = useQuery({
    queryKey: ['community-groups'],
    queryFn: async () => {
      const { data } = await veilrumDb.from('community_groups')
        .select('*').eq('is_active', true).order('member_count', { ascending: false });
      return data ?? [];
    },
  });

  // 그룹별 게시글
  const { data: posts } = useQuery({
    queryKey: ['community-posts', selectedGroup?.id],
    queryFn: async () => {
      const { data } = await veilrumDb.from('community_posts')
        .select('*')
        .eq('group_id', selectedGroup.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(30);
      return data ?? [];
    },
    enabled: !!selectedGroup,
  });

  // 게시글 댓글
  const { data: comments } = useQuery({
    queryKey: ['community-comments', selectedPost?.id],
    queryFn: async () => {
      const { data } = await veilrumDb.from('community_comments')
        .select('*')
        .eq('post_id', selectedPost.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
      return data ?? [];
    },
    enabled: !!selectedPost,
  });

  // 게시글 작성
  const postMutation = useMutation({
    mutationFn: async () => {
      await veilrumDb.from('community_posts').insert({
        user_id: user!.id,
        group_id: selectedGroup.id,
        title: newPostTitle,
        content: newPostContent,
        is_anonymous: newPostAnon,
        tags: [],
        upvotes: 0,
        view_count: 0,
      });
    },
    onSuccess: () => {
      toast({ title: '게시글이 등록되었습니다' });
      setNewPostTitle(''); setNewPostContent(''); setShowNewPost(false);
      qc.invalidateQueries({ queryKey: ['community-posts', selectedGroup?.id] });
    },
  });

  // 댓글 작성
  const commentMutation = useMutation({
    mutationFn: async () => {
      await veilrumDb.from('community_comments').insert({
        post_id: selectedPost.id,
        user_id: user!.id,
        content: newComment,
        is_anonymous: commentAnon,
      });
    },
    onSuccess: () => {
      toast({ title: '댓글이 등록되었습니다' });
      setNewComment('');
      qc.invalidateQueries({ queryKey: ['community-comments', selectedPost?.id] });
    },
  });

  const displayName = (isAnon: boolean) => isAnon ? '익명' : (primaryMask ?? '나');

  // 카테고리별 그룹 묶기
  const grouped = groups?.reduce((acc: any, g: any) => {
    const cat = g.category ?? 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(g);
    return acc;
  }, {}) ?? {};

  /* ── 댓글 상세 뷰 ── */
  if (view === 'post' && selectedPost) {
    return (
      <div className="px-4 py-6 max-w-sm mx-auto space-y-5">
        <button onClick={() => { setView('posts'); setSelectedPost(null); }}
          className="text-xs text-muted-foreground">← 목록으로</button>

        <div className="bg-card border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
              {selectedPost.is_anonymous ? '익명' : (primaryMask ?? '나')}
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
          <p className="text-sm font-medium">댓글 {comments?.length ?? 0}개</p>
          {comments?.map((c: any) => (
            <div key={c.id} className="bg-card border rounded-xl p-4 space-y-1.5">
              <span className="text-xs text-muted-foreground">{displayName(c.is_anonymous)}</span>
              <p className="text-sm leading-relaxed">{c.content}</p>
            </div>
          ))}
        </div>

        {/* 댓글 입력 */}
        <div className="bg-card border rounded-2xl p-4 space-y-3">
          <Textarea
            placeholder="댓글을 입력해 주세요"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="h-20 resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Switch checked={commentAnon} onCheckedChange={setCommentAnon} />
              <span>{commentAnon ? '익명' : '실명'}</span>
            </div>
            <Button size="sm" onClick={() => commentMutation.mutate()}
              disabled={!newComment.trim() || commentMutation.isPending}>
              등록
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 게시글 목록 뷰 ── */
  if (view === 'posts' && selectedGroup) {
    return (
      <div className="px-4 py-6 max-w-sm mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => { setView('groups'); setSelectedGroup(null); }}
              className="text-xs text-muted-foreground block mb-1">← 그룹으로</button>
            <h2 className="text-lg font-semibold">{selectedGroup.name}</h2>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowNewPost(!showNewPost)}>
            {showNewPost ? '취소' : '글 쓰기'}
          </Button>
        </div>

        {showNewPost && (
          <div className="bg-card border rounded-2xl p-4 space-y-3">
            <input
              type="text" placeholder="제목"
              value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)}
              className="w-full bg-transparent text-sm border-b pb-2 outline-none"
            />
            <Textarea
              placeholder="내용을 입력해 주세요"
              value={newPostContent} onChange={e => setNewPostContent(e.target.value)}
              className="h-28 resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Switch checked={newPostAnon} onCheckedChange={setNewPostAnon} />
                <span>{newPostAnon ? '익명' : '실명'}</span>
              </div>
              <Button size="sm" onClick={() => postMutation.mutate()}
                disabled={!newPostTitle.trim() || !newPostContent.trim() || postMutation.isPending}>
                등록
              </Button>
            </div>
          </div>
        )}

        {(() => {
          const virtualPosts = getVirtualPostsForCategory(selectedGroup.category ?? '');
          const allPosts = [...(posts ?? []), ...virtualPosts].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          return allPosts.length > 0 ? (
            <div className="space-y-3">
              {allPosts.map((p: any) => (
              <button key={p.id}
                onClick={() => p.is_virtual ? null : (() => { setSelectedPost(p); setView('post'); })()}
                className={`w-full text-left bg-card border rounded-xl p-4 space-y-1.5 transition-colors ${!p.is_virtual ? 'hover:border-primary/50 cursor-pointer' : 'cursor-default'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{displayName(p.is_anonymous)}</span>
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
            <div className="text-center py-12 text-muted-foreground text-sm">첫 글을 써보세요</div>
          );
        })()}
      </div>
    );
  }

  /* ── 그룹 목록 뷰 ── */
  return (
    <div className="px-4 py-6 max-w-sm mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold">커뮤니티</h2>
        <p className="text-sm text-muted-foreground mt-1">관계 패턴별 익명 공간</p>
      </div>

      {Object.entries(grouped).map(([cat, gs]: [string, any]) => (
        <div key={cat} className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            {CATEGORY_LABEL[cat] ?? cat}
          </p>
          <div className="space-y-2">
            {gs.map((g: any) => (
              <button key={g.id}
                onClick={() => { setSelectedGroup(g); setView('posts'); }}
                className="w-full text-left bg-card border rounded-xl p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{g.name}</p>
                  <span className="text-xs text-muted-foreground">{g.member_count}명</span>
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
