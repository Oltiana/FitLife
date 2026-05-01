import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'fitlife_token';
const REFRESH_KEY = 'fitlife_refresh_token';
const USER_KEY = 'fitlife_user';

export const tokenStorage = {
  saveAuth: async (token: string, refreshToken: string, user: object) => {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [REFRESH_KEY, refreshToken],
      [USER_KEY, JSON.stringify(user)],
    ]);
  },

  getToken: () => AsyncStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => AsyncStorage.getItem(REFRESH_KEY),

  getUser: async () => {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  clearAuth: () =>
    AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY, USER_KEY]),
};