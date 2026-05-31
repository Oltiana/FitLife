import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createWorkoutPlan } from '../../api/fitnessApi';

export function CreateWorkoutPlanScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate'>('Beginner');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter workout plan name.');
      return;
    }

    try {
      setSaving(true);

      await createWorkoutPlan({
        name,
        description,
        level,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Could not create workout plan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>

            <Text style={styles.title}>Create Plan</Text>
            <Text style={styles.subtitle}>Build your own workout routine</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Plan Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Example: Abs Workout"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Short description..."
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.label}>Level</Text>
            <View style={styles.levelRow}>
              {(['Beginner', 'Intermediate'] as const).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setLevel(item)}
                  style={[styles.levelChip, level === item && styles.levelChipActive]}
                >
                  <Text style={[styles.levelText, level === item && styles.levelTextActive]}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.button} onPress={handleCreate} disabled={saving}>
              <Text style={styles.buttonText}>
                {saving ? 'Creating...' : 'Create Workout Plan'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#F1FFF2', marginTop: 6, fontWeight: '700' },
  content: { padding: 22 },
  label: {
    color: '#5F8F64',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  levelRow: {
    flexDirection: 'row',
    gap: 12,
  },
  levelChip: {
    flex: 1,
    backgroundColor: '#D9D9D9',
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
  },
  levelChipActive: {
    backgroundColor: '#86B587',
  },
  levelText: {
    color: '#6F9B73',
    fontWeight: '800',
  },
  levelTextActive: {
    color: '#fff',
  },
  button: {
    marginTop: 28,
    backgroundColor: '#86B587',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});