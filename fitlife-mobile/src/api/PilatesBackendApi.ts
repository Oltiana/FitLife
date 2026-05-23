import { getApiBaseUrl } from '../config/PilatesApiConfig';
import { tokenStorage } from '../storage/tokenStorage';
import { PilatesApiRoutes } from './pilatesApiRoutes';
import type {
  CompletePilatesWorkoutRequest,
  CreatePilatesProgramRequest,
  CreatePilatesWorkoutRequest,
  EnrollPilatesProgramRequest,
  PilatesProgramResponse,
  PilatesWorkoutResponse,
  UserPilatesProgressResponse,
  UserPilatesWorkoutProgressResponse,
} from './pilatesApiTypes';
import type { PilatesProgram, UserProgram } from '../domain/PilatesProgramTypes';
import type { UserPreferences } from '../domain/PilatesUserPreferences';
import {
  normalizePilatesLevel,
  type PilatesLevel,
  type WorkoutCompletion,
} from '../domain/PilatesDomainTypes';

export type PilatesBootstrapUser = {
  userId: string;
  displayName?: string;
};

function apiUrl(path: string): string {
  return `${getApiBaseUrl()}${path}`;
}

async function bearerAuthHeaders(requireToken = false): Promise<Record<string, string>> {
  const t = await tokenStorage.getToken();
  if (t == null || String(t).trim() === '') {
    if (requireToken) {
      throw new Error(
        'Duhet të hysh me login që të ruhen të dhënat në databazë (JWT mungon).',
      );
    }
    return {};
  }
  return { Authorization: `Bearer ${String(t).trim()}` };
}

async function request<T>(
  url: string,
  init?: RequestInit,
  requireAuth = false,
): Promise<{ ok: boolean; status: number; body: T | null }> {
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
  if (res.status === 204)
    return { ok: res.ok, status: res.status, body: null };
  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `FitLife API ${res.status} ${url}: ${text.slice(0, 400)}`,
    );
  }
  if (!text) return { ok: true, status: res.status, body: null };
  return {
    ok: true,
    status: res.status,
    body: JSON.parse(text) as T,
  };
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
    workoutTitle: row.workoutName,
    completedAt,
    durationMinutes: row.durationMinutes,
    userId,
  };
}


export async function getPrograms(): Promise<PilatesProgram[]> {
  const { body } = await request<PilatesProgramResponse[]>(
    apiUrl(PilatesApiRoutes.programs),
    { method: 'GET' },
    true,
  );
  if (!body || !Array.isArray(body)) return [];
  return body.map(mapApiProgramToDomain);
}


export async function getProgramById(
  pilatesProgramId: number,
): Promise<PilatesProgram | null> {
  const { body } = await request<PilatesProgramResponse>(
    apiUrl(PilatesApiRoutes.programById(pilatesProgramId)),
    { method: 'GET' },
    true,
  );
  return body ? mapApiProgramToDomain(body) : null;
}


export async function createProgram(
  payload: CreatePilatesProgramRequest,
): Promise<PilatesProgram> {
  const { body } = await request<PilatesProgramResponse>(
    apiUrl(PilatesApiRoutes.programs),
    { method: 'POST', body: JSON.stringify(payload) },
    true,
  );
  if (!body) throw new Error('createProgram: empty response');
  return mapApiProgramToDomain(body);
}


export async function createWorkout(
  payload: CreatePilatesWorkoutRequest,
): Promise<PilatesWorkoutResponse> {
  const { body } = await request<PilatesWorkoutResponse>(
    apiUrl(PilatesApiRoutes.workouts),
    { method: 'POST', body: JSON.stringify(payload) },
    true,
  );
  if (!body) throw new Error('createWorkout: empty response');
  return body;
}


export async function enroll(
  pilatesProgramId: number,
): Promise<UserPilatesProgressResponse> {
  const payload: EnrollPilatesProgramRequest = { pilatesProgramId };
  const { body } = await request<UserPilatesProgressResponse>(
    apiUrl(PilatesApiRoutes.enroll),
    { method: 'POST', body: JSON.stringify(payload) },
    true,
  );
  if (!body) throw new Error('enroll: empty response');
  return body;
}


export async function getMyEnrollments(userId: string): Promise<UserProgram[]> {
  const { body } = await request<UserPilatesProgressResponse[]>(
    apiUrl(PilatesApiRoutes.myEnrollments),
    { method: 'GET' },
    true,
  );
  if (!body || !Array.isArray(body)) return [];
  return body.map((row) => mapProgressToUserProgram(row, userId));
}


export async function deleteMyEnrollment(
  pilatesProgramId: number,
): Promise<void> {
  const auth = await bearerAuthHeaders(true);
  const res = await fetch(
    apiUrl(PilatesApiRoutes.myEnrollmentByProgramId(pilatesProgramId)),
    { method: 'DELETE', headers: { Accept: 'application/json', ...auth } },
  );
  if (res.ok || res.status === 204 || res.status === 404) return;
  const text = await res.text();
  throw new Error(`FitLife API ${res.status}: ${text.slice(0, 300)}`);
}


export async function getMyWorkoutProgress(
  userId: string,
): Promise<WorkoutCompletion[]> {
  const { body } = await request<UserPilatesWorkoutProgressResponse[]>(
    apiUrl(PilatesApiRoutes.myWorkoutProgress),
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
  const payload: CompletePilatesWorkoutRequest = { pilatesWorkoutId };
  const { body } = await request<UserPilatesProgressResponse>(
    apiUrl(PilatesApiRoutes.completeWorkout),
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
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



export async function fetchProgramsRemote(
  _baseUrl: string,
): Promise<PilatesProgram[]> {
  return getPrograms();
}

export async function fetchEnrollmentsRemote(
  _baseUrl: string,
  userId: string,
): Promise<UserProgram[]> {
  return getMyEnrollments(userId);
}

export async function postEnrollmentRemote(
  _baseUrl: string,
  _userId: string,
  pilatesProgramId: string,
): Promise<void> {
  const trimmed = pilatesProgramId.trim();
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(
      `pilatesProgramId duhet numerik nga GET programs (tani: "${pilatesProgramId}").`,
    );
  }
  await enroll(parseInt(trimmed, 10));
}

export async function deleteEnrollmentRemote(
  _baseUrl: string,
  _userId: string,
  pilatesProgramId: string,
): Promise<void> {
  const trimmed = pilatesProgramId.trim();
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(
      `pilatesProgramId duhet numerik (tani: "${pilatesProgramId}").`,
    );
  }
  await deleteMyEnrollment(parseInt(trimmed, 10));
}

export async function fetchCompletionsRemote(
  _baseUrl: string,
  userId: string,
  _bootstrapUser?: PilatesBootstrapUser,
): Promise<WorkoutCompletion[]> {
  return getMyWorkoutProgress(userId);
}

export async function postCompletionRemote(
  _baseUrl: string,
  userId: string,
  entry: WorkoutCompletion,
  pilatesWorkoutId: number,
  _bootstrapUser?: PilatesBootstrapUser,
): Promise<WorkoutCompletion> {
  return completeWorkout(pilatesWorkoutId, entry, userId);
}

export async function bootstrapFitLifeBackend(
  _baseUrl: string,
  _user?: PilatesBootstrapUser,
): Promise<void> {
  return;
}

export async function bootstrapRemoteApiIfConfigured(): Promise<void> {
  return;
}

export async function fetchPreferencesRemote(
  _baseUrl: string,
  _userId: string,
): Promise<UserPreferences> {
  return {
    onboardingComplete: false,
    dailyCalorieTarget: null,
    dailyMinutesTarget: null,
  };
}

export async function putPreferencesRemote(
  _baseUrl: string,
  _userId: string,
  _prefs: UserPreferences,
): Promise<void> {
  return;
}

export async function fetchWeightEntriesRemote(
  _baseUrl: string,
  _userId: string,
): Promise<{ id: string; date: string; kg: number }[]> {
  return [];
}

export async function postWeightEntryRemote(
  _baseUrl: string,
  _userId: string,
  entry: { id?: string; date: string; kg: number },
): Promise<{ id: string; date: string; kg: number }> {
  return { id: entry.id ?? 'local', date: entry.date, kg: entry.kg };
}

export async function deleteWeightEntryRemote(
  _baseUrl: string,
  _userId: string,
  _weightId: string,
): Promise<void> {
  return;
}
