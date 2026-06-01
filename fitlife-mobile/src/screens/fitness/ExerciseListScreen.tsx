import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { addFavoriteExercise, getExercises, getFavoriteExercises, deleteFavoriteExercise } from '../../api/fitnessApi';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const categories = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Waist'];
const levels = ['Beginner', 'Intermediate'];

export function ExerciseListScreen() {
  const navigation = useNavigation<any>();

  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState<'Beginner' | 'Intermediate'>('Intermediate');
  const [showMenu, setShowMenu] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const favoriteIds = favorites.map((f) => f.externalExerciseId);


  useEffect(() => {
    loadExercises();
    loadFavorites();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

const loadExercises = async () => {
  try {
    setLoading(true);
    setError('');

    const page1 = await getExercises(0, 10);
    const page2 = await getExercises(10, 10);
    const page3 = await getExercises(20, 10);
    const page4 = await getExercises(30, 10);
    const page5 = await getExercises(40, 10);
    const page6 = await getExercises(50, 10);

    const data = [...page1, ...page2, ...page3, ...page4, ...page5, ...page6];

    console.log('EXERCISES FROM API:', data.length, data);

    setExercises(data);
  } catch (err) {
    setError('Could not load exercises');
  } finally {
    setLoading(false);
  }
};

  const loadFavorites = async () => {
    try {
      const data = await getFavoriteExercises();
      setFavorites(data);
    } catch (error) {
      console.log('Failed to load favorites');
    }
  };

  const getFitnessExerciseIcon = (bodyPart?: string) => {
    const part = bodyPart?.toLowerCase() ?? '';

    if (part.includes('waist')) return 'body-outline';
    if (part.includes('chest')) return 'barbell-outline';
    if (part.includes('back')) return 'add-circle-outline';
    if (part.includes('upper legs') || part.includes('lower legs')) return 'walk-outline';
    if (part.includes('upper arms') || part.includes('lower arms')) return 'barbell-outline';

    return 'fitness-outline';
  };

  const getExerciseImage = (bodyPart?: string) => {
    const part = bodyPart?.toLowerCase() ?? '';

    if (part.includes('chest')) return require('../../../assets/images/fitness-images/chest.jpg');
    if (part.includes('back')) return require('../../../assets/images/fitness-images/back.jpg');

    if (part.includes('upper legs') || part.includes('lower legs')) {
      return require('../../../assets/images/fitness-images/legs.jpg');
    }

    if (part.includes('upper arms') || part.includes('lower arms')) {
      return require('../../../assets/images/fitness-images/arms.jpg');
    }

    if (part.includes('waist')) return require('../../../assets/images/fitness-images/core.jpg');

    return null;
  };

  const handleToggleFavorite = async (exercise: any) => {
    const exerciseId = exercise.externalExerciseId ?? exercise.id?.toString();
    const existingFavorite = favorites.find(
      (f) => f.externalExerciseId === exerciseId
    );

    try {
      if (existingFavorite) {
        await deleteFavoriteExercise(existingFavorite.id);
        setFavorites((prev) =>
          prev.filter((f) => f.externalExerciseId !== exerciseId)
        );
        return;
      }

      const newFavorite = await addFavoriteExercise({
        externalExerciseId: exerciseId,
        exerciseName: exercise.exerciseName || exercise.name,
        bodyPart: exercise.bodyPart,
        targetMuscle: exercise.targetMuscle || exercise.target,
        equipment: exercise.equipment,
        gifUrl: exercise.gifUrl ?? null,
      });

      setFavorites((prev) => [...prev, newFavorite]);
    } catch (error) {
      Alert.alert('Error', 'Could not update favorite.');
    }
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const exerciseName = exercise.exerciseName || exercise.name || '';
      const bodyPart = exercise.bodyPart?.toLowerCase() ?? '';
      const targetMuscle = exercise.targetMuscle || exercise.target || '';
      const level = exercise.level?.toLowerCase();

      const matchesLevel =
        !level || level === selectedLevel.toLowerCase();

      const matchesSearch =
        exerciseName.toLowerCase().includes(searchText.toLowerCase()) ||
        bodyPart.includes(searchText.toLowerCase()) ||
        targetMuscle.toLowerCase().includes(searchText.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ||
        bodyPart.includes(selectedCategory.toLowerCase()) ||
        targetMuscle.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [exercises, searchText, selectedCategory, selectedLevel]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Chest':
        return 'barbell-outline';

      case 'Back':
        return 'body-outline';

      case 'Legs':
        return 'walk-outline';

      case 'Arms':
        return 'fitness-outline';

      case 'Waist':
        return 'body-outline';

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7FAE83" />
        <Text style={styles.loadingText}>Loading exercises...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadExercises}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Exercise Library</Text>
          <Text style={styles.subtitle}>
            {filteredExercises.length} exercises available
          </Text>
        </View>

        <Pressable style={styles.menuButton} onPress={() => setShowMenu(!showMenu)}>
          <Ionicons name="menu" size={28} color="#6F9B73" />
        </Pressable>
      </View>

      {showMenu && (
        <View style={styles.dropdownMenu}>
          <Pressable
            style={styles.dropdownItem}
            onPress={() => {
              setShowMenu(false);
              navigation.navigate('WorkoutPlans');
            }}
          >
            <Ionicons name="list-outline" size={20} color="#5F8F64" />
            <Text style={styles.dropdownText}>My Workout Plans</Text>
          </Pressable>

          <Pressable
            style={styles.dropdownItem}
            onPress={() => {
              setShowMenu(false);
              navigation.navigate('Favorites');
            }}
          >
            <Ionicons name="heart-outline" size={20} color="#5F8F64" />
            <Text style={styles.dropdownText}>Favorites</Text>
          </Pressable>

          <Pressable
            style={styles.dropdownItem}
            onPress={() => {
              setShowMenu(false);
              navigation.navigate('WorkoutHistory');
            }}
          >
            <Ionicons name="time-outline" size={20} color="#5F8F64" />
            <Text style={styles.dropdownText}>Workout History</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#8E8E8E" />
        <TextInput
          placeholder="Search exercises, muscles..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.categoryWrapper}>
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          const iconName = getCategoryIcon(category);

          return (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
            >
              <View style={styles.categoryContent}>
                {iconName && (
                  <Ionicons
                    name={iconName as any}
                    size={17}
                    color={isSelected ? '#FFFFFF' : '#2E6B3A'}
                  />
                )}

                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {category}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.levelWrapper}>
        {levels.map((level) => {
          const isSelected = selectedLevel === level;

          return (
            <Pressable
              key={level}
              onPress={() => setSelectedLevel(level as 'Beginner' | 'Intermediate')}
              style={[styles.levelChip, isSelected && styles.levelChipActive]}
            >
              <View style={styles.levelContent}>
                <Ionicons
                  name="bar-chart-outline"
                  size={18}
                  color={isSelected ? '#FFFFFF' : '#4F8F5D'}
                />

                <Text style={[styles.levelTextFilter, isSelected && styles.levelTextFilterActive]}>
                  {level}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filteredExercises}
        keyExtractor={(item, index) =>
          item.externalExerciseId?.toString() ?? item.id?.toString() ?? index.toString()
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={46} color="#86B587" />
            <Text style={styles.emptyTitle}>No exercises found</Text>
            <Text style={styles.emptyText}>
              Try changing the search text or selected filters.
            </Text>

            <Pressable
              style={styles.clearButton}
              onPress={() => {
                setSearchText('');
                setSelectedCategory('All');
                setSelectedLevel('Intermediate');
              }}
            >
              <Text style={styles.clearButtonText}>Clear filters</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const exerciseName = item.exerciseName || item.name;
          const targetMuscle = item.targetMuscle || item.target;
          const iconName = getFitnessExerciseIcon(item.bodyPart);
          const imageSource = getExerciseImage(item.bodyPart);

          const exerciseId = item.externalExerciseId ?? item.id?.toString();
          const isFavorite = favoriteIds.includes(exerciseId);

          return (
            <View style={styles.card}>
              <Pressable
                style={styles.cardPressArea}
                onPress={() =>
                  navigation.navigate('ExerciseDetails', {
                    exercise: item,
                  })
                }
              >
                <View style={styles.exerciseImageBox}>
                  {imageSource ? (
                    <Image source={imageSource} style={styles.exerciseImage} />
                  ) : (
                    <Ionicons name={iconName as any} size={36} color="#5F8F64" />
                  )}
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.exerciseName} numberOfLines={2}>
                    {exerciseName}
                  </Text>

                  <Text style={styles.exerciseMeta}>
                    {item.bodyPart} · {targetMuscle}
                  </Text>

                  <View style={styles.badgeRow}>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>{item.level ?? 'Intermediate'}</Text>
                    </View>

                    <View style={styles.bodyBadge}>
                      <Text style={styles.bodyText}>{item.bodyPart ?? 'Fitness'}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>

              <View style={styles.cardActions}>
                <Pressable
                  style={styles.favoriteButton}
                  onPress={() => handleToggleFavorite(item)}
                >
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={24}
                    color="#2F7D3B"
                  />
                </Pressable>

                <Pressable
                  style={styles.chevronButton}
                  onPress={() =>
                    navigation.navigate('ExerciseDetails', {
                      exercise: item,
                    })
                  }
                >
                  <Ionicons name="chevron-forward" size={25} color="#777" />
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },
  center: {
    flex: 1,
    backgroundColor: '#F8FAF7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#6E8B70',
    fontWeight: '600',
  },
  errorText: {
    color: '#B00020',
    fontWeight: '600',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#7FAE83',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  header: {
    backgroundColor: '#86B587',
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#F1FFF2',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8ECE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    marginHorizontal: 22,
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
  categoryWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginTop: 16,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    minWidth: 72,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryChipActive: {
    backgroundColor: '#5DAA68',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    color: '#2E6B3A',
    fontWeight: '800',
    fontSize: 13,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  levelWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    marginTop: 12,
    gap: 12,
  },

  levelChip: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor: '#FFFFFF',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  levelChipActive: {
    backgroundColor: '#5DAA68',
  },

  levelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  levelTextFilter: {
    color: '#4F8F5D',
    fontWeight: '800',
    fontSize: 14,
  },
  levelTextFilterActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 22,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  cardPressArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseImageBox: {
    width: 110,
    height: 82,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#DDEBDC',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#245C32',
    fontSize: 17,
    fontWeight: '900',
    textTransform: 'capitalize',
    lineHeight: 22,
  },

  exerciseMeta: {
    color: '#6F766F',
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
    backgroundColor: '#DCEADB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  levelText: {
    color: '#6F9B73',
    fontSize: 11,
    fontWeight: '800',
  },
  bodyBadge: {
    backgroundColor: '#FFE1D0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  bodyText: {
    color: '#D47A45',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  dropdownMenu: {
    marginHorizontal: 22,
    marginTop: -12,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    color: '#5F8F64',
    fontSize: 14,
    fontWeight: '800',
  },
  favoriteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F7E4',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 14,
    color: '#5F8F64',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 6,
    color: '#7FAE83',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  clearButton: {
    marginTop: 18,
    backgroundColor: '#86B587',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 18,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
  chevronButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});