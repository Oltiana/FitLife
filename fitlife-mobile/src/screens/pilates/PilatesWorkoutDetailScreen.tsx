import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ImageBanner } from '../../components/PilatesImageBanner';
import { WorkoutImage } from '../../components/PilatesWorkoutImage';
import type { PilatesProgram } from '../../domain/PilatesProgramTypes';
import {
  enrollUserInProgram,
  getProgramById,
  unenrollUserFromProgram,
} from '../../data/PilatesUserProgramRepository';
import { useEnrolledProgramIds } from '../../hooks/usePilatesEnrolledProgramIds';
import { usePilatesWorkoutViewModel } from '../../viewmodels/PilatesViewModel';
import type { MainTabParamList, PilatesStackParamList } from '../../navigation/PilatesNavigationTypes';
import type { AppColors } from '../../theme/PilatesColors';
import { useTheme } from '../../theme/PilatesThemeContext';

type Props = NativeStackScreenProps<PilatesStackParamList, 'WorkoutDetail'>;

function formatSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function createWorkoutDetailStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingBottom: 40,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    error: {
      color: colors.danger,
    },
    heroTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: -0.4,
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 8,
    },
    heroMeta: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.92)',
    },
    section: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSecondary,
    },
    subheading: {
      paddingHorizontal: 20,
      marginTop: 8,
      marginBottom: 14,
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.3,
    },
    exerciseRow: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginBottom: 14,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 10,
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 2,
    },
    thumbWrap: {
      position: 'relative',
      width: 88,
      height: 88,
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: colors.background,
    },
    thumbWrapContain: {
      backgroundColor: colors.background,
    },
    thumb: {
      width: 88,
      height: 88,
    },
    thumbRing: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: 'rgba(0, 0, 0, 0.06)',
    },
    exerciseText: {
      flex: 1,
      paddingLeft: 8,
      justifyContent: 'center',
    },
    exerciseIndex: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginTop: 2,
    },
    exerciseDur: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
      fontWeight: '500',
    },
    cta: {
      marginHorizontal: 20,
      marginTop: 24,
      backgroundColor: colors.primary,
      paddingVertical: 17,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.22,
      shadowRadius: 12,
      elevation: 4,
    },
    ctaPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
    ctaText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    programCard: {
      marginHorizontal: 20,
      marginTop: 8,
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    programTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    programCaption: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    programBtn: {
      marginTop: 14,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    programBtnSolid: {
      backgroundColor: colors.primary,
    },
    programBtnOutline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    programBtnPressed: {
      opacity: 0.88,
    },
    programBtnDisabled: {
      opacity: 0.65,
    },
    programBtnText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '800',
    },
    programBtnTextOutline: {
      color: colors.primary,
    },
    scheduleBtn: {
      marginHorizontal: 20,
      marginTop: 12,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    scheduleBtnPressed: {
      opacity: 0.9,
    },
    scheduleBtnText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '800',
    },
  });
}

export function WorkoutDetailScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createWorkoutDetailStyles(colors), [colors]);
  const { workout } = usePilatesWorkoutViewModel(route.params.workoutId);
  const { userId, enrolledIds, refresh } = useEnrolledProgramIds();
  const [programRow, setProgramRow] = useState<PilatesProgram | null>(null);
  const [enrollBusy, setEnrollBusy] = useState(false);

  useLayoutEffect(() => {
    const goBackOrHome = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }
      const tabNav = navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
      tabNav?.navigate('Home');
    };

    navigation.setOptions({
      headerBackVisible: false,
      headerLeft: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={goBackOrHome}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 12 }}
          style={{ marginLeft: Platform.OS === 'ios' ? 4 : 0, paddingVertical: 6, paddingRight: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </Pressable>
      ),
    });
  }, [navigation, colors.primary]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void (async () => {
        const id = route.params.workoutId;
        const p = await getProgramById(id);
        setProgramRow(p ?? null);
      })();
    }, [refresh, route.params.workoutId]),
  );

  if (!workout) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Workout not found.</Text>
      </View>
    );
  }

  const isEnrolled = enrolledIds.has(workout.id);
  const planWeeks = programRow?.duration_weeks;

  const onToggleProgram = async () => {
    if (!userId || enrollBusy) return;
    setEnrollBusy(true);
    try {
      if (isEnrolled) {
        await unenrollUserFromProgram(userId, workout.id);
      } else {
        await enrollUserInProgram(userId, workout.id);
      }
      await refresh();
    } finally {
      setEnrollBusy(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ImageBanner
        source={workout.coverImage}
        aspectRatio={0.68}
        variant="darkBottom"
        bottomInset={20}
      >
        <Text style={styles.heroTitle}>{workout.title}</Text>
        <Text style={styles.heroMeta}>
          {workout.exercises.length} exercises · {workout.estimatedMinutes} min
          {planWeeks != null ? ` · ${planWeeks}-week plan` : ''}
        </Text>
      </ImageBanner>

      <View style={styles.section}>
        <Text style={styles.body}>{workout.description}</Text>
      </View>

      <View style={styles.programCard}>
        <Text style={styles.programTitle}>Your program</Text>
        <Text style={styles.programCaption}>
          {isEnrolled
            ? 'You are enrolled. Open the weekly calendar to mark training days and follow the 4-week style progression.'
            : 'Add this plan to your profile to track it as a multi-week program and unlock the weekly calendar.'}
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.programBtn,
            isEnrolled ? styles.programBtnOutline : styles.programBtnSolid,
            pressed && styles.programBtnPressed,
            enrollBusy && styles.programBtnDisabled,
          ]}
          onPress={() => void onToggleProgram()}
          disabled={enrollBusy || !userId}
        >
          {enrollBusy ? (
            <ActivityIndicator color={isEnrolled ? colors.primary : '#fff'} />
          ) : (
            <Text
              style={[
                styles.programBtnText,
                isEnrolled && styles.programBtnTextOutline,
              ]}
            >
              {isEnrolled ? 'Remove from my programs' : 'Add to my programs'}
            </Text>
          )}
        </Pressable>
      </View>

      {isEnrolled ? (
        <Pressable
          style={({ pressed }) => [
            styles.scheduleBtn,
            pressed && styles.scheduleBtnPressed,
          ]}
          onPress={() =>
            navigation.navigate('ProgramSchedule', { workoutId: workout.id })
          }
        >
          <Text style={styles.scheduleBtnText}>Weekly program calendar</Text>
        </Pressable>
      ) : null}

      <Text style={styles.subheading}>Steps</Text>
      {workout.exercises.map((ex, index) => (
        <View key={ex.id} style={styles.exerciseRow}>
          <View
            style={[
              styles.thumbWrap,
              ex.imageResizeMode === 'contain' && styles.thumbWrapContain,
            ]}
          >
            <WorkoutImage
              source={ex.image}
              resizeMode={ex.imageResizeMode ?? 'cover'}
              cropPosition={ex.imageCropPosition ?? 'center'}
              style={[
                styles.thumb,
                ex.imageResizeMode === 'contain' && {
                  backgroundColor: colors.background,
                },
              ]}
            />
            <View style={styles.thumbRing} pointerEvents="none" />
          </View>
          <View style={styles.exerciseText}>
            <Text style={styles.exerciseIndex}>Step {index + 1}</Text>
            <Text style={styles.exerciseName}>{ex.name}</Text>
            <Text style={styles.exerciseDur}>{formatSec(ex.durationSec)}</Text>
          </View>
        </View>
      ))}

      <Pressable
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        onPress={() =>
          navigation.navigate('ActiveWorkout', { workoutId: workout.id })
        }
      >
        <Text style={styles.ctaText}>Start workout</Text>
      </Pressable>
    </ScrollView>
  );
}
