import { useCallback, useEffect, useState } from 'react';
import {
  loadPrograms,
  loadUserPrograms,
  resolvePilatesBootstrapUser,
} from '../data/pilates';

/** True only when the user tapped "Add to my programs" (not after completing a workout). */
export function isWorkoutInMyPrograms(
  workout: { id: string; pilatesProgramId?: string },
  enrolledIds: Set<string>,
): boolean {
  if (enrolledIds.size === 0) return false;
  if (enrolledIds.has(workout.id.trim())) return true;
  const pid = workout.pilatesProgramId?.trim();
  return pid != null && pid.length > 0 && enrolledIds.has(pid);
}

export function useEnrolledProgramIds() {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    try {
      const boot = await resolvePilatesBootstrapUser();
      await loadPrograms();
      const links = await loadUserPrograms(boot.userId);
      setUserId(boot.userId);
      setDisplayName(boot.displayName?.trim() || null);
      setEnrolledIds(new Set(links.map((l) => l.pilatesProgramId)));
    } catch {
      setUserId(null);
      setDisplayName(null);
      setEnrolledIds(new Set());
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { userId, displayName, enrolledIds, refresh };
}
