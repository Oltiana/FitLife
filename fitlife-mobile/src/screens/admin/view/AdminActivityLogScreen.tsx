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
import { getActivityLogs, type ActivityLog } from '../../../api/adminApi';

const ACTION_COLORS: Record<string, { color: string; bg: string }> = {
  LOGIN:          { color: '#3d6b42', bg: '#e8f5eb' },
  LOGOUT:         { color: '#6b7a6b', bg: '#f0f4f0' },
  REGISTER:       { color: '#3b7ec8', bg: '#e8f2fc' },
  CREATE:         { color: '#3b7ec8', bg: '#e8f2fc' },
  UPDATE:         { color: '#c9782e', bg: '#fff4e8' },
  DELETE:         { color: '#c94444', bg: '#fdecef' },
  ENROLL:         { color: '#7c6aad', bg: '#f0ecf8' },
  UNENROLL:       { color: '#c94444', bg: '#fdecef' },
  COMPLETE:       { color: '#3d6b42', bg: '#e8f5eb' },
  START:          { color: '#3b7ec8', bg: '#e8f2fc' },
  BOOKING:        { color: '#7c6aad', bg: '#f0ecf8' },
  CANCEL_BOOKING: { color: '#c94444', bg: '#fdecef' },
};

export function AdminActivityLogScreen() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterEntity, setFilterEntity] = useState('');

  const PAGE_SIZE = 50;

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await getActivityLogs(p, PAGE_SIZE, undefined, filterEntity || undefined);
      setLogs(res.logs);
      setTotal(res.total);
      setPage(p);
    } catch {
      console.warn('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [filterEntity]);

  const filtered = search.trim()
    ? logs.filter(l =>
        l.userFullName.toLowerCase().includes(search.toLowerCase()) ||
        l.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.entityType.toLowerCase().includes(search.toLowerCase()) ||
        (l.description ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const ENTITY_FILTERS = ['', 'Auth', 'WorkoutPlan', 'WorkoutSession', 'PilatesEnrollment', 'PilatesWorkout', 'YogaBooking'];

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search by user, action, description..."
        placeholderTextColor="#a0b0a0"
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}>
        {ENTITY_FILTERS.map(f => (
          <Pressable
            key={f || 'all'}
            style={[styles.filterChip, filterEntity === f && styles.filterChipActive]}
            onPress={() => setFilterEntity(f)}
          >
            <Text style={[styles.filterChipText, filterEntity === f && styles.filterChipTextActive]}>
              {f || 'All'}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#3d6b42" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="document-outline" size={40} color="#c0d0c0" />
          <Text style={styles.emptyText}>No activity logs found</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filtered.map(log => {
            const c = ACTION_COLORS[log.action] ?? { color: '#6b7a6b', bg: '#f0f4f0' };
            return (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={[styles.actionBadge, { backgroundColor: c.bg }]}>
                    <Text style={[styles.actionText, { color: c.color }]}>{log.action}</Text>
                  </View>
                  <View style={styles.entityBadge}>
                    <Text style={styles.entityText}>{log.entityType}</Text>
                  </View>
                  <Text style={styles.logDate}>
                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.logUser}>{log.userFullName}</Text>
                <Text style={styles.logEmail}>{log.userEmail}</Text>
                {log.description && <Text style={styles.logDesc}>{log.description}</Text>}
                {log.ipAddress && (
                  <View style={styles.ipRow}>
                    <Ionicons name="globe-outline" size={11} color="#a0b0a0" />
                    <Text style={styles.ipText}>{log.ipAddress}</Text>
                  </View>
                )}
              </View>
            );
          })}

          {totalPages > 1 && (
            <View style={styles.pagination}>
              <Pressable
                style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                onPress={() => page > 1 && load(page - 1)}
                disabled={page === 1}
              >
                <Ionicons name="chevron-back-outline" size={16} color={page === 1 ? '#c0d0c0' : '#3d6b42'} />
              </Pressable>
              <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
              <Pressable
                style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
                onPress={() => page < totalPages && load(page + 1)}
                disabled={page === totalPages}
              >
                <Ionicons name="chevron-forward-outline" size={16} color={page === totalPages ? '#c0d0c0' : '#3d6b42'} />
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5ebe5', paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: '#142210', marginBottom: 12 },
  filterRow: { marginBottom: 12, flexGrow: 0 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#f0f4f0', borderWidth: 1, borderColor: '#e5ebe5' },
  filterChipActive: { backgroundColor: '#e8f5eb', borderColor: '#3d6b42' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#6b7a6b' },
  filterChipTextActive: { color: '#3d6b42' },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#a0b0a0', fontWeight: '600' },
  logCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e5ebe5' },
  logHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  actionBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  actionText: { fontSize: 11, fontWeight: '800' },
  entityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: '#f0f4f0' },
  entityText: { fontSize: 11, fontWeight: '600', color: '#6b7a6b' },
  logDate: { fontSize: 11, color: '#a0b0a0', fontWeight: '600', marginLeft: 'auto' },
  logUser: { fontSize: 13, fontWeight: '700', color: '#142210' },
  logEmail: { fontSize: 11, color: '#6b7a6b', marginTop: 2 },
  logDesc: { fontSize: 12, color: '#4a5a4a', marginTop: 6, lineHeight: 18 },
  ipRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  ipText: { fontSize: 11, color: '#a0b0a0' },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 16 },
  pageBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5ebe5', alignItems: 'center', justifyContent: 'center' },
  pageBtnDisabled: { borderColor: '#f0f4f0' },
  pageInfo: { fontSize: 13, fontWeight: '700', color: '#142210' },
});