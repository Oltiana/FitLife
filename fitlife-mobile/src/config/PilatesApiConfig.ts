import { Platform } from 'react-native';
export function getApiBaseUrl(): string | undefined {
  const raw = process.env.EXPO_PUBLIC_API_URL;
  if (typeof raw !== 'string') return undefined;
  const t = raw.trim();
  if (t.length === 0) return undefined;
  let base = t.replace(/\/+$/, '');

  if (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    try {
      const u = new URL(base);
      if (u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') {
        const port = u.port || '5099';
        base = `http://localhost:${port}`;
      }
    } catch {
    
    }
  }

  return base;
}

export function isRemoteDatabaseEnabled(): boolean {
  return getApiBaseUrl() != null;
}
