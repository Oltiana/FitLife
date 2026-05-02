import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchCompletionsRemote,
  postCompletionRemote,
} from '../api/PilatesBackendApi';
import { getApiBaseUrl } from '../config/PilatesApiConfig';
import type { WorkoutCompletion } from '../domain/PilatesDomainTypes';
import {
  resolvePilatesApiUserId,
  resolvePilatesBootstrapUser,
} from './PilatesUserProgramRepository';

const STORAGE_KEY = '@fitlife/workout_completions';

/** Më e vjetra → më e reja (rreshti i fundit = seanca më e fundit). */
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

/** Remote GET mund të kthejë [] kur SQL është bosh; nuk duhet të humbasim completions lokale. */
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

/**
 * Ngarko historikun. Nëse `EXPO_PUBLIC_API_URL` është vendosur, të dhënat vijnë nga SQL Server (API).
 * Përndryshe përdoret ruajtja lokale (AsyncStorage).
 */
export async function loadCompletions(): Promise<WorkoutCompletion[]> {
  const local = await loadLocalCompletionsOnly();
  const base = getApiBaseUrl();
  if (!base) {
    return sortCompletionsChronological(local);
  }
  try {
    const userId = await resolvePilatesApiUserId();
    const boot = await resolvePilatesBootstrapUser();
    const remote = await fetchCompletionsRemote(base, userId, boot);
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

/**
 * Ruan përfundimin e seancës. Me API të aktivizuar, dërgohet në databazë përmes backend-it .NET.
 */
export async function appendCompletion(
  entry: WorkoutCompletion,
): Promise<WorkoutCompletion[]> {
  /** Gjithmonë ID kanonik nga login (jo `entry.userId` të vjetër `pilates-anon-*`). */
  const userId = await resolvePilatesApiUserId();
  const enriched: WorkoutCompletion = { ...entry, userId };
  const base = getApiBaseUrl();
  if (base) {
    try {
      const boot = await resolvePilatesBootstrapUser();
      await postCompletionRemote(base, userId, enriched, boot);
      const remote = await fetchCompletionsRemote(base, userId, boot);
      const local = await loadLocalCompletionsOnly();
      /* GET mund të jetë bosh — gjithmonë përfshi completion-in që sapo u dërgua. */
      const merged = mergeCompletionsById(
        mergeCompletionsById(remote, local),
        [enriched],
      );
      await saveCompletions(merged);
      return merged;
    } catch (e) {
      // If remote save fails/unreachable, keep workout data locally
      // so the completion flow never gets stuck.
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(
        `[FitLife] appendCompletion remote failed (${base}) — SQL nuk përditësohet. Fallback lokal. Shkaku: ${msg}`,
      );
    }
  }
  const current = await loadLocalCompletionsOnly();
  const next = sortCompletionsChronological([...current, enriched]);
  await saveCompletions(next);
  return next;
}

/** Vetëm lokale — për degën lokale të `appendCompletion`. */
async function loadLocalCompletionsOnly(): Promise<WorkoutCompletion[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return sortCompletionsChronological(parseList(raw));
}
