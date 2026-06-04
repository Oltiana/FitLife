import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import {
  ensureDefaultUser,
  generateAnalytics,
  loadCompletions,
  resolvePilatesApiUserId,
} from '../../../data/pilates';
import {
  filterCompletionsByPeriod,
  filterCompletionsForUser,
  totalCaloriesBurned,
  totalCompletedSessions,
  totalMinutes,
} from '../../../domain/PilatesProgressStats';
import { tokenStorage } from '../../../storage/tokenStorage';

type HomeMetrics = {
  streak: number;
  caloriesThisWeek: number;
  workoutsThisWeek: number;
  activeMinutesThisWeek: number;
  todayMinutes: number;
};

const CHALLENGE_MINUTES = 20;

function formatMinutesShort(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function RingProgress({
  percent,
  size = 56,
  color = '#3d6b42',
}: {
  percent: number;
  size?: number;
  color?: string;
}) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = c * (1 - clamped / 100);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke="#e8eee8"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90, ${center}, ${center})`}
        />
      </Svg>
      <Text style={ringStyles.label}>{Math.round(clamped)}%</Text>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  label: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '800',
    color: '#3d6b42',
  },
});

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const scrollBottomPad = Math.max(insets.bottom, 10) + 118;

  const [displayName, setDisplayName] = useState('there');
  const [metrics, setMetrics] = useState<HomeMetrics>({
    streak: 0,
    caloriesThisWeek: 0,
    workoutsThisWeek: 0,
    activeMinutesThisWeek: 0,
    todayMinutes: 0,
  });

  const refreshHomeData = useCallback(async () => {
    let greeting = 'there';
    try {
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
      if (greeting === 'there') {
        const user = await ensureDefaultUser();
        if (user.displayName?.trim()) greeting = user.displayName.trim();
      }
    } catch {
    }
    setDisplayName(greeting);

    try {
      const userId = await resolvePilatesApiUserId();
      const [analytics, completions] = await Promise.all([
        generateAnalytics(userId),
        loadCompletions(),
      ]);
      const userEntries = filterCompletionsForUser(completions, userId);
      const weekEntries = filterCompletionsByPeriod(userEntries, '7d', new Date());
      setMetrics({
        streak: analytics.streak,
        caloriesThisWeek: totalCaloriesBurned(weekEntries),
        workoutsThisWeek: totalCompletedSessions(weekEntries),
        activeMinutesThisWeek: totalMinutes(weekEntries),
        todayMinutes: analytics.progress.todayMinutes,
      });
    } catch (e) {
      console.warn('[FitLife] HomeScreen metrics failed', e);
      setMetrics({
        streak: 0,
        caloriesThisWeek: 0,
        workoutsThisWeek: 0,
        activeMinutesThisWeek: 0,
        todayMinutes: 0,
      });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshHomeData();
    }, [refreshHomeData]),
  );

  const openFitnessTab = useCallback(() => {
    navigation.navigate('Fitness');
  }, [navigation]);

  const openYogaTab = useCallback(() => {
    navigation.navigate('Yoga');
  }, [navigation]);

  const openPilatesTab = useCallback(() => {
    navigation.navigate('Search', { screen: 'PilatesHome' });
  }, [navigation]);

  const openProgress = useCallback(() => {
    navigation.navigate('Search', {
      screen: 'PilatesHome',
      params: { screen: 'Progress' },
    });
  }, [navigation]);

  const openBooking = useCallback(() => {
    navigation.navigate('Yoga', { screen: 'Schedule' });
  }, [navigation]);

  const openUpcoming = useCallback(() => {
    navigation.navigate('Yoga', { screen: 'Upcoming' });
  }, [navigation]);

  const challengePercent = Math.min(
    100,
    Math.round((metrics.todayMinutes / CHALLENGE_MINUTES) * 100),
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Math.max(insets.top, 12) + 8,
          paddingBottom: scrollBottomPad,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.appTitle}>FitLife</Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTextCol}>
          <Text style={styles.greeting}>Hello, {displayName}! 👋</Text>
          <Text style={styles.greetingSub}>You&apos;re doing great today!</Text>
        </View>
        <View style={styles.streakPill}>
          <Ionicons name="flame" size={18} color="#c9782e" />
          <Text style={styles.streakValue}>{metrics.streak}</Text>
          <Text style={styles.streakLabel}>Day streak</Text>
        </View>
      </View>

      <View style={styles.statsCard}>
        <StatItem
          icon="flame-outline"
          iconColor="#3d6b42"
          iconBg="#e8f5eb"
          value={String(metrics.caloriesThisWeek)}
          label="kcal burned"
        />
        <StatItem
          icon="walk-outline"
          iconColor="#c9782e"
          iconBg="#fff4e8"
          value="—"
          label="steps"
        />
        <StatItem
          icon="time-outline"
          iconColor="#c94444"
          iconBg="#fdecef"
          value={formatMinutesShort(metrics.activeMinutesThisWeek)}
          label="active"
        />
        <StatItem
          icon="water-outline"
          iconColor="#3b7ec8"
          iconBg="#e8f2fc"
          value="—"
          label="water"
        />
      </View>

      <View style={styles.challengeCard}>
        <View style={styles.challengeTextCol}>
          <Text style={styles.challengeTitle}>Today&apos;s challenge</Text>
          <Text style={styles.challengeSub}>
            Complete a {CHALLENGE_MINUTES}-minute workout
          </Text>
        </View>
        <RingProgress percent={challengePercent} />
      </View>

      <Text style={styles.sectionTitle}>Choose your activity</Text>

      <View style={styles.activityColumn}>
        <Pressable
          style={({ pressed }) => [styles.activityPressable, pressed && styles.cardPressed]}
          onPress={openFitnessTab}
        >
          <ActivityCard
            icon="barbell-outline"
            title="Fitness"
            subtitle="Strength & conditioning"
            accent="#2d8a45"
            tags={['35 min', 'Intermediate']}
          />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.activityPressable, pressed && styles.cardPressed]}
          onPress={openYogaTab}
        >
          <ActivityCard
            icon="leaf-outline"
            title="Yoga"
            subtitle="Balance & mobility"
            accent="#c9782e"
            tags={['45 min', 'Beginner']}
          />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.activityPressable, pressed && styles.cardPressed]}
          onPress={openPilatesTab}
        >
          <ActivityCard
            icon="body-outline"
            title="Pilates"
            subtitle="Core & flexibility"
            accent="#c94444"
            tags={['40 min', 'Intermediate']}
          />
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Upcoming class</Text>
      <Pressable
        style={({ pressed }) => [styles.upcomingCard, pressed && styles.cardPressed]}
        onPress={openUpcoming}
      >
        <View style={styles.upcomingIconWrap}>
          <Ionicons name="fitness-outline" size={28} color="#7c6aad" />
        </View>
        <View style={styles.upcomingTextCol}>
          <Text style={styles.upcomingTitle}>Yoga Flow</Text>
          <Text style={styles.upcomingSub}>18:00 – 19:00 · Beginner</Text>
        </View>
        <View style={styles.instructorBadge}>
          <Ionicons name="person-circle-outline" size={28} color="#7c6aad" />
        </View>
      </Pressable>

      <Text style={styles.sectionTitle}>Shortcuts</Text>
      <View style={styles.quickGrid}>
        <QuickAction
          icon="play-outline"
          label="Start Workout"
          color="#2d8a45"
          bg="#e8f5eb"
          onPress={openFitnessTab}
        />
        <QuickAction
          icon="stats-chart-outline"
          label="Progress"
          color="#3d6b42"
          bg="#eef6ee"
          onPress={openProgress}
        />
        <QuickAction
          icon="calendar-outline"
          label="Booking"
          color="#c9782e"
          bg="#fff4e8"
          onPress={openBooking}
        />
        <QuickAction
          icon="leaf-outline"
          label="Yoga"
          color="#7c6aad"
          bg="#f0ecf8"
          onPress={openYogaTab}
        />
      </View>

      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>Small progress is still progress.</Text>
        <Ionicons name="leaf" size={22} color="#3d6b42" style={styles.quoteIcon} />
      </View>
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
    gap: 14,
  },
  header: {
    alignItems: 'center',
    marginBottom: 2,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#142210',
    letterSpacing: -0.5,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5ebe5',
    gap: 12,
    ...shadowSoft,
  },
  heroTextCol: {
    flex: 1,
    minWidth: 0,
  },
  greeting: { fontSize: 19, fontWeight: '800', color: '#142210', letterSpacing: -0.3 },
  greetingSub: { fontSize: 13, color: '#5c6b5c', marginTop: 6, lineHeight: 18 },
  streakPill: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3faf4',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 72,
    borderWidth: 1,
    borderColor: '#dce8de',
  },
  streakValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#142210',
    marginTop: 2,
  },
  streakLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5c6b5c',
    marginTop: 2,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e5ebe5',
    ...shadowSoft,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#142210',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7a6b',
    marginTop: 2,
    fontWeight: '600',
    textAlign: 'center',
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5ebe5',
    gap: 12,
    ...shadowSoft,
  },
  challengeTextCol: {
    flex: 1,
    minWidth: 0,
  },
  challengeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#142210',
  },
  challengeSub: {
    fontSize: 13,
    color: '#5c6b5c',
    marginTop: 6,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1a2218',
    letterSpacing: -0.3,
    marginTop: 6,
  },
  activityColumn: {
    gap: 12,
  },
  activityPressable: {
    width: '100%',
  },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  activityCard: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5ebe5',
    overflow: 'hidden',
    ...shadowSoft,
  },
  activityAccentEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  activityCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 14,
    paddingLeft: 18,
    minHeight: 96,
  },
  activityIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityTextCol: {
    flex: 1,
    minWidth: 0,
    paddingRight: 6,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#142210',
    letterSpacing: -0.2,
  },
  activitySub: {
    fontSize: 12,
    color: '#5c6b5c',
    lineHeight: 17,
    marginTop: 3,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#f3f6f3',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4a564a',
  },
  activityChevron: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f6f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f0fa',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e6dff0',
    gap: 12,
    ...shadowSoft,
  },
  upcomingIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingTextCol: {
    flex: 1,
    minWidth: 0,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#142210',
  },
  upcomingSub: {
    fontSize: 12,
    color: '#6b6080',
    marginTop: 4,
  },
  instructorBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAction: {
    width: '48%',
    flexGrow: 1,
    minWidth: '46%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5ebe5',
    alignItems: 'center',
    ...shadowSoft,
  },
  quickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#142210',
    textAlign: 'center',
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5eb',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#d4e8d8',
  },
  quoteText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#2a4a2e',
    lineHeight: 22,
  },
  quoteIcon: {
    marginLeft: 10,
    opacity: 0.7,
  },
});

function StatItem({
  icon,
  iconColor,
  iconBg,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActivityCard({
  icon,
  title,
  subtitle,
  accent,
  tags = [],
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  accent: string;
  tags?: string[];
}) {
  return (
    <View style={styles.activityCard}>
      <View style={[styles.activityAccentEdge, { backgroundColor: accent }]} />
      <View style={styles.activityCardInner}>
        <View style={[styles.activityIconWrap, { backgroundColor: `${accent}18` }]}>
          <Ionicons name={icon} size={24} color={accent} />
        </View>
        <View style={styles.activityTextCol}>
          <Text style={styles.activityTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.activitySub} numberOfLines={2}>
            {subtitle}
          </Text>
          {tags.length > 0 ? (
            <View style={styles.tagRow}>
              {tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
        <View style={styles.activityChevron}>
          <Ionicons name="chevron-forward" size={17} color={accent} />
        </View>
      </View>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  color,
  bg,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.quickAction, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={[styles.quickIconWrap, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}