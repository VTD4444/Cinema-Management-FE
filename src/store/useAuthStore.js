import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (userData, token) => {
        localStorage.setItem('accessToken', token);
        if (userData?.role) {
          localStorage.setItem('userRole', userData.role);
        }
        set({ user: userData, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
        set({ user: null, isAuthenticated: false });
      },
      updateUser: (userData) => {
        set({ user: userData });
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // only save these fields
    }
  )
);

export default useAuthStore;
