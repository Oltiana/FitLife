import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FitnessStackParamList } from '../../navigation/FitnessStack';
import { getWorkoutPlanById, startWorkoutSession, completeWorkoutSession, deleteWorkoutExercise, updateWorkoutExercise, } from '../../api/fitnessApi';
import { Alert } from 'react-native';

type WorkoutSessionRouteProp = RouteProp<FitnessStackParamList, 'WorkoutSession'>;

export function WorkoutSessionScreen() {
  const route = useRoute<WorkoutSessionRouteProp>();
  const navigation = useNavigation<any>();
  const { workoutPlanId } = route.params;

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);

  const [statusMessage, setStatusMessage] = useState('');
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [editSets, setEditSets] = useState('');
  const [editReps, setEditReps] = useState('');

  useEffect(() => {
    loadPlan();
  }, []);

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

  const handleStartWorkout = async () => {
    try {
      const session = await startWorkoutSession(workoutPlanId);

      setActiveSessionId(session.id);
      setSessionStarted(true);
      setStartedAt(new Date());
      setCurrentExerciseIndex(0);
      setStatusMessage('Workout session is now active.');
    } catch (error) {
      setStatusMessage('Could not start workout session.');
    }
  };

  const getFitnessExerciseIcon = (bodyPart?: string) => {
    const part = bodyPart?.toLowerCase() ?? '';

    if (part.includes('waist')) return 'body-outline';
    if (part.includes('chest')) return 'barbell-outline';
    if (part.includes('back')) return 'add-circle-outline';
    if (part.includes('upper legs') || part.includes('lower legs')) return 'walk-outline';
    if (part.includes('upper arms') || part.includes('lower arms')) return 'barbell-outline';

    return 'fitness-outline';
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

  const handleCompleteWorkout = async () => {
    if (!activeSessionId || !startedAt) return;

    const durationMinutes = Math.max(
      1,
      Math.round((new Date().getTime() - startedAt.getTime()) / 60000)
    );

    try {
      await completeWorkoutSession(activeSessionId, {
        durationMinutes,
        calories: 0,
      });

      setStatusMessage(`Workout completed successfully. Duration: ${durationMinutes} min.`);
      setSessionStarted(false);

      setTimeout(() => {
        navigation.goBack();
      }, 1200);
    } catch (error) {
      setStatusMessage('Could not complete workout.');
    }
  };
  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
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

  const exercises = plan?.exercises ?? [];
  const currentExercise = exercises[currentExerciseIndex];
  const progress =
    exercises.length > 0 ? ((currentExerciseIndex + 1) / exercises.length) * 100 : 0;

  const hasExercises = exercises.length > 0;

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
      console.log('UPDATE ERROR', error);
      setStatusMessage('Could not update exercise.');
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>

        <Text style={styles.title}>{plan.name}</Text>
        <Text style={styles.subtitle}>{plan.description || 'Workout plan details'}</Text>

        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{plan.level}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Exercises</Text>

        {sessionStarted && currentExercise ? (
          <View style={styles.activeCard}>
            <Text style={styles.activeLabel}>Active Session</Text>
            <Text style={styles.activeTitle}>{currentExercise.exerciseName}</Text>
            <Text style={styles.activeMeta}>
              {currentExercise.sets} sets x {currentExercise.reps} reps
            </Text>

            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            <Text style={styles.progressText}>
              Exercise {currentExerciseIndex + 1} of {exercises.length}
            </Text>

            {currentExerciseIndex < exercises.length - 1 ? (
              <Pressable style={styles.nextButton} onPress={handleNextExercise}>
                <Text style={styles.nextButtonText}>Next Exercise</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <FlatList
          data={plan.exercises ?? []}
          keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="barbell-outline" size={42} color="#86B587" />
              <Text style={styles.emptyTitle}>No exercises added yet</Text>
              <Text style={styles.emptyText}>
                Go to Exercise Library and add exercises to this plan.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const iconName = getFitnessExerciseIcon(item.bodyPart);

            return (
              <View style={styles.exerciseCard}>
                <View style={styles.exerciseIconBox}>
                  <Ionicons name={iconName as any} size={34} color="#5F8F64" />
                </View>

                <View style={styles.exerciseContent}>
                  <Text style={styles.exerciseName}>
                    {index + 1}. {item.exerciseName}
                  </Text>

                  <Text style={styles.exerciseMeta}>
                    {item.bodyPart} · {item.targetMuscle}
                  </Text>

                  <View style={styles.exerciseBadge}>
                    <Text style={styles.exerciseBadgeText}>
                      {item.sets} sets x {item.reps} reps
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={styles.editExerciseButton}
                  onPress={() => openEditModal(item)}
                >
                  <Ionicons name="create-outline" size={20} color="#5F8F64" />
                </Pressable>

                <Pressable
                  style={styles.removeExerciseButton}
                  onPress={() => handleRemoveExercise(item.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#D47A45" />
                </Pressable>
              </View>
            );
          }}
        />
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
      </View>
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Exercise</Text>
            <Text style={styles.modalSubtitle}>
              {selectedExercise?.exerciseName}
            </Text>

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
              <Pressable
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  subtitle: {
    color: '#F1FFF2',
    marginTop: 6,
    fontWeight: '700',
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  levelText: {
    color: '#fff',
    fontWeight: '800',
  },
  content: {
    flex: 1,
    padding: 22,
  },
  sectionTitle: {
    color: '#5F8F64',
    fontSize: 20,
    fontWeight: '800',
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
  exerciseIconBox: {
    width: 76,
    height: 76,
    borderRadius: 16,
    backgroundColor: '#C9DEC9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
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
  startButton: {
    backgroundColor: '#86B587',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  completeButton: {
    backgroundColor: '#5F8F64',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  statusCard: {
    backgroundColor: '#DCEADB',
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: '#5F8F64',
    fontWeight: '800',
    flex: 1,
  },
  activeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  activeLabel: {
    color: '#86B587',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  activeTitle: {
    color: '#5F8F64',
    fontSize: 20,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  activeMeta: {
    color: '#777',
    fontWeight: '700',
    marginTop: 4,
  },
  progressBackground: {
    height: 10,
    backgroundColor: '#DCEADB',
    borderRadius: 10,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5F8F64',
    borderRadius: 10,
  },
  progressText: {
    color: '#5F8F64',
    fontWeight: '800',
    marginTop: 8,
  },
  nextButton: {
    backgroundColor: '#DCEADB',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 14,
  },
  nextButtonText: {
    color: '#5F8F64',
    fontWeight: '800',
  },
  removeExerciseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE1D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
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
  disabledButton: {
    opacity: 0.5,
  }
});