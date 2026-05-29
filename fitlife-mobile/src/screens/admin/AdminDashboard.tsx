import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { type ReactNode } from 'react';
import { AdminPilatesScreen } from './AdminPilatesScreen';
import { AdminYogaScreen } from './AdminYogaScreen';
import { AdminUsersScreen } from './AdminUsersScreen';
import { AdminAnalyticsScreen } from './AdminAnalyticsScreen';
import { AdminFitnessScreen } from './AdminFitnessScreen';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAdminStats } from '../../api/adminApi';

type Section = 'home' | 'users' | 'pilates' | 'yoga' | 'fitness'| 'analytics';

type AdminStats = {
  totalUsers: number;
  totalPilatesPrograms: number;
  totalYogaClasses: number;
  totalFitnessExercises: number;
};

const NAV_ITEMS = [
  { id: 'home', label: 'Dashboard', icon: 'grid-outline' },
  { id: 'users', label: 'Users', icon: 'people-outline' },
  { id: 'pilates', label: 'Pilates', icon: 'body-outline' },
  { id: 'yoga', label: 'Yoga', icon: 'leaf-outline' },
  { id: 'fitness', label: 'Fitness', icon: 'barbell-outline' },
  { id: 'analytics', label: 'Analytics', icon: 'stats-chart-outline' },
] as const;

const screenWidth = Dimensions.get('window').width;
const isWide = Platform.OS === 'web' && screenWidth >= 768;

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPilatesPrograms: 0,
    totalYogaClasses: 0,
    totalFitnessExercises: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [popupContent, setPopupContent] = useState<ReactNode>(null);

  const refreshStats = useCallback(() => {
    getAdminStats()
      .then(setStats)
      .catch(console.warn);
  }, []);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(console.warn)
      .finally(() => setLoadingStats(false));
  }, []);

  const STATS = [
    { label: 'Total Users', value: String(stats.totalUsers), icon: 'people-outline', color: '#3d6b42', bg: '#e8f5eb', section: 'users' as Section },
    { label: 'Pilates Programs', value: String(stats.totalPilatesPrograms), icon: 'body-outline', color: '#c94444', bg: '#fdecef', section: 'pilates' as Section },
    { label: 'Yoga Classes', value: String(stats.totalYogaClasses), icon: 'leaf-outline', color: '#c9782e', bg: '#fff4e8', section: 'yoga' as Section },
    { label: 'Workout Plans', value: String(stats.totalFitnessExercises), icon: 'barbell-outline', color: '#3b7ec8', bg: '#e8f2fc', section: 'fitness' as Section },
  ];

  const handleNavPress = (id: Section) => {
    setActiveSection(id);
    setSidebarOpen(false);
    setPopupContent(null);
  };

  const SidebarContent = () => (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <Ionicons name="cube-outline" size={28} color="#3d6b42" />
        <Text style={styles.sidebarTitle}>FitLife</Text>
        <Text style={styles.sidebarSub}>Admin Panel</Text>
      </View>

      <View style={styles.navList}>
        {NAV_ITEMS.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.navItem, activeSection === item.id && styles.navItemActive]}
            onPress={() => handleNavPress(item.id as Section)}
          >
            <Ionicons
              name={item.icon as any}
              size={20}
              color={activeSection === item.id ? '#3d6b42' : '#6b7a6b'}
            />
            <Text style={[styles.navLabel, activeSection === item.id && styles.navLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.logoutBtn} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={20} color="#c94444" />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isWide && <SidebarContent />}

      {!isWide && sidebarOpen && (
        <Pressable
          style={styles.drawerOverlay}
          onPress={() => setSidebarOpen(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <SidebarContent />
          </Pressable>
        </Pressable>
      )}

      <View style={styles.main}>
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            {!isWide && (
              <Pressable
                style={styles.hamburger}
                onPress={() => setSidebarOpen(true)}
              >
                <Ionicons name="menu-outline" size={28} color="#142210" />
              </Pressable>
            )}
            <Text style={styles.pageTitle}>
              {NAV_ITEMS.find((n) => n.id === activeSection)?.label}
            </Text>
          </View>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#3d6b42" />
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {activeSection === 'home' && (
            <HomeSection
              stats={STATS}
              loading={loadingStats}
              onNavigate={handleNavPress}
            />
          )}
          {activeSection === 'analytics' && (
  <AdminAnalyticsScreen onBack={() => handleNavPress('home')} />
)}
          {activeSection === 'users' && (
            <AdminUsersScreen
              onShowPopup={(content) => setPopupContent(content)}
              onHidePopup={() => setPopupContent(null)}
              onBack={() => handleNavPress('home')}
            />
          )}
          {activeSection === 'pilates' && (
            <AdminPilatesScreen
              onShowPopup={(content) => setPopupContent(content)}
              onHidePopup={() => setPopupContent(null)}
              onProgramsChanged={refreshStats}
              
            />
          )}
          {activeSection === 'yoga' && (
            <AdminYogaScreen
              onShowPopup={(content) => setPopupContent(content)}
              onHidePopup={() => setPopupContent(null)}
              onProgramsChanged={refreshStats}
            />
          )}
          {activeSection === 'fitness' && (
            <PlaceholderSection title="Fitness" description="Manage fitness workout plans." icon="barbell-outline" />
          )}
        </ScrollView>
      </View>

      {popupContent && (
        <Pressable
          style={styles.overlay}
          onPress={() => setPopupContent(null)}
        >
          <Pressable
            style={styles.popup}
            onPress={(e) => e.stopPropagation()}
          >
            {popupContent}
          </Pressable>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

function HomeSection({
  stats,
  loading,
  onNavigate,
}: {
  stats: { label: string; value: string; icon: string; color: string; bg: string; section: Section }[];
  loading: boolean;
  onNavigate: (section: Section) => void;
}) {
  return (
    <View>
      <Text style={styles.sectionHeading}>Overview</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#3d6b42" style={{ marginVertical: 24 }} />
      ) : (
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <Pressable
              key={stat.label}
              style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
              onPress={() => onNavigate(stat.section)}
            >
              <View style={[styles.statIconWrap, { backgroundColor: stat.bg }]}>
                <Ionicons name={stat.icon as any} size={22} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Ionicons name="chevron-forward-outline" size={12} color="#a0b0a0" style={{ marginTop: 4 }} />
            </Pressable>
          ))}
        </View>
      )}
      <Text style={styles.sectionHeading}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <ActionCard
  icon="stats-chart-outline"
  label="Analytics"
  color="#3b7ec8"
  bg="#e8f2fc"
  onPress={() => onNavigate('analytics')}
/>
        <ActionCard icon="notifications-outline" label="Announcements" color="#c9782e" bg="#fff4e8" />
        <ActionCard icon="settings-outline" label="Settings" color="#6b7a6b" bg="#f0f4f0" />
        <ActionCard icon="shield-checkmark-outline" label="Permissions" color="#7c6aad" bg="#f0ecf8" />
      </View>
    </View>
  );
}

function ActionCard({
  icon, label, color, bg, onPress
}: {
  icon: string;
  label: string;
  color: string;
  bg: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
      onPress={onPress}
    >
      <View style={[styles.actionIconWrap, { backgroundColor: bg }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function PlaceholderSection({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <View style={styles.placeholder}>
      <Ionicons name={icon as any} size={48} color="#c8d5c8" />
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderDesc}>{description}</Text>
      <Text style={styles.placeholderHint}>CRUD functionality — coming next step.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f4f7f4',
  },
  sidebar: {
    width: 200,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e5ebe5',
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
    height: '100%',
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 100,
    flexDirection: 'row',
  },
  sidebarHeader: {
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f0',
    marginBottom: 8,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#142210',
    marginTop: 6,
  },
  sidebarSub: {
    fontSize: 11,
    color: '#6b7a6b',
    fontWeight: '600',
    marginTop: 2,
  },
  navList: {
    flex: 1,
    paddingHorizontal: 10,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  navItemActive: { backgroundColor: '#e8f5eb' },
  navLabel: { fontSize: 13, fontWeight: '600', color: '#6b7a6b' },
  navLabelActive: { color: '#3d6b42', fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#fdecef',
  },
  logoutText: { fontSize: 13, fontWeight: '700', color: '#c94444' },
  main: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5ebe5',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hamburger: { padding: 4 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#142210' },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e8f5eb',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  adminBadgeText: { fontSize: 12, fontWeight: '700', color: '#3d6b42' },
  content: { padding: 20, gap: 8 },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a2218',
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: 130,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5ebe5',
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: '#142210' },
  statLabel: {
    fontSize: 11,
    color: '#6b7a6b',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: 130,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5ebe5',
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionLabel: { fontSize: 12, fontWeight: '700', color: '#142210', textAlign: 'center' },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  placeholderTitle: { fontSize: 20, fontWeight: '800', color: '#142210' },
  placeholderDesc: {
    fontSize: 14,
    color: '#6b7a6b',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },
  placeholderHint: { fontSize: 12, color: '#a0b0a0', fontWeight: '600', marginTop: 4 },
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    ...Platform.select({
      web: { position: 'fixed' as any },
      default: {},
    }),
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 520,
    maxHeight: '85%',
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 32px rgba(0,0,0,0.18)',
        overflowY: 'auto' as const,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 32,
        elevation: 10,
      },
    }),
  },
});