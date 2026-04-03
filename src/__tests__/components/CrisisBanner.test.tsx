import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CrisisBanner } from '@/components/CrisisBanner';

describe('CrisisBanner', () => {
  it('renders for high severity', () => {
    render(<CrisisBanner severity="high" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/힘든 감정이 느껴지시나요/)).toBeInTheDocument();
  });

  it('renders for critical severity with different message', () => {
    render(<CrisisBanner severity="critical" />);
    expect(screen.getByText(/지금 많이 힘드시군요/)).toBeInTheDocument();
  });

  it('shows hotline number 1393', () => {
    render(<CrisisBanner severity="high" />);
    const link1393 = screen.getByText(/1393/);
    expect(link1393).toBeInTheDocument();
  });

  it('shows hotline number 1577-0199', () => {
    render(<CrisisBanner severity="high" />);
    const link1577 = screen.getByText(/1577-0199/);
    expect(link1577).toBeInTheDocument();
  });

  it('dismiss button calls onDismiss', () => {
    const onDismiss = vi.fn();
    render(<CrisisBanner severity="high" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByLabelText('배너 닫기'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not show dismiss button when onDismiss is not provided', () => {
    render(<CrisisBanner severity="high" />);
    expect(screen.queryByLabelText('배너 닫기')).not.toBeInTheDocument();
  });

  it('"더 많은 도움" button expands additional resources', () => {
    render(<CrisisBanner severity="high" />);
    expect(screen.queryByText(/생명의전화/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(/더 많은 도움/));
    expect(screen.getByText(/생명의전화/)).toBeInTheDocument();
    expect(screen.getByText(/1588-9191/)).toBeInTheDocument();
  });

  it('has role="alert" and aria-live="assertive"', () => {
    render(<CrisisBanner severity="critical" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('contains disclaimer text', () => {
    render(<CrisisBanner severity="high" />);
    expect(screen.getByText(/이 앱은 전문 상담을 대체하지 않습니다/)).toBeInTheDocument();
  });

  it('critical severity shows immediate action text', () => {
    render(<CrisisBanner severity="critical" />);
    expect(screen.getByText(/지금 바로 전문가와 이야기해 주세요/)).toBeInTheDocument();
  });
});
