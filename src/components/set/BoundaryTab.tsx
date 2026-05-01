// BoundaryTab — boundary categories + Ax Mercer 3-condition checklist
import { useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { UseMutationResult } from '@tanstack/react-query';
import { useSetTranslations } from '@/hooks/useTranslation';

// ── Constants ──
export const BOUNDARY_CATEGORY_KEYS = ['emotional', 'physical', 'time', 'digital', 'sexual'] as const;
export type BoundaryCategory = typeof BOUNDARY_CATEGORY_KEYS[number];

interface BoundaryTabProps {
  boundaryTexts: Record<string, string>;
  setBoundaryTexts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  saveBoundaryMutation: UseMutationResult<void, Error, BoundaryCategory, unknown>;
  axMercerChecks: Record<string, boolean>;
  toggleAxMercerMutation: UseMutationResult<{ itemKey: string; newChecked: boolean }, Error, string, unknown>;
  openSections: Record<string, boolean>;
  toggleSection: (sectionId: string) => void;
  totalAxProgress: { checked: number; total: number; pct: number };
  getAxMercerProgress: (sectionId: string) => { checked: number; total: number; pct: number };
}

export interface AxMercerItem {
  key: string;
  label: string;
}

export interface AxMercerSection {
  id: 'boundary' | 'consent' | 'communication';
  title: string;
  description: string;
  icon: string;
  items: AxMercerItem[];
}

const AX_MERCER_IDS = ['boundary', 'consent', 'communication'] as const;
const AX_MERCER_ICONS: Record<string, string> = { boundary: '🛡', consent: '🤝', communication: '💬' };

export const ALL_AX_MERCER_KEYS = [
  'bnd_physical_aware', 'bnd_emotional_express', 'bnd_recognize_violation', 'bnd_right_to_refuse',
  'cns_explicit_ask', 'cns_respect_no', 'cns_can_withdraw', 'cns_ongoing_check',
  'com_express_needs', 'com_read_nonverbal', 'com_express_discomfort', 'com_active_listen',
];

export default function BoundaryTab({
  boundaryTexts,
  setBoundaryTexts,
  saveBoundaryMutation,
  axMercerChecks,
  toggleAxMercerMutation,
  openSections,
  toggleSection,
  totalAxProgress,
  getAxMercerProgress,
}: BoundaryTabProps) {
  const navigate = useNavigate();
  const set = useSetTranslations();
  const b = set.boundary;

  return (
    <>
      {/* ── Ax Mercer 3조건 전체 진행률 ── */}
      <div className="bg-card border border-amber-500/20 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-amber-200">{b.axMercerTitle}</h3>
            <p className="text-xs text-amber-200/60 mt-1">{b.axMercerSubtitle}</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-amber-400">{totalAxProgress.pct}%</span>
            <p className="text-[10px] text-amber-200/50">{totalAxProgress.checked}/{totalAxProgress.total}</p>
          </div>
        </div>
        <div className="h-2 bg-amber-950/40 rounded-full overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${totalAxProgress.pct}%`, background: 'linear-gradient(90deg, #d97706, #f59e0b)' }}
          />
        </div>
        {totalAxProgress.pct === 100 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
            <p className="text-xs font-medium text-amber-300">{b.axMercerAllComplete}</p>
          </div>
        )}
      </div>

      {/* ── Ax Mercer 3 섹션 아코디언 ── */}
      <div className="space-y-3">
        {AX_MERCER_IDS.map((sectionId) => {
          const sectionData = b.axMercerSections[sectionId];
          const progress = getAxMercerProgress(sectionId);
          const isOpen = openSections[sectionId] ?? false;
          const icon = AX_MERCER_ICONS[sectionId];
          const items = Object.entries(sectionData?.items ?? {});

          return (
            <div key={sectionId} className="bg-card border border-amber-500/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection(sectionId)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-amber-500/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-100">{sectionData?.title}</h4>
                    <p className="text-[11px] text-amber-200/50 mt-0.5">
                      {b.sectionComplete.replace('{checked}', String(progress.checked)).replace('{total}', String(progress.total))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-1.5 bg-amber-950/40 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress.pct}%`, background: progress.pct === 100 ? '#f59e0b' : '#d97706' }}
                    />
                  </div>
                  <svg
                    className={`w-4 h-4 text-amber-400/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-1">
                  <p className="text-xs text-amber-200/40 mb-3 pl-1">{sectionData?.description}</p>
                  {items.map(([itemKey, itemLabel]) => (
                    <button
                      key={itemKey}
                      onClick={() => toggleAxMercerMutation.mutate(itemKey)}
                      disabled={toggleAxMercerMutation.isPending}
                      className="w-full flex items-start gap-3 text-left group py-2 px-1 rounded-lg hover:bg-amber-500/5 transition-colors"
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200
                        ${axMercerChecks[itemKey]
                          ? 'bg-amber-500 border-amber-500 text-black'
                          : 'border-amber-500/30 group-hover:border-amber-500/60'}`}>
                        {axMercerChecks[itemKey] && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm leading-relaxed transition-colors
                        ${axMercerChecks[itemKey] ? 'text-amber-100' : 'text-amber-200/60'}`}>
                        {itemLabel}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 카테고리별 경계 설정 카드 ── */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-amber-200">{b.boundarySettingTitle}</h3>
          <p className="text-xs text-amber-200/50 mt-1">{b.boundarySettingSubtitle}</p>
        </div>

        {BOUNDARY_CATEGORY_KEYS.map((key) => {
          const isSexual = key === 'sexual';
          const label = isSexual ? b.sexual : b.categories[key as keyof typeof b.categories] ?? key;
          const placeholder = b.placeholders[key] ?? '';
          return (
            <div key={key}
              className="bg-card rounded-2xl p-4 space-y-3"
              style={{ border: isSexual ? '1px solid rgba(236,72,153,0.25)' : '1px solid rgba(245,158,11,0.1)' }}
            >
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium ${isSexual ? '' : 'text-amber-100'}`}
                  style={{ color: isSexual ? '#ec4899' : undefined }}>
                  {isSexual ? '🌸 ' : ''}{label}
                </p>
                {isSexual && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(236,72,153,0.08)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.2)' }}>
                    {b.sexualPrivate}
                  </span>
                )}
              </div>
              {isSexual && (
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(236,72,153,0.6)' }}>
                  {b.sexualDesc}
                </p>
              )}
              <Textarea
                placeholder={placeholder}
                maxLength={300}
                value={boundaryTexts[key]}
                onChange={e => setBoundaryTexts(prev => ({ ...prev, [key]: e.target.value }))}
                className="h-20 resize-none text-sm"
                style={{ borderColor: isSexual ? 'rgba(236,72,153,0.2)' : undefined }}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => saveBoundaryMutation.mutate(key as BoundaryCategory)}
                  disabled={saveBoundaryMutation.isPending}
                  className={isSexual
                    ? 'border-pink-500/30 text-pink-300 hover:bg-pink-500/10 hover:text-pink-200'
                    : 'border-amber-500/30 text-amber-200 hover:bg-amber-500/10 hover:text-amber-100'}
                >
                  {b.save}
                </Button>
              </div>
              {isSexual && (
                <button
                  onClick={() => navigate('/home/sexself/questions')}
                  className="w-full text-left text-[11px] font-light pt-1"
                  style={{ color: 'rgba(236,72,153,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {b.sexualExplore}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
