import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { SupportedLanguage, LocaleResource } from '@/i18n/types';
import { loadLocale, getLocaleSync } from '@/i18n/index';
import { safeGetItem, safeSetItem } from '@/lib/storage';
import { veilorDb } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  isLoading: boolean;
  translations: LocaleResource | null;
}

const STORAGE_KEY = 'veilor_lang';

function getInitialLanguage(): SupportedLanguage {
  try {
    const stored = safeGetItem(STORAGE_KEY);
    if (stored === 'ko' || stored === 'en' || stored === 'ja') return stored;
  } catch {
    // SSR or localStorage unavailable
  }
  return 'en';
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(getInitialLanguage);
  const [translations, setTranslations] = useState<LocaleResource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // locale 동적 로드
  useEffect(() => {
    let cancelled = false;
    loadLocale(language).then(t => {
      if (!cancelled) setTranslations(t);
    });
    return () => { cancelled = true; };
  }, [language]);

  // 로그인 상태에서 DB preferred_lang 로드 → localStorage보다 우선
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (cancelled || !user) { setIsLoading(false); return; }
      const { data } = await veilorDb
        .from('user_profiles')
        .select('preferred_lang')
        .eq('user_id', user.id)
        .single();
      if (cancelled) return;
      if (data?.preferred_lang === 'ko' || data?.preferred_lang === 'en' || data?.preferred_lang === 'ja') {
        setLanguageState(data.preferred_lang as SupportedLanguage);
        safeSetItem(STORAGE_KEY, data.preferred_lang);
      }
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    safeSetItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      veilorDb
        .from('user_profiles')
        .update({ preferred_lang: lang, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .then(() => {});
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // translations 로드 전 앱 렌더 차단 — useT()가 항상 non-null 보장
  if (!translations) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLoading, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return ctx;
}
