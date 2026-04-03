import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { OnboardingStep, AxisScores } from '@/context/AuthContext';

// Hoisted mocks
const mocks = vi.hoisted(() => ({
  onAuthStateChange: vi.fn(),
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
  profileSelect: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: mocks.onAuthStateChange,
      getSession: mocks.getSession,
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
      signInWithOAuth: mocks.signInWithOAuth,
      signOut: mocks.signOut,
    },
  },
  veilrumDb: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: mocks.profileSelect,
        }),
      }),
      update: () => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      upsert: () => ({
        select: () => ({
          single: vi.fn().mockResolvedValue({ data: {}, error: null }),
        }),
      }),
    }),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Import after mocks
const { AuthProvider, useAuth } = await import('@/context/AuthContext');

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mocks.profileSelect.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
  });

  it('provides initial unauthenticated state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.onboardingStep).toBe('welcome');
    expect(result.current.priperCompleted).toBe(false);
    expect(result.current.authError).toBeNull();
  });

  it('exports correct type for OnboardingStep', () => {
    const step: OnboardingStep = 'cq';
    expect(['welcome', 'cq', 'priper', 'completed']).toContain(step);
  });

  it('exports correct type for AxisScores', () => {
    const scores: AxisScores = { A: 50, B: 60, C: 70, D: 80 };
    expect(scores.A).toBe(50);
    expect(scores.D).toBe(80);
  });

  it('provides signIn function', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    const { error } = await result.current.signIn('test@test.com', 'password');
    expect(error).toBeNull();
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password',
    });
  });

  it('provides signUp function', async () => {
    mocks.signUp.mockResolvedValue({ data: { user: null }, error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    const { error } = await result.current.signUp('new@test.com', 'password', 'Nick');
    expect(error).toBeNull();
    expect(mocks.signUp).toHaveBeenCalled();
  });

  it('provides signOut function', async () => {
    mocks.signOut.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await result.current.signOut();
    expect(mocks.signOut).toHaveBeenCalled();
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow();
  });
});
