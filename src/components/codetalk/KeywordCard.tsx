import { C, alpha } from '@/lib/colors';

const MILESTONES = [
  { day: 10, label: '탐색', color: C.amber },
  { day: 25, label: '발견', color: C.amber },
  { day: 50, label: '직면', color: C.amberGold },
  { day: 75, label: '재정의', color: C.amberGold },
  { day: 100, label: '완성', color: C.amberDeep },
] as const;

function getMilestoneMessage(day: number): string | null {
  if (day >= 90) return '마지막 구간입니다. 100일의 여정이 하나로 모이고 있어요.';
  if (day >= 75) return '재정의 구간 — 당신만의 언어가 형태를 갖추고 있어요.';
  if (day >= 50) return '직면 구간 — 더 깊은 곳으로 향하고 있어요.';
  if (day >= 25) return '발견 구간 — 반복되는 패턴이 보이기 시작해요.';
  if (day >= 10) return '탐색 구간 — 자기 언어의 윤곽이 드러나고 있어요.';
  return null;
}

interface KeywordCardProps {
  keyword: { day_number?: number; keyword?: string; description?: string } | null | undefined;
  streakCount: number;
  streakMessage: string | null;
}

export function KeywordCard({ keyword, streakCount, streakMessage }: KeywordCardProps) {
  const dayNumber = keyword?.day_number ?? 1;

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
                  {streakCount}일 연속
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{dayNumber}% 완료</span>
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
        {getMilestoneMessage(dayNumber) && (
          <p className="text-xs text-muted-foreground italic">
            {getMilestoneMessage(dayNumber)}
          </p>
        )}

        {/* 오늘의 키워드 */}
        <div className="pt-1 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-1">오늘의 키워드</p>
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
