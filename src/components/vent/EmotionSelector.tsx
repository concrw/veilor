// EmotionSelector — emotion grid + quick cards + recent emotions + resume session
import { C, alpha } from '@/lib/colors';
import { useVentTranslations } from '@/hooks/useTranslation';

const QUICK_CARD_STYLE = { padding: '11px 14px', background: C.bg2, border: `1px solid ${C.border}` } as const;

const EMO_ICONS: Record<string, JSX.Element> = {
  anxious:  <><circle cx="12" cy="12" r="10"/><path d="M8 15s1-2 4-2 4 2 4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/><path d="M8.5 8.5c.5-1 1.5-1.5 2.5-1.5"/><path d="M15.5 8.5c-.5-1-1.5-1.5-2.5-1.5"/></>,
  sad:      <><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>,
  angry:    <><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><path d="M8.5 8.5l2 1.5"/><path d="M15.5 8.5l-2 1.5"/></>,
  confused: <><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  lonely:   <><circle cx="12" cy="12" r="10"/><path d="M8 15h.01M12 15h.01M16 15h.01"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>,
  numb:     <><circle cx="12" cy="12" r="10"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>,
  tired:    <><circle cx="12" cy="12" r="10"/><path d="M8 13s1 2 4 2 4-2 4-2"/><path d="M8 9l2 1"/><path d="M16 9l-2 1"/></>,
  hurt:     <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/><line x1="12" y1="10" x2="12" y2="14"/></>,
  calm:     <><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>,
};

function EmoIcon({ svg, active }: { svg: string; active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? C.amber : C.text3} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      {EMO_ICONS[svg]}
    </svg>
  );
}

interface EmotionSelectorProps {
  greeting: { title: string; placeholder: string };
  curEmo: string;
  lastSession: { emotion: string; turn_count: number } | null;
  recentEmotions: { emotion: string; created_at: string }[] | null;
  emotions: { label: string; svg: string }[];
  quickCards: { key: string; text: string; emo: string }[];
  onPickEmotion: (emo: string) => void;
  onResumeSession: () => void;
}

export default function EmotionSelector({
  greeting, curEmo, lastSession, recentEmotions,
  emotions, quickCards, onPickEmotion, onResumeSession,
}: EmotionSelectorProps) {
  const vent = useVentTranslations();

  return (
    <div className="flex flex-col overflow-y-auto flex-1" style={{ padding: '18px 22px 12px', scrollbarWidth: 'none' }}>
      <h2 className="text-[26px] font-light leading-[1.2] mb-1 flex-shrink-0" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: C.text }}>{greeting.title}</h2>
      <p className="text-[11px] font-light mb-3 flex-shrink-0" style={{ color: C.text4 }}>{vent.selector.prompt}</p>

      {lastSession && (
        <div className="rounded-2xl flex-shrink-0 mb-3 space-y-2" style={{ background: C.bg2, border: `1px solid ${C.border}`, padding: '14px 15px' }}>
          <p className="text-[10px] font-light" style={{ color: C.text4 }}>{vent.selector.resumeHint}</p>
          <p className="text-[13px] font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text }}>
            {lastSession.emotion} — {lastSession.turn_count}{vent.selector.turns}
          </p>
          <button
            onClick={onResumeSession}
            className="text-[11px] font-light px-4 py-[6px] rounded-full cursor-pointer transition-all"
            style={{ border: `1px solid ${alpha(C.amber, 0.3)}`, color: C.amber, background: alpha(C.amber, 0.05) }}
          >
            {vent.selector.resumeButton}
          </button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 flex-shrink-0 mb-3">
        {emotions.map(({ label, svg }) => {
          const active = curEmo === label;
          const displayLabel = (vent.emotions as Record<string, string>)[svg] ?? label;
          return (
            <button key={label} onClick={() => onPickEmotion(label)}
              className="flex flex-col items-center gap-[5px] rounded-[10px] cursor-pointer transition-all"
              style={{
                padding: '10px 6px',
                background: active ? alpha(C.amber, 0.06) : C.bg2,
                border: `1px solid ${active ? alpha(C.amber, 0.4) : C.border}`,
              }}>
              <EmoIcon svg={svg} active={active} />
              <span className="text-[10px] font-light text-center leading-[1.3] break-keep transition-colors"
                style={{ color: active ? C.amber : C.text3 }}>
                {displayLabel}
              </span>
            </button>
          );
        })}
      </div>

      {recentEmotions && recentEmotions.length > 0 && (
        <div className="flex items-center gap-1 px-1 flex-shrink-0 mb-3">
          <span className="text-[9px] mr-1" style={{ color: C.text5 }}>{vent.selector.recentLabel}</span>
          {recentEmotions.map((e, i) => {
            const svg = emotions.find(em => em.label === e.emotion)?.svg ?? e.emotion;
            const displayEmo = (vent.emotions as Record<string, string>)[svg] ?? e.emotion;
            return (
              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: C.bg2, border: `1px solid ${C.border}`, color: C.text4 }}>
                {displayEmo}
              </span>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-[7px] flex-shrink-0">
        <p className="text-[10px] font-light mb-[2px]" style={{ color: C.text5, letterSpacing: '.08em', textTransform: 'uppercase' }}>{vent.selector.quickCardsTitle}</p>
        {quickCards.map(({ key, text, emo }) => (
          <button key={key} onClick={() => onPickEmotion(emo)}
            className="rounded-[10px] flex items-center justify-between gap-2 cursor-pointer transition-all text-left"
            style={QUICK_CARD_STYLE}>
            <span className="text-[14px] font-light leading-[1.5] flex-1 break-keep" style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text3 }}>
              {(vent.quickCards as Record<string, string>)[key] ?? text}
            </span>
            <span className="text-[12px] flex-shrink-0" style={{ color: C.text5 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
