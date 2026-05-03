import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { C } from '@/lib/colors';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useAuth } from '@/context/AuthContext';
import { invokeHeldChatStream } from '@/lib/heldChatClient';
import { veilorDb } from '@/integrations/supabase/client';
import { useLanguageContext } from '@/context/LanguageContext';
import { AI_STRINGS } from './aiOverlayStrings';
import { WaveForm } from './WaveForm';

const FOCUS_TRAP_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

interface AILeadOverlayProps {
  open: boolean;
  onClose: () => void;
  aiName?: string;
  currentTab?: string;
}

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

// ── 상태 타입 ─────────────────────────────────────────────────────────────────
type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';



export default function AILeadOverlay({
  open,
  onClose,
  aiName = '엠버',
  currentTab,
}: AILeadOverlayProps) {
  const { user, primaryMask, axisScores } = useAuth();
  const { language } = useLanguageContext();
  const ai = AI_STRINGS[language] ?? AI_STRINGS.ko;

  const [message,        setMessage]        = useState('');
  const [history,        setHistory]        = useState<ChatMessage[]>([]);
  const [voiceState,     setVoiceState]     = useState<VoiceState>('idle');
  const [userVoiceId,    setUserVoiceId]    = useState<string | undefined>(undefined);

  // 사용자 클론 Voice ID 로드
  useEffect(() => {
    if (!user?.id) return;
    veilorDb.from('user_profiles')
      .select('elevenlabs_voice_id')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        const vid = data && (data as { elevenlabs_voice_id?: string }).elevenlabs_voice_id;
        if (vid) setUserVoiceId(vid);
      });
  }, [user?.id]);

  // ── aria-live 공지 전용 state ─────────────────────────────────────────────
  // 3개 채널: status(polite) / error(assertive) / newMessage(polite·additions)
  const [statusAnnounce,  setStatusAnnounce]  = useState('');
  const [errorAnnounce,   setErrorAnnounce]   = useState('');
  const [latestAiMessage, setLatestAiMessage] = useState('');

  const overlayRef  = useRef<HTMLDivElement>(null);
  const micBtnRef   = useRef<HTMLButtonElement>(null);
  const chatLogRef  = useRef<HTMLDivElement>(null);
  const chatEndRef  = useRef<HTMLDivElement>(null);
  const startY      = useRef(0);
  const abortRef    = useRef<AbortController | null>(null);

  const greeting = ai.tabGreetings[currentTab ?? ''] ?? ai.defaultGreeting;
  const ttsLang = language === 'en' ? 'en-US' : 'ko-KR';
  const sttLang = language === 'en' ? 'en-US' : 'ko-KR';

  const tts = useSpeechSynthesis({
    lang:    ttsLang,
    rate:    0.92,
    voiceId: userVoiceId,
    onEnd: () => {
      if (open) {
        setVoiceState('listening');
        setStatusAnnounce(ai.statusListening);
        stt.start();
      }
    },
  });

  // ── AI 전송 (SSE 스트리밍) ────────────────────────────────────────────────
  const sendToAI = useCallback(async (text: string) => {
    if (!text.trim() || voiceState === 'thinking') return;

    stt.stop();
    const userMsg: ChatMessage = { role: 'user', text: text.trim() };
    setHistory(prev => [...prev, userMsg]);
    setVoiceState('thinking');
    setStatusAnnounce(ai.statusThinking(aiName));
    setErrorAnnounce('');

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const streamingPlaceholder: ChatMessage = { role: 'ai', text: '' };
    setHistory(prev => [...prev, streamingPlaceholder]);

    try {
      let accumulated = '';

      const data = await invokeHeldChatStream(
        {
          text:       text.trim(),
          emotion:    '',
          mask:       primaryMask ?? '',
          axisScores: axisScores ?? undefined,
          history:    [...history, userMsg].slice(-6),
          tab:        currentTab ?? 'vent',
          userId:     user?.id,
          language,
        },
        (delta) => {
          accumulated += delta;
          setHistory(prev => {
            const next = [...prev];
            next[next.length - 1] = { role: 'ai', text: accumulated };
            return next;
          });
        },
        abortRef.current.signal,
      );

      const aiText = data?.response || accumulated || '...';
      setHistory(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: 'ai', text: aiText };
        return next;
      });
      setLatestAiMessage(aiText);
      setVoiceState('speaking');
      setStatusAnnounce('');
      tts.speak(aiText);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const fallbackText = ai.fallbackText;
      setHistory(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: 'ai', text: fallbackText };
        return next;
      });
      setLatestAiMessage(fallbackText);
      setErrorAnnounce(ai.connError);
      setVoiceState('speaking');
      tts.speak(fallbackText);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, primaryMask, axisScores, currentTab, user?.id, ai, aiName]);

  const stt = useSpeechRecognition({
    lang:     sttLang,
    onResult: (transcript) => {
      sendToAI(transcript);
    },
    onEnd: () => {
      setVoiceState(prev => prev === 'listening' ? 'idle' : prev);
    },
    onError: (error) => {
      const msg = ai.sttErrors[error];
      if (msg) {
        setVoiceState('idle');
        setErrorAnnounce(msg.aria);
        tts.speak(msg.tts);
      } else if (error !== 'aborted') {
        setVoiceState('idle');
        setErrorAnnounce(ai.sttGenericError);
      }
    },
  });

  const toggleMic = useCallback(() => {
    if (voiceState === 'thinking') return;
    if (voiceState === 'listening') {
      stt.stop();
      setVoiceState('idle');
      setStatusAnnounce(ai.statusStopped);
    } else {
      tts.stop();
      stt.start();
      setVoiceState('listening');
      setStatusAnnounce(ai.statusListening);
      setErrorAnnounce('');
    }
  }, [voiceState, stt, tts, ai]);

  // ── 텍스트 전송 ───────────────────────────────────────────────────────────
  const handleTextSend = useCallback(() => {
    if (!message.trim()) return;
    sendToAI(message);
    setMessage('');
  }, [message, sendToAI]);

  // ── 열릴 때: 초기화 + 인사말 TTS ─────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setHistory([]);
      setMessage('');
      setVoiceState('speaking');
      setStatusAnnounce('');
      setErrorAnnounce('');
      setLatestAiMessage('');

      // 인사말 TTS — 끝나면 onEnd에서 자동으로 STT 시작 (핸즈프리 루프 진입)
      const timer = setTimeout(() => {
        tts.speak(greeting);
        // 스크린리더용: TTS가 꺼져 있어도 인사말이 읽힘
        setLatestAiMessage(greeting);
      }, 400);

      // 마이크 버튼에 포커스 — VoiceOver/TalkBack 사용자가 오버레이 열면
      // "음성 입력 시작, 버튼" 이라고 즉시 읽힘
      setTimeout(() => micBtnRef.current?.focus(), 450);

      return () => clearTimeout(timer);
    } else {
      stt.abort();
      tts.stop();
      setVoiceState('idle');
      abortRef.current?.abort();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── 새 메시지 → 스크롤 ───────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // ── 스와이프 다운으로 닫기 ────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.changedTouches[0].clientY - startY.current > 100) onClose();
  }, [onClose]);

  // ── ESC + 포커스 트랩 ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && overlayRef.current) {
        const focusable = overlayRef.current.querySelectorAll<HTMLElement>(FOCUS_TRAP_SELECTOR);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // ── 스크롤 잠금 ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const micAriaLabel =
    voiceState === 'listening' ? ai.micLabelListening :
    voiceState === 'thinking'  ? ai.micLabelThinking :
    stt.supported              ? ai.micLabelStart :
                                 ai.micLabelUnsupported;

  const isListening = voiceState === 'listening';

  return (
    <AnimatePresence>
    {open && (
    <motion.div
      key="ai-overlay"
      ref={overlayRef}
      role="dialog"
      aria-label={ai.dialogLabel(aiName)}
      aria-modal="true"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 32, stiffness: 300 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999, background: C.bg,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* ── 접근성 공지 영역 3개 — 항상 DOM에 존재 (내용만 바뀜) ─────────── */}

      {/* 1. 일반 상태 공지 (polite — 현재 말 끊지 않고 대기 후 읽음) */}
      <span
        id="voice-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {statusAnnounce}
      </span>

      {/* 2. 오류 공지 (assertive — 즉시 끊고 읽음, 오류 상황에만) */}
      <div
        id="voice-error"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {errorAnnounce}
      </div>

      {/* 3. 새 AI 메시지 공지 (TTS 꺼진 스크린리더 사용자를 위한 추가 채널) */}
      <div
        id="voice-new-message"
        aria-live="polite"
        aria-relevant="additions text"
        aria-atomic="true"
        className="sr-only"
      >
        {latestAiMessage ? `${aiName}: ${latestAiMessage}` : ''}
      </div>

      {/* ── 스와이프 힌트 (시각 전용) ───────────────────────────────────── */}
      <div aria-hidden="true" style={{
        width: 32, height: 3, borderRadius: 99, background: C.border,
        margin: '12px auto 0',
      }} />
      <p
        aria-hidden="true"
        style={{ textAlign: 'center', fontSize: 10, color: C.text5, margin: '6px 0 0', fontFamily: "'DM Sans', sans-serif" }}
      >
        {ai.swipeHint}
      </p>

      {/* ── 대화 기록 — role="log": 순서 있는 대화 컨테이너 ──────────────
            tabIndex={0} → 영역 자체에 포커스 가능
            방향키로 내부 텍스트 탐색 (스크린리더 기본 동작)
            aria-live="polite" + aria-relevant="additions" →
            새 메시지가 추가될 때만 읽힘 (기존 메시지 재독 없음)        ── */}
      <div
        ref={chatLogRef}
        role="log"
        aria-label={ai.chatLogLabel}
        aria-live="polite"
        aria-relevant="additions text"
        tabIndex={0}
        style={{
          flex: 1, overflowY: 'auto', padding: '16px 20px',
          display: 'flex', flexDirection: 'column',
          outline: 'none',  // tabIndex={0}이지만 시각적 포커스 링은 생략 (UX)
        }}
      >
        {/* 대화 없을 때: 아바타 + 인사말 중앙 */}
        {history.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.amberGold}22, ${C.amberGold}08)`,
              border: `2px solid ${C.amberGold}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', marginBottom: 20,
            }}>
              <div aria-hidden="true" style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: `1px solid ${C.amberGold}22`, animation: 'vr-pulse-ring 2s ease-out infinite' }} />
              <div aria-hidden="true" style={{ position: 'absolute', inset: -16, borderRadius: '50%', border: `1px solid ${C.amberGold}11`, animation: 'vr-pulse-ring 2s ease-out 0.5s infinite' }} />
              <span aria-hidden="true" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: C.amberGold }}>
                {aiName[0]}
              </span>
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: C.text }}>
              {aiName}
            </p>
            {/* 인사말 — 시각 표시 + 스크린리더 모두 읽힘 */}
            <p style={{
              marginTop: 12, fontSize: 14, fontWeight: 300, color: C.text3,
              fontFamily: "'DM Sans', sans-serif", textAlign: 'center', maxWidth: 260,
            }}>
              {greeting}
            </p>
          </div>
        )}

        {/* 대화 버블 */}
        <AnimatePresence initial={false}>
        {history.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%', marginBottom: 10,
              padding: '10px 14px', borderRadius: 14,
              background: msg.role === 'user' ? `${C.amberGold}15` : C.bg2,
              border: `1px solid ${msg.role === 'user' ? `${C.amberGold}33` : C.border}`,
            }}
          >
            <span className="sr-only">
              {msg.role === 'ai' ? `${aiName}:` : ai.speakerMe}
            </span>
            {msg.role === 'ai' && (
              <p aria-hidden="true" style={{ fontSize: 9, color: C.amberGold, marginBottom: 4, fontWeight: 400 }}>
                {aiName}
              </p>
            )}
            <p style={{ fontSize: 13, fontWeight: 300, color: C.text2, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
              {msg.text}
            </p>
          </motion.div>
        ))}
        </AnimatePresence>

        {/* AI 생각 중 — 점 3개 (시각 전용, aria-hidden) */}
        {voiceState === 'thinking' && (
          <div
            aria-hidden="true"
            style={{
              alignSelf: 'flex-start', maxWidth: '60%', marginBottom: 10,
              padding: '10px 14px', borderRadius: 14,
              background: C.bg2, border: `1px solid ${C.border}`,
            }}
          >
            <p style={{ fontSize: 9, color: C.amberGold, marginBottom: 4 }}>{aiName}</p>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{
                  width: 6, height: 6, borderRadius: '50%', background: C.text4,
                  animation: `vr-wave 0.6s ease-in-out ${j * 0.15}s infinite alternate`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── 인식 중 interim 텍스트 (시각 전용 — aria-hidden) ─────────────
            스크린리더에 전달하지 않음: 매 글자마다 읽히면 극도로 혼란스러움 */}
      {stt.interimTranscript && (
        <p
          aria-hidden="true"
          style={{
            textAlign: 'center', fontSize: 12, color: C.text3,
            padding: '0 20px 4px', fontFamily: "'DM Sans', sans-serif",
            fontStyle: 'italic', minHeight: 20,
          }}
        >
          {stt.interimTranscript}
        </p>
      )}

      {/* ── 음성 파형 (시각 전용) ─────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <WaveForm active={isListening || voiceState === 'speaking'} />
      </div>

      {/* ── 하단 입력 영역 ────────────────────────────────────────────── */}
      <div style={{ padding: '0 20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>

        {/* 텍스트 입력 — 음성 미지원 환경에서도 항상 사용 가능 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 360,
          background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px',
        }}>
          <input
            aria-label={ai.inputLabel}
            aria-describedby="voice-status"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={
              voiceState === 'thinking' ? ai.inputPlaceholderThinking(aiName) :
              voiceState === 'listening' ? ai.inputPlaceholderListening :
              ai.inputPlaceholderIdle
            }
            disabled={voiceState === 'thinking'}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.text2,
            }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleTextSend(); }}
          />
          {message.trim() && (
            <button
              aria-label={ai.sendLabel}
              onClick={handleTextSend}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: C.amberGold, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                // 터치 타겟: padding으로 44px 확보
                padding: 8, margin: -8,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6 10V2M6 2L2 6M6 2l4 4" stroke={C.bg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* 마이크 + TTS 중지 + 닫기 버튼 행 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>

          {/* TTS 중지 버튼 — 읽는 중일 때만 표시, 항상 포커스 가능 */}
          {voiceState === 'speaking' && (
            <button
              aria-label={ai.stopReadLabel}
              onClick={() => { tts.stop(); setVoiceState('idle'); setStatusAnnounce(ai.statusReadStopped); }}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: C.bg2, border: `1px solid ${C.border}`, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="3" y="3" width="8" height="8" rx="1" fill={C.text4}/>
              </svg>
            </button>
          )}

          {/* 마이크 버튼
                - aria-pressed: 켜진/꺼진 상태를 스크린리더에 전달
                - aria-describedby: 현재 상태 공지 영역 연결
                - 44×44px: WCAG 2.5.5 AAA / Apple HIG 기준
                - :focus-visible outline: 키보드·Switch Access 사용자       */}
          <button
            ref={micBtnRef}
            onClick={toggleMic}
            disabled={voiceState === 'thinking'}
            aria-pressed={isListening}
            aria-label={micAriaLabel}
            aria-describedby="voice-status"
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: isListening ? C.amberGold : C.bg2,
              border: `2px solid ${isListening ? C.amberGold : C.border}`,
              cursor: voiceState === 'thinking' ? 'default' : 'pointer',
              opacity: voiceState === 'thinking' ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: isListening ? 'vr-pulse-mic 1.5s ease-in-out infinite' : 'none',
              transition: 'background 0.3s, border-color 0.3s',
              // 포커스 링 — :focus-visible은 인라인 스타일로 처리 불가, CSS에서 처리
            }}
            className="voice-mic-btn"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="7" y="2" width="6" height="10" rx="3" stroke={isListening ? C.bg : C.text3} strokeWidth="1.5"/>
              <path d="M4 10a6 6 0 0 0 12 0" stroke={isListening ? C.bg : C.text3} strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 16v2" stroke={isListening ? C.bg : C.text3} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* 닫기 버튼 — 항상 마지막 탭 순서 */}
          <button
            onClick={onClose}
            aria-label={ai.closeLabel}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: C.bg2, border: `1px solid ${C.border}`, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 11L11 3M3 3l8 8" stroke={C.text4} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* STT 미지원 안내 — 시각 + 스크린리더 모두 읽힘 */}
        {!stt.supported && (
          <p
            role="note"
            style={{ fontSize: 10, color: C.text5, textAlign: 'center' }}
          >
            {ai.sttUnsupported}
          </p>
        )}
      </div>

      {/* 하단 safe area */}
      <div aria-hidden="true" style={{ height: 'env(safe-area-inset-bottom, 16px)' }} />
    </motion.div>
    )}
    </AnimatePresence>
  );
}
