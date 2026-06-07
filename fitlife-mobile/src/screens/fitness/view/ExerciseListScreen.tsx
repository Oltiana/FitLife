import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import {
  categories,
  levels,
  useExerciseListViewModel,
} from '../viewmodels/useExerciseListViewModel';

export function ExerciseListScreen() {
  const navigation = useNavigation<any>();

  const {
    loading,
    error,
    searchText,
    setSearchText,
    selectedCategory,
    setSelectedCategory,
    selectedLevel,
    setSelectedLevel,
    favoriteIds,
    filteredExercises,
    loadExercises,
    handleToggleFavorite,
    clearFilters,
  } = useExerciseListViewModel();

  const getFitnessExerciseIcon = (bodyPart?: string) => {
    const part = bodyPart?.toLowerCase() ?? '';

    if (part.includes('waist')) return 'body-outline';
    if (part.includes('chest')) return 'barbell-outline';
    if (part.includes('back')) return 'add-circle-outline';
    if (part.includes('upper legs') || part.includes('lower legs')) {
      return 'walk-outline';
    }
    if (part.includes('upper arms') || part.includes('lower arms')) {
      return 'barbell-outline';
    }

    return 'fitness-outline';
  };

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2F3A34" />
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Fitness</Text>
          <Text style={styles.subtitle}>{filteredExercises.length} exercises available</Text>
        </View>
      </View>

      <View style={styles.fitnessTabs}>
        <Pressable style={[styles.fitnessTab, styles.fitnessTabActive]}>
          <Text style={[styles.fitnessTabText, styles.fitnessTabTextActive]}>
            Library
          </Text>
        </Pressable>

        <Pressable
          style={styles.fitnessTab}
          onPress={() => navigation.navigate('WorkoutPlans')}
        >
          <Text style={styles.fitnessTabText}>
            My Workouts
          </Text>
        </Pressable>
      </View>

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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryWrapper}
      >
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
      </ScrollView>

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
                <Ionicons name="bar-chart-outline" size={18} color={isSelected ? '#FFFFFF' : '#8E978F'} />
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
            <Ionicons name="search-outline" size={46} color="#8E978F" />
            <Text style={styles.emptyTitle}>No exercises found</Text>
            <Text style={styles.emptyText}>Try changing the search text or selected filters.</Text>
            <Pressable style={styles.clearButton} onPress={() => { setSearchText(''); setSelectedCategory('All'); setSelectedLevel('Intermediate'); }}>
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
              <Pressable style={styles.cardPressArea} onPress={() => navigation.navigate('ExerciseDetails', { exercise: item })}>
                <View style={styles.exerciseImageBox}>
                  {imageSource ? (
                    <Image source={imageSource} style={styles.exerciseImage} />
                  ) : (
                    <Ionicons name={iconName as any} size={36} color="#8E978F" />
                  )}
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.exerciseName} numberOfLines={2}>{exerciseName}</Text>
                  <Text style={styles.exerciseMeta}>{item.bodyPart} · {targetMuscle}</Text>
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
                <Pressable style={styles.favoriteButton} onPress={() => handleToggleFavorite(item)}>
                  <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color={isFavorite ? '#60645f' : '#8E978F'} />
                </Pressable>
                <Pressable style={styles.chevronButton} onPress={() => navigation.navigate('ExerciseDetails', { exercise: item })}>
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
  container: { flex: 1, backgroundColor: '#F8FAF7' },
  center: { flex: 1, backgroundColor: '#F8FAF7', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loadingText: { marginTop: 10, color: '#6E8B70', fontWeight: '600' },
  errorText: { color: '#B00020', fontWeight: '600', marginBottom: 12 },
  retryButton: { backgroundColor: '#2F3A34', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 18 },
  retryText: { color: '#fff', fontWeight: '700' },
  header: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E6E2D8', paddingHorizontal: 22, paddingTop: 34, paddingBottom: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#1F2420',
  },
  subtitle: {
    fontSize: 13,
    color: '#6F756E',
    marginTop: 6,
    fontWeight: '600',
  },
  searchBox: {
    marginHorizontal: 22,
    marginTop: 22,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E2D8',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryWrapper: {
    gap: 10,
    paddingHorizontal: 22,
    paddingRight: 34,
    alignItems: 'center',
  },
  categoryChip: {
    minWidth: 96,
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE3DE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryText: {
    color: '#4D5B52',
    fontSize: 14,
    fontWeight: '800',
  },

  categoryChipActive: {
    backgroundColor: '#2F3A34',
    borderColor: '#2F3A34',
    borderWidth: 1,
  },

  categoryTextActive: {
    color: '#FFFFFF',
  },
  levelWrapper: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 22,
    marginTop: 12,
    marginBottom: 20,
  },
  levelChip: { flex: 1, height: 42, borderRadius: 21, backgroundColor: '#F4F4F4', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  levelChipActive: { backgroundColor: '#8E978F' },
  levelContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelTextFilter: { color: '#8E978F', fontWeight: '800', fontSize: 14 },
  levelTextFilterActive: { color: '#FFFFFF' },
  listContent: { padding: 22, paddingBottom: 120 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  cardPressArea: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  exerciseImageBox: { width: 110, height: 82, borderRadius: 18, overflow: 'hidden', backgroundColor: '#DDEBDC', marginRight: 16, alignItems: 'center', justifyContent: 'center' },
  exerciseImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardContent: { flex: 1, paddingRight: 8 },
  exerciseName: { color: '#1F2420', fontSize: 17, fontWeight: '900', textTransform: 'capitalize', lineHeight: 22 },
  exerciseMeta: { color: '#6F766F', fontSize: 13, marginTop: 4, textTransform: 'capitalize' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  levelBadge: {
    backgroundColor: '#DDE3DE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },

  levelText: {
    color: '#2F3A34',
    fontSize: 11,
    fontWeight: '800',
  },
  bodyBadge: {
    backgroundColor: '#DDE3DE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },

  bodyText: {
    color: '#2F3A34',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },

  favoriteButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F2F1EC', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  emptyTitle: { marginTop: 14, color: '#8E978F', fontSize: 18, fontWeight: '800' },
  emptyText: { marginTop: 6, color: '#2F3A34', fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
  clearButton: { marginTop: 18, backgroundColor: '#8E978F', paddingHorizontal: 20, paddingVertical: 11, borderRadius: 18 },
  clearButtonText: { color: '#fff', fontWeight: '800' },
  chevronButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F4F4F4', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 5, elevation: 2 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoryScroll: {
    marginTop: 18,
    flexGrow: 0,
    height: 52,
  },

  fitnessTabs: {
    flexDirection: 'row',
    marginHorizontal: 22,
    marginTop: 18,
    backgroundColor: '#F2F1EC',
    borderRadius: 24,
    padding: 4,
  },

  fitnessTab: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fitnessTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  fitnessTabText: {
    color: '#6F756E',
    fontSize: 14,
    fontWeight: '800',
  },

  fitnessTabTextActive: {
    color: '#1F2420',
  },
});