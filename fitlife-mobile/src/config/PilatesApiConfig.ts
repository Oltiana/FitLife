import { Platform } from 'react-native';
import { API_BASE_URL } from '../constants/apiConfig';


export function getApiBaseUrl(): string {
  let base = API_BASE_URL.replace(/\/api$/i, '');

  if (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    try {
      const u = new URL(base.startsWith('http') ? base : `http://${base}`);
      if (u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') {
        const port = u.port || '5071';
        base = `http://localhost:${port}`;
      }
    } catch {
      
    }
  }

  return base;
}

export function isRemoteDatabaseEnabled(): boolean {
  return getApiBaseUrl().length > 0;
}
