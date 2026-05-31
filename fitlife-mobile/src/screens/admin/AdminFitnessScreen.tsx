import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  deleteAdminFitnessWorkoutPlan,
  getAdminFitnessWorkoutPlans,
  updateAdminFitnessWorkoutPlan,
  type AdminFitnessWorkoutPlan,
} from '../../api/adminFitnessApi';

export function AdminFitnessScreen({
  onShowPopup,
  onHidePopup,
}: {
  onShowPopup: (content: ReactNode) => void;
  onHidePopup: () => void;
}) {
  const [plans, setPlans] = useState<AdminFitnessWorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getAdminFitnessWorkoutPlans();
      setPlans(data);
    } catch (error) {
      console.warn('Failed to load fitness plans', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPlans();
  }, []);

  const handleDeletePlan = async (id: number) => {
    Alert.alert(
      'Delete workout plan',
      'Are you sure you want to delete this workout plan?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAdminFitnessWorkoutPlan(id);

              onHidePopup();
              await loadPlans();
            } catch (error) {
              console.warn('Failed to delete workout plan', error);
            }
          },
        },
      ]
    );
  };

  const openEditModal = (plan: AdminFitnessWorkoutPlan) => {
    let name = plan.name;
    let description = plan.description;
    let level = plan.level;

    onShowPopup(
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 16 }}>
          <View style={styles.popupTopBar}>
            <Text style={styles.popupTitle}>Edit Workout Plan</Text>

            <Pressable onPress={onHidePopup}>
              <Ionicons name="close-circle-outline" size={26} color="#6b7a6b" />
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Plan Name</Text>

            <TextInput
              defaultValue={plan.name}
              onChangeText={(text) => (name = text)}
              style={styles.input}
              placeholder="Workout plan name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>

            <TextInput
              defaultValue={plan.description}
              onChangeText={(text) => (description = text)}
              style={[styles.input, styles.textArea]}
              multiline
              placeholder="Description"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Level</Text>

            <TextInput
              defaultValue={plan.level}
              onChangeText={(text) => (level = text)}
              style={styles.input}
              placeholder="Beginner"
            />
          </View>

          <Pressable
            style={styles.saveButton}
            onPress={async () => {
              try {
                await updateAdminFitnessWorkoutPlan(plan.id, {
                  name,
                  description,
                  level,
                });

                onHidePopup();
                await loadPlans();
              } catch (error) {
                console.warn('Failed to update workout plan', error);
              }
            }}
          >
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  const openPlanDetails = (plan: AdminFitnessWorkoutPlan) => {
    onShowPopup(
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 16 }}>
          <View style={styles.popupTopBar}>
            <Text style={styles.popupTitle}>Workout Plan Details</Text>
            <Pressable onPress={onHidePopup}>
              <Ionicons name="close-circle-outline" size={26} color="#6b7a6b" />
            </Pressable>
          </View>

          <View style={styles.modalHeader}>
            <Ionicons name="barbell-outline" size={42} color="#3d6b42" />
            <Text style={styles.modalName}>{plan.name}</Text>
            <Text style={styles.modalSub}>{plan.userName} · {plan.userEmail}</Text>
          </View>

          <View style={styles.detailGrid}>
            <DetailItem icon="speedometer-outline" label="Level" value={plan.level} />
            <DetailItem icon="fitness-outline" label="Exercises" value={String(plan.exercisesCount)} />
            <DetailItem icon="time-outline" label="Sessions" value={String(plan.sessionsCount)} />
            <DetailItem icon="calendar-outline" label="Created" value={new Date(plan.createdAt).toLocaleDateString()} />
          </View>

          <Text style={styles.sectionTitle}>Exercises</Text>

          {plan.exercises.length === 0 ? (
            <Text style={styles.emptyText}>No exercises in this plan.</Text>
          ) : (
            plan.exercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseItem}>
                <View style={styles.exerciseIcon}>
                  <Text style={styles.exerciseNumber}>{index + 1}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>

                  <Text style={styles.exerciseMeta}>
                    {exercise.bodyPart ?? 'Fitness'} · {exercise.targetMuscle ?? 'Target'}
                  </Text>

                  <Text style={styles.exerciseSets}>
                    {exercise.sets} sets x {exercise.reps} reps
                  </Text>
                </View>
              </View>
            ))
          )}

          <View style={styles.actionRow}>
            <Pressable
              style={styles.editButton}
              onPress={() => openEditModal(plan)}
            >
              <Ionicons name="create-outline" size={18} color="#3D6BFF" />
              <Text style={styles.editButtonText}>Edit Plan</Text>
            </Pressable>

            <Pressable
              style={styles.deleteButton}
              onPress={() => handleDeletePlan(plan.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#E14D4D" />
              <Text style={styles.deleteButtonText}>Delete Plan</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#3d6b42" style={{ marginTop: 60 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.list}>
      {plans.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="barbell-outline" size={42} color="#3d6b42" />
          <Text style={styles.emptyTitle}>No workout plans yet</Text>
          <Text style={styles.emptyText}>User-created workout plans will appear here.</Text>
        </View>
      ) : (
        plans.map((plan) => (
          <Pressable
            key={plan.id}
            style={({ pressed }) => [styles.planCard, pressed && { opacity: 0.85 }]}
            onPress={() => openPlanDetails(plan)}
          >
            <View style={styles.iconWrap}>
              <Ionicons name="barbell-outline" size={24} color="#3d6b42" />
            </View>

            <View style={styles.planInfo}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planUser}>{plan.userName}</Text>

              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{plan.level}</Text>
                </View>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{plan.exercisesCount} exercises</Text>
                </View>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{plan.sessionsCount} sessions</Text>
                </View>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#c8d5c8" />
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

function DetailItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Ionicons name={icon as any} size={16} color="#6b7a6b" />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10, paddingBottom: 20 },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5ebe5',
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8f5eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInfo: { flex: 1, gap: 4 },
  planName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#142210',
    textTransform: 'capitalize',
  },
  planUser: {
    fontSize: 12,
    color: '#6b7a6b',
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#e8f5eb',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#142210',
  },
  popupTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#142210',
  },
  modalHeader: {
    alignItems: 'center',
    gap: 6,
  },
  modalName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#142210',
    textTransform: 'capitalize',
  },
  modalSub: {
    fontSize: 13,
    color: '#6b7a6b',
    textAlign: 'center',
  },
  detailGrid: {
    gap: 10,
    backgroundColor: '#f4f7f4',
    borderRadius: 16,
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6b7a6b',
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#142210',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#142210',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f4f7f4',
    borderRadius: 14,
    padding: 12,
  },
  exerciseIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e8f5eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumber: {
    color: '#3d6b42',
    fontWeight: '800',
  },
  exerciseName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#142210',
    textTransform: 'capitalize',
  },
  exerciseMeta: {
    fontSize: 11,
    color: '#6b7a6b',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  exerciseSets: {
    fontSize: 11,
    color: '#3d6b42',
    fontWeight: '700',
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5ebe5',
  },
  emptyTitle: {
    color: '#142210',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#6b7a6b',
    textAlign: 'center',
    paddingVertical: 10,
  },
  actionRow: {
    gap: 12,
    marginTop: 10,
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#3D6BFF',
    borderRadius: 14,
    paddingVertical: 14,
  },

  editButtonText: {
    color: '#3D6BFF',
    fontWeight: '800',
  },

  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF1F1',
    borderWidth: 1,
    borderColor: '#E14D4D',
    borderRadius: 14,
    paddingVertical: 14,
  },

  deleteButtonText: {
    color: '#E14D4D',
    fontWeight: '800',
  },

  inputGroup: {
    gap: 8,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#142210',
  },

  input: {
    backgroundColor: '#F4F7F4',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: '#142210',
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3d6b42',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 6,
  },

  saveButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
});