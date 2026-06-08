import { useEffect, useState } from "react";
import { api } from "../../../services/api";
import {
  decrementSessionCapacity,
  filterSessionsByDate,
  uniqueInstructorNames,
} from "../../../domain/yogaSessionUtils";
import { tokenStorage } from "../../../storage/tokenStorage";

export function useScheduleViewModel(selectedDate: string) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSessions = async () => {
    try {
      setLoading(true);

      const data = await api.getSessions();

      const all = data.sessions || [];

      setAllSessions(all);

      setSessions(filterSessionsByDate(all, selectedDate));
    } catch (err) {
      console.log(err);
      setSessions([]);
      setAllSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const bookSession = async (id: number) => {
    try {
      const currentUser =
        await tokenStorage.getUser();

      if (!currentUser) {
        throw new Error("User not found");
      }

      await api.bookSession(
        id,
        currentUser.fullName
      );

      setSessions((prev) => decrementSessionCapacity(prev, id));
      setAllSessions((prev) => decrementSessionCapacity(prev, id));
    } catch (err) {
      console.log(err);
    }
  };

  const instructors = uniqueInstructorNames(sessions);

  useEffect(() => {
    loadSessions();
  }, [selectedDate]);

  return {
    sessions,
    allSessions,
    loading,
    bookSession,
    instructors,
  };
}