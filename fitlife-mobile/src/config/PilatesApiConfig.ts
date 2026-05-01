/**
 * URL e bazë e FitLife.Api (.NET), pa slash në fund.
 * Vendos në `.env`: EXPO_PUBLIC_API_URL=http://localhost:5099
 * Ristarto `npx expo start` pas ndryshimit.
 *
 * Android emulator: shpesh `http://10.0.2.2:5099`
 */
export function getApiBaseUrl(): string | undefined {
  const raw = process.env.EXPO_PUBLIC_API_URL;
  if (typeof raw !== 'string') return undefined;
  const t = raw.trim();
  if (t.length === 0) return undefined;
  return t.replace(/\/+$/, '');
}

export function isRemoteDatabaseEnabled(): boolean {
  return getApiBaseUrl() != null;
}
