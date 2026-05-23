import { findCatalogByProgramName } from '../data/pilatesCatalogLookup';
import type { PilatesProgram } from '../domain/PilatesProgramTypes';
import { isNumericPilatesId } from './pilatesApiSync';

function isNumericId(id: string): boolean {
  return isNumericPilatesId(id);
}

function workoutExistsInPrograms(
  pilatesWorkoutId: number,
  programs: PilatesProgram[],
): boolean {
  return programs.some((p) =>
    p.workouts?.some((w) => w.id === pilatesWorkoutId),
  );
}

export function resolveApiProgramId(
  programOrCatalogId: string,
  programs: PilatesProgram[],
): string {
  const key = programOrCatalogId.trim();
  if (isNumericId(key)) return key;

  const byId = programs.find((p) => p.id === key);
  if (byId && isNumericId(byId.id)) return byId.id;

  const catalog = findCatalogByProgramName(key);
  if (catalog) {
    const byName = programs.find(
      (p) => p.name.trim().toLowerCase() === catalog.title.trim().toLowerCase(),
    );
    if (byName && isNumericId(byName.id)) return byName.id;
  }

  return key;
}

export function resolvePilatesWorkoutIdForComplete(
  sessionId: string,
  programs: PilatesProgram[],
  explicitPilatesWorkoutId?: number,
): number | null {
  if (
    explicitPilatesWorkoutId != null &&
    Number.isFinite(explicitPilatesWorkoutId) &&
    workoutExistsInPrograms(explicitPilatesWorkoutId, programs)
  ) {
    return explicitPilatesWorkoutId;
  }

  const key = sessionId.trim();

  const asNum = /^\d+$/.test(key) ? parseInt(key, 10) : null;
  if (asNum != null) {
    for (const p of programs) {
      if (p.workouts?.some((w) => w.id === asNum)) return asNum;
    }
  }

  const prog =
    programs.find((p) => p.id === key) ??
    (() => {
      const catalog = findCatalogByProgramName(key);
      if (!catalog) return undefined;
      return programs.find(
        (p) =>
          p.name.trim().toLowerCase() === catalog.title.trim().toLowerCase(),
      );
    })();

  if (prog?.workouts?.length) {
    const sorted = [...prog.workouts].sort(
      (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
    );
    const next = sorted.find((w) => !w.isCompleted) ?? sorted[0];
    return next?.id ?? null;
  }

  if (asNum != null) return asNum;
  const m = /^w-(\d+)$/i.exec(key);
  if (m) return parseInt(m[1]!, 10);
  return null;
}
