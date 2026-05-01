import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, RotateCcw } from 'lucide-react';
import { C, alpha } from '@/lib/colors';
import { useLanguageContext } from '@/context/LanguageContext';
import type { CoupleTalkCard, CoupleTalkCategory } from '@/integrations/supabase/veilor-types';

const S = {
  ko: {
    backButton: '덱 선택',
    backAriaLabel: '덱 선택으로 돌아가기',
    tapToSee: '탭해서 질문 보기',
    tapToClose: '탭해서 카드 닫기',
    flipAriaOpen: '카드 뒤집어 질문 보기',
    flipAriaClose: '카드 앞으로 돌리기',
    prev: '이전',
    next: '다음 카드',
    prevAriaLabel: '이전 카드',
    nextAriaLabel: '다음 카드',
    categoryLabels: {
      story:  '우리의 이야기',
      heart:  '마음속 이야기',
      future: '미래 이야기',
      desire: '욕망 이야기',
      sex:    '섹스 이야기',
    } as Record<CoupleTalkCategory, string>,
  },
  en: {
    backButton: 'Decks',
    backAriaLabel: 'Back to deck selection',
    tapToSee: 'Tap to see the question',
    tapToClose: 'Tap to close the card',
    flipAriaOpen: 'Flip card to see question',
    flipAriaClose: 'Flip card back',
    prev: 'Prev',
    next: 'Next Card',
    prevAriaLabel: 'Previous card',
    nextAriaLabel: 'Next card',
    categoryLabels: {
      story:  'Our Story',
      heart:  'Heart Talk',
      future: 'Future Talk',
      desire: 'Desire Talk',
      sex:    'Sex Talk',
    } as Record<CoupleTalkCategory, string>,
  },
};

const CATEGORY_COLOR: Record<CoupleTalkCategory, string> = {
  story:  C.amber,
  heart:  '#9B8FD4',
  future: '#6BAE8A',
  desire: '#D4836A',
  sex:    '#C4748A',
};

interface Props {
  cards: CoupleTalkCard[];
  currentIndex: number;
  onIndexChange: (idx: number) => void;
  onBack: () => void;
}

export function CardFlip({ cards, currentIndex, onIndexChange, onBack }: Props) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [flipped, setFlipped] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const card = cards[currentIndex];
  if (!card) return null;

  const color = CATEGORY_COLOR[card.category];
  const total = cards.length;

  const navigate = (next: number) => {
    setFlipped(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onIndexChange(next), 300);
  };

  return (
    <div style={{ padding: '0 20px 24px' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.text3, display: 'flex', alignItems: 'center', gap: 4 }}
          aria-label={s.backAriaLabel}
        >
          <ChevronLeft size={16} />
          <span style={{ fontSize: 11 }}>{s.backButton}</span>
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: 11, color }}>{s.categoryLabels[card.category]}</span>
        </div>
        <span style={{ fontSize: 11, color: C.text4 }}>{currentIndex + 1} / {total}</span>
      </div>

      {/* 진행 바 */}
      <div style={{ height: 2, background: C.border, borderRadius: 2, marginBottom: 18 }}>
        <div style={{
          height: 2, borderRadius: 2, background: color,
          width: `${((currentIndex + 1) / total) * 100}%`,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* 카드 플립 영역 */}
      <div
        className="ct-card-scene"
        style={{ height: 260, marginBottom: 16, cursor: 'pointer' }}
        onClick={() => setFlipped(f => !f)}
        role="button"
        aria-label={flipped ? s.flipAriaClose : s.flipAriaOpen}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFlipped(f => !f); }}
      >
        <div className={`ct-card-inner${flipped ? ' flipped' : ''}`} style={{ height: '100%' }}>
          {/* 앞면 */}
          <div
            className="ct-card-face"
            style={{
              background: alpha(color, 0.08),
              border: `1px solid ${alpha(color, 0.28)}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: alpha(color, 0.14),
              border: `1px solid ${alpha(color, 0.32)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HelpCircle size={28} color={color} />
            </div>
            <p style={{ fontSize: 12, color: C.text3 }}>{s.tapToSee}</p>
          </div>

          {/* 뒷면 */}
          <div
            className="ct-card-face ct-card-back"
            style={{
              background: C.bg2,
              border: `1px solid ${alpha(color, 0.35)}`,
              borderLeft: `3px solid ${color}`,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: '24px 20px', gap: 16,
            }}
          >
            <p style={{
              fontSize: 16, lineHeight: 1.65, color: C.text,
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 400,
            }}>
              {card.question_text}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <RotateCcw size={12} color={C.text4} />
              <span style={{ fontSize: 10, color: C.text4 }}>{s.tapToClose}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 이전 / 다음 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate(Math.max(currentIndex - 1, 0))}
          disabled={currentIndex === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none',
            cursor: currentIndex === 0 ? 'default' : 'pointer',
            color: currentIndex === 0 ? C.text5 : C.text3, fontSize: 12,
          }}
          aria-label={s.prevAriaLabel}
        >
          <ChevronLeft size={16} />
          {s.prev}
        </button>

        <button
          onClick={() => navigate(Math.min(currentIndex + 1, total - 1))}
          disabled={currentIndex === total - 1}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: currentIndex === total - 1 ? C.bg3 : alpha(color, 0.14),
            border: `1px solid ${currentIndex === total - 1 ? C.border : alpha(color, 0.3)}`,
            borderRadius: 10, padding: '7px 14px',
            cursor: currentIndex === total - 1 ? 'default' : 'pointer',
            color: currentIndex === total - 1 ? C.text4 : color, fontSize: 12,
          }}
          aria-label={s.nextAriaLabel}
        >
          {s.next}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
