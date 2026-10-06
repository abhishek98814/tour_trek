import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  phone: string;
  profile_picture: string | null;
  is_verified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hasHydrated: boolean;

  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setAccessToken: (accessToken: string) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setHasHydrated: (state: boolean) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken });
      },

      setUser: (user) => {
        set({ user });
      },

      setAccessToken: (accessToken) => {
        set({ accessToken });
      },

      // Used after a token refresh. Keeps the old refresh token
      // unless the backend sent a new one (ROTATE_REFRESH_TOKENS).
      setTokens: (accessToken, refreshToken) => {
        set((s) => ({
          accessToken,
          refreshToken: refreshToken ?? s.refreshToken,
        }));
      },

      setHasHydrated: (state) => {
        set({ hasHydrated: state });
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: 'auth-storage',

      // Save only auth data. hasHydrated must NOT be saved,
      // otherwise it is already "true" before the store has loaded.
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useAuthStore;