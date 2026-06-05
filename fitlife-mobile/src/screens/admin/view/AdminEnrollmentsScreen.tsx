import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllEnrollments, type UserEnrollment } from '../../../api/adminApi';

export function AdminEnrollmentsScreen() {
  const [data, setData] = useState<UserEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    getAllEnrollments()
      .then(setData)
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? data.filter(u =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  const hasAny = (u: UserEnrollment) =>
    u.pilatesEnrollments.length > 0 || u.yogaBookings.length > 0 || u.fitnessPlans.length > 0;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search by name or email..."
        placeholderTextColor="#a0b0a0"
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#3d6b42" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={40} color="#c0d0c0" />
          <Text style={styles.emptyText}>No enrollments found</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filtered.map(user => (
            <View key={user.id} style={styles.userCard}>
              <Pressable style={styles.userHeader} onPress={() => setExpanded(expanded === user.id ? null : user.id)}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user.fullName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.fullName}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.badgeRow}>
                    {user.pilatesEnrollments.length > 0 && (
                      <View style={[styles.badge, { backgroundColor: '#fdecef' }]}>
                        <Ionicons name="body-outline" size={10} color="#c94444" />
                        <Text style={[styles.badgeText, { color: '#c94444' }]}>Pilates {user.pilatesEnrollments.length}</Text>
                      </View>
                    )}
                    {user.yogaBookings.length > 0 && (
                      <View style={[styles.badge, { backgroundColor: '#fff4e8' }]}>
                        <Ionicons name="leaf-outline" size={10} color="#c9782e" />
                        <Text style={[styles.badgeText, { color: '#c9782e' }]}>Yoga {user.yogaBookings.length}</Text>
                      </View>
                    )}
                    {user.fitnessPlans.length > 0 && (
                      <View style={[styles.badge, { backgroundColor: '#e8f2fc' }]}>
                        <Ionicons name="barbell-outline" size={10} color="#3b7ec8" />
                        <Text style={[styles.badgeText, { color: '#3b7ec8' }]}>Fitness {user.fitnessPlans.length}</Text>
                      </View>
                    )}
                    {!hasAny(user) && (
                      <View style={[styles.badge, { backgroundColor: '#f0f4f0' }]}>
                        <Text style={[styles.badgeText, { color: '#6b7a6b' }]}>No enrollments</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons
                  name={expanded === user.id ? 'chevron-up-outline' : 'chevron-down-outline'}
                  size={18}
                  color="#a0b0a0"
                />
              </Pressable>

              {expanded === user.id && (
                <View style={styles.details}>
                  {user.pilatesEnrollments.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Pilates</Text>
                      {user.pilatesEnrollments.map(e => (
                        <View key={e.id} style={styles.detailRow}>
                          <Ionicons name="checkmark-circle-outline" size={14} color="#c94444" />
                          <View>
                            <Text style={styles.detailName}>{e.programName}</Text>
                            <Text style={styles.detailDate}>Enrolled: {new Date(e.enrolledAt).toLocaleDateString()}</Text>
                            {e.completedAt && <Text style={styles.detailDate}>Completed: {new Date(e.completedAt).toLocaleDateString()}</Text>}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {user.yogaBookings.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Yoga</Text>
                      {user.yogaBookings.map(b => (
                        <View key={b.id} style={styles.detailRow}>
                          <Ionicons name="leaf-outline" size={14} color="#c9782e" />
                          <View>
                            <Text style={styles.detailName}>Session #{b.sessionId}</Text>
                            <Text style={styles.detailDate}>{new Date(b.bookingDate).toLocaleDateString()}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {user.fitnessPlans.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Fitness</Text>
                      {user.fitnessPlans.map(p => (
                        <View key={p.id} style={styles.detailRow}>
                          <Ionicons name="barbell-outline" size={14} color="#3b7ec8" />
                          <View>
                            <Text style={styles.detailName}>{p.name}</Text>
                            <Text style={styles.detailDate}>{p.level} · {new Date(p.createdAt).toLocaleDateString()}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5ebe5', paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: '#142210', marginBottom: 12 },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#a0b0a0', fontWeight: '600' },
  userCard: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e5ebe5', overflow: 'hidden' },
  userHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f5eb', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#3d6b42' },
  userInfo: { flex: 1 },
  userName: { fontSize: 13, fontWeight: '700', color: '#142210' },
  userEmail: { fontSize: 11, color: '#6b7a6b', marginTop: 2 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  details: { borderTopWidth: 1, borderTopColor: '#f0f4f0', padding: 14, gap: 12 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#1a2218', marginBottom: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  detailName: { fontSize: 12, fontWeight: '700', color: '#142210' },
  detailDate: { fontSize: 11, color: '#6b7a6b', marginTop: 2 },
});