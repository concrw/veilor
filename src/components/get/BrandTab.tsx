// BrandTab — brand strategy display + edit form + AI generate
import { Button } from '@/components/ui/button';

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

  if (!brandEdit) {
    return (
      <div className="space-y-3">
        {brand ? (
          <>
            {[
              { key: 'name', label: '브랜드 이름' },
              { key: 'tagline', label: '태그라인' },
              { key: 'core_value', label: '핵심 가치' },
              { key: 'target', label: '타겟 대상' },
              { key: 'tone', label: '톤 & 보이스' },
            ].map(({ key, label }) => (
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
              }}>수정</Button>
              <Button size="sm" className="flex-1" onClick={onBrandAiGenerate}
                disabled={brandAiLoading}>
                {brandAiLoading ? 'AI 생성 중...' : 'AI 재생성'}
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-card border rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">아직 브랜드 정체성을 작성하지 않았어요.</p>
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={onBrandAiGenerate}
                disabled={brandAiLoading}>
                {brandAiLoading ? 'AI 생성 중...' : 'AI로 브랜드 전략 생성'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => onSetBrandEdit(true)}>직접 작성하기</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="bg-card border rounded-2xl p-5 space-y-4">
      <p className="text-sm font-medium">브랜드 정체성 설계</p>
      {[
        { field: 'name' as const, label: '브랜드 이름', placeholder: '나를 표현하는 이름' },
        { field: 'tagline' as const, label: '태그라인', placeholder: '한 문장으로 나를 설명한다면' },
        { field: 'core_value' as const, label: '핵심 가치', placeholder: '가장 중요하게 생각하는 가치' },
        { field: 'target' as const, label: '타겟 대상', placeholder: '내 메시지를 전하고 싶은 사람' },
        { field: 'tone' as const, label: '톤 & 보이스', placeholder: '예: 따뜻하고 직접적인, 분석적인' },
      ].map(({ field, label, placeholder }) => (
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
        <Button variant="outline" size="sm" onClick={() => onSetBrandEdit(false)}>취소</Button>
        <Button size="sm" onClick={onBrandSave}
          disabled={brandSavePending} className="flex-1">저장</Button>
      </div>
    </div>
  );
}
