import '@testing-library/jest-dom';
import { ko } from '@/i18n/ko';

// Global mock: LanguageContext — avoids supabase.auth.getUser in every test
vi.mock('@/context/LanguageContext', () => ({
  useLanguageContext: () => ({ 
    language: 'ko', 
    setLanguage: vi.fn(), 
    isLoading: false,
    translations: ko 
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
}));
