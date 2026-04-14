import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSpeechSynthesisOptions {
  lang?: string;
  rate?: number;    // 0.1~10, default 0.95
  pitch?: number;   // 0~2, default 1
  onEnd?: () => void;
}

/** 한국어 음성을 찾아 반환. iOS Safari는 getVoices()가 비동기로 채워지므로
 *  voiceschanged 이벤트까지 대기한다. 5초 안에 로드되지 않으면 null 반환. */
function resolveKoreanVoice(): Promise<SpeechSynthesisVoice | null> {
  return new Promise(resolve => {
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      return voices.find(v => v.lang.startsWith('ko')) ?? null;
    };

    const immediate = pick();
    if (immediate) { resolve(immediate); return; }

    // iOS 18 등에서 목록이 아직 비어 있을 때 — voiceschanged 대기
    const onChanged = () => {
      clearTimeout(timer);
      resolve(pick());
    };
    const timer = setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
      resolve(pick()); // 타임아웃 후 재시도 (없으면 null → 시스템 기본 음성 사용)
    }, 5000);

    window.speechSynthesis.addEventListener('voiceschanged', onChanged, { once: true });
  });
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const { lang = 'ko-KR', rate = 0.95, pitch = 1, onEnd } = options;
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onEndRef     = useRef(onEnd);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!('speechSynthesis' in window)) return;

    // 이전 발화 중단
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang  = lang;
    utterance.rate  = rate;
    utterance.pitch = pitch;

    // 한국어 음성 선택 — iOS voiceschanged 비동기 대기 포함
    const koVoice = await resolveKoreanVoice();
    if (koVoice) utterance.voice = koVoice;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend   = () => {
      setSpeaking(false);
      onEndRef.current?.();
    };
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [lang, rate, pitch]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return {
    speaking,
    supported,
    speak,
    stop,
  };
}
