import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchCompletionsRemote,
  postCompletionRemote,
} from '../api/PilatesBackendApi';
import { getApiBaseUrl } from '../config/PilatesApiConfig';
import type { WorkoutCompletion } from '../domain/PilatesDomainTypes';
import { ensureDefaultUser } from './PilatesUserProgramRepository';

const STORAGE_KEY = '@fitlife/workout_completions';

function parseList(raw: string | null): WorkoutCompletion[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(
      (item): item is WorkoutCompletion =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as WorkoutCompletion).id === 'string' &&
        typeof (item as WorkoutCompletion).completedAt === 'string',
    );
  } catch {
    return [];
  }
}

/**
 * Ngarko historikun. Nëse `EXPO_PUBLIC_API_URL` është vendosur, të dhënat vijnë nga SQL Server (API).
 * Përndryshe përdoret ruajtja lokale (AsyncStorage).
 */
export async function loadCompletions(): Promise<WorkoutCompletion[]> {
  const base = getApiBaseUrl();
  if (base) {
    try {
      const user = await ensureDefaultUser();
      return fetchCompletionsRemote(base, user.id);
    } catch (e) {
      console.warn('[FitLife] loadCompletions remote failed; using local fallback', e);
    }
  }
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return parseList(raw);
}

export async function saveCompletions(entries: WorkoutCompletion[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/**
 * Ruan përfundimin e seancës. Me API të aktivizuar, dërgohet në databazë përmes backend-it .NET.
 */
export async function appendCompletion(
  entry: WorkoutCompletion,
): Promise<WorkoutCompletion[]> {
  const base = getApiBaseUrl();
  if (base) {
    try {
      const user = await ensureDefaultUser();
      const userId = entry.userId ?? user.id;
      await postCompletionRemote(base, userId, { ...entry, userId });
      return fetchCompletionsRemote(base, userId);
    } catch (e) {
      // If remote save fails/unreachable, keep workout data locally
      // so the completion flow never gets stuck.
      console.warn('[FitLife] appendCompletion remote failed; using local fallback', e);
    }
  }
  const current = await loadLocalCompletionsOnly();
  const next = [entry, ...current];
  await saveCompletions(next);
  return next;
}

/** Vetëm lokale — për degën lokale të `appendCompletion`. */
async function loadLocalCompletionsOnly(): Promise<WorkoutCompletion[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return parseList(raw);
}
