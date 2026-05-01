import type { PilatesProgram } from '../domain/PilatesProgramTypes';
import type { PilatesWorkout } from '../domain/PilatesDomainTypes';
import { pilatesCatalog } from './pilatesCatalog';

/** Kohëzgjatje shembull për dokument / ERD (katalogu statik nuk e përmban). */
const DURATION_WEEKS_BY_WORKOUT_ID: Record<string, number> = {
  'core-fundamentals': 2,
  'power-flow': 4,
  'deep-stretch': 2,
};

export function workoutToPilatesProgram(workout: PilatesWorkout): PilatesProgram {
  const refs = workout.exercises.map((e) => ({
    id: e.id,
    name: e.name,
    durationSec: e.durationSec,
    description: e.description,
  }));
  return {
    id: workout.id,
    name: workout.title,
    duration_weeks:
      DURATION_WEEKS_BY_WORKOUT_ID[workout.id] ?? 4,
    level: workout.level,
    exercises_json: JSON.stringify(refs),
  };
}

export function buildPilatesProgramsFromCatalog(): PilatesProgram[] {
  return pilatesCatalog.map(workoutToPilatesProgram);
}
