import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { pickMotivationalMessage } from '../../data/PilatesMotivationalMessages';
import { appendWeightEntry, loadWeightEntries } from '../../data/PilatesWeightRepository';
import { usePilatesAnalyticsViewModel } from '../../viewmodels/PilatesAnalyticsViewModel';
import type { AppColors } from '../../theme/PilatesColors';
import { useTheme } from '../../theme/PilatesThemeContext';
import { cardShadowThemed } from '../../theme/PilatesShadows';
import {
  lowestWeightKg,
  weightChartMax,
  weightDeltaFromFirst,
  weightLast30DaysSeries,
  type WeightEntry,
} from '../../domain/PilatesWeightStats';

function parseTargetField(
  s: string,
): { ok: true; value: number | null } | { ok: false } {
  const t = s.trim();
  if (t === '') return { ok: true, value: null };
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) return { ok: false };
  return { ok: true, value: Math.min(99999, Math.round(n)) };
}

export function PilatesProgressScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useTheme();
  const styles = useMemo(() => createProgressStyles(colors), [colors]);
  const {
    loading,
    lineData,
    barData,
    sessionCount,
    totalMinutes,
    streak,
    isEmpty,
    lineChartMax,
    barChartMax,
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
    refresh,
    thisWeekMinutes,
    lastWeekMinutes,
    thisWeekCalories,
    lastWeekCalories,
  } = usePilatesAnalyticsViewModel();

  const chartWidth = Math.min(Math.max(260, screenWidth - 96), 340);
  // Weight chart lives inside a padded card (16px left + 16px right).
  const weightChartWidth = Math.max(240, chartWidth - 24);

  const [calInput, setCalInput] = useState('');
  const [minInput, setMinInput] = useState('');
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [weightInput, setWeightInput] = useState('');

  const reloadWeights = useCallback(() => {
    void loadWeightEntries().then(setWeightEntries);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reloadWeights();
    }, [reloadWeights]),
  );

  const weightLineData = useMemo(
    () => weightLast30DaysSeries(weightEntries),
    [weightEntries],
  );
  const weightLineMax = useMemo(
    () => weightChartMax(weightLineData),
    [weightLineData],
  );
  const weightLowest = useMemo(
    () => lowestWeightKg(weightEntries),
    [weightEntries],
  );
  const weightDelta = useMemo(
    () => weightDeltaFromFirst(weightEntries),
    [weightEntries],
  );

  const weekMinutesHint = useMemo(() => {
    if (lastWeekMinutes <= 0) return null;
    const pct = Math.round(
      ((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100,
    );
    if (pct > 0) return `${pct}% more minutes than last week.`;
    if (pct < 0) return `${Math.abs(pct)}% fewer minutes than last week.`;
    return 'Same minutes as last week.';
  }, [lastWeekMinutes, thisWeekMinutes]);

  useEffect(() => {
    setCalInput(
      dailyCalorieTarget != null ? String(dailyCalorieTarget) : '',
    );
    setMinInput(
      dailyMinutesTarget != null ? String(dailyMinutesTarget) : '',
    );
  }, [dailyCalorieTarget, dailyMinutesTarget]);

  const motivation = useMemo(
    () => pickMotivationalMessage(streak, totalMinutes, sessionCount),
    [sessionCount, streak, totalMinutes],
  );

  const calGoalPct =
    dailyCalorieTarget != null && dailyCalorieTarget > 0
      ? Math.min(1, todayCalories / dailyCalorieTarget)
      : 0;
  const minGoalPct =
    dailyMinutesTarget != null && dailyMinutesTarget > 0
      ? Math.min(1, todayMinutes / dailyMinutesTarget)
      : 0;

  const onSaveTargets = () => {
    const c = parseTargetField(calInput);
    const m = parseTargetField(minInput);
    if (!c.ok || !m.ok) {
      Alert.alert('Invalid target', 'Use positive numbers or leave fields empty.');
      return;
    }
    void (async () => {
      await updateDailyTargets(c.value, m.value);
      await refresh();
    })();
  };

  const onClearTargets = () => {
    setCalInput('');
    setMinInput('');
    void (async () => {
      await updateDailyTargets(null, null);
      await refresh();
    })();
  };

  const onAddWeight = () => {
    const t = weightInput.trim().replace(',', '.');
    const n = Number(t);
    if (!Number.isFinite(n) || n < 25 || n > 400) {
      Alert.alert('Invalid weight', 'Enter a realistic weight in kg (e.g. 65.5).');
      return;
    }
    void (async () => {
      const next = await appendWeightEntry(n);
      setWeightEntries(next);
      setWeightInput('');
    })();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.muted}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Progress</Text>

        <View style={styles.weekCompareCard}>
          <Text style={styles.todayLabel}>This week vs last week</Text>
          <View style={styles.weekCompareRow}>
            <View style={styles.weekCompareCol}>
              <Text style={styles.weekCompareLabel}>Minutes</Text>
              <Text style={styles.weekCompareValue}>{thisWeekMinutes}</Text>
              <Text style={styles.weekCompareLabel}>Last: {lastWeekMinutes}</Text>
            </View>
            <View style={styles.weekCompareCol}>
              <Text style={styles.weekCompareLabel}>kcal est.</Text>
              <Text style={styles.weekCompareValue}>{thisWeekCalories}</Text>
              <Text style={styles.weekCompareLabel}>Last: {lastWeekCalories}</Text>
            </View>
          </View>
          {weekMinutesHint ? (
            <Text style={styles.weekCompareHint}>{weekMinutesHint}</Text>
          ) : null}
        </View>

        <View style={styles.todayCard}>
          <Text style={styles.todayLabel}>Today</Text>
          <View style={styles.todayRow}>
            <View style={styles.todayCol}>
              <Text style={styles.todayValue}>{todayCalories}</Text>
              <Text style={styles.todayUnit}>kcal est.</Text>
            </View>
            <View style={styles.todayDivider} />
            <View style={styles.todayCol}>
              <Text style={styles.todayValue}>{todayMinutes}</Text>
              <Text style={styles.todayUnit}>minutes</Text>
            </View>
          </View>
        </View>

        <View style={styles.streakVisual}>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={22} color="#E07A5F" />
            <View>
              <Text style={styles.streakNum}>{streak}</Text>
              <Text style={styles.streakCaption}>current streak</Text>
            </View>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="trophy" size={22} color={colors.primaryMuted} />
            <View>
              <Text style={styles.streakNum}>{bestStreakEver}</Text>
              <Text style={styles.streakCaption}>personal best</Text>
            </View>
          </View>
        </View>
        {streak > 0 && streak === bestStreakEver ? (
          <Text style={styles.streakHype}>
            You are on your best streak — amazing consistency.
          </Text>
        ) : null}

        <Text style={styles.sectionTitle}>Daily targets</Text>
        <View style={styles.targetCard}>
          <Text style={styles.targetHint}>
            Optional. Progress bars use today&apos;s totals only.
          </Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>kcal / day</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="e.g. 200"
              placeholderTextColor={colors.textSecondary}
              value={calInput}
              onChangeText={setCalInput}
            />
          </View>
          {dailyCalorieTarget != null && dailyCalorieTarget > 0 ? (
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  styles.barFillCal,
                  { width: `${Math.round(calGoalPct * 100)}%` },
                ]}
              />
            </View>
          ) : null}

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>minutes / day</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="e.g. 20"
              placeholderTextColor={colors.textSecondary}
              value={minInput}
              onChangeText={setMinInput}
            />
          </View>
          {dailyMinutesTarget != null && dailyMinutesTarget > 0 ? (
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  styles.barFillMin,
                  { width: `${Math.round(minGoalPct * 100)}%` },
                ]}
              />
            </View>
          ) : null}

          <View style={styles.targetActions}>
            <Pressable
              style={({ pressed }) => [
                styles.btnSecondary,
                pressed && styles.pressed,
              ]}
              onPress={onSaveTargets}
            >
              <Text style={styles.btnSecondaryText}>Save targets</Text>
            </Pressable>
            {(dailyCalorieTarget != null || dailyMinutesTarget != null) ? (
              <Pressable
                style={({ pressed }) => [
                  styles.btnGhost,
                  pressed && styles.pressed,
                ]}
                onPress={onClearTargets}
              >
                <Text style={styles.btnGhostText}>Clear</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{sessionCount}</Text>
            <Text style={styles.statLabel}>Sessions completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalMinutes}</Text>
            <Text style={styles.statLabel}>Total minutes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
        </View>

        <View style={styles.motivationCard}>
          <Text style={styles.motivationLabel}>Keep going</Text>
          <Text style={styles.motivationText}>{motivation}</Text>
        </View>

        <Text style={styles.sectionTitle}>Weight</Text>
        <View style={styles.targetCard}>
          <Text style={styles.targetHint}>
            Log weight to see a 30-day trend. Data stays on this device.
          </Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="e.g. 68.2"
              placeholderTextColor={colors.textSecondary}
              value={weightInput}
              onChangeText={setWeightInput}
            />
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.btnSecondary,
              pressed && styles.pressed,
            ]}
            onPress={onAddWeight}
          >
            <Text style={styles.btnSecondaryText}>Save entry</Text>
          </Pressable>
          {weightEntries.length > 0 ? (
            <>
              {weightLowest != null ? (
                <Text style={styles.statHint}>
                  Personal low (record): {weightLowest} kg
                </Text>
              ) : null}
              {weightDelta != null ? (
                <Text style={styles.weekCompareHint}>
                  {weightDelta < 0
                    ? `Down ${Math.abs(weightDelta).toFixed(1)} kg since your first log — great momentum.`
                    : weightDelta > 0
                      ? `Up ${weightDelta.toFixed(1)} kg since your first log — keep tracking consistently.`
                      : 'Same as your first logged weight.'}
                </Text>
              ) : null}
              <View style={styles.chartBox}>
                <View style={styles.chartClip}>
                <LineChart
                  data={weightLineData.map((d) => ({
                    value: d.value,
                    label: d.label,
                  }))}
                  width={weightChartWidth}
                  height={180}
                  spacing={Math.max(4, (weightChartWidth - 40) / 30)}
                  color={colors.caloriesLine}
                  thickness={2}
                  hideDataPoints={false}
                  dataPointsColor={colors.primary}
                  yAxisColor={colors.textSecondary}
                  xAxisColor={colors.border}
                  yAxisTextStyle={{ color: colors.textSecondary, fontSize: 9 }}
                  xAxisLabelTextStyle={{
                    color: colors.textSecondary,
                    fontSize: 8,
                  }}
                  noOfSections={4}
                  maxValue={weightLineMax}
                />
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.empty}>No weight entries yet.</Text>
          )}
        </View>

        {isEmpty ? (
          <Text style={styles.empty}>
            Complete a Pilates session to see charts and richer insights here.
          </Text>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Minutes (last 7 days)</Text>
            <View style={styles.chartBox}>
              <View style={styles.chartClip}>
              <LineChart
                data={lineData.map((d) => ({
                  value: d.value,
                  label: d.label,
                }))}
                width={chartWidth}
                height={200}
                spacing={40}
                color={colors.chartLine}
                thickness={2}
                hideDataPoints={false}
                dataPointsColor={colors.primary}
                yAxisColor={colors.textSecondary}
                xAxisColor={colors.border}
                yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                xAxisLabelTextStyle={{
                  color: colors.textSecondary,
                  fontSize: 10,
                }}
                noOfSections={4}
                maxValue={lineChartMax}
              />
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Minutes by week (last 4 weeks)
            </Text>
            <View style={styles.chartBox}>
              <View style={styles.chartClip}>
              <BarChart
                data={barData.map((d) => ({
                  value: d.value,
                  label: d.label,
                  frontColor: colors.chartBar,
                }))}
                width={chartWidth}
                height={200}
                barWidth={28}
                spacing={24}
                yAxisColor={colors.textSecondary}
                xAxisColor={colors.border}
                yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                xAxisLabelTextStyle={{
                  color: colors.textSecondary,
                  fontSize: 10,
                }}
                noOfSections={4}
                maxValue={barChartMax}
              />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Calories (last 7 days)</Text>
            <View style={styles.chartBox}>
              <View style={styles.chartClip}>
              <LineChart
                data={caloriesLineData.map((d) => ({
                  value: d.value,
                  label: d.label,
                }))}
                width={chartWidth}
                height={200}
                spacing={40}
                color={colors.caloriesLine}
                thickness={2}
                hideDataPoints={false}
                dataPointsColor={colors.caloriesBar}
                yAxisColor={colors.textSecondary}
                xAxisColor={colors.border}
                yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                xAxisLabelTextStyle={{
                  color: colors.textSecondary,
                  fontSize: 10,
                }}
                noOfSections={4}
                maxValue={caloriesLineMax}
              />
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Calories by week (last 4 weeks)
            </Text>
            <View style={styles.chartBox}>
              <View style={styles.chartClip}>
              <BarChart
                data={caloriesBarData.map((d) => ({
                  value: d.value,
                  label: d.label,
                  frontColor: colors.caloriesBar,
                }))}
                width={chartWidth}
                height={200}
                barWidth={28}
                spacing={24}
                yAxisColor={colors.textSecondary}
                xAxisColor={colors.border}
                yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                xAxisLabelTextStyle={{
                  color: colors.textSecondary,
                  fontSize: 10,
                }}
                noOfSections={4}
                maxValue={caloriesBarMax}
              />
              </View>
            </View>

          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function createProgressStyles(colors: AppColors) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 760 : undefined,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 48,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muted: {
    color: colors.textSecondary,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 18,
    letterSpacing: -0.8,
  },
  todayCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadowThemed(colors.shadow),
  },
  todayLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCol: {
    flex: 1,
    alignItems: 'center',
  },
  todayDivider: {
    width: 1,
    height: 44,
    backgroundColor: colors.border,
  },
  todayValue: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  todayUnit: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  streakVisual: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  streakBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadowThemed(colors.shadow),
  },
  streakNum: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  streakCaption: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  streakHype: {
    fontSize: 14,
    color: colors.primaryMuted,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  targetCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadowThemed(colors.shadow),
  },
  targetHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  inputRow: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginBottom: 14,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barFillCal: {
    backgroundColor: colors.caloriesBar,
  },
  barFillMin: {
    backgroundColor: colors.primaryMuted,
  },
  targetActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  btnSecondary: {
    flex: 1,
    minWidth: 120,
    backgroundColor: colors.border,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontWeight: '800',
    color: colors.text,
    fontSize: 15,
  },
  btnGhost: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnGhostText: {
    fontWeight: '700',
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.85,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadowThemed(colors.shadow),
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
    lineHeight: 34,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statCardCalories: {
    width: '100%',
    marginBottom: 16,
    flex: 0,
    alignSelf: 'stretch',
    minHeight: 120,
    justifyContent: 'center',
  },
  statHint: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 15,
    opacity: 0.9,
  },
  motivationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryMuted,
    ...cardShadowThemed(colors.shadow),
  },
  motivationLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  motivationText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    marginTop: 4,
  },
  chartBox: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 28,
  },
  chartClip: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  empty: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  weekCompareCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadowThemed(colors.shadow),
  },
  weekCompareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  weekCompareCol: {
    flex: 1,
  },
  weekCompareLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  weekCompareValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  weekCompareHint: {
    marginTop: 10,
    fontSize: 12,
    color: colors.primaryMuted,
    fontWeight: '600',
  },
  });
}
