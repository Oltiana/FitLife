import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadProgramMarkedSlots, toggleProgramDaySlot } from '../../data/PilatesProgramProgressRepository';
import { ensureDefaultUser, getProgramById } from '../../data/PilatesUserProgramRepository';
import {
  countMarkedInWeek,
  isProgramCompleted,
  isProgramWeekUnlocked,
  programSlotKey,
} from '../../domain/PilatesProgramSchedule';
import type { PilatesStackParamList } from '../../navigation/PilatesNavigationTypes';
import type { AppColors } from '../../theme/PilatesColors';
import { useTheme } from '../../theme/PilatesThemeContext';
import { cardShadowThemed } from '../../theme/PilatesShadows';

type Props = NativeStackScreenProps<PilatesStackParamList, 'ProgramSchedule'>;

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.4,
      marginBottom: 8,
    },
    caption: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      marginBottom: 20,
    },
    weekBlock: {
      marginBottom: 22,
    },
    weekTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.primary,
      marginBottom: 10,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    weekLocked: {
      opacity: 0.45,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 6,
    },
    dayHead: {
      flex: 1,
      textAlign: 'center',
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    cell: {
      flex: 1,
      aspectRatio: 1,
      maxWidth: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...cardShadowThemed(colors.shadow),
    },
    cellOn: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryMuted,
    },
    cellDisabled: {
      opacity: 0.35,
    },
    cellText: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textSecondary,
    },
    cellTextOn: {
      color: '#fff',
    },
    legend: {
      marginTop: 8,
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    completedBanner: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginBottom: 16,
      ...cardShadowThemed(colors.shadow),
    },
    completedText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '800',
      textAlign: 'center',
    },
  });
}

export function PilatesProgramScheduleScreen({ route }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { workoutId } = route.params;
  const [totalWeeks, setTotalWeeks] = useState(4);
  const [programName, setProgramName] = useState('');
  const [marked, setMarked] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const user = await ensureDefaultUser();
    setUserId(user.id);
    const prog = await getProgramById(workoutId);
    if (prog) {
      setTotalWeeks(Math.max(1, Math.min(8, prog.duration_weeks)));
      setProgramName(prog.name);
    }
    const slots = await loadProgramMarkedSlots(user.id, workoutId);
    setMarked(slots);
  }, [workoutId]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const markedSet = useMemo(() => new Set(marked), [marked]);
  const completed = useMemo(
    () => isProgramCompleted(markedSet, totalWeeks),
    [markedSet, totalWeeks],
  );

  const onToggle = async (weekIndex: number, dayIndex: number) => {
    if (!userId) return;
    const key = programSlotKey(weekIndex, dayIndex);
    const isOn = markedSet.has(key);
    const unlocked = isProgramWeekUnlocked(weekIndex, markedSet, totalWeeks);
    if (!isOn && weekIndex > 0 && !unlocked) {
      Alert.alert(
        'Week locked',
        'Complete at least 2 days in the previous week to unlock the next week.',
      );
      return;
    }
    const next = await toggleProgramDaySlot(
      userId,
      workoutId,
      weekIndex,
      dayIndex,
      totalWeeks,
    );
    setMarked(next);
  };

  const weeks = useMemo(
    () => Array.from({ length: totalWeeks }, (_, i) => i),
    [totalWeeks],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Weekly program</Text>
        <Text style={styles.caption}>
          {programName ? `${programName} · ` : ''}
          {completed
            ? 'Program completed. Great consistency - keep maintaining your rhythm.'
            : 'Tap a day when you complete your planned Pilates for that day. Next week unlocks after at least 2 days marked in the current week.'}
        </Text>
        {completed ? (
          <View style={styles.completedBanner}>
            <Text style={styles.completedText}>Program completed</Text>
          </View>
        ) : null}

        {weeks.map((w) => {
          const unlocked = isProgramWeekUnlocked(w, markedSet, totalWeeks);
          const doneThisWeek = countMarkedInWeek(markedSet, w);
          return (
            <View
              key={w}
              style={[styles.weekBlock, !unlocked && w > 0 && styles.weekLocked]}
            >
              <Text style={styles.weekTitle}>
                Week {w + 1}
                {unlocked || w === 0
                  ? ` · ${doneThisWeek}/7 days`
                  : ' · locked'}
              </Text>
              <View style={styles.row}>
                {WEEKDAY_LABELS.map((lbl, idx) => (
                  <Text key={`h-${w}-${lbl}-${idx}`} style={styles.dayHead}>
                    {lbl}
                  </Text>
                ))}
              </View>
              <View style={styles.row}>
                {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                  const key = programSlotKey(w, d);
                  const on = markedSet.has(key);
                  const canTap =
                    on || w === 0 || isProgramWeekUnlocked(w, markedSet, totalWeeks);
                  return (
                    <Pressable
                      key={key}
                      style={[
                        styles.cell,
                        on && styles.cellOn,
                        !canTap && !on && styles.cellDisabled,
                      ]}
                      onPress={() => void onToggle(w, d)}
                      disabled={!userId}
                    >
                      <Text
                        style={[styles.cellText, on && styles.cellTextOn]}
                        maxFontSizeMultiplier={1.2}
                      >
                        {on ? '✓' : ''}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}

        <Text style={styles.legend}>
          Numbers are day slots (1–7) within the week row, not calendar dates.
          Use this grid as your multi-week plan checklist.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
