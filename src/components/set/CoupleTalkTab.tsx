import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { C, alpha } from '@/lib/colors';
import { useSetTranslations } from '@/hooks/useTranslation';
import {
  useCoupleTalkSession,
  useCoupleTalkCards,
  useCoupleTalkAnswers,
} from '@/hooks/useCoupleTalk';
import { DeckSelector } from '@/components/coupletalk/DeckSelector';
import { CardFlip } from '@/components/coupletalk/CardFlip';
import { AnswerPanel } from '@/components/coupletalk/AnswerPanel';
import { PartnerInvite } from '@/components/coupletalk/PartnerInvite';
import { SexDeckUnlock } from '@/components/coupletalk/SexDeckUnlock';
import type { CoupleTalkCategory } from '@/integrations/supabase/veilor-types';

const CATEGORY_COLOR: Record<CoupleTalkCategory, string> = {
  story:  C.amber,
  heart:  '#9B8FD4',
  future: '#6BAE8A',
  desire: '#D4836A',
  sex:    '#C4748A',
};

type View = 'invite' | 'deck' | 'card' | 'sex-unlock';

export default function CoupleTalkTab() {
  const { user } = useAuth();
  const set = useSetTranslations();
  const { data: session, isLoading } = useCoupleTalkSession();

  const [view, setView] = useState<View>('deck');
  const [selectedCategory, setSelectedCategory] = useState<CoupleTalkCategory | null>(null);
  const [cardIndex, setCardIndex] = useState(0);

  const { data: cards = [] } = useCoupleTalkCards(
    view === 'card' ? selectedCategory : null,
  );
  const currentCard = cards[cardIndex] ?? null;

  const { data: cardAnswers = [] } = useCoupleTalkAnswers(session?.id, currentCard?.id);

  const isConnected = !!(session?.user_b_id);
  const isUserA = session?.user_a_id === user?.id;
  const partnerId = session
    ? isUserA
      ? session.user_b_id ?? null
      : session.user_a_id
    : null;
  const sexUnlocked = !!(session?.sex_deck_consent_a && session?.sex_deck_consent_b);

  const handleSelectDeck = (category: CoupleTalkCategory) => {
    setSelectedCategory(category);
    setCardIndex(0);
    setView('card');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <div
          style={{
            width: 22, height: 22, borderRadius: '50%',
            border: `2px solid ${C.amber}`, borderTopColor: 'transparent',
          }}
          className="animate-spin"
        />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* 섹션 헤더 */}
      <div style={{
        padding: '14px 20px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${C.border2}`,
        marginBottom: 16,
      }}>
        <div>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400, fontSize: 20, color: C.text, lineHeight: 1,
          }}>
            US
          </span>
          <p style={{ fontSize: 10, color: C.text4, marginTop: 2 }}>{set.coupleTalk.subtitle}</p>
        </div>
        {isConnected && (
          <div style={{
            fontSize: 10, color: C.amber,
            background: alpha(C.amber, 0.12),
            border: `1px solid ${alpha(C.amber, 0.25)}`,
            borderRadius: 8, padding: '4px 8px',
          }}>
            {set.coupleTalk.connected}
          </div>
        )}
      </div>

      {/* 파트너 미연결 */}
      {!isConnected && (
        <PartnerInvite
          existingSession={(!session?.user_b_id && isUserA && session) ? session : null}
        />
      )}

      {/* 파트너 연결된 상태 */}
      {isConnected && session && user && (
        <>
          {view === 'deck' && (
            <DeckSelector
              onSelect={handleSelectDeck}
              sexUnlocked={sexUnlocked}
              onSexLockClick={() => setView('sex-unlock')}
            />
          )}

          {view === 'card' && selectedCategory && (
            <>
              <CardFlip
                cards={cards}
                currentIndex={cardIndex}
                onIndexChange={setCardIndex}
                onBack={() => setView('deck')}
              />
              {currentCard && (
                <AnswerPanel
                  sessionId={session.id}
                  cardId={currentCard.id}
                  currentUserId={user.id}
                  partnerId={partnerId}
                  answers={cardAnswers}
                  cardColor={CATEGORY_COLOR[currentCard.category]}
                />
              )}
            </>
          )}

          {view === 'sex-unlock' && (
            <SexDeckUnlock
              session={session}
              currentUserId={user.id}
              onBack={() => setView('deck')}
            />
          )}
        </>
      )}
    </div>
  );
}
