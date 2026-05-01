import { C, alpha } from '@/lib/colors';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    milestoneLabels: ['탐색', '발견', '직면', '재정의', '완성'] as const,
    milestoneMessages: {
      90: '마지막 구간입니다. 100일의 여정이 하나로 모이고 있어요.',
      75: '재정의 구간 — 당신만의 언어가 형태를 갖추고 있어요.',
      50: '직면 구간 — 더 깊은 곳으로 향하고 있어요.',
      25: '발견 구간 — 반복되는 패턴이 보이기 시작해요.',
      10: '탐색 구간 — 자기 언어의 윤곽이 드러나고 있어요.',
    } as Record<number, string>,
    streakDays: (n: number) => `${n}일 연속`,
    complete: (n: number) => `${n}% 완료`,
    todayKeyword: '오늘의 키워드',
  },
  en: {
    milestoneLabels: ['Explore', 'Discover', 'Confront', 'Redefine', 'Complete'] as const,
    milestoneMessages: {
      90: 'Final stretch. The 100-day journey is converging.',
      75: 'Redefine phase — your own language is taking shape.',
      50: 'Confront phase — heading into deeper territory.',
      25: 'Discover phase — recurring patterns are emerging.',
      10: 'Explore phase — the outline of your inner language is appearing.',
    } as Record<number, string>,
    streakDays: (n: number) => `${n}-day streak`,
    complete: (n: number) => `${n}% done`,
    todayKeyword: "Today's keyword",
  },
} as const;

const MILESTONE_DAYS = [10, 25, 50, 75, 100] as const;

interface KeywordCardProps {
  keyword: { day_number?: number; keyword?: string; description?: string } | null | undefined;
  streakCount: number;
  streakMessage: string | null;
}

function getMilestoneMessage(day: number, msgs: Record<number, string>): string | null {
  if (day >= 90) return msgs[90] ?? null;
  if (day >= 75) return msgs[75] ?? null;
  if (day >= 50) return msgs[50] ?? null;
  if (day >= 25) return msgs[25] ?? null;
  if (day >= 10) return msgs[10] ?? null;
  return null;
}

export function KeywordCard({ keyword, streakCount, streakMessage }: KeywordCardProps) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const dayNumber = keyword?.day_number ?? 1;

  const MILESTONES = MILESTONE_DAYS.map((day, i) => ({
    day,
    label: s.milestoneLabels[i],
    color: [C.amber, C.amber, C.amberGold, C.amberGold, C.amberDeep][i],
  }));

  return (
    <>
      {/* streak 넛지 메시지 */}
      {streakMessage && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
          <p className="text-xs text-primary font-medium">{streakMessage}</p>
        </div>
      )}

      {/* 오늘의 키워드 + 100일 마일스톤 진행도 */}
      <div className="bg-card border rounded-2xl p-5 space-y-4">
        {/* 마일스톤 프로그레스 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: C.amber }}>
                DAY {dayNumber}
              </span>
              {streakCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: alpha(C.amber, 0.15), color: C.amber }}>
                  {s.streakDays(streakCount)}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{s.complete(dayNumber)}</span>
          </div>

          {/* 마일스톤 트랙 */}
          <div className="relative">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-2 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${(dayNumber / 100) * 100}%`,
                  background: `linear-gradient(90deg, ${C.amber}, ${C.amberGold}, ${C.amberDeep})`,
                }} />
            </div>
            <div className="absolute top-0 left-0 right-0 h-2 pointer-events-none">
              {MILESTONES.map(m => (
                <div key={m.day} className="absolute top-1/2 -translate-y-1/2" style={{ left: `${(m.day / 100) * 100}%` }}>
                  <div className={`w-2.5 h-2.5 rounded-full border-2 border-background -ml-1.25 ${dayNumber >= m.day ? '' : 'opacity-40'}`}
                    style={{ backgroundColor: m.color }} />
                </div>
              ))}
            </div>
          </div>

          {/* 마일스톤 라벨 */}
          <div className="flex justify-between px-0.5">
            {MILESTONES.map(m => (
              <span key={m.day}
                className={`text-[10px] ${dayNumber >= m.day ? 'font-medium' : 'text-muted-foreground'}`}
                style={{ color: dayNumber >= m.day ? m.color : undefined }}>
                {m.label}
              </span>
            ))}
          </div>
        </div>

        {/* 마일스톤 구간 메시지 */}
        {getMilestoneMessage(dayNumber, s.milestoneMessages) && (
          <p className="text-xs text-muted-foreground italic">
            {getMilestoneMessage(dayNumber, s.milestoneMessages)}
          </p>
        )}

        {/* 오늘의 키워드 */}
        <div className="pt-1 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-1">{s.todayKeyword}</p>
          <h2 className="text-2xl font-bold" style={{ color: C.amber }}>
            {keyword?.keyword ?? '—'}
          </h2>
          {keyword?.description && (
            <p className="text-sm text-muted-foreground mt-1">{keyword.description}</p>
          )}
        </div>
      </div>
    </>
  );
}
