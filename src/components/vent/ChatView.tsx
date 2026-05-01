// ChatView — message list + AI thinking indicator + finish button + summary card
import { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { C, alpha } from '@/lib/colors';
import { veilorDb } from '@/integrations/supabase/client';
import { useVentTranslations } from '@/hooks/useTranslation';

// NUDGE_EMOTIONS is built dynamically from translations in the component

const CHAT_AI_MSG_STYLE = { background: C.bg2, border: `1px solid ${C.border}`, borderRadius: '12px 12px 12px 3px', padding: '12px 14px' } as const;
const CHAT_USER_MSG_STYLE = { background: alpha(C.amber, 0.05), border: `1px solid ${alpha(C.amber, 0.13)}`, borderRadius: '12px 12px 3px 12px', padding: '10px 14px' } as const;

interface ChatMsg { role: 'ai' | 'user'; text: string; tone?: string }

interface ChatViewProps {
  curEmo: string;
  msgs: ChatMsg[];
  msgCount: number;
  msgVal: string;
  aiThinking: boolean;
  showSummary: boolean;
  sessionSaved: boolean;
  /** critical 위기 감지 시 true — 입력창 비활성화 + 안내 메시지 표시 */
  crisisLocked?: boolean;
  emoData: { count: number; suggestion: string };
  greeting: { title: string; placeholder: string };
  userId?: string;
  hasSexSelfResult?: boolean;
  onMsgValChange: (val: string) => void;
  onSendMsg: () => void;
  onFinishSession: () => void;
  onContinueChat: () => void;
  onNavigateToSexSelf: () => void;
}

export default function ChatView({
  curEmo, msgs, msgCount, msgVal, aiThinking, showSummary, sessionSaved,
  crisisLocked = false,
  emoData, greeting, userId,
  hasSexSelfResult = false,
  onMsgValChange, onSendMsg, onFinishSession, onContinueChat, onNavigateToSexSelf,
}: ChatViewProps) {
  const vent = useVentTranslations();
  const navigate = useNavigate();
  const chatRef = useRef<HTMLDivElement>(null);
  const [feedbacks, setFeedbacks] = useState<Record<number, 'up' | 'down'>>({});
  const [showSexSelfNudge, setShowSexSelfNudge] = useState(false);
  const nudgeShownRef = useRef(false);

  const nudgeEmotions = useMemo(() => [
    vent.emotions.hurt, vent.emotions.lonely, vent.emotions.confused,
  ], [vent.emotions]);

  useEffect(() => {
    if (
      msgCount >= 4 &&
      nudgeEmotions.includes(curEmo) &&
      !nudgeShownRef.current &&
      !hasSexSelfResult &&
      !showSummary
    ) {
      nudgeShownRef.current = true;
      setShowSexSelfNudge(true);
    }
  }, [msgCount, curEmo, nudgeEmotions, hasSexSelfResult, showSummary]);

  async function handleFeedback(msgIdx: number, value: 'up' | 'down', msgText: string) {
    setFeedbacks(prev => ({ ...prev, [msgIdx]: value }));
    if (!userId) return;
    await veilorDb.from('ai_response_feedback').insert({
      user_id: userId,
      response_text: msgText.slice(0, 500),
      feedback: value,
      context: curEmo,
      created_at: new Date().toISOString(),
    }).then(() => {}).catch(() => {});
  }

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs, showSummary]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      <div className="flex-shrink-0 px-[22px] pt-3 pb-1">
        <h3 className="text-[26px] font-light" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: C.text }}>{curEmo}</h3>
        {/* 커뮤니티 배너 */}
        {curEmo && emoData && (
          <div className="flex items-center gap-[9px] rounded-[10px] mt-2" style={{ padding: '10px 13px', background: C.bg2, border: `1px solid ${C.border}` }}>
            <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: C.amber, animation: 'ai-pulse 2.5s ease-in-out infinite' }} />
            <span className="text-[14px] font-light flex-1 break-keep" style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text2 }}>
              {vent.chat.similarPeople.replace('{emotion}', String(emoData.count))}
            </span>
            <span className="text-[16px]" style={{ fontFamily: "'Cormorant Garamond', serif", color: C.amber }}>{emoData.count}</span>
          </div>
        )}
      </div>

      <div ref={chatRef} className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0" style={{ padding: '8px 22px', scrollbarWidth: 'none' }}>
        {msgs.map((m, i) => m.role === 'ai' ? (
          <div key={i} className="vr-fade-in flex-shrink-0" style={CHAT_AI_MSG_STYLE}>
            <p className="text-[16px] font-light leading-[1.6] break-keep" style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text }}>{m.text}</p>
            {m.tone && <p className="text-[10px] font-light mt-[3px]" style={{ color: alpha(C.amber, 0.4) }}>{m.tone}</p>}
            {/* C6: AI 응답 피드백 버튼 (초기 AI 메시지 2개 제외) */}
            {i > 1 && !aiThinking && (
              <div className="flex gap-2 mt-2">
                <button
                  aria-label={vent.chat.feedbackHelpful}
                  onClick={() => handleFeedback(i, 'up', m.text)}
                  style={{
                    background: feedbacks[i] === 'up' ? alpha(C.amber, 0.2) : 'transparent',
                    border: `1px solid ${feedbacks[i] === 'up' ? C.amber : alpha(C.amber, 0.2)}`,
                    borderRadius: 6, padding: '2px 8px', fontSize: 11,
                    color: feedbacks[i] === 'up' ? C.amber : C.text5, cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  {feedbacks[i] === 'up' ? '👍' : '↑'}
                </button>
                <button
                  aria-label={vent.chat.feedbackNotHelpful}
                  onClick={() => handleFeedback(i, 'down', m.text)}
                  style={{
                    background: feedbacks[i] === 'down' ? 'rgba(220,38,38,0.1)' : 'transparent',
                    border: `1px solid ${feedbacks[i] === 'down' ? '#DC2626' : alpha(C.amber, 0.2)}`,
                    borderRadius: 6, padding: '2px 8px', fontSize: 11,
                    color: feedbacks[i] === 'down' ? '#DC2626' : C.text5, cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  {feedbacks[i] === 'down' ? '👎' : '↓'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div key={i} className="vr-fade-in self-end max-w-[84%] flex-shrink-0" style={CHAT_USER_MSG_STYLE}>
            <p className="text-[13px] font-light leading-[1.6] break-keep" style={{ color: C.text2 }}>{m.text}</p>
          </div>
        ))}
        {aiThinking && (
          <div className="vr-fade-in flex-shrink-0 flex items-center gap-2" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: '12px 12px 12px 3px', padding: '12px 14px' }}>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: C.amber, animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: C.amber, animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: C.amber, animationDelay: '300ms' }} />
            </div>
            <span className="text-[10px] font-light" style={{ color: C.text4 }}>{vent.chat.amberListening}</span>
          </div>
        )}

        {/* 엠버 SexSelf 넛지 */}
        {showSexSelfNudge && !showSummary && (
          <div className="vr-fade-in flex-shrink-0 space-y-3" style={CHAT_AI_MSG_STYLE}>
            <p className="text-[16px] font-light leading-[1.6] break-keep" style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text }}>
              {vent.chat.sexSelfNudge}
            </p>
            <p className="text-[10px] font-light" style={{ color: alpha(C.amber, 0.4) }}>{vent.chat.sexSelfNudgePrivate}</p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setShowSexSelfNudge(false); onNavigateToSexSelf(); }}
                className="flex-1 py-[9px] rounded-[9px] text-[11px] font-light transition-all"
                style={{ background: alpha('#ec4899', 0.08), border: `1px solid ${alpha('#ec4899', 0.3)}`, color: '#ec4899' }}
              >
                {vent.chat.sexSelfNudgeYes}
              </button>
              <button
                onClick={() => setShowSexSelfNudge(false)}
                className="flex-1 py-[9px] rounded-[9px] text-[11px] font-light transition-all"
                style={{ border: `1px solid ${C.border}`, background: 'transparent', color: C.text4 }}
              >
                {vent.chat.sexSelfNudgeNo}
              </button>
            </div>
          </div>
        )}

        {/* 마무리 버튼 (4턴 이상, 아직 저장 안 됨) */}
        {msgCount >= 4 && !showSummary && !sessionSaved && !aiThinking && (
          <div className="vr-fade-in flex-shrink-0 flex justify-center mt-2">
            <button
              onClick={onFinishSession}
              className="text-[12px] font-light px-5 py-2 rounded-full transition-all"
              style={{ border: `1px solid ${alpha(C.amber, 0.3)}`, color: C.amber, background: alpha(C.amber, 0.05) }}
            >
              {vent.chat.finishButton}
            </button>
          </div>
        )}

        {/* 감정 요약 카드 */}
        {showSummary && curEmo && (
          <div className="vr-fade-in flex-shrink-0 rounded-[11px] mt-2" style={{ background: C.bg2, border: `1px solid ${alpha(C.amber, 0.13)}`, padding: '14px 15px' }}>
            <p className="text-[10px] font-semibold tracking-[.08em] uppercase mb-[6px]" style={{ color: C.amber }}>{vent.chat.currentEmotion}</p>
            <div className="flex gap-[6px] flex-wrap mb-[10px]">
              <span className="text-[11px] font-light px-[10px] py-[3px] rounded-full" style={{ border: `1px solid ${alpha(C.amber, 0.2)}`, color: C.amber, background: alpha(C.amber, 0.04) }}>{curEmo}</span>
            </div>
            <p className="text-[14px] font-light leading-[1.65] mb-[10px] break-keep" style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text2 }}>{emoData.suggestion}</p>
            <div className="flex gap-[7px]">
              <button onClick={onContinueChat}
                className="flex-1 py-[9px] rounded-[9px] text-[11px] font-light cursor-pointer transition-all"
                style={{ border: `1px solid ${alpha(C.amber, 0.27)}`, background: alpha(C.amber, 0.04), color: C.amber }}>
                {vent.chat.continueButton}
              </button>
              <button onClick={() => {}}
                className="flex-1 py-[9px] rounded-[9px] text-[11px] font-light cursor-pointer transition-all"
                style={{ border: `1px solid ${C.border}`, background: 'transparent', color: C.text4 }}>
                {vent.chat.tryThisButton}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 입력창 — critical 위기 시 잠금 */}
      {!showSummary && (
        crisisLocked ? (
          <div className="flex-shrink-0" style={{ padding: '10px 16px 14px', borderTop: `1px solid ${C.border2}` }}>
            <div style={{ background: '#DC262615', border: '1px solid #DC262630', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: '#DC2626', fontWeight: 500, margin: 0 }}>
                {vent.chat.crisisLocked}
              </p>
              <p style={{ fontSize: 11, color: '#DC262699', marginTop: 4, margin: '4px 0 0' }}>
                {vent.chat.crisisLockedSub}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0 flex items-center gap-2" style={{ padding: '8px 16px 14px', borderTop: `1px solid ${C.border2}` }}>
            <button aria-label={vent.chat.voiceInput} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: `1px solid ${C.border}`, background: 'transparent' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="5" y="1" width="6" height="9" rx="3" stroke="#78716C" strokeWidth="1.2"/><path d="M2 7.5C2 10.538 4.686 13 8 13s6-2.462 6-5.5" stroke="#78716C" strokeWidth="1.2" strokeLinecap="round" fill="none"/><line x1="8" y1="13" x2="8" y2="15" stroke="#78716C" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
            <input
              aria-label={vent.chat.messageInput}
              className="flex-1 rounded-full text-[12px] font-light outline-none"
              style={{ background: C.bg2, border: `1px solid ${C.border}`, padding: '8px 14px', color: C.text2, fontFamily: "'DM Sans', sans-serif" }}
              placeholder={greeting.placeholder}
              value={msgVal}
              onChange={e => onMsgValChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSendMsg()}
            />
            <button aria-label={vent.chat.sendMessage} onClick={onSendMsg} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-[.92]" style={{ background: C.amber, border: 'none' }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 11V1M1 6l5-5 5 5" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        )
      )}
    </div>
  );
}
