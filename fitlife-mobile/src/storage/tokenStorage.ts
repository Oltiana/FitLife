import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'fitlife_token';
const REFRESH_KEY = 'fitlife_refresh_token';
const USER_KEY = 'fitlife_user';
const ROLE_KEY = 'fitlife_role';

const storage = {
  async set(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },

  async delete(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
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