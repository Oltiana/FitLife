import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageBanner } from '../../components/PilatesImageBanner';
import { PilatesListSkeleton } from '../../components/PilatesListSkeleton';
import { useEnrolledProgramIds } from '../../hooks/usePilatesEnrolledProgramIds';
import { usePilatesListViewModel } from '../../viewmodels/PilatesViewModel';
import type { PilatesStackParamList } from '../../navigation/PilatesNavigationTypes';
import type { PilatesCategory, PilatesLevel, PilatesWorkout } from '../../domain/PilatesDomainTypes';
import type { AppColors } from '../../theme/PilatesColors';
import { useTheme } from '../../theme/PilatesThemeContext';

type Props = NativeStackScreenProps<PilatesStackParamList, 'PilatesList'>;

const levelLabel: Record<PilatesLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const categoryLabel: Record<PilatesCategory, string> = {
  core: 'Core',
  strength: 'Strength',
  mobility: 'Mobility',
};

function createListStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 12,
    },
    screenTitle: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.8,
    },
    screenSubtitle: {
      marginTop: 4,
      fontSize: 15,
      color: colors.textSecondary,
    },
    searchWrap: {
      marginTop: 14,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      color: colors.text,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === 'ios' ? 12 : 10,
      fontSize: 15,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 10,
    },
    chipFilter: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
    },
    chipFilterOn: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    chipFilterText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    chipFilterTextOn: {
      color: '#fff',
    },
    list: {
      paddingHorizontal: 16,
      paddingBottom: 32,
      gap: 20,
    },
    card: {
      borderRadius: 24,
      overflow: 'hidden',
    },
    cardPressed: {
      opacity: 0.94,
      transform: [{ scale: 0.985 }],
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: -0.3,
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 6,
    },
    cardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
      gap: 10,
    },
    cardMetaRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 1,
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
    },
    enrolledPill: {
      backgroundColor: 'rgba(45, 106, 79, 0.92)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.35)',
    },
    enrolledPillText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    chip: {
      backgroundColor: 'rgba(8, 22, 16, 0.65)',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
    },
    chipText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 1.1,
    },
    timePill: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.28)',
    },
    cardTime: {
      fontSize: 13,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: -0.2,
      fontVariant: ['tabular-nums'],
    },
    emptyWrap: {
      paddingHorizontal: 20,
      paddingTop: 24,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      textAlign: 'center',
      color: colors.textSecondary,
      lineHeight: 22,
    },
  });
}

export function PilatesListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createListStyles(colors), [colors]);
  const { workouts, loading } = usePilatesListViewModel();
  const { enrolledIds, refresh } = useEnrolledProgramIds();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<PilatesLevel | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<PilatesCategory | null>(null);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const filteredWorkouts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return workouts.filter((w) => {
      if (levelFilter != null && w.level !== levelFilter) return false;
      if (categoryFilter != null && w.category !== categoryFilter) return false;
      if (q.length === 0) return true;
      return (
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.exercises.some((ex) => ex.name.toLowerCase().includes(q))
      );
    });
  }, [categoryFilter, levelFilter, searchQuery, workouts]);

  const renderItem = useCallback(
    ({ item }: { item: PilatesWorkout }) => (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() =>
          navigation.navigate('WorkoutDetail', { workoutId: item.id })
        }
      >
        <ImageBanner
          source={item.coverImage}
          aspectRatio={0.68}
          variant="darkBottom"
          bottomInset={20}
        >
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={styles.cardMeta}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>
                {levelLabel[item.level].toUpperCase()}
              </Text>
            </View>
            <View style={styles.cardMetaRight}>
              {enrolledIds.has(item.id) ? (
                <View style={styles.enrolledPill}>
                  <Text style={styles.enrolledPillText}>My program</Text>
                </View>
              ) : null}
              <View style={styles.timePill}>
                <Text style={styles.cardTime} maxFontSizeMultiplier={1.3}>
                  {item.estimatedMinutes} min
                </Text>
              </View>
            </View>
          </View>
        </ImageBanner>
      </Pressable>
    ),
    [enrolledIds, navigation, styles],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <PilatesListSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={filteredWorkouts}
        keyExtractor={(w) => w.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.screenTitle}>Pilates</Text>
            <Text style={styles.screenSubtitle}>
              Search and filter sessions, then start your flow.
            </Text>
            <View style={styles.searchWrap}>
              <TextInput
                style={styles.input}
                placeholder="Search sessions or exercises"
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={styles.chipRow}>
              <Pressable
                style={[
                  styles.chipFilter,
                  levelFilter == null && styles.chipFilterOn,
                ]}
                onPress={() => setLevelFilter(null)}
              >
                <Text
                  style={[
                    styles.chipFilterText,
                    levelFilter == null && styles.chipFilterTextOn,
                  ]}
                >
                  All levels
                </Text>
              </Pressable>
              {(['beginner', 'intermediate', 'advanced'] as PilatesLevel[]).map(
                (level) => (
                  <Pressable
                    key={level}
                    style={[
                      styles.chipFilter,
                      levelFilter === level && styles.chipFilterOn,
                    ]}
                    onPress={() =>
                      setLevelFilter((curr) => (curr === level ? null : level))
                    }
                  >
                    <Text
                      style={[
                        styles.chipFilterText,
                        levelFilter === level && styles.chipFilterTextOn,
                      ]}
                    >
                      {levelLabel[level]}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>
            <View style={styles.chipRow}>
              <Pressable
                style={[
                  styles.chipFilter,
                  categoryFilter == null && styles.chipFilterOn,
                ]}
                onPress={() => setCategoryFilter(null)}
              >
                <Text
                  style={[
                    styles.chipFilterText,
                    categoryFilter == null && styles.chipFilterTextOn,
                  ]}
                >
                  All categories
                </Text>
              </Pressable>
              {(['core', 'strength', 'mobility'] as PilatesCategory[]).map(
                (category) => (
                  <Pressable
                    key={category}
                    style={[
                      styles.chipFilter,
                      categoryFilter === category && styles.chipFilterOn,
                    ]}
                    onPress={() =>
                      setCategoryFilter((curr) =>
                        curr === category ? null : category,
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.chipFilterText,
                        categoryFilter === category && styles.chipFilterTextOn,
                      ]}
                    >
                      {categoryLabel[category]}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              No sessions match your search/filter. Try removing one filter.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
