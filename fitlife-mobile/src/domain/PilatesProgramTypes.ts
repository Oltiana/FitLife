import { normalizePilatesLevel, type PilatesLevel } from './PilatesDomainTypes';

export type User = {
  id: string;
  displayName?: string;
};


export type PilatesWorkoutItem = {
  id: number;
  pilatesProgramId?: number;
  name: string;
  description: string;
  durationMinutes: number;
  orderIndex: number;
  isCompleted: boolean;
};


export type PilatesProgram = {
  id: string;
  name: string;
  description: string;
  durationWeeks: number;
  level: PilatesLevel;
  displayOrder: number;
  workouts: PilatesWorkoutItem[];
};

export type PilatesProgramExerciseRef = {
  id: string;
  name: string;
  durationSec: number;
  description: string;
};


export type UserPilatesEnrollment = {
  id: string;
  userId: string;
  pilatesProgramId: string;
  enrolledAt: string;
  completedAt?: string | null;
};


export type UserProgram = UserPilatesEnrollment;

export function programToExerciseRefs(
  program: PilatesProgram,
): PilatesProgramExerciseRef[] {
  const sorted = [...(program.workouts ?? [])].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
  );
  return sorted.map((w) => ({
    id: String(w.id),
    name: w.name,
    description: (w.description ?? '').trim() || w.name,
    durationSec: Math.max(10, (w.durationMinutes ?? 1) * 60),
  }));
}


export function parseProgramExercisesJson(
  exercisesJson: string,
): PilatesProgramExerciseRef[] {
  try {
    const data = JSON.parse(exercisesJson) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter((x): x is PilatesProgramExerciseRef => {
      if (typeof x !== 'object' || x === null) return false;
      const o = x as Record<string, unknown>;
      return (
        typeof o.id === 'string' &&
        typeof o.name === 'string' &&
        typeof o.durationSec === 'number'
      );
    });
  } catch {
    return [];
  }
}

export function normalizePilatesProgram(raw: unknown): PilatesProgram | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const o = raw as Record<string, unknown>;
  const id = o.id != null ? String(o.id) : '';
  const name = typeof o.name === 'string' ? o.name : '';
  if (!id || !name) return null;

  const durationWeeks =
    typeof o.durationWeeks === 'number'
      ? o.durationWeeks
      : typeof o.duration_weeks === 'number'
        ? o.duration_weeks
        : 4;

  const displayOrder =
    typeof o.displayOrder === 'number'
      ? o.displayOrder
      : typeof o.display_order === 'number'
        ? o.display_order
        : 0;

  const level = normalizePilatesLevel(
    typeof o.level === 'string' ? o.level : 'beginner',
  );

  let workouts: PilatesWorkoutItem[] = [];
  if (Array.isArray(o.workouts)) {
    workouts = o.workouts
      .map((w): PilatesWorkoutItem | null => {
        if (typeof w !== 'object' || w === null) return null;
        const wo = w as Record<string, unknown>;
        const wid = typeof wo.id === 'number' ? wo.id : Number(wo.id);
        if (!Number.isFinite(wid)) return null;
        const pilatesProgramId =
          typeof wo.pilatesProgramId === 'number'
            ? wo.pilatesProgramId
            : typeof wo.pilates_program_id === 'number'
              ? wo.pilates_program_id
              : undefined;
        return {
          id: wid,
          pilatesProgramId,
          name: String(wo.name ?? ''),
          description: String(wo.description ?? ''),
          durationMinutes:
            typeof wo.durationMinutes === 'number'
              ? wo.durationMinutes
              : 10,
          orderIndex:
            typeof wo.orderIndex === 'number' ? wo.orderIndex : 0,
          isCompleted: wo.isCompleted === true,
        };
      })
      .filter((w): w is PilatesWorkoutItem => w != null);
  } else if (typeof o.exercises_json === 'string') {
    const refs = parseProgramExercisesJson(o.exercises_json);
    workouts = refs.map((r, idx) => ({
      id: idx + 1,
      name: r.name,
      description: r.description,
      durationMinutes: Math.max(1, Math.round(r.durationSec / 60)),
      orderIndex: idx + 1,
      isCompleted: false,
    }));
  }

  return {
    id,
    name,
    description: typeof o.description === 'string' ? o.description : '',
    durationWeeks,
    level,
    displayOrder,
    workouts,
  };
}

export function normalizeUserProgram(
  raw: unknown,
  fallbackUserId?: string,
): UserProgram | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const o = raw as Record<string, unknown>;
  const userId =
    typeof o.userId === 'string'
      ? o.userId
      : fallbackUserId?.trim() || '';
  const pilatesProgramId =
    typeof o.pilatesProgramId === 'string'
      ? o.pilatesProgramId
      : typeof o.programId === 'string'
        ? o.programId
        : o.pilatesProgramId != null
          ? String(o.pilatesProgramId)
          : '';
  const enrolledAt =
    typeof o.enrolledAt === 'string'
      ? o.enrolledAt
      : new Date().toISOString();
  const id =
    typeof o.id === 'string'
      ? o.id
      : `remote-enroll-${userId}-${pilatesProgramId}`;
  if (!userId || !pilatesProgramId) return null;
  return { id, userId, pilatesProgramId, enrolledAt };
}
