import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL as string;
const TTS_ENDPOINT  = `${SUPABASE_URL}/functions/v1/elevenlabs-tts`;

export interface UseElevenLabsTTSOptions {
  lang?: string;
  voiceId?: string;   // 사용자 클론 Voice ID
  onEnd?: () => void;
}

export function useElevenLabsTTS(options: UseElevenLabsTTSOptions = {}) {
  const { lang = 'ko-KR', voiceId, onEnd } = options;
  const [speaking, setSpeaking] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const onEndRef   = useRef(onEnd);
  onEndRef.current = onEnd;

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
    setSpeaking(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('로그인이 필요합니다.');

      const res = await fetch(TTS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ text, voiceId, lang }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? `TTS 오류 (${res.status})`);
      }

      const blob = URL.createObjectURL(await res.blob());
      const audio = new Audio(blob);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(blob);
        audioRef.current = null;
        setSpeaking(false);
        onEndRef.current?.();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(blob);
        audioRef.current = null;
        setSpeaking(false);
        onEndRef.current?.();
      };

      await audio.play();
    } catch (err) {
      setSpeaking(false);
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      onEndRef.current?.();
    }
  }, [voiceId, lang, stop]);

  return { speaking, error, speak, stop, supported: true };
}
