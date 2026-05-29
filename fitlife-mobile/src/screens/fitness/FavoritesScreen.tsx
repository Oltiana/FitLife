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
import { deleteFavoriteExercise, getFavoriteExercises } from '../../api/fitnessApi';

export function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await getFavoriteExercises();
      setFavorites(data);
    } catch (error) {
      console.log('Failed to load favorites', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const handleDelete = async (id: number) => {
    try {
      await deleteFavoriteExercise(id);
      loadFavorites();
    } catch (error) {
      console.log('Failed to delete favorite', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>

        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>Your saved fitness exercises</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#86B587" />
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="heart-outline" size={42} color="#86B587" />
              <Text style={styles.emptyTitle}>No favorites yet</Text>
              <Text style={styles.emptyText}>Add exercises to favorites from Exercise Details.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.iconBox}>
                <Ionicons name="heart" size={30} color="#5F8F64" />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.exerciseName}>{item.exerciseName}</Text>
                <Text style={styles.exerciseMeta}>
                  {item.bodyPart} · {item.targetMuscle}
                </Text>
              </View>

              <Pressable onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={22} color="#D47A45" />
              </Pressable>
            </View>
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
  emptyTitle: { color: '#5F8F64', fontSize: 18, fontWeight: '800', marginTop: 12 },
  emptyText: { color: '#777', textAlign: 'center', marginTop: 6, fontWeight: '600' },
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
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#DCEADB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: { flex: 1 },
  exerciseName: {
    color: '#5F8F64',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  exerciseMeta: {
    color: '#7FAE83',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'capitalize',
  },
});