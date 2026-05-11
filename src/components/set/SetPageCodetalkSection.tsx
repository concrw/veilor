import type { UseMutationResult } from '@tanstack/react-query';
import CodetalkTab from './CodetalkTab';
import CodetalkHub from './CodetalkHub';

type CodetalkMode = 'hub' | 'daily' | 'category' | 'relation';

interface Props {
  isLoading: boolean;
  codetalkMode: CodetalkMode;
  setCodetalkMode: (m: CodetalkMode) => void;
  keyword: unknown;
  todayEntry: unknown;
  pastEntries: unknown[];
  entry: string;
  setEntry: (v: string) => void;
  isPublic: boolean;
  setIsPublic: (v: boolean) => void;
  saveMutation: UseMutationResult<void, Error, void>;
  aiInsight: string | null;
  aiInsightLoading: boolean;
  onRequestInsight: () => void;
  backLabel: string;
}

export function SetPageCodetalkSection({
  isLoading,
  codetalkMode,
  setCodetalkMode,
  keyword,
  todayEntry,
  pastEntries,
  entry,
  setEntry,
  isPublic,
  setIsPublic,
  saveMutation,
  aiInsight,
  aiInsightLoading,
  onRequestInsight,
  backLabel,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (codetalkMode === 'hub') {
    return (
      <CodetalkHub
        onModeSelect={setCodetalkMode}
        keyword={keyword}
        todayEntry={todayEntry}
      />
    );
  }

  const codetalkTabProps = {
    keyword, todayEntry, pastEntries, entry, setEntry,
    isPublic, setIsPublic, saveMutation, aiInsight, aiInsightLoading,
    onRequestInsight,
  };

  return (
    <>
      <button
        onClick={() => setCodetalkMode('hub')}
        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-1"
        style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}
      >
        {backLabel}
      </button>
      <CodetalkTab {...codetalkTabProps} />
    </>
  );
}
