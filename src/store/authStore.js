import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user:  null,
      isAuthenticated: false,

      login: (token, user) => {
        localStorage.setItem('txp_token', token);
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('txp_token');
        localStorage.removeItem('txp_user');
        set({ token: null, user: null, isAuthenticated: false });
      },

      updateUser: (user) => set({ user }),

      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'txp_auth',
      partialize: (s) => ({ token: s.token, user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);

export default useAuthStore;
