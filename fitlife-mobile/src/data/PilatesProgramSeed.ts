import type { PilatesProgram } from '../domain/PilatesProgramTypes';
import type { PilatesWorkout } from '../domain/PilatesDomainTypes';
import { pilatesCatalog } from './pilatesCatalog';

const DURATION_WEEKS_BY_WORKOUT_ID: Record<string, number> = {
  'core-fundamentals': 2,
  'power-flow': 4,
  'deep-stretch': 2,
};

export function workoutToPilatesProgram(workout: PilatesWorkout): PilatesProgram {
  const workouts = workout.exercises.map((e, idx) => ({
    id: idx + 1,
    name: e.name,
    description: e.description,
    durationMinutes: Math.max(1, Math.round(e.durationSec / 60)),
    orderIndex: idx + 1,
    isCompleted: false,
  }));
  return {
    id: workout.id,
    name: workout.title,
    description: workout.description,
    durationWeeks: DURATION_WEEKS_BY_WORKOUT_ID[workout.id] ?? 4,
    level: workout.level,
    displayOrder: 0,
    workouts,
  };
}

export function buildPilatesProgramsFromCatalog(): PilatesProgram[] {
  return pilatesCatalog.map((workout, index) => ({
    ...workoutToPilatesProgram(workout),
    displayOrder: index + 1,
  }));
}
