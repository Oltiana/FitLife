import { useNavigation } from '@react-navigation/native';
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
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutHistoryViewModel } from '../viewmodels/useWorkoutHistoryViewModel';

export function WorkoutHistoryScreen() {
  const navigation = useNavigation<any>();

  const {
    sessions,
    loading,
  } = useWorkoutHistoryViewModel();

  const formatDate = (date?: string) => {
    if (!date) return 'Not completed yet';
    return new Date(date).toLocaleDateString();
  };

  const getPlanImage = (name?: string) => {
    const planName = name?.toLowerCase() ?? '';
    if (planName.includes('abs') || planName.includes('core')) return require('../../../../assets/images/fitness-images/core.jpg');
    if (planName.includes('chest') || planName.includes('upper')) return require('../../../../assets/images/fitness-images/chest.jpg');
    if (planName.includes('back') || planName.includes('pull')) return require('../../../../assets/images/fitness-images/back.jpg');
    if (planName.includes('legs') || planName.includes('lower')) return require('../../../../assets/images/fitness-images/legs.jpg');
    if (planName.includes('arms')) return require('../../../../assets/images/fitness-images/arms.jpg');
    return require('../../../../assets/images/fitness-images/chest.jpg');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2F3A34" />
        </Pressable>
        <Text style={styles.title}>Workout History</Text>
        <Text style={styles.subtitle}>Track your completed fitness sessions</Text>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2F3A34" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="time-outline" size={42} color="#2F3A34" />
              <Text style={styles.emptyTitle}>No workout history yet</Text>
              <Text style={styles.emptyText}>Start and complete a workout to see it here.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const sessionName = item.workoutPlanName ?? item.planName ?? 'Workout Session';
            const imageSource = getPlanImage(sessionName);
            return (
              <View style={styles.card}>
                <View style={styles.historyImageBox}>
                  <Image source={imageSource} style={styles.historyImage} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.sessionTitle}>{sessionName}</Text>
                  <Text style={styles.sessionMeta}>Completed: {formatDate(item.completedAt)}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}><Text style={styles.badgeText}>{item.durationMinutes ?? 0} min</Text></View>
                    <View style={styles.badge}><Text style={styles.badgeText}>{item.calories ?? 0} kcal</Text></View>
                  </View>
                </View>
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

  center: {
    flex: 1,
    backgroundColor: '#F7F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#6F756E',
    fontWeight: '700',
  },

  listContent: {
    padding: 22,
    paddingBottom: 120,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E2D8',
  },

  emptyTitle: {
    color: '#1F2420',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },

  emptyText: {
    color: '#6F756E',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E2D8',
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  cardContent: {
    flex: 1,
  },

  sessionTitle: {
    color: '#1F2420',
    fontSize: 16,
    fontWeight: '800',
  },

  sessionMeta: {
    color: '#6F756E',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },

  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  badge: {
    backgroundColor: '#DDE3DE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },

  badgeText: {
    color: '#2F3A34',
    fontSize: 11,
    fontWeight: '800',
  },

  historyImageBox: {
    width: 86,
    height: 74,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#DDE3DE',
    marginRight: 14,
  },

  historyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});