import { BASE_URL } from '../constants/apiConfig';
import { tokenStorage } from '../storage/tokenStorage';

export type AdminPilatesWorkout = {
  id: number;
  pilatesProgramId: number;
  name: string;
  description: string;
  durationMinutes: number;
  estimatedCalories: number;
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
  estimatedCalories: number;
  orderIndex: number;
};

export type UpdatePilatesWorkoutPayload = {
  name: string;
  description: string;
  durationMinutes: number;
  estimatedCalories: number;
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

export type AdminPilatesUserProgress = {
  id: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  programName: string;
  workoutName: string;
  isCompleted: boolean;
  completedAt: string | null;
  pilatesProgramId: number;
};

export type AdminPilatesEnrollmentRow = {
  id: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  pilatesProgramId: number;
  programName: string;
  enrolledAt: string;
  completedAt: string | null;
};

export async function fetchAdminPilatesProgress(
  programId?: number,
): Promise<AdminPilatesUserProgress[]> {
  const qs =
    programId != null ? `?programId=${encodeURIComponent(String(programId))}` : '';
  const res = await fetch(`${BASE_URL}/Admin/pilates/progress${qs}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) await parseError(res, 'Failed to load Pilates progress');
  const data = (await res.json()) as AdminPilatesUserProgress[];
  return Array.isArray(data) ? data : [];
}

export async function fetchAdminPilatesEnrollments(
  programId?: number,
): Promise<AdminPilatesEnrollmentRow[]> {
  const qs =
    programId != null ? `?programId=${encodeURIComponent(String(programId))}` : '';
  const res = await fetch(`${BASE_URL}/Admin/pilates/enrollments${qs}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) await parseError(res, 'Failed to load Pilates enrollments');
  const data = (await res.json()) as AdminPilatesEnrollmentRow[];
  return Array.isArray(data) ? data : [];
}

// --- Progress screen content (admin) ---

export type PilatesProgressUiConfig = {
  id: number;
  title: string;
  subtitle: string;
  motivationLabel: string;
  dailyTargetsTitle: string;
  dailyTargetsHint: string;
};

export type PilatesProgressPeriodSetting = {
  id: number;
  period: string;
  sectionTitle: string;
  description: string | null;
  targetCalories: number | null;
  targetMinutes: number | null;
  minutesChartTitle: string | null;
  caloriesChartTitle: string | null;
  displayOrder: number;
};

export type PilatesMotivationMessage = {
  id: number;
  message: string;
  displayOrder: number;
  isActive: boolean;
};

export type PilatesProgressContent = {
  ui: PilatesProgressUiConfig;
  periods: PilatesProgressPeriodSetting[];
  messages: PilatesMotivationMessage[];
};

export type UpdatePilatesProgressPeriodPayload = {
  sectionTitle: string;
  description: string | null;
  targetCalories: number | null;
  targetMinutes: number | null;
  minutesChartTitle: string | null;
  caloriesChartTitle: string | null;
  displayOrder: number;
};

export type UpsertMotivationMessagePayload = {
  message: string;
  displayOrder: number;
  isActive: boolean;
};

export async function fetchAdminPilatesProgressContent(): Promise<PilatesProgressContent> {
  const res = await fetch(`${BASE_URL}/Admin/pilates/progress-content`, {
    headers: await authHeaders(),
  });
  if (!res.ok) await parseError(res, 'Failed to load progress content');
  return res.json();
}

export async function updatePilatesProgressUi(
  payload: Omit<PilatesProgressUiConfig, 'id'>,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/Admin/pilates/progress-ui`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res, 'Failed to save screen text');
}

export async function updatePilatesProgressPeriod(
  id: number,
  payload: UpdatePilatesProgressPeriodPayload,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/Admin/pilates/progress-periods/${id}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res, 'Failed to save period settings');
}

export async function createMotivationMessage(
  payload: UpsertMotivationMessagePayload,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/Admin/pilates/motivation-messages`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res, 'Failed to add message');
}

export async function updateMotivationMessage(
  id: number,
  payload: UpsertMotivationMessagePayload,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/Admin/pilates/motivation-messages/${id}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res, 'Failed to update message');
}

export async function deleteMotivationMessage(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/Admin/pilates/motivation-messages/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    await parseError(res, 'Failed to delete message');
  }
}
