import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchPreferencesRemote,
  putPreferencesRemote,
} from '../api/PilatesBackendApi';
import { getApiBaseUrl } from '../config/PilatesApiConfig';
import type { UserPreferences } from '../domain/PilatesUserPreferences';
import { ensureDefaultUser } from './PilatesUserProgramRepository';
import { loadCompletions } from './PilatesProgressRepository';

export type { UserPreferences } from '../domain/PilatesUserPreferences';

const KEY = '@fitlife/user_preferences_v1';

const DEFAULTS: UserPreferences = {
  onboardingComplete: false,
  dailyCalorieTarget: null,
  dailyMinutesTarget: null,
};

function merge(parsed: Partial<Record<string, unknown>>): UserPreferences {
  const ob =
    typeof parsed.onboardingComplete === 'boolean'
      ? parsed.onboardingComplete
      : DEFAULTS.onboardingComplete;
  let dailyCalorieTarget = DEFAULTS.dailyCalorieTarget;
  if (parsed.dailyCalorieTarget != null) {
    const n = Number(parsed.dailyCalorieTarget);
    if (!Number.isNaN(n) && n > 0) dailyCalorieTarget = Math.round(n);
  }
  let dailyMinutesTarget = DEFAULTS.dailyMinutesTarget;
  if (parsed.dailyMinutesTarget != null) {
    const n = Number(parsed.dailyMinutesTarget);
    if (!Number.isNaN(n) && n > 0) dailyMinutesTarget = Math.round(n);
  }
  return {
    onboardingComplete: ob,
    dailyCalorieTarget,
    dailyMinutesTarget,
  };
}

async function loadUserPreferencesLocal(): Promise<UserPreferences> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return { ...DEFAULTS };
    return merge(parsed as Partial<Record<string, unknown>>);
  } catch {
    return { ...DEFAULTS };
  }
}

/**
 * Preferencat: me `EXPO_PUBLIC_API_URL` lexohen/ruhen në SQL Server përmes API-së;
 * përndryshe vetëm AsyncStorage.
 */
export async function loadUserPreferences(): Promise<UserPreferences> {
  const base = getApiBaseUrl();
  if (base) {
    try {
      const user = await ensureDefaultUser();
      const remote = await fetchPreferencesRemote(base, user.id);
      await AsyncStorage.setItem(KEY, JSON.stringify(remote));
      return remote;
    } catch (e) {
      console.warn('[FitLife] prefs: remote failed, using cache', e);
      return loadUserPreferencesLocal();
    }
  }
  return loadUserPreferencesLocal();
}

export async function saveUserPreferences(
  patch: Partial<UserPreferences>,
): Promise<UserPreferences> {
  const base = getApiBaseUrl();
  if (base) {
    const user = await ensureDefaultUser();
    const prev = await fetchPreferencesRemote(base, user.id);
    const next: UserPreferences = { ...prev, ...patch };
    await putPreferencesRemote(base, user.id, next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    return next;
  }
  const current = await loadUserPreferencesLocal();
  const next: UserPreferences = { ...current, ...patch };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

/**
 * Në përditësime nga versione pa prefs: nëse ka seanca, mos e detyro onboarding-un.
 */
export async function ensurePreferencesForLegacyInstall(): Promise<void> {
  const base = getApiBaseUrl();
  if (base) {
    try {
      const completions = await loadCompletions();
      if (completions.length === 0) return;
      const prefs = await loadUserPreferences();
      if (prefs.onboardingComplete) return;
      await saveUserPreferences({ onboardingComplete: true });
    } catch {
      /* offline / API down */
    }
    return;
  }

  const raw = await AsyncStorage.getItem(KEY);
  if (raw != null) return;
  const completions = await loadCompletions();
  if (completions.length === 0) return;
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify({ ...DEFAULTS, onboardingComplete: true }),
  );
}
