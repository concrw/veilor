// IkigaiTab — ikigai 4-element display + edit form + AI generate
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useGetTranslations, useCommonTranslations } from '@/hooks/useTranslation';


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
  void isPro; void tryAccess;
  const get = useGetTranslations();
  const common = useCommonTranslations();
  const ik = get.ikigai;

  const FIELDS: { key: keyof typeof ikigaiForm; label: string; inputLabel: string }[] = [
    { key: 'love', label: ik.love, inputLabel: ik.loveInput },
    { key: 'good_at', label: ik.goodAt, inputLabel: ik.goodAt },
    { key: 'world_needs', label: ik.worldNeeds, inputLabel: ik.worldNeeds },
    { key: 'paid_for', label: ik.paidFor, inputLabel: ik.paidFor },
  ];

  if (!ikigaiEdit) {
    return (
      <div className="space-y-3">
        {ikigai ? (
          <>
            {FIELDS.map(({ key, label }) => (
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
                <p className="text-xs text-primary font-medium">{ik.aiInsight}</p>
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
              }}>{ik.writeButton}</Button>
              <Button size="sm" className="flex-1" onClick={onIkigaiAiInsight}
                disabled={ikigaiAiLoading}>
                {ikigaiAiLoading ? ik.aiAnalyzing : ik.aiInsight}
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-card border rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">{ik.notYet}</p>
            <Button size="sm" onClick={() => onSetIkigaiEdit(true)}>{ik.design}</Button>
          </div>
        )}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="bg-card border rounded-2xl p-5 space-y-4">
      <p className="text-sm font-medium">{ik.design}</p>
      <p className="text-xs text-muted-foreground">{ik.multiLineHint}</p>
      {FIELDS.map(({ key, label, inputLabel }) => (
        <div key={key} className="space-y-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <Textarea
            value={ikigaiForm[key]}
            onChange={e => onSetIkigaiForm(prev => ({ ...prev, [key]: e.target.value }))}
            className="h-20 resize-none text-sm"
            placeholder={inputLabel}
          />
        </div>
      ))}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onSetIkigaiEdit(false)}>{common.cancel}</Button>
        <Button size="sm" onClick={onIkigaiSave}
          disabled={ikigaiSavePending} className="flex-1">{common.save}</Button>
      </div>
    </div>
  );
}
