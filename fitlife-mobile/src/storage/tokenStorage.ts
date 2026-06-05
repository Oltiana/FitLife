import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'fitlife_token';
const REFRESH_KEY = 'fitlife_refresh_token';
const USER_KEY = 'fitlife_user';
const ROLE_KEY = 'fitlife_role';

const cookieStorage = {
  set(key: string, value: string) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    document.cookie = `${key}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  },

  get(key: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  },

  delete(key: string) {
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  },
};

const storage = {
  async set(key: string, value: string) {
    if (Platform.OS === 'web') {
      cookieStorage.set(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return cookieStorage.get(key);
    }
    return await SecureStore.getItemAsync(key);
  },

  async delete(key: string) {
    if (Platform.OS === 'web') {
      cookieStorage.delete(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const tokenStorage = {
  saveAuth: async (token: string, refreshToken: string, user: object, role: string = 'User') => {
    await storage.set(TOKEN_KEY, token);
    await storage.set(REFRESH_KEY, refreshToken);
    await storage.set(USER_KEY, JSON.stringify(user));
    await storage.set(ROLE_KEY, role);
  },

  getToken: () => storage.get(TOKEN_KEY),
  getRefreshToken: () => storage.get(REFRESH_KEY),
  getRole: () => storage.get(ROLE_KEY),

  getUser: async () => {
    const raw = await storage.get(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  clearAuth: async () => {
    await storage.delete(TOKEN_KEY);
    await storage.delete(REFRESH_KEY);
    await storage.delete(USER_KEY);
    await storage.delete(ROLE_KEY);
  },
};