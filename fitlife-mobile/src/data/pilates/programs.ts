import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearPilatesApiCache,
  deleteMyEnrollment,
  enroll,
  getMyEnrollments,
  hasAuthToken,
  reloadPilatesProgramsFromApi,
  resolveApiProgramId,
} from '../../api/pilatesApi';
import { getApiBaseUrl } from '../../constants/apiConfig';
import {
  normalizePilatesProgram,
  normalizeUserProgram,
  type PilatesProgram,
  type User,
  type UserProgram,
} from '../../domain/PilatesProgramTypes';
import { tokenStorage } from '../../storage/tokenStorage';
import {
  KEY_PILATES_PROGRAMS,
  KEY_USER_PROGRAMS,
  readCachedPilatesPrograms,
} from './cache';

export { clearPilatesApiCache, reloadPilatesProgramsFromApi } from '../../api/pilatesApi';

const KEY_USERS = '@fitlife/users';
const KEY_ANON_PILATES_DB = '@fitlife/pilates_anon_db_user_id';
const LEGACY_LOCAL_USER_ID = 'user-local-1';

export async function getOrCreateAnonymousPilatesDbUserId(): Promise<string> {
  const existing = await AsyncStorage.getItem(KEY_ANON_PILATES_DB);
  if (existing != null && existing.trim().length > 0) return existing.trim();
  const uuid =
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const id = `pilates-anon-${uuid}`;
  await AsyncStorage.setItem(KEY_ANON_PILATES_DB, id);
  return id;
}

export async function resolvePilatesApiUserId(): Promise<string> {
  const authUser = await resolveAuthBackedUser();
  if (authUser != null) {
    try {
      await ensureDefaultUser();
    } catch {
      /* optional local user row */
    }
    return authUser.id;
  }
  try {
    return (await ensureDefaultUser()).id;
  } catch {
    return getOrCreateAnonymousPilatesDbUserId();
  }
}

export async function resolvePilatesBootstrapUser(): Promise<{
  userId: string;
  displayName?: string;
}> {
  const authUser = await resolveAuthBackedUser();
  if (authUser != null) {
    try {
      await ensureDefaultUser();
    } catch {
      /* optional */
    }
    return { userId: authUser.id, displayName: authUser.displayName };
  }
  try {
    const u = await ensureDefaultUser();
    return { userId: u.id, displayName: u.displayName };
  } catch {
    return {
      userId: await getOrCreateAnonymousPilatesDbUserId(),
      displayName: undefined,
    };
  }
}

function slugifyUserId(raw: string): string {
  const normalized = raw.trim().toLowerCase();
  const slug = normalized.replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-');
  const clean = slug.replace(/^-+|-+$/g, '');
  return clean.length > 0 ? clean.slice(0, 80) : '';
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

  const id = slugifyUserId(rawId);
  if (!id) return null;

  return {
    id,
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

export async function ensureDefaultUser(): Promise<User> {
  const raw = await AsyncStorage.getItem(KEY_USERS);
  const list = parseArray<unknown>(raw)
    .filter(isUser)
    .filter((u) => u.id !== LEGACY_LOCAL_USER_ID);
  const authUser = await resolveAuthBackedUser();
  if (authUser != null) {
    const existing = list.find((u) => u.id === authUser.id);
    const merged: User = existing
      ? {
          ...existing,
          displayName: authUser.displayName ?? existing.displayName,
        }
      : authUser;
    const nextList = existing
      ? list.map((u) => (u.id === merged.id ? merged : u))
      : [merged, ...list.filter((u) => u.id !== merged.id)];
    await AsyncStorage.setItem(KEY_USERS, JSON.stringify(nextList));
    return merged;
  }

  if (list.length > 0) return list[0]!;

  throw new Error('No authenticated user found. Please login first.');
}

export async function loadUsers(): Promise<User[]> {
  const raw = await AsyncStorage.getItem(KEY_USERS);
  return parseArray<unknown>(raw).filter(isUser);
}

export async function loadPrograms(): Promise<PilatesProgram[]> {
  const base = getApiBaseUrl();
  const loggedIn = await hasAuthToken();
  if (base && loggedIn) {
    try {
      const stale = await readCachedPilatesPrograms();
      if (stale.some((p) => !/^\d+$/.test(p.id))) {
        await AsyncStorage.removeItem(KEY_PILATES_PROGRAMS);
      }
      return await reloadPilatesProgramsFromApi();
    } catch (e) {
      console.warn('[FitLife] programs API failed', e);
      const cached = await readCachedPilatesPrograms();
      if (cached.some((p) => /^\d+$/.test(p.id))) return cached;
      throw e;
    }
  }

  return readCachedPilatesPrograms();
}

export async function getProgramById(id: string): Promise<PilatesProgram | undefined> {
  const programs = await loadPrograms();
  return programs.find((p) => p.id === id);
}

export async function loadUserPrograms(userId: string): Promise<UserProgram[]> {
  const base = getApiBaseUrl();
  const loggedIn = await hasAuthToken();
  if (base && loggedIn) {
    return await getMyEnrollments(userId);
  }
  const raw = await AsyncStorage.getItem(KEY_USER_PROGRAMS);
  const all = parseArray<unknown>(raw)
    .map(normalizeUserProgram)
    .filter((up): up is UserProgram => up != null);
  return all.filter((up) => up.userId === userId);
}

export async function enrollUserInProgram(
  userId: string,
  pilatesProgramId: string,
): Promise<UserProgram[]> {
  const programs = await loadPrograms();
  if (!programs.some((p) => p.id === pilatesProgramId)) {
    throw new Error(`Unknown program: ${pilatesProgramId}`);
  }

  const base = getApiBaseUrl();
  if (base && (await hasAuthToken())) {
    const apiProgramId = resolveApiProgramId(pilatesProgramId, programs);
    if (!/^\d+$/.test(apiProgramId.trim())) {
      throw new Error(
        `Programi "${pilatesProgramId}" nuk ka ID nga databaza. Dil dhe hyr përsëri, pastaj rifresko listën Pilates.`,
      );
    }
    await enroll(parseInt(apiProgramId.trim(), 10));
    return loadUserPrograms(userId);
  }

  const raw = await AsyncStorage.getItem(KEY_USER_PROGRAMS);
  const all = parseArray<unknown>(raw)
    .map(normalizeUserProgram)
    .filter((up): up is UserProgram => up != null);
  if (
    all.some(
      (up) => up.userId === userId && up.pilatesProgramId === pilatesProgramId,
    )
  ) {
    return all.filter((up) => up.userId === userId);
  }
  const row: UserProgram = {
    id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    userId,
    pilatesProgramId,
    enrolledAt: new Date().toISOString(),
  };
  const next = [...all, row];
  await AsyncStorage.setItem(KEY_USER_PROGRAMS, JSON.stringify(next));
  return next.filter((up) => up.userId === userId);
}

export async function unenrollUserFromProgram(
  userId: string,
  pilatesProgramId: string,
): Promise<void> {
  const base = getApiBaseUrl();
  if (base) {
    const programs = await loadPrograms();
    const apiProgramId = resolveApiProgramId(pilatesProgramId, programs);
    try {
      await deleteMyEnrollment(parseInt(apiProgramId.trim(), 10));
    } catch (e) {
      console.warn('[FitLife] unenroll remote failed', e);
      throw e;
    }
    return;
  }
  const raw = await AsyncStorage.getItem(KEY_USER_PROGRAMS);
  const all = parseArray<unknown>(raw)
    .map(normalizeUserProgram)
    .filter((up): up is UserProgram => up != null);
  const next = all.filter(
    (up) =>
      !(up.userId === userId && up.pilatesProgramId === pilatesProgramId),
  );
  await AsyncStorage.setItem(KEY_USER_PROGRAMS, JSON.stringify(next));
}
