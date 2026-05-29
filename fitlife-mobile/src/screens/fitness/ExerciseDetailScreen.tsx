import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FitnessStackParamList } from '../../navigation/FitnessStack';
import { addExerciseToWorkoutPlan, getWorkoutPlans, addFavoriteExercise, } from '../../api/fitnessApi';

type ExerciseDetailsRouteProp = RouteProp<FitnessStackParamList, 'ExerciseDetails'>;

export function ExerciseDetailScreen() {
  const route = useRoute<ExerciseDetailsRouteProp>();
  const { exercise } = route.params;
  const navigation = useNavigation<any>();

  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const exerciseName = exercise?.exerciseName || exercise?.name;
  const targetMuscle = exercise?.targetMuscle || exercise?.target;
  const exerciseId = exercise?.externalExerciseId || exercise?.id;
  const [favoriteMessage, setFavoriteMessage] = useState('');
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await getWorkoutPlans();
      setPlans(data);
    } catch (error) {
      console.log('Failed to load workout plans', error);
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

  const handleAddToPlan = async () => {
    if (!selectedPlanId) {
      Alert.alert('Select plan', 'Please select a workout plan first.');
      return;
    }

    try {
      setSaving(true);

      await addExerciseToWorkoutPlan(selectedPlanId, {
        externalExerciseId: exerciseId?.toString() ?? '',
        exerciseName: exerciseName ?? 'Exercise',
        bodyPart: exercise?.bodyPart,
        targetMuscle: targetMuscle,
        gifUrl: exercise?.gifUrl ?? null,
        sets: Number(sets),
        reps: Number(reps),
        orderIndex: 1,
      });

      setShowModal(false);
      Alert.alert('Success', 'Exercise added to workout plan.');
    } catch (error) {
      Alert.alert('Error', 'Could not add exercise to workout plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFavorite = async () => {
    try {
      await addFavoriteExercise({
        externalExerciseId: exerciseId?.toString() ?? '',
        exerciseName: exerciseName ?? 'Exercise',
        bodyPart: exercise?.bodyPart,
        targetMuscle: targetMuscle,
        equipment: exercise?.equipment,
        gifUrl: exercise?.gifUrl ?? null,
      });

      setFavoriteMessage('Exercise added to favorites.');
    } catch (error) {
      setFavoriteMessage('Could not add exercise to favorites.');
    }
  };

  const iconName = getFitnessExerciseIcon(exercise?.bodyPart);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.title}>Exercise Details</Text>
          <Text style={styles.subtitle}>{exercise?.bodyPart ?? 'Fitness exercise'}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.imageBox}>
            <Ionicons name={iconName as any} size={90} color="#5F8F64" />
          </View>

          <Text style={styles.name}>{exerciseName ?? 'Exercise'}</Text>

          <View style={styles.infoCard}>
            <Text style={styles.label}>Body Part</Text>
            <Text style={styles.value}>{exercise?.bodyPart ?? 'Not specified'}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.label}>Target Muscle</Text>
            <Text style={styles.value}>{targetMuscle ?? 'Not specified'}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.label}>Equipment</Text>
            <Text style={styles.value}>{exercise?.equipment ?? 'Not specified'}</Text>
          </View>

          <Pressable style={styles.favoriteButton} onPress={handleAddFavorite}>
            <Ionicons name="heart-outline" size={20} color="#5F8F64" />
            <Text style={styles.favoriteButtonText}>Add to Favorites</Text>
          </Pressable>

          {favoriteMessage ? (
            <Text style={styles.favoriteMessage}>{favoriteMessage}</Text>
          ) : null}

          <Pressable style={styles.button} onPress={() => setShowModal(true)}>
            <Text style={styles.buttonText}>Add Exercise to Plan</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Add Exercise to Plan</Text>

                {plans.length === 0 ? (
                  <Text style={styles.emptyText}>
                    You do not have any workout plans yet. Create one first.
                  </Text>
                ) : (
                  plans.map((plan) => (
                    <Pressable
                      key={plan.id}
                      style={[
                        styles.planOption,
                        selectedPlanId === plan.id && styles.planOptionActive,
                      ]}
                      onPress={() => setSelectedPlanId(plan.id)}
                    >
                      <Text
                        style={[
                          styles.planOptionText,
                          selectedPlanId === plan.id && styles.planOptionTextActive,
                        ]}
                      >
                        {plan.name}
                      </Text>
                    </Pressable>
                  ))
                )}

                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Sets</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      value={sets}
                      onChangeText={setSets}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Reps</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      value={reps}
                      onChangeText={setReps}
                    />
                  </View>
                </View>

                <Pressable
                  style={[styles.modalButton, plans.length === 0 && styles.disabledButton]}
                  onPress={handleAddToPlan}
                  disabled={saving || plans.length === 0}
                >
                  <Text style={styles.modalButtonText}>
                    {saving ? 'Adding...' : 'Add Exercise'}
                  </Text>
                </Pressable>

                <Pressable style={styles.cancelButton} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF7' },
  header: {
    backgroundColor: '#86B587',
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 24,
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  subtitle: {
    color: '#F1FFF2',
    marginTop: 6,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  content: { padding: 22, alignItems: 'center' },
  imageBox: {
    width: '100%',
    height: 260,
    borderRadius: 24,
    backgroundColor: '#C9DEC9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    overflow: 'hidden',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#5F8F64',
    textAlign: 'center',
    textTransform: 'capitalize',
    marginBottom: 20,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  label: { color: '#7FAE83', fontSize: 13, fontWeight: '800', marginBottom: 4 },
  value: {
    color: '#333',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  button: {
    width: '100%',
    backgroundColor: '#86B587',
    paddingVertical: 15,
    borderRadius: 20,
    marginTop: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#F8FAF7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
  },
  modalTitle: {
    color: '#5F8F64',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 16,
  },
  emptyText: {
    color: '#777',
    fontWeight: '600',
    marginBottom: 14,
  },
  planOption: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  planOptionActive: {
    backgroundColor: '#86B587',
    borderColor: '#86B587',
  },
  planOptionText: {
    color: '#5F8F64',
    fontWeight: '800',
  },
  planOptionTextActive: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    color: '#5F8F64',
    fontWeight: '800',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#86B587',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelText: {
    color: '#777',
    fontWeight: '800',
  },
  favoriteButton: {
    width: '100%',
    backgroundColor: '#DCEADB',
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  favoriteButtonText: {
    color: '#5F8F64',
    fontWeight: '800',
    fontSize: 15,
  },
  favoriteMessage: {
    color: '#5F8F64',
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
});