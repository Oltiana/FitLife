import { useCallback, useEffect, useState } from 'react';
import {
  loadPrograms,
  loadUserPrograms,
  resolvePilatesBootstrapUser,
} from '../data/PilatesUserProgramRepository';

/** Lidh `User` + `UserProgram` me UI (set i programId të regjistruara). */
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
      setEnrolledIds(new Set(links.map((l) => l.programId)));
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
