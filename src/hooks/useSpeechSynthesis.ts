import { useCallback } from 'react';
import { useKokoroTTS }      from './useKokoroTTS';
import { useElevenLabsTTS }  from './useElevenLabsTTS';
import { useVeilorSubscription } from './useVeilorSubscription';

interface UseSpeechSynthesisOptions {
  lang?: string;
  rate?: number;    // Web Speech 폴백 전용
  pitch?: number;   // Web Speech 폴백 전용
  voiceId?: string; // Pro: ElevenLabs 사용자 클론 Voice ID
  onEnd?: () => void;
}

/**
 * 티어별 TTS 분기
 * - 무료: Kokoro-82M (브라우저 로컬, 비용 0)
 * - Pro+: ElevenLabs (고품질, Voice Clone 지원)
 */
export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const { lang = 'ko-KR', voiceId, onEnd } = options;
  const { isPro } = useVeilorSubscription();

  const kokoro  = useKokoroTTS({ lang, onEnd });
  const eleven  = useElevenLabsTTS({ lang, voiceId, onEnd });

  const speak = useCallback(async (text: string) => {
    if (isPro) {
      await eleven.speak(text);
    } else {
      await kokoro.speak(text);
    }
  }, [isPro, eleven, kokoro]);

  const stop = useCallback(() => {
    eleven.stop();
    kokoro.stop();
  }, [eleven, kokoro]);

  return {
    speaking:  isPro ? eleven.speaking  : kokoro.speaking,
    supported: true,
    loading:   isPro ? false            : kokoro.loading,  // Kokoro 모델 로딩 상태
    speak,
    stop,
  };
}
