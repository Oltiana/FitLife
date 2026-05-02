import { Platform } from 'react-native';

/**
 * URL e bazë e FitLife.Api (.NET), pa slash në fund.
 * Vendos në `.env`: EXPO_PUBLIC_API_URL=http://localhost:5099
 * Ristarto `npx expo start` pas ndryshimit.
 *
 * Android emulator: shpesh `http://10.0.2.2:5099`
 *
 * Web në localhost: nëse `.env` ka IP LAN (192.168…), shpesh browser-i nga
 * `localhost:8081` nuk arrin mirë — përdoret automatikisht `http://localhost:<port>`.
 */
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
      /* ignore bad URL */
    }
  }

  return base;
}

export function isRemoteDatabaseEnabled(): boolean {
  return getApiBaseUrl() != null;
}
