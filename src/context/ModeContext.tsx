import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Domain } from './DomainContext';

// ──────────────────────────────────────────────────────────────────────────────
// 타입 정의
// ──────────────────────────────────────────────────────────────────────────────

export type UXMode = 'original' | 'clear' | 'routine' | 'focus' | 'sprint' | 'connect' | 'mirror' | 'social';

export const DOMAIN_MODES: Record<Domain, UXMode[]> = {
  self:     ['original', 'clear', 'routine'],
  work:     ['original', 'clear', 'routine', 'focus', 'sprint'],
  relation: ['original', 'clear', 'routine', 'connect', 'mirror'],
  social:   ['original', 'clear'],
};

interface ModeContextValue {
  mode: UXMode;
  setMode: (mode: UXMode) => void;
  isFirstVisit: boolean;
  dismissFirstVisit: () => void;
  isReady: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// 상수
// ──────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'veilor_ux_mode';
const FIRST_VISIT_KEY = 'veilor_mode_selected';

const DEFAULT_MODE: UXMode = 'original';

const VALID_MODES: UXMode[] = ['original', 'clear', 'routine', 'focus', 'sprint', 'connect', 'mirror', 'social'];

function getStoredMode(): UXMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID_MODES.includes(stored as UXMode)) {
      return stored as UXMode;
    }
  } catch {
    // localStorage 접근 불가 환경 (SSR 등)
  }
  return DEFAULT_MODE;
}

// ──────────────────────────────────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────────────────────────────────

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<UXMode>(getStoredMode);
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    try {
      return localStorage.getItem(FIRST_VISIT_KEY) !== 'true';
    } catch {
      return false;
    }
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const setMode = useCallback((newMode: UXMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // silent
    }
  }, []);

  const dismissFirstVisit = useCallback(() => {
    setIsFirstVisit(false);
    try {
      localStorage.setItem(FIRST_VISIT_KEY, 'true');
    } catch {
      // silent
    }
  }, []);

  // CSS 커스텀 프로퍼티로 모드 토큰 적용
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-ux-mode', mode);
  }, [mode]);

  return (
    <ModeContext.Provider value={{ mode, setMode, isFirstVisit, dismissFirstVisit, isReady }}>
      {children}
    </ModeContext.Provider>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────────────────────────

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used inside ModeProvider');
  return ctx;
}
