import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useT } from '@/i18n/useT';

// Utilities
const DURATION_SECONDS = 600; // 10 minutes
const formatTime = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

interface Step1BrainstormingSectionProps {
  memoText: string;
  setMemoText: (text: string) => void;
  secondsLeft: number;
  currentJobCount: number;
  onFinalize: () => void;
  sessionEnded: boolean;
}

export const Step1BrainstormingSection = ({
  memoText,
  setMemoText,
  secondsLeft,
  currentJobCount,
  onFinalize,
  sessionEnded
}: Step1BrainstormingSectionProps) => {
  const t = useT();
  const s = t.why.step1;

  const memoRef = useRef<HTMLTextAreaElement | null>(null);
  const [memoHeight, setMemoHeight] = useState<number | null>(null);

  // Persist user-set memo height
  useEffect(() => {
    const stored = localStorage.getItem("why:memoHeight");
    if (stored) {
      const num = parseInt(stored, 10);
      if (!Number.isNaN(num)) setMemoHeight(num);
    }
  }, []);

  useEffect(() => {
    const el = memoRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = Math.round(entry.contentRect.height);
        if (h > 0) {
          setMemoHeight(h);
          localStorage.setItem("why:memoHeight", String(h));
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [memoRef]);

  return (
    <section className="space-y-4" data-step-visible="1">
      <Textarea
        ref={memoRef}
        value={memoText}
        onChange={e => setMemoText(e.target.value)}
        placeholder={s.placeholder}
        className="resize-y min-h-40 bg-transparent mb-4"
        style={{ height: memoHeight ?? undefined }}
      />

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm tabular-nums">{formatTime(secondsLeft)}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {s.currentCount.replace('{count}', String(currentJobCount))}
          </span>
          <Button
            size="sm"
            variant="secondary"
            className="h-6 px-2 text-xs"
            onClick={() => {
              memoRef.current?.focus();
              memoRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
            }}
          >
            {s.edit}
          </Button>
          <Button
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={onFinalize}
          >
            {s.done}
          </Button>
        </div>
      </div>
    </section>
  );
};
