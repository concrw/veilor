import { useLanguageContext } from '@/context/LanguageContext';
import { locales } from './index';
import type { LocaleResource } from './types';

export function useT(): LocaleResource {
  const { language } = useLanguageContext();
  return locales[language] ?? locales.en;
}

/** 컴포넌트 외부(이벤트 핸들러, 유틸 함수 등)에서 사용할 때 language를 직접 전달 */
export function getT(language: 'ko' | 'en' | 'ja'): LocaleResource {
  return locales[language] ?? locales.en;
}
