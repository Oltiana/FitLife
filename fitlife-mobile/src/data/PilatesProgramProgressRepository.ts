import AsyncStorage from '@react-native-async-storage/async-storage';
import { canToggleSlot, programSlotKey } from '../domain/PilatesProgramSchedule';

const KEY = '@fitlife/program_day_slots_v1';

type Row = {
  userId: string;
  programId: string;
  slots: string[];
};

function storageKey(userId: string, programId: string): string {
  return `${userId}::${programId}`;
}

function parseStore(raw: string | null): Record<string, string[]> {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw) as unknown;
    if (typeof data !== 'object' || data === null) return {};
    const out: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(data)) {
      if (Array.isArray(v)) {
        out[k] = v.filter((x): x is string => typeof x === 'string');
      }
    }
    return out;
  } catch {
    return {};
  }
}

async function readAll(): Promise<Record<string, string[]>> {
  const raw = await AsyncStorage.getItem(KEY);
  return parseStore(raw);
}

async function writeAll(data: Record<string, string[]>): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export async function loadProgramMarkedSlots(
  userId: string,
  programId: string,
): Promise<string[]> {
  const all = await readAll();
  return all[storageKey(userId, programId)] ?? [];
}

export async function saveProgramMarkedSlots(
  userId: string,
  programId: string,
  slots: string[],
): Promise<void> {
  const all = await readAll();
  all[storageKey(userId, programId)] = [...new Set(slots)].sort();
  await writeAll(all);
}

export async function toggleProgramDaySlot(
  userId: string,
  programId: string,
  weekIndex: number,
  dayIndex: number,
  totalWeeks: number,
): Promise<string[]> {
  const key = programSlotKey(weekIndex, dayIndex);
  const prev = await loadProgramMarkedSlots(userId, programId);
  const set = new Set(prev);
  if (set.has(key)) {
    set.delete(key);
  } else {
    if (!canToggleSlot(weekIndex, dayIndex, set, totalWeeks)) {
      return prev;
    }
    set.add(key);
  }
  const next = [...set].sort();
  await saveProgramMarkedSlots(userId, programId, next);
  return next;
}
