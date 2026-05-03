import { useState, useRef, useEffect } from 'react';
import { invokeHeldChat } from '@/lib/heldChatClient';
import { useAuth } from '@/context/AuthContext';
import { C, alpha } from '@/lib/colors';
import { useVentTranslations } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/context/LanguageContext';

const SHEET_AI_MSG_STYLE = { background: C.bg2, border: `1px solid ${C.border}`, borderRadius: '11px 11px 11px 3px', padding: '10px 13px' } as const;
const SHEET_USER_MSG_STYLE = { background: alpha(C.amber, 0.05), border: `1px solid ${alpha(C.amber, 0.13)}`, borderRadius: '11px 11px 3px 11px', padding: '9px 13px' } as const;

interface Props {
  open: boolean;
  onClose: () => void;
  aiName: string;
}

export default function AmberSheet({ open, onClose, aiName }: Props) {
  const { user, primaryMask, axisScores } = useAuth();
  const vent = useVentTranslations();
  const { language } = useLanguageContext();
  const [msgs, setMsgs] = useState<{ role: 'ai' | 'user'; text: string; tone?: string }[]>(() => [
    { role: 'ai', text: vent.amberSheet.initialText, tone: vent.amberSheet.toneHere },
  ]);
  const [val, setVal] = useState('');
  const [thinking, setThinking] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = async () => {
    if (!val.trim() || thinking) return;
    const txt = val.trim();
    setMsgs(m => [...m, { role: 'user', text: txt }]);
    setVal('');
    setThinking(true);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const result = await invokeHeldChat(
        { text: txt, mask: primaryMask ?? undefined, axisScores: axisScores ?? null, history: msgs.slice(-6), tab: 'amber_sheet', userId: user?.id, language },
        abortRef.current.signal,
      );
      setMsgs(m => [...m, { role: 'ai', text: result.response, tone: vent.amberSheet.toneListening }]);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setMsgs(m => [...m, { role: 'ai', text: vent.amberSheet.fallbackText, tone: vent.amberSheet.toneDig }]);
    } finally {
      setThinking(false);
    }
  };

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs]);

  return (
    <>
      <div onClick={onClose} className="absolute inset-0 z-30 rounded-[40px] transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,.5)', opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none' }} />
      <div className="absolute bottom-0 left-0 right-0 flex flex-col"
        style={{ background: C.bg, borderRadius: '20px 20px 40px 40px', border: `1px solid ${C.border}`, borderBottom: 'none', maxHeight: '78%', transform: open ? 'translateY(0)' : 'translateY(100%)', transition: 'transform .35s cubic-bezier(.4,0,.2,1)', zIndex: 31 }}>
        <div className="w-8 h-[3px] rounded-full mx-auto mt-2.5" style={{ background: C.border }} />
        <div className="flex items-center gap-[9px] px-5 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${C.border2}` }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: alpha(C.amber, 0.08), border: `1px solid ${alpha(C.amber, 0.2)}` }}>
            <div className="w-[17px] h-[17px] rounded-full" style={{ background: C.amber }} />
          </div>
          <span className="flex-1 text-[15px]" style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text }}>{aiName}</span>
          <button aria-label={vent.amberSheet.close} onClick={onClose} className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[13px]" style={{ border: `1px solid ${C.border}`, color: C.text4 }}>✕</button>
        </div>
        <div ref={chatRef} className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0" style={{ padding: '12px 18px', scrollbarWidth: 'none' }}>
          {msgs.map((m, i) => m.role === 'ai' ? (
            <div key={i} className="vr-fade-in flex-shrink-0" style={SHEET_AI_MSG_STYLE}>
              <p className="text-[15px] font-light leading-[1.55]" style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text }}>{m.text}</p>
              {m.tone && <p className="text-[9px] font-light mt-[2px]" style={{ color: alpha(C.amber, 0.47) }}>{m.tone}</p>}
            </div>
          ) : (
            <div key={i} className="vr-fade-in self-end max-w-[85%] flex-shrink-0" style={SHEET_USER_MSG_STYLE}>
              <p className="text-[12px] font-light leading-[1.6]" style={{ color: C.text2 }}>{m.text}</p>
            </div>
          ))}
        </div>
        <div className="flex-shrink-0 flex items-center gap-[7px]" style={{ padding: '8px 14px 14px', borderTop: `1px solid ${C.border2}` }}>
          <input aria-label={vent.chat.messageInput} className="flex-1 text-[12px] font-light rounded-full outline-none"
            style={{ background: C.bg2, border: `1px solid ${C.border}`, padding: '7px 13px', color: C.text2, fontFamily: "'DM Sans', sans-serif" }}
            placeholder={thinking ? vent.amberSheet.thinkingPlaceholder : vent.chat.speakToAmber.replace('{name}', aiName)}
            value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !thinking && send()}
            disabled={thinking} />
          <button aria-label={vent.amberSheet.send} onClick={() => send()} disabled={thinking} className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: thinking ? alpha(C.amber, 0.4) : C.amber, border: 'none' }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 11V1M1 6l5-5 5 5" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </>
  );
}
