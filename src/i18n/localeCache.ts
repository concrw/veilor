import type { SupportedLanguage, LocaleResource } from './types';

const cache = new Map<SupportedLanguage, LocaleResource>();

export function getCachedLocale(lang: SupportedLanguage): LocaleResource | undefined {
  return cache.get(lang);
}

export function setCachedLocale(lang: SupportedLanguage, locale: LocaleResource): void {
  cache.set(lang, locale);
}
