import { useNavigate } from 'react-router-dom';
import type { UseMutationResult } from '@tanstack/react-query';
import BoundaryTab, { type BoundaryCategory } from './BoundaryTab';

interface Progress { checked: number; total: number; pct: number; }

interface Props {
  boundaryTexts: Record<string, string>;
  setBoundaryTexts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  saveBoundaryMutation: UseMutationResult<void, Error, BoundaryCategory>;
  axMercerChecks: Record<string, boolean>;
  toggleAxMercerMutation: UseMutationResult<{ itemKey: string; newChecked: boolean }, Error, string>;
  openSections: Record<string, boolean>;
  toggleSection: (id: string) => void;
  totalAxProgress: Progress;
  getAxMercerProgress: (id: string) => Progress;
  sexSelfTitle: string;
  sexSelfDesc: string;
}

export function SetPageBoundarySection({
  boundaryTexts, setBoundaryTexts, saveBoundaryMutation,
  axMercerChecks, toggleAxMercerMutation,
  openSections, toggleSection, totalAxProgress, getAxMercerProgress,
  sexSelfTitle, sexSelfDesc,
}: Props) {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => navigate('/home/sexself/questions')}
        className="w-full rounded-2xl p-4 text-left transition-all mb-1"
        style={{
          background: 'rgba(236,72,153,0.05)',
          border: '1px solid rgba(236,72,153,0.2)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base">🌸</span>
              <span className="text-sm font-medium" style={{ color: '#ec4899' }}>
                {sexSelfTitle}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.2)' }}
              >
                SexSelf
              </span>
            </div>
            <p className="text-xs font-light" style={{ color: 'rgba(236,72,153,0.7)' }}>
              {sexSelfDesc}
            </p>
          </div>
          <span style={{ color: 'rgba(236,72,153,0.5)', fontSize: 18 }}>›</span>
        </div>
      </button>
      <BoundaryTab
        boundaryTexts={boundaryTexts}
        setBoundaryTexts={setBoundaryTexts}
        saveBoundaryMutation={saveBoundaryMutation}
        axMercerChecks={axMercerChecks}
        toggleAxMercerMutation={toggleAxMercerMutation}
        openSections={openSections}
        toggleSection={toggleSection}
        totalAxProgress={totalAxProgress}
        getAxMercerProgress={getAxMercerProgress}
      />
    </>
  );
}
