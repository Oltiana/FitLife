import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMyWorkoutProgress } from '../api/PilatesBackendApi';
import { setLastPilatesSyncError } from '../api/pilatesBootSync';
import { saveWorkoutCompletionToDatabase } from '../api/pilatesDatabaseSync';
import { getApiBaseUrl } from '../config/PilatesApiConfig';
import type { WorkoutCompletion } from '../domain/PilatesDomainTypes';
import { hasAuthToken } from '../api/pilatesApiSession';
import { resolvePilatesApiUserId } from './PilatesUserProgramRepository';

const STORAGE_KEY = '@fitlife/workout_completions';


export async function clearPilatesProgressLocalCache(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

function sortCompletionsChronological(
  entries: WorkoutCompletion[],
): WorkoutCompletion[] {
  return [...entries].sort((a, b) => {
    const ta = new Date(a.completedAt).getTime();
    const tb = new Date(b.completedAt).getTime();
    if (ta !== tb) return ta - tb;
    return a.id.localeCompare(b.id);
  });
}

function mergeCompletionsById(
  remote: WorkoutCompletion[],
  local: WorkoutCompletion[],
): WorkoutCompletion[] {
  const byId = new Map<string, WorkoutCompletion>();
  for (const r of remote) {
    byId.set(r.id, r);
  }
  for (const l of local) {
    if (!byId.has(l.id)) {
      byId.set(l.id, l);
    }
  }
  return sortCompletionsChronological([...byId.values()]);
}

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

export async function loadCompletions(): Promise<WorkoutCompletion[]> {
  const local = await loadLocalCompletionsOnly();
  if (!getApiBaseUrl() || !(await hasAuthToken())) {
    return sortCompletionsChronological(local);
  }
  try {
    const userId = await resolvePilatesApiUserId();
    const remote = await getMyWorkoutProgress(userId);
    const merged = mergeCompletionsById(remote, local);
    await saveCompletions(merged);
    return merged;
  } catch (e) {
    console.warn('[FitLife] loadCompletions remote failed; using local fallback', e);
    return sortCompletionsChronological(local);
  }
}

export async function saveCompletions(entries: WorkoutCompletion[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export type AppendCompletionResult = {
  entries: WorkoutCompletion[];
  syncedToDatabase: boolean;
  syncError?: string;
  savedWorkoutCount?: number;
};

export async function appendCompletion(
  entry: WorkoutCompletion,
): Promise<AppendCompletionResult> {
  if (!(await hasAuthToken())) {
    const syncError = 'Nuk je i loguar. Hyr me login që të ruhet në SQL.';
    await setLastPilatesSyncError(syncError);
    return {
      entries: await loadLocalCompletionsOnly(),
      syncedToDatabase: false,
      syncError,
    };
  }

  const userId = await resolvePilatesApiUserId();
  const enriched: WorkoutCompletion = { ...entry, userId };

  const pilatesProgramId =
    enriched.pilatesProgramId?.trim() ||
    (/^\d+$/.test(enriched.workoutId) ? enriched.workoutId : '');

  if (!pilatesProgramId && !enriched.workoutTitle?.trim()) {
    const syncError =
      'Mungon programi nga API. Hap Pilates pas login (ID numerik, jo core-fundamentals).';
    await setLastPilatesSyncError(syncError);
    return {
      entries: await loadLocalCompletionsOnly(),
      syncedToDatabase: false,
      syncError,
    };
  }

  try {
    const savedCount = await saveWorkoutCompletionToDatabase(
      pilatesProgramId,
      enriched.workoutTitle,
    );

    const remote = await getMyWorkoutProgress(userId);
    await saveCompletions(sortCompletionsChronological(remote));
    await setLastPilatesSyncError(null);
    return {
      entries: remote,
      syncedToDatabase: true,
      savedWorkoutCount: savedCount,
    };
  } catch (e) {
    const syncError = e instanceof Error ? e.message : String(e);
    await setLastPilatesSyncError(syncError);
    console.warn('[FitLife] appendCompletion: nuk u ruajt në SQL', e);
    return {
      entries: await loadLocalCompletionsOnly(),
      syncedToDatabase: false,
      syncError,
    };
  }
}

async function loadLocalCompletionsOnly(): Promise<WorkoutCompletion[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return sortCompletionsChronological(parseList(raw));
}
