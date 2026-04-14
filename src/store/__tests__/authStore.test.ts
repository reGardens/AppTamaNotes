import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

vi.mock('@/lib/api', () => ({
  login: vi.fn(),
  logout: vi.fn(),
}));

import { login as apiLogin, logout as apiLogout } from '@/lib/api';

const mockedLogin = vi.mocked(apiLogin);
const mockedLogout = vi.mocked(apiLogout);

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ isLoggedIn: false, user: null });
  });

  it('should have correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.isLoggedIn).toBe(false);
    expect(state.user).toBeNull();
  });

  describe('login', () => {
    it('should set isLoggedIn and user on successful login', async () => {
      mockedLogin.mockResolvedValue({
        success: true,
        user: { id: 'user-1', email: 'test@example.com' },
      });

      const result = await useAuthStore.getState().login('test@example.com', 'password123');

      expect(result).toBe(true);
      expect(useAuthStore.getState().isLoggedIn).toBe(true);
      expect(useAuthStore.getState().user).toEqual({ id: 'user-1', email: 'test@example.com' });
      expect(mockedLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should return false on failed login', async () => {
      mockedLogin.mockResolvedValue({
        success: false,
        error: 'Email atau password salah',
      });

      const result = await useAuthStore.getState().login('wrong@example.com', 'wrong');

      expect(result).toBe(false);
      expect(useAuthStore.getState().isLoggedIn).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('should return false on network error', async () => {
      mockedLogin.mockRejectedValue(new Error('Terjadi kesalahan jaringan'));

      const result = await useAuthStore.getState().login('test@example.com', 'password123');

      expect(result).toBe(false);
      expect(useAuthStore.getState().isLoggedIn).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('logout', () => {
    it('should reset state on successful logout', async () => {
      useAuthStore.setState({
        isLoggedIn: true,
        user: { id: 'user-1', email: 'test@example.com' },
      });
      mockedLogout.mockResolvedValue({ success: true });

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().isLoggedIn).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(mockedLogout).toHaveBeenCalled();
    });

    it('should reset state even if API call fails', async () => {
      useAuthStore.setState({
        isLoggedIn: true,
        user: { id: 'user-1', email: 'test@example.com' },
      });
      mockedLogout.mockRejectedValue(new Error('Network error'));

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().isLoggedIn).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});
