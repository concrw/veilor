import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render, screen, fireEvent } from '../test-utils';
import MiniToolsCard from '@/components/set/MiniToolsCard';

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

describe('MiniToolsCard', () => {
  it('renders 4 tools', () => {
    render(<MiniToolsCard />);
    expect(screen.getByText('호흡')).toBeInTheDocument();
    expect(screen.getByText('그라운딩')).toBeInTheDocument();
    expect(screen.getByText('감정 체크인')).toBeInTheDocument();
    expect(screen.getByText('감사 일기')).toBeInTheDocument();
  });

  it('shows breathing tool on click', () => {
    render(<MiniToolsCard />);
    fireEvent.click(screen.getByText('호흡'));
    expect(screen.getByText('들이쉬세요')).toBeInTheDocument();
  });

  it('shows grounding tool on click', () => {
    render(<MiniToolsCard />);
    fireEvent.click(screen.getByText('그라운딩'));
    expect(screen.getByText(/5-4-3-2-1 그라운딩/)).toBeInTheDocument();
  });

  it('shows emotion checkin on click', () => {
    render(<MiniToolsCard />);
    fireEvent.click(screen.getByText('감정 체크인'));
    expect(screen.getByText(/지금 느끼는 감정/)).toBeInTheDocument();
    expect(screen.getByText('불안')).toBeInTheDocument();
  });

  it('shows gratitude on click', () => {
    render(<MiniToolsCard />);
    fireEvent.click(screen.getByText('감사 일기'));
    expect(screen.getByText(/오늘 고마운 것/)).toBeInTheDocument();
  });

  it('closes breathing tool on close button', () => {
    render(<MiniToolsCard />);
    fireEvent.click(screen.getByText('호흡'));
    expect(screen.getByText('들이쉬세요')).toBeInTheDocument();
    fireEvent.click(screen.getByText('닫기'));
    expect(screen.getByText('호흡')).toBeInTheDocument(); // back to grid
  });
});
