import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'fitlife_token';
const REFRESH_KEY = 'fitlife_refresh_token';
const USER_KEY = 'fitlife_user';
const ROLE_KEY = 'fitlife_role';

export const tokenStorage = {
  saveAuth: async (token: string, refreshToken: string, user: object, role: string = 'User') => {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [REFRESH_KEY, refreshToken],
      [USER_KEY, JSON.stringify(user)],
      [ROLE_KEY, role],
    ]);
  },

  getToken: () => AsyncStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => AsyncStorage.getItem(REFRESH_KEY),
  getRole: () => AsyncStorage.getItem(ROLE_KEY),

  getUser: async () => {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  clearAuth: () =>
    AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY, USER_KEY, ROLE_KEY]),
};