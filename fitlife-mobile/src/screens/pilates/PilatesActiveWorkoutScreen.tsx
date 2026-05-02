import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImageBanner } from '../../components/PilatesImageBanner';
import { PilatesModel } from '../../models/PilatesModel';
import { usePilatesWorkoutViewModel } from '../../viewmodels/PilatesViewModel';
import { appendCompletion } from '../../data/PilatesProgressRepository';
import { estimatePilatesCalories } from '../../domain/PilatesCaloriesEstimate';
import type { PilatesStackParamList } from '../../navigation/PilatesNavigationTypes';
import type { AppColors } from '../../theme/PilatesColors';
import { useTheme } from '../../theme/PilatesThemeContext';

type Props = NativeStackScreenProps<PilatesStackParamList, 'ActiveWorkout'>;

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ActiveWorkoutScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createActiveWorkoutStyles(colors), [colors]);
  const { workout } = usePilatesWorkoutViewModel(route.params.workoutId);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [completionReady, setCompletionReady] = useState(false);
  /** kcal vlerësim për modalin web pas përfundimit */
  const [completionCalories, setCompletionCalories] = useState<number | null>(
    null,
  );
  const finishingRef = useRef(false);

  const dismissCompletionAlert = useCallback(() => {
    navigation.getParent()?.navigate('Progress');
    navigation.popToTop();
  }, [navigation]);

  useEffect(() => {
    setCompletionReady(false);
    setCompletionCalories(null);
  }, [route.params.workoutId]);

  const completeWorkout = useCallback(async () => {
    const w =
      workout ?? PilatesModel.getWorkoutById(route.params.workoutId);
    if (!w || finishingRef.current) return;
    finishingRef.current = true;
    setFinished(true);
    const totalMin = Math.max(
      1,
      Math.round(
        w.exercises.reduce((a, e) => a + e.durationSec, 0) / 60,
      ),
    );
    const caloriesBurned = estimatePilatesCalories(totalMin, w.level);
    setCompletionCalories(caloriesBurned);
    try {
      await appendCompletion({
        id: `${Date.now()}-${w.id}`,
        workoutId: w.id,
        workoutTitle: w.title,
        completedAt: new Date().toISOString(),
        durationMinutes: totalMin,
        caloriesBurned,
      });
    } catch (e) {
      console.warn('[FitLife] completion save failed', e);
    }

    // RN Web's Alert often doesn't show or doesn't fire onPress; use an iOS-style modal instead.
    if (Platform.OS === 'web') {
      setCompletionReady(true);
    } else {
      Alert.alert(
        'Workout complete',
        `Your progress has been saved.\n\nEstimated energy: ~${caloriesBurned} kcal (approximate).`,
        [{ text: 'OK', onPress: dismissCompletionAlert }],
      );
    }
  }, [dismissCompletionAlert, navigation, route.params.workoutId, workout]);

  useEffect(() => {
    if (!workout) return;
    const ex = workout.exercises[exerciseIndex];
    if (ex) setRemaining(ex.durationSec);
  }, [exerciseIndex, workout]);

  useEffect(() => {
    if (!workout || paused || finished) return;
    if (remaining <= 0) return;
    const id = setTimeout(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setExerciseIndex((idx) => {
            if (!workout) return idx;
            if (idx + 1 >= workout.exercises.length) {
              void completeWorkout();
              return idx;
            }
            return idx + 1;
          });
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearTimeout(id);
  }, [remaining, paused, finished, workout, completeWorkout]);

  const currentExercise = workout?.exercises[exerciseIndex];

  const bannerHeight = useMemo(() => {
    const flex = currentExercise?.imageBannerFlex;
    const resizeMode = currentExercise?.imageResizeMode ?? 'cover';
    const defaultFlex = resizeMode === 'contain' ? 0.44 : 0.42;
    if (flex != null && flex > 0 && flex < 1) {
      return Math.round(
        Math.min(Math.max(windowHeight * flex, 240), 420),
      );
    }
    return Math.round(
      Math.min(Math.max(windowHeight * defaultFlex, 270), 440),
    );
  }, [windowHeight, currentExercise]);

  const skipForward = () => {
    if (!workout || finished) return;
    if (exerciseIndex + 1 >= workout.exercises.length) {
      void completeWorkout();
      return;
    }
    setExerciseIndex((i) => i + 1);
  };

  if (!workout) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Workout not found.</Text>
      </View>
    );
  }

  const total = workout?.exercises.length ?? 0;

  if (finished || !currentExercise) {
    const showSaving = !(Platform.OS === 'web' && completionReady);
    return (
      <>
        <View style={styles.centered}>
          {showSaving ? (
            <Text style={styles.body}>Saving…</Text>
          ) : null}
        </View>
        {Platform.OS === 'web' && completionReady ? (
          <Modal
            transparent
            animationType="fade"
            visible
            onRequestClose={dismissCompletionAlert}
          >
            <View style={styles.iosAlertBackdrop} pointerEvents="box-none">
              <View
                style={styles.iosAlertCard}
                accessibilityRole="alert"
                accessibilityViewIsModal
              >
                <Text style={styles.iosAlertTitle}>Workout complete</Text>
                <Text style={styles.iosAlertMessage}>
                  Your progress has been saved.
                  {completionCalories != null ? (
                    <>
                      {'\n\n'}
                      Estimated energy: ~{completionCalories} kcal (approximate).
                    </>
                  ) : null}
                </Text>
                <View style={styles.iosAlertHairline} />
                <Pressable
                  style={({ pressed }) => [
                    styles.iosAlertOKWrap,
                    pressed && styles.iosAlertOKPressed,
                  ]}
                  onPress={dismissCompletionAlert}
                >
                  <Text style={styles.iosAlertOK}>OK</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        ) : null}
      </>
    );
  }

  const resizeMode = currentExercise.imageResizeMode ?? 'cover';
  const cropPosition =
    resizeMode === 'contain'
      ? 'center'
      : (currentExercise.imageCropPosition ?? 'center');

  const footerPad = Math.max(insets.bottom, 12);

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <View style={styles.column}>
        <View key={currentExercise.id} style={styles.bannerWrap}>
          <ImageBanner
            source={currentExercise.image}
            height={bannerHeight}
            variant="fadeToSurface"
            imageResizeMode={resizeMode}
            imageCropPosition={cropPosition}
            style={styles.bannerRadius}
          />
        </View>

        <View style={styles.panel}>
          <ScrollView
            style={styles.panelScroll}
            contentContainerStyle={styles.panelScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces
          >
            <View style={styles.dots}>
              {workout.exercises.map((ex, i) => (
                <View
                  key={ex.id}
                  style={[
                    styles.dot,
                    i === exerciseIndex && styles.dotActive,
                    i < exerciseIndex && styles.dotDone,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.step}>
              Exercise {exerciseIndex + 1} of {total}
            </Text>
            <Text style={styles.exerciseTitle}>{currentExercise.name}</Text>
            <Text style={styles.desc}>{currentExercise.description}</Text>
          </ScrollView>

          <View style={[styles.panelFooter, { paddingBottom: footerPad }]}>
            <View style={styles.timerWrap}>
              <Text style={[styles.timer, paused && styles.timerPaused]}>
                {formatTime(remaining)}
              </Text>
              {paused ? (
                <Text style={styles.pausedLabel}>paused</Text>
              ) : null}
            </View>
            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  styles.secondary,
                  pressed && styles.btnPressed,
                ]}
                onPress={() => setPaused((p) => !p)}
              >
                <Text style={styles.btnSecondaryText}>
                  {paused ? 'Resume' : 'Pause'}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  styles.primary,
                  pressed && styles.btnPressed,
                ]}
                onPress={skipForward}
              >
                <Text style={styles.btnPrimaryText}>Next</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createActiveWorkoutStyles(colors: AppColors) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  column: {
    flex: 1,
    minHeight: 0,
  },
  bannerWrap: {
    overflow: 'hidden',
  },
  bannerRadius: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  error: { color: colors.danger },
  body: { color: colors.textSecondary },
  iosAlertBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 43, 32, 0.42)',
    paddingHorizontal: 40,
  },
  iosAlertCard: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(45, 106, 79, 0.14)',
    ...(Platform.OS === 'web'
      ? {
          boxShadow:
            '0 4px 6px rgba(27, 43, 32, 0.04), 0 20px 50px rgba(27, 43, 32, 0.14)' as const,
        }
      : {
          shadowColor: '#1B4332',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.14,
          shadowRadius: 28,
          elevation: 14,
        }),
  },
  iosAlertTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
    letterSpacing: -0.3,
    paddingTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 6,
  },
  iosAlertMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: colors.textSecondary,
    paddingHorizontal: 18,
    paddingBottom: 22,
  },
  iosAlertHairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(45, 106, 79, 0.18)',
  },
  iosAlertOKWrap: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iosAlertOKPressed: {
    backgroundColor: 'rgba(45, 106, 79, 0.08)',
  },
  iosAlertOK: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.2,
  },
  panel: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'column',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
    paddingTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  panelScroll: {
    flex: 1,
    minHeight: 0,
  },
  panelScrollContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 12,
  },
  panelFooter: {
    paddingHorizontal: 22,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(27, 43, 32, 0.12)',
    backgroundColor: colors.surface,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 22,
    borderRadius: 4,
  },
  dotDone: {
    backgroundColor: colors.primaryMuted,
  },
  step: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  exerciseTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  timerWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timer: {
    fontSize: 48,
    fontWeight: '200',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  timerPaused: {
    opacity: 0.55,
  },
  pausedLabel: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnPressed: {
    opacity: 0.88,
  },
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  secondary: {
    backgroundColor: colors.border,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  btnSecondaryText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  });
}
