import { BASE_URL } from '../constants/apiConfig';
import { tokenStorage } from '../storage/tokenStorage';

export type AdminPilatesWorkout = {
  id: number;
  pilatesProgramId: number;
  name: string;
  description: string;
  durationMinutes: number;
  orderIndex: number;
};

export type AdminPilatesProgram = {
  id: number;
  name: string;
  description: string;
  durationWeeks: number;
  level: string;
  displayOrder: number;
  workouts: AdminPilatesWorkout[];
};

export type CreatePilatesProgramPayload = {
  name: string;
  description: string;
  durationWeeks: number;
  level: string;
  displayOrder: number;
};

export type UpdatePilatesProgramPayload = CreatePilatesProgramPayload;

export type CreatePilatesWorkoutPayload = {
  pilatesProgramId: number;
  name: string;
  description: string;
  durationMinutes: number;
  orderIndex: number;
};

export type UpdatePilatesWorkoutPayload = {
  name: string;
  description: string;
  durationMinutes: number;
  orderIndex: number;
};

async function authHeaders(): Promise<Record<string, string>> {
  const raw = await tokenStorage.getToken();
  const token = raw?.trim().replace(/^bearer\s+/i, '') ?? '';
  if (!token) {
    throw new Error('Sign in required. Log in as Admin and try again.');
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

async function parseError(res: Response, fallback: string): Promise<never> {
  const text = await res.text();
  throw new Error(text || fallback);
}

export async function fetchAdminPilatesPrograms(): Promise<AdminPilatesProgram[]> {
  const res = await fetch(`${BASE_URL}/Pilates/programs`, {
    headers: await authHeaders(),
  });
  if (!res.ok) await parseError(res, 'Failed to load Pilates programs');
  const data = (await res.json()) as AdminPilatesProgram[];
  return Array.isArray(data) ? data : [];
}

export async function createPilatesProgram(
  payload: CreatePilatesProgramPayload,
): Promise<AdminPilatesProgram> {
  const res = await fetch(`${BASE_URL}/Pilates/programs`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res, 'Failed to create program');
  return res.json();
}

export async function updatePilatesProgram(
  id: number,
  payload: UpdatePilatesProgramPayload,
): Promise<AdminPilatesProgram> {
  const res = await fetch(`${BASE_URL}/Pilates/programs/${id}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res, 'Failed to update program');
  return res.json();
}

export async function deletePilatesProgram(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/Pilates/programs/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    await parseError(res, 'Failed to delete program');
  }
}

export async function createPilatesWorkout(
  payload: CreatePilatesWorkoutPayload,
): Promise<AdminPilatesWorkout> {
  const res = await fetch(`${BASE_URL}/Pilates/workouts`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res, 'Failed to create workout');
  return res.json();
}

export async function updatePilatesWorkout(
  id: number,
  payload: UpdatePilatesWorkoutPayload,
): Promise<AdminPilatesWorkout> {
  const res = await fetch(`${BASE_URL}/Pilates/workouts/${id}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res, 'Failed to update workout');
  return res.json();
}

export async function deletePilatesWorkout(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/Pilates/workouts/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    await parseError(res, 'Failed to delete workout');
  }
}
