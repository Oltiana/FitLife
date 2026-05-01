import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { loadCompletions } from '../data/PilatesProgressRepository';
import { loadPrograms, ensureDefaultUser } from '../data/PilatesUserProgramRepository';
import type { WorkoutCompletion } from '../domain/PilatesDomainTypes';
import type { PilatesProgram } from '../domain/PilatesProgramTypes';
import type { MainTabParamList } from '../navigation/PilatesNavigationTypes';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

type HomeStats = {
  caloriesThisWeek: number;
  workoutsThisWeek: number;
  activeMinutesThisWeek: number;
};

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calculateHomeStats(completions: WorkoutCompletion[]): HomeStats {
  const weekStart = startOfWeek(new Date());
  const weekItems = completions.filter((entry) => {
    const doneAt = new Date(entry.completedAt);
    return !Number.isNaN(doneAt.getTime()) && doneAt >= weekStart;
  });

  const activeMinutesThisWeek = weekItems.reduce(
    (sum, item) => sum + Math.max(0, item.durationMinutes ?? 0),
    0,
  );

  const caloriesThisWeek = weekItems.reduce((sum, item) => {
    if (typeof item.caloriesBurned === 'number' && Number.isFinite(item.caloriesBurned)) {
      return sum + Math.max(0, item.caloriesBurned);
    }
    return sum + Math.round(Math.max(0, item.durationMinutes ?? 0) * 5);
  }, 0);

  return {
    caloriesThisWeek,
    workoutsThisWeek: weekItems.length,
    activeMinutesThisWeek,
  };
}

function formatMinutes(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function HomeScreen({ navigation }: Props) {
  const [displayName, setDisplayName] = useState('there');
  const [stats, setStats] = useState<HomeStats>({
    caloriesThisWeek: 0,
    workoutsThisWeek: 0,
    activeMinutesThisWeek: 0,
  });
  const [recommendedPrograms, setRecommendedPrograms] = useState<PilatesProgram[]>([]);

  const refreshHomeData = useCallback(async () => {
    try {
      const [user, completions, programs] = await Promise.all([
        ensureDefaultUser(),
        loadCompletions(),
        loadPrograms(),
      ]);

      setDisplayName(user.displayName?.trim() || 'there');
      setStats(calculateHomeStats(completions));
      setRecommendedPrograms(programs.slice(0, 3));
    } catch (e) {
      console.warn('[FitLife] HomeScreen: auth user missing', e);
      setDisplayName('there');
      setStats({
        caloriesThisWeek: 0,
        workoutsThisWeek: 0,
        activeMinutesThisWeek: 0,
      });
      setRecommendedPrograms([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshHomeData();
    }, [refreshHomeData]),
  );

  const recommendedTitles = useMemo(() => {
    if (recommendedPrograms.length > 0) return recommendedPrograms.map((p) => p.name);
    return ['Full Body Workout', 'Morning Flow', 'Pilates Core'];
  }, [recommendedPrograms]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>FitLife</Text>
        <Pressable style={styles.avatarButton} onPress={() => navigation.navigate('Progress')}>
          <Ionicons name="person-outline" size={17} color="#111" />
        </Pressable>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.greeting}>Hello, {displayName}! 👋</Text>
        <Text style={styles.greetingSub}>Ready for your workout?</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <Pressable onPress={() => navigation.navigate('Progress')}>
          {({ pressed }) => (
            <Text style={[styles.sectionLink, pressed && styles.linkPressed]}>View all</Text>
          )}
        </Pressable>
      </View>
      <View style={styles.row}>
        <StatCard
          icon="flame-outline"
          title="Calories Burned"
          value={String(stats.caloriesThisWeek)}
          subtitle="kcal"
        />
        <StatCard
          icon="barbell-outline"
          title="Workouts"
          value={String(stats.workoutsThisWeek)}
          subtitle="this week"
        />
        <StatCard
          icon="time-outline"
          title="Active Time"
          value={formatMinutes(stats.activeMinutesThisWeek)}
          subtitle="this week"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Choose your activity</Text>
      </View>
      <View style={styles.row}>
        <ActivityCard title="Fitness" subtitle="Build strength and stay fit" dotColor="#3a9d4d" bg="#eef9ea" />
        <ActivityCard title="Yoga" subtitle="Find balance and inner peace" dotColor="#e4933b" bg="#fff2e3" />
        <Pressable onPress={() => navigation.navigate('Pilates')} style={styles.cardPressable}>
          <ActivityCard
            title="Pilates"
            subtitle="Improve flexibility and core strength"
            dotColor="#d95b5b"
            bg="#ffeded"
          />
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended for you</Text>
        <Pressable onPress={() => navigation.navigate('Pilates')}>
          {({ pressed }) => (
            <Text style={[styles.sectionLink, pressed && styles.linkPressed]}>See all</Text>
          )}
        </Pressable>
      </View>
      <View style={styles.row}>
        <RecommendedCard title={recommendedTitles[0] ?? 'Full Body Workout'} />
        <RecommendedCard title={recommendedTitles[1] ?? 'Morning Flow'} />
        <Pressable onPress={() => navigation.navigate('Pilates')} style={styles.cardPressable}>
          <RecommendedCard title={recommendedTitles[2] ?? 'Pilates Core'} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8faf8',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#121212',
  },
  avatarButton: {
    position: 'absolute',
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
  },
  heroCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  greeting: { fontSize: 16, fontWeight: '700', color: '#111' },
  greetingSub: { fontSize: 14, color: '#666', marginTop: -6 },
  sectionHeader: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#222' },
  sectionLink: { fontSize: 12, color: '#4e7a53', fontWeight: '700' },
  linkPressed: { opacity: 0.7 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardPressable: { flex: 1 },
  statCard: {
    flex: 1,
    minHeight: 88,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cfcfcf',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  statTitle: {
    fontSize: 10,
    color: '#222',
    textAlign: 'center',
    fontWeight: '600',
  },
  statValue: { fontSize: 15, fontWeight: '800', color: '#111', marginTop: 4 },
  statSub: { fontSize: 10, color: '#666' },
  activityCard: {
    flex: 1,
    minHeight: 96,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cfcfcf',
    padding: 10,
    justifyContent: 'space-between',
  },
  activityTitle: { fontSize: 13, fontWeight: '800', color: '#222' },
  activitySub: { fontSize: 10, color: '#555', lineHeight: 14, marginTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 99, alignSelf: 'center', marginTop: 6 },
  recoCard: {
    flex: 1,
    minHeight: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cfcfcf',
    backgroundColor: '#fff',
    padding: 10,
    justifyContent: 'space-between',
  },
  recoTitle: { fontSize: 12, fontWeight: '700', color: '#222' },
  bookmark: { alignSelf: 'flex-end' },
});

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={16} color="#111" />
      <Text style={styles.statTitle} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statSub}>{subtitle}</Text>
    </View>
  );
}

function ActivityCard({
  title,
  subtitle,
  dotColor,
  bg,
}: {
  title: string;
  subtitle: string;
  dotColor: string;
  bg: string;
}) {
  return (
    <View style={[styles.activityCard, { backgroundColor: bg }]}>
      <View>
        <Text style={styles.activityTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.activitySub} numberOfLines={3}>
          {subtitle}
        </Text>
      </View>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
    </View>
  );
}

function RecommendedCard({ title }: { title: string }) {
  return (
    <View style={styles.recoCard}>
      <Text style={styles.recoTitle} numberOfLines={2}>
        {title}
      </Text>
      <Ionicons style={styles.bookmark} name="bookmark-outline" size={15} color="#222" />
    </View>
  );
}
