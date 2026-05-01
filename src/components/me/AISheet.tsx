import { useState, useEffect, useRef } from 'react';
import { C } from '@/lib/colors';
import { useMeTranslations } from '@/hooks/useTranslation';

interface Msg { role: 'ai' | 'user'; text: string }

function AISheet({
  open, type, aiName, onClose,
}: {
  open: boolean; type: 'amber' | 'frost'; aiName: string; onClose: () => void;
}) {
  const me = useMeTranslations();
  const s = me.aiSheet;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const color = type === 'amber' ? C.amber : C.frost;
  const role = type === 'amber' ? s.amberRole : s.frostRole;

  useEffect(() => {
    if (open && msgs.length === 0) {
      const greeting = type === 'amber' ? s.amberGreeting : s.frostGreeting;
      setMsgs([{ role: 'ai', text: greeting }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only reset on open/close
  }, [open]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs]);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    setMsgs(prev => [...prev, { role: 'user', text: t }]);
    setInput('');
    setTimeout(() => {
      setMsgs(prev => [...prev, {
        role: 'ai',
        text: type === 'amber' ? s.amberResponse : s.frostResponse,
      }]);
    }, 900);
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 30,
          opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none',
          transition: 'opacity .3s',
        }}
      />
      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, background: C.bg,
          borderRadius: '20px 20px 0 0', border: `1px solid #44403C`, borderBottom: 'none',
          zIndex: 31, display: 'flex', flexDirection: 'column', maxHeight: '75%',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform .35s cubic-bezier(.4,0,.2,1)',
        }}
      >
        <div style={{ width: 32, height: 3, borderRadius: 99, background: C.border, margin: '10px auto 0' }} />
        <div style={{ padding: '10px 18px 8px', display: 'flex', alignItems: 'center', gap: 9, borderBottom: `1px solid ${C.border2}`, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}15`, border: `1px solid ${color}44` }}>
            <span style={{ width: 17, height: 17, borderRadius: '50%', background: color, display: 'block' }} />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.text, flex: 1 }}>{aiName}</span>
          <span style={{ fontSize: 10, color: C.text4 }}>{role}</span>
          <button aria-label={s.close} onClick={onClose} style={{ width: 26, height: 26, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', color: C.text4, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '11px 17px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          {msgs.map((m, i) => m.role === 'ai' ? (
            <div key={i} style={{ borderRadius: '11px 11px 11px 3px', padding: '10px 13px', background: `${color}0A`, border: `1px solid ${color}22` }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: C.text, lineHeight: 1.55 }}>{m.text}</p>
              <p style={{ fontSize: 9, color: `${color}77`, marginTop: 2 }}>{type === 'amber' ? 'F-mode' : 'T-mode'}</p>
            </div>
          ) : (
            <div key={i} style={{ background: `${C.amberGold}0D`, border: `1px solid ${C.amberGold}22`, borderRadius: '11px 11px 3px 11px', padding: '9px 13px', alignSelf: 'flex-end', maxWidth: '85%' }}>
              <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.6 }}>{m.text}</p>
            </div>
          ))}
        </div>
        <div style={{ flexShrink: 0, padding: '7px 13px 13px', borderTop: `1px solid ${C.border2}`, display: 'flex', alignItems: 'center', gap: 7 }}>
          <input
            aria-label={s.inputLabel.replace('{name}', aiName)}
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={s.placeholder}
            style={{ flex: 1, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: '7px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.text2, outline: 'none' }}
          />
          <button aria-label={s.send} onClick={send} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M6 11V1M1 6l5-5 5 5" stroke={C.bg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

export default AISheet;
