import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { C, alpha } from '@/lib/colors';
import { useT } from '@/i18n/useT';
import { useCreateCoupleTalkSession, useJoinCoupleTalkSession } from '@/hooks/useCoupleTalk';
import type { CoupleTalkSession } from '@/integrations/supabase/veilor-types';

interface Props {
  existingSession: CoupleTalkSession | null;
}

export function PartnerInvite({ existingSession }: Props) {
  const t = useT();
  const s = t.coupleTalkPartnerInvite;

  const [copied, setCopied] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [showJoin, setShowJoin] = useState(false);

  const createSession = useCreateCoupleTalkSession();
  const joinSession = useJoinCoupleTalkSession();

  const token = existingSession?.invite_token;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleJoin = async () => {
    setJoinError(null);
    try {
      await joinSession.mutateAsync(codeInput);
    } catch (e) {
      setJoinError(e instanceof Error ? e.message : s.defaultError);
    }
  };

  return (
    <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ marginBottom: 4 }}>
        <p style={{ fontSize: 18, fontFamily: "'Cormorant Garamond', serif", color: C.text, fontWeight: 400 }}>
          {s.heading}
        </p>
        <p style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>
          {s.subheading}
        </p>
      </div>

      {/* 초대코드 발급 */}
      <div style={{
        background: alpha(C.amber, 0.06),
        border: `1px solid ${alpha(C.amber, 0.2)}`,
        borderRadius: 16, padding: '16px',
      }}>
        <p style={{ fontSize: 12, color: C.text, marginBottom: 10 }}>{s.inviteTitle}</p>
        {token ? (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: alpha(C.amber, 0.1), borderRadius: 10, padding: '10px 14px', marginBottom: 8,
            }}>
              <span style={{
                flex: 1, fontFamily: 'monospace', fontSize: 20,
                letterSpacing: '0.15em', color: C.amber, textAlign: 'center',
              }}>
                {token}
              </span>
              <button
                onClick={() => handleCopy(token)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.text3, display: 'flex' }}
                aria-label={s.copyAriaLabel}
              >
                {copied ? <Check size={16} color={C.amber} /> : <Copy size={16} />}
              </button>
            </div>
            <p style={{ fontSize: 10, color: C.text4, textAlign: 'center' }}>{s.tokenExpiry}</p>
          </>
        ) : (
          <button
            onClick={() => createSession.mutate()}
            disabled={createSession.isPending}
            style={{
              width: '100%', padding: '10px', borderRadius: 10,
              background: alpha(C.amber, 0.14), border: `1px solid ${alpha(C.amber, 0.28)}`,
              color: C.amber, fontSize: 13, cursor: 'pointer',
            }}
          >
            {createSession.isPending ? s.issuingCode : s.issueButton}
          </button>
        )}
      </div>

      {/* 코드 입력 */}
      <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px' }}>
        <button
          onClick={() => setShowJoin(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
        >
          <p style={{ fontSize: 12, color: C.text }}>{s.enterCodeTitle}</p>
          <p style={{ fontSize: 10, color: C.text4, marginTop: 2 }}>{s.enterCodeSub}</p>
        </button>
        {showJoin && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              value={codeInput}
              onChange={e => setCodeInput(e.target.value.toUpperCase().slice(0, 8))}
              placeholder="XXXXXXXX"
              style={{
                width: '100%', textAlign: 'center', fontSize: 20,
                fontFamily: 'monospace', letterSpacing: '0.15em',
                background: C.bg2, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: '10px', color: C.text,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            {joinError && (
              <p style={{ fontSize: 11, color: '#EF4444', textAlign: 'center' }}>{joinError}</p>
            )}
            <button
              onClick={handleJoin}
              disabled={codeInput.length < 6 || joinSession.isPending}
              style={{
                width: '100%', padding: '10px', borderRadius: 10,
                background: codeInput.length >= 6 ? alpha(C.amber, 0.14) : C.bg2,
                border: `1px solid ${codeInput.length >= 6 ? alpha(C.amber, 0.28) : C.border}`,
                color: codeInput.length >= 6 ? C.amber : C.text4,
                fontSize: 13, cursor: codeInput.length >= 6 ? 'pointer' : 'default',
              }}
            >
              {joinSession.isPending ? s.connecting : s.connectButton}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
