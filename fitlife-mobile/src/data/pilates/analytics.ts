import { loadCompletions } from './progress';
import {
  calculateStreak as computeActivityStreak,
  caloriesLast7DaysByDay,
  caloriesPerWeekLast4Windows,
  filterCompletionsByPeriod,
  filterCompletionsForUser,
  longestStreakEver,
  minutesLast7DaysByDay,
  minutesPerWeekLast4Windows,
  todayActivityTotals,
  totalCaloriesBurned,
  totalCompletedSessions,
  totalMinutes,
  type ProgressPeriod,
} from '../../domain/PilatesProgressStats';
import type { WorkoutCompletion } from '../../domain/PilatesDomainTypes';

export type { ProgressPeriod };

export type ProgressDataPayload = {
  entries: WorkoutCompletion[];
  lineData: { value: number; label: string }[];
  barData: { value: number; label: string }[];
  caloriesLineData: { value: number; label: string }[];
  caloriesBarData: { value: number; label: string }[];
  todayMinutes: number;
  todayCalories: number;
  bestStreakEver: number;
  sessionCount: number;
  totalMinutes: number;
  totalCaloriesEstimate: number;
};

export type AnalyticsPayload = {
  userId: string;
  streak: number;
  progress: ProgressDataPayload;
};

export async function getProgressData(
  userId: string,
  period: ProgressPeriod,
  now: Date = new Date(),
): Promise<ProgressDataPayload> {
  const all = await loadCompletions();
  const userEntries = filterCompletionsForUser(all, userId);
  const inRange = filterCompletionsByPeriod(userEntries, period, now).sort(
    (a, b) =>
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
  );
  const today = todayActivityTotals(userEntries, now);

  return {
    entries: inRange,
    lineData: minutesLast7DaysByDay(userEntries, now),
    barData: minutesPerWeekLast4Windows(userEntries, now),
    caloriesLineData: caloriesLast7DaysByDay(userEntries, now),
    caloriesBarData: caloriesPerWeekLast4Windows(userEntries, now),
    todayMinutes: today.minutes,
    todayCalories: today.calories,
    bestStreakEver: longestStreakEver(all, userId),
    sessionCount: totalCompletedSessions(inRange),
    totalMinutes: totalMinutes(inRange),
    totalCaloriesEstimate: totalCaloriesBurned(inRange),
  };
}

export async function generateAnalytics(
  userId: string,
  now: Date = new Date(),
): Promise<AnalyticsPayload> {
  const all = await loadCompletions();
  const streak = computeActivityStreak(all, userId, now);
  const progress = await getProgressData(userId, 'all', now);
  return { userId, streak, progress };
}
