import { enroll, getMyEnrollments } from './PilatesBackendApi';
import { hasAuthToken } from './pilatesApiSession';
import type { PilatesProgram } from '../domain/PilatesProgramTypes';

export function isNumericPilatesId(id: string): boolean {
  return /^\d+$/.test(id.trim());
}


export async function ensurePilatesEnrollmentRemote(
  userId: string,
  pilatesProgramId: number,
): Promise<void> {
  if (!(await hasAuthToken())) return;

  const pid = String(pilatesProgramId);
  const enrollments = await getMyEnrollments(userId);
  if (enrollments.some((e) => e.pilatesProgramId === pid)) return;
  await enroll(pilatesProgramId);
}

export function findPilatesProgramIdForWorkout(
  pilatesWorkoutId: number,
  programs: PilatesProgram[],
): number | null {
  for (const p of programs) {
    if (!isNumericPilatesId(p.id)) continue;
    if (p.workouts?.some((w) => w.id === pilatesWorkoutId)) {
      return parseInt(p.id, 10);
    }
  }
  return null;
}

export function programsAreFromApi(programs: PilatesProgram[]): boolean {
  return programs.some(
    (p) => isNumericPilatesId(p.id) && (p.workouts?.length ?? 0) > 0,
  );
}
