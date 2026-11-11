import { create } from 'zustand';
import type { User } from '../types/index.js';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
  setSession: (session: { user: User; accessToken: string }) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setIsLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, accessToken: null }),
  setSession: (session) => set({ user: session.user, accessToken: session.accessToken }),
}));
