import { useEffect, useState } from "react";
import { api } from "../services/api";

const CURRENT_USER = "TEMP_USER";

export function useScheduleViewModel(selectedDate: string) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSessions = async () => {
    try {
      setLoading(true);

      const data = await api.getSessions();

      const filtered = (data.sessions || []).filter(
        (s: any) =>
          s.sessionDate?.slice(0, 10) === selectedDate
      );

      setSessions(filtered);
    } catch (err) {
      console.log(err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const bookSession = async (id: number) => {
    await api.bookSession(id, CURRENT_USER);

    setSessions((prev) =>
      prev.map((s) =>
        s.id === id && s.capacity > 0
          ? { ...s, capacity: s.capacity - 1 }
          : s
      )
    );
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
    loading,
    bookSession,
    instructors,
  };
}