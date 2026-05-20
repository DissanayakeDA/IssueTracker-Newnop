import { create } from 'zustand';
import { User, LoginCredentials, RegisterCredentials } from '../types/auth.types';
import { authApi } from '../api/authApi';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  authValidated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  initializeAuth: () => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const getSavedUser = (): User | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const hasStoredToken = (): boolean => !!localStorage.getItem('token');

export const useAuthStore = create<AuthState>((set) => ({
  user: getSavedUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  authValidated: !hasStoredToken(),
  loading: false,
  error: null,

  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ authValidated: true, isAuthenticated: false, token: null, user: null });
      return;
    }

    try {
      const me = await authApi.getMe();
      const user: User = { _id: String(me._id), name: me.name, email: me.email };
      localStorage.setItem('user', JSON.stringify(user));
      set({
        user,
        token,
        isAuthenticated: true,
        authValidated: true,
      });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        authValidated: true,
      });
    }
  },

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      const user: User = { _id: String(response._id), name: response.name, email: response.email };
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(user));
      set({
        user,
        token: response.token,
        isAuthenticated: true,
        authValidated: true,
        loading: false,
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({ error: error.message || 'Login failed', loading: false });
    }
  },

  register: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.register(credentials);
      const user: User = { _id: String(response._id), name: response.name, email: response.email };
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(user));
      set({
        user,
        token: response.token,
        isAuthenticated: true,
        authValidated: true,
        loading: false,
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({ error: error.message || 'Registration failed', loading: false });
    }
  },

  fetchMe: async () => {
    set({ loading: true });
    try {
      const me = await authApi.getMe();
      const user: User = { _id: String(me._id), name: me.name, email: me.email };
      localStorage.setItem('user', JSON.stringify(user));
      set({
        user,
        token: localStorage.getItem('token'),
        isAuthenticated: true,
        authValidated: true,
        loading: false,
      });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        loading: false,
        isAuthenticated: false,
        authValidated: true,
        token: null,
        user: null,
      });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      authValidated: true,
    });
  },

  clearError: () => set({ error: null }),
}));
