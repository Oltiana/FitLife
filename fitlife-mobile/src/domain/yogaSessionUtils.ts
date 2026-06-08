export type YogaSessionLike = {
  id: number;
  sessionDate?: string;
  capacity: number;
  instructorName: string;
};

export type YogaCalendarMark = {
  marked: boolean;
  dotColor: string;
  selected?: boolean;
};

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function sessionDateKey(sessionDate?: string): string | null {
  if (!sessionDate?.trim()) return null;
  const key = sessionDate.trim().slice(0, 10);
  if (!DATE_KEY_RE.test(key)) return null;
  return key;
}

export function isValidSessionDateKey(date: string): boolean {
  if (!DATE_KEY_RE.test(date)) return false;
  const [y, mo, da] = date.split('-').map(Number);
  const parsed = new Date(y, mo - 1, da);
  return (
    parsed.getFullYear() === y &&
    parsed.getMonth() === mo - 1 &&
    parsed.getDate() === da
  );
}

export function filterSessionsByDate<T extends { sessionDate?: string }>(
  sessions: T[],
  selectedDate: string,
): T[] {
  if (!isValidSessionDateKey(selectedDate)) return [];
  return sessions.filter((s) => sessionDateKey(s.sessionDate) === selectedDate);
}

export function decrementSessionCapacity<T extends { id: number; capacity: number }>(
  sessions: T[],
  sessionId: number,
): T[] {
  return sessions.map((s) =>
    s.id === sessionId && s.capacity > 0
      ? { ...s, capacity: s.capacity - 1 }
      : s,
  );
}

export function uniqueInstructorNames<T extends { instructorName: string }>(
  sessions: T[],
): string[] {
  return [...new Set(sessions.map((s) => s.instructorName))];
}

export function isSessionBookable(session: { capacity: number }): boolean {
  return session.capacity > 0;
}

export function bookingBlockedReason(
  session: YogaSessionLike | undefined,
): string | null {
  if (session == null) return 'Session not found';
  if (!isSessionBookable(session)) return 'Session is full';
  if (!sessionDateKey(session.sessionDate)) return 'Invalid session date';
  return null;
}

export function filterSessionsByInstructor<T extends { instructorName: string }>(
  sessions: T[],
  instructorName: string,
): T[] {
  const name = instructorName.trim();
  if (!name) return sessions;
  return sessions.filter((s) => s.instructorName === name);
}

export function buildCalendarMarkedDates(
  sessions: YogaSessionLike[],
  selectedDate: string,
): Record<string, YogaCalendarMark> {
  const dates: Record<string, YogaCalendarMark> = {};

  for (const s of sessions) {
    const date = sessionDateKey(s.sessionDate);
    if (!date || !isSessionBookable(s)) continue;
    dates[date] = { marked: true, dotColor: '#22C55E' };
  }

  if (isValidSessionDateKey(selectedDate)) {
    dates[selectedDate] = {
      ...dates[selectedDate],
      selected: true,
      marked: true,
      dotColor: '#22C55E',
    };
  }

  return dates;
}

export function formatYogaTimerSeconds(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
