import { tokenStorage } from '../storage/tokenStorage';
import { authApi } from './authApi';
import { API_BASE_URL } from '../constants/apiConfig';

type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = await tokenStorage.getToken();

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) throw new Error('SESSION_EXPIRED');

    try {
      const refreshed = await authApi.refreshToken(refreshToken);
      await tokenStorage.saveAuth(
        refreshed.token,
        refreshed.refreshToken,
        {
          fullName: refreshed.fullName,
          email: refreshed.email,
          isVerified: refreshed.isVerified,
        },
        refreshed.role ?? 'User'
      );

      return await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshed.token}`,
          ...options.headers,
        },
      });
    } catch {
      await tokenStorage.clearAuth();
      throw new Error('SESSION_EXPIRED'); 
    }
  }

  return res;
};

export const apiClient = {
  get: async <T>(path: string): Promise<ApiResponse<T>> => {
    try {
      const res = await authFetch(`${API_BASE_URL}${path}`);
      if (!res.ok) return { data: null, error: await res.text() };
      return { data: await res.json(), error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  },

  post: async <T>(path: string, body: object): Promise<ApiResponse<T>> => {
    try {
      const res = await authFetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!res.ok) return { data: null, error: await res.text() };
      return { data: await res.json(), error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  },

  put: async <T>(path: string, body: object): Promise<ApiResponse<T>> => {
    try {
      const res = await authFetch(`${API_BASE_URL}${path}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      if (!res.ok) return { data: null, error: await res.text() };
      return { data: await res.json(), error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  },

  delete: async <T>(path: string): Promise<ApiResponse<T>> => {
    try {
      const res = await authFetch(`${API_BASE_URL}${path}`, { method: 'DELETE' });
      if (!res.ok) return { data: null, error: await res.text() };
      return { data: await res.json(), error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  },
};