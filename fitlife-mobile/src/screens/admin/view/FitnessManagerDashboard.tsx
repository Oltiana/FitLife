import { Ionicons } from '@expo/vector-icons';
import { type ReactNode, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminFitnessScreen } from './AdminFitnessScreen';
import { AdminAnalyticsScreen } from './AdminAnalyticsScreen';

type Section = 'home' | 'fitness' | 'analytics';

const NAV_ITEMS = [
  { id: 'home',      label: 'Dashboard', icon: 'grid-outline'        },
  { id: 'fitness',   label: 'Fitness',   icon: 'barbell-outline'     },
  { id: 'analytics', label: 'Analytics', icon: 'stats-chart-outline' },
] as const;

const screenWidth = Dimensions.get('window').width;
const isWide = Platform.OS === 'web' && screenWidth >= 768;

export function FitnessManagerDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [popupContent, setPopupContent] = useState<ReactNode>(null);

  const SidebarContent = () => (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <Ionicons name="cube-outline" size={28} color="#3b7ec8" />
        <Text style={styles.sidebarTitle}>FitLife</Text>
        <View style={styles.rolePill}>
          <Ionicons name="barbell-outline" size={11} color="#3b7ec8" />
          <Text style={styles.rolePillText}>Fitness Mgr</Text>
        </View>
      </View>
      <View style={styles.navList}>
        {NAV_ITEMS.map(item => (
          <Pressable
            key={item.id}
            style={[styles.navItem, activeSection === item.id && styles.navItemActive]}
            onPress={() => { setActiveSection(item.id as Section); setSidebarOpen(false); }}
          >
            <Ionicons
              name={item.icon as any}
              size={20}
              color={activeSection === item.id ? '#3b7ec8' : '#6b7a6b'}
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
              <Pressable style={styles.backBtn} onPress={() => setActiveSection('home')}>
                <Ionicons name="arrow-back-outline" size={18} color="#3b7ec8" />
              </Pressable>
            )}
            <Text style={styles.pageTitle}>
              {NAV_ITEMS.find(n => n.id === activeSection)?.label ?? 'Dashboard'}
            </Text>
          </View>
          <View style={styles.adminBadge}>
            <Ionicons name="barbell-outline" size={14} color="#3b7ec8" />
            <Text style={styles.adminBadgeText}>Fitness Mgr</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {activeSection === 'home' && (
            <View style={{ gap: 16 }}>
              <View style={styles.welcomeBanner}>
                <Ionicons name="barbell-outline" size={20} color="#3b7ec8" />
                <Text style={styles.welcomeText}>Welcome, Fitness Manager! Manage workout plans.</Text>
              </View>
              <Text style={styles.sectionHeading}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <ActionCard icon="barbell-outline" label="Fitness" color="#3b7ec8" bg="#e8f2fc" onPress={() => setActiveSection('fitness')} />
                <ActionCard icon="stats-chart-outline" label="Analytics" color="#7c6aad" bg="#f0ecf8" onPress={() => setActiveSection('analytics')} />
              </View>
            </View>
          )}
          {activeSection === 'fitness' && (
            <AdminFitnessScreen
              onShowPopup={setPopupContent}
              onHidePopup={() => setPopupContent(null)}
            />
          )}
          {activeSection === 'analytics' && (
            <AdminAnalyticsScreen onBack={() => setActiveSection('home')} />
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
  rolePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#e8f2fc' },
  rolePillText: { fontSize: 11, fontWeight: '700', color: '#3b7ec8' },
  navList: { flex: 1, paddingHorizontal: 10, gap: 4 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  navItemActive: { backgroundColor: '#e8f2fc' },
  navLabel: { fontSize: 13, fontWeight: '600', color: '#6b7a6b' },
  navLabelActive: { color: '#3b7ec8', fontWeight: '700' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#fdecef' },
  logoutText: { fontSize: 13, fontWeight: '700', color: '#c94444' },
  main: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5ebe5' },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hamburger: { padding: 4 },
  backBtn: { padding: 4, backgroundColor: '#e8f2fc', borderRadius: 8 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#142210' },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: '#e8f2fc' },
  adminBadgeText: { fontSize: 12, fontWeight: '700', color: '#3b7ec8' },
  content: { padding: 20, gap: 8 },
  welcomeBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: '#e8f2fc' },
  welcomeText: { fontSize: 13, fontWeight: '700', color: '#3b7ec8', flex: 1 },
  sectionHeading: { fontSize: 15, fontWeight: '800', color: '#1a2218' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { flex: 1, minWidth: 130, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e5ebe5' },
  actionIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 12, fontWeight: '700', color: '#142210', textAlign: 'center' },
  overlay: { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', zIndex: 9999, ...Platform.select({ web: { position: 'fixed' as any }, default: {} }) },
  popup: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '90%', maxWidth: 520, maxHeight: '85%', ...Platform.select({ web: { boxShadow: '0px 8px 32px rgba(0,0,0,0.18)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 32, elevation: 10 } }) },
});