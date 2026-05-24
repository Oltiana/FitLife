import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiOrigin } from '../constants/apiConfig';
import {
  findCatalogByProgramName,
} from '../data/pilates/catalog';
import {
  KEY_PILATES_PROGRAMS,
  KEY_USER_PROGRAMS,
  sortProgramsByDisplayOrder,
} from '../data/pilates/cache';
import type { PilatesProgram, UserProgram } from '../domain/PilatesProgramTypes';
import {
  normalizePilatesLevel,
  type WorkoutCompletion,
} from '../domain/PilatesDomainTypes';
import { hydratePilatesModelFromPrograms } from '../models/PilatesModel';
import { tokenStorage } from '../storage/tokenStorage';

const ROUTES = {
  programs: '/api/Pilates/programs',
  enroll: '/api/Pilates/enroll',
  myEnrollments: '/api/Pilates/my-enrollments',
  myEnrollmentByProgramId: (pilatesProgramId: number | string) =>
    `/api/Pilates/my-enrollments/${pilatesProgramId}`,
  myWorkoutProgress: '/api/Pilates/my-workout-progress',
  completeWorkout: '/api/Pilates/complete-workout',
} as const;

const KEY_LAST_SYNC_ERROR = '@fitlife/pilates_last_sync_error';

export async function clearPilatesApiCache(): Promise<void> {
  await AsyncStorage.multiRemove([KEY_PILATES_PROGRAMS, KEY_USER_PROGRAMS]);
}

export async function reloadPilatesProgramsFromApi(): Promise<PilatesProgram[]> {
  if (!(await hasAuthToken())) {
    throw new Error('Sign in required to load programs from the server.');
  }
  const list = sortProgramsByDisplayOrder(await getPrograms());
  await AsyncStorage.setItem(KEY_PILATES_PROGRAMS, JSON.stringify(list));
  return list;
}

type PilatesWorkoutResponse = {
  id: number;
  pilatesProgramId?: number;
  name: string;
  description: string;
  durationMinutes: number;
  orderIndex: number;
  isCompleted: boolean;
};

type PilatesProgramResponse = {
  id: number;
  name: string;
  description: string;
  durationWeeks: number;
  level: string;
  displayOrder: number;
  workouts: PilatesWorkoutResponse[];
};

type EnrollPilatesProgramRequest = { pilatesProgramId: number };
type CompletePilatesWorkoutRequest = {
  pilatesWorkoutId: number;
  programName?: string;
  workoutName?: string;
  exercisesCompleted?: string[];
};

type UserPilatesProgressResponse = {
  pilatesProgramId: number;
  programName: string;
  totalWorkouts: number;
  completedWorkouts: number;
  progressPercent: number;
  enrolledAt: string;
  completedAt: string | null;
};

type UserPilatesWorkoutProgressResponse = {
  id: number;
  pilatesWorkoutId: number;
  pilatesProgramId: number;
  programName: string;
  workoutName: string;
  exercisesCompleted: string;
  isCompleted: boolean;
  completedAt: string | null;
  durationMinutes: number;
};

function apiUrl(path: string): string {
  const base = getApiOrigin().replace(/\/$/, '');
  const segment = path.startsWith('/') ? path : `/${path}`;
  return `${base}${segment}`;
}

function normalizeBearerToken(raw: string): string {
  return raw.trim().replace(/^bearer\s+/i, '');
}

export async function hasAuthToken(): Promise<boolean> {
  const t = await tokenStorage.getToken();
  return t != null && String(t).trim().length > 0;
}

async function bearerAuthHeaders(requireToken = false): Promise<Record<string, string>> {
  const t = await tokenStorage.getToken();
  if (t == null || String(t).trim() === '') {
    if (requireToken) {
      throw new Error('Sign in required to save Pilates data to the server.');
    }
    return {};
  }
  return { Authorization: `Bearer ${normalizeBearerToken(String(t))}` };
}

async function request<T>(
  url: string,
  init?: RequestInit,
  requireAuth = false,
): Promise<T | null> {
  const auth = await bearerAuthHeaders(requireAuth);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...auth,
  };
  const res = await fetch(url, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string>) },
  });
  if (res.status === 204) return null;
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`API ${res.status} ${url}: ${text.slice(0, 400)}`);
  }
  if (!text) return null;
  return JSON.parse(text) as T;
}

function mapApiProgramToDomain(p: PilatesProgramResponse): PilatesProgram {
  return {
    id: String(p.id),
    name: p.name,
    description: p.description ?? '',
    durationWeeks: p.durationWeeks,
    level: normalizePilatesLevel(p.level),
    displayOrder: p.displayOrder,
    workouts: (p.workouts ?? []).map((w) => ({
      id: w.id,
      pilatesProgramId: w.pilatesProgramId ?? p.id,
      name: w.name,
      description: w.description ?? '',
      durationMinutes: w.durationMinutes,
      orderIndex: w.orderIndex,
      isCompleted: w.isCompleted,
    })),
  };
}

function mapProgressToUserProgram(
  row: UserPilatesProgressResponse,
  userId: string,
): UserProgram {
  const pilatesProgramId = String(row.pilatesProgramId);
  const enrolledAt =
    typeof row.enrolledAt === 'string'
      ? row.enrolledAt
      : new Date(row.enrolledAt).toISOString();
  return {
    id: `remote-enroll-${userId}-${pilatesProgramId}`,
    userId,
    pilatesProgramId,
    enrolledAt,
    completedAt: row.completedAt,
  };
}

function mapWorkoutProgressToCompletion(
  row: UserPilatesWorkoutProgressResponse,
  userId: string,
): WorkoutCompletion {
  const completedAt =
    row.completedAt != null
      ? typeof row.completedAt === 'string'
        ? row.completedAt
        : new Date(row.completedAt).toISOString()
      : new Date().toISOString();
  return {
    id: `progress-${row.id}`,
    workoutId: String(row.pilatesWorkoutId),
    pilatesWorkoutId: row.pilatesWorkoutId,
    pilatesProgramId: String(row.pilatesProgramId),
    workoutTitle: row.programName || row.workoutName,
    programName: row.programName,
    workoutName: row.workoutName,
    completedAt,
    durationMinutes: row.durationMinutes,
    userId,
  };
}

function sortWorkouts(program: PilatesProgram) {
  return [...(program.workouts ?? [])].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
  );
}

export function isNumericPilatesId(id: string): boolean {
  return /^\d+$/.test(id.trim());
}

export function programsAreFromApi(programs: PilatesProgram[]): boolean {
  return programs.some(
    (p) => isNumericPilatesId(p.id) && (p.workouts?.length ?? 0) > 0,
  );
}

function findApiProgram(
  programs: PilatesProgram[],
  pilatesProgramId?: string,
  programName?: string,
): PilatesProgram | undefined {
  const pid = pilatesProgramId?.trim();
  if (pid && isNumericPilatesId(pid)) {
    const hit = programs.find((p) => p.id === pid);
    if (hit) return hit;
  }
  const name = programName?.trim().toLowerCase();
  if (name) {
    return programs.find((p) => p.name.trim().toLowerCase() === name);
  }
  return undefined;
}

export function resolveApiProgramId(
  programOrCatalogId: string,
  programs: PilatesProgram[],
): string {
  const key = programOrCatalogId.trim();
  if (isNumericPilatesId(key)) return key;

  const byId = programs.find((p) => p.id === key);
  if (byId && isNumericPilatesId(byId.id)) return byId.id;

  const catalog = findCatalogByProgramName(key);
  if (catalog) {
    const byName = programs.find(
      (p) => p.name.trim().toLowerCase() === catalog.title.trim().toLowerCase(),
    );
    if (byName && isNumericPilatesId(byName.id)) return byName.id;
  }

  return key;
}

export async function getPrograms(): Promise<PilatesProgram[]> {
  const body = await request<PilatesProgramResponse[]>(
    apiUrl(ROUTES.programs),
    { method: 'GET' },
    true,
  );
  if (!body || !Array.isArray(body)) return [];
  return body.map(mapApiProgramToDomain);
}

export async function enroll(
  pilatesProgramId: number,
): Promise<UserPilatesProgressResponse> {
  const payload: EnrollPilatesProgramRequest = { pilatesProgramId };
  const body = await request<UserPilatesProgressResponse>(
    apiUrl(ROUTES.enroll),
    { method: 'POST', body: JSON.stringify(payload) },
    true,
  );
  if (!body) throw new Error('enroll: empty response');
  return body;
}

export async function getMyEnrollments(userId: string): Promise<UserProgram[]> {
  const body = await request<UserPilatesProgressResponse[]>(
    apiUrl(ROUTES.myEnrollments),
    { method: 'GET' },
    true,
  );
  if (!body || !Array.isArray(body)) return [];
  return body.map((row) => mapProgressToUserProgram(row, userId));
}

export async function deleteMyEnrollment(pilatesProgramId: number): Promise<void> {
  const auth = await bearerAuthHeaders(true);
  const res = await fetch(apiUrl(ROUTES.myEnrollmentByProgramId(pilatesProgramId)), {
    method: 'DELETE',
    headers: { Accept: 'application/json', ...auth },
  });
  if (res.ok || res.status === 204 || res.status === 404) return;
  const text = await res.text();
  throw new Error(`API ${res.status}: ${text.slice(0, 300)}`);
}

export async function getMyWorkoutProgress(
  userId: string,
): Promise<WorkoutCompletion[]> {
  const body = await request<UserPilatesWorkoutProgressResponse[]>(
    apiUrl(ROUTES.myWorkoutProgress),
    { method: 'GET' },
    true,
  );
  if (!body || !Array.isArray(body)) return [];
  return body.map((row) => mapWorkoutProgressToCompletion(row, userId));
}

export async function completeWorkout(
  pilatesWorkoutId: number,
  entry: WorkoutCompletion,
  userId: string,
): Promise<WorkoutCompletion> {
  const payload: CompletePilatesWorkoutRequest = {
    pilatesWorkoutId,
    programName: entry.programName?.trim() || undefined,
    workoutName: entry.workoutName?.trim() || undefined,
    exercisesCompleted:
      entry.exercisesCompleted?.filter((n) => n.trim().length > 0) ?? undefined,
  };
  const body = await request<UserPilatesProgressResponse>(
    apiUrl(ROUTES.completeWorkout),
    { method: 'POST', body: JSON.stringify(payload) },
    true,
  );
  return {
    ...entry,
    userId,
    workoutId: String(pilatesWorkoutId),
    pilatesWorkoutId,
    workoutTitle: body?.programName ?? entry.workoutTitle,
  };
}

async function resolvePilatesWorkoutIdsFromApi(
  pilatesProgramId?: string,
  programName?: string,
  hintWorkoutIds?: number[],
): Promise<{ programId: number; workoutIds: number[]; program: PilatesProgram }> {
  const programs = await getPrograms();
  if (programs.length === 0) {
    throw new Error('No programs in database. Add rows to PilatesPrograms and PilatesWorkouts.');
  }

  const prog = findApiProgram(programs, pilatesProgramId, programName);
  if (!prog) {
    throw new Error(
      `Program not found (id=${pilatesProgramId ?? '?'}, name=${programName || '?'}). Pull to refresh after login.`,
    );
  }

  const programId = parseInt(prog.id, 10);
  if (!Number.isFinite(programId)) {
    throw new Error(`Program "${prog.name}" has no numeric SQL id. Refresh the Pilates list.`);
  }

  const sorted = sortWorkouts(prog);
  let workoutIds = sorted
    .filter((w) => !w.isCompleted)
    .map((w) => w.id)
    .filter((id) => Number.isFinite(id) && id > 0);

  if (workoutIds.length === 0 && hintWorkoutIds?.length) {
    workoutIds = hintWorkoutIds.filter((id) =>
      sorted.some((w) => w.id === id),
    );
  }

  if (workoutIds.length === 0) {
    workoutIds = sorted
      .map((w) => w.id)
      .filter((id) => Number.isFinite(id) && id > 0);
  }

  if (workoutIds.length === 0 && hintWorkoutIds?.length) {
    workoutIds = hintWorkoutIds.filter((id) => Number.isFinite(id) && id > 0);
  }

  if (workoutIds.length === 0) {
    throw new Error(
      `Program "${prog.name}" has no rows in PilatesWorkouts. In SQL or Swagger POST /api/Pilates/workouts add at least one workout for program id ${programId}.`,
    );
  }

  return { programId, workoutIds, program: prog };
}

export type SaveWorkoutCompletionOptions = {
  pilatesWorkoutId?: number;
  pilatesWorkoutIds?: number[];
  durationMinutes?: number;
  programName?: string;
  workoutName?: string;
  exercisesCompleted?: string[];
};

export async function saveWorkoutCompletionToDatabase(
  pilatesProgramId: string,
  programName: string,
  options?: SaveWorkoutCompletionOptions,
): Promise<number> {
  if (!(await hasAuthToken())) {
    throw new Error('Sign in required to save progress to the server.');
  }

  const hintIds =
    options?.pilatesWorkoutIds?.filter((id) => id > 0) ??
    (options?.pilatesWorkoutId != null && options.pilatesWorkoutId > 0
      ? [options.pilatesWorkoutId]
      : undefined);

  const { programId, workoutIds, program: prog } = await resolvePilatesWorkoutIdsFromApi(
    pilatesProgramId,
    programName,
    hintIds,
  );

  const sorted = sortWorkouts(prog);
  const incomplete = sorted.filter((w) => !w.isCompleted).map((w) => w.id);
  let pilatesWorkoutIdToSave = 0;

  if (options?.pilatesWorkoutId != null && options.pilatesWorkoutId > 0) {
    pilatesWorkoutIdToSave = options.pilatesWorkoutId;
  } else if (incomplete.length > 0) {
    pilatesWorkoutIdToSave = incomplete[0]!;
  } else {
    pilatesWorkoutIdToSave = workoutIds[0]!;
  }

  if (!workoutIds.includes(pilatesWorkoutIdToSave)) {
    throw new Error(
      `Workout id ${pilatesWorkoutIdToSave} is not in program "${prog.name}". Pull to refresh.`,
    );
  }

  const sessionMinutes = Math.max(1, options?.durationMinutes ?? 1);
  const apiWorkout = sorted.find((w) => w.id === pilatesWorkoutIdToSave);
  const programLabel = options?.programName?.trim() || prog.name;
  const workoutLabel =
    options?.workoutName?.trim() || apiWorkout?.name || programLabel;

  await completeWorkout(
    pilatesWorkoutIdToSave,
    {
      id: `local-${Date.now()}-${pilatesWorkoutIdToSave}`,
      workoutId: String(pilatesWorkoutIdToSave),
      pilatesWorkoutId: pilatesWorkoutIdToSave,
      pilatesProgramId: String(programId),
      workoutTitle: programLabel,
      programName: programLabel,
      workoutName: workoutLabel,
      exercisesCompleted: options?.exercisesCompleted,
      completedAt: new Date().toISOString(),
      durationMinutes: sessionMinutes,
    },
    'sync',
  );

  return 1;
}

export async function getLastPilatesSyncError(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_LAST_SYNC_ERROR);
}

export async function setLastPilatesSyncError(message: string | null): Promise<void> {
  if (message == null || message.trim() === '') {
    await AsyncStorage.removeItem(KEY_LAST_SYNC_ERROR);
    return;
  }
  await AsyncStorage.setItem(KEY_LAST_SYNC_ERROR, message.trim());
}

export async function syncPilatesAfterAuth(): Promise<PilatesProgram[]> {
  await clearPilatesApiCache();
  const programs = await reloadPilatesProgramsFromApi();
  hydratePilatesModelFromPrograms(programs);
  if (!programsAreFromApi(programs)) {
    const msg =
      programs.length === 0
        ? 'API has no programs. Add PilatesPrograms and PilatesWorkouts in the database.'
        : 'Programs are not from the database (non-numeric IDs).';
    await setLastPilatesSyncError(msg);
  } else {
    await setLastPilatesSyncError(null);
  }
  return programs;
}
