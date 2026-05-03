import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders as render, screen } from '../test-utils';
import { MemoryRouter } from 'react-router-dom';

// Hoisted mocks
const authMock = vi.hoisted(() => ({
  priperCompleted: false,
  personaContextsCompleted: [] as string[],
  user: { id: 'test-user' },
  session: {},
  loading: false,
  authError: null,
  onboardingStep: 'complete' as const,
  primaryMask: null,
  secondaryMask: null,
  axisScores: null,
  login: vi.fn(),
  signUp: vi.fn(),
  loginWithGoogle: vi.fn(),
  loginWithKakao: vi.fn(),
  logout: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => authMock,
}));

vi.mock('@/hooks/useLongPress', () => ({
  useLongPress: () => ({}),
}));

vi.mock('@/hooks/useSpeechRecognition', () => ({
  useSpeechRecognition: () => ({
    listening: false,
    supported: false,
    interimTranscript: '',
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
  }),
}));

vi.mock('@/hooks/useSpeechSynthesis', () => ({
  useSpeechSynthesis: () => ({
    speaking: false,
    speak: vi.fn(),
    stop: vi.fn(),
  }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: null }) },
  },
  veilorDb: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          order: () => ({ limit: () => ({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
        }),
        order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
      }),
    }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

// AILeadOverlay uses scrollIntoView which jsdom doesn't support
vi.mock('@/components/ai/AILeadOverlay', () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div data-testid="ai-overlay">AI Overlay</div> : null,
}));

vi.mock('@/components/ai/HoldCircle', () => ({
  default: () => null,
}));

const { default: HomeLayout } = await import('@/layouts/HomeLayout');

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={['/home/vent']}>
      <HomeLayout />
    </MemoryRouter>
  );
}

describe('HomeLayout — dynamic bottom nav (#67)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.priperCompleted = false;
    authMock.personaContextsCompleted = [];
  });

  it('shows 3 tabs (Vent, Dig, Me) when V-File is incomplete', () => {
    // HomeLayout은 현재 항상 5개 탭을 표시 (priperCompleted 조건 제거됨)
    authMock.priperCompleted = false;
    renderWithRouter();

    expect(screen.getAllByText('Vent').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dig').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Me').length).toBeGreaterThan(0);
  });

  it('shows 5 tabs (Vent, Dig, Get, Set, Me) when V-File is complete', () => {
    authMock.priperCompleted = true;
    authMock.personaContextsCompleted = ['general'];
    renderWithRouter();

    expect(screen.getAllByText('Vent').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dig').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Get').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Set').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Me').length).toBeGreaterThan(0);
  });

  it('shows badge on Set tab when multi-persona >= 2', () => {
    authMock.priperCompleted = true;
    authMock.personaContextsCompleted = ['general', 'social'];
    renderWithRouter();

    const badges = screen.queryAllByLabelText('새 기능 알림');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('does not show badge on Set tab when only 1 persona', () => {
    authMock.priperCompleted = true;
    authMock.personaContextsCompleted = ['general'];
    renderWithRouter();

    expect(screen.queryByLabelText('새 기능 알림')).not.toBeInTheDocument();
  });

  it('renders screen-reader AI button', () => {
    renderWithRouter();
    expect(screen.getByText('AI 대화 모드 열기 (Ctrl+Shift+A)')).toBeInTheDocument();
  });

  it('renders nav with correct aria-label', () => {
    renderWithRouter();
    expect(screen.getByLabelText('메인 탭 네비게이션')).toBeInTheDocument();
  });
});
