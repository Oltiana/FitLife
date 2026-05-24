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
import { getApiOrigin } from '../../constants/apiConfig';
import type { WorkoutCompletion } from '../../domain/PilatesDomainTypes';
import { hydratePilatesModelFromPrograms } from '../../models/PilatesModel';
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
  if (!getApiOrigin() || !(await hasAuthToken())) {
    return loadLocalCompletionsOnly();
  }
  try {
    const userId = await resolvePilatesApiUserId();
    const remote = await getMyWorkoutProgress(userId);
    await saveCompletions(remote);
    return sortCompletionsChronological(remote);
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
  if (!(await hasAuthToken())) {
    const syncError = 'Sign in required to save progress to the server.';
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
      'Missing program. Pull to refresh on the Pilates list after login.';
    await setLastPilatesSyncError(syncError);
    return {
      entries: await loadLocalCompletionsOnly(),
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

    const remote = await getMyWorkoutProgress(userId);
    const hasServerRow = remote.some(
      (r) =>
        r.id.startsWith('progress-') &&
        (r.pilatesProgramId === resolvedProgramId ||
          r.workoutTitle.trim().toLowerCase() ===
            enriched.workoutTitle.trim().toLowerCase()),
    );
    if (!hasServerRow) {
      throw new Error(
        `Server did not return progress for "${enriched.workoutTitle}". ` +
          `Add PilatesWorkouts for program id ${resolvedProgramId}, then try again. ` +
          `API: ${getApiOrigin()}`,
      );
    }

    await saveCompletions(remote);
    await setLastPilatesSyncError(null);
    return {
      entries: remote,
      syncedToDatabase: true,
      savedWorkoutCount: savedCount,
    };
  } catch (e) {
    const syncError = e instanceof Error ? e.message : String(e);
    await setLastPilatesSyncError(syncError);
    console.warn('[FitLife] appendCompletion: save to SQL failed', e);
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
