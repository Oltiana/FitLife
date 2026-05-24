import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WeightEntry } from '../../domain/PilatesWeightStats';

const KEY = '@fitlife/weight_entries_v1';

function isEntry(x: unknown): x is WeightEntry {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.date === 'string' &&
    typeof o.kg === 'number' &&
    Number.isFinite(o.kg)
  );
}

export async function loadWeightEntries(): Promise<WeightEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(isEntry);
  } catch {
    return [];
  }
}

export async function saveWeightEntries(entries: WeightEntry[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(entries));
}

export async function appendWeightEntry(kg: number, dateIso?: string): Promise<WeightEntry[]> {
  const id = `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const date = dateIso ?? new Date().toISOString();
  const rounded = Math.round(kg * 10) / 10;
  const cur = await loadWeightEntries();
  const entry: WeightEntry = { id, date, kg: rounded };
  const next = [...cur, entry];
  await saveWeightEntries(next);
  return next;
}

export async function clearWeightEntries(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
