import { useEffect, useMemo, useState } from 'react';
import { PilatesModel } from '../models/PilatesModel';
import type { PilatesWorkout } from '../domain/PilatesDomainTypes';

const LIST_LOAD_MS = 420;

/**
 * ViewModel: pamja e listës së seancave (read-only nga Model).
 * Ngarkimi asinkron + kohë minimale për skeleton (SRS).
 */
export function usePilatesListViewModel(): {
  workouts: PilatesWorkout[];
  loading: boolean;
} {
  const [workouts, setWorkouts] = useState<PilatesWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      await new Promise<void>((r) => setTimeout(r, LIST_LOAD_MS));
      const list = PilatesModel.listWorkouts();
      if (alive) {
        setWorkouts(list);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { workouts, loading };
}

/**
 * ViewModel: një seancë sipas id (detaj + sesion aktiv).
 */
export function usePilatesWorkoutViewModel(
  workoutId: string | undefined,
): { workout: PilatesWorkout | undefined } {
  const workout = useMemo(
    () => (workoutId != null ? PilatesModel.getWorkoutById(workoutId) : undefined),
    [workoutId],
  );
  return { workout };
}
