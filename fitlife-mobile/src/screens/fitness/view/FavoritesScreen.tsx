import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
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
import { deleteFavoriteExercise, getFavoriteExercises } from '../../../api/fitnessApi';

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

  const getExerciseImage = (bodyPart?: string) => {
    const part = bodyPart?.toLowerCase() ?? '';

    if (part.includes('chest')) return require('../../../../assets/images/fitness-images/chest.jpg');
    if (part.includes('back')) return require('../../../../assets/images/fitness-images/back.jpg');

    if (part.includes('upper legs') || part.includes('lower legs')) {
      return require('../../../../assets/images/fitness-images/legs.jpg');
    }

    if (part.includes('upper arms') || part.includes('lower arms')) {
      return require('../../../../assets/images/fitness-images/arms.jpg');
    }

    if (part.includes('waist')) return require('../../../../assets/images/fitness-images/core.jpg');

    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          renderItem={({ item }) => {
            const imageSource = getExerciseImage(item.bodyPart);
            return (
              <View style={styles.card}>
                <View style={styles.imageBox}>
                  {imageSource ? (
                    <Image source={imageSource} style={styles.exerciseImage} />
                  ) : (
                    <Ionicons name="fitness-outline" size={34} color="#5F8F64" />
                  )}
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.exerciseName} numberOfLines={2}>
                    {item.exerciseName}
                  </Text>
                  <Text style={styles.exerciseMeta}>
                    {item.bodyPart} · {item.targetMuscle}
                  </Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>Favorite</Text>
                    </View>
                    <View style={styles.bodyBadge}>
                      <Text style={styles.bodyText}>{item.bodyPart ?? 'Fitness'}</Text>
                    </View>
                  </View>
                </View>
                <Pressable style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={22} color="#D47A45" />
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
    borderRadius: 24,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  imageBox: {
    width: 110,
    height: 82,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#DCEADB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  exerciseImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardContent: { flex: 1, paddingRight: 8 },
  exerciseName: {
    color: '#245C32',
    fontSize: 17,
    fontWeight: '900',
    textTransform: 'capitalize',
    lineHeight: 22,
  },
  exerciseMeta: { color: '#6F766F', fontSize: 13, marginTop: 4, textTransform: 'capitalize' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  levelBadge: { backgroundColor: '#DCEADB', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  levelText: { color: '#5F8F64', fontSize: 11, fontWeight: '800' },
  bodyBadge: { backgroundColor: '#FFE1D0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  bodyText: { color: '#D47A45', fontSize: 11, fontWeight: '800', textTransform: 'capitalize' },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF1E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});