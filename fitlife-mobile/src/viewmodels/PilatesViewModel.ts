import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  loadPrograms,
  reloadPilatesProgramsFromApi,
} from '../data/PilatesUserProgramRepository';
import { hydratePilatesModelFromPrograms, PilatesModel } from '../models/PilatesModel';
import { hasAuthToken } from '../api/pilatesApiSession';
import type { PilatesWorkout } from '../domain/PilatesDomainTypes';

const LIST_LOAD_MS = 420;

async function refreshPilatesModelFromServer(): Promise<void> {
  try {
    if (await hasAuthToken()) {
      const programs = await reloadPilatesProgramsFromApi();
      hydratePilatesModelFromPrograms(programs);
      return;
    }
    hydratePilatesModelFromPrograms(await loadPrograms());
  } catch (e) {
    console.warn('[FitLife] refreshPilatesModelFromServer', e);
    try {
      hydratePilatesModelFromPrograms(await loadPrograms());
    } catch {
      
    }
  }
}

export function usePilatesListViewModel(): {
  workouts: PilatesWorkout[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [workouts, setWorkouts] = useState<PilatesWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    await refreshPilatesModelFromServer();
    setWorkouts(PilatesModel.listWorkouts());
  }, []);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        setLoading(true);
        try {
          await new Promise<void>((r) => setTimeout(r, LIST_LOAD_MS));
          await refreshPilatesModelFromServer();
          if (alive) {
            setWorkouts(PilatesModel.listWorkouts());
          }
        } catch (e) {
          console.warn('[FitLife] Pilates list load', e);
          if (alive) {
            setWorkouts(PilatesModel.listWorkouts());
          }
        } finally {
          if (alive) setLoading(false);
        }
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  return { workouts, loading, refresh };
}

export function usePilatesWorkoutViewModel(
  workoutId: string | undefined,
): { workout: PilatesWorkout | undefined; reload: () => void } {
  const [tick, setTick] = useState(0);

  useFocusEffect(
    useCallback(() => {
      void refreshPilatesModelFromServer().then(() => setTick((t) => t + 1));
    }, [workoutId]),
  );

  const workout = useMemo(
    () =>
      workoutId != null ? PilatesModel.getWorkoutById(workoutId) : undefined,
    [workoutId, tick],
  );

  const reload = useCallback(() => {
    void refreshPilatesModelFromServer().then(() => setTick((t) => t + 1));
  }, []);

  return { workout, reload };
}
