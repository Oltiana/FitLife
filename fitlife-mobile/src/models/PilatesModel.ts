import { pilatesImageAssets } from '../data/pilatesImageAssets';
import { findCatalogByProgram } from '../data/pilatesCatalogLookup';
import {
  normalizePilatesLevel,
  type PilatesWorkout,
} from '../domain/PilatesDomainTypes';
import type { PilatesCategory, PilatesExercise } from '../domain/PilatesDomainTypes';
import {
  programToExerciseRefs,
  type PilatesProgram,
} from '../domain/PilatesProgramTypes';

let runtimeWorkouts: PilatesWorkout[] = [];

function guessCategory(program: PilatesProgram): PilatesCategory {
  const slug = `${program.id} ${program.name}`.toLowerCase();
  if (slug.includes('strength') || slug.includes('power')) return 'strength';
  if (
    slug.includes('mobility') ||
    slug.includes('stretch') ||
    slug.includes('restore')
  ) {
    return 'mobility';
  }
  return 'core';
}

function fallbackExerciseImage(idx: number) {
  return pilatesImageAssets[idx % pilatesImageAssets.length]!;
}

function mapProgramToWorkout(program: PilatesProgram): PilatesWorkout {
  const catalogMatch = findCatalogByProgram(program);
  const refs = programToExerciseRefs(program);

  const exercises: PilatesExercise[] =
    refs.length > 0
      ? refs.map((r, idx) => {
          const staticExercise = catalogMatch?.exercises[idx];
          return {
            id: r.id,
            name: r.name,
            description: r.description,
            durationSec: Math.max(10, Math.round(r.durationSec)),
            image: staticExercise?.image ?? fallbackExerciseImage(idx),
            imageResizeMode: staticExercise?.imageResizeMode,
            imageCropPosition: staticExercise?.imageCropPosition ?? 'center',
            imageBannerFlex: staticExercise?.imageBannerFlex,
          };
        })
      : (catalogMatch?.exercises ?? []);

  const totalSec = exercises.reduce((sum, ex) => sum + ex.durationSec, 0);
  const estimatedMinutes = Math.max(
    1,
    totalSec > 0
      ? Math.round(totalSec / 60)
      : catalogMatch?.estimatedMinutes ?? 10,
  );

  const sortedWorkouts = [...(program.workouts ?? [])].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
  );
  const nextWorkout =
    sortedWorkouts.find((w) => !w.isCompleted) ?? sortedWorkouts[0];

  return {
    id: program.id,
    pilatesProgramId: program.id,
    pilatesWorkoutId: nextWorkout?.id,
    pilatesWorkoutIds: sortedWorkouts.map((w) => w.id),
    title: program.name,
    level: normalizePilatesLevel(program.level),
    category: catalogMatch?.category ?? guessCategory(program),
    estimatedMinutes,
    description: program.description || catalogMatch?.description || program.name,
    coverImage: catalogMatch?.coverImage ?? fallbackExerciseImage(0),
    exercises,
  };
}


export function hydratePilatesModelFromPrograms(programs: PilatesProgram[]): void {
  runtimeWorkouts = programs
    .map(mapProgramToWorkout)
    .filter((w) => w.exercises.length > 0);
}

export const PilatesModel = {
  listWorkouts(): PilatesWorkout[] {
    return runtimeWorkouts;
  },

  getWorkoutById(id: string): PilatesWorkout | undefined {
    return runtimeWorkouts.find((w) => w.id === id);
  },
};
