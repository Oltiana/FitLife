import { Ionicons } from '@expo/vector-icons';
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
import { useAdminDashboardViewModel, type Section, type UserRole } from '../viewmodels/useAdminDashboardViewModel';
import type { AdminUser } from '../../../api/adminApi';

const ALL_NAV_ITEMS = [
  { id: 'home', label: 'Dashboard', icon: 'grid-outline', roles: ['Admin', 'Inspector', 'FitnessManager'] },
  { id: 'users', label: 'Users', icon: 'people-outline', roles: ['Admin'] },
  { id: 'pilates', label: 'Pilates', icon: 'body-outline', roles: ['Admin'] },
  { id: 'yoga', label: 'Yoga', icon: 'leaf-outline', roles: ['Admin', 'Inspector'] },
  { id: 'fitness', label: 'Fitness', icon: 'barbell-outline', roles: ['Admin', 'FitnessManager'] },
  { id: 'analytics', label: 'Analytics', icon: 'stats-chart-outline', roles: ['Admin', 'Inspector', 'FitnessManager'] },
] as const;

const ROLE_LABELS: Record<UserRole, string> = {
  Admin: 'Admin',
  Inspector: 'Inspector',
  FitnessManager: 'Fitness Mgr',
  User: 'User',
};

const ROLE_COLORS: Record<UserRole, { bg: string; text: string; icon: string }> = {
  Admin: { bg: '#e8f5eb', text: '#3d6b42', icon: 'shield-checkmark-outline' },
  Inspector: { bg: '#fff4e8', text: '#c9782e', icon: 'eye-outline' },
  FitnessManager: { bg: '#e8f2fc', text: '#3b7ec8', icon: 'barbell-outline' },
  User: { bg: '#f0f4f0', text: '#6b7a6b', icon: 'person-outline' },
};

const screenWidth = Dimensions.get('window').width;
const isWide = Platform.OS === 'web' && screenWidth >= 768;

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const {
    activeSection,
    sidebarOpen,
    setSidebarOpen,
    stats,
    loadingStats,
    handleNavPress,
    refreshStats,
    popupContent,
    setPopupContent,
    recentUsers,
    weeklyTrend,
    role,
  } = useAdminDashboardViewModel();

  const navItems = ALL_NAV_ITEMS.filter(item =>
    (item.roles as readonly string[]).includes(role)
  );

  const roleStyle = ROLE_COLORS[role] ?? ROLE_COLORS.Admin;

  const SidebarContent = () => (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <Ionicons name="cube-outline" size={28} color="#3d6b42" />
        <Text style={styles.sidebarTitle}>FitLife</Text>
        <View style={[styles.rolePill, { backgroundColor: roleStyle.bg }]}>
          <Ionicons name={roleStyle.icon as any} size={11} color={roleStyle.text} />
          <Text style={[styles.rolePillText, { color: roleStyle.text }]}>
            {ROLE_LABELS[role]}
          </Text>
        </View>
      </View>
      <View style={styles.navList}>
        {navItems.map((item) => (
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
        <Pressable style={styles.drawerOverlay} onPress={() => setSidebarOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <SidebarContent />
          </Pressable>
        </Pressable>
      )}

      <View style={styles.main}>
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            {!isWide && (
              <Pressable style={styles.hamburger} onPress={() => setSidebarOpen(true)}>
                <Ionicons name="menu-outline" size={28} color="#142210" />
              </Pressable>
            )}
            <Text style={styles.pageTitle}>
              {navItems.find((n) => n.id === activeSection)?.label ?? 'Dashboard'}
            </Text>
          </View>
          <View style={[styles.adminBadge, { backgroundColor: roleStyle.bg }]}>
            <Ionicons name={roleStyle.icon as any} size={14} color={roleStyle.text} />
            <Text style={[styles.adminBadgeText, { color: roleStyle.text }]}>
              {ROLE_LABELS[role]}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {activeSection === 'home' && (
            <HomeSection
              stats={stats}
              loading={loadingStats}
              onNavigate={handleNavPress}
              recentUsers={recentUsers}
              weeklyTrend={weeklyTrend}
              role={role}
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
              readOnly={role === 'Admin'}
              onBack={() => handleNavPress('home')}
              onShowPopup={(content) => setPopupContent(content)}
              onHidePopup={() => setPopupContent(null)}
              onProgramsChanged={refreshStats}
            />
          )}
          {activeSection === 'fitness' && (
            <AdminFitnessScreen
              onShowPopup={(content) => setPopupContent(content)}
              onHidePopup={() => setPopupContent(null)}
            />
          )}
        </ScrollView>
      </View>

      {popupContent && (
        <Pressable style={styles.overlay} onPress={() => setPopupContent(null)}>
          <View
            style={styles.popup}
            onStartShouldSetResponder={() => true}
          >
            {popupContent}
          </View>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

function HomeSection({
  stats,
  loading,
  onNavigate,
  recentUsers,
  weeklyTrend,
  role,
}: {
  stats: { label: string; value: string; icon: string; color: string; bg: string; section: Section }[];
  loading: boolean;
  onNavigate: (section: Section) => void;
  recentUsers: AdminUser[];
  weeklyTrend: number;
  role: UserRole;
}) {
  const trendPositive = weeklyTrend >= 0;
  const isAdmin = role === 'Admin';

  const quickActions = ALL_NAV_ITEMS.filter(item =>
    (item.roles as readonly string[]).includes(role) && item.id !== 'home'
  );

  const ACTION_COLORS: Record<string, { color: string; bg: string }> = {
    users: { color: '#3d6b42', bg: '#e8f5eb' },
    pilates: { color: '#c94444', bg: '#fdecef' },
    yoga: { color: '#c9782e', bg: '#fff4e8' },
    fitness: { color: '#3b7ec8', bg: '#e8f2fc' },
    analytics: { color: '#7c6aad', bg: '#f0ecf8' },
  };

  if (role === 'Inspector') {
    return (
      <View style={{ gap: 16 }}>
        <View style={[styles.trendBanner, { backgroundColor: '#fff4e8' }]}>
          <Ionicons name="eye-outline" size={20} color="#c9782e" />
          <Text style={[styles.trendText, { color: '#c9782e' }]}>
            Welcome, Inspector! Manage Yoga sessions and classes.
          </Text>
        </View>
        <Text style={styles.sectionHeading}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionCard icon="leaf-outline" label="Yoga" color="#c9782e" bg="#fff4e8" onPress={() => onNavigate('yoga')} />
          <ActionCard icon="stats-chart-outline" label="Analytics" color="#7c6aad" bg="#f0ecf8" onPress={() => onNavigate('analytics')} />
        </View>
      </View>
    );
  }

  if (role === 'FitnessManager') {
    return (
      <View style={{ gap: 16 }}>
        <View style={[styles.trendBanner, { backgroundColor: '#e8f2fc' }]}>
          <Ionicons name="barbell-outline" size={20} color="#3b7ec8" />
          <Text style={[styles.trendText, { color: '#3b7ec8' }]}>
            Welcome, Fitness Manager! Manage workout plans.
          </Text>
        </View>
        <Text style={styles.sectionHeading}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionCard icon="barbell-outline" label="Fitness" color="#3b7ec8" bg="#e8f2fc" onPress={() => onNavigate('fitness')} />
          <ActionCard icon="stats-chart-outline" label="Analytics" color="#7c6aad" bg="#f0ecf8" onPress={() => onNavigate('analytics')} />
        </View>
      </View>
    );
  }

  return (
    <View>
      {isAdmin && (
        <View style={[styles.trendBanner, { backgroundColor: trendPositive ? '#e8f5eb' : '#fdecef' }]}>
          <Ionicons
            name={trendPositive ? 'trending-up-outline' : 'trending-down-outline'}
            size={20}
            color={trendPositive ? '#3d6b42' : '#c94444'}
          />
          <Text style={[styles.trendText, { color: trendPositive ? '#3d6b42' : '#c94444' }]}>
            {trendPositive ? '+' : ''}{weeklyTrend}% new users this week vs last week
          </Text>
        </View>
      )}

      {isAdmin && (
        <>
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
        </>
      )}

      {isAdmin && recentUsers.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionHeading}>Recent Users</Text>
            <Pressable onPress={() => onNavigate('users')}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          <View style={styles.recentCard}>
            {recentUsers.map((user, index) => (
              <View
                key={user.id}
                style={[styles.userRow, index < recentUsers.length - 1 && styles.userRowBorder]}
              >
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {user.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.fullName}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <View style={styles.userMeta}>
                  <View style={[styles.roleBadge, user.role === 'Admin' ? styles.roleBadgeAdmin : styles.roleBadgeUser]}>
                    <Text style={styles.roleBadgeText}>{user.role}</Text>
                  </View>
                  <Text style={styles.userDate}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      <Text style={styles.sectionHeading}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((item) => {
          const c = ACTION_COLORS[item.id] ?? { color: '#6b7a6b', bg: '#f0f4f0' };
          return (
            <ActionCard
              key={item.id}
              icon={item.icon}
              label={item.label}
              color={c.color}
              bg={c.bg}
              onPress={() => onNavigate(item.id as Section)}
            />
          );
        })}
      </View>
    </View>
  );
}

function ActionCard({ icon, label, color, bg, onPress }: { icon: string; label: string; color: string; bg: string; onPress?: () => void }) {
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

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#f4f7f4' },
  sidebar: { width: 200, backgroundColor: '#fff', borderRightWidth: 1, borderRightColor: '#e5ebe5', paddingTop: 20, paddingBottom: 20, justifyContent: 'space-between', height: '100%' },
  drawerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 100, flexDirection: 'row' },
  sidebarHeader: { alignItems: 'center', paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#f0f4f0', marginBottom: 8 },
  sidebarTitle: { fontSize: 18, fontWeight: '800', color: '#142210', marginTop: 6, marginBottom: 6 },
  rolePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  rolePillText: { fontSize: 11, fontWeight: '700' },
  navList: { flex: 1, paddingHorizontal: 10, gap: 4 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  navItemActive: { backgroundColor: '#e8f5eb' },
  navLabel: { fontSize: 13, fontWeight: '600', color: '#6b7a6b' },
  navLabelActive: { color: '#3d6b42', fontWeight: '700' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#fdecef' },
  logoutText: { fontSize: 13, fontWeight: '700', color: '#c94444' },
  main: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5ebe5' },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hamburger: { padding: 4 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#142210' },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  adminBadgeText: { fontSize: 12, fontWeight: '700' },
  content: { padding: 20, gap: 8 },
  trendBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginBottom: 8 },
  trendText: { fontSize: 13, fontWeight: '700' },
  sectionHeading: { fontSize: 15, fontWeight: '800', color: '#1a2218', marginBottom: 12, marginTop: 8 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 8 },
  seeAll: { fontSize: 12, fontWeight: '700', color: '#3d6b42' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, minWidth: 130, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e5ebe5' },
  statIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 22, fontWeight: '800', color: '#142210' },
  statLabel: { fontSize: 11, color: '#6b7a6b', fontWeight: '600', marginTop: 4, textAlign: 'center' },
  recentCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5ebe5', overflow: 'hidden', marginBottom: 8 },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  userRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f0f4f0' },
  userAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#e8f5eb', alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontSize: 16, fontWeight: '800', color: '#3d6b42' },
  userInfo: { flex: 1 },
  userName: { fontSize: 13, fontWeight: '700', color: '#142210' },
  userEmail: { fontSize: 11, color: '#6b7a6b', marginTop: 2 },
  userMeta: { alignItems: 'flex-end', gap: 4 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  roleBadgeAdmin: { backgroundColor: '#e8f5eb' },
  roleBadgeUser: { backgroundColor: '#f0f4f0' },
  roleBadgeText: { fontSize: 10, fontWeight: '700', color: '#3d6b42' },
  userDate: { fontSize: 10, color: '#a0b0a0', fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { flex: 1, minWidth: 130, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e5ebe5' },
  actionIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 12, fontWeight: '700', color: '#142210', textAlign: 'center' },
  overlay: { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', zIndex: 9999, ...Platform.select({ web: { position: 'fixed' as any }, default: {} }) },
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