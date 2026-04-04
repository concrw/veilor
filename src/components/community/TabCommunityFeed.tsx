// #42 탭별 분산 커뮤니티 — 각 탭에 맞는 커뮤니티 피드
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilrumDb } from '@/integrations/supabase/client';

interface TabCommunityFeedProps {
  tab: 'vent' | 'dig' | 'get' | 'set';
}

const TAB_LABELS: Record<string, { title: string; placeholder: string }> = {
  vent: { title: '감정 나눔', placeholder: '오늘 느낀 감정을 나눠보세요...' },
  dig: { title: '패턴 공유', placeholder: '발견한 관계 패턴을 공유해보세요...' },
  get: { title: '통찰 교류', placeholder: 'V-File에서 발견한 것을 나눠보세요...' },
  set: { title: '실천 인증', placeholder: '오늘의 실천을 기록해보세요...' },
};

export default function TabCommunityFeed({ tab }: TabCommunityFeedProps) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const [showInput, setShowInput] = useState(false);

  const { data: posts = [] } = useQuery({
    queryKey: ['tab-community', tab, user?.id],
    queryFn: async () => {
      const { data } = await veilrumDb
        .from('community_posts')
        .select('id, content, author_id, created_at, tab_context')
        .eq('tab_context', tab)
        .order('created_at', { ascending: false })
        .limit(10);
      return data ?? [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      if (!user || !text.trim()) return;
      await veilrumDb.from('community_posts').insert({
        author_id: user.id,
        content: text.trim(),
        tab_context: tab,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tab-community', tab] });
      setText('');
      setShowInput(false);
    },
  });

  const label = TAB_LABELS[tab];

  return (
    <div className="bg-card border rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">{label.title}</p>
        <span className="text-[10px] text-muted-foreground">{posts.length}개 글</span>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {posts.slice(0, 5).map((post: { id: string; content: string; created_at: string }) => (
            <div key={post.id} className="bg-muted/30 rounded-lg px-3 py-2">
              <p className="text-xs leading-relaxed line-clamp-2">{post.content}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(post.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">아직 글이 없어요. 첫 번째로 나눠보세요!</p>
      )}

      {showInput ? (
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={label.placeholder}
            maxLength={300}
            className="w-full bg-background border rounded-lg p-2.5 text-xs resize-none h-16 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex gap-2">
            <button onClick={() => setShowInput(false)} className="flex-1 text-xs text-muted-foreground py-1.5 rounded-lg border">취소</button>
            <button
              onClick={() => postMutation.mutate()}
              disabled={!text.trim() || postMutation.isPending}
              className="flex-1 text-xs text-white py-1.5 rounded-lg bg-primary disabled:opacity-40"
            >
              {postMutation.isPending ? '...' : '공유'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="w-full text-xs text-muted-foreground py-2 rounded-lg border border-dashed hover:border-primary/40 transition-colors"
        >
          + 나누기
        </button>
      )}
    </div>
  );
}
