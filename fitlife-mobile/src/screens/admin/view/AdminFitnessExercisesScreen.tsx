import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  createAdminFitnessExercise,
  deleteAdminFitnessExercise,
  getAdminFitnessExercises,
  updateAdminFitnessExercise,
  type AdminFitnessExerciseLibraryItem,
} from '../../../api/adminFitnessApi';

const BODY_PARTS = ['Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Waist'];
const TARGET_MUSCLES = ['Pectorals', 'Lats', 'Quads', 'Biceps', 'Triceps', 'Abs', 'Glutes'];
const EQUIPMENT_OPTIONS = ['Bodyweight', 'Dumbbell', 'Barbell', 'Cable', 'Machine', 'None'];
const LEVELS = ['Beginner', 'Intermediate'];

export function AdminFitnessExercisesScreen() {
  const [exercises, setExercises] = useState<AdminFitnessExerciseLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<AdminFitnessExerciseLibraryItem | null>(null);
  const [editingExercise, setEditingExercise] = useState<AdminFitnessExerciseLibraryItem | null>(null);

  const [exerciseName, setExerciseName] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [targetMuscle, setTargetMuscle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [level, setLevel] = useState('');
  const [gifUrl, setGifUrl] = useState('');

  const [openSelect, setOpenSelect] = useState<string | null>(null);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await getAdminFitnessExercises();
      setExercises(data);
    } catch (error) {
      console.warn('Failed to load fitness exercises', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadExercises();
  }, []);

  const resetForm = () => {
    setEditingExercise(null);
    setExerciseName('');
    setBodyPart('');
    setTargetMuscle('');
    setEquipment('');
    setLevel('');
    setGifUrl('');
    setOpenSelect(null);
    setFormVisible(false);
  };

  const openAdd = () => {
    resetForm();
    setFormVisible(true);
  };

  const openDetails = (exercise: AdminFitnessExerciseLibraryItem) => {
    setSelectedExercise(exercise);
    setDetailsVisible(true);
  };

  const openEdit = (exercise: AdminFitnessExerciseLibraryItem) => {
    setDetailsVisible(false);
    setEditingExercise(exercise);
    setExerciseName(exercise.exerciseName);
    setBodyPart(exercise.bodyPart ?? '');
    setTargetMuscle(exercise.targetMuscle ?? '');
    setEquipment(exercise.equipment ?? '');
    setLevel(exercise.level ?? '');
    setGifUrl(exercise.gifUrl ?? '');
    setFormVisible(true);
  };

  const handleSave = async () => {
    if (!exerciseName.trim()) {
      Alert.alert('Validation', 'Exercise name is required.');
      return;
    }

    if (!bodyPart || !targetMuscle || !equipment || !level) {
      Alert.alert('Validation', 'Please select body part, target muscle, equipment and level.');
      return;
    }

    const payload = {
      exerciseName: exerciseName.trim(),
      bodyPart,
      targetMuscle,
      equipment,
      level,
      gifUrl: gifUrl.trim() || null,
    };

    try {
      if (editingExercise) {
        await updateAdminFitnessExercise(editingExercise.id, payload);
      } else {
        await createAdminFitnessExercise(payload);
      }

      resetForm();
      await loadExercises();
    } catch {
      Alert.alert('Error', 'Could not save exercise.');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Exercise', 'Are you sure you want to delete this exercise?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAdminFitnessExercise(id);
            setDetailsVisible(false);
            await loadExercises();
          } catch {
            Alert.alert('Error', 'Could not delete exercise.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#2F3A34" style={{ marginTop: 60 }} />;
  }

  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.addButton} onPress={openAdd}>
        <Ionicons name="add-circle-outline" size={28} color="#2F3A34" />
        <View>
          <Text style={styles.addButtonText}>Add Exercise</Text>
          <Text style={styles.addButtonSub}>Add new exercise to library</Text>
        </View>
      </Pressable>

      <Text style={styles.sectionTitle}>Exercise Library</Text>

      {exercises.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="barbell-outline" size={36} color="#2F3A34" />
          <Text style={styles.emptyTitle}>No exercises yet</Text>
          <Text style={styles.emptyText}>Add exercises so users can see them in Fitness Library.</Text>
        </View>
      ) : (
        exercises.map((exercise) => (
          <Pressable key={exercise.id} style={styles.exerciseCard} onPress={() => openDetails(exercise)}>
            <View style={styles.iconWrap}>
              <Ionicons name="barbell-outline" size={22} color="#2F3A34" />
            </View>

            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
              <Text style={styles.exerciseMeta}>
                {exercise.bodyPart ?? 'Fitness'} · {exercise.targetMuscle ?? 'Target'}
              </Text>

              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{exercise.level}</Text>
                </View>

                {exercise.equipment ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{exercise.equipment}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#AFC2B2" />
          </Pressable>
        ))
      )}

      <Modal visible={formVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.formModal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingExercise ? 'Edit Exercise' : 'Add Exercise'}</Text>

                <Pressable onPress={resetForm} style={styles.closeButton}>
                  <Ionicons name="close" size={22} color="#2F3A34" />
                </Pressable>
              </View>

              <Text style={styles.label}>Exercise Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter exercise name"
                placeholderTextColor="#9A9A9A"
                value={exerciseName}
                onChangeText={setExerciseName}
              />

              <SelectField
                label="Body Part"
                icon="body-outline"
                placeholder="Select body part"
                value={bodyPart}
                options={BODY_PARTS}
                isOpen={openSelect === 'bodyPart'}
                onToggle={() => setOpenSelect(openSelect === 'bodyPart' ? null : 'bodyPart')}
                onSelect={(value) => {
                  setBodyPart(value);
                  setOpenSelect(null);
                }}
              />

              <SelectField
                label="Target Muscle"
                icon="accessibility-outline"
                placeholder="Select target muscle"
                value={targetMuscle}
                options={TARGET_MUSCLES}
                isOpen={openSelect === 'targetMuscle'}
                onToggle={() => setOpenSelect(openSelect === 'targetMuscle' ? null : 'targetMuscle')}
                onSelect={(value) => {
                  setTargetMuscle(value);
                  setOpenSelect(null);
                }}
              />

              <SelectField
                label="Equipment"
                icon="barbell-outline"
                placeholder="Select equipment"
                value={equipment}
                options={EQUIPMENT_OPTIONS}
                isOpen={openSelect === 'equipment'}
                onToggle={() => setOpenSelect(openSelect === 'equipment' ? null : 'equipment')}
                onSelect={(value) => {
                  setEquipment(value);
                  setOpenSelect(null);
                }}
              />

              <SelectField
                label="Level"
                icon="speedometer-outline"
                placeholder="Select level"
                value={level}
                options={LEVELS}
                isOpen={openSelect === 'level'}
                onToggle={() => setOpenSelect(openSelect === 'level' ? null : 'level')}
                onSelect={(value) => {
                  setLevel(value);
                  setOpenSelect(null);
                }}
              />

              <Text style={styles.label}>GIF / Image URL Optional</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/animation.gif"
                placeholderTextColor="#9A9A9A"
                value={gifUrl}
                onChangeText={setGifUrl}
              />

              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Ionicons name="save-outline" size={18} color="#426B46" />
                <Text style={styles.saveButtonText}>Save Exercise</Text>
              </Pressable>

              <Pressable style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={detailsVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Exercise Details</Text>

              <Pressable onPress={() => setDetailsVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={22} color="#2F3A34" />
              </Pressable>
            </View>

            {selectedExercise && (
              <>
                <View style={styles.detailsCenter}>
                  <View style={styles.detailsIcon}>
                    <Ionicons name="barbell-outline" size={34} color="#5E7E62" />
                  </View>

                  <Text style={styles.detailsName}>{selectedExercise.exerciseName}</Text>
                  <Text style={styles.detailsMeta}>
                    {selectedExercise.bodyPart} · {selectedExercise.targetMuscle}
                  </Text>
                </View>

                <View style={styles.detailsInfoBox}>
                  <InfoRow label="Body Part" value={selectedExercise.bodyPart ?? '-'} />
                  <InfoRow label="Target" value={selectedExercise.targetMuscle ?? '-'} />
                  <InfoRow label="Equipment" value={selectedExercise.equipment ?? '-'} />
                  <InfoRow label="Level" value={selectedExercise.level ?? '-'} />
                </View>

                <Pressable style={styles.editFullButton} onPress={() => openEdit(selectedExercise)}>
                  <Ionicons name="create-outline" size={20} color="#3D6BFF" />
                  <Text style={styles.editFullText}>Edit Exercise</Text>
                </Pressable>

                <Pressable style={styles.deleteFullButton} onPress={() => handleDelete(selectedExercise.id)}>
                  <Ionicons name="trash-outline" size={20} color="#E14D4D" />
                  <Text style={styles.deleteFullText}>Delete Exercise</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SelectField({
  label,
  icon,
  placeholder,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}: {
  label: string;
  icon: string;
  placeholder: string;
  value: string;
  options: string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.selectBlock}>
      <Text style={styles.label}>{label}</Text>

      <Pressable style={styles.selectBox} onPress={onToggle}>
        <Ionicons name={icon as any} size={20} color="#5E7E62" />
        <Text style={[styles.selectText, !value && styles.selectPlaceholder]}>
          {value || placeholder}
        </Text>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#5E7E62" />
      </Pressable>

      {isOpen && (
        <View style={styles.dropdown}>
          {options.map((item) => (
            <Pressable key={item} style={styles.dropdownItem} onPress={() => onSelect(item)}>
              <Text style={styles.dropdownText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 16 },

addButton: {
  backgroundColor: '#E8F5EB',
  borderRadius: 18,
  padding: 18,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  borderWidth: 1,
  borderColor: '#D6E8D9',
},
  addButtonText: { color: '#426B46', fontSize: 17, fontWeight: '900' },
  addButtonSub: { color: '#6F756E', fontSize: 13, fontWeight: '700', marginTop: 2 },

  sectionTitle: { color: '#5E7E62', fontSize: 20, fontWeight: '900' },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E2D8',
  },
  emptyTitle: { color: '#1F2420', fontWeight: '900', fontSize: 16, marginTop: 8 },
  emptyText: { color: '#6F756E', textAlign: 'center', marginTop: 6 },
exerciseCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 18,
  padding: 14,
  borderWidth: 1,
  borderColor: '#D6E8D9',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
},
iconWrap: {
  width: 52,
  height: 52,
  borderRadius: 26,
  backgroundColor: '#E8F5EB',
  alignItems: 'center',
  justifyContent: 'center',
},
  exerciseInfo: { flex: 1 },
  exerciseName: {
    color: '#475048',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  exerciseMeta: {
    color: '#6F756E',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
    textTransform: 'capitalize',
  },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
badge: {
  backgroundColor: '#E8F5EB',
  borderRadius: 999,
  paddingHorizontal: 10,
  paddingVertical: 4,
},
  badgeText: { color: '#5a6e63', fontSize: 11, fontWeight: '800' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'center',
    padding: 20,
  },
  formModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    maxHeight: '92%',
  },
  detailsModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalTitle: { color: '#718675', fontSize: 22, fontWeight: '900' },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F2F4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    color: '#1F2420',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E2D8',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#5E7E62',
    fontWeight: '700',
    marginBottom: 16,
  },

  selectBlock: { marginBottom: 16 },
  selectBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E2D8',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectText: { flex: 1, color: '#5E7E62', fontWeight: '800' },
  selectPlaceholder: { color: '#9A9A9A' },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E2D8',
    borderRadius: 16,
    marginTop: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EEE8',
  },
  dropdownText: { color: '#5E7E62', fontWeight: '800' },

  saveButton: {
    backgroundColor: '#bbc6bb',
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  saveButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },

  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E2D8',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelText: { color: '#5E7E62', fontWeight: '900' },

  detailsCenter: { alignItems: 'center', marginBottom: 18 },
  detailsIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DDE3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  detailsName: {
    color: '#5E7E62',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  detailsMeta: {
    color: '#6F756E',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  detailsInfoBox: {
    backgroundColor: '#F2F6F1',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    gap: 10,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: '#6F756E', fontWeight: '800' },
  infoValue: { color: '#1F2420', fontWeight: '900' },

  editFullButton: {
    borderWidth: 1,
    borderColor: '#3D6BFF',
    backgroundColor: '#EEF4FF',
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  editFullText: { color: '#3D6BFF', fontWeight: '900', fontSize: 15 },

  deleteFullButton: {
    borderWidth: 1,
    borderColor: '#E14D4D',
    backgroundColor: '#FFF0F0',
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  deleteFullText: { color: '#E14D4D', fontWeight: '900', fontSize: 15 },
});