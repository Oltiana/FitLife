/**
 * Copy to apiConfig.ts (gitignored). Each person uses THEIR OWN PC IP — not a teammate's.
 *
 *   copy apiConfig.example.ts apiConfig.ts
 *
 * To save Pilates progress in SQL (required for everyone):
 * 1. Restore / use FitLifeDB on YOUR SQL Server (copying .bak alone is not enough).
 * 2. FitLifeAPI/appsettings.json → DefaultConnection must point to YOUR SQL.
 * 3. Run API on YOUR PC: cd FitLifeAPI && dotnet run  (listens on http://0.0.0.0:5071)
 * 4. Set MOBILE_API_IP below to YOUR Wi‑Fi IPv4 (ipconfig). Phone + PC on same Wi‑Fi.
 * 5. In app: Register/Login on YOUR API, then complete a Pilates workout.
 * 6. SQL must have rows in PilatesPrograms + PilatesWorkouts (names like catalog).
 *
 * Data is stored per logged-in user (UserId). Friends do not share progress unless they use the same login.
 */
import { Platform } from 'react-native';

export const LOCAL_PORT = '5071';

/** Your PC IPv4 on Wi‑Fi (ipconfig → Wireless LAN). Example: 192.168.1.42 */
export const MOBILE_API_IP = '192.168.1.42';

export const ANDROID_USE_EMULATOR_HOST = false;

export function resolveApiHost(): string {
  if (Platform.OS === 'web') {
    return 'localhost';
  }
  if (Platform.OS === 'android' && ANDROID_USE_EMULATOR_HOST) {
    return '10.0.2.2';
  }
  return MOBILE_API_IP;
}

export function getApiOrigin(): string {
  return `http://${resolveApiHost()}:${LOCAL_PORT}`;
}

export function getApiBaseUrl(): string {
  return `${getApiOrigin()}/api`;
}

export const API_BASE_URL = getApiBaseUrl();

export const BASE_URL = API_BASE_URL;

export const IMAGE_BASE_URL = getApiOrigin();
