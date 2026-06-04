import { useEffect, useState } from 'react';
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
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { getAdminAnalytics } from '../../../api/adminApi';
import { tokenStorage } from '../../../storage/tokenStorage';

const screenWidth = Dimensions.get('window').width;
const isWide = Platform.OS === 'web' && screenWidth >= 768;

const MODULE_COLORS = {
  Pilates: { line: '#E91E8C', bar: 'rgba(233,30,140,', bg: '#FDE8F4', text: '#E91E8C', icon: 'body-outline' },
  Yoga:    { line: '#F57C00', bar: 'rgba(245,124,0,',  bg: '#FFF3E0', text: '#F57C00', icon: 'leaf-outline' },
  Fitness: { line: '#2E7D32', bar: 'rgba(46,125,50,',  bg: '#E8F5E9', text: '#2E7D32', icon: 'barbell-outline' },
};

export function AdminAnalyticsScreen({ onBack }: { onBack?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [userRegistrations, setUserRegistrations] = useState<{ date: string; count: number }[]>([]);
  const [moduleStats, setModuleStats] = useState<{ module: string; count: number }[]>([]);
  const [role, setRole] = useState<string>('Admin');

  useEffect(() => {
    const load = async () => {
      try {
        const [data, savedRole] = await Promise.all([
          getAdminAnalytics(),
          tokenStorage.getRole(),
        ]);
        setUserRegistrations(data.userRegistrations);
        setModuleStats(data.moduleStats);
        setRole(savedRole ?? 'Admin');
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#4A6FA5" style={{ marginTop: 60 }} />;
  }

  const filteredModuleStats = moduleStats.filter(m => {
    if (role === 'Inspector') return m.module === 'Yoga';
    if (role === 'FitnessManager') return m.module === 'Fitness';
    return true;
  });

  const last7 = userRegistrations.slice(-7);
  const totalUsers = userRegistrations.reduce((sum, d) => sum + d.count, 0);
  const peakDay = userRegistrations.reduce(
    (max, d) => d.count > max.count ? d : max,
    { date: '-', count: 0 }
  );
  const totalEnrollments = filteredModuleStats.reduce((s, m) => s + m.count, 0);

  const lineData = {
    labels: last7.length > 0 ? last7.map(d => d.date.slice(5)) : ['No data'],
    datasets: [{
      data: last7.length > 0 ? last7.map(d => d.count) : [0],
      color: () => '#4A6FA5',
      strokeWidth: 3,
    }],
  };

  const lineConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#EEF2F9',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(74,111,165,${opacity})`,
    labelColor: () => '#7A90A8',
    style: { borderRadius: 16 },
    propsForDots: { r: '6', strokeWidth: '2', stroke: '#4A6FA5', fill: '#fff' },
    propsForBackgroundLines: { strokeDasharray: '4', stroke: '#E0E8F4', strokeWidth: '1' },
  };

  const barData = {
    labels: filteredModuleStats.map(m => m.module),
    datasets: [{ data: filteredModuleStats.map(m => m.count) }],
  };

  const barConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#f8f9ff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(74,111,165,${opacity})`,
    labelColor: () => '#7A90A8',
    style: { borderRadius: 16 },
    barPercentage: 0.6,
    propsForBackgroundLines: { strokeDasharray: '4', stroke: '#E0E8F4', strokeWidth: '1' },
  };

  const isAdmin = role === 'Admin';

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {!isWide && onBack && (
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back-outline" size={18} color="#4A6FA5" />
          <Text style={styles.backText}>Dashboard</Text>
        </Pressable>
      )}

      <View style={styles.summaryRow}>
        {isAdmin && (
          <View style={styles.summaryCard}>
            <Ionicons name="people-outline" size={22} color="#4A6FA5" />
            <Text style={styles.summaryValue}>{totalUsers}</Text>
            <Text style={styles.summaryLabel}>Total Users</Text>
          </View>
        )}
        {isAdmin && (
          <View style={styles.summaryCard}>
            <Ionicons name="trending-up-outline" size={22} color="#4A6FA5" />
            <Text style={styles.summaryValue}>{peakDay.count}</Text>
            <Text style={styles.summaryLabel}>Peak Day</Text>
            <Text style={styles.summaryDate}>{peakDay.date !== '-' ? peakDay.date.slice(5) : '-'}</Text>
          </View>
        )}
        <View style={styles.summaryCard}>
          <Ionicons name="layers-outline" size={22} color="#4A6FA5" />
          <Text style={styles.summaryValue}>{totalEnrollments}</Text>
          <Text style={styles.summaryLabel}>
            {role === 'Inspector' ? 'Yoga Bookings' : role === 'FitnessManager' ? 'Workout Plans' : 'Enrollments'}
          </Text>
        </View>
      </View>

      <View style={styles.moduleRow}>
        {filteredModuleStats.map((m) => {
          const colors = MODULE_COLORS[m.module as keyof typeof MODULE_COLORS] ?? MODULE_COLORS.Fitness;
          const pct = totalEnrollments > 0 ? Math.round((m.count / totalEnrollments) * 100) : 0;
          return (
            <View key={m.module} style={[styles.moduleCard, { borderTopColor: colors.line }]}>
              <View style={[styles.moduleIconWrap, { backgroundColor: colors.bg }]}>
                <Ionicons name={colors.icon as any} size={20} color={colors.line} />
              </View>
              <Text style={[styles.moduleValue, { color: colors.line }]}>{m.count}</Text>
              <Text style={styles.moduleLabel}>{m.module}</Text>
              <Text style={[styles.modulePct, { color: colors.text }]}>{pct}%</Text>
            </View>
          );
        })}
      </View>

      {isAdmin && (
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>User Registrations</Text>
              <Text style={styles.chartSub}>Daily signups — last 7 days</Text>
            </View>
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>{totalUsers} total</Text>
            </View>
          </View>
          <LineChart
            data={lineData}
            width={isWide ? screenWidth - 120 : screenWidth - 80}
            height={220}
            chartConfig={lineConfig}
            bezier
            style={styles.chart}
            fromZero
            withShadow={false}
            withInnerLines={true}
            withOuterLines={false}
          />
        </View>
      )}

      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartTitle}>
              {role === 'Inspector' ? 'Yoga Overview' : role === 'FitnessManager' ? 'Fitness Overview' : 'Module Comparison'}
            </Text>
            <Text style={styles.chartSub}>
              {role === 'Inspector' ? 'Yoga bookings total' : role === 'FitnessManager' ? 'Workout plans total' : 'Enrollments per module'}
            </Text>
          </View>
        </View>
        <BarChart
          data={barData}
          width={isWide ? screenWidth - 120 : screenWidth - 80}
          height={220}
          chartConfig={barConfig}
          style={styles.chart}
          fromZero
          showValuesOnTopOfBars
          withInnerLines={true}
          yAxisLabel=""
          yAxisSuffix=""
        />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          {role === 'Inspector' ? 'Yoga Distribution' : role === 'FitnessManager' ? 'Fitness Distribution' : 'Enrollment Distribution'}
        </Text>
        <Text style={[styles.chartSub, { marginBottom: 16 }]}>Share per module</Text>
        {filteredModuleStats.map((m) => {
          const colors = MODULE_COLORS[m.module as keyof typeof MODULE_COLORS] ?? MODULE_COLORS.Fitness;
          const pct = totalEnrollments > 0 ? Math.round((m.count / totalEnrollments) * 100) : 0;
          return (
            <View key={m.module} style={styles.barRow}>
              <View style={[styles.moduleDot, { backgroundColor: colors.line }]} />
              <Text style={styles.barLabel}>{m.module}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: colors.line }]} />
              </View>
              <Text style={[styles.barCount, { color: colors.text }]}>{m.count}</Text>
              <Text style={styles.barPct}>{pct}%</Text>
            </View>
          );
        })}
        <View style={styles.stackedBar}>
          {filteredModuleStats.map((m) => {
            const colors = MODULE_COLORS[m.module as keyof typeof MODULE_COLORS] ?? MODULE_COLORS.Fitness;
            const pct = totalEnrollments > 0 ? (m.count / totalEnrollments) * 100 : 0;
            return (
              <View
                key={m.module}
                style={[styles.stackedSegment, { width: `${pct}%`, backgroundColor: colors.line }]}
              />
            );
          })}
        </View>
        <View style={styles.legendRow}>
          {filteredModuleStats.map((m) => {
            const colors = MODULE_COLORS[m.module as keyof typeof MODULE_COLORS] ?? MODULE_COLORS.Fitness;
            return (
              <View key={m.module} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.line }]} />
                <Text style={styles.legendText}>{m.module}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 24 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#EEF2F9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginBottom: 4 },
  backText: { fontSize: 13, fontWeight: '700', color: '#4A6FA5' },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#D0DCF0', gap: 4 },
  summaryValue: { fontSize: 22, fontWeight: '800', color: '#4A6FA5' },
  summaryLabel: { fontSize: 10, fontWeight: '600', color: '#7A90A8', textAlign: 'center' },
  summaryDate: { fontSize: 10, color: '#4A6FA5', fontWeight: '700' },
  moduleRow: { flexDirection: 'row', gap: 10 },
  moduleCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#D0DCF0', borderTopWidth: 3, gap: 4 },
  moduleIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  moduleValue: { fontSize: 22, fontWeight: '800' },
  moduleLabel: { fontSize: 10, fontWeight: '700', color: '#0F1D2E' },
  modulePct: { fontSize: 10, fontWeight: '600' },
  chartCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#D0DCF0', overflow: 'hidden' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  chartTitle: { fontSize: 15, fontWeight: '800', color: '#0F1D2E' },
  chartSub: { fontSize: 11, color: '#7A90A8', marginTop: 2 },
  totalBadge: { backgroundColor: '#EEF2F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  totalBadgeText: { fontSize: 11, fontWeight: '700', color: '#4A6FA5' },
  chart: { borderRadius: 12, marginLeft: -16 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  moduleDot: { width: 8, height: 8, borderRadius: 999 },
  barLabel: { fontSize: 12, fontWeight: '700', color: '#0F1D2E', width: 50 },
  barTrack: { flex: 1, height: 10, backgroundColor: '#F0F4FA', borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  barCount: { fontSize: 12, fontWeight: '800', width: 24, textAlign: 'right' },
  barPct: { fontSize: 10, fontWeight: '600', color: '#7A90A8', width: 30, textAlign: 'right' },
  stackedBar: { flexDirection: 'row', height: 14, borderRadius: 999, overflow: 'hidden', marginTop: 8, marginBottom: 10 },
  stackedSegment: { height: '100%' },
  legendRow: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 999 },
  legendText: { fontSize: 11, fontWeight: '600', color: '#0F1D2E' },
});