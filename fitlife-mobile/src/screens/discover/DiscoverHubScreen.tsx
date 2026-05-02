import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  FITNESS_CATALOG,
  YOGA_CATALOG,
  type DiscoverCatalogItem,
  type DiscoverModality,
} from '../../data/discoverCatalog';
import type { PilatesStackParamList } from '../../navigation/PilatesNavigationTypes';
import type { PilatesWorkout } from '../../domain/PilatesDomainTypes';
import type { AppColors } from '../../theme/PilatesColors';
import { useTheme } from '../../theme/PilatesThemeContext';
import { usePilatesListViewModel } from '../../viewmodels/PilatesViewModel';

type Props = NativeStackScreenProps<PilatesStackParamList, 'DiscoverHub'>;

type FilterKey = 'all' | DiscoverModality;

type Row =
  | { kind: 'pilates'; workout: PilatesWorkout }
  | { kind: 'catalog'; item: DiscoverCatalogItem };

function modalityLabel(m: FilterKey): string {
  if (m === 'all') return 'All';
  if (m === 'pilates') return 'Pilates';
  if (m === 'fitness') return 'Fitness';
  return 'Yoga';
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.6,
    },
    sub: {
      marginTop: 6,
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    searchWrap: { marginTop: 14 },
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
      marginTop: 12,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipOn: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    chipText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    chipTextOn: { color: '#fff' },
    list: { paddingHorizontal: 16, paddingBottom: 28 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      marginBottom: 8,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    rowIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    rowBody: { flex: 1, minWidth: 0 },
    rowTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
    rowMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    rowDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      lineHeight: 16,
    },
    badge: {
      alignSelf: 'flex-start',
      marginTop: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      overflow: 'hidden',
    },
    badgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
    empty: {
      padding: 24,
      alignItems: 'center',
    },
    emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  });
}

function matchesQuery(q: string, ...parts: string[]): boolean {
  if (!q.trim()) return true;
  const n = q.trim().toLowerCase();
  return parts.some((p) => p.toLowerCase().includes(n));
}

export function DiscoverHubScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { workouts, loading } = usePilatesListViewModel();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  useEffect(() => {
    const m = route.params?.initialModality;
    if (m === 'pilates' || m === 'fitness' || m === 'yoga' || m === 'all') {
      setFilter(m);
    }
  }, [route.params?.initialModality]);

  const rows = useMemo((): Row[] => {
    const q = query;
    const out: Row[] = [];

    if (filter === 'all' || filter === 'pilates') {
      for (const w of workouts) {
        if (
          !matchesQuery(
            q,
            w.title,
            w.description,
            w.level,
            w.category,
            ...w.exercises.map((e) => `${e.name} ${e.description}`),
          )
        ) {
          continue;
        }
        out.push({ kind: 'pilates', workout: w });
      }
    }

    if (filter === 'all' || filter === 'fitness') {
      for (const item of FITNESS_CATALOG) {
        if (
          !matchesQuery(
            q,
            item.title,
            item.description,
            ...item.tags,
          )
        ) {
          continue;
        }
        out.push({ kind: 'catalog', item });
      }
    }

    if (filter === 'all' || filter === 'yoga') {
      for (const item of YOGA_CATALOG) {
        if (
          !matchesQuery(
            q,
            item.title,
            item.description,
            ...item.tags,
          )
        ) {
          continue;
        }
        out.push({ kind: 'catalog', item });
      }
    }

    return out;
  }, [workouts, query, filter]);

  const onPressRow = useCallback(
    (row: Row) => {
      if (row.kind === 'pilates') {
        navigation.navigate('WorkoutDetail', { workoutId: row.workout.id });
        return;
      }
      navigation.navigate('BrowseModalityDetail', {
        id: row.item.id,
        modality: row.item.modality,
        title: row.item.title,
        description: row.item.description,
        minutes: row.item.minutes,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Row }) => {
      if (item.kind === 'pilates') {
        const w = item.workout;
        return (
          <Pressable style={styles.row} onPress={() => onPressRow(item)}>
            <View style={[styles.rowIcon, { backgroundColor: '#ffeded' }]}>
              <Ionicons name="body-outline" size={20} color="#d95b5b" />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle} numberOfLines={2}>
                {w.title}
              </Text>
              <Text style={styles.rowMeta}>
                Pilates · {w.estimatedMinutes} min · {w.level}
              </Text>
              <View style={[styles.badge, { backgroundColor: '#d95b5b' }]}>
                <Text style={styles.badgeText}>PILATES</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        );
      }
      const c = item.item;
      const tint = c.modality === 'fitness' ? '#3a9d4d' : '#e4933b';
      const bg = c.modality === 'fitness' ? '#eef9ea' : '#fff2e3';
      return (
        <Pressable style={styles.row} onPress={() => onPressRow(item)}>
          <View style={[styles.rowIcon, { backgroundColor: bg }]}>
            <Ionicons
              name={c.modality === 'fitness' ? 'barbell-outline' : 'leaf-outline'}
              size={20}
              color={tint}
            />
          </View>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle} numberOfLines={2}>
              {c.title}
            </Text>
            <Text style={styles.rowMeta}>
              {c.modality === 'fitness' ? 'Fitness' : 'Yoga'} · {c.minutes} min
            </Text>
            <Text style={styles.rowDesc} numberOfLines={2}>
              {c.description}
            </Text>
            <View style={[styles.badge, { backgroundColor: tint }]}>
              <Text style={styles.badgeText}>
                {c.modality === 'fitness' ? 'FITNESS' : 'YOGA'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>
      );
    },
    [colors.textSecondary, onPressRow, styles],
  );

  const chips: FilterKey[] = ['all', 'pilates', 'fitness', 'yoga'];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.sub}>
          Find Pilates sessions, fitness plans, and yoga flows in one place.
        </Text>
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.input}
            placeholder="Search by name, muscle, style…"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <View style={styles.chipRow}>
          {chips.map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, filter === c && styles.chipOn]}
              onPress={() => setFilter(c)}
            >
              <Text style={[styles.chipText, filter === c && styles.chipTextOn]}>
                {modalityLabel(c)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      {loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Loading workouts…</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) =>
            r.kind === 'pilates' ? `p-${r.workout.id}` : `c-${r.item.id}`
          }
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No matches. Try another word or switch category.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
