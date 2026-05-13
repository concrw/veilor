import { useLanguageContext } from '@/context/LanguageContext';
import { getLocaleSync } from './index';
import type { LocaleResource, SupportedLanguage } from './types';

export function useT(): LocaleResource {
  const { translations } = useLanguageContext();
  // LanguageProvider가 translations 로드 전 앱을 막으므로 항상 non-null
  return translations!;
}

/** 컴포넌트 외부(이벤트 핸들러, 유틸 함수 등)에서 사용할 때 language를 직접 전달 */
export function getT(language: SupportedLanguage): LocaleResource {
  return getLocaleSync(language);
}
