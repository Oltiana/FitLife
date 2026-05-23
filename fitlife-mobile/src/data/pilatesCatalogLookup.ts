import { pilatesCatalog } from './pilatesCatalog';
import type { PilatesProgram } from '../domain/PilatesProgramTypes';
import type { PilatesWorkout } from '../domain/PilatesDomainTypes';


export function findCatalogByProgramName(name: string): PilatesWorkout | undefined {
  const key = name.trim().toLowerCase();
  return pilatesCatalog.find((c) => c.title.trim().toLowerCase() === key);
}

export function findCatalogByProgram(program: PilatesProgram): PilatesWorkout | undefined {
  return findCatalogByProgramName(program.name);
}
