import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FitnessStackParamList } from '../../../navigation/FitnessStack';
import { useExerciseDetailViewModel } from '../viewmodels/useExerciseDetailViewModel';

type ExerciseDetailsRouteProp = RouteProp<FitnessStackParamList, 'ExerciseDetails'>;

export function ExerciseDetailScreen() {
  const route = useRoute<ExerciseDetailsRouteProp>();
  const { exercise } = route.params;
  const navigation = useNavigation<any>();

  const {
    exerciseName,
    targetMuscle,
    plans,
    selectedPlanId,
    setSelectedPlanId,
    sets,
    setSets,
    reps,
    setReps,
    showModal,
    setShowModal,
    saving,
    favoriteMessage,
    handleAddToPlan,
    handleAddFavorite,
    handleCreateNewPlan,
  } = useExerciseDetailViewModel(exercise, navigation);


  const getFitnessExerciseIcon = (bodyPart?: string) => {
    const part = bodyPart?.toLowerCase() ?? '';
    if (part.includes('waist')) return 'body-outline';
    if (part.includes('chest')) return 'barbell-outline';
    if (part.includes('back')) return 'add-circle-outline';
    if (part.includes('upper legs') || part.includes('lower legs')) return 'walk-outline';
    if (part.includes('upper arms') || part.includes('lower arms')) return 'barbell-outline';
    return 'fitness-outline';
  };



 const getExerciseImage = (bodyPart?: string) => {
  const part = bodyPart?.toLowerCase() ?? '';

  if (part.includes('chest')) return require('../../../../assets/images/fitness-images/chest.jpg');
  if (part.includes('back')) return require('../../../../assets/images/fitness-images/back.jpg');

  if (part.includes('legs') || part.includes('upper legs') || part.includes('lower legs')) {
    return require('../../../../assets/images/fitness-images/legs.jpg');
  }

  if (part.includes('arms') || part.includes('upper arms') || part.includes('lower arms') || part.includes('shoulders')) {
    return require('../../../../assets/images/fitness-images/arms.jpg');
  }

  if (part.includes('core') || part.includes('waist') || part.includes('abs')) {
    return require('../../../../assets/images/fitness-images/core.jpg');
  }

  return require('../../../../assets/images/fitness-images/chest.jpg');
};

  const iconName = getFitnessExerciseIcon(exercise?.bodyPart);
  const imageSource = getExerciseImage(exercise?.bodyPart);



  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#2F3A34" />
          </Pressable>
          <Text style={styles.title}>Exercise Details</Text>
          <Text style={styles.subtitle}>{exercise?.bodyPart ?? 'Fitness exercise'}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.imageBox}>
            {imageSource ? (
              <Image source={imageSource} style={styles.heroImage} />
            ) : (
              <Ionicons name={iconName as any} size={90} color="#2F3A34" />
            )}
          </View>

          <Text style={styles.name}>{exerciseName ?? 'Exercise'}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Intermediate</Text>
            </View>
            <View style={styles.bodyBadge}>
              <Text style={styles.bodyText}>{exercise?.bodyPart ?? 'Fitness'}</Text>
            </View>
          </View>

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

          {favoriteMessage ? <Text style={styles.favoriteMessage}>{favoriteMessage}</Text> : null}

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
                  <View style={styles.emptyPlanBox}>
                    <Ionicons name="barbell-outline" size={34} color="#2F3A34" />
                    <Text style={styles.emptyPlanTitle}>No workout plans yet</Text>
                    <Text style={styles.emptyPlanText}>Create a workout plan first, then add this exercise to it.</Text>
                    <Pressable style={styles.createPlanButton} onPress={handleCreateNewPlan}>
                      <Text style={styles.createPlanButtonText}>Create Workout Plan</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    {plans.map((plan) => (
                      <Pressable
                        key={plan.id}
                        style={[styles.planOption, selectedPlanId === plan.id && styles.planOptionActive]}
                        onPress={() => setSelectedPlanId(plan.id)}
                      >
                        <Text style={[styles.planOptionText, selectedPlanId === plan.id && styles.planOptionTextActive]}>
                          {plan.name}
                        </Text>
                      </Pressable>
                    ))}

                    <Pressable style={styles.createNewPlanOption} onPress={handleCreateNewPlan}>
                      <Ionicons name="add-circle-outline" size={22} color="#2F3A34" />
                      <Text style={styles.createNewPlanOptionText}>Create New Workout Plan</Text>
                    </Pressable>
                  </>
                )}

                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Sets</Text>
                    <TextInput style={styles.input} keyboardType="number-pad" value={sets} onChangeText={setSets} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Reps</Text>
                    <TextInput style={styles.input} keyboardType="number-pad" value={reps} onChangeText={setReps} />
                  </View>
                </View>

                <Pressable
                  style={[styles.modalButton, plans.length === 0 && styles.disabledButton]}
                  onPress={handleAddToPlan}
                  disabled={saving || plans.length === 0}
                >
                  <Text style={styles.modalButtonText}>{saving ? 'Adding...' : 'Add Exercise'}</Text>
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
  container: { flex: 1, backgroundColor: '#F7F6F2' },

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E2D8',
  },

  title: { color: '#1F2420', fontSize: 24, fontWeight: '800' },

  subtitle: {
    color: '#6F756E',
    marginTop: 6,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  content: { padding: 22, alignItems: 'center' },

  imageBox: {
    width: '100%',
    height: 240,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 22,
    backgroundColor: '#DDE3DE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2420',
    textAlign: 'center',
    textTransform: 'capitalize',
    marginBottom: 20,
  },

  infoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6E2D8',
  },

  label: {
    color: '#6F756E',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },

  value: {
    color: '#1F2420',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  button: {
    width: '100%',
    backgroundColor: '#2F3A34',
    paddingVertical: 15,
    borderRadius: 20,
    marginTop: 14,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F1EC',
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
    backgroundColor: '#F7F6F2',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
  },

  modalTitle: {
    color: '#1F2420',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 16,
  },

  emptyText: {
    color: '#6F756E',
    fontWeight: '600',
    marginBottom: 14,
  },

  planOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E2D8',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  planOptionActive: {
    backgroundColor: '#2F3A34',
    borderColor: '#2F3A34',
  },

  planOptionText: {
    color: '#1F2420',
    fontWeight: '800',
  },

  planOptionTextActive: {
    color: '#FFFFFF',
  },

  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },

  inputGroup: { flex: 1 },

  inputLabel: {
    color: '#6F756E',
    fontWeight: '800',
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E2D8',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2420',
  },

  modalButton: {
    backgroundColor: '#2F3A34',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
  },

  disabledButton: { opacity: 0.5 },

  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },

  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },

  cancelText: {
    color: '#6F756E',
    fontWeight: '800',
  },

  favoriteButtonText: {
    color: '#2F3A34',
    fontWeight: '800',
    fontSize: 15,
  },

  favoriteMessage: {
    color: '#2F3A34',
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },

  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },

  levelBadge: {
    backgroundColor: '#DDE3DE',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },

  levelText: {
    color: '#2F3A34',
    fontSize: 12,
    fontWeight: '800',
  },

  bodyBadge: {
    backgroundColor: '#ECEAE3',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },

  bodyText: {
    color: '#4D5B52',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
  },

  emptyPlanBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6E2D8',
  },

  emptyPlanTitle: {
    color: '#1F2420',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 10,
  },

  emptyPlanText: {
    color: '#6F756E',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },

  createPlanButton: {
    backgroundColor: '#2F3A34',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    marginTop: 14,
  },

  createPlanButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  createNewPlanOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#8E978F',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  createNewPlanOptionText: {
    color: '#2F3A34',
    fontWeight: '900',
  },
});