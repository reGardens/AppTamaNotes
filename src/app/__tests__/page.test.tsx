import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import HomePage from '../page';

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

const mockUseAuthStore = vi.fn();
vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (s: { isLoggedIn: boolean }) => boolean) =>
    selector({ isLoggedIn: mockUseAuthStore() }),
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /login when not logged in', () => {
    mockUseAuthStore.mockReturnValue(false);
    render(<HomePage />);
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('redirects to /dashboard when logged in', () => {
    mockUseAuthStore.mockReturnValue(true);
    render(<HomePage />);
    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('renders nothing (returns null)', () => {
    mockUseAuthStore.mockReturnValue(false);
    const { container } = render(<HomePage />);
    expect(container.innerHTML).toBe('');
  });
});
