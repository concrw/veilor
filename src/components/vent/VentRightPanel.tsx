import { C } from '@/lib/colors';

type RecentEmotion = { emotion: string; created_at: string };
type QuickCard = { key: string; text: string; emo: string };
type CommGroup = { title: string; desc: string; count: number | string };

interface VentRightPanelProps {
  recentEmotions: RecentEmotion[] | null | undefined;
  phase: 'select' | 'chat';
  QUICK_CARDS: QuickCard[];
  COMM_GROUPS: CommGroup[];
  vent: {
    selector: { recentLabel: string; quickCardsTitle: string };
    community: { subtitle: string; people: string };
  };
  onPickEmotion: (emo: string) => void;
}

export default function VentRightPanel({
  recentEmotions,
  phase,
  QUICK_CARDS,
  COMM_GROUPS,
  vent,
  onPickEmotion,
}: VentRightPanelProps) {
  return (
    <aside
      className="hidden lg:flex flex-col gap-5 overflow-y-auto flex-shrink-0"
      style={{ width: 280, borderLeft: `1px solid ${C.border2}`, padding: '20px 16px', background: C.bg }}
    >
      {recentEmotions && recentEmotions.length > 0 && (
        <div>
          <p className="text-[11px] mb-2" style={{ color: C.text4, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.04em' }}>
            {vent.selector.recentLabel}
          </p>
          <div className="flex flex-col gap-1.5">
            {recentEmotions.map((e, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-[8px]"
                style={{ background: C.bg2 }}>
                <span className="text-[11px] font-light" style={{ color: C.text2, fontFamily: "'DM Sans', sans-serif" }}>{e.emotion}</span>
                <span className="ml-auto text-[10px]" style={{ color: C.text4 }}>
                  {new Date(e.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'select' && (
        <div>
          <p className="text-[11px] mb-2" style={{ color: C.text4, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.04em' }}>
            {vent.selector.quickCardsTitle}
          </p>
          <div className="flex flex-col gap-1.5">
            {QUICK_CARDS.map(card => (
              <button key={card.key} onClick={() => onPickEmotion(card.emo)}
                className="text-left px-3 py-2.5 rounded-[8px] transition-colors"
                style={{ background: C.bg2, border: `1px solid ${C.border2}` }}>
                <span className="text-[11px] font-light leading-relaxed" style={{ color: C.text2, fontFamily: "'DM Sans', sans-serif" }}>
                  {card.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[11px] mb-2" style={{ color: C.text4, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.04em' }}>
          {vent.community.subtitle}
        </p>
        <div className="flex flex-col gap-1.5">
          {COMM_GROUPS.map((g, i) => (
            <div key={i} className="px-3 py-2.5 rounded-[8px]" style={{ background: C.bg2 }}>
              <p className="text-[11px] font-light mb-0.5" style={{ color: C.text, fontFamily: "'DM Sans', sans-serif" }}>{g.title}</p>
              <p className="text-[10px]" style={{ color: C.text4, fontFamily: "'DM Sans', sans-serif" }}>{g.desc}</p>
              <p className="text-[10px] mt-1" style={{ color: C.amber }}>{g.count}{vent.community.people}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
