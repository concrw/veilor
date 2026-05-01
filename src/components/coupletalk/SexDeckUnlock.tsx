import { ShieldCheck, Lock } from 'lucide-react';
import { C, alpha } from '@/lib/colors';
import { useLanguageContext } from '@/context/LanguageContext';
import { useConsentSexDeck } from '@/hooks/useCoupleTalk';
import type { CoupleTalkSession } from '@/integrations/supabase/veilor-types';

const SEX_COLOR = '#C4748A';

const S = {
  ko: {
    backButton: '← 덱 선택으로',
    titleUnlocked: '🫦 섹스 이야기 덱이 열렸어요',
    titleLocked: '🫦 섹스 이야기 잠금 해제',
    description: '이 카드 덱은 두 사람 모두의 동의가 필요해요.\n편안할 때 언제든 동의할 수 있어요.',
    me: '나',
    partner: '파트너',
    consented: '동의 ✓',
    notConsented: '미동의',
    processing: '처리 중...',
    agreeButton: '나는 동의해요',
    waitingPartner: '파트너의 동의를 기다리고 있어요',
    safetyNotice: '이 카드 덱의 질문들은 성적인 주제를 다룹니다. 언제든 대화를 멈출 수 있고, 불편한 질문은 건너뛰어도 괜찮아요. 두 사람의 경계가 항상 우선입니다.',
  },
  en: {
    backButton: '← Back to decks',
    titleUnlocked: '🫦 Sex Talk deck is now unlocked',
    titleLocked: '🫦 Unlock Sex Talk',
    description: 'This deck requires consent from both partners.\nYou can agree whenever you feel comfortable.',
    me: 'Me',
    partner: 'Partner',
    consented: 'Agreed ✓',
    notConsented: 'Not agreed',
    processing: 'Processing...',
    agreeButton: 'I agree',
    waitingPartner: 'Waiting for your partner to agree',
    safetyNotice: 'The questions in this deck cover sexual topics. You can stop the conversation at any time, and it\'s okay to skip questions that feel uncomfortable. Your boundaries always come first.',
  },
};

interface Props {
  session: CoupleTalkSession;
  currentUserId: string;
  onBack: () => void;
}

export function SexDeckUnlock({ session, currentUserId, onBack }: Props) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const consentMutation = useConsentSexDeck();
  const isUserA = session.user_a_id === currentUserId;
  const myConsent = isUserA ? session.sex_deck_consent_a : session.sex_deck_consent_b;
  const partnerConsent = isUserA ? session.sex_deck_consent_b : session.sex_deck_consent_a;
  const bothConsented = session.sex_deck_consent_a && session.sex_deck_consent_b;

  return (
    <div style={{ padding: '0 20px 24px' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.text3, fontSize: 12, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        {s.backButton}
      </button>

      <div
        className={bothConsented ? 'ct-unlock-glow' : ''}
        style={{
          background: alpha(SEX_COLOR, 0.06),
          border: `1px solid ${alpha(SEX_COLOR, 0.25)}`,
          borderRadius: 18, padding: '20px', textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: 14 }}>
          {bothConsented
            ? <ShieldCheck size={32} color={SEX_COLOR} style={{ margin: '0 auto' }} />
            : <Lock size={32} color={C.text4} style={{ margin: '0 auto' }} />
          }
        </div>

        <p style={{
          fontSize: 16, fontFamily: "'Cormorant Garamond', serif",
          color: C.text, fontWeight: 400, marginBottom: 8,
        }}>
          {bothConsented ? s.titleUnlocked : s.titleLocked}
        </p>

        {!bothConsented && (
          <p style={{ fontSize: 12, color: C.text3, lineHeight: 1.65, marginBottom: 20 }}>
            {s.description.split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
        )}

        {/* 동의 현황 */}
        <div
          className={bothConsented ? 'ct-consent-pop' : ''}
          style={{ display: 'flex', gap: 10, marginBottom: bothConsented ? 0 : 16 }}
        >
          {([
            [s.me, myConsent],
            [s.partner, partnerConsent],
          ] as [string, boolean][]).map(([label, consented]) => (
            <div key={label} style={{
              flex: 1, padding: '10px', borderRadius: 10,
              background: consented ? alpha(SEX_COLOR, 0.12) : C.bg3,
              border: `1px solid ${consented ? alpha(SEX_COLOR, 0.3) : C.border}`,
            }}>
              <p style={{ fontSize: 10, color: consented ? SEX_COLOR : C.text4 }}>{label}</p>
              <p style={{ fontSize: 13, color: consented ? SEX_COLOR : C.text3, marginTop: 2 }}>
                {consented ? s.consented : s.notConsented}
              </p>
            </div>
          ))}
        </div>

        {!myConsent && (
          <button
            onClick={() => consentMutation.mutate({ sessionId: session.id, isUserA })}
            disabled={consentMutation.isPending}
            style={{
              width: '100%', padding: '12px', marginTop: 4,
              background: alpha(SEX_COLOR, 0.14),
              border: `1px solid ${alpha(SEX_COLOR, 0.38)}`,
              borderRadius: 12, color: SEX_COLOR,
              fontSize: 13, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {consentMutation.isPending ? s.processing : s.agreeButton}
          </button>
        )}

        {myConsent && !partnerConsent && (
          <p style={{ fontSize: 11, color: C.text4, marginTop: 10 }}>
            {s.waitingPartner}
          </p>
        )}
      </div>

      {/* 안전 안내 */}
      <div style={{
        marginTop: 14, background: C.bg3,
        border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 14px',
      }}>
        <p style={{ fontSize: 11, color: C.text4, lineHeight: 1.7 }}>
          {s.safetyNotice}
        </p>
      </div>
    </div>
  );
}
