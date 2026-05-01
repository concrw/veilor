import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    normalizing: '직업 항목 정규화 중...',
    back: '뒤로가기',
    sessionLabel: '세션: ',
    definitionLabel: '이 직업에 대한 당신만의 정의',
    definitionPlaceholder: '예) 사람과 기술을 연결해 문제를 해결하는 역할',
    memoryLabel: '처음 각인된 순간 (언제/어디서/누구와/무엇을/왜/어떻게)',
    memoryPlaceholder: '예) 2018년 도서관에서 친구와 진로 상담 중 기사에서 처음 접함...',
    prev: '이전',
    review: '검토로',
    next: '다음',
    step1: '1단계로',
    nextStep: '다음 단계',
  },
  en: {
    normalizing: 'Normalizing career items...',
    back: 'Back',
    sessionLabel: 'Session: ',
    definitionLabel: 'Your personal definition of this career',
    definitionPlaceholder: 'e.g., A role that connects people and technology to solve problems',
    memoryLabel: 'First imprint moment (when/where/with whom/what/why/how)',
    memoryPlaceholder: 'e.g., First encountered it in a 2018 newspaper while discussing careers with a friend at the library...',
    prev: 'Prev',
    review: 'Review',
    next: 'Next',
    step1: 'Step 1',
    nextStep: 'Next step',
  },
};

interface Job {
  id: string;
  job_name: string;
  definition: string | null;
  first_memory: string | null;
  category: "happy" | "pain" | "neutral" | null;
  reason?: string | null;
}

interface SessionInfo {
  id: string;
  status: "active" | "completed" | string | null;
  ended_at?: string | null;
}

interface Step2DefinitionSectionProps {
  jobs: Job[];
  idx: number;
  setIdx: (idx: number) => void;
  session: SessionInfo | null;
  isNormalizing: boolean;
  onSaveCurrent: (definition: string, memory: string) => Promise<boolean>;
  onPrevStep: () => void;
  onNextStep: () => void;
  canGoStep3: boolean;
}

export const Step2DefinitionSection = ({
  jobs,
  idx,
  setIdx,
  session,
  isNormalizing,
  onSaveCurrent,
  onPrevStep,
  onNextStep,
  canGoStep3
}: Step2DefinitionSectionProps) => {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [defDraft, setDefDraft] = useState("");
  const [memDraft, setMemDraft] = useState("");

  const current = jobs[idx];
  const total = jobs.length;

  // Update drafts when current job changes
  useEffect(() => {
    if (!current) return;
    setDefDraft(current.definition || "");
    setMemDraft(current.first_memory || "");
  }, [current?.id]);

  const handlePrevItem = async () => {
    if (idx === 0) return;
    const ok = await onSaveCurrent(defDraft.trim(), memDraft.trim());
    if (!ok) return;
    setIdx(idx - 1);
  };

  const handleNextItem = async () => {
    const ok = await onSaveCurrent(defDraft.trim(), memDraft.trim());
    if (!ok) return;
    if (idx + 1 >= total) {
      onNextStep();
      return;
    }
    setIdx(idx + 1);
  };

  if (isNormalizing) {
    return (
      <section className="space-y-4" data-step-visible="2">
        <Card className="bg-card/60">
          <CardContent className="py-12 flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{s.normalizing}</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4" data-step-visible="2">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <Button variant="secondary" size="sm" onClick={onPrevStep}>{s.back}</Button>
          <span className="text-sm text-muted-foreground">{idx + 1}/{total}</span>
        </div>
        <Progress value={Math.round((idx + 1) / total * 100)} />
        <div className="flex items-center justify-end text-xs text-muted-foreground">
          {session?.id && <span className="opacity-70">{s.sessionLabel}{session.id.slice(0, 8)}...</span>}
        </div>
      </header>

      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="text-lg font-light tracking-wide text-center">{current?.job_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">{s.definitionLabel}</p>
            <Textarea
              value={defDraft}
              onChange={e => setDefDraft(e.target.value)}
              placeholder={s.definitionPlaceholder}
              className="min-h-28 bg-transparent"
            />
          </div>
          <div>
            <p className="mb-2 text-sm text-muted-foreground">{s.memoryLabel}</p>
            <Textarea
              value={memDraft}
              onChange={e => setMemDraft(e.target.value)}
              placeholder={s.memoryPlaceholder}
              className="min-h-36 bg-transparent"
            />
          </div>
          <div className="flex items-center justify-between">
            <Button variant="secondary" onClick={handlePrevItem} disabled={idx === 0}>{s.prev}</Button>
            <Button
              onClick={handleNextItem}
              disabled={!defDraft.trim() || !memDraft.trim()}
            >
              {idx + 1 >= total ? s.review : s.next}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onPrevStep}>{s.step1}</Button>
        <Button onClick={onNextStep} disabled={!canGoStep3}>{s.nextStep}</Button>
      </div>
    </section>
  );
};
