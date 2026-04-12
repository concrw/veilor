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
  // Fall back to browser language
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language?.slice(0, 2);
    if (browserLang === 'en') return 'en';
  }
  return 'ko'; // default
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(
    getInitialLanguage,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mark loading complete after initial render
    setIsLoading(false);
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      safeSetItem(STORAGE_KEY, lang);
    } catch {
      // ignore write failures
    }
    // Update html lang attribute
    document.documentElement.lang = lang;
  }, []);

  // Set html lang on mount
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
