import { useT } from '@/i18n/useT';
import { useLanguageContext } from '@/context/LanguageContext';
import type { LocaleResource } from '@/i18n/types';

// useT()를 내부적으로 사용하는 얇은 래퍼 — 기존 import 경로 호환 유지
export const useTranslation = () => {
  const translations = useT();
  const { language, isLoading } = useLanguageContext();
  return { translations, language, isLoading };
};

export const useCommonTranslations = (): LocaleResource['common'] => useT().common;
export const useNavTranslations = (): LocaleResource['nav'] => useT().nav;
export const useAuthTranslations = (): LocaleResource['auth'] => useT().auth;
export const useOnboardingTranslations = (): LocaleResource['onboarding'] => useT().onboarding;
export const useVentTranslations = (): LocaleResource['vent'] => useT().vent;
export const useDigTranslations = (): LocaleResource['dig'] => useT().dig;
export const useSetTranslations = (): LocaleResource['set'] => useT().set;
export const useGetTranslations = (): LocaleResource['get'] => useT().get;
export const useMeTranslations = (): LocaleResource['me'] => useT().me;
export const useCrisisTranslations = (): LocaleResource['crisis'] => useT().crisis;
export const useClearTranslations = (): LocaleResource['clear'] => useT().clear;
export const useErrorTranslations = (): LocaleResource['errors'] => useT().errors;
export const useCommunityTranslations = (): LocaleResource['community'] => useT().community;
export const useRelationTranslations = (): LocaleResource['relation'] => useT().relation;
export const useWorkTranslations = (): LocaleResource['work'] => useT().work;
