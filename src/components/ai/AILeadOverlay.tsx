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
import { AIChatLog } from './AIChatLog';
import { AIControlBar } from './AIControlBar';

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
  const [statusAnnounce,  setStatusAnnounce]  = useState('');
  const [errorAnnounce,   setErrorAnnounce]   = useState('');
  const [latestAiMessage, setLatestAiMessage] = useState('');

  const overlayRef = useRef<HTMLDivElement>(null);
  const micBtnRef  = useRef<HTMLButtonElement>(null);
  const startY     = useRef(0);
  const abortRef   = useRef<AbortController | null>(null);

  const greeting = ai.tabGreetings[currentTab ?? ''] ?? ai.defaultGreeting;
  const ttsLang = language === 'en' ? 'en-US' : 'ko-KR';
  const sttLang = language === 'en' ? 'en-US' : 'ko-KR';

  useEffect(() => {
    if (!user?.id) return;
    veilorDb.from('user_profiles').select('elevenlabs_voice_id').eq('user_id', user.id).single().then(({ data }) => {
      const vid = data && (data as { elevenlabs_voice_id?: string }).elevenlabs_voice_id;
      if (vid) setUserVoiceId(vid);
    });
  }, [user?.id]);

  const tts = useSpeechSynthesis({
    lang: ttsLang, rate: 0.92, voiceId: userVoiceId,
    onEnd: () => {
      if (open) {
        setVoiceState('listening');
        setStatusAnnounce(ai.statusListening);
        stt.start();
      }
    },
  });

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
        { text: text.trim(), emotion: '', mask: primaryMask ?? '', axisScores: axisScores ?? undefined, history: [...history, userMsg].slice(-6), tab: currentTab ?? 'vent', userId: user?.id, language },
        (delta) => {
          accumulated += delta;
          setHistory(prev => { const next = [...prev]; next[next.length - 1] = { role: 'ai', text: accumulated }; return next; });
        },
        abortRef.current.signal,
      );
      const aiText = data?.response || accumulated || '...';
      setHistory(prev => { const next = [...prev]; next[next.length - 1] = { role: 'ai', text: aiText }; return next; });
      setLatestAiMessage(aiText);
      setVoiceState('speaking');
      setStatusAnnounce('');
      tts.speak(aiText);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      if (err instanceof Error && err.message === 'MONTHLY_LIMIT_REACHED') {
        window.dispatchEvent(new Event('veilor:ai-limit-reached'));
        return;
      }
      const fallbackText = ai.fallbackText;
      setHistory(prev => { const next = [...prev]; next[next.length - 1] = { role: 'ai', text: fallbackText }; return next; });
      setLatestAiMessage(fallbackText);
      setErrorAnnounce(ai.connError);
      setVoiceState('speaking');
      tts.speak(fallbackText);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, primaryMask, axisScores, currentTab, user?.id, ai, aiName]);

  const stt = useSpeechRecognition({
    lang: sttLang,
    onResult: (transcript) => { sendToAI(transcript); },
    onEnd: () => { setVoiceState(prev => prev === 'listening' ? 'idle' : prev); },
    onError: (error) => {
      const msg = ai.sttErrors[error];
      if (msg) { setVoiceState('idle'); setErrorAnnounce(msg.aria); tts.speak(msg.tts); }
      else if (error !== 'aborted') { setVoiceState('idle'); setErrorAnnounce(ai.sttGenericError); }
    },
  });

  const toggleMic = useCallback(() => {
    if (voiceState === 'thinking') return;
    if (voiceState === 'listening') {
      stt.stop(); setVoiceState('idle'); setStatusAnnounce(ai.statusStopped);
    } else {
      tts.stop(); stt.start(); setVoiceState('listening'); setStatusAnnounce(ai.statusListening); setErrorAnnounce('');
    }
  }, [voiceState, stt, tts, ai]);

  const handleTextSend = useCallback(() => {
    if (!message.trim()) return;
    sendToAI(message);
    setMessage('');
  }, [message, sendToAI]);

  useEffect(() => {
    if (open) {
      setHistory([]); setMessage(''); setVoiceState('speaking');
      setStatusAnnounce(''); setErrorAnnounce(''); setLatestAiMessage('');
      const timer = setTimeout(() => { tts.speak(greeting); setLatestAiMessage(greeting); }, 400);
      setTimeout(() => micBtnRef.current?.focus(), 450);
      return () => clearTimeout(timer);
    } else {
      stt.abort(); tts.stop(); setVoiceState('idle'); abortRef.current?.abort();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && overlayRef.current) {
        const focusable = overlayRef.current.querySelectorAll<HTMLElement>(FOCUS_TRAP_SELECTOR);
        if (focusable.length === 0) return;
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => { startY.current = e.touches[0].clientY; }, []);
  const handleTouchEnd   = useCallback((e: React.TouchEvent) => { if (e.changedTouches[0].clientY - startY.current > 100) onClose(); }, [onClose]);

  const isListening = voiceState === 'listening';

  const controlBarStrings = {
    inputLabel: ai.inputLabel,
    inputPlaceholderThinking: ai.inputPlaceholderThinking,
    inputPlaceholderListening: ai.inputPlaceholderListening,
    inputPlaceholderIdle: ai.inputPlaceholderIdle,
    sendLabel: ai.sendLabel,
    stopReadLabel: ai.stopReadLabel,
    micLabelListening: ai.micLabelListening,
    micLabelThinking: ai.micLabelThinking,
    micLabelStart: ai.micLabelStart,
    micLabelUnsupported: ai.micLabelUnsupported,
    closeLabel: ai.closeLabel,
    swipeHint: ai.swipeHint,
    sttUnsupported: ai.sttUnsupported,
    statusReadStopped: ai.statusReadStopped,
  };

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
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <span id="voice-status" role="status" aria-live="polite" aria-atomic="true" className="sr-only">{statusAnnounce}</span>
      <div id="voice-error" role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">{errorAnnounce}</div>
      <div id="voice-new-message" aria-live="polite" aria-relevant="additions text" aria-atomic="true" className="sr-only">
        {latestAiMessage ? `${aiName}: ${latestAiMessage}` : ''}
      </div>

      <AIControlBar
        voiceState={voiceState}
        isListening={isListening}
        sttSupported={stt.supported}
        sttInterimTranscript={stt.interimTranscript}
        message={message}
        setMessage={setMessage}
        handleTextSend={handleTextSend}
        toggleMic={toggleMic}
        onClose={onClose}
        onTtsStop={() => { tts.stop(); setVoiceState('idle'); setStatusAnnounce(ai.statusReadStopped); }}
        aiName={aiName}
        s={controlBarStrings}
        micBtnRef={micBtnRef}
      />

      <AIChatLog
        history={history}
        voiceState={voiceState}
        aiName={aiName}
        greeting={greeting}
        speakerMe={ai.speakerMe}
        chatLogLabel={ai.chatLogLabel}
      />

      <div aria-hidden="true" style={{ height: 'env(safe-area-inset-bottom, 16px)' }} />
    </motion.div>
    )}
    </AnimatePresence>
  );
}
