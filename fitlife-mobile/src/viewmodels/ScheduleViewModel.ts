import { useEffect, useState } from "react";
import { api } from "../services/api";
import { tokenStorage } from "../storage/tokenStorage";

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

      const filtered = all.filter(
        (s: any) =>
          s.sessionDate?.slice(0, 10) === selectedDate
      );

      setSessions(filtered);
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

      setSessions((prev) =>
        prev.map((s) =>
          s.id === id && s.capacity > 0
            ? {
                ...s,
                capacity: s.capacity - 1,
              }
            : s
        )
      );

      setAllSessions((prev) =>
        prev.map((s) =>
          s.id === id && s.capacity > 0
            ? {
                ...s,
                capacity: s.capacity - 1,
              }
            : s
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  const instructors = [
    ...new Set(
      sessions.map((s) => s.instructorName)
    ),
  ];

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