import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../page';

const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush, replace: mockReplace }) }));

const mockLogin = vi.fn();
vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (s: { login: typeof mockLogin; isLoggedIn: boolean }) => unknown) =>
    selector({ login: mockLogin, isLoggedIn: false }),
}));

vi.mock('@/lib/registerSW', () => ({ registerServiceWorker: vi.fn() }));

vi.mock('@/store/themeStore', () => ({
  useThemeStore: (selector: (s: { darkMode: boolean; toggleDarkMode: () => void }) => unknown) =>
    selector({ darkMode: false, toggleDarkMode: vi.fn() }),
}));

vi.mock('@/lib/userTheme', () => ({
  getLoginBgFromEmail: vi.fn(() => 'linear-gradient(135deg, #667eea, #764ba2)'),
}));

const mockShowSuccess = vi.fn().mockResolvedValue(undefined);
const mockShowError = vi.fn();
vi.mock('@/components/SweetAlertProvider', () => ({
  showSuccess: (...args: unknown[]) => mockShowSuccess(...args),
  showError: (...args: unknown[]) => mockShowError(...args),
}));

function getPasswordInput() {
  return document.querySelector('input[type="password"]') as HTMLInputElement;
}

describe('LoginPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Pratama Notes')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nama@email/i)).toBeInTheDocument();
    expect(getPasswordInput()).toBeTruthy();
    expect(screen.getByRole('button', { name: /masuk/i })).toBeInTheDocument();
  });

  it('renders forgot password link', () => {
    render(<LoginPage />);
    const link = screen.getByText(/lupa password/i);
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/forgot-password');
  });

  it('calls login and redirects on success', async () => {
    mockLogin.mockResolvedValue(true);
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/nama@email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockShowSuccess).toHaveBeenCalledWith('Login Berhasil');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error on failed login', async () => {
    mockLogin.mockResolvedValue(false);
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/nama@email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Login Gagal', 'Email atau password salah');
    });
  });

  it('has show/hide password toggle', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/toggle password/i)).toBeInTheDocument();
  });
});
