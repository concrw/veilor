// CodetalkTab — 100-day keyword recording tab
import type { VeilorCodetalkEntry, VeilorCodetalkKeyword } from '@/integrations/supabase/veilor-types';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { UseMutationResult } from '@tanstack/react-query';
import { useDigTranslations } from '@/hooks/useTranslation';

interface CodetalkTabProps {
  keyword: VeilorCodetalkKeyword | null | undefined;
  todayEntry: VeilorCodetalkEntry | null | undefined;
  pastEntries: VeilorCodetalkEntry[] | undefined;
  entry: string;
  setEntry: (v: string) => void;
  isPublic: boolean;
  setIsPublic: (v: boolean) => void;
  saveMutation: UseMutationResult<void, Error, void, unknown>;
  aiInsight?: string | null;
  aiInsightLoading?: boolean;
  onRequestInsight?: () => void;
}

export default function CodetalkTab({
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
}: CodetalkTabProps) {
  const digT = useDigTranslations();
  const dig = digT.codetalk;

  const publicLabel = dig.publicToggle;
  const privateLabel = dig.privateToggle;

  return (
    <>
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">DAY {keyword?.day_number ?? 1} / 100</span>
          <div className="h-1.5 w-24 bg-muted rounded-full">
            <div className="h-1.5 bg-primary rounded-full"
              style={{ width: `${((keyword?.day_number ?? 1) / 100) * 100}%` }} />
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">{dig.keywordSearch}</p>
          <h3 className="text-2xl font-bold">{keyword?.keyword ?? '—'}</h3>
          {keyword?.description && (
            <p className="text-sm text-muted-foreground mt-1">{keyword.description}</p>
          )}
        </div>
      </div>

      {!todayEntry ? (
        <div className="bg-card border rounded-2xl p-5 space-y-4">
          <p className="text-sm font-medium">{dig.freePlaceholder}</p>
          <Textarea
            placeholder={dig.freePlaceholder}
            maxLength={500}
            value={entry}
            onChange={e => setEntry(e.target.value)}
            className="h-28 resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              <span>{isPublic ? publicLabel : privateLabel}</span>
            </div>
            <Button size="sm" onClick={() => saveMutation.mutate()}
              disabled={!entry.trim() || saveMutation.isPending}>
              {saveMutation.isPending ? dig.saving : dig.save}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl p-5 space-y-3">
          <p className="text-xs text-muted-foreground mb-2">{dig.savedToast}</p>
          {todayEntry.definition && (
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground">{dig.steps?.definition ?? 'Definition'}</p>
              <p className="text-sm leading-relaxed">{todayEntry.definition}</p>
            </div>
          )}
          {todayEntry.imprinting_moment && (
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground">{dig.steps?.imprinting_moment ?? 'Imprinting'}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{todayEntry.imprinting_moment}</p>
            </div>
          )}
          {todayEntry.root_cause && (
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground">{dig.steps?.root_cause ?? 'Root'}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{todayEntry.root_cause}</p>
            </div>
          )}
          {!todayEntry.definition && todayEntry.content && (
            <p className="text-sm leading-relaxed">{todayEntry.content}</p>
          )}

          {aiInsight && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-1">
              <p className="text-xs text-primary font-medium">{dig.otherEntries}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{aiInsight}</p>
            </div>
          )}
          {!aiInsight && onRequestInsight && (
            <Button size="sm" variant="outline" onClick={onRequestInsight}
              disabled={aiInsightLoading} className="w-full">
              {aiInsightLoading ? dig.saving : dig.exploreMore}
            </Button>
          )}
        </div>
      )}

      {pastEntries && pastEntries.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{dig.otherEntries}</p>
          {pastEntries.map((e: VeilorCodetalkEntry) => (
            <div key={e.id} className="bg-card border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">DAY {e.codetalk_keywords?.day_number} · {e.codetalk_keywords?.keyword}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(e.entry_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              {e.definition ? (
                <p className="text-xs text-muted-foreground line-clamp-2">{e.definition}</p>
              ) : (
                <p className="text-xs text-muted-foreground line-clamp-2">{e.content}</p>
              )}
              {(e.imprinting_moment || e.root_cause) && (
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {[e.imprinting_moment && (dig.steps?.imprinting_moment ?? 'Imprint'), e.root_cause && (dig.steps?.root_cause ?? 'Root')].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
