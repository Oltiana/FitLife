import { BASE_URL } from '../constants/apiConfig';
import { tokenStorage } from '../storage/tokenStorage';

export type AdminFitnessExercise = {
  id: number;
  exerciseName: string;
  bodyPart: string | null;
  targetMuscle: string | null;
  sets: number;
  reps: number;
  orderIndex: number;
};

export type AdminFitnessWorkoutPlan = {
  id: number;
  name: string;
  description: string;
  level: string;
  createdAt: string;
  userId: number;
  userName: string;
  userEmail: string;
  exercisesCount: number;
  sessionsCount: number;
  exercises: AdminFitnessExercise[];
};

async function authHeaders() {
  const token = await tokenStorage.getToken();

  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

export async function getAdminFitnessWorkoutPlans(): Promise<AdminFitnessWorkoutPlan[]> {
  const res = await fetch(`${BASE_URL}/Admin/fitness/workout-plans`, {
    headers: await authHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.log('Admin fitness error:', res.status, errorText);
    throw new Error('Failed to fetch fitness workout plans');
  }

  return res.json();
}

export async function updateAdminFitnessWorkoutPlan(
  id: number,
  data: { name: string; description: string; level: string }
): Promise<void> {
  const res = await fetch(`${BASE_URL}/Admin/fitness/workout-plans/${id}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to update workout plan');
}

export async function deleteAdminFitnessWorkoutPlan(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/Admin/fitness/workout-plans/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });

  if (!res.ok) throw new Error('Failed to delete workout plan');
}

export type AdminFitnessExerciseLibraryItem = {
  id: number;
  exerciseName: string;
  bodyPart: string | null;
  targetMuscle: string | null;
  equipment: string | null;
  level: string;
  gifUrl: string | null;
};

export type CreateAdminFitnessExerciseRequest = {
  exerciseName: string;
  bodyPart?: string;
  targetMuscle?: string;
  equipment?: string;
  level: string;
  gifUrl?: string | null;
};

export async function getAdminFitnessExercises(): Promise<AdminFitnessExerciseLibraryItem[]> {
  const res = await fetch(`${BASE_URL}/Admin/fitness/exercises`, {
    headers: await authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch fitness exercises');
  }

  return res.json();
}

export async function createAdminFitnessExercise(
  data: CreateAdminFitnessExerciseRequest
): Promise<AdminFitnessExerciseLibraryItem> {
  const res = await fetch(`${BASE_URL}/Admin/fitness/exercises`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to create fitness exercise');
  }

  return res.json();
}

export async function updateAdminFitnessExercise(
  id: number,
  data: CreateAdminFitnessExerciseRequest
): Promise<void> {
  const res = await fetch(`${BASE_URL}/Admin/fitness/exercises/${id}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to update fitness exercise');
  }
}

export async function deleteAdminFitnessExercise(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/Admin/fitness/exercises/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to delete fitness exercise');
  }
}

