import { Lock } from 'lucide-react';
import { C, alpha } from '@/lib/colors';
import { useLanguageContext } from '@/context/LanguageContext';
import type { CoupleTalkCategory } from '@/integrations/supabase/veilor-types';

const S = {
  ko: {
    heading: '어떤 이야기를 나눌까요?',
    subheading: '카드를 뒤집으며 대화해보세요',
    deckAriaLabel: (label: string) => `${label} 덱 선택`,
    lockHint: '커플 양쪽 동의 후 해제',
    decks: {
      story:  { label: '우리의 이야기', sublabel: '일상, 추억, 습관' },
      heart:  { label: '마음속 이야기', sublabel: '솔직한 감정, 두려움' },
      future: { label: '미래 이야기',   sublabel: '계획, 꿈, 바라는 것' },
      desire: { label: '욕망 이야기',   sublabel: '원하는 것, 경계, 설렘' },
      sex:    { label: '섹스 이야기',   sublabel: '성적 취향, 원하는 것' },
    },
  },
  en: {
    heading: 'What would you like to talk about?',
    subheading: 'Flip cards and start a conversation',
    deckAriaLabel: (label: string) => `Select ${label} deck`,
    lockHint: 'Unlocked when both partners agree',
    decks: {
      story:  { label: 'Our Story',    sublabel: 'Daily life, memories, habits' },
      heart:  { label: 'Heart Talk',   sublabel: 'Honest feelings, fears' },
      future: { label: 'Future Talk',  sublabel: 'Plans, dreams, hopes' },
      desire: { label: 'Desire Talk',  sublabel: 'Wants, boundaries, excitement' },
      sex:    { label: 'Sex Talk',     sublabel: 'Sexual preferences, desires' },
    },
  },
};

interface DeckConfig {
  category: CoupleTalkCategory;
  emoji: string;
  color: string;
}

const DECKS: DeckConfig[] = [
  { category: 'story',  emoji: '💬', color: C.amber },
  { category: 'heart',  emoji: '💭', color: '#9B8FD4' },
  { category: 'future', emoji: '🌱', color: '#6BAE8A' },
  { category: 'desire', emoji: '🔥', color: '#D4836A' },
  { category: 'sex',    emoji: '🫦', color: '#C4748A' },
];

interface Props {
  onSelect: (category: CoupleTalkCategory) => void;
  sexUnlocked: boolean;
  onSexLockClick: () => void;
}

export function DeckSelector({ onSelect, sexUnlocked, onSexLockClick }: Props) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  return (
    <div style={{ padding: '0 20px 20px' }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 18, fontFamily: "'Cormorant Garamond', serif", color: C.text, fontWeight: 400, lineHeight: 1.2 }}>
          {s.heading}
        </p>
        <p style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>{s.subheading}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {DECKS.map((deck) => {
          const isSex = deck.category === 'sex';
          const locked = isSex && !sexUnlocked;
          const deckStrings = s.decks[deck.category];

          return (
            <button
              key={deck.category}
              onClick={() => (locked ? onSexLockClick() : onSelect(deck.category))}
              aria-label={s.deckAriaLabel(deckStrings.label)}
              className="ct-card-enter"
              style={{
                gridColumn: isSex ? 'span 2' : undefined,
                background: locked ? alpha(C.bg3, 0.8) : alpha(deck.color, 0.08),
                border: `1px solid ${locked ? C.border : alpha(deck.color, 0.28)}`,
                borderRadius: 16,
                padding: isSex ? '14px 16px' : '16px 14px',
                textAlign: 'left',
                cursor: 'pointer',
                opacity: locked ? 0.75 : 1,
                display: 'flex',
                flexDirection: isSex ? 'row' : 'column',
                alignItems: isSex ? 'center' : 'flex-start',
                gap: isSex ? 12 : 0,
              }}
            >
              <span style={{ fontSize: isSex ? 22 : 24, marginBottom: isSex ? 0 : 8 }}>
                {deck.emoji}
              </span>
              <div style={{ flex: isSex ? 1 : undefined }}>
                <p style={{ fontSize: 13, fontWeight: 400, color: locked ? C.text3 : deck.color, marginBottom: 2 }}>
                  {deckStrings.label}
                </p>
                <p style={{ fontSize: 10, color: C.text4 }}>{deckStrings.sublabel}</p>
              </div>
              {locked && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={13} color={C.text4} />
                  <span style={{ fontSize: 10, color: C.text4 }}>{s.lockHint}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
