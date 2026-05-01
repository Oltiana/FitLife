/**
 * API funksionale e modulit Pilates + Analytics.
 */

import { loadCompletions } from '../data/PilatesProgressRepository';
import { loadPrograms } from '../data/PilatesUserProgramRepository';
import {
  calculateStreak as computeActivityStreak,
  caloriesLast7DaysByDay,
  caloriesPerWeekLast4Windows,
  filterCompletionsByPeriod,
  filterCompletionsForUser,
  filterWorkoutsByLevel,
  longestStreakEver,
  minutesLast7DaysByDay,
  minutesPerWeekLast4Windows,
  todayActivityTotals,
  totalCaloriesBurned,
  totalCompletedSessions,
  totalMinutes,
  type ProgressPeriod,
} from '../domain/PilatesProgressStats';
import type { PilatesProgram } from '../domain/PilatesProgramTypes';
import type { PilatesLevel, WorkoutCompletion } from '../domain/PilatesDomainTypes';
import { PilatesModel } from '../models/PilatesModel';
import { navigationRef } from '../navigation/PilatesNavigationRef';

export type { ProgressPeriod };

export type ProgressDataPayload = {
  entries: WorkoutCompletion[];
  lineData: { value: number; label: string }[];
  barData: { value: number; label: string }[];
  caloriesLineData: { value: number; label: string }[];
  caloriesBarData: { value: number; label: string }[];
  /** Sot (lokal): counter ditor. */
  todayMinutes: number;
  todayCalories: number;
  /** Rekord personal ditë radhazi. */
  bestStreakEver: number;
  sessionCount: number;
  totalMinutes: number;
  /** Vlerësim i përafërt kcal (MET) për periudhën e filtruar. */
  totalCaloriesEstimate: number;
};

export type AnalyticsPayload = {
  userId: string;
  streak: number;
  progress: ProgressDataPayload;
};

export async function getPilatesPrograms(
  level?: PilatesLevel,
): Promise<PilatesProgram[]> {
  const programs = await loadPrograms();
  if (level == null) return programs;
  return programs.filter((p) => p.level === level);
}

export function getPilatesWorkoutsFromCatalog(level?: PilatesLevel) {
  return filterWorkoutsByLevel(PilatesModel.listWorkouts(), level);
}

export function startPilatesSession(programId: string): void {
  if (!navigationRef.isReady()) {
    console.warn('[FitLife] Navigation not ready; startPilatesSession skipped.');
    return;
  }
  navigationRef.navigate('Pilates', {
    screen: 'ActiveWorkout',
    params: { workoutId: programId },
  });
}

export async function getProgressData(
  userId: string,
  period: ProgressPeriod,
  now: Date = new Date(),
): Promise<ProgressDataPayload> {
  const all = await loadCompletions();
  const userEntries = filterCompletionsForUser(all, userId);
  const inRange = filterCompletionsByPeriod(userEntries, period, now);
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

export async function calculateStreak(
  userId: string,
  now: Date = new Date(),
): Promise<number> {
  const all = await loadCompletions();
  return computeActivityStreak(all, userId, now);
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
