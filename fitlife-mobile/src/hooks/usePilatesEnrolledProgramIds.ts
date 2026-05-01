import { useCallback, useEffect, useState } from 'react';
import {
  ensureDefaultUser,
  loadPrograms,
  loadUserPrograms,
} from '../data/PilatesUserProgramRepository';

/** Lidh `User` + `UserProgram` me UI (set i programId të regjistruara). */
export function useEnrolledProgramIds() {
  const [userId, setUserId] = useState<string | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    const user = await ensureDefaultUser();
    await loadPrograms();
    const links = await loadUserPrograms(user.id);
    setUserId(user.id);
    setEnrolledIds(new Set(links.map((l) => l.programId)));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { userId, enrolledIds, refresh };
}
