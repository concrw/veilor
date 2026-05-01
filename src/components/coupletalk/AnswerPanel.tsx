import { useState, useEffect } from 'react';
import { C, alpha } from '@/lib/colors';
import { useLanguageContext } from '@/context/LanguageContext';
import { useSaveCoupleTalkAnswer } from '@/hooks/useCoupleTalk';
import type { CoupleTalkAnswer } from '@/integrations/supabase/veilor-types';

const S = {
  ko: {
    myAnswerLabel: '나의 답변',
    editButton: '수정하기',
    placeholder: '솔직하게 적어보세요...',
    saving: '저장 중...',
    save: '저장',
    partnerAnswerLabel: '파트너의 답변',
    partnerPending: '파트너가 아직 답변하지 않았어요',
  },
  en: {
    myAnswerLabel: 'My Answer',
    editButton: 'Edit',
    placeholder: 'Be honest...',
    saving: 'Saving...',
    save: 'Save',
    partnerAnswerLabel: "Partner's Answer",
    partnerPending: 'Your partner has not answered yet',
  },
};

interface Props {
  sessionId: string;
  cardId: string;
  currentUserId: string;
  partnerId: string | null;
  answers: CoupleTalkAnswer[];
  cardColor: string;
}

export function AnswerPanel({ sessionId, cardId, currentUserId, partnerId, answers, cardColor }: Props) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const myAnswer = answers.find(a => a.user_id === currentUserId);
  const partnerAnswer = partnerId ? answers.find(a => a.user_id === partnerId) : null;

  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const saveMutation = useSaveCoupleTalkAnswer();

  // 카드나 answers가 바뀌면 상태 리셋
  useEffect(() => {
    const mine = answers.find(a => a.user_id === currentUserId);
    setText(mine?.answer_text ?? '');
    setSaved(!!mine);
  }, [cardId, answers, currentUserId]);

  const handleSave = async () => {
    if (!text.trim()) return;
    await saveMutation.mutateAsync({ sessionId, cardId, answerText: text });
    setSaved(true);
  };

  return (
    <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* 내 답변 */}
      <div style={{
        background: alpha(cardColor, 0.06),
        border: `1px solid ${alpha(cardColor, 0.2)}`,
        borderRadius: 14,
        padding: '14px 14px 10px',
      }}>
        <p style={{ fontSize: 10, color: cardColor, marginBottom: 8 }}>{s.myAnswerLabel}</p>
        {saved ? (
          <div>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{text}</p>
            <button
              onClick={() => setSaved(false)}
              style={{ fontSize: 10, color: C.text4, marginTop: 8, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {s.editButton}
            </button>
          </div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={s.placeholder}
              maxLength={500}
              rows={3}
              style={{
                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                color: C.text, fontSize: 13, lineHeight: 1.6, resize: 'none',
                fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <span style={{ fontSize: 10, color: C.text4 }}>{text.length}/500</span>
              <button
                onClick={handleSave}
                disabled={!text.trim() || saveMutation.isPending}
                style={{
                  background: text.trim() ? alpha(cardColor, 0.18) : C.bg3,
                  border: `1px solid ${text.trim() ? alpha(cardColor, 0.38) : C.border}`,
                  borderRadius: 8, padding: '5px 12px',
                  color: text.trim() ? cardColor : C.text4,
                  fontSize: 11, cursor: text.trim() ? 'pointer' : 'default',
                }}
              >
                {saveMutation.isPending ? s.saving : s.save}
              </button>
            </div>
          </>
        )}
      </div>

      {/* 파트너 답변 */}
      {partnerId && (
        <div style={{
          background: C.bg3,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: '14px',
        }}>
          <p style={{ fontSize: 10, color: C.text3, marginBottom: 8 }}>{s.partnerAnswerLabel}</p>
          {partnerAnswer ? (
            <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>{partnerAnswer.answer_text}</p>
          ) : (
            <p style={{ fontSize: 12, color: C.text4, fontStyle: 'italic' }}>
              {s.partnerPending}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
