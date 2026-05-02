import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadCompletions } from '../data/PilatesProgressRepository';
import { loadPrograms, ensureDefaultUser } from '../data/PilatesUserProgramRepository';
import { tokenStorage } from '../storage/tokenStorage';
import type { WorkoutCompletion } from '../domain/PilatesDomainTypes';
import type { PilatesProgram } from '../domain/PilatesProgramTypes';
import type { MainTabParamList } from '../navigation/PilatesNavigationTypes';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

type HomeStats = {
  caloriesThisWeek: number;
  workoutsThisWeek: number;
  activeMinutesThisWeek: number;
};

type RecommendedSlot = { title: string; workoutId: string };

const DEFAULT_RECOMMENDED: readonly RecommendedSlot[] = [
  { title: 'Core Fundamentals', workoutId: 'core-fundamentals' },
  { title: 'Power Flow', workoutId: 'power-flow' },
  { title: 'Deep Stretch & Restore', workoutId: 'deep-stretch' },
];

const RECO_CARD_ACCENTS = ['#4e7a53', '#c9782e', '#c94444'] as const;

function buildRecommendedSlots(programs: PilatesProgram[]): RecommendedSlot[] {
  const fromApi = programs.slice(0, 3).map((p) => ({ title: p.name, workoutId: p.id }));
  if (fromApi.length >= 3) return fromApi.slice(0, 3);
  const used = new Set(fromApi.map((s) => s.workoutId));
  const pad = DEFAULT_RECOMMENDED.filter((d) => !used.has(d.workoutId));
  return [...fromApi, ...pad].slice(0, 3);
}

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
  const insets = useSafeAreaInsets();
  const scrollBottomPad = Math.max(insets.bottom, 10) + 118;

  const [displayName, setDisplayName] = useState('there');
  const [stats, setStats] = useState<HomeStats>({
    caloriesThisWeek: 0,
    workoutsThisWeek: 0,
    activeMinutesThisWeek: 0,
  });
  const [recommendedPrograms, setRecommendedPrograms] = useState<PilatesProgram[]>([]);

  const refreshHomeData = useCallback(async () => {
    try {
      const user = await ensureDefaultUser();
      let greeting = user.displayName?.trim();
      if (!greeting) {
        const t = await tokenStorage.getUser();
        if (t && typeof t === 'object') {
          const fn =
            typeof (t as { fullName?: string }).fullName === 'string'
              ? (t as { fullName: string }).fullName.trim()
              : '';
          if (fn) greeting = fn;
          else if (typeof (t as { email?: string }).email === 'string') {
            const em = (t as { email: string }).email.trim();
            const local = em.split('@')[0];
            if (local) greeting = local;
          }
        }
      }
      setDisplayName(greeting || 'there');
    } catch {
      setDisplayName('there');
    }
    try {
      const [completions, programs] = await Promise.all([
        loadCompletions(),
        loadPrograms(),
      ]);
      setStats(calculateHomeStats(completions));
      setRecommendedPrograms(programs.slice(0, 3));
    } catch (e) {
      console.warn('[FitLife] HomeScreen: load failed', e);
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

  const recommendedSlots = useMemo(
    () => buildRecommendedSlots(recommendedPrograms),
    [recommendedPrograms],
  );

  const openDiscover = useCallback(
    (initialModality: 'all' | 'pilates' | 'fitness' | 'yoga' = 'all') => {
      navigation.navigate('Search', {
        screen: 'DiscoverHub',
        params: { initialModality },
      });
    },
    [navigation],
  );

  const openWorkoutDetail = useCallback(
    (workoutId: string) => {
      navigation.navigate('Search', {
        screen: 'WorkoutDetail',
        params: { workoutId },
      });
    },
    [navigation],
  );

  const openCalendarTab = useCallback(() => {
    navigation.navigate('Calendar', { screen: 'CalendarHub' });
  }, [navigation]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Math.max(insets.top, 12) + 10,
          paddingBottom: scrollBottomPad,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.appTitle}>FitLife</Text>
        <Pressable style={styles.avatarButton} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={17} color="#111" />
        </Pressable>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.greeting}>Hello, {displayName}! 👋</Text>
        <Text style={styles.greetingSub}>Ready for your workout?</Text>
      </View>

      <View style={styles.sectionDivider} />

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

      <View style={[styles.sectionHeader, styles.sectionHeaderFirst]}>
        <Text style={styles.sectionTitle}>Choose your activity</Text>
      </View>
      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [styles.cardPressable, pressed && styles.cardPressed]}
          accessibilityRole="button"
          onPress={() => openDiscover('fitness')}
        >
          <ActivityCard
            icon="barbell-outline"
            title="Fitness"
            subtitle="Strength & conditioning"
            accent="#2d8a45"
            tintBg="#e8f5eb"
          />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.cardPressable, pressed && styles.cardPressed]}
          accessibilityRole="button"
          onPress={() => openDiscover('yoga')}
        >
          <ActivityCard
            icon="leaf-outline"
            title="Yoga"
            subtitle="Balance & mobility"
            accent="#c9782e"
            tintBg="#fff4e8"
          />
        </Pressable>
        <Pressable onPress={() => openDiscover('pilates')} style={styles.cardPressable}>
          <ActivityCard
            icon="body-outline"
            title="Pilates"
            subtitle="Core & flexibility"
            accent="#c94444"
            tintBg="#fdecef"
          />
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended for you</Text>
        <Pressable onPress={() => openDiscover('all')}>
          {({ pressed }) => (
            <Text style={[styles.sectionLink, pressed && styles.linkPressed]}>See all</Text>
          )}
        </Pressable>
      </View>
      <View style={styles.row}>
        {recommendedSlots.map((slot, index) => (
          <Pressable
            key={`${slot.workoutId}-${index}`}
            onPress={() => openWorkoutDetail(slot.workoutId)}
            style={styles.cardPressable}
          >
            <RecommendedCard title={slot.title} accent={RECO_CARD_ACCENTS[index] ?? '#4e7a53'} />
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Shortcuts</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.shortcutRow, pressed && styles.shortcutRowPressed]}
        onPress={openCalendarTab}
      >
        <View style={styles.shortcutIconWrap}>
          <Ionicons name="calendar-outline" size={22} color="#c4743d" />
        </View>
        <View style={styles.shortcutTextCol}>
          <Text style={styles.shortcutTitle}>Schedule</Text>
          <Text style={styles.shortcutSub}>Placeholder — content coming later</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#888" />
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.shortcutRow, pressed && styles.shortcutRowPressed]}
        onPress={() => navigation.navigate('Progress')}
      >
        <View style={styles.shortcutIconWrap}>
          <Ionicons name="reorder-three-outline" size={22} color="#4e7a53" />
        </View>
        <View style={styles.shortcutTextCol}>
          <Text style={styles.shortcutTitle}>Progress</Text>
          <Text style={styles.shortcutSub}>Streak, charts, targets, weight log</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#888" />
      </Pressable>
    </ScrollView>
  );
}

const shadowSoft = Platform.select({
  ios: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  android: { elevation: 4 },
  default: {},
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef2ee',
  },
  content: {
    paddingHorizontal: 20,
    flexGrow: 1,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#142210',
    letterSpacing: -0.5,
  },
  avatarButton: {
    position: 'absolute',
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8e2',
    ...shadowSoft,
  },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#e5ebe5',
    ...shadowSoft,
  },
  greeting: { fontSize: 20, fontWeight: '800', color: '#142210', letterSpacing: -0.3 },
  greetingSub: { fontSize: 14, color: '#5c6b5c', marginTop: 6, lineHeight: 20 },
  sectionDivider: {
    height: 1,
    backgroundColor: '#dde4dd',
    marginTop: 2,
    marginBottom: -4,
    opacity: 0.85,
  },
  sectionHeader: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderFirst: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a2218',
    letterSpacing: -0.2,
  },
  sectionLink: { fontSize: 13, color: '#3d6b42', fontWeight: '700' },
  linkPressed: { opacity: 0.65 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardPressable: { flex: 1, minWidth: 0 },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5ebe5',
    backgroundColor: '#fff',
    marginBottom: 12,
    ...shadowSoft,
  },
  shortcutRowPressed: { opacity: 0.9 },
  shortcutIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f0f4f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTextCol: { flex: 1, minWidth: 0 },
  shortcutTitle: { fontSize: 16, fontWeight: '800', color: '#142210' },
  shortcutSub: { fontSize: 13, color: '#5c6b5c', marginTop: 4, lineHeight: 18 },
  statCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 108,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e8eee8',
    ...shadowSoft,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#eef6ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 10,
    color: '#5c6b5c',
    textAlign: 'center',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statValue: { fontSize: 18, fontWeight: '800', color: '#142210', marginTop: 4 },
  statSub: { fontSize: 11, color: '#7a887a', marginTop: 2, fontWeight: '600' },
  activityCard: {
    flex: 1,
    minHeight: 124,
    borderRadius: 18,
    padding: 14,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    ...shadowSoft,
  },
  activityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activityTitle: { fontSize: 15, fontWeight: '800', color: '#142210', letterSpacing: -0.2 },
  activitySub: { fontSize: 12, color: '#4a564a', lineHeight: 16, marginTop: 4 },
  activityAccentBar: {
    height: 4,
    borderRadius: 4,
    marginTop: 12,
    alignSelf: 'stretch',
  },
  recoCard: {
    flex: 1,
    minHeight: 100,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 14,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e8eee8',
    overflow: 'hidden',
    ...shadowSoft,
  },
  recoAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  recoInner: { paddingLeft: 8, flex: 1, justifyContent: 'space-between', minHeight: 72 },
  recoTitle: { fontSize: 13, fontWeight: '800', color: '#142210', lineHeight: 18 },
  recoMeta: { fontSize: 11, color: '#7a887a', marginTop: 6, fontWeight: '600' },
  recoBookmarkRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
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
      <View style={styles.statIconWrap}>
        <Ionicons name={icon} size={18} color="#3d6b42" />
      </View>
      <Text style={styles.statTitle} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
        {value}
      </Text>
      <Text style={styles.statSub}>{subtitle}</Text>
    </View>
  );
}

function ActivityCard({
  icon,
  title,
  subtitle,
  accent,
  tintBg,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  accent: string;
  tintBg: string;
}) {
  return (
    <View style={[styles.activityCard, { backgroundColor: tintBg }]}>
      <View>
        <View style={[styles.activityIconWrap, { backgroundColor: `${accent}22` }]}>
          <Ionicons name={icon} size={22} color={accent} />
        </View>
        <Text style={styles.activityTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.activitySub} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      <View style={[styles.activityAccentBar, { backgroundColor: accent }]} />
    </View>
  );
}

function RecommendedCard({ title, accent }: { title: string; accent: string }) {
  return (
    <View style={styles.recoCard}>
      <View style={[styles.recoAccent, { backgroundColor: accent }]} />
      <View style={styles.recoInner}>
        <View>
          <Text style={styles.recoTitle} numberOfLines={3}>
            {title}
          </Text>
          <Text style={styles.recoMeta}>Tap to search in app</Text>
        </View>
        <View style={styles.recoBookmarkRow}>
          <Ionicons name="arrow-forward-circle-outline" size={22} color={accent} />
        </View>
      </View>
    </View>
  );
}
