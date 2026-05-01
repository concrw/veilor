// BrandTab — brand strategy display + edit form + AI generate
import { Button } from '@/components/ui/button';
import { useGetTranslations, useCommonTranslations } from '@/hooks/useTranslation';

interface BrandTabProps {
  isPro: boolean;
  tryAccess: (feature: string) => void;
  brand: Record<string, unknown> | null;
  brandEdit: boolean;
  brandForm: { name: string; tagline: string; core_value: string; target: string; tone: string };
  brandAiLoading: boolean;
  brandSavePending: boolean;
  onSetBrandEdit: (v: boolean) => void;
  onSetBrandForm: (fn: (prev: { name: string; tagline: string; core_value: string; target: string; tone: string }) => { name: string; tagline: string; core_value: string; target: string; tone: string }) => void;
  onBrandSave: () => void;
  onBrandAiGenerate: () => void;
}

export default function BrandTab({
  isPro, tryAccess, brand, brandEdit, brandForm,
  brandAiLoading, brandSavePending,
  onSetBrandEdit, onSetBrandForm, onBrandSave, onBrandAiGenerate,
}: BrandTabProps) {
  void isPro; void tryAccess;
  const get = useGetTranslations();
  const common = useCommonTranslations();
  const br = get.brand;

  const VIEW_FIELDS: { key: keyof typeof brandForm; label: string }[] = [
    { key: 'name', label: br.name },
    { key: 'tagline', label: br.tagline },
    { key: 'core_value', label: br.coreValue },
    { key: 'target', label: br.target },
    { key: 'tone', label: br.tone },
  ];

  const EDIT_FIELDS: { field: keyof typeof brandForm; label: string; placeholder: string }[] = [
    { field: 'name', label: br.name, placeholder: br.namePlaceholder },
    { field: 'tagline', label: br.tagline, placeholder: br.taglinePlaceholder },
    { field: 'core_value', label: br.coreValue, placeholder: br.coreValuePlaceholder },
    { field: 'target', label: br.target, placeholder: br.targetPlaceholder },
    { field: 'tone', label: br.tone, placeholder: br.tonePlaceholder },
  ];

  if (!brandEdit) {
    return (
      <div className="space-y-3">
        {brand ? (
          <>
            {VIEW_FIELDS.map(({ key, label }) => (
              brand[key] && (
                <div key={key} className="bg-card border rounded-2xl p-4 space-y-1">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium">{brand[key] as string}</p>
                </div>
              )
            ))}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                onSetBrandForm(() => ({
                  name: (brand.name as string) ?? '',
                  tagline: (brand.tagline as string) ?? '',
                  core_value: (brand.core_value as string) ?? '',
                  target: (brand.target as string) ?? '',
                  tone: (brand.tone as string) ?? '',
                }));
                onSetBrandEdit(true);
              }}>{br.writeManually}</Button>
              <Button size="sm" className="flex-1" onClick={onBrandAiGenerate}
                disabled={brandAiLoading}>
                {brandAiLoading ? br.aiGenerating : br.aiRegenerate}
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-card border rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">{br.notYet}</p>
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={onBrandAiGenerate} disabled={brandAiLoading}>
                {brandAiLoading ? br.aiGenerating : br.aiGenerate}
              </Button>
              <Button size="sm" variant="outline" onClick={() => onSetBrandEdit(true)}>{br.writeManually}</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="bg-card border rounded-2xl p-5 space-y-4">
      <p className="text-sm font-medium">{br.design}</p>
      {EDIT_FIELDS.map(({ field, label, placeholder }) => (
        <div key={field} className="space-y-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <input
            type="text"
            value={brandForm[field]}
            onChange={e => onSetBrandForm(prev => ({ ...prev, [field]: e.target.value }))}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm border-b pb-1.5 outline-none"
          />
        </div>
      ))}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onSetBrandEdit(false)}>{common.cancel}</Button>
        <Button size="sm" onClick={onBrandSave}
          disabled={brandSavePending} className="flex-1">{common.save}</Button>
      </div>
    </div>
  );
}
