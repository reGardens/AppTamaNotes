import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as apiLogin, logout as apiLogout } from '@/lib/api';

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface AuthState {
  isLoggedIn: boolean;
  user: { id: string; email: string } | null;
  loginTimestamp: number | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      loginTimestamp: null,

      login: async (email: string, password: string): Promise<boolean> => {
        try {
          const response = await apiLogin(email, password);
          if (response.success && response.user) {
            set({ isLoggedIn: true, user: response.user, loginTimestamp: Date.now() });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      logout: async (): Promise<void> => {
        try {
          await apiLogout();
        } catch {
          // Reset state even if API call fails
        }
        set({ isLoggedIn: false, user: null, loginTimestamp: null });
      },

      checkSession: (): boolean => {
        const { loginTimestamp, isLoggedIn } = get();
        if (!isLoggedIn || !loginTimestamp) return false;
        if (Date.now() - loginTimestamp > SESSION_DURATION_MS) {
          set({ isLoggedIn: false, user: null, loginTimestamp: null });
          return false;
        }
        return true;
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);
