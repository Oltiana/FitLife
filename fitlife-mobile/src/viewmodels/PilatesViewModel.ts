import { useFocusEffect } from '@react-navigation/native';

import { useCallback, useMemo, useState } from 'react';

import { loadPrograms, reloadPilatesProgramsFromApi } from '../data/pilates';

import { hydratePilatesModelFromPrograms, PilatesModel } from '../models/PilatesModel';

import { hasAuthToken } from '../api/pilatesApi';

import type { PilatesWorkout } from '../domain/PilatesDomainTypes';



const LIST_LOAD_MS = 420;



async function refreshPilatesModelFromServer(): Promise<string | null> {

  try {

    if (await hasAuthToken()) {

      const programs = await reloadPilatesProgramsFromApi();

      hydratePilatesModelFromPrograms(programs);

      if (programs.length === 0) {

        return 'Built-in Pilates workouts shown. Add programs in API to save progress to SQL.';

      }

      return null;

    }

    hydratePilatesModelFromPrograms(await loadPrograms());

    return null;

  } catch (e) {

    console.warn('[FitLife] refreshPilatesModelFromServer', e);

    const message = e instanceof Error ? e.message : String(e);

    try {

      hydratePilatesModelFromPrograms(await loadPrograms());

    } catch {

      hydratePilatesModelFromPrograms([]);

    }

    return `${message || 'Could not load programs from API.'} Showing built-in workouts.`;

  }

}



export function usePilatesListViewModel(): {

  workouts: PilatesWorkout[];

  loading: boolean;

  loadError: string | null;

  refresh: () => Promise<void>;

} {

  const [workouts, setWorkouts] = useState<PilatesWorkout[]>([]);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState<string | null>(null);



  const refresh = useCallback(async () => {

    const err = await refreshPilatesModelFromServer();

    setLoadError(err);

    setWorkouts(PilatesModel.listWorkouts());

  }, []);



  useFocusEffect(

    useCallback(() => {

      let alive = true;

      void (async () => {

        setLoading(true);

        try {

          await new Promise<void>((r) => setTimeout(r, LIST_LOAD_MS));

          const err = await refreshPilatesModelFromServer();

          if (alive) {

            setLoadError(err);

            setWorkouts(PilatesModel.listWorkouts());

          }

        } catch (e) {

          console.warn('[FitLife] Pilates list load', e);

          if (alive) {

            setLoadError(e instanceof Error ? e.message : 'Load failed');

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



  return { workouts, loading, loadError, refresh };

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

