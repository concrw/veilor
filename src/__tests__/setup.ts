import '@testing-library/jest-dom';

// Global mock: LanguageContext — avoids supabase.auth.getUser in every test
vi.mock('@/context/LanguageContext', () => ({
  useLanguageContext: () => ({ language: 'ko', setLanguage: vi.fn(), isLoading: false }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
}));
