import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FitnessStackParamList } from '../../navigation/FitnessStack';

type ExerciseDetailsRouteProp = RouteProp<FitnessStackParamList, 'ExerciseDetails'>;

export function ExerciseDetailScreen() {
  const route = useRoute<ExerciseDetailsRouteProp>();
  const { exercise } = route.params;
  const navigation = useNavigation<any>();
  const exerciseName = exercise?.exerciseName || exercise?.name;
  const targetMuscle = exercise?.targetMuscle || exercise?.target;

  const getFitnessExerciseIcon = (bodyPart?: string) => {
    const part = bodyPart?.toLowerCase() ?? '';

    if (part.includes('waist')) return 'body-outline';
    if (part.includes('chest')) return 'barbell-outline';
    if (part.includes('back')) return 'add-circle-outline';
    if (part.includes('upper legs') || part.includes('lower legs')) return 'walk-outline';
    if (part.includes('upper arms') || part.includes('lower arms')) return 'barbell-outline';

    return 'fitness-outline';
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
          <Text style={styles.value}>{targetMuscle ?? 'Not specified'}</Text>

          <View style={styles.infoCard}>
            <Text style={styles.label}>Body Part</Text>
            <Text style={styles.value}>{exercise?.bodyPart ?? 'Not specified'}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.label}>Target Muscle</Text>
            <Text style={styles.value}>{exercise?.target ?? 'Not specified'}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.label}>Equipment</Text>
            <Text style={styles.value}>{exercise?.equipment ?? 'Not specified'}</Text>
          </View>

          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Add to Workout Plan</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },
  header: {
    backgroundColor: '#86B587',
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#F1FFF2',
    marginTop: 6,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  content: {
    padding: 22,
    alignItems: 'center',
  },
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
  image: {
    width: '100%',
    height: '100%',
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
  label: {
    color: '#7FAE83',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
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
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
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
});