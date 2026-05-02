import { getApiBaseUrl } from '../config/PilatesApiConfig';
import type { PilatesProgram, UserProgram } from '../domain/PilatesProgramTypes';
import type { UserPreferences } from '../domain/PilatesUserPreferences';
import type { PilatesLevel, WorkoutCompletion } from '../domain/PilatesDomainTypes';

type CompletionDto = {
  id: string;
  workoutId: string;
  workoutTitle: string;
  completedAt: string;
  durationMinutes: number;
  userId?: string | null;
  caloriesBurned?: number | null;
  displayOrder?: number | null;
};

type ProgramDto = {
  id: string;
  name: string;
  durationWeeks: number;
  level: string;
  exercisesJson: string;
  displayOrder?: number;
};

type EnrollmentDto = {
  id: string;
  userId: string;
  programId: string;
  enrolledAt: string;
};

type PreferencesDto = {
  onboardingComplete: boolean;
  dailyCalorieTarget: number | null;
  dailyMinutesTarget: number | null;
};

export type PilatesBootstrapUser = {
  userId: string;
  displayName?: string;
};

type WeightEntryDto = {
  id: string;
  userId: string;
  loggedAt: string;
  kg: number;
};

function mapCompletion(
  row: CompletionDto,
  fallbackUserId?: string,
): WorkoutCompletion {
  const resolved =
    row.userId != null && String(row.userId).trim() !== ''
      ? String(row.userId).trim()
      : fallbackUserId?.trim() || undefined;
  return {
    id: row.id,
    workoutId: row.workoutId,
    workoutTitle: row.workoutTitle,
    completedAt: row.completedAt,
    durationMinutes: row.durationMinutes,
    userId: resolved,
    caloriesBurned:
      row.caloriesBurned != null && !Number.isNaN(row.caloriesBurned)
        ? row.caloriesBurned
        : undefined,
    displayOrder:
      row.displayOrder != null && !Number.isNaN(row.displayOrder)
        ? row.displayOrder
        : undefined,
  };
}

async function request<T>(
  url: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; body: T | null }> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
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

/** Thirr POST /api/pilates/users/bootstrap — idempotent. */
export async function bootstrapFitLifeBackend(
  baseUrl: string,
  user?: PilatesBootstrapUser,
): Promise<void> {
  await request(`${baseUrl}/api/pilates/users/bootstrap`, {
    method: 'POST',
    body:
      user != null
        ? JSON.stringify({
            userId: user.userId,
            displayName: user.displayName ?? null,
          })
        : undefined,
  });
}

export async function fetchCompletionsRemote(
  baseUrl: string,
  userId: string,
  _bootstrapUser?: PilatesBootstrapUser,
): Promise<WorkoutCompletion[]> {
  /* Mos e lidh POST bootstrap me completions — nëse bootstrap dështon, SQL nuk merr kurrë INSERT. Seed bëhet në startup të API-së. */
  const { body } = await request<CompletionDto[]>(
    `${baseUrl}/api/pilates/users/${encodeURIComponent(userId)}/completions`,
    { method: 'GET' },
  );
  if (!body || !Array.isArray(body)) return [];
  return body.map((row) => mapCompletion(row, userId));
}

export async function postCompletionRemote(
  baseUrl: string,
  userId: string,
  entry: WorkoutCompletion,
  _bootstrapUser?: PilatesBootstrapUser,
): Promise<WorkoutCompletion> {
  const payload = {
    id: entry.id,
    workoutId: entry.workoutId,
    workoutTitle: entry.workoutTitle,
    completedAt: entry.completedAt,
    durationMinutes: entry.durationMinutes,
    caloriesBurned: entry.caloriesBurned ?? null,
  };
  const { body } = await request<CompletionDto>(
    `${baseUrl}/api/pilates/users/${encodeURIComponent(userId)}/completions`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
  if (!body) throw new Error('FitLife API: empty body after POST completion');
  return mapCompletion(body, userId);
}

export async function fetchPreferencesRemote(
  baseUrl: string,
  userId: string,
): Promise<UserPreferences> {
  await bootstrapFitLifeBackend(baseUrl);
  const url = `${baseUrl}/api/pilates/users/${encodeURIComponent(userId)}/preferences`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (res.status === 404) {
    return {
      onboardingComplete: false,
      dailyCalorieTarget: null,
      dailyMinutesTarget: null,
    };
  }
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`FitLife API ${res.status}: ${t.slice(0, 300)}`);
  }
  const j = (await res.json()) as PreferencesDto;
  return {
    onboardingComplete: j.onboardingComplete,
    dailyCalorieTarget: j.dailyCalorieTarget,
    dailyMinutesTarget: j.dailyMinutesTarget,
  };
}

export async function putPreferencesRemote(
  baseUrl: string,
  userId: string,
  prefs: UserPreferences,
): Promise<void> {
  await bootstrapFitLifeBackend(baseUrl);
  const payload = {
    onboardingComplete: prefs.onboardingComplete,
    dailyCalorieTarget: prefs.dailyCalorieTarget,
    dailyMinutesTarget: prefs.dailyMinutesTarget,
  };
  await request(`${baseUrl}/api/pilates/users/${encodeURIComponent(userId)}/preferences`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function mapProgramDtoToPilatesProgram(p: ProgramDto): PilatesProgram {
  return {
    id: p.id,
    name: p.name,
    duration_weeks: p.durationWeeks,
    level: p.level as PilatesLevel,
    exercises_json: p.exercisesJson,
    display_order:
      p.displayOrder != null && !Number.isNaN(p.displayOrder)
        ? p.displayOrder
        : undefined,
  };
}

export async function fetchProgramsRemote(
  baseUrl: string,
): Promise<PilatesProgram[]> {
  await bootstrapFitLifeBackend(baseUrl);
  const { body } = await request<ProgramDto[]>(
    `${baseUrl}/api/pilates/programs`,
    { method: 'GET' },
  );
  if (!body || !Array.isArray(body)) return [];
  return body.map(mapProgramDtoToPilatesProgram);
}

function mapEnrollmentDto(row: EnrollmentDto): UserProgram {
  return {
    id: row.id,
    userId: row.userId,
    programId: row.programId,
    enrolledAt: row.enrolledAt,
  };
}

export async function fetchEnrollmentsRemote(
  baseUrl: string,
  userId: string,
): Promise<UserProgram[]> {
  await bootstrapFitLifeBackend(baseUrl);
  const { body } = await request<EnrollmentDto[]>(
    `${baseUrl}/api/pilates/users/${encodeURIComponent(userId)}/enrollments`,
    { method: 'GET' },
  );
  if (!body || !Array.isArray(body)) return [];
  return body.map(mapEnrollmentDto);
}

export async function postEnrollmentRemote(
  baseUrl: string,
  userId: string,
  programId: string,
): Promise<void> {
  await bootstrapFitLifeBackend(baseUrl);
  const res = await fetch(
    `${baseUrl}/api/pilates/users/${encodeURIComponent(userId)}/enrollments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ programId }),
    },
  );
  if (res.ok || res.status === 200) return;
  const text = await res.text();
  throw new Error(`FitLife API ${res.status}: ${text.slice(0, 300)}`);
}

export async function deleteEnrollmentRemote(
  baseUrl: string,
  userId: string,
  programId: string,
): Promise<void> {
  await bootstrapFitLifeBackend(baseUrl);
  const res = await fetch(
    `${baseUrl}/api/pilates/users/${encodeURIComponent(userId)}/enrollments/${encodeURIComponent(programId)}`,
    { method: 'DELETE' },
  );
  if (res.ok || res.status === 204 || res.status === 404) return;
  const text = await res.text();
  throw new Error(`FitLife API ${res.status}: ${text.slice(0, 300)}`);
}

export async function fetchWeightEntriesRemote(
  baseUrl: string,
  userId: string,
): Promise<{ id: string; date: string; kg: number }[]> {
  await bootstrapFitLifeBackend(baseUrl);
  const { body } = await request<WeightEntryDto[]>(
    `${baseUrl}/api/pilates/users/${encodeURIComponent(userId)}/weights`,
    { method: 'GET' },
  );
  if (!body || !Array.isArray(body)) return [];
  return body.map((w) => {
    const kgRaw = w.kg as unknown;
    const kg =
      typeof kgRaw === 'number' && Number.isFinite(kgRaw)
        ? kgRaw
        : Number(kgRaw);
    const date =
      typeof w.loggedAt === 'string'
        ? w.loggedAt
        : String(w.loggedAt ?? '');
    return {
      id: String(w.id),
      date,
      kg,
    };
  });
}

export async function postWeightEntryRemote(
  baseUrl: string,
  userId: string,
  entry: { id?: string; date: string; kg: number },
): Promise<{ id: string; date: string; kg: number }> {
  await bootstrapFitLifeBackend(baseUrl);
  const { body } = await request<WeightEntryDto>(
    `${baseUrl}/api/pilates/users/${encodeURIComponent(userId)}/weights`,
    {
      method: 'POST',
      body: JSON.stringify({
        id: entry.id ?? null,
        loggedAt: entry.date,
        kg: entry.kg,
      }),
    },
  );
  if (!body) throw new Error('FitLife API: empty body after POST weight');
  return { id: body.id, date: body.loggedAt, kg: body.kg };
}

export async function deleteWeightEntryRemote(
  baseUrl: string,
  userId: string,
  weightId: string,
): Promise<void> {
  await bootstrapFitLifeBackend(baseUrl);
  const res = await fetch(
    `${baseUrl}/api/pilates/users/${encodeURIComponent(userId)}/weights/${encodeURIComponent(weightId)}`,
    { method: 'DELETE' },
  );
  if (res.ok || res.status === 204 || res.status === 404) return;
  const text = await res.text();
  throw new Error(`FitLife API ${res.status}: ${text.slice(0, 300)}`);
}


/**
 * Nëse është konfiguruar API, bën bootstrap në hapjen e aplikacionit.
 */
export async function bootstrapRemoteApiIfConfigured(): Promise<void> {
  const base = getApiBaseUrl();
  if (!base) return;
  try {
    await bootstrapFitLifeBackend(base);
  } catch (e) {
    console.warn('[FitLife] Remote API bootstrap failed:', e);
  }
}
