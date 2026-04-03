export { ko } from './ko';
export { en } from './en';
export type {
  SupportedLanguage,
  TranslationFunction,
  TranslationStrings,
  LocaleResource,
  LocaleMap,
} from './types';

import { ko } from './ko';
import { en } from './en';
import type { LocaleMap } from './types';

/** All available locales keyed by language code */
export const locales: LocaleMap = { ko, en };
