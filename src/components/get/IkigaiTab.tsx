// IkigaiTab — ikigai 4-element display + edit form + AI generate
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

function PremiumLock({ label, onUnlock }: { label: string; onUnlock?: () => void }) {
  return (
    <div
      className="bg-card border border-dashed rounded-2xl p-6 text-center space-y-2 opacity-70 cursor-pointer hover:opacity-90 transition-opacity"
      onClick={onUnlock}
    >
      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">프리미엄</span>
      <p className="text-sm text-muted-foreground mt-2">{label}</p>
      <p className="text-xs text-muted-foreground">탭하면 Pro 플랜을 확인할 수 있어요</p>
    </div>
  );
}

interface IkigaiTabProps {
  isPro: boolean;
  tryAccess: (feature: string) => void;
  ikigai: Record<string, unknown> | null;
  ikigaiEdit: boolean;
  ikigaiForm: { love: string; good_at: string; world_needs: string; paid_for: string };
  ikigaiAiLoading: boolean;
  ikigaiAiInsight: string;
  ikigaiSavePending: boolean;
  onSetIkigaiEdit: (v: boolean) => void;
  onSetIkigaiForm: (fn: (prev: { love: string; good_at: string; world_needs: string; paid_for: string }) => { love: string; good_at: string; world_needs: string; paid_for: string }) => void;
  onIkigaiSave: () => void;
  onIkigaiAiInsight: () => void;
}

export default function IkigaiTab({
  isPro, tryAccess, ikigai, ikigaiEdit, ikigaiForm,
  ikigaiAiLoading, ikigaiAiInsight, ikigaiSavePending,
  onSetIkigaiEdit, onSetIkigaiForm, onIkigaiSave, onIkigaiAiInsight,
}: IkigaiTabProps) {
  if (!isPro) {
    return (
      <PremiumLock
        label="Ikigai 설계 — 사랑/재능/소명/천직의 교차점에서 삶의 방향을 설계합니다."
        onUnlock={() => tryAccess('ikigai_design')}
      />
    );
  }

  if (!ikigaiEdit) {
    return (
      <div className="space-y-3">
        {ikigai ? (
          <>
            {[
              { key: 'love', label: '내가 사랑하는 것' },
              { key: 'good_at', label: '내가 잘하는 것' },
              { key: 'world_needs', label: '세상이 필요로 하는 것' },
              { key: 'paid_for', label: '돈이 될 수 있는 것' },
            ].map(({ key, label }) => (
              <div key={key} className="bg-card border rounded-2xl p-4 space-y-2">
                <p className="text-xs text-muted-foreground">{label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(ikigai[key] as string[] ?? []).map((item: string, i: number) => (
                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">{item}</span>
                  ))}
                  {(!ikigai[key] || (ikigai[key] as string[]).length === 0) && (
                    <p className="text-xs text-muted-foreground">—</p>
                  )}
                </div>
              </div>
            ))}
            {ikigaiAiInsight && (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-1">
                <p className="text-xs text-primary font-medium">AI 인사이트</p>
                <p className="text-sm leading-relaxed">{ikigaiAiInsight}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                onSetIkigaiForm(() => ({
                  love: ((ikigai.love as string[]) ?? []).join('\n'),
                  good_at: ((ikigai.good_at as string[]) ?? []).join('\n'),
                  world_needs: ((ikigai.world_needs as string[]) ?? []).join('\n'),
                  paid_for: ((ikigai.paid_for as string[]) ?? []).join('\n'),
                }));
                onSetIkigaiEdit(true);
              }}>수정</Button>
              <Button size="sm" className="flex-1" onClick={onIkigaiAiInsight}
                disabled={ikigaiAiLoading}>
                {ikigaiAiLoading ? 'AI 분석 중...' : 'AI 인사이트'}
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-card border rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">아직 Ikigai를 작성하지 않았어요.</p>
            <Button size="sm" onClick={() => onSetIkigaiEdit(true)}>Ikigai 작성하기</Button>
          </div>
        )}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="bg-card border rounded-2xl p-5 space-y-4">
      <p className="text-sm font-medium">Ikigai 설계</p>
      <p className="text-xs text-muted-foreground">항목을 줄 바꿔서 여러 개 입력할 수 있어요</p>
      {[
        { field: 'love' as const, label: '내가 사랑하는 것 (한 줄씩 입력)' },
        { field: 'good_at' as const, label: '내가 잘하는 것' },
        { field: 'world_needs' as const, label: '세상이 필요로 하는 것' },
        { field: 'paid_for' as const, label: '돈이 될 수 있는 것' },
      ].map(({ field, label }) => (
        <div key={field} className="space-y-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <Textarea
            value={ikigaiForm[field]}
            onChange={e => onSetIkigaiForm(prev => ({ ...prev, [field]: e.target.value }))}
            className="h-20 resize-none text-sm"
            placeholder={label}
          />
        </div>
      ))}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onSetIkigaiEdit(false)}>취소</Button>
        <Button size="sm" onClick={onIkigaiSave}
          disabled={ikigaiSavePending} className="flex-1">저장</Button>
      </div>
    </div>
  );
}
