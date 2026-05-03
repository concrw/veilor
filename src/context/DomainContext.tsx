import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Domain = 'self' | 'work' | 'relation' | 'social';

interface DomainContextValue {
  domain: Domain;
  setDomain: (domain: Domain) => void;
}

const STORAGE_KEY = 'veilor_domain';
const DEFAULT_DOMAIN: Domain = 'self';

function getStoredDomain(): Domain {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'self' || stored === 'work' || stored === 'relation' || stored === 'social') {
      return stored;
    }
  } catch {
    // silent
  }
  return DEFAULT_DOMAIN;
}

const DomainContext = createContext<DomainContextValue | null>(null);

export function DomainProvider({ children }: { children: React.ReactNode }) {
  const [domain, setDomainState] = useState<Domain>(getStoredDomain);

  const setDomain = useCallback((newDomain: Domain) => {
    setDomainState(newDomain);
    try {
      localStorage.setItem(STORAGE_KEY, newDomain);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-domain', domain);
  }, [domain]);

  return (
    <DomainContext.Provider value={{ domain, setDomain }}>
      {children}
    </DomainContext.Provider>
  );
}

export function useDomain() {
  const ctx = useContext(DomainContext);
  if (!ctx) throw new Error('useDomain must be used inside DomainProvider');
  return ctx;
}
