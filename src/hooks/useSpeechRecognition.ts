import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

// Web Speech API 타입 (브라우저 내장)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: Event & { error: string }) => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { lang = 'ko-KR', continuous = false, onResult, onEnd, onError } = options;
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // 콜백을 ref로 보관 — 재생성 시 인식 인스턴스가 낡은 클로저를 붙잡지 않도록
  const onResultRef = useRef(onResult);
  const onEndRef    = useRef(onEnd);
  const onErrorRef  = useRef(onError);
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onEndRef.current    = onEnd;    }, [onEnd]);
  useEffect(() => { onErrorRef.current  = onError;  }, [onError]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    // 이전 인스턴스 정리
    recognitionRef.current?.abort();

    const recognition = new SR();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setListening(true);
      setTranscript('');
      setInterimTranscript('');
    };

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let final = '';
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) {
        setTranscript(prev => prev + final);
        onResultRef.current?.(final);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (e) => {
      setListening(false);
      setInterimTranscript('');
      // 'no-speech' · 'aborted'는 정상 종료이지만 호출자에게는 전달
      onErrorRef.current?.(e.error);
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('Speech recognition error:', e.error);
      }
    };

    recognition.onend = () => {
      setListening(false);
      setInterimTranscript('');
      onEndRef.current?.();
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [lang, continuous]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const abort = useCallback(() => {
    recognitionRef.current?.abort();
    setListening(false);
    setInterimTranscript('');
  }, []);

  return {
    listening,
    transcript,
    interimTranscript,
    supported,
    start,
    stop,
    abort,
  };
}
