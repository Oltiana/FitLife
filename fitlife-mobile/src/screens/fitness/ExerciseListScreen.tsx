import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { getExercises } from '../../api/fitnessApi';
import { useNavigation } from '@react-navigation/native';

const categories = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Waist'];
const levels = ['Beginner', 'Intermediate'];

export function ExerciseListScreen() {
  const getFitnessExerciseIcon = (bodyPart?: string) => {
    const part = bodyPart?.toLowerCase() ?? '';

    if (part.includes('waist')) return 'body-outline';
    if (part.includes('chest')) return 'barbell-outline';
    if (part.includes('back')) return 'add-circle-outline';
    if (part.includes('upper legs') || part.includes('lower legs')) return 'walk-outline';
    if (part.includes('upper arms') || part.includes('lower arms')) return 'barbell-outline';

    return 'fitness-outline';
  };
  const navigation = useNavigation<any>();

  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState<'Beginner' | 'Intermediate'>('Intermediate');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getExercises(0, 20);
      setExercises(data);
    } catch (err) {
      setError('Could not load exercises');
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const name = exercise.name?.toLowerCase() ?? '';
      const bodyPart = exercise.bodyPart?.toLowerCase() ?? '';
      const target = exercise.target?.toLowerCase() ?? '';
      const level = exercise.level?.toLowerCase() ?? '';

      const matchesLevel = level === selectedLevel.toLowerCase();

      const matchesSearch =
        name.includes(searchText.toLowerCase()) ||
        bodyPart.includes(searchText.toLowerCase()) ||
        target.includes(searchText.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ||
        bodyPart.includes(selectedCategory.toLowerCase()) ||
        target.includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [exercises, searchText, selectedCategory]);

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
          <Text style={styles.subtitle}>{filteredExercises.length} exercises available</Text>
        </View>

        <Pressable
          style={styles.menuButton}
          onPress={() => setShowMenu(!showMenu)}
        >
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
          placeholder="Search exercises..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.categoryWrapper}>
        {categories.map((category) => {
          const isSelected = selectedCategory === category;

          return (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                {category}
              </Text>
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
              <Text style={[styles.levelTextFilter, isSelected && styles.levelTextFilterActive]}>
                {level}
              </Text>
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
        renderItem={({ item }) => {
          const exerciseName = item.exerciseName || item.name;
          const targetMuscle = item.targetMuscle || item.target;
          const iconName = getFitnessExerciseIcon(item.bodyPart);

          return (
            <Pressable
              style={styles.card}
              onPress={() =>
                navigation.navigate('ExerciseDetails', {
                  exercise: item,
                })
              }
            >
              <View style={styles.iconBox}>
                <Ionicons name={iconName as any} size={38} color="#5F8F64" />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.exerciseName}>{exerciseName}</Text>
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

              <Ionicons name="chevron-forward" size={22} color="#B7B7B7" />
            </Pressable>
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
    backgroundColor: '#E8E8E8',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
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
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  categoryChip: {
    backgroundColor: '#D9D9D9',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  categoryChipActive: {
    backgroundColor: '#86B587',
  },
  categoryText: {
    color: '#6F9B73',
    fontWeight: '800',
  },
  categoryTextActive: {
    color: '#fff',
  },
  levelWrapper: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 22,
    marginTop: 12,
  },
  levelChip: {
    flex: 1,
    backgroundColor: '#D9D9D9',
    paddingVertical: 10,
    borderRadius: 18,
    alignItems: 'center',
  },
  levelChipActive: {
    backgroundColor: '#86B587',
  },
  levelTextFilter: {
    color: '#6F9B73',
    fontWeight: '800',
  },
  levelTextFilterActive: {
    color: '#fff',
  },
  listContent: {
    padding: 22,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    padding: 10,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 86,
    height: 86,
    borderRadius: 16,
    backgroundColor: '#C9DEC9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
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
    marginTop: 3,
    textTransform: 'capitalize',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  levelBadge: {
    backgroundColor: '#DCEADB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  levelText: {
    color: '#6F9B73',
    fontSize: 11,
    fontWeight: '700',
  },
  bodyBadge: {
    backgroundColor: '#FFE1D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  bodyText: {
    color: '#D47A45',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  workoutPlansButton: {
    marginHorizontal: 22,
    marginTop: 16,
    backgroundColor: '#5F8F64',
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  workoutPlansButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
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
});