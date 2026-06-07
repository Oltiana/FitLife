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
import { useFavoritesViewModel } from '../viewmodels/useFavoritesViewModel';

export function FavoritesScreen() {
  const navigation = useNavigation<any>();

  const {
    favorites,
    loading,
    handleDeleteFavorite,
  } = useFavoritesViewModel();

  const getExerciseImage = (bodyPart?: string) => {
    const part = bodyPart?.toLowerCase() ?? '';

    if (part.includes('chest')) {
      return require('../../../../assets/images/fitness-images/chest.jpg');
    }

    if (part.includes('back')) {
      return require('../../../../assets/images/fitness-images/back.jpg');
    }

    if (part.includes('upper legs') || part.includes('lower legs')) {
      return require('../../../../assets/images/fitness-images/legs.jpg');
    }

    if (part.includes('upper arms') || part.includes('lower arms')) {
      return require('../../../../assets/images/fitness-images/arms.jpg');
    }

    if (part.includes('waist')) {
      return require('../../../../assets/images/fitness-images/core.jpg');
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2F3A34" />
        </Pressable>

        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>Your saved fitness exercises</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2F3A34" />
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item, index) =>
            item.id?.toString() ?? index.toString()
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="heart-outline" size={42} color="#2F3A34" />
              <Text style={styles.emptyTitle}>No favorites yet</Text>
              <Text style={styles.emptyText}>
                Add exercises to favorites from Exercise Details.
              </Text>
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
                    <Ionicons
                      name="fitness-outline"
                      size={34}
                      color="#2F3A34"
                    />
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
                      <Text style={styles.bodyText}>
                        {item.bodyPart ?? 'Fitness'}
                      </Text>
                    </View>
                  </View>
                </View>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDeleteFavorite(item.id)}
                >
                  <Ionicons name="trash-outline" size={22} color="#6F756E" />
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
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: 24,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  imageBox: {
    width: 110,
    height: 82,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#DDE3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  exerciseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  cardContent: {
    flex: 1,
    paddingRight: 8,
  },

  exerciseName: {
    color: '#1F2420',
    fontSize: 17,
    fontWeight: '900',
    textTransform: 'capitalize',
    lineHeight: 22,
  },

  exerciseMeta: {
    color: '#6F756E',
    fontSize: 13,
    marginTop: 4,
    textTransform: 'capitalize',
  },

  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },

  levelBadge: {
    backgroundColor: '#DDE3DE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  levelText: {
    color: '#2F3A34',
    fontSize: 11,
    fontWeight: '800',
  },

  bodyBadge: {
    backgroundColor: '#ECEAE3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  bodyText: {
    color: '#4D5B52',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },

  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F1EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});