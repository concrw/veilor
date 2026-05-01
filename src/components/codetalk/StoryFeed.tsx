import { useState, useMemo } from 'react';
import { C, alpha } from '@/lib/colors';
import { KEYWORD_MAP, getParticipantCount, getVirtualFeedUpToDay, getVirtualResonances } from '@/lib/virtualCodetalk';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    todayTab: '오늘의 이야기',
    pastTab: '지난 이야기',
    storyAbout: (kw: string) => `"${kw}" 에 대한 이야기`,
    participantCount: (n: number) => `${n}명 참여`,
    anon: '익명',
    defLabel: '정의',
    imprintLabel: '각인',
    rootLabel: '뿌리',
    noTodayStory: '아직 오늘의 이야기가 없어요',
    noTodayStoryDesc: '먼저 기록하고, 다른 사람들의 정의를 확인해보세요',
    pastDayRange: (end: number) => `DAY 1~${end}의 이야기 (최근 7일)`,
    noPastStory: 'DAY 2부터 이전 이야기를 볼 수 있어요',
    feedLocked: '오전 6시에 오늘의 이야기가 공개됩니다',
    feedLockedDesc: '다른 사람들의 정의가 여기에 나타나요',
    yesterdayKeyword: (kw: string) => `어제의 키워드: ${kw}`,
    participantsLeft: (n: number, nextDay: number, isLast: boolean) =>
      `총 ${n}명이 자신만의 정의를 남겼어요.${isLast ? ' 100일의 여정이 마무리에 가까워지고 있어요.' : ` 내일은 DAY ${nextDay}의 키워드가 기다리고 있습니다.`}`,
  },
  en: {
    todayTab: "Today's Stories",
    pastTab: 'Past Stories',
    storyAbout: (kw: string) => `Stories about "${kw}"`,
    participantCount: (n: number) => `${n} participants`,
    anon: 'Anonymous',
    defLabel: 'Definition',
    imprintLabel: 'Imprint',
    rootLabel: 'Root',
    noTodayStory: "No stories yet today",
    noTodayStoryDesc: 'Be the first to write, then check others\' definitions',
    pastDayRange: (end: number) => `DAY 1–${end} stories (last 7 days)`,
    noPastStory: 'Past stories are available from DAY 2',
    feedLocked: "Today's stories open at 6 AM",
    feedLockedDesc: "Other people's definitions will appear here",
    yesterdayKeyword: (kw: string) => `Yesterday's keyword: ${kw}`,
    participantsLeft: (n: number, nextDay: number, isLast: boolean) =>
      `${n} people left their own definitions.${isLast ? ' The 100-day journey is nearing its end.' : ` Tomorrow, DAY ${nextDay}'s keyword awaits.`}`,
  },
} as const;

interface FeedEntry {
  anon_alias?: string;
  created_at: string;
  definition?: string;
  imprinting_moment?: string;
  root_cause?: string;
  is_virtual?: boolean;
}

interface StoryFeedProps {
  keyword: { keyword?: string; day_number?: number } | null | undefined;
  currentDay: number;
  feedOpen: boolean;
  publicFeed: FeedEntry[] | undefined;
  todayEntry: FeedEntry | null | undefined;
  userId: string | undefined;
}

export function StoryFeed({ keyword, currentDay, feedOpen, publicFeed, todayEntry, userId }: StoryFeedProps) {
  const [feedTab, setFeedTab] = useState<'today' | 'past'>('today');
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const pastDayFeed = useMemo(() => {
    if (!feedOpen || currentDay <= 1) return [];
    return getVirtualFeedUpToDay(currentDay, 15);
  }, [feedOpen, currentDay]);

  return (
    <>
      {/* 퍼블릭스토리 피드 */}
      {feedOpen ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFeedTab('today')}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                feedTab === 'today' ? 'text-white' : 'text-muted-foreground bg-muted'
              }`}
              style={feedTab === 'today' ? { backgroundColor: C.amber } : undefined}
            >
              {s.todayTab}
            </button>
            <button
              onClick={() => setFeedTab('past')}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                feedTab === 'past' ? 'text-white' : 'text-muted-foreground bg-muted'
              }`}
              style={feedTab === 'past' ? { backgroundColor: C.frost } : undefined}
            >
              {s.pastTab}
            </button>
          </div>

          {feedTab === 'today' ? (
            publicFeed && publicFeed.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {s.storyAbout(keyword?.keyword ?? '')}
                  </p>
                  <span className="text-xs text-muted-foreground">{s.participantCount(publicFeed.length)}</span>
                </div>
                {publicFeed.map((e: FeedEntry, i: number) => {
                  const resonances = !e.is_virtual
                    ? getVirtualResonances(keyword?.day_number ?? 1, i, 2)
                    : [];
                  return (
                    <div key={i} className="space-y-1">
                      <div className="bg-card border rounded-xl p-4 space-y-2"
                        style={{ borderLeftWidth: 3, borderLeftColor: e.is_virtual ? C.frost : C.amber }}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium" style={{ color: e.is_virtual ? C.frost : C.amber }}>
                            {e.anon_alias ?? s.anon}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(e.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {e.definition && (
                            <div>
                              <span className="text-[10px] text-muted-foreground">{s.defLabel}</span>
                              <p className="text-sm leading-relaxed line-clamp-2">{e.definition}</p>
                            </div>
                          )}
                          {e.imprinting_moment && (
                            <div>
                              <span className="text-[10px] text-muted-foreground">{s.imprintLabel}</span>
                              <p className="text-sm leading-relaxed line-clamp-2 text-muted-foreground">{e.imprinting_moment}</p>
                            </div>
                          )}
                          {e.root_cause && (
                            <div>
                              <span className="text-[10px] text-muted-foreground">{s.rootLabel}</span>
                              <p className="text-sm leading-relaxed line-clamp-2 text-muted-foreground">{e.root_cause}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {resonances.length > 0 && (
                        <div className="pl-3 space-y-1">
                          {resonances.map((r, ri) => (
                            <div key={ri} className="flex items-start gap-2 py-1 px-3 rounded-lg"
                              style={{ backgroundColor: alpha(C.frost, 0.06) }}>
                              <span className="text-[10px] font-medium shrink-0 mt-0.5" style={{ color: C.frost }}>
                                {r.anon_alias}
                              </span>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{r.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-card border rounded-xl p-4 text-center space-y-1">
                <p className="text-xs font-medium">{s.noTodayStory}</p>
                <p className="text-xs text-muted-foreground">{s.noTodayStoryDesc}</p>
              </div>
            )
          ) : (
            pastDayFeed.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {s.pastDayRange(currentDay - 1)}
                </p>
                {pastDayFeed.map((e, i) => (
                  <div key={i} className="bg-card border rounded-xl p-4 space-y-2"
                    style={{ borderLeftWidth: 3, borderLeftColor: C.frost }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: alpha(C.frost, 0.15), color: C.frost }}>
                          DAY {e.day_number}
                        </span>
                        <span className="text-xs font-medium" style={{ color: C.frost }}>
                          {e.anon_alias}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{e.keyword}</span>
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-3">{e.definition}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground">{s.noPastStory}</p>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="bg-card border rounded-xl p-4 text-center space-y-1">
          <p className="text-xs font-medium">{s.feedLocked}</p>
          <p className="text-xs text-muted-foreground">{s.feedLockedDesc}</p>
        </div>
      )}

      {/* 어제의 하이라이트 넛지 */}
      {todayEntry && currentDay > 1 && (
        <div className="border rounded-xl p-4 space-y-2"
          style={{ backgroundColor: alpha(C.frost, 0.05), borderColor: alpha(C.frost, 0.2) }}>
          <p className="text-xs font-medium" style={{ color: C.frost }}>
            {s.yesterdayKeyword(KEYWORD_MAP[currentDay - 1] ?? '—')}
          </p>
          <p className="text-sm text-muted-foreground">
            {s.participantsLeft(
              getParticipantCount(currentDay - 1) + Math.floor(Math.random() * 3),
              currentDay + 1,
              currentDay >= 100
            )}
          </p>
        </div>
      )}
    </>
  );
}
