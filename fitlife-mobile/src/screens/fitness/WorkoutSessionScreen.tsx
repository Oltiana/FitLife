import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FitnessStackParamList } from '../../navigation/FitnessStack';
import {
  completeWorkoutSession,
  deleteWorkoutExercise,
  getWorkoutPlanById,
  startWorkoutSession,
  updateWorkoutExercise,
} from '../../api/fitnessApi';

type WorkoutSessionRouteProp = RouteProp<FitnessStackParamList, 'WorkoutSession'>;

export function WorkoutSessionScreen() {
  const route = useRoute<WorkoutSessionRouteProp>();
  const navigation = useNavigation<any>();
  const { workoutPlanId } = route.params;

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [editSets, setEditSets] = useState('');
  const [editReps, setEditReps] = useState('');

  const [secondsLeft, setSecondsLeft] = useState(84);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);

  useEffect(() => {
    loadPlan();
  }, []);

  useEffect(() => {
    if (!sessionStarted || isPaused || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStarted, isPaused, secondsLeft]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const data = await getWorkoutPlanById(workoutPlanId);
      setPlan(data);
    } catch (error) {
      console.log('Failed to load workout plan', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const exercises = plan?.exercises ?? [];
  const currentExercise = exercises[currentExerciseIndex];
  const nextExercise = exercises[currentExerciseIndex + 1];
  const hasExercises = exercises.length > 0;

  const progress =
    exercises.length > 0 ? ((currentExerciseIndex + 1) / exercises.length) * 100 : 0;

  const getExerciseImage = (bodyPart?: string) => {
    const part = bodyPart?.toLowerCase() ?? '';

    if (part.includes('chest')) return require('../../../assets/images/fitness-images/chest.jpg');
    if (part.includes('back')) return require('../../../assets/images/fitness-images/back.jpg');

    if (part.includes('upper legs') || part.includes('lower legs')) {
      return require('../../../assets/images/fitness-images/legs.jpg');
    }

    if (part.includes('upper arms') || part.includes('lower arms')) {
      return require('../../../assets/images/fitness-images/arms.jpg');
    }

    if (part.includes('waist')) return require('../../../assets/images/fitness-images/core.jpg');

    return require('../../../assets/images/fitness-images/chest.jpg');
  };

  const handleStartWorkout = async () => {
    try {
      const session = await startWorkoutSession(workoutPlanId);

      setActiveSessionId(session.id);
      setSessionStarted(true);
      setStartedAt(new Date());
      setCurrentExerciseIndex(0);
      setSecondsLeft(84);
      setIsPaused(false);
      setCurrentSet(1);
      setStatusMessage('Workout session is now active.');
    } catch (error) {
      setStatusMessage('Could not start workout session.');
    }
  };

  const handleCompleteWorkout = async () => {
    if (!activeSessionId) {
      Alert.alert('Error', 'No active workout session found.');
      return;
    }

    const durationMinutes = startedAt
      ? Math.max(
        1,
        Math.round((new Date().getTime() - startedAt.getTime()) / 60000)
      )
      : 1;

    try {
      await completeWorkoutSession(activeSessionId, {
        durationMinutes,
        calories: 0,
      });

      setStatusMessage(`Workout completed successfully. Duration: ${durationMinutes} min.`);
      setSessionStarted(false);
      setActiveSessionId(null);
      setStartedAt(null);

      setTimeout(() => {
        navigation.goBack();
      }, 1200);
    } catch (error) {
      console.log('COMPLETE WORKOUT ERROR', error);
      Alert.alert('Error', 'Could not complete workout.');
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setSecondsLeft(84);
      setIsPaused(false);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
      setSecondsLeft(84);
      setIsPaused(false);
    }
  };

  const handleRemoveExercise = (exerciseId: number) => {
    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise from the plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkoutExercise(exerciseId);
              await loadPlan();
              setCurrentExerciseIndex(0);
              setStatusMessage('Exercise removed from plan.');
            } catch (error) {
              setStatusMessage('Could not remove exercise.');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (exercise: any) => {
    setSelectedExercise(exercise);
    setEditSets(exercise.sets?.toString() ?? '1');
    setEditReps(exercise.reps?.toString() ?? '1');
    setEditModalVisible(true);
  };

  const handleUpdateExercise = async () => {
    if (!selectedExercise) return;

    try {
      await updateWorkoutExercise(selectedExercise.id, {
        sets: Number(editSets),
        reps: Number(editReps),
      });

      await loadPlan();
      setEditModalVisible(false);
      setSelectedExercise(null);
      setStatusMessage('Exercise updated successfully.');
    } catch (error) {
      setStatusMessage('Could not update exercise.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#86B587" />
        <Text style={styles.loadingText}>Loading workout plan...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Workout plan not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>{plan.name}</Text>
          <Text style={styles.subtitle}>
            Exercise {hasExercises ? currentExerciseIndex + 1 : 0} of {exercises.length}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sessionStarted && currentExercise ? (
          <>
            <View style={styles.timerCard}>
              <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
              <Text style={styles.timerLabel}>TIME REMAINING</Text>
            </View>

            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            </View>

            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            <View style={styles.currentExerciseCard}>
              <View style={styles.currentAccent} />

              <View style={styles.currentExerciseContent}>
                <Text style={styles.activeLabel}>CURRENT EXERCISE</Text>
                <Text style={styles.activeTitle}>{currentExercise.exerciseName}</Text>
                <Text style={styles.activeMeta}>
                  Set {currentSet} of {currentExercise.sets} · {currentExercise.reps} reps
                </Text>
              </View>
            </View>

            <Text style={styles.setsTitle}>SETS</Text>

            <View style={styles.setRow}>
              {Array.from({ length: currentExercise.sets ?? 1 }).map((_, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.setCircle,
                    currentSet === index + 1 && styles.setCircleActive,
                  ]}
                  onPress={() => {
                    setCurrentSet(index + 1);
                    setCurrentExerciseIndex(0);
                    setSecondsLeft(84);
                    setIsPaused(false);
                  }}
                >
                  <Text
                    style={[
                      styles.setCircleText,
                      currentSet === index + 1 && styles.setCircleTextActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.controlRow}>
              <Pressable style={styles.smallControlButton} onPress={handlePreviousExercise}>
                <Ionicons name="refresh-outline" size={30} color="#9A9A9A" />
              </Pressable>

              <Pressable
                style={styles.pauseButton}
                onPress={() => setIsPaused((prev) => !prev)}
              >
                <Ionicons
                  name={isPaused ? 'play' : 'pause'}
                  size={44}
                  color="#fff"
                />
              </Pressable>

              <Pressable style={styles.nextControlButton} onPress={handleNextExercise}>
                <Ionicons name="chevron-forward" size={38} color="#245C32" />
              </Pressable>
            </View>

            {nextExercise ? (
              <View style={styles.nextExerciseCard}>
                <View style={styles.nextImageBox}>
                  <Image
                    source={getExerciseImage(nextExercise.bodyPart)}
                    style={styles.nextImage}
                  />
                </View>

                <View>
                  <Text style={styles.nextLabel}>NEXT EXERCISE</Text>
                  <Text style={styles.nextTitle}>
                    {nextExercise.exerciseName}: {nextExercise.sets} sets ×{' '}
                    {nextExercise.reps} reps
                  </Text>
                </View>
              </View>
            ) : null}
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Exercises</Text>

        {exercises.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="barbell-outline" size={42} color="#86B587" />
            <Text style={styles.emptyTitle}>No exercises added yet</Text>
            <Text style={styles.emptyText}>
              Go to Exercise Library and add exercises to this plan.
            </Text>
          </View>
        ) : (
          exercises.map((item: any, index: number) => (
            <View key={item.id ?? index} style={styles.exerciseCard}>
              <View style={styles.exerciseImageBox}>
                <Image source={getExerciseImage(item.bodyPart)} style={styles.exerciseImage} />
              </View>

              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseName} numberOfLines={2}>
                  {index + 1}. {item.exerciseName}
                </Text>

                <Text style={styles.exerciseMeta}>
                  {item.bodyPart}: {item.sets} sets × {item.reps} reps
                </Text>

                <View style={styles.exerciseBadge}>
                  <Text style={styles.exerciseBadgeText}>{item.bodyPart ?? 'Fitness'}</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <Pressable style={styles.editExerciseButton} onPress={() => openEditModal(item)}>
                  <Ionicons name="create-outline" size={20} color="#5F8F64" />
                </Pressable>

                <Pressable
                  style={styles.removeExerciseButton}
                  onPress={(event) => {
                    event.stopPropagation();
                    handleRemoveExercise(item.id);
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#D47A45" />
                </Pressable>
              </View>
            </View>
          ))
        )}

        {statusMessage ? (
          <View style={styles.statusCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#5F8F64" />
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        ) : null}

        {!sessionStarted ? (
          <Pressable
            style={[styles.startButton, !hasExercises && styles.disabledButton]}
            onPress={handleStartWorkout}
            disabled={!hasExercises}
          >
            <Text style={styles.startButtonText}>
              {hasExercises ? 'Start Workout' : 'Add exercises to start'}
            </Text>
          </Pressable>
        ) : (
          <Pressable style={styles.completeButton} onPress={handleCompleteWorkout}>
            <Text style={styles.startButtonText}>Complete Workout</Text>
          </Pressable>
        )}
      </ScrollView>

      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Exercise</Text>
            <Text style={styles.modalSubtitle}>{selectedExercise?.exerciseName}</Text>

            <Text style={styles.inputLabel}>Sets</Text>
            <TextInput
              value={editSets}
              onChangeText={setEditSets}
              keyboardType="numeric"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Reps</Text>
            <TextInput
              value={editReps}
              onChangeText={setEditReps}
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.saveButton} onPress={handleUpdateExercise}>
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF7' },

  center: {
    flex: 1,
    backgroundColor: '#F8FAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#5F8F64',
    fontWeight: '700',
  },

  errorText: {
    color: '#B00020',
    fontWeight: '800',
  },

  header: {
    backgroundColor: '#86B587',
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginRight: 60,
  },

  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    textTransform: 'capitalize',
    textAlign: 'center',
  },

  subtitle: {
    color: '#F1FFF2',
    marginTop: 4,
    fontWeight: '800',
    textAlign: 'center',
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    padding: 22,
    paddingBottom: 170,
  },

  timerCard: {
    backgroundColor: '#6F9B73',
    borderRadius: 22,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 20,
  },

  timerText: {
    color: '#E8A22D',
    fontSize: 42,
    fontWeight: '900',
  },

  timerLabel: {
    color: '#EAF4E8',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  progressLabel: {
    color: '#5F8F64',
    fontSize: 15,
    fontWeight: '900',
  },

  progressPercent: {
    color: '#5F8F64',
    fontSize: 15,
    fontWeight: '900',
  },

  progressBackground: {
    height: 10,
    backgroundColor: '#DCEADB',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 22,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#5F8F64',
    borderRadius: 10,
  },

  currentExerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8DED7',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  currentAccent: {
    width: 28,
    height: 76,
    borderRadius: 14,
    backgroundColor: '#6F9B73',
    marginRight: 14,
  },

  currentExerciseContent: {
    flex: 1,
  },

  activeLabel: {
    color: '#9A9A9A',
    fontSize: 12,
    fontWeight: '900',
  },

  activeTitle: {
    color: '#245C32',
    fontSize: 19,
    fontWeight: '900',
    marginTop: 3,
    textTransform: 'capitalize',
  },

  activeMeta: {
    color: '#5F8F64',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
  },

  setsTitle: {
    color: '#777',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },

  setRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
  },

  setCircle: {
    width: 48,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#B9B9B9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  setCircleActive: {
    backgroundColor: '#86B587',
    borderColor: '#86B587',
  },

  setCircleText: {
    color: '#777',
    fontSize: 14,
    fontWeight: '900',
  },

  setCircleTextActive: {
    color: '#fff',
  },

  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 26,
  },

  smallControlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D8DED7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pauseButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E8A22D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextControlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#DCEADB',
    borderWidth: 1,
    borderColor: '#AFC9AF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextExerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCEADB',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  nextImageBox: {
    width: 58,
    height: 46,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#DCEADB',
    marginRight: 12,
  },

  nextImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  nextLabel: {
    color: '#9A9A9A',
    fontSize: 11,
    fontWeight: '900',
  },

  nextTitle: {
    color: '#333',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },

  sectionTitle: {
    color: '#5F8F64',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 14,
  },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },

  emptyTitle: {
    color: '#5F8F64',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },

  emptyText: {
    color: '#777',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },

  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  exerciseImageBox: {
    width: 76,
    height: 76,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#C9DEC9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  exerciseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  exerciseContent: {
    flex: 1,
  },

  exerciseName: {
    color: '#5F8F64',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'capitalize',
  },

  exerciseMeta: {
    color: '#7FAE83',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'capitalize',
  },

  exerciseBadge: {
    backgroundColor: '#DCEADB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },

  exerciseBadgeText: {
    color: '#6F9B73',
    fontSize: 11,
    fontWeight: '800',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },

  editExerciseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCEADB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeExerciseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE1D0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusCard: {
    backgroundColor: '#DCEADB',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  statusText: {
    color: '#5F8F64',
    fontWeight: '800',
    flex: 1,
  },

  startButton: {
    backgroundColor: '#86B587',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 6,
  },

  completeButton: {
    backgroundColor: '#5F8F64',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 6,
  },

  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },

  disabledButton: {
    opacity: 0.5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },

  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
  },

  modalTitle: {
    color: '#5F8F64',
    fontSize: 22,
    fontWeight: '800',
  },

  modalSubtitle: {
    color: '#777',
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 18,
    textTransform: 'capitalize',
  },

  inputLabel: {
    color: '#5F8F64',
    fontWeight: '800',
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#F1F4F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    fontWeight: '700',
    color: '#333',
  },

  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#E8E8E8',
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#555',
    fontWeight: '800',
  },

  saveButton: {
    flex: 1,
    backgroundColor: '#86B587',
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
});