import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render, screen, fireEvent } from '../test-utils';
import { MemoryRouter } from 'react-router-dom';
import ExperientialContent from '@/components/content/ExperientialContent';

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: null, primaryMask: null, axisScores: null }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  veilorDb: { from: () => ({ insert: () => Promise.resolve({ error: null }) }) },
  supabase: {},
}));

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('ExperientialContent', () => {
  it('renders 5 content items', () => {
    renderWithRouter(<ExperientialContent />);
    expect(screen.getByText('거울 실험')).toBeInTheDocument();
    expect(screen.getByText('보내지 않을 편지')).toBeInTheDocument();
    expect(screen.getByText('관계 타임라인')).toBeInTheDocument();
    expect(screen.getByText(/친밀한 관계의 경계 대화/)).toBeInTheDocument();
    expect(screen.getByText('욕구 표현 연습')).toBeInTheDocument();
  });

  it('opens content detail on click', () => {
    renderWithRouter(<ExperientialContent />);
    fireEvent.click(screen.getByText('거울 실험'));
    expect(screen.getByText(/편안한 자세로 눈을 감으세요/)).toBeInTheDocument();
  });

  it('filters by level', () => {
    renderWithRouter(<ExperientialContent />);
    fireEvent.click(screen.getByText('Lv.3이하'));
    // Lv.4, Lv.5 items should be filtered out
    expect(screen.queryByText('욕구 표현 연습')).not.toBeInTheDocument();
  });

  it('navigates steps forward', () => {
    renderWithRouter(<ExperientialContent />);
    fireEvent.click(screen.getByText('거울 실험'));
    expect(screen.getByText(/편안한 자세/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('다음'));
    expect(screen.getByText(/갈등이 있었던 사람/)).toBeInTheDocument();
  });

  it('closes detail and returns to list', () => {
    renderWithRouter(<ExperientialContent />);
    fireEvent.click(screen.getByText('거울 실험'));
    fireEvent.click(screen.getByText('닫기'));
    expect(screen.getByText('거울 실험')).toBeInTheDocument();
  });
});
