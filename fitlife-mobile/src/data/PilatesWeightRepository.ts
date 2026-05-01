import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  deleteWeightEntryRemote,
  fetchWeightEntriesRemote,
  postWeightEntryRemote,
} from '../api/PilatesBackendApi';
import { getApiBaseUrl } from '../config/PilatesApiConfig';
import type { WeightEntry } from '../domain/PilatesWeightStats';
import { ensureDefaultUser } from './PilatesUserProgramRepository';

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
  const base = getApiBaseUrl();
  if (base) {
    try {
      const user = await ensureDefaultUser();
      const remote = await fetchWeightEntriesRemote(base, user.id);
      await AsyncStorage.setItem(KEY, JSON.stringify(remote));
      return remote.filter(isEntry);
    } catch (e) {
      console.warn('[FitLife] weight entries: remote failed, using cache', e);
    }
  }

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
  const base = getApiBaseUrl();
  const id = `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const date = dateIso ?? new Date().toISOString();
  const rounded = Math.round(kg * 10) / 10;

  if (base) {
    try {
      const user = await ensureDefaultUser();
      await postWeightEntryRemote(base, user.id, { id, date, kg: rounded });
      return await loadWeightEntries();
    } catch (e) {
      console.warn('[FitLife] append weight: remote failed, using cache', e);
    }
  }

  const cur = await loadWeightEntries();
  const entry: WeightEntry = {
    id,
    date,
    kg: rounded,
  };
  const next = [...cur, entry];
  await saveWeightEntries(next);
  return next;
}

export async function clearWeightEntries(): Promise<void> {
  const base = getApiBaseUrl();
  if (base) {
    try {
      const user = await ensureDefaultUser();
      const entries = await fetchWeightEntriesRemote(base, user.id);
      await Promise.all(entries.map((e) => deleteWeightEntryRemote(base, user.id, e.id)));
    } catch (e) {
      console.warn('[FitLife] clear weight: remote delete failed, clearing local cache', e);
    }
  }
  await AsyncStorage.removeItem(KEY);
}
