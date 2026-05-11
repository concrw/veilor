// #47 토론 게시판 — 주제별 토론
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { useT } from '@/i18n/useT';
import { useLanguageContext } from '@/context/LanguageContext';
import { useUserLanguages } from '@/hooks/useUserLanguages';

export default function DiscussionBoard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { language } = useLanguageContext();
  const t = useT();
  const s = t.communityDomain.discussionBoard;
  const userLanguages = useUserLanguages();
  const [topic, setTopic] = useState('free');
  const [text, setText] = useState('');
  const [composing, setComposing] = useState(false);

  const { data: posts = [] } = useQuery({
    queryKey: ['discussion-posts', topic, userLanguages],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('community_posts')
        .select('id, content, author_id, created_at, tab_context')
        .eq('tab_context', topic)
        .in('lang', userLanguages)
        .order('created_at', { ascending: false })
        .limit(15);
      return data ?? [];
    },
    enabled: !!user,
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      if (!user || !text.trim()) return;
      await veilorDb.from('community_posts').insert({
        author_id: user.id,
        content: text.trim(),
        tab_context: topic,
        lang: language,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discussion-posts', topic] });
      setText('');
      setComposing(false);
    },
  });

  return (
    <div className="space-y-4">
      {/* 주제 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {s.topics.map(t => (
          <button key={t.id} onClick={() => setTopic(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
              topic === t.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}>
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* 글쓰기 */}
      {composing ? (
        <div className="bg-card border rounded-xl p-3 space-y-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={s.placeholder}
            maxLength={500}
            className="w-full bg-background border rounded-lg p-2.5 text-sm resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex gap-2">
            <button onClick={() => setComposing(false)} className="flex-1 text-xs text-muted-foreground py-2 border rounded-lg">{s.cancel}</button>
            <button onClick={() => postMutation.mutate()} disabled={!text.trim()} className="flex-1 text-xs text-white py-2 bg-primary rounded-lg disabled:opacity-40">{s.post}</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setComposing(true)} className="w-full bg-card border border-dashed rounded-xl p-3 text-xs text-muted-foreground text-center hover:border-primary/40">
          {s.writeButton}
        </button>
      )}

      {/* 글 목록 */}
      <div className="space-y-2">
        {posts.map((post: { id: string; content: string; created_at: string }) => (
          <div key={post.id} className="bg-card border rounded-xl p-4 space-y-1">
            <p className="text-sm leading-relaxed">{post.content}</p>
            <p className="text-[10px] text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">{s.noPosts}</p>
        )}
      </div>
    </div>
  );
}
