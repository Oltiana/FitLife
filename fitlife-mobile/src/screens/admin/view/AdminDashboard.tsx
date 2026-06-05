import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import { AdminPilatesScreen } from './AdminPilatesScreen';
import { AdminYogaScreen } from './AdminYogaScreen';
import { AdminUsersScreen } from './AdminUsersScreen';
import { AdminAnalyticsScreen } from './AdminAnalyticsScreen';
import { AdminFitnessScreen } from './AdminFitnessScreen';
import { AdminActivityLogScreen } from './AdminActivityLogScreen';
import { AdminEnrollmentsScreen } from './AdminEnrollmentsScreen';
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
import { LineChart } from 'react-native-chart-kit';

const ALL_NAV_ITEMS = [
  { id: 'home',          label: 'Dashboard',    icon: 'grid-outline',          roles: ['Admin'] },
  { id: 'users',         label: 'Users',         icon: 'people-outline',        roles: ['Admin'] },
  { id: 'pilates',       label: 'Pilates',       icon: 'body-outline',          roles: ['Admin'] },
  { id: 'yoga',          label: 'Yoga',          icon: 'leaf-outline',          roles: ['Admin'] },
  { id: 'fitness',       label: 'Fitness',       icon: 'barbell-outline',       roles: ['Admin'] },
  { id: 'analytics',     label: 'Analytics',     icon: 'stats-chart-outline',   roles: ['Admin'] },
  { id: 'enrollments',   label: 'Enrollments',   icon: 'list-outline',          roles: ['Admin'] },
  { id: 'activityLog',   label: 'Activity Log',  icon: 'time-outline',          roles: ['Admin'] },
  { id: 'notifications', label: 'Notifications', icon: 'notifications-outline', roles: ['Admin'] },
  { id: 'settings',      label: 'Settings',      icon: 'settings-outline',      roles: ['Admin'] },
] as const;

const ROLE_LABELS: Record<UserRole, string> = {
  Admin: 'Admin',
  Inspector: 'Inspector',
  FitnessManager: 'Fitness Mgr',
  User: 'User',
};

const ROLE_COLORS: Record<UserRole, { bg: string; text: string; icon: string }> = {
  Admin:         { bg: '#e8f5eb', text: '#3d6b42', icon: 'shield-checkmark-outline' },
  Inspector:     { bg: '#fff4e8', text: '#c9782e', icon: 'eye-outline' },
  FitnessManager:{ bg: '#e8f2fc', text: '#3b7ec8', icon: 'barbell-outline' },
  User:          { bg: '#f0f4f0', text: '#6b7a6b', icon: 'person-outline' },
};

const ACTION_COLORS: Record<string, { color: string; bg: string; icon: string }> = {
  analytics:     { color: '#7c6aad', bg: '#f0ecf8', icon: 'stats-chart-outline' },
  enrollments: { color: '#1a3a6b', bg: '#e8eef8', icon: 'list-outline' },
  activityLog:   { color: '#2e7d8c', bg: '#e0f4f7', icon: 'time-outline' },
  notifications: { color: '#e0a020', bg: '#fef9e7', icon: 'notifications-outline' },
  settings:      { color: '#6b7a6b', bg: '#f0f4f0', icon: 'settings-outline' },
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
    analytics,
  } = useAdminDashboardViewModel();

  const navItems = ALL_NAV_ITEMS;
  const roleStyle = ROLE_COLORS[role] ?? ROLE_COLORS.Admin;

  const SidebarContent = () => (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <Ionicons name="cube-outline" size={28} color="#3d6b42" />
        <Text style={styles.sidebarTitle}>FitLife</Text>
        <View style={[styles.rolePill, { backgroundColor: roleStyle.bg }]}>
          <Ionicons name={roleStyle.icon as any} size={11} color={roleStyle.text} />
          <Text style={[styles.rolePillText, { color: roleStyle.text }]}>{ROLE_LABELS[role]}</Text>
        </View>
      </View>
      <View style={styles.navList}>
        {navItems.map(item => (
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
          <Pressable onPress={e => e.stopPropagation()}>
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
            {activeSection !== 'home' && (
              <Pressable style={styles.backBtn} onPress={() => handleNavPress('home')}>
                <Ionicons name="arrow-back-outline" size={18} color="#3d6b42" />
              </Pressable>
            )}
            <Text style={styles.pageTitle}>
              {navItems.find(n => n.id === activeSection)?.label ?? 'Dashboard'}
            </Text>
          </View>
          <View style={[styles.adminBadge, { backgroundColor: roleStyle.bg }]}>
            <Ionicons name={roleStyle.icon as any} size={14} color={roleStyle.text} />
            <Text style={[styles.adminBadgeText, { color: roleStyle.text }]}>{ROLE_LABELS[role]}</Text>
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
              analytics={analytics}
            />
          )}
          {activeSection === 'analytics' && <AdminAnalyticsScreen onBack={() => handleNavPress('home')} />}
          {activeSection === 'users' && (
            <AdminUsersScreen
              onShowPopup={c => setPopupContent(c)}
              onHidePopup={() => setPopupContent(null)}
              onBack={() => handleNavPress('home')}
            />
          )}
          {activeSection === 'pilates' && (
            <AdminPilatesScreen
              onShowPopup={c => setPopupContent(c)}
              onHidePopup={() => setPopupContent(null)}
              onProgramsChanged={refreshStats}
            />
          )}
          {activeSection === 'yoga' && (
            <AdminYogaScreen
              readOnly={true}
              onBack={() => handleNavPress('home')}
              onShowPopup={c => setPopupContent(c)}
              onHidePopup={() => setPopupContent(null)}
              onProgramsChanged={refreshStats}
            />
          )}
          {activeSection === 'fitness' && (
            <AdminFitnessScreen
              onShowPopup={c => setPopupContent(c)}
              onHidePopup={() => setPopupContent(null)}
            />
          )}
          {activeSection === 'enrollments' && <AdminEnrollmentsScreen />}
          {activeSection === 'activityLog' && <AdminActivityLogScreen />}
          {activeSection === 'notifications' && (
            <View style={styles.comingSoon}>
              <Ionicons name="notifications-outline" size={48} color="#e0a020" />
              <Text style={styles.comingSoonTitle}>Notifications</Text>
              <Text style={styles.comingSoonText}>Coming soon — push notifications to all users.</Text>
            </View>
          )}
          {activeSection === 'settings' && (
            <View style={styles.comingSoon}>
              <Ionicons name="settings-outline" size={48} color="#6b7a6b" />
              <Text style={styles.comingSoonTitle}>Settings</Text>
              <Text style={styles.comingSoonText}>Coming soon — app configuration and settings.</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {popupContent && (
        <Pressable style={styles.overlay} onPress={() => setPopupContent(null)}>
          <View style={styles.popup} onStartShouldSetResponder={() => true}>
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
  analytics,
}: {
  stats: { label: string; value: string; icon: string; color: string; bg: string; section: Section }[];
  loading: boolean;
  onNavigate: (section: Section) => void;
  recentUsers: AdminUser[];
  weeklyTrend: number;
  analytics: { userRegistrations: { date: string; count: number }[] } | null;
}) {
  const trendPositive = weeklyTrend >= 0;
  const last7 = analytics?.userRegistrations.slice(-7) ?? [];

  const lineData = {
    labels: last7.length > 0 ? last7.map(d => d.date.slice(5)) : ['No data'],
    datasets: [{ data: last7.length > 0 ? last7.map(d => d.count) : [0], strokeWidth: 3 }],
  };

  const lineConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#eef5ee',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(61,107,66,${opacity})`,
    labelColor: () => '#d05b5b',
    style: { borderRadius: 16 },
    propsForDots: { r: '5', strokeWidth: '2', stroke: '#3d6b42', fill: '#fff' },
    propsForBackgroundLines: { strokeDasharray: '4', stroke: '#e5ebe5', strokeWidth: '1' },
  };

  const QUICK_ACTIONS = [
  { id: 'analytics',     label: 'Analytics',     icon: 'stats-chart-outline',   color: '#7c6aad', bg: '#f0ecf8' },
  { id: 'enrollments', label: 'Enrollments', icon: 'list-outline', color: '#1a3a6b', bg: '#e8eef8' },          
  { id: 'activityLog',   label: 'Activity Log',  icon: 'time-outline',          color: '#2e7d8c', bg: '#e0f4f7' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications-outline', color: '#e0a020', bg: '#fef9e7' },
  { id: 'settings',      label: 'Settings',      icon: 'settings-outline',      color: '#6b7a6b', bg: '#f0f4f0' },
] as const;

  return (
    <View style={{ gap: 16 }}>
      <View style={[hStyles.trendBanner, { backgroundColor: trendPositive ? '#e8f5eb' : '#fdecef' }]}>
        <Ionicons
          name={trendPositive ? 'trending-up-outline' : 'trending-down-outline'}
          size={20}
          color={trendPositive ? '#3d6b42' : '#c94444'}
        />
        <Text style={[hStyles.trendText, { color: trendPositive ? '#3d6b42' : '#c94444' }]}>
          {trendPositive ? '+' : ''}{weeklyTrend}% new users this week vs last week
        </Text>
      </View>

      <Text style={hStyles.sectionHeading}>Overview</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#3d6b42" style={{ marginVertical: 24 }} />
      ) : (
        <View style={hStyles.statsGrid}>
          {stats.map(stat => (
            <Pressable
              key={stat.label}
              style={({ pressed }) => [hStyles.statCard, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
              onPress={() => onNavigate(stat.section)}
            >
              <View style={[hStyles.statIconWrap, { backgroundColor: stat.bg }]}>
                <Ionicons name={stat.icon as any} size={22} color={stat.color} />
              </View>
              <Text style={hStyles.statValue}>{stat.value}</Text>
              <Text style={hStyles.statLabel}>{stat.label}</Text>
              <Ionicons name="chevron-forward-outline" size={12} color="#a0b0a0" style={{ marginTop: 4 }} />
            </Pressable>
          ))}
        </View>
      )}

      {recentUsers.length > 0 && (
        <>
          <View style={hStyles.sectionRow}>
            <Text style={hStyles.sectionHeading}>Recent Users</Text>
            <Pressable onPress={() => onNavigate('users')}>
              <Text style={hStyles.seeAll}>See all</Text>
            </Pressable>
          </View>
          <View style={hStyles.recentCard}>
            {recentUsers.map((user, index) => (
              <View
                key={user.id}
                style={[hStyles.userRow, index < recentUsers.length - 1 && hStyles.userRowBorder]}
              >
                <View style={hStyles.userAvatar}>
                  <Text style={hStyles.userAvatarText}>{user.fullName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={hStyles.userInfo}>
                  <Text style={hStyles.userName}>{user.fullName}</Text>
                  <Text style={hStyles.userEmail}>{user.email}</Text>
                </View>
                <View style={hStyles.userMeta}>
                  <View style={[hStyles.roleBadge, user.role === 'Admin' ? hStyles.roleBadgeAdmin : hStyles.roleBadgeUser]}>
                    <Text style={hStyles.roleBadgeText}>{user.role}</Text>
                  </View>
                  <Text style={hStyles.userDate}>{new Date(user.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      <Text style={hStyles.sectionHeading}>Quick Actions</Text>
      <View style={hStyles.actionsGrid}>
        {QUICK_ACTIONS.map(item => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [hStyles.actionCard, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
            onPress={() => onNavigate(item.id as Section)}
          >
            <View style={[hStyles.actionIconWrap, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon as any} size={24} color={item.color} />
            </View>
            <Text style={hStyles.actionLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const hStyles = StyleSheet.create({
  trendBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12 },
  trendText: { fontSize: 13, fontWeight: '700', flex: 1 },
  sectionHeading: { fontSize: 15, fontWeight: '800', color: '#1a2218' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeAll: { fontSize: 12, fontWeight: '700', color: '#3d6b42' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { flex: 1, minWidth: 130, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e5ebe5' },
  statIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 22, fontWeight: '800', color: '#142210' },
  statLabel: { fontSize: 11, color: '#6b7a6b', fontWeight: '600', marginTop: 4, textAlign: 'center' },
  chartCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#e5ebe5', overflow: 'hidden' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  chartTitle: { fontSize: 15, fontWeight: '800', color: '#142210' },
  chartSub: { fontSize: 11, color: '#6b7a6b', marginTop: 2 },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#e8f5eb', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  viewAllText: { fontSize: 11, fontWeight: '700', color: '#3d6b42' },
  recentCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5ebe5', overflow: 'hidden' },
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
});

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
  backBtn: { padding: 4, backgroundColor: '#e8f5eb', borderRadius: 8 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#142210' },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  adminBadgeText: { fontSize: 12, fontWeight: '700' },
  content: { padding: 20, gap: 8 },
  comingSoon: { alignItems: 'center', marginTop: 60, gap: 12 },
  comingSoonTitle: { fontSize: 16, fontWeight: '800', color: '#142210' },
  comingSoonText: { fontSize: 13, color: '#6b7a6b', textAlign: 'center' },
  overlay: { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', zIndex: 9999, ...Platform.select({ web: { position: 'fixed' as any }, default: {} }) },
  popup: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '90%', maxWidth: 520, maxHeight: '85%', ...Platform.select({ web: { boxShadow: '0px 8px 32px rgba(0,0,0,0.18)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 32, elevation: 10 } }) },
});