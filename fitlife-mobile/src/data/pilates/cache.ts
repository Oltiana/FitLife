import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  normalizePilatesProgram,
  type PilatesProgram,
} from '../../domain/PilatesProgramTypes';

export const KEY_PILATES_PROGRAMS = '@fitlife/pilates_programs';
export const KEY_USER_PROGRAMS = '@fitlife/user_programs';

export function sortProgramsByDisplayOrder(programs: PilatesProgram[]): PilatesProgram[] {
  return [...programs].sort((a, b) => {
    const ao = a.displayOrder ?? 9999;
    const bo = b.displayOrder ?? 9999;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name);
  });
}

export async function readCachedPilatesPrograms(): Promise<PilatesProgram[]> {
  const raw = await AsyncStorage.getItem(KEY_PILATES_PROGRAMS);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return sortProgramsByDisplayOrder(
      data
        .map(normalizePilatesProgram)
        .filter((p): p is PilatesProgram => p != null),
    );
  } catch {
    return [];
  }
}
