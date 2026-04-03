// BoundaryTab — boundary categories + Ax Mercer 3-condition checklist
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { UseMutationResult } from '@tanstack/react-query';

// ── Constants ──
export const BOUNDARY_CATEGORIES = [
  { key: 'emotional', label: '감정적 경계', placeholder: '예: 감정적으로 압도당할 때 혼자만의 시간이 필요해요' },
  { key: 'physical', label: '물리적 경계', placeholder: '예: 허락 없이 제 물건을 사용하지 않았으면 해요' },
  { key: 'time', label: '시간 경계', placeholder: '예: 밤 11시 이후에는 개인 시간을 보장받고 싶어요' },
  { key: 'digital', label: '디지털 경계', placeholder: '예: 제 핸드폰을 확인하지 않았으면 해요' },
] as const;

export type BoundaryCategory = typeof BOUNDARY_CATEGORIES[number]['key'];

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

// ── Ax Mercer 3조건: 경계(Boundary), 합의(Consent), 소통(Communication) ──
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

export const AX_MERCER_SECTIONS: AxMercerSection[] = [
  {
    id: 'boundary',
    title: '경계 (Boundary)',
    description: '나의 한계를 인식하고 표현하는 것이 건강한 관계의 시작입니다.',
    icon: '🛡',
    items: [
      { key: 'bnd_physical_aware',    label: '나의 물리적 경계를 알고 있다' },
      { key: 'bnd_emotional_express',  label: '감정적 경계를 상대에게 말할 수 있다' },
      { key: 'bnd_recognize_violation', label: '경계가 침범당했을 때 인지할 수 있다' },
      { key: 'bnd_right_to_refuse',    label: '거절할 권리가 있음을 알고 있다' },
    ],
  },
  {
    id: 'consent',
    title: '합의 (Consent)',
    description: '모든 관계에서 명시적 동의는 의무가 아니라 존중의 언어입니다.',
    icon: '🤝',
    items: [
      { key: 'cns_explicit_ask',      label: '모든 친밀한 접촉에 명시적 동의를 구한다' },
      { key: 'cns_respect_no',        label: "상대의 '아니오'를 존중한다" },
      { key: 'cns_can_withdraw',      label: '동의는 언제든 철회할 수 있음을 안다' },
      { key: 'cns_ongoing_check',     label: '관계 중에도 지속적으로 동의를 확인한다' },
    ],
  },
  {
    id: 'communication',
    title: '소통 (Communication)',
    description: '말로 표현하고 경청하는 능력이 관계의 질을 결정합니다.',
    icon: '💬',
    items: [
      { key: 'com_express_needs',     label: '원하는 것을 말로 표현할 수 있다' },
      { key: 'com_read_nonverbal',    label: '상대의 비언어적 신호를 읽을 수 있다' },
      { key: 'com_express_discomfort', label: '불편함을 즉시 표현할 수 있다' },
      { key: 'com_active_listen',     label: '상대의 말을 끝까지 경청할 수 있다' },
    ],
  },
];

export const ALL_AX_MERCER_KEYS = AX_MERCER_SECTIONS.flatMap(s => s.items.map(i => i.key));

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
  return (
    <>
      {/* ── Ax Mercer 3조건 전체 진행률 ── */}
      <div className="bg-card border border-amber-500/20 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-amber-200">Ax Mercer 3조건 체크리스트</h3>
            <p className="text-xs text-amber-200/60 mt-1">
              건강한 관계의 3가지 조건 — 경계, 합의, 소통
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-amber-400">{totalAxProgress.pct}%</span>
            <p className="text-[10px] text-amber-200/50">{totalAxProgress.checked}/{totalAxProgress.total}</p>
          </div>
        </div>
        {/* 전체 프로그레스 바 */}
        <div className="h-2 bg-amber-950/40 rounded-full overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${totalAxProgress.pct}%`,
              background: 'linear-gradient(90deg, #d97706, #f59e0b)',
            }}
          />
        </div>
        {totalAxProgress.pct === 100 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
            <p className="text-xs font-medium text-amber-300">
              모든 조건을 확인했어요. 건강한 관계의 기반이 갖추어졌습니다.
            </p>
          </div>
        )}
      </div>

      {/* ── Ax Mercer 3 섹션 아코디언 ── */}
      <div className="space-y-3">
        {AX_MERCER_SECTIONS.map((section) => {
          const progress = getAxMercerProgress(section.id);
          const isOpen = openSections[section.id] ?? false;

          return (
            <div key={section.id} className="bg-card border border-amber-500/10 rounded-2xl overflow-hidden">
              {/* 아코디언 헤더 */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-amber-500/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{section.icon}</span>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-100">{section.title}</h4>
                    <p className="text-[11px] text-amber-200/50 mt-0.5">{progress.checked}/{progress.total} 완료</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* 섹션별 미니 프로그레스 */}
                  <div className="w-12 h-1.5 bg-amber-950/40 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${progress.pct}%`,
                        background: progress.pct === 100 ? '#f59e0b' : '#d97706',
                      }}
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

              {/* 아코디언 바디 */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-1">
                  <p className="text-xs text-amber-200/40 mb-3 pl-1">{section.description}</p>
                  {section.items.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => toggleAxMercerMutation.mutate(item.key)}
                      disabled={toggleAxMercerMutation.isPending}
                      className="w-full flex items-start gap-3 text-left group py-2 px-1 rounded-lg hover:bg-amber-500/5 transition-colors"
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200
                        ${axMercerChecks[item.key]
                          ? 'bg-amber-500 border-amber-500 text-black'
                          : 'border-amber-500/30 group-hover:border-amber-500/60'}`}>
                        {axMercerChecks[item.key] && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm leading-relaxed transition-colors
                        ${axMercerChecks[item.key] ? 'text-amber-100' : 'text-amber-200/60'}`}>
                        {item.label}
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
          <h3 className="text-sm font-semibold text-amber-200">나의 경계 설정</h3>
          <p className="text-xs text-amber-200/50 mt-1">
            각 영역에서 나의 경계를 정의해 보세요.
          </p>
        </div>

        {BOUNDARY_CATEGORIES.map(({ key, label, placeholder }) => (
          <div key={key} className="bg-card border border-amber-500/10 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-medium text-amber-100">{label}</p>
            <Textarea
              placeholder={placeholder}
              maxLength={300}
              value={boundaryTexts[key]}
              onChange={e => setBoundaryTexts(prev => ({ ...prev, [key]: e.target.value }))}
              className="h-20 resize-none text-sm border-amber-500/20 focus:border-amber-500/40"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => saveBoundaryMutation.mutate(key)}
                disabled={saveBoundaryMutation.isPending}
                className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10 hover:text-amber-100"
              >
                저장
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
