import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearAccessToken, setAccessToken, STORAGE_KEYS } from './authSession';

export const createAuthStore = (realm) =>
  create(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        login: (userData, token) => {
          setAccessToken(realm, token);
          set({ user: userData, isAuthenticated: true });
        },
        logout: () => {
          clearAccessToken(realm);
          set({ user: null, isAuthenticated: false });
        },
        updateUser: (userData) => {
          set({ user: userData });
        },
      }),
      {
        name: STORAGE_KEYS[realm],
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
  );
