import { useNavigation } from '@react-navigation/native';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCreateWorkoutPlanViewModel } from '../viewmodels/useCreateWorkoutPlanViewModel';

export function CreateWorkoutPlanScreen() {
  const navigation = useNavigation<any>();

  const {
    name,
    setName,
    description,
    setDescription,
    level,
    setLevel,
    saving,
    handleCreate,
  } = useCreateWorkoutPlanViewModel(() => navigation.goBack());

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#2F3A34" />
            </Pressable>
            <Text style={styles.title}>Create Plan</Text>
            <Text style={styles.subtitle}>Build your own workout routine</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.label}>Plan Name</Text>
            <TextInput style={styles.input} placeholder="Example: Abs Workout" value={name} onChangeText={setName} />
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Short description..." value={description} onChangeText={setDescription} multiline />
            <Text style={styles.label}>Level</Text>
            <View style={styles.levelRow}>
              {(['Beginner', 'Intermediate'] as const).map((item) => (
                <Pressable key={item} onPress={() => setLevel(item)} style={[styles.levelChip, level === item && styles.levelChipActive]}>
                  <Text style={[styles.levelText, level === item && styles.levelTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.button} onPress={handleCreate} disabled={saving}>
              <Text style={styles.buttonText}>{saving ? 'Creating...' : 'Create Workout Plan'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F2',
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E2D8',
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

  title: {
    color: '#1F2420',
    fontSize: 24,
    fontWeight: '800',
  },

  subtitle: {
    color: '#6F756E',
    marginTop: 6,
    fontWeight: '700',
  },
  content: { padding: 22 },
  label: {
    color: '#2F3A34',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E2D8',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1F2420',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  levelRow: { flexDirection: 'row', gap: 12 },
  levelChip: {
    flex: 1,
    backgroundColor: '#ECEAE3',
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
  },

  levelChipActive: {
    backgroundColor: '#2F3A34',
  },

  levelText: {
    color: '#6F756E',
    fontWeight: '800',
  },

  levelTextActive: {
    color: '#FFFFFF',
  },

  button: {
    marginTop: 28,
    backgroundColor: '#2F3A34',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});