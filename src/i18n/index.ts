export type {
  SupportedLanguage,
  TranslationFunction,
  TranslationStrings,
  LocaleResource,
  LocaleMap,
} from './types';

import type { SupportedLanguage, LocaleResource } from './types';
import { getCachedLocale, setCachedLocale } from './localeCache';

export async function loadLocale(lang: SupportedLanguage): Promise<LocaleResource> {
  const cached = getCachedLocale(lang);
  if (cached) return cached;
  let locale: LocaleResource;
  switch (lang) {
    case 'ko': locale = (await import('./ko')).ko; break;
    case 'ja': locale = (await import('./ja')).ja; break;
    default:   locale = (await import('./en')).en; break;
  }
  setCachedLocale(lang, locale);
  return locale;
}

/** 동기 버전 — LanguageContext가 이미 로드한 경우에만 유효, 캐시 미스 시 en fallback */
export function getLocaleSync(lang: SupportedLanguage): LocaleResource {
  return getCachedLocale(lang) ?? getCachedLocale('en')!;
}
