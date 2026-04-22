import { useState, useRef, useCallback, useEffect } from 'react';

// kokoro-js는 동적 임포트 — 초기 번들에 포함되지 않음 (150MB 모델)
type KokoroPipeline = {
  generate: (text: string, options: { voice: string }) => Promise<{ audio: { toWav: () => Uint8Array } }>;
};

// 언어별 기본 여성 화자
const DEFAULT_VOICES: Record<string, string> = {
  ko: 'kf_alpha',   // 한국어 여성 — 차분하고 자연스러운 톤
  en: 'af_jessica', // 영어 여성 — 따뜻한 conversational
};

export interface UseKokoroTTSOptions {
  lang?: string;
  voice?: string;
  onEnd?: () => void;
}

export function useKokoroTTS(options: UseKokoroTTSOptions = {}) {
  const { lang = 'ko-KR', voice, onEnd } = options;
  const [speaking,  setSpeaking]  = useState(false);
  const [loading,   setLoading]   = useState(false); // 모델 로딩 중
  const [supported, setSupported] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const pipelineRef = useRef<KokoroPipeline | null>(null);
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const onEndRef    = useRef(onEnd);
  onEndRef.current  = onEnd;

  const langCode = lang.startsWith('ko') ? 'ko' : 'en';
  const resolvedVoice = voice ?? DEFAULT_VOICES[langCode];

  // 모델 사전 로드 (컴포넌트 마운트 후 백그라운드에서)
  useEffect(() => {
    let cancelled = false;
    async function preload() {
      if (pipelineRef.current) return;
      try {
        setLoading(true);
        const { KokoroTTS } = await import('kokoro-js');
        if (cancelled) return;
        // @ts-expect-error — kokoro-js 타입 정의 미완성
        pipelineRef.current = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0', {
          dtype: 'q8',  // 양자화 — 모델 크기 축소, 품질 유지
        });
      } catch (err) {
        if (cancelled) return;
        console.warn('[KokoroTTS] 모델 로드 실패, Web Speech 폴백 사용:', err);
        setSupported(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    preload();
    return () => { cancelled = true; };
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;
    stop();

    // 모델 미로드 시 폴백 (Web Speech API)
    if (!pipelineRef.current) {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang  = lang;
      utt.rate  = 0.95;
      utt.onend = () => { setSpeaking(false); onEndRef.current?.(); };
      utt.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utt);
      return;
    }

    setSpeaking(true);
    setError(null);

    try {
      const result = await pipelineRef.current.generate(text, { voice: resolvedVoice });
      const wav    = result.audio.toWav();
      const blob   = new Blob([wav], { type: 'audio/wav' });
      const url    = URL.createObjectURL(blob);
      const audio  = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        setSpeaking(false);
        onEndRef.current?.();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        setSpeaking(false);
        onEndRef.current?.();
      };

      await audio.play();
    } catch (err) {
      setSpeaking(false);
      setError(err instanceof Error ? err.message : 'TTS 오류');
      onEndRef.current?.();
    }
  }, [resolvedVoice, lang, stop]);

  return { speaking, loading, supported, error, speak, stop };
}
