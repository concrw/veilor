import { useRef } from 'react';
import { C } from '@/lib/colors';
import { WaveForm } from './WaveForm';

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface AIStrings {
  inputLabel: string;
  inputPlaceholderThinking: (name: string) => string;
  inputPlaceholderListening: string;
  inputPlaceholderIdle: string;
  sendLabel: string;
  stopReadLabel: string;
  micLabelListening: string;
  micLabelThinking: string;
  micLabelStart: string;
  micLabelUnsupported: string;
  closeLabel: string;
  swipeHint: string;
  sttUnsupported: string;
  statusReadStopped: string;
}

interface Props {
  voiceState: VoiceState;
  isListening: boolean;
  sttSupported: boolean;
  sttInterimTranscript: string;
  message: string;
  setMessage: (v: string) => void;
  handleTextSend: () => void;
  toggleMic: () => void;
  onClose: () => void;
  onTtsStop: () => void;
  aiName: string;
  s: AIStrings;
  micBtnRef: React.RefObject<HTMLButtonElement>;
}

export function AIControlBar({
  voiceState, isListening, sttSupported, sttInterimTranscript,
  message, setMessage, handleTextSend, toggleMic, onClose, onTtsStop,
  aiName, s, micBtnRef,
}: Props) {
  const micAriaLabel =
    voiceState === 'listening' ? s.micLabelListening :
    voiceState === 'thinking'  ? s.micLabelThinking :
    sttSupported               ? s.micLabelStart :
                                 s.micLabelUnsupported;

  return (
    <>
      {/* 스와이프 힌트 */}
      <div aria-hidden="true" style={{
        width: 32, height: 3, borderRadius: 99, background: C.border,
        margin: '12px auto 0',
      }} />
      <p aria-hidden="true" style={{ textAlign: 'center', fontSize: 10, color: C.text5, margin: '6px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
        {s.swipeHint}
      </p>

      {/* 인식 중 interim 텍스트 */}
      {sttInterimTranscript && (
        <p
          aria-hidden="true"
          style={{
            textAlign: 'center', fontSize: 12, color: C.text3,
            padding: '0 20px 4px', fontFamily: "'DM Sans', sans-serif",
            fontStyle: 'italic', minHeight: 20,
          }}
        >
          {sttInterimTranscript}
        </p>
      )}

      {/* 파형 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <WaveForm active={isListening || voiceState === 'speaking'} />
      </div>

      {/* 하단 입력 영역 */}
      <div style={{ padding: '0 20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {/* 텍스트 입력 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 360,
          background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px',
        }}>
          <input
            aria-label={s.inputLabel}
            aria-describedby="voice-status"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={
              voiceState === 'thinking' ? s.inputPlaceholderThinking(aiName) :
              voiceState === 'listening' ? s.inputPlaceholderListening :
              s.inputPlaceholderIdle
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
              aria-label={s.sendLabel}
              onClick={handleTextSend}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: C.amberGold, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 8, margin: -8,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6 10V2M6 2L2 6M6 2l4 4" stroke={C.bg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* 버튼 행 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {voiceState === 'speaking' && (
            <button
              aria-label={s.stopReadLabel}
              onClick={onTtsStop}
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
            }}
            className="voice-mic-btn"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="7" y="2" width="6" height="10" rx="3" stroke={isListening ? C.bg : C.text3} strokeWidth="1.5"/>
              <path d="M4 10a6 6 0 0 0 12 0" stroke={isListening ? C.bg : C.text3} strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 16v2" stroke={isListening ? C.bg : C.text3} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          <button
            onClick={onClose}
            aria-label={s.closeLabel}
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

        {!sttSupported && (
          <p role="note" style={{ fontSize: 10, color: C.text5, textAlign: 'center' }}>
            {s.sttUnsupported}
          </p>
        )}
      </div>
    </>
  );
}
