import {
  findCatalogByProgram,
  getCatalogWorkoutById,
  pilatesCatalog,
  pilatesImageAssets,
} from '../../../data/pilates/catalog';
import {
  normalizePilatesLevel,
  type PilatesWorkout,
} from '../../../domain/PilatesDomainTypes';
import type { PilatesCategory, PilatesExercise } from '../../../domain/PilatesDomainTypes';
import {
  programToExerciseRefs,
  type PilatesProgram,
} from '../../../domain/PilatesProgramTypes';

let runtimeWorkouts: PilatesWorkout[] = [...pilatesCatalog];

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
      : catalogMatch?.exercises?.length
        ? catalogMatch.exercises
        : [
            {
              id: `${program.id}-session`,
              name: program.name,
              description:
                program.description.trim() || 'Session from your program.',
              durationSec: Math.max(
                60,
                (program.workouts?.[0]?.durationMinutes ?? 10) * 60,
              ),
              image: fallbackExerciseImage(0),
              imageCropPosition: 'center' as const,
            },
          ];

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
    estimatedCalories:
      nextWorkout?.estimatedCalories != null && nextWorkout.estimatedCalories > 0
        ? nextWorkout.estimatedCalories
        : undefined,
    description: program.description || catalogMatch?.description || program.name,
    coverImage: catalogMatch?.coverImage ?? fallbackExerciseImage(0),
    exercises,
  };
}

function mergeCatalogWithApiPrograms(apiPrograms: PilatesProgram[]): PilatesWorkout[] {
  const apiByName = new Map(
    apiPrograms.map((p) => [p.name.trim().toLowerCase(), p]),
  );
  const usedApiProgramIds = new Set<string>();

  const fromCatalog: PilatesWorkout[] = pilatesCatalog.map((catalogWorkout) => {
    const api = apiByName.get(catalogWorkout.title.trim().toLowerCase());
    if (api != null && /^\d+$/.test(String(api.id).trim())) {
      const apiId = String(api.id).trim();
      usedApiProgramIds.add(apiId);
      const fromApi = mapProgramToWorkout(api);
      return {
        ...fromApi,
        id: apiId,
        pilatesProgramId: apiId,
        title: catalogWorkout.title,
        level: catalogWorkout.level,
        category: catalogWorkout.category,
        estimatedMinutes: catalogWorkout.estimatedMinutes,
        description: catalogWorkout.description,
        coverImage: catalogWorkout.coverImage,
        exercises: catalogWorkout.exercises,
      };
    }
    return { ...catalogWorkout };
  });

  const apiOnly = apiPrograms
    .filter((p) => {
      const id = String(p.id).trim();
      return /^\d+$/.test(id) && !usedApiProgramIds.has(id);
    })
    .map(mapProgramToWorkout);

  return [...fromCatalog, ...apiOnly];
}

export function hydratePilatesModelFromPrograms(programs: PilatesProgram[]): void {
  runtimeWorkouts = mergeCatalogWithApiPrograms(programs);
}

export const PilatesModel = {
  listWorkouts(): PilatesWorkout[] {
    return runtimeWorkouts;
  },

  getWorkoutById(id: string): PilatesWorkout | undefined {
    return (
      runtimeWorkouts.find((w) => w.id === id) ?? getCatalogWorkoutById(id)
    );
  },
};
