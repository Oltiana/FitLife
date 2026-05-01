import type { PilatesLevel } from './PilatesDomainTypes';
import type { WorkoutCompletion } from './PilatesDomainTypes';
import { caloriesForCompletion } from './PilatesCaloriesEstimate';
import { DEFAULT_LOCAL_USER_ID } from '../data/PilatesUserProgramRepository';

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Çelës kalendari lokal `YYYY-MM-DD` (për kalendar / përputhje ditësh). */
export function localCalendarDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKeyToStart(key: string): Date {
  const [y, mo, da] = key.split('-').map((x) => Number(x));
  return startOfDay(new Date(y, mo - 1, da));
}

/** Minuta + kcal (vlerësim) vetëm për ditën e sotme (timezone lokale). */
export function todayActivityTotals(
  entries: WorkoutCompletion[],
  now: Date,
): { minutes: number; calories: number } {
  const dayStart = startOfDay(now);
  const dayEnd = dayStart.getTime() + DAY_MS;
  let minutes = 0;
  let calories = 0;
  for (const e of entries) {
    const t = new Date(e.completedAt).getTime();
    if (t >= dayStart.getTime() && t < dayEnd) {
      minutes += e.durationMinutes;
      calories += caloriesForCompletion(e);
    }
  }
  return { minutes, calories };
}

/** Seri 30 ditët e fundit (më e vjetra → sot); etiketa të holla për grafik. */
export function minutesLast30DaysByDay(
  entries: WorkoutCompletion[],
  now: Date,
): { value: number; label: string }[] {
  const result: { value: number; label: string }[] = [];
  const today = startOfDay(now);
  for (let i = 29; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    let sum = 0;
    for (const e of entries) {
      const t = new Date(e.completedAt);
      if (t >= day && t < next) sum += e.durationMinutes;
    }
    const showLabel = i % 7 === 0 || i === 0;
    const label = showLabel
      ? `${day.getMonth() + 1}/${day.getDate()}`
      : '';
    result.push({ value: sum, label });
  }
  return result;
}

export function caloriesLast30DaysByDay(
  entries: WorkoutCompletion[],
  now: Date,
): { value: number; label: string }[] {
  const result: { value: number; label: string }[] = [];
  const today = startOfDay(now);
  for (let i = 29; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    let sum = 0;
    for (const e of entries) {
      const t = new Date(e.completedAt);
      if (t >= day && t < next) sum += caloriesForCompletion(e);
    }
    const showLabel = i % 7 === 0 || i === 0;
    const label = showLabel
      ? `${day.getMonth() + 1}/${day.getDate()}`
      : '';
    result.push({ value: sum, label });
  }
  return result;
}

/** Minutes summed per calendar day for the last 7 days (oldest → newest). */
export function minutesLast7DaysByDay(
  entries: WorkoutCompletion[],
  now: Date,
): { value: number; label: string }[] {
  const result: { value: number; label: string }[] = [];
  const today = startOfDay(now);

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);

    let sum = 0;
    for (const e of entries) {
      const t = new Date(e.completedAt);
      if (t >= day && t < next) {
        sum += e.durationMinutes;
      }
    }

    const label = day.toLocaleDateString('en', { weekday: 'short' });
    result.push({ value: sum, label });
  }

  return result;
}

/** Total minutes in four consecutive 7-day windows ending at the current day (oldest → newest). */
export function minutesPerWeekLast4Windows(
  entries: WorkoutCompletion[],
  now: Date,
): { value: number; label: string }[] {
  const dayMs = 24 * 60 * 60 * 1000;
  const endToday = startOfDay(now).getTime() + dayMs;
  const result: { value: number; label: string }[] = [];

  for (let w = 3; w >= 0; w--) {
    const windowEnd = endToday - w * 7 * dayMs;
    const windowStart = windowEnd - 7 * dayMs;
    let sum = 0;
    for (const e of entries) {
      const t = new Date(e.completedAt).getTime();
      if (t >= windowStart && t < windowEnd) {
        sum += e.durationMinutes;
      }
    }
    result.push({ value: sum, label: `W${4 - w}` });
  }

  return result;
}

export function totalCompletedSessions(entries: WorkoutCompletion[]): number {
  return entries.length;
}

export function totalMinutes(entries: WorkoutCompletion[]): number {
  return entries.reduce((acc, e) => acc + e.durationMinutes, 0);
}

export function totalCaloriesBurned(entries: WorkoutCompletion[]): number {
  return entries.reduce((acc, e) => acc + caloriesForCompletion(e), 0);
}

/** kcal të vlerësuara për ditë (7 ditët e fundit), njësoj si minutat. */
export function caloriesLast7DaysByDay(
  entries: WorkoutCompletion[],
  now: Date,
): { value: number; label: string }[] {
  const result: { value: number; label: string }[] = [];
  const today = startOfDay(now);

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);

    let sum = 0;
    for (const e of entries) {
      const t = new Date(e.completedAt);
      if (t >= day && t < next) {
        sum += caloriesForCompletion(e);
      }
    }

    const label = day.toLocaleDateString('en', { weekday: 'short' });
    result.push({ value: sum, label });
  }

  return result;
}

export function caloriesPerWeekLast4Windows(
  entries: WorkoutCompletion[],
  now: Date,
): { value: number; label: string }[] {
  const dayMs = 24 * 60 * 60 * 1000;
  const endToday = startOfDay(now).getTime() + dayMs;
  const result: { value: number; label: string }[] = [];

  for (let w = 3; w >= 0; w--) {
    const windowEnd = endToday - w * 7 * dayMs;
    const windowStart = windowEnd - 7 * dayMs;
    let sum = 0;
    for (const e of entries) {
      const t = new Date(e.completedAt).getTime();
      if (t >= windowStart && t < windowEnd) {
        sum += caloriesForCompletion(e);
      }
    }
    result.push({ value: sum, label: `W${4 - w}` });
  }

  return result;
}

export function filterCompletionsForUser(
  entries: WorkoutCompletion[],
  userId: string,
): WorkoutCompletion[] {
  return entries.filter(
    (e) =>
      e.userId === userId ||
      (e.userId == null && userId === DEFAULT_LOCAL_USER_ID),
  );
}

export type ProgressPeriod = '7d' | '4w' | '30d' | 'all';

export function filterCompletionsByPeriod(
  entries: WorkoutCompletion[],
  period: ProgressPeriod,
  now: Date,
): WorkoutCompletion[] {
  if (period === 'all') return [...entries];
  const end = startOfDay(now).getTime() + DAY_MS;
  const days =
    period === '7d' ? 7 : period === '4w' ? 28 : period === '30d' ? 30 : 7;
  const start = end - days * DAY_MS;
  return entries.filter((e) => {
    const t = new Date(e.completedAt).getTime();
    return t >= start && t < end;
  });
}

/** Rekord: sekuenca më e gjatë ditësh me të paktën një seancë (të gjithë historia). */
export function longestStreakEver(
  entries: WorkoutCompletion[],
  userId: string,
): number {
  const userEntries = filterCompletionsForUser(entries, userId);
  const days = new Set<string>();
  for (const e of userEntries) {
    days.add(localCalendarDayKey(startOfDay(new Date(e.completedAt))));
  }
  if (days.size === 0) return 0;
  const sorted = [...days].sort();
  if (sorted.length === 1) return 1;
  let best = 1;
  let cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = dayKeyToStart(sorted[i - 1]!).getTime();
    const curr = dayKeyToStart(sorted[i]!).getTime();
    const diff = (curr - prev) / DAY_MS;
    if (diff === 1) {
      cur++;
      if (cur > best) best = cur;
    } else {
      cur = 1;
    }
  }
  return best;
}

/**
 * Ditë radhazi me të paktën një seancë (lokal timezone).
 * Nëse sot nuk ka aktivitet, numërimi mund të vazhdojë nga dje.
 */
export function calculateStreak(
  entries: WorkoutCompletion[],
  userId: string,
  now: Date = new Date(),
): number {
  const userEntries = filterCompletionsForUser(entries, userId);
  const days = new Set<string>();
  for (const e of userEntries) {
    days.add(localCalendarDayKey(startOfDay(new Date(e.completedAt))));
  }
  let streak = 0;
  let cursor = startOfDay(now);
  const todayKey = localCalendarDayKey(cursor);
  if (!days.has(todayKey)) {
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  while (true) {
    const key = localCalendarDayKey(cursor);
    if (!days.has(key)) break;
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}

/** Filtrim i programeve Pilates sipas nivelit (për `getPilatesPrograms`). */
export function filterWorkoutsByLevel<T extends { level: PilatesLevel }>(
  items: T[],
  level?: PilatesLevel,
): T[] {
  if (level == null) return items;
  return items.filter((w) => w.level === level);
}

