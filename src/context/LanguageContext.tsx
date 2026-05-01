import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { SupportedLanguage } from '@/i18n/types';
import { safeGetItem, safeSetItem } from '@/lib/storage';
import { veilorDb } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  isLoading: boolean;
}

const STORAGE_KEY = 'veilor_lang';

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

function getInitialLanguage(): SupportedLanguage {
  try {
    const stored = safeGetItem(STORAGE_KEY);
    if (stored === 'ko' || stored === 'en') return stored;
  } catch {
    // SSR or localStorage unavailable
  }
  // 브라우저 언어 감지 (localStorage 미설정 시)
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language?.slice(0, 2);
    if (browserLang === 'en') return 'en';
  }
  return 'ko';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(
    getInitialLanguage,
  );
  const [isLoading, setIsLoading] = useState(true);

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
      if (data?.preferred_lang === 'ko' || data?.preferred_lang === 'en') {
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
    // 로그인 상태면 DB에도 저장
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

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLoading }}>
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
