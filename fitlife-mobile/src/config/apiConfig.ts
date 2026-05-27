import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PORT = "5071";

const getBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return `http://localhost:${PORT}`;
  }

  const envIp = process.env.EXPO_PUBLIC_API_IP;
  if (envIp) {
    return `http://${envIp}:${PORT}`;
  }

  const hostUri = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${hostUri ?? '192.168.10.37'}:${PORT}`;
};

const BASE = getBaseUrl();

export const getApiBaseUrl = () => BASE;
export const BASE_URL = `${BASE}/api`;
export const API_BASE_URL = `${BASE}/api`;
export const IMAGE_BASE_URL = BASE;