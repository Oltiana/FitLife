import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { generateAnalytics } from '../api/pilatesModuleApi';
import {
  loadUserPreferences,
  saveUserPreferences,
} from '../data/PilatesUserPreferencesRepository';
import { resolvePilatesApiUserId } from '../data/PilatesUserProgramRepository';
import type { WorkoutCompletion } from '../domain/PilatesDomainTypes';

/**
 * ViewModel: përdor `generateAnalytics(userId)` nga API-ja e modulit.
 */
export function usePilatesAnalyticsViewModel() {
  const [loading, setLoading] = useState(true);
  const [completions, setCompletions] = useState<WorkoutCompletion[]>([]);
  const [lineData, setLineData] = useState<{ value: number; label: string }[]>(
    [],
  );
  const [barData, setBarData] = useState<{ value: number; label: string }[]>(
    [],
  );
  const [sessionCount, setSessionCount] = useState(0);
  const [minutesTotal, setMinutesTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [caloriesLineData, setCaloriesLineData] = useState<
    { value: number; label: string }[]
  >([]);
  const [caloriesBarData, setCaloriesBarData] = useState<
    { value: number; label: string }[]
  >([]);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [bestStreakEver, setBestStreakEver] = useState(0);
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState<number | null>(
    null,
  );
  const [dailyMinutesTarget, setDailyMinutesTarget] = useState<number | null>(
    null,
  );

  const refresh = useCallback(async () => {
    const progressUserId = await resolvePilatesApiUserId();
    const prefs = await loadUserPreferences();
    setDailyCalorieTarget(prefs.dailyCalorieTarget);
    setDailyMinutesTarget(prefs.dailyMinutesTarget);

    const a = await generateAnalytics(progressUserId);
    setCompletions(a.progress.entries);
    setLineData(a.progress.lineData);
    setBarData(a.progress.barData);
    setSessionCount(a.progress.sessionCount);
    setMinutesTotal(a.progress.totalMinutes);
    setStreak(a.streak);
    setTotalCalories(a.progress.totalCaloriesEstimate);
    setCaloriesLineData(a.progress.caloriesLineData);
    setCaloriesBarData(a.progress.caloriesBarData);
    setTodayMinutes(a.progress.todayMinutes);
    setTodayCalories(a.progress.todayCalories);
    setBestStreakEver(a.progress.bestStreakEver);
  }, []);

  const updateDailyTargets = useCallback(
    async (calories: number | null, minutes: number | null) => {
      await saveUserPreferences({
        dailyCalorieTarget: calories,
        dailyMinutesTarget: minutes,
      });
      setDailyCalorieTarget(calories);
      setDailyMinutesTarget(minutes);
    },
    [],
  );

  useEffect(() => {
    let alive = true;
    refresh().finally(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const lineChartMax = useMemo(
    () => Math.max(5, ...lineData.map((d) => d.value), 1),
    [lineData],
  );
  const barChartMax = useMemo(
    () => Math.max(5, ...barData.map((d) => d.value), 1),
    [barData],
  );

  const caloriesLineMax = useMemo(
    () => Math.max(50, ...caloriesLineData.map((d) => d.value), 1),
    [caloriesLineData],
  );
  const caloriesBarMax = useMemo(
    () => Math.max(100, ...caloriesBarData.map((d) => d.value), 1),
    [caloriesBarData],
  );

  const thisWeekMinutes = useMemo(
    () => (barData.length > 0 ? barData[barData.length - 1]!.value : 0),
    [barData],
  );
  const lastWeekMinutes = useMemo(
    () =>
      barData.length > 1 ? barData[barData.length - 2]!.value : 0,
    [barData],
  );
  const thisWeekCalories = useMemo(
    () =>
      caloriesBarData.length > 0
        ? caloriesBarData[caloriesBarData.length - 1]!.value
        : 0,
    [caloriesBarData],
  );
  const lastWeekCalories = useMemo(
    () =>
      caloriesBarData.length > 1
        ? caloriesBarData[caloriesBarData.length - 2]!.value
        : 0,
    [caloriesBarData],
  );

  return {
    loading,
    refresh,
    completions,
    lineData,
    barData,
    sessionCount,
    totalMinutes: minutesTotal,
    streak,
    totalCaloriesEstimate: totalCalories,
    caloriesLineData,
    caloriesBarData,
    caloriesLineMax,
    caloriesBarMax,
    todayMinutes,
    todayCalories,
    bestStreakEver,
    dailyCalorieTarget,
    dailyMinutesTarget,
    updateDailyTargets,
    isEmpty: sessionCount === 0,
    lineChartMax,
    barChartMax,
    thisWeekMinutes,
    lastWeekMinutes,
    thisWeekCalories,
    lastWeekCalories,
  };
}
