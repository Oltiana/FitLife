import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearPilatesProgressLocalCache } from '../data/PilatesProgressRepository';
import { hydratePilatesModelFromPrograms } from '../models/PilatesModel';
import {
  clearPilatesApiCache,
  reloadPilatesProgramsFromApi,
} from '../data/PilatesUserProgramRepository';
import { programsAreFromApi } from './pilatesApiSync';
import type { PilatesProgram } from '../domain/PilatesProgramTypes';

const KEY_LAST_SYNC_ERROR = '@fitlife/pilates_last_sync_error';

export async function setLastPilatesSyncError(message: string | null): Promise<void> {
  if (message == null || message.trim() === '') {
    await AsyncStorage.removeItem(KEY_LAST_SYNC_ERROR);
    return;
  }
  await AsyncStorage.setItem(KEY_LAST_SYNC_ERROR, message.trim());
}

export async function getLastPilatesSyncError(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_LAST_SYNC_ERROR);
}


export async function syncPilatesAfterAuth(): Promise<PilatesProgram[]> {
  await clearPilatesApiCache();
  await clearPilatesProgressLocalCache();
  const programs = await reloadPilatesProgramsFromApi();
  if (!programsAreFromApi(programs)) {
    const msg =
      programs.length === 0
        ? 'API nuk ka programe. Shto rreshta në PilatesPrograms / PilatesWorkouts (Swagger POST).'
        : 'Programet nuk vijnë nga databaza (ID jo numerik).';
    await setLastPilatesSyncError(msg);
    throw new Error(msg);
  }
  hydratePilatesModelFromPrograms(programs);
  await setLastPilatesSyncError(null);
  return programs;
}
