import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { safeGetItem, safeSetItem } from '@/lib/storage';

const STORAGE_KEY = 'veilor_voice_mode_enabled';

interface Props {
  onTranscript: (text: string) => void;
  accentColor?: string;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default function VoiceModeButton({ onTranscript, accentColor = '#C97A6A' }: Props) {
  const [enabled, setEnabled] = useState(() => safeGetItem(STORAGE_KEY) === 'true');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const SpeechAPI = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;

  const stopRecognition = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const startRecognition = useCallback(() => {
    if (!SpeechAPI) return;
    const rec = new SpeechAPI();
    rec.lang = navigator.language || 'ko-KR';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? '';
      if (transcript) onTranscript(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [SpeechAPI, onTranscript]);

  useEffect(() => {
    if (!enabled) stopRecognition();
  }, [enabled, stopRecognition]);

  useEffect(() => () => stopRecognition(), [stopRecognition]);

  if (!SpeechAPI) return null;

  const toggle = () => {
    if (listening) {
      stopRecognition();
    } else if (enabled) {
      startRecognition();
    } else {
      const next = true;
      setEnabled(next);
      safeSetItem(STORAGE_KEY, 'true');
      startRecognition();
    }
  };

  const toggleEnabled = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !enabled;
    setEnabled(next);
    safeSetItem(STORAGE_KEY, String(next));
    if (!next) stopRecognition();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <button
        onClick={toggle}
        aria-label={listening ? '음성 입력 중지' : '음성 입력 시작'}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: listening
            ? `color-mix(in srgb, ${accentColor} 20%, #1C1917)`
            : 'rgba(255,255,255,0.06)',
          color: listening ? accentColor : 'rgba(231,229,228,0.5)',
          transition: 'all 0.2s',
          outline: listening ? `2px solid ${accentColor}55` : 'none',
        }}
      >
        {listening
          ? <Mic size={15} style={{ animation: 'pulse 1.2s ease-in-out infinite' }} />
          : <MicOff size={15} />}
      </button>
      {enabled && !listening && (
        <button
          onClick={toggleEnabled}
          aria-label="음성 모드 비활성화"
          style={{
            fontSize: 9, color: 'rgba(231,229,228,0.3)', background: 'none',
            border: 'none', cursor: 'pointer', padding: '0 2px', lineHeight: 1,
          }}
        >
          off
        </button>
      )}
    </div>
  );
}
