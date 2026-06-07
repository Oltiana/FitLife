import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkoutPlansViewModel } from '../viewmodels/useWorkoutPlansViewModel';

export function WorkoutPlansScreen() {
  const navigation = useNavigation<any>();
  const {
    plans,
    loading,
    handleDeletePlan,
  } = useWorkoutPlansViewModel();

  const getPlanImage = (name?: string) => {
    const planName = name?.toLowerCase() ?? '';

    if (planName.includes('abs') || planName.includes('core')) {
      return require('../../../../assets/images/fitness-images/core.jpg');
    }
    if (planName.includes('chest') || planName.includes('upper')) {
      return require('../../../../assets/images/fitness-images/chest.jpg');
    }
    if (planName.includes('back') || planName.includes('pull')) {
      return require('../../../../assets/images/fitness-images/back.jpg');
    }
    if (planName.includes('legs') || planName.includes('lower')) {
      return require('../../../../assets/images/fitness-images/legs.jpg');
    }
    if (planName.includes('arms')) {
      return require('../../../../assets/images/fitness-images/arms.jpg');
    }
    return require('../../../../assets/images/fitness-images/chest.jpg');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2F3A34" />
        </Pressable>
        <Pressable
          style={styles.floatingAddButton}
          onPress={() => navigation.navigate('CreateWorkoutPlan')}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </Pressable>
        <View>
          <Text style={styles.title}>Workout Plans</Text>
          <Text style={styles.subtitle}>Create and manage your fitness routines</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7FAE83" />
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={
            <View>
              <Text style={styles.plannerTitle}>My Workout Plans</Text>

              <View style={styles.quickActions}>
                <Pressable
                  style={styles.quickActionCard}
                  onPress={() => navigation.navigate('Favorites')}
                >
                  <Ionicons name="heart-outline" size={22} color="#2F3A34" />
                  <Text style={styles.quickActionText}>Favorites</Text>
                </Pressable>

                <Pressable
                  style={styles.quickActionCard}
                  onPress={() => navigation.navigate('WorkoutHistory')}
                >
                  <Ionicons name="time-outline" size={22} color="#2F3A34" />
                  <Text style={styles.quickActionText}>History</Text>
                </Pressable>
              </View>
            </View>
          }
          data={plans}
          keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="barbell-outline" size={42} color="#2F3A34" />
              <Text style={styles.emptyTitle}>No workout plans yet</Text>
              <Text style={styles.emptyText}>Tap the plus button to create your first plan.</Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const imageSource = getPlanImage(item.name);
            return (
              <View style={styles.daySection}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayTitle}>Day {index + 1}</Text>
                  <Pressable onPress={() => navigation.navigate('CreateWorkoutPlan')}>
                    <Text style={styles.addWorkoutText}>+ Add Workout</Text>
                  </Pressable>
                </View>
                <Pressable
                  style={styles.plannerCard}
                  onPress={() =>
                    navigation.navigate('WorkoutSession', {
                      workoutPlanId: item.id,
                    })
                  }
                >
                  <View style={styles.plannerImageBox}>
                    <Image source={imageSource} style={styles.plannerImage} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.planName}>{item.name}</Text>
                    <Text style={styles.planDescription}>
                      {item.description || 'Workout routine'}
                    </Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.level ?? 'Beginner'}</Text>
                    </View>
                  </View>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={(event) => {
                      event.stopPropagation();
                      handleDeletePlan(item.id);
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#E65C3A" />
                  </Pressable>
                  <Ionicons name="chevron-forward" size={22} color="#B7B7B7" />
                </Pressable>
              </View>
            );
          }}
        />
      )}
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
  subtitle: { color: '#6F756E', fontSize: 13, fontWeight: '700', marginTop: 4 },
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
    color: '#1F2420',
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
  cardContent: { flex: 1 },
  planDescription: { color: '#777', fontSize: 12, fontWeight: '600', marginTop: 2 },
  planName: { color: '#1F2420', fontSize: 16, fontWeight: '800' },
  badge: {
    backgroundColor: '#DDE3DE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  badgeText: { color: '#2F3A34', fontSize: 11, fontWeight: '800' },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FBE4DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
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
  plannerTitle: { color: '#333', fontSize: 20, fontWeight: '800', marginBottom: 10 },
  weekRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  weekChip: {
    backgroundColor: '#F4F4F4',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  weekChipActive: { backgroundColor: '#2F3A34' },
  weekText: { color: '#555', fontWeight: '700', fontSize: 12 },
  weekTextActive: { color: '#FFFFFF' },
  daySection: { marginBottom: 20 },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayTitle: { color: '#333', fontSize: 15, fontWeight: '700' },
  addWorkoutText: { color: '#9A9A9A', fontSize: 13, fontWeight: '600' },
  plannerCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  plannerImageBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#DCEADB',
    marginRight: 12,
  },
  plannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  floatingAddButton: {
    position: 'absolute',
    right: 20,
    bottom: 78,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2F3A34',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },

  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E2D8',
  },

  quickActionText: {
    marginTop: 6,
    color: '#1F2420',
    fontWeight: '800',
    fontSize: 13,
  },
});