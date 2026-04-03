// AxMercerTab — public story feed (Ax Mercer 3-condition context)
import type { VeilrumCodetalkEntry, VeilrumCodetalkKeyword } from '@/integrations/supabase/veilrum-types';

interface AxMercerTabProps {
  keyword: VeilrumCodetalkKeyword | null | undefined;
  publicFeed: Pick<VeilrumCodetalkEntry, 'id' | 'content' | 'created_at' | 'user_id'>[] | undefined;
}

export default function AxMercerTab({ keyword, publicFeed }: AxMercerTabProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        오늘 키워드 <span className="font-medium text-foreground">"{keyword?.keyword}"</span>에 대한 이야기들
      </p>
      {publicFeed && publicFeed.length > 0 ? (
        publicFeed.map((item: Pick<VeilrumCodetalkEntry, 'id' | 'content' | 'created_at' | 'user_id'>) => (
          <div key={item.id} className="bg-card border rounded-xl p-4 space-y-2">
            <p className="text-sm leading-relaxed">{item.content}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))
      ) : (
        <div className="text-center py-12 text-muted-foreground text-sm">
          아직 오늘의 스토리가 없어요.<br />첫 번째로 공유해보세요.
        </div>
      )}
    </div>
  );
}
