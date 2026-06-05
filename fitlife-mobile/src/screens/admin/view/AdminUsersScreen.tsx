import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  getAdminUsers,
  getAdminUserDetails,
  updateUserRole,
  deleteUser,
  type AdminUser,
  type AdminUserDetails,
} from '../../../api/adminApi';

type Tab = 'info' | 'bookings';

const ROLES = ['User', 'Admin', 'Inspector', 'FitnessManager'] as const;
type Role = typeof ROLES[number];

const ROLE_STYLES: Record<Role, { bg: string; text: string; icon: string }> = {
  User:           { bg: '#EEF2F9', text: '#4A6FA5', icon: 'person-outline' },
  Admin:          { bg: '#D6EAF8', text: '#1A5276', icon: 'shield-checkmark-outline' },
  Inspector:      { bg: '#FFF3CD', text: '#856404', icon: 'eye-outline' },
  FitnessManager: { bg: '#D4EDDA', text: '#155724', icon: 'barbell-outline' },
};

const screenWidth = Dimensions.get('window').width;
const isWide = Platform.OS === 'web' && screenWidth >= 768;

const confirmAction = (message: string, onConfirm: () => void) => {
  if (Platform.OS === 'web') {
    if (window.confirm(message)) onConfirm();
  } else {
    Alert.alert('Confirm', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: onConfirm },
    ]);
  }
};

export function AdminUsersScreen({
  onShowPopup,
  onHidePopup,
  onBack,
}: {
  onShowPopup: (content: ReactNode) => void;
  onHidePopup: () => void;
  onBack?: () => void;
}) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      setUsers(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadUsers(); }, []);

  const showPopupForUser = (user: AdminUserDetails, tab: Tab = 'info') => {
    onShowPopup(
      <PopupContent
        user={user}
        initialTab={tab}
        onClose={onHidePopup}
        onRoleChange={async (u, newRole) => {
          confirmAction(`Change ${u.fullName}'s role to ${newRole}?`, async () => {
            await updateUserRole(u.id, newRole);
            await loadUsers();
            const updated = await getAdminUserDetails(u.id);
            showPopupForUser(updated, tab);
          });
        }}
        onDelete={async (u) => {
          confirmAction(`Are you sure you want to delete ${u.fullName}?`, async () => {
            await deleteUser(u.id);
            await loadUsers();
            onHidePopup();
          });
        }}
      />
    );
  };

  const openUserDetail = async (user: AdminUser) => {
    onShowPopup(<ActivityIndicator size="large" color="#4A6FA5" style={{ marginVertical: 40 }} />);
    try {
      const details = await getAdminUserDetails(user.id);
      showPopupForUser(details);
    } catch (e) {
      console.warn(e);
      onHidePopup();
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4A6FA5" style={{ marginTop: 60 }} />;
  }

  return (
    <>
      
      <ScrollView contentContainerStyle={styles.list}>
        {users.map((user) => {
          const roleStyle = ROLE_STYLES[user.role as Role] ?? ROLE_STYLES.User;
          return (
            <Pressable
              key={user.id}
              style={({ pressed }) => [styles.userCard, pressed && { opacity: 0.85 }]}
              onPress={() => openUserDetail(user)}
            >
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarText}>{user.fullName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.fullName}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: roleStyle.bg }]}>
                    <Ionicons name={roleStyle.icon as any} size={10} color={roleStyle.text} />
                    <Text style={[styles.badgeText, { color: roleStyle.text }]}>{user.role}</Text>
                  </View>
                  <View style={[styles.badge, user.isVerified ? styles.badgeVerified : styles.badgeUnverified]}>
                    <Text style={styles.badgeText}>{user.isVerified ? 'Verified' : 'Unverified'}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#A8BDD6" />
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );
}

function PopupContent({
  user,
  initialTab,
  onClose,
  onRoleChange,
  onDelete,
}: {
  user: AdminUserDetails;
  initialTab: Tab;
  onClose: () => void;
  onRoleChange: (user: AdminUserDetails, newRole: Role) => Promise<void>;
  onDelete: (user: AdminUserDetails) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ gap: 16 }}>
        <View style={styles.popupTopBar}>
          <Text style={styles.popupTitle}>User Details</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close-circle-outline" size={26} color="#4A6FA5" />
          </Pressable>
        </View>

        <View style={styles.modalHeader}>
          <View style={styles.avatarWrapLarge}>
            <Text style={styles.avatarTextLarge}>{user.fullName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.modalName}>{user.fullName}</Text>
          <Text style={styles.modalEmail}>{user.email}</Text>
          {(() => {
            const rs = ROLE_STYLES[user.role as Role] ?? ROLE_STYLES.User;
            return (
              <View style={[styles.currentRoleBadge, { backgroundColor: rs.bg }]}>
                <Ionicons name={rs.icon as any} size={12} color={rs.text} />
                <Text style={[styles.currentRoleText, { color: rs.text }]}>{user.role}</Text>
              </View>
            );
          })()}
        </View>

        <View style={styles.tabRow}>
          {([
            { id: 'info', label: 'Info', icon: 'person-outline' },
            { id: 'bookings', label: 'Bookings', icon: 'calendar-outline' },
          ] as { id: Tab; label: string; icon: string }[]).map((tab) => (
            <Pressable
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons name={tab.icon as any} size={14} color={activeTab === tab.id ? '#4A6FA5' : '#7A90A8'} />
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'info' && (
          <View style={styles.detailGrid}>
            <DetailItem icon="shield-outline" label="Role" value={user.role} />
            <DetailItem icon="checkmark-circle-outline" label="Verified" value={user.isVerified ? 'Yes' : 'No'} />
            <DetailItem icon="calendar-outline" label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
          </View>
        )}

        {activeTab === 'bookings' && (
          <View style={styles.detailGrid}>
            {user.bookings.length === 0 ? (
              <Text style={styles.emptyText}>No bookings found.</Text>
            ) : (
              user.bookings.map((b) => (
                <View key={b.id} style={styles.listItem}>
                  <Ionicons name="calendar-outline" size={16} color="#4A6FA5" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listItemTitle}>Booking #{b.id}</Text>
                    <Text style={styles.listItemSub}>Session #{b.sessionId} · {new Date(b.bookingDate).toLocaleDateString()}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={styles.modalActions}>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnRole]}
            onPress={() => setShowRoleMenu(!showRoleMenu)}
          >
            <Ionicons name="swap-horizontal-outline" size={18} color="#4A6FA5" />
            <Text style={[styles.actionBtnText, { color: '#4A6FA5' }]}>Change Role</Text>
            <Ionicons name={showRoleMenu ? 'chevron-up' : 'chevron-down'} size={16} color="#4A6FA5" />
          </Pressable>

          {showRoleMenu && (
            <View style={styles.roleMenu}>
              {ROLES.filter(r => r !== user.role).map((r) => {
                const rs = ROLE_STYLES[r];
                return (
                  <Pressable
                    key={r}
                    style={[styles.roleMenuItem, { backgroundColor: rs.bg }]}
                    onPress={() => {
                      setShowRoleMenu(false);
                      onRoleChange(user, r);
                    }}
                  >
                    <Ionicons name={rs.icon as any} size={16} color={rs.text} />
                    <Text style={[styles.roleMenuItemText, { color: rs.text }]}>Make {r}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Pressable
            style={[styles.actionBtn, styles.actionBtnDelete]}
            onPress={() => onDelete(user)}
          >
            <Ionicons name="trash-outline" size={18} color="#c94444" />
            <Text style={[styles.actionBtnText, { color: '#c94444' }]}>Delete User</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function DetailItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Ionicons name={icon as any} size={16} color="#4A6FA5" />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10, paddingBottom: 20 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#EEF2F9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginBottom: 12 },
  backText: { fontSize: 13, fontWeight: '700', color: '#4A6FA5' },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#D0DCF0', gap: 12 },
  avatarWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF2F9', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#4A6FA5' },
  userInfo: { flex: 1, gap: 4 },
  userName: { fontSize: 14, fontWeight: '700', color: '#0F1D2E' },
  userEmail: { fontSize: 12, color: '#7A90A8' },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeVerified: { backgroundColor: '#D6EAF8' },
  badgeUnverified: { backgroundColor: '#FDEDF5' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#0F1D2E' },
  popupTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  popupTitle: { fontSize: 16, fontWeight: '800', color: '#0F1D2E' },
  modalHeader: { alignItems: 'center', gap: 6 },
  avatarWrapLarge: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EEF2F9', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatarTextLarge: { fontSize: 28, fontWeight: '800', color: '#4A6FA5' },
  modalName: { fontSize: 18, fontWeight: '800', color: '#0F1D2E' },
  modalEmail: { fontSize: 13, color: '#7A90A8' },
  currentRoleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, marginTop: 4 },
  currentRoleText: { fontSize: 12, fontWeight: '700' },
  tabRow: { flexDirection: 'row', backgroundColor: '#EEF2F9', borderRadius: 12, padding: 4, gap: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 10 },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontSize: 11, fontWeight: '600', color: '#7A90A8' },
  tabTextActive: { color: '#4A6FA5', fontWeight: '700' },
  detailGrid: { gap: 10, backgroundColor: '#EEF2F9', borderRadius: 16, padding: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { fontSize: 13, color: '#7A90A8', flex: 1 },
  detailValue: { fontSize: 13, fontWeight: '700', color: '#0F1D2E' },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#D0DCF0' },
  listItemTitle: { fontSize: 13, fontWeight: '700', color: '#0F1D2E' },
  listItemSub: { fontSize: 11, color: '#7A90A8', marginTop: 2 },
  emptyText: { fontSize: 13, color: '#7A90A8', textAlign: 'center', paddingVertical: 20 },
  modalActions: { gap: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  actionBtnRole: { borderColor: '#A8BDD6', backgroundColor: '#EEF2F9' },
  actionBtnDelete: { borderColor: '#c94444', backgroundColor: '#fdecef' },
  actionBtnText: { fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'center' },
  roleMenu: { gap: 8 },
  roleMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  roleMenuItemText: { fontSize: 14, fontWeight: '700' },
});