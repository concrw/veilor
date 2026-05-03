import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render, screen, fireEvent } from '../test-utils';
import { ErrorState } from '@/components/ErrorState';

describe('ErrorState', () => {
  it('renders default title and description', () => {
    render(<ErrorState />);
    expect(screen.getByText('데이터를 불러오지 못했습니다')).toBeInTheDocument();
    expect(screen.getByText('네트워크 연결을 확인하고 다시 시도해 주세요.')).toBeInTheDocument();
  });

  it('renders custom title and description', () => {
    render(<ErrorState title="커스텀 에러" description="다른 설명입니다." />);
    expect(screen.getByText('커스텀 에러')).toBeInTheDocument();
    expect(screen.getByText('다른 설명입니다.')).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    const button = screen.getByText('다시 시도');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('hides retry button when no onRetry', () => {
    render(<ErrorState />);
    expect(screen.queryByText('다시 시도')).not.toBeInTheDocument();
  });

  it('has role="alert"', () => {
    render(<ErrorState />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows warning emoji', () => {
    render(<ErrorState />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });
});
