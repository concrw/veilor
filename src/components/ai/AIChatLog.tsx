import { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { C } from '@/lib/colors';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

interface Props {
  history: ChatMessage[];
  voiceState: string;
  aiName: string;
  greeting: string;
  speakerMe: string;
  chatLogLabel: string;
}

export function AIChatLog({ history, voiceState, aiName, greeting, speakerMe, chatLogLabel }: Props) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div
      role="log"
      aria-label={chatLogLabel}
      aria-live="polite"
      aria-relevant="additions text"
      tabIndex={0}
      style={{
        flex: 1, overflowY: 'auto', padding: '16px 20px',
        display: 'flex', flexDirection: 'column',
        outline: 'none',
      }}
    >
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
          <p style={{
            marginTop: 12, fontSize: 14, fontWeight: 300, color: C.text3,
            fontFamily: "'DM Sans', sans-serif", textAlign: 'center', maxWidth: 260,
          }}>
            {greeting}
          </p>
        </div>
      )}

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
            {msg.role === 'ai' ? `${aiName}:` : speakerMe}
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
  );
}
