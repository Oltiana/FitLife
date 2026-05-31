import { API_BASE_URL } from '../constants/apiConfig';
import { tokenStorage } from '../storage/tokenStorage';

const BASE_URL = API_BASE_URL;

async function authHeaders() {
  const token = await tokenStorage.getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getExercises(offset = 0, limit = 10) {
  const response = await fetch(
    `${BASE_URL}/fitness/exercises?offset=${offset}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch exercises');
  }

  return response.json();
}

export async function getWorkoutPlans() {
  const response = await fetch(`${BASE_URL}/Fitness/workout-plans`, {
    headers: await authHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log('GET WORKOUT PLANS ERROR:', response.status, errorText);
    throw new Error('Failed to fetch workout plans');
  }

  return response.json();
}

export async function createWorkoutPlan(data: {
  name: string;
  description: string;
  level: string;
}) {
  const response = await fetch(`${BASE_URL}/fitness/workout-plans`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('failed to create workout plan');
  }

  return response.json();
}

export async function addExerciseToWorkoutPlan(
  workoutPlanId: number,
  data: {
    externalExerciseId: string;
    exerciseName: string;
    bodyPart?: string;
    targetMuscle?: string;
    gifUrl?: string | null;
    sets: number;
    reps: number;
    orderIndex: number;
  }
) {
  const response = await fetch(
    `${BASE_URL}/fitness/workout-plans/${workoutPlanId}/exercises`,
    {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to add exercise to workout plan');
  }

  return response.json();
}

export async function getWorkoutPlanById(id: number) {
  const response = await fetch(`${BASE_URL}/fitness/workout-plans/${id}`, {
    headers: await authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch workout plan');
  }

  return response.json();
}

export async function startWorkoutSession(workoutPlanId: number) {
  const response = await fetch(`${BASE_URL}/fitness/workout-sessions/start`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ workoutPlanId }),
  });

  if (!response.ok) {
    throw new Error('Failed to start workout session');
  }

  return response.json();
}

export async function completeWorkoutSession(
  sessionId: number,
  data: {
    durationMinutes: number;
    calories: number;
  }
) {
  const response = await fetch(
    `${BASE_URL}/fitness/workout-sessions/${sessionId}/complete`,
    {
      method: 'PUT',
      headers: await authHeaders(),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to complete workout session');
  }

  return response.json();
}

export async function getWorkoutSessions() {
  const response = await fetch(`${BASE_URL}/fitness/workout-sessions`, {
    headers: await authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch workout sessions');
  }

  return response.json();
}

export async function getFavoriteExercises() {
  const response = await fetch(`${BASE_URL}/fitness/favorites`, {
    headers: await authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch favorite exercises');
  }

  return response.json();
}

export async function addFavoriteExercise(data: {
  externalExerciseId: string;
  exerciseName: string;
  bodyPart?: string;
  targetMuscle?: string;
  equipment?: string;
  gifUrl?: string | null;
}) {
  const response = await fetch(`${BASE_URL}/fitness/favorites`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to add favorite exercise');
  }

  return response.json();
}

export async function deleteFavoriteExercise(id: number) {
  const response = await fetch(`${BASE_URL}/fitness/favorites/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete favorite exercise');
  }

  return response.text();
}

export async function deleteWorkoutPlan(id: number) {
  const response = await fetch(`${BASE_URL}/Fitness/workout-plans/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log('DELETE WORKOUT PLAN ERROR:', response.status, errorText);
    throw new Error('Failed to delete workout plan');
  }

  return response.text();
}

export async function deleteWorkoutExercise(id: number) {
  const response = await fetch(`${BASE_URL}/fitness/workout-exercises/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete workout exercise');
  }

  return response.text();
}

export async function updateWorkoutExercise(
  id: number,
  data: {
    sets: number;
    reps: number;
  }
) {
  const response = await fetch(`${BASE_URL}/Fitness/workout-exercises/${id}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log('UPDATE WORKOUT EXERCISE ERROR:', response.status, errorText);
    throw new Error('Failed to update workout exercise');
  }

  return response.text();
}