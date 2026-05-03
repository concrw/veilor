import { describe, it, expect } from 'vitest';
import { renderWithProviders as render, screen, fireEvent } from '../test-utils';
import { MemoryRouter } from 'react-router-dom';
import ConcernRouter from '@/components/set/ConcernRouter';

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('ConcernRouter', () => {
  it('renders 6 concern categories', () => {
    renderWithRouter(<ConcernRouter />);
    expect(screen.getByText('이별/단절')).toBeInTheDocument();
    expect(screen.getByText('갈등/다툼')).toBeInTheDocument();
    expect(screen.getByText('관계 불안')).toBeInTheDocument();
    expect(screen.getByText('소통 문제')).toBeInTheDocument();
    expect(screen.getByText('나를 모르겠어')).toBeInTheDocument();
    expect(screen.getByText('성장하고 싶어')).toBeInTheDocument();
  });

  it('shows route suggestion after selection', () => {
    renderWithRouter(<ConcernRouter />);
    fireEvent.click(screen.getByText('관계 불안'));
    expect(screen.getByText(/불안의 뿌리를 찾아가요/)).toBeInTheDocument();
  });

  it('shows different suggestion for identity concern', () => {
    renderWithRouter(<ConcernRouter />);
    fireEvent.click(screen.getByText('나를 모르겠어'));
    expect(screen.getByText(/V-File로 가면을 탐색/)).toBeInTheDocument();
  });
});
