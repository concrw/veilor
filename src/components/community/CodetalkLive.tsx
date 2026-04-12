// #45 CodeTalk 라이브 — 실시간 키워드 토론
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';

interface CodetalkLiveProps {
  keyword: { id: string; keyword: string; day_number?: number } | null | undefined;
}

export default function CodetalkLive({ keyword }: CodetalkLiveProps) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [comment, setComment] = useState('');

  const { data: liveComments = [] } = useQuery({
    queryKey: ['codetalk-live', keyword?.id],
    queryFn: async () => {
      if (!keyword) return [];
      const { data } = await veilorDb
        .from('community_comments')
        .select('id, content, author_id, created_at')
        .eq('post_id', keyword.id)
        .order('created_at', { ascending: false })
        .limit(20);
      return data ?? [];
    },
    enabled: !!keyword,
    refetchInterval: 10000, // 10초마다 폴링 (실시간 대안)
  });

  const sendComment = useMutation({
    mutationFn: async () => {
      if (!user || !keyword || !comment.trim()) return;
      await veilorDb.from('community_comments').insert({
        post_id: keyword.id,
        author_id: user.id,
        content: comment.trim(),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['codetalk-live', keyword?.id] });
      setComment('');
    },
  });

  if (!keyword) return null;

  return (
    <div className="bg-card border rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">💬</span>
          <p className="text-xs font-medium">라이브 토론</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground">{liveComments.length}개 의견</span>
        </div>
      </div>

      <p className="text-sm font-medium">
        "<span className="text-primary">{keyword.keyword}</span>"에 대한 실시간 대화
      </p>

      {liveComments.length > 0 ? (
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {liveComments.slice(0, 8).map((c: { id: string; content: string; created_at: string }) => (
            <div key={c.id} className="bg-muted/30 rounded-lg px-3 py-1.5">
              <p className="text-xs leading-relaxed">{c.content}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">
                {new Date(c.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-3">아직 의견이 없어요</p>
      )}

      <div className="flex gap-2">
        <input
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="의견을 남겨보세요"
          maxLength={200}
          className="flex-1 bg-background border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          onKeyDown={e => { if (e.key === 'Enter' && comment.trim()) sendComment.mutate(); }}
        />
        <button
          onClick={() => sendComment.mutate()}
          disabled={!comment.trim() || sendComment.isPending}
          className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-medium disabled:opacity-40"
        >
          전송
        </button>
      </div>
    </div>
  );
}
