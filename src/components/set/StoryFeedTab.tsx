import type { VeilorCodetalkEntry, VeilorCodetalkKeyword } from '@/integrations/supabase/veilor-types';
import { useDigTranslations } from '@/hooks/useTranslation';

interface StoryFeedTabProps {
  keyword: VeilorCodetalkKeyword | null | undefined;
  publicFeed: Pick<VeilorCodetalkEntry, 'id' | 'content' | 'created_at' | 'user_id'>[] | undefined;
}

export default function StoryFeedTab({ keyword, publicFeed }: StoryFeedTabProps) {
  const dig = useDigTranslations();
  const ct = dig.codetalk;

  const feedDesc = ct.storyFeedDesc.replace('{keyword}', keyword?.keyword ?? '');
  const [emptyLine1, emptyLine2] = ct.storyFeedEmpty.split('\n');

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {feedDesc}
      </p>
      {publicFeed && publicFeed.length > 0 ? (
        publicFeed.map((item: Pick<VeilorCodetalkEntry, 'id' | 'content' | 'created_at' | 'user_id'>) => (
          <div key={item.id} className="bg-card border rounded-xl p-4 space-y-2">
            <p className="text-sm leading-relaxed">{item.content}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))
      ) : (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {emptyLine1}<br />{emptyLine2}
        </div>
      )}
    </div>
  );
}
