import { completeWorkout, enroll, getPrograms } from './PilatesBackendApi';
import { hasAuthToken } from './pilatesApiSession';
import { getApiBaseUrl } from '../config/PilatesApiConfig';
import { API_BASE_URL } from '../constants/apiConfig';
import type { PilatesProgram } from '../domain/PilatesProgramTypes';

function sortWorkouts(program: PilatesProgram) {
  return [...(program.workouts ?? [])].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
  );
}


export function findApiProgram(
  programs: PilatesProgram[],
  pilatesProgramId?: string,
  programName?: string,
): PilatesProgram | undefined {
  const pid = pilatesProgramId?.trim();
  if (pid && /^\d+$/.test(pid)) {
    const hit = programs.find((p) => p.id === pid);
    if (hit) return hit;
  }
  const name = programName?.trim().toLowerCase();
  if (name) {
    return programs.find((p) => p.name.trim().toLowerCase() === name);
  }
  return undefined;
}

export async function resolvePilatesWorkoutIdsFromApi(
  pilatesProgramId?: string,
  programName?: string,
  fallbackSingleId?: number,
): Promise<{ programId: number; workoutIds: number[] }> {
  const programs = await getPrograms();
  if (programs.length === 0) {
    throw new Error(
      'Nuk ka programe në databazë. Rinis API (dotnet run) dhe kontrollo PilatesPrograms.',
    );
  }

  const prog = findApiProgram(programs, pilatesProgramId, programName);
  if (!prog) {
    throw new Error(
      `Programi nuk u gjet në API (pilatesProgramId=${pilatesProgramId ?? '?'}). Rifresko listën Pilates.`,
    );
  }

  const programId = parseInt(prog.id, 10);
  if (!Number.isFinite(programId)) {
    throw new Error(`Programi "${prog.name}" nuk ka ID numerik nga SQL.`);
  }

  let workoutIds = sortWorkouts(prog)
    .map((w) => w.id)
    .filter((id) => Number.isFinite(id) && id > 0);

  if (workoutIds.length === 0 && fallbackSingleId != null) {
    workoutIds = [fallbackSingleId];
  }

  if (workoutIds.length === 0) {
    throw new Error(
      `Programi "${prog.name}" nuk ka ushtrime në PilatesWorkouts. Kontrollo databazën.`,
    );
  }

  return { programId, workoutIds };
}


export async function saveWorkoutCompletionToDatabase(
  pilatesProgramId: string,
  programName: string,
): Promise<number> {
  if (!(await hasAuthToken())) {
    throw new Error('Nuk je i loguar. Hyr me login që të ruhet në SQL.');
  }
  if (!getApiBaseUrl()) {
    throw new Error(`API URL mungon. Kontrollo apiConfig.ts (${API_BASE_URL}).`);
  }

  const { programId, workoutIds: finalIds } = await resolvePilatesWorkoutIdsFromApi(
    pilatesProgramId,
    programName,
  );

  try {
    await enroll(programId);
  } catch (e) {
    const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
    if (!msg.includes('already enrolled')) {
      throw e;
    }
  }

  for (const pilatesWorkoutId of finalIds) {
    await completeWorkout(
      pilatesWorkoutId,
      {
        id: `local-${Date.now()}-${pilatesWorkoutId}`,
        workoutId: String(pilatesWorkoutId),
        pilatesWorkoutId,
        workoutTitle: programName,
        completedAt: new Date().toISOString(),
        durationMinutes: 1,
      },
      'sync',
    );
  }

  return finalIds.length;
}
