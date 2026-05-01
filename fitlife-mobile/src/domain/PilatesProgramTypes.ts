import type { PilatesLevel } from './PilatesDomainTypes';

/** Përdorues lokal (MVP pa autentikim). */
export type User = {
  id: string;
  displayName?: string;
};

/**
 * Program Pilates si entitet për dokumentim / ruajtje.
 * `exercises_json` përmban përshkrim pa imazhe (imazhet lidhen nga katalogu runtime sipas id).
 */
export type PilatesProgram = {
  id: string;
  name: string;
  duration_weeks: number;
  level: PilatesLevel;
  exercises_json: string;
};

export type PilatesProgramExerciseRef = {
  id: string;
  name: string;
  durationSec: number;
  description: string;
};

/** Tabela lidhëse User ↔ Program (N:M). */
export type UserProgram = {
  id: string;
  userId: string;
  programId: string;
  enrolledAt: string;
};

function isExerciseRef(x: unknown): x is PilatesProgramExerciseRef {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.durationSec === 'number' &&
    typeof o.description === 'string'
  );
}

export function parseProgramExercisesJson(
  exercises_json: string,
): PilatesProgramExerciseRef[] {
  try {
    const data = JSON.parse(exercises_json) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(isExerciseRef);
  } catch {
    return [];
  }
}
