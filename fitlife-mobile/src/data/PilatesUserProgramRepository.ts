import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  bootstrapFitLifeBackend,
  deleteEnrollmentRemote,
  fetchEnrollmentsRemote,
  fetchProgramsRemote,
  postEnrollmentRemote,
} from '../api/PilatesBackendApi';
import { getApiBaseUrl } from '../config/PilatesApiConfig';
import type {
  PilatesProgram,
  User,
  UserProgram,
} from '../domain/PilatesProgramTypes';
import { tokenStorage } from '../storage/tokenStorage';
import { buildPilatesProgramsFromCatalog } from './PilatesProgramSeed';

const KEY_USERS = '@fitlife/users';
const KEY_PROGRAMS = '@fitlife/pilates_programs';
const KEY_USER_PROGRAMS = '@fitlife/user_programs';

/** Eksportuar për filtrim progresi / analytics sipas përdoruesit. */
export const DEFAULT_LOCAL_USER_ID = 'user-local-1';

function slugifyUserId(raw: string): string {
  const normalized = raw.trim().toLowerCase();
  const slug = normalized.replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-');
  const clean = slug.replace(/^-+|-+$/g, '');
  return clean.length > 0 ? clean.slice(0, 80) : DEFAULT_LOCAL_USER_ID;
}

async function resolveAuthBackedUser(): Promise<User | null> {
  const authUser = await tokenStorage.getUser();
  if (typeof authUser !== 'object' || authUser == null) return null;

  const rawId =
    (typeof (authUser as { id?: unknown }).id === 'string'
      ? (authUser as { id: string }).id
      : undefined) ??
    (typeof (authUser as { email?: unknown }).email === 'string'
      ? (authUser as { email: string }).email
      : undefined);

  if (rawId == null || rawId.trim().length === 0) return null;

  const displayName =
    typeof (authUser as { fullName?: unknown }).fullName === 'string'
      ? (authUser as { fullName: string }).fullName
      : undefined;

  return {
    id: slugifyUserId(rawId),
    displayName: displayName?.trim() || undefined,
  };
}

function parseArray<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function isUser(x: unknown): x is User {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as User).id === 'string'
  );
}

function isPilatesProgram(x: unknown): x is PilatesProgram {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.duration_weeks === 'number' &&
    typeof o.level === 'string' &&
    typeof o.exercises_json === 'string'
  );
}

function isUserProgram(x: unknown): x is UserProgram {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.userId === 'string' &&
    typeof o.programId === 'string' &&
    typeof o.enrolledAt === 'string'
  );
}

export async function ensureDefaultUser(): Promise<User> {
  const raw = await AsyncStorage.getItem(KEY_USERS);
  const list = parseArray<unknown>(raw).filter(isUser);
  const authUser = await resolveAuthBackedUser();
  if (authUser != null) {
    const existing = list.find((u) => u.id === authUser.id);
    const user = existing ?? authUser;
    if (!existing) {
      await AsyncStorage.setItem(KEY_USERS, JSON.stringify([user, ...list]));
    }
    return user;
  }

  if (list.length > 0) return list[0]!;

  const user: User = { id: DEFAULT_LOCAL_USER_ID, displayName: 'Local user' };
  await AsyncStorage.setItem(KEY_USERS, JSON.stringify([user]));
  return user;
}

export async function loadUsers(): Promise<User[]> {
  const raw = await AsyncStorage.getItem(KEY_USERS);
  return parseArray<unknown>(raw).filter(isUser);
}

/**
 * Programe Pilates: me `EXPO_PUBLIC_API_URL` lista vjen nga databaza (API);
 * përndryshe AsyncStorage + katalog statik.
 */
export async function loadPrograms(): Promise<PilatesProgram[]> {
  const base = getApiBaseUrl();
  if (base) {
    try {
      const user = await ensureDefaultUser();
      await bootstrapFitLifeBackend(base, {
        userId: user.id,
        displayName: user.displayName,
      });
      const list = await fetchProgramsRemote(base);
      await AsyncStorage.setItem(KEY_PROGRAMS, JSON.stringify(list));
      return list;
    } catch (e) {
      console.warn('[FitLife] programs: remote failed, using cache', e);
    }
  }

  const raw = await AsyncStorage.getItem(KEY_PROGRAMS);
  let list = parseArray<unknown>(raw).filter(isPilatesProgram);
  if (list.length === 0) {
    list = buildPilatesProgramsFromCatalog();
    await AsyncStorage.setItem(KEY_PROGRAMS, JSON.stringify(list));
  }
  return list;
}

export async function getProgramById(id: string): Promise<PilatesProgram | undefined> {
  const programs = await loadPrograms();
  return programs.find((p) => p.id === id);
}

/**
 * Regjistrime në program: me API nga SQL Server; përndryshe lokale.
 */
export async function loadUserPrograms(userId: string): Promise<UserProgram[]> {
  const base = getApiBaseUrl();
  if (base) {
    try {
      const user = await ensureDefaultUser();
      await bootstrapFitLifeBackend(base, {
        userId: user.id,
        displayName: user.displayName,
      });
      return await fetchEnrollmentsRemote(base, userId);
    } catch (e) {
      console.warn('[FitLife] enrollments: remote failed, using cache', e);
    }
  }
  const raw = await AsyncStorage.getItem(KEY_USER_PROGRAMS);
  const all = parseArray<unknown>(raw).filter(isUserProgram);
  return all.filter((up) => up.userId === userId);
}

export async function enrollUserInProgram(
  userId: string,
  programId: string,
): Promise<UserProgram[]> {
  const programs = await loadPrograms();
  if (!programs.some((p) => p.id === programId)) {
    throw new Error(`Unknown program: ${programId}`);
  }

  const base = getApiBaseUrl();
  if (base) {
    await postEnrollmentRemote(base, userId, programId);
    return loadUserPrograms(userId);
  }

  const raw = await AsyncStorage.getItem(KEY_USER_PROGRAMS);
  const all = parseArray<unknown>(raw).filter(isUserProgram);
  if (all.some((up) => up.userId === userId && up.programId === programId)) {
    return all.filter((up) => up.userId === userId);
  }
  const row: UserProgram = {
    id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    userId,
    programId,
    enrolledAt: new Date().toISOString(),
  };
  const next = [...all, row];
  await AsyncStorage.setItem(KEY_USER_PROGRAMS, JSON.stringify(next));
  return next.filter((up) => up.userId === userId);
}

export async function unenrollUserFromProgram(
  userId: string,
  programId: string,
): Promise<void> {
  const base = getApiBaseUrl();
  if (base) {
    try {
      await deleteEnrollmentRemote(base, userId, programId);
    } catch (e) {
      console.warn('[FitLife] unenroll remote failed', e);
      throw e;
    }
    return;
  }
  const raw = await AsyncStorage.getItem(KEY_USER_PROGRAMS);
  const all = parseArray<unknown>(raw).filter(isUserProgram);
  const next = all.filter(
    (up) => !(up.userId === userId && up.programId === programId),
  );
  await AsyncStorage.setItem(KEY_USER_PROGRAMS, JSON.stringify(next));
}
