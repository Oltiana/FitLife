import { getWorkoutById, pilatesCatalog } from '../data/pilatesCatalog';
import { pilatesImageAssets } from '../data/pilatesImageAssets';
import type { PilatesWorkout } from '../domain/PilatesDomainTypes';
import type { PilatesCategory, PilatesExercise } from '../domain/PilatesDomainTypes';
import {
  parseProgramExercisesJson,
  type PilatesProgram,
} from '../domain/PilatesProgramTypes';

let runtimeWorkouts: PilatesWorkout[] = pilatesCatalog;

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
  const staticMatch = getWorkoutById(program.id);
  const refs = parseProgramExercisesJson(program.exercises_json);

  const exercises: PilatesExercise[] =
    refs.length > 0
      ? refs.map((r, idx) => {
          const staticExercise = staticMatch?.exercises.find((ex) => ex.id === r.id);
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
      : (staticMatch?.exercises ?? []);

  const totalSec = exercises.reduce((sum, ex) => sum + ex.durationSec, 0);
  const estimatedMinutes = Math.max(
    1,
    totalSec > 0 ? Math.round(totalSec / 60) : staticMatch?.estimatedMinutes ?? 10,
  );

  return {
    id: program.id,
    title: program.name,
    level: program.level,
    category: staticMatch?.category ?? guessCategory(program),
    estimatedMinutes,
    description:
      staticMatch?.description ??
      `Structured ${program.duration_weeks}-week ${program.level} Pilates program.`,
    coverImage: staticMatch?.coverImage ?? fallbackExerciseImage(0),
    exercises,
  };
}

export function hydratePilatesModelFromPrograms(programs: PilatesProgram[]): void {
  const mapped = programs.map(mapProgramToWorkout).filter((w) => w.exercises.length > 0);
  runtimeWorkouts = mapped.length > 0 ? mapped : pilatesCatalog;
}

/**
 * Model: të dhëna statike të katalogut Pilates (pa logjikë UI).
 * Shtresa e Model-it për diagram/ SRS (MVVM).
 */
export const PilatesModel = {
  listWorkouts(): PilatesWorkout[] {
    return runtimeWorkouts;
  },

  getWorkoutById(id: string): PilatesWorkout | undefined {
    return runtimeWorkouts.find((w) => w.id === id);
  },
};
