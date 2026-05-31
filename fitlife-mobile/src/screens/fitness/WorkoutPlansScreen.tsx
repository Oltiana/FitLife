import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { deleteWorkoutPlan, getWorkoutPlans } from '../../api/fitnessApi';
import { Alert } from 'react-native';

export function WorkoutPlansScreen() {
  const navigation = useNavigation<any>();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getWorkoutPlans();
      setPlans(data);
    } catch (error) {
      console.log('Failed to load workout plans', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [])
  );

  const handleDeletePlan = (id: number) => {
    Alert.alert(
      'Delete Workout Plan',
      'Are you sure you want to delete this workout plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkoutPlan(id);
              loadPlans();
            } catch (error) {
              console.log('Failed to delete workout plan', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View>
          <Text style={styles.title}>Workout Plans</Text>
          <Text style={styles.subtitle}>Create and manage your fitness routines</Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateWorkoutPlan')}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7FAE83" />
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="barbell-outline" size={42} color="#86B587" />
              <Text style={styles.emptyTitle}>No workout plans yet</Text>
              <Text style={styles.emptyText}>Tap the plus button to create your first plan.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                navigation.navigate('WorkoutSession', {
                  workoutPlanId: item.id,
                })
              }
            >
              <View style={styles.iconBox}>
                <Ionicons name="fitness-outline" size={34} color="#5F8F64" />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.planName}>{item.name}</Text>
                <Text style={styles.planDescription}>
                  {item.description || 'No description'}
                </Text>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.level ?? 'Beginner'}</Text>
                </View>
              </View>

              <Pressable
                style={styles.deleteButton}
                onPress={() => handleDeletePlan(item.id)}
              >
                <Ionicons name="trash-outline" size={21} color="#D47A45" />
              </Pressable>

              <Ionicons name="chevron-forward" size={22} color="#B7B7B7" />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF7' },
  header: {
    backgroundColor: '#86B587',
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#F1FFF2', fontSize: 13, fontWeight: '700', marginTop: 4 },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#5F8F64',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 22, paddingBottom: 120 },
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 78,
    height: 78,
    borderRadius: 16,
    backgroundColor: '#C9DEC9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: { flex: 1 },
  planName: {
    color: '#5F8F64',
    fontSize: 17,
    fontWeight: '800',
  },
  planDescription: {
    color: '#777',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#DCEADB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  badgeText: {
    color: '#6F9B73',
    fontSize: 11,
    fontWeight: '800',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE1D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
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
