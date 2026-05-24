import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserPreferences } from '../../domain/PilatesUserPreferences';
import { loadCompletions } from './progress';

export type { UserPreferences } from '../../domain/PilatesUserPreferences';

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

export async function loadUserPreferences(): Promise<UserPreferences> {
  return loadUserPreferencesLocal();
}

export async function saveUserPreferences(
  patch: Partial<UserPreferences>,
): Promise<UserPreferences> {
  const current = await loadUserPreferencesLocal();
  const next: UserPreferences = { ...current, ...patch };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function ensurePreferencesForLegacyInstall(): Promise<void> {
  const raw = await AsyncStorage.getItem(KEY);
  if (raw != null) return;
  const completions = await loadCompletions();
  if (completions.length === 0) return;
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify({ ...DEFAULTS, onboardingComplete: true }),
  );
}
