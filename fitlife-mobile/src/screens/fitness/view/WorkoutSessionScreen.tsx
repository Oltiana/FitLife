import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FitnessStackParamList } from '../../../navigation/FitnessStack';
import { useWorkoutSessionViewModel } from '../viewmodels/useWorkoutSessionViewModel';
import { cancelUnfinishedWorkoutReminder, scheduleUnfinishedWorkoutReminder, } from '../../../utils/notifications';

type WorkoutSessionRouteProp = RouteProp<FitnessStackParamList, 'WorkoutSession'>;

export function WorkoutSessionScreen() {
  const route = useRoute<WorkoutSessionRouteProp>();
  const navigation = useNavigation<any>();
  const { workoutPlanId } = route.params;
  const {
    plan,
    loading,
    sessionStarted,
    statusMessage,
    currentExerciseIndex,
    editModalVisible,
    setEditModalVisible,
    selectedExercise,
    editSets,
    setEditSets,
    editReps,
    setEditReps,
    secondsLeft,
    isPaused,
    setIsPaused,
    currentSet,
    exercises,
    currentExercise,
    nextExercise,
    hasExercises,
    progress,
    handleStartWorkout,
    handleCompleteWorkout,
    handleNextExercise,
    handlePreviousExercise,
    handleSelectSet,
    handleRemoveExercise,
    openEditModal,
    handleUpdateExercise,
  } = useWorkoutSessionViewModel(workoutPlanId, navigation);

 const getExerciseImage = (bodyPart?: string) => {
  const part = bodyPart?.toLowerCase() ?? '';

  if (part.includes('chest')) {
    return require('../../../../assets/images/fitness-images/chest.jpg');
  }

  if (part.includes('back')) {
    return require('../../../../assets/images/fitness-images/back.jpg');
  }

  if (part.includes('legs') || part.includes('upper legs') || part.includes('lower legs')) {
    return require('../../../../assets/images/fitness-images/legs.jpg');
  }

  if (
    part.includes('arms') ||
    part.includes('upper arms') ||
    part.includes('lower arms') ||
    part.includes('shoulders')
  ) {
    return require('../../../../assets/images/fitness-images/arms.jpg');
  }

  if (part.includes('core') || part.includes('waist') || part.includes('abs')) {
    return require('../../../../assets/images/fitness-images/core.jpg');
  }

  return require('../../../../assets/images/fitness-images/chest.jpg');
};

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  if (!plan) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Workout plan not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2F3A34" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{plan.name}</Text>
          <Text style={styles.subtitle}>Exercise {hasExercises ? currentExerciseIndex + 1 : 0} of {exercises.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                <Text style={styles.activeMeta}>Set {currentSet} of {currentExercise.sets} · {currentExercise.reps} reps</Text>
              </View>
            </View>

            <Text style={styles.setsTitle}>SETS</Text>
            <View style={styles.setRow}>
              {Array.from({ length: currentExercise.sets ?? 1 }).map((_, index) => (
                <Pressable
                  key={index}
                  style={[styles.setCircle, currentSet === index + 1 && styles.setCircleActive]}
                  onPress={() => handleSelectSet(index + 1)}               >
                  <Text style={[styles.setCircleText, currentSet === index + 1 && styles.setCircleTextActive]}>{index + 1}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.controlRow}>
              <Pressable style={styles.smallControlButton} onPress={handlePreviousExercise}>
                <Ionicons name="refresh-outline" size={30} color="#9A9A9A" />
              </Pressable>
              <Pressable
                style={styles.pauseButton}
                onPress={async () => {
                  const nextPausedState = !isPaused;
                  setIsPaused(nextPausedState);

                  if (nextPausedState) {
                    await scheduleUnfinishedWorkoutReminder(plan.name);
                  } else {
                    await cancelUnfinishedWorkoutReminder();
                  }
                }}
              >
                <Ionicons name={isPaused ? 'play' : 'pause'} size={44} color="#fff" />
              </Pressable>
              <Pressable style={styles.nextControlButton} onPress={handleNextExercise}>
                <Ionicons name="chevron-forward" size={38} color="#2F3A34" />
              </Pressable>
            </View>

            {nextExercise ? (
              <View style={styles.nextExerciseCard}>
                <View style={styles.nextImageBox}>
                  <Image source={getExerciseImage(nextExercise.bodyPart)} style={styles.nextImage} />
                </View>
                <View>
                  <Text style={styles.nextLabel}>NEXT EXERCISE</Text>
                  <Text style={styles.nextTitle}>{nextExercise.exerciseName}: {nextExercise.sets} sets × {nextExercise.reps} reps</Text>
                </View>
              </View>
            ) : null}
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Exercises</Text>

        {exercises.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="barbell-outline" size={42} color="#2F3A34" />
            <Text style={styles.emptyTitle}>No exercises added yet</Text>
            <Text style={styles.emptyText}>Add exercises to this plan.</Text>
            <Pressable style={styles.addExercisesButton} onPress={() => navigation.navigate('ExerciseList')}>
              <Text style={styles.addExercisesButtonText}>Add Exercises</Text>
            </Pressable>
          </View>
        ) : (
          exercises.map((item: any, index: number) => (
            <View key={item.id ?? index} style={styles.exerciseCard}>
              <View style={styles.exerciseImageBox}>
                <Image source={getExerciseImage(item.bodyPart)} style={styles.exerciseImage} />
              </View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseName} numberOfLines={2}>{index + 1}. {item.exerciseName}</Text>
                <Text style={styles.exerciseMeta}>{item.bodyPart}: {item.sets} sets × {item.reps} reps</Text>
                <View style={styles.exerciseBadge}>
                  <Text style={styles.exerciseBadgeText}>{item.bodyPart ?? 'Fitness'}</Text>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <Pressable style={styles.editExerciseButton} onPress={() => openEditModal(item)}>
                  <Ionicons name="create-outline" size={20} color="#6e736f" />
                </Pressable>
                <Pressable style={styles.removeExerciseButton} onPress={(event) => { event.stopPropagation(); handleRemoveExercise(item.id); }}>
                  <Ionicons name="trash-outline" size={20} color="#E65C3A" />
                </Pressable>
              </View>
            </View>
          ))
        )}

        {statusMessage ? (
          <View style={styles.statusCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#2F3A34" />
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        ) : null}

        {!sessionStarted ? (
          <Pressable style={[styles.startButton, !hasExercises && styles.disabledButton]} onPress={handleStartWorkout} disabled={!hasExercises}>
            <Text style={styles.startButtonText}>{hasExercises ? 'Start Workout' : 'Add exercises to start'}</Text>
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
            <TextInput value={editSets} onChangeText={setEditSets} keyboardType="numeric" style={styles.input} />
            <Text style={styles.inputLabel}>Reps</Text>
            <TextInput value={editReps} onChangeText={setEditReps} keyboardType="numeric" style={styles.input} />
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
  container: {
    flex: 1,
    backgroundColor: '#F7F6F2',
  },

  center: {
    flex: 1,
    backgroundColor: '#F7F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { marginTop: 10, color: '#6d716e', fontWeight: '700' },
  errorText: { color: '#B00020', fontWeight: '800' },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E2D8',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F1EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerCenter: { flex: 1, alignItems: 'center', marginRight: 60 },
  title: {
    color: '#1F2420',
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: '#6F756E',
    marginTop: 4,
    fontWeight: '800',
  },
  content: { flex: 1 },
  scrollContent: { padding: 22, paddingBottom: 170 },
  timerCard: { backgroundColor: '#FFFFFF', borderRadius: 22, paddingVertical: 24, alignItems: 'center', marginBottom: 20 },
  timerText: {
    color: '#2F3A34',
    fontSize: 42,
    fontWeight: '900',
  },

  timerLabel: {
    color: '#6F756E',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },

  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: {
    color: '#1F2420',
    fontSize: 15,
    fontWeight: '900',
  },

  progressPercent: {
    color: '#1F2420',
    fontSize: 15,
    fontWeight: '900',
  },
  progressBackground: { height: 10, backgroundColor: '#DCEADB', borderRadius: 10, overflow: 'hidden', marginBottom: 22 },
  progressFill: {
    height: '100%',
    backgroundColor: '#2F3A34',
    borderRadius: 10,
  },
  currentExerciseCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#D8DED7', padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  currentAccent: {
    width: 28,
    height: 76,
    borderRadius: 14,
    backgroundColor: '#2F3A34',
    marginRight: 14,
  }, currentExerciseContent: { flex: 1 },
  activeLabel: { color: '#9A9A9A', fontSize: 12, fontWeight: '900' },
  activeTitle: {
    color: '#1F2420',
    fontSize: 19,
    fontWeight: '900',
    marginTop: 3,
    textTransform: 'capitalize',
  },
  activeMeta: {
    color: '#6F756E',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
  },
  setsTitle: { color: '#777', fontSize: 20, fontWeight: '900', marginBottom: 12 },
  setRow: { flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
  setCircle: { width: 48, height: 34, borderRadius: 17, borderWidth: 1, borderColor: '#B9B9B9', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  setCircleActive: {
    backgroundColor: '#2F3A34',
    borderColor: '#2F3A34',
  },
  setCircleText: { color: '#777', fontSize: 14, fontWeight: '900' },
  setCircleTextActive: { color: '#fff' },
  controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 26 },
  smallControlButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', borderWidth: 1, borderColor: '#D8DED7', alignItems: 'center', justifyContent: 'center' },
  pauseButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#2F3A34',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextControlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#DDE3DE',
    borderWidth: 1,
    borderColor: '#DDE3DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextExerciseCard: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#DCEADB', padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  nextImageBox: { width: 58, height: 46, borderRadius: 14, overflow: 'hidden', backgroundColor: '#DCEADB', marginRight: 12 },
  nextImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  nextLabel: { color: '#9A9A9A', fontSize: 11, fontWeight: '900' },
  nextTitle: { color: '#333', fontSize: 13, fontWeight: '900', marginTop: 2 },
  sectionTitle: {
    color: '#1F2420',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 14,
  }, emptyCard: { backgroundColor: '#fff', borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#E2E2E2' },
  emptyTitle: { color: '#6F756E', fontSize: 18, fontWeight: '800', marginTop: 12 },
  emptyText: { color: '#777', textAlign: 'center', marginTop: 6, fontWeight: '600' },
  exerciseCard: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#E2E2E2', padding: 12, marginBottom: 14, flexDirection: 'row', alignItems: 'center' },
  exerciseImageBox: { width: 76, height: 76, borderRadius: 16, overflow: 'hidden', backgroundColor: '#C9DEC9', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  exerciseImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  exerciseContent: { flex: 1 },
  exerciseName: { color: '#1F2420', fontSize: 16, fontWeight: '800', textTransform: 'capitalize' },
  exerciseMeta: { color: '#6F756E', fontSize: 13, fontWeight: '700', marginTop: 4, textTransform: 'capitalize' },
  exerciseBadge: {
    backgroundColor: '#DDE3DE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },

  exerciseBadgeText: {
    color: '#2F3A34',
    fontSize: 11,
    fontWeight: '800',
  },
  actionButtons: { flexDirection: 'row', gap: 8, marginLeft: 8 },
  editExerciseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E7ECE8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeExerciseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FBE4DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E6E2D8',
  },

  statusText: {
    color: '#1F2420',
    fontWeight: '800',
    flex: 1,
  },
  startButton: {
    backgroundColor: '#2F3A34',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 6,
  },
  completeButton: {
    backgroundColor: '#2F3A34',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 6,
  },
  startButtonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  disabledButton: { opacity: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  modalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 22, padding: 20 },
  modalTitle: { color: '#1F2420', fontSize: 22, fontWeight: '800' },
  modalSubtitle: { color: '#777', fontWeight: '700', marginTop: 6, marginBottom: 18, textTransform: 'capitalize' },
  inputLabel: { color: '#2F3A34', fontWeight: '800', marginBottom: 6 },
  input: { backgroundColor: '#F1F4F0', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14, fontWeight: '700', color: '#333' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelButton: { flex: 1, backgroundColor: '#E8E8E8', paddingVertical: 13, borderRadius: 16, alignItems: 'center' },
  cancelButtonText: { color: '#555', fontWeight: '800' },
  saveButton: { flex: 1, backgroundColor: '#2F3A34', paddingVertical: 13, borderRadius: 16, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: '800' },
  addExercisesButton: { backgroundColor: '#9BA19A', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 18, marginTop: 16 },
  addExercisesButtonText: { color: '#fff', fontWeight: '900' },
});