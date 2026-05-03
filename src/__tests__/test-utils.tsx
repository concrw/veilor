import { render, type RenderOptions } from '@testing-library/react';
import { ModeProvider } from '@/context/ModeContext';
import { DomainProvider } from '@/context/DomainContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { SupportedLanguage } from '@/i18n/types';

// Lightweight LanguageContext stub for tests — avoids supabase.auth.getUser calls
const StubLanguageContext = createContext<{
  language: SupportedLanguage;
  setLanguage: (l: SupportedLanguage) => void;
  isLoading: boolean;
} | undefined>(undefined);

export function StubLanguageProvider({ children }: { children: ReactNode }) {
  return (
    <StubLanguageContext.Provider value={{ language: 'ko', setLanguage: () => {}, isLoading: false }}>
      {children}
    </StubLanguageContext.Provider>
  );
}

export function useStubLanguageContext() {
  return useContext(StubLanguageContext)!;
}

function AllProviders({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <StubLanguageProvider>
        <ModeProvider>
          <DomainProvider>
            {children}
          </DomainProvider>
        </ModeProvider>
      </StubLanguageProvider>
    </QueryClientProvider>
  );
}

export function renderWithProviders(ui: ReactNode, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
