import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithProviders as render, screen, act } from '../test-utils';
import { OfflineBanner } from '@/components/OfflineBanner';

describe('OfflineBanner', () => {
  let originalOnLine: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalOnLine = Object.getOwnPropertyDescriptor(navigator, 'onLine');
  });

  afterEach(() => {
    if (originalOnLine) {
      Object.defineProperty(navigator, 'onLine', originalOnLine);
    } else {
      // Restore default behavior
      Object.defineProperty(navigator, 'onLine', {
        get: () => true,
        configurable: true,
      });
    }
  });

  it('is hidden when online', () => {
    Object.defineProperty(navigator, 'onLine', { get: () => true, configurable: true });
    const { container } = render(<OfflineBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('shows when offline', () => {
    Object.defineProperty(navigator, 'onLine', { get: () => false, configurable: true });
    render(<OfflineBanner />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/인터넷 연결이 끊어졌습니다/)).toBeInTheDocument();
  });

  it('has role="alert" when offline', () => {
    Object.defineProperty(navigator, 'onLine', { get: () => false, configurable: true });
    render(<OfflineBanner />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });

  it('contains correct message', () => {
    Object.defineProperty(navigator, 'onLine', { get: () => false, configurable: true });
    render(<OfflineBanner />);
    expect(screen.getByText(/일부 기능이 제한될 수 있어요/)).toBeInTheDocument();
  });

  it('responds to online/offline events', () => {
    Object.defineProperty(navigator, 'onLine', { get: () => true, configurable: true });
    const { container } = render(<OfflineBanner />);
    expect(container.firstChild).toBeNull();

    // Simulate going offline
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Simulate going online
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(container.firstChild).toBeNull();
  });
});
