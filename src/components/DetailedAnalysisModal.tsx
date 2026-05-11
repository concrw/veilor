import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/i18n/useT";

interface Job {
  id: string;
  job_name: string;
  category: "happy" | "pain" | "neutral" | null;
  reason?: string | null;
  definition?: string | null;
  first_memory?: string | null;
}

interface DetailedAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobs: Job[];
}

type Category = "happy" | "pain" | "neutral";


const categoryColors: Record<Category, string> = {
  happy: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  pain: "bg-red-500/20 text-red-700 dark:text-red-300",
  neutral: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
};

export function DetailedAnalysisModal({ open, onOpenChange, jobs }: DetailedAnalysisModalProps) {
  const t = useT();
  const s = t.detailedAnalysis;

  const categorizedJobs = useMemo(() => jobs.filter(j => j.category !== null), [jobs]);
  const total = categorizedJobs.length;

  const byCategory = useMemo(() => ({
    happy: categorizedJobs.filter(j => j.category === "happy"),
    pain: categorizedJobs.filter(j => j.category === "pain"),
    neutral: categorizedJobs.filter(j => j.category === "neutral"),
  }), [categorizedJobs]);

  const counts = {
    happy: byCategory.happy.length,
    pain: byCategory.pain.length,
    neutral: byCategory.neutral.length,
  };

  const dominant: Category | "tie" | null = useMemo(() => {
    if (total === 0) return null;
    const max = Math.max(counts.happy, counts.pain, counts.neutral);
    const winners: Category[] = (Object.keys(counts) as Category[]).filter(c => counts[c] === max);
    if (winners.length > 1) return "tie";
    return winners[0];
  }, [counts.happy, counts.pain, counts.neutral, total]);

  const perspective = useMemo(() => {
    if (!dominant) return { title: s.noDataTitle, desc: s.noDataDesc };
    return s.perspectives[dominant];
  }, [dominant, s]);

  const percent = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  const STOPWORDS = useMemo(() => new Set([
    "의","가","이","을","를","은","는","에","에서","와","과","그리고","또한","하지만","또","등","때","수","것","들","더","그","다","로","으로","하다","했다","되다","있다","없다",
    "the","a","an","and","or","but","of","in","on","for","to","with","by","at","from","as","is","are","was","were","be","been","it","that","this","these","those","i","you","we","they"
  ]), []);

  const normalize = (s?: string) => (s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokenize = (text: string) => text
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length >= 2 && !STOPWORDS.has(t));

  const allTokens = useMemo(() => {
    const chunks = categorizedJobs.flatMap(j => [j.job_name, j.definition, j.first_memory, j.reason]);
    const joined = normalize(chunks.filter(Boolean).join(" "));
    return tokenize(joined);
  }, [categorizedJobs]);

  const topKeywords = useMemo(() => {
    const freq = new Map<string, number>();
    for (const t of allTokens) freq.set(t, (freq.get(t) || 0) + 1);
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([word, count]) => ({ word, count }));
  }, [allTokens]);

  const POSITIVE_WORDS = useMemo(() => new Set([
    "행복","즐거움","기쁨","의미","성장","몰입","흥미","재미","보람","안정","자유","도전","성취","배움","협업","공감","감사","즐겁다","좋다",
    "happy","joy","meaningful","growth","flow","interest","fun","rewarding","stable","freedom","challenge","achievement","learn","collaboration","empathy","great","good","love"
  ]), []);

  const NEGATIVE_WORDS = useMemo(() => new Set([
    "고통","힘듦","스트레스","불안","지루","반복","혼란","갈등","위험","불확실","야근","피로","소모","압박","부담","짜증","싫다",
    "pain","suffering","hard","stress","anxious","boring","repetitive","conflict","risk","uncertainty","overtime","fatigue","burnout","pressure","hate","bad"
  ]), []);

  const emotion = useMemo(() => {
    let pos = 0, neg = 0;
    for (const t of allTokens) {
      if (POSITIVE_WORDS.has(t)) pos++;
      if (NEGATIVE_WORDS.has(t)) neg++;
    }
    const categoryBoost = 2 * counts.happy - 2 * counts.pain;
    const raw = (pos - neg) + categoryBoost;
    const score = Math.max(0, Math.min(100, Math.round(50 + raw * 5)));
    const label = score > 60 ? s.emotionLabels.positive : score < 40 ? s.emotionLabels.negative : s.emotionLabels.neutral;
    return { score, label };
  }, [allTokens, counts.happy, counts.pain, POSITIVE_WORDS, NEGATIVE_WORDS, s]);

  const insights = useMemo(() => {
    const list: string[] = [];
    if (dominant && dominant in s.insightDominant) {
      list.push(s.insightDominant[dominant as keyof typeof s.insightDominant]);
    }
    list.push(s.emotionInsightFmt(emotion.label, emotion.score));
    if (topKeywords.length > 0) {
      list.push(s.keywordsInsightFmt(topKeywords.slice(0, 3).map(k => k.word).join(", ")));
    }
    return list;
  }, [dominant, emotion.label, emotion.score, topKeywords, s]);

  const actionItems = dominant && dominant in s.actions ? s.actions[dominant] : s.actions.tie;

  if (total === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{s.title}</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground">
            <p>{s.noDataDesc}</p>
            <p className="text-sm mt-2">{s.noDataHint}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{s.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="pr-3">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{perspective.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{perspective.desc}</p>
                <div className="grid grid-cols-3 gap-4">
                  {(["happy", "pain", "neutral"] as Category[]).map((c) => (
                    <div key={c} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{s.categoryLabels[c]}</span>
                        <span className="text-muted-foreground">{counts[c]} / {total} ({percent(counts[c])}%)</span>
                      </div>
                      <Progress value={percent(counts[c])} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{s.insightsTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.map((insight, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["happy", "pain", "neutral"] as Category[]).map((c) => (
                <Card key={c}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[c]}`}>
                        {s.categoryLabels[c]}
                      </span>
                      <span>{s.countSuffix(counts[c])}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {byCategory[c].map((job) => (
                          <div key={job.id} className="text-sm border border-border rounded p-2 bg-muted/20">
                            <div className="font-medium mb-1">{job.job_name}</div>
                            {job.reason && (
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {s.reasonPrefix}{job.reason}
                              </div>
                            )}
                          </div>
                        ))}
                        {byCategory[c].length === 0 && (
                          <div className="text-sm text-muted-foreground text-center py-4">
                            {s.emptyCategoryFmt}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{s.keywordsTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  {topKeywords.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{s.keywordsEmpty}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {topKeywords.map((k, idx) => (
                        <Badge
                          key={k.word}
                          variant={idx < 3 ? "default" : "secondary"}
                          className={idx < 3 ? "bg-primary/80" : ""}
                        >
                          {k.word} ({k.count})
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{s.emotionTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{s.emotionScoreLabel}</span>
                      <span className="font-medium">{emotion.score}/100</span>
                    </div>
                    <Progress value={emotion.score} className="h-3" />
                    <div className="text-center">
                      <Badge variant={emotion.score > 60 ? "default" : emotion.score < 40 ? "destructive" : "secondary"}>
                        {emotion.label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{s.actionsTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {actionItems.map((item, idx) => (
                    <div key={idx}>• {item}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
