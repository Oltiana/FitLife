import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getLastPilatesSyncError,
  getMyWorkoutProgress,
  hasAuthToken,
  reloadPilatesProgramsFromApi,
  resolveApiProgramId,
  saveWorkoutCompletionToDatabase,
  setLastPilatesSyncError,
} from '../../api/pilatesApi';
import { BASE_URL } from '../../constants/apiConfig';
import type { WorkoutCompletion } from '../../domain/PilatesDomainTypes';
import { hydratePilatesModelFromPrograms } from '../../screens/pilates/models/PilatesModel';
import { readCachedPilatesPrograms } from './cache';
import { resolvePilatesApiUserId } from './programs';

export { getLastPilatesSyncError };

const STORAGE_KEY = '@fitlife/workout_completions';

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

function completionKey(entry: WorkoutCompletion): string {
  if (entry.id?.trim()) return entry.id.trim();
  return `${entry.completedAt}|${entry.workoutId}|${entry.pilatesWorkoutId ?? ''}`;
}

function mergeCompletions(
  local: WorkoutCompletion[],
  remote: WorkoutCompletion[],
): WorkoutCompletion[] {
  const byKey = new Map<string, WorkoutCompletion>();
  for (const e of local) byKey.set(completionKey(e), e);
  for (const e of remote) byKey.set(completionKey(e), e);
  return sortCompletionsChronological([...byKey.values()]);
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
  if (!BASE_URL || !(await hasAuthToken())) {
    return loadLocalCompletionsOnly();
  }
  try {
    const userId = await resolvePilatesApiUserId();
    const local = await loadLocalCompletionsOnly();
    const remote = await getMyWorkoutProgress(userId);
    const merged = mergeCompletions(local, remote);
    await saveCompletions(merged);
    return merged;
  } catch (e) {
    console.warn('[FitLife] loadCompletions remote failed; using local fallback', e);
    return loadLocalCompletionsOnly();
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
  const userId = await resolvePilatesApiUserId();
  const enriched: WorkoutCompletion = { ...entry, userId };

  if (!(await hasAuthToken())) {
    const syncError = 'Sign in required to save progress to the server.';
    await setLastPilatesSyncError(syncError);
    const local = await loadLocalCompletionsOnly();
    const next = mergeCompletions(local, [enriched]);
    await saveCompletions(next);
    return {
      entries: next,
      syncedToDatabase: false,
      syncError,
    };
  }

  const pilatesProgramId =
    enriched.pilatesProgramId?.trim() ||
    (/^\d+$/.test(enriched.workoutId) ? enriched.workoutId : '');

  if (!pilatesProgramId && !enriched.workoutTitle?.trim()) {
    const syncError =
      'Missing program. Pull to refresh on the Pilates list after login.';
    await setLastPilatesSyncError(syncError);
    const local = await loadLocalCompletionsOnly();
    const next = sortCompletionsChronological([...local, enriched]);
    await saveCompletions(next);
    return {
      entries: next,
      syncedToDatabase: false,
      syncError,
    };
  }

  try {
    let programs = await readCachedPilatesPrograms();
    try {
      programs = await reloadPilatesProgramsFromApi();
      hydratePilatesModelFromPrograms(programs);
    } catch (refreshErr) {
      console.warn('[FitLife] refresh programs before save failed', refreshErr);
    }

    const resolvedProgramId = resolveApiProgramId(
      pilatesProgramId || enriched.workoutId,
      programs,
    );

    if (!/^\d+$/.test(resolvedProgramId.trim())) {
      throw new Error(
        `Program "${enriched.workoutTitle}" has no numeric id from API. Pull to refresh on Pilates list.`,
      );
    }

    const savedCount = await saveWorkoutCompletionToDatabase(
      resolvedProgramId,
      enriched.workoutTitle,
      {
        pilatesWorkoutId: enriched.pilatesWorkoutId,
        pilatesWorkoutIds: enriched.pilatesWorkoutIds,
        durationMinutes: enriched.durationMinutes,
        programName: enriched.programName ?? enriched.workoutTitle,
        workoutName: enriched.workoutName,
        exercisesCompleted: enriched.exercisesCompleted,
      },
    );

    let remote: WorkoutCompletion[] = [];
    try {
      remote = await getMyWorkoutProgress(userId);
    } catch (fetchErr) {
      console.warn('[FitLife] refresh progress after save failed', fetchErr);
    }

    const local = await loadLocalCompletionsOnly();
    const merged = mergeCompletions(mergeCompletions(local, remote), [enriched]);
    await saveCompletions(merged);
    await setLastPilatesSyncError(null);
    return {
      entries: merged,
      syncedToDatabase: true,
      savedWorkoutCount: savedCount,
    };
  } catch (e) {
    const syncError = e instanceof Error ? e.message : String(e);
    await setLastPilatesSyncError(syncError);
    console.warn('[FitLife] appendCompletion: save to SQL failed', e);
    const local = await loadLocalCompletionsOnly();
    const alreadySaved = local.some((c) => c.id === enriched.id);
    const next = alreadySaved
      ? local
      : sortCompletionsChronological([...local, enriched]);
    if (!alreadySaved) await saveCompletions(next);
    return {
      entries: next,
      syncedToDatabase: false,
      syncError,
    };
  }
}

async function loadLocalCompletionsOnly(): Promise<WorkoutCompletion[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return sortCompletionsChronological(parseList(raw));
}
