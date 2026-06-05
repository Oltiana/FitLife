import { useCallback, useEffect, useState } from 'react';
import { type ReactNode } from 'react';
import { getAdminStats, getAdminUsers, getAdminAnalytics, type AdminUser } from '../../../api/adminApi';
import { tokenStorage } from '../../../storage/tokenStorage';

export type Section = 'home' | 'users' | 'pilates' | 'yoga' | 'fitness' | 'analytics' | 'enrollments' | 'activityLog' | 'notifications' | 'settings';
export type UserRole = 'Admin' | 'Inspector' | 'FitnessManager' | 'User';

type AdminStats = {
  totalUsers: number;
  totalPilatesPrograms: number;
  totalYogaClasses: number;
  totalFitnessExercises: number;
};

type AnalyticsData = {
  userRegistrations: { date: string; count: number }[];
  moduleStats: { module: string; count: number }[];
};

export function useAdminDashboardViewModel() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState<UserRole>('Admin');
  const [rawStats, setRawStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPilatesPrograms: 0,
    totalYogaClasses: 0,
    totalFitnessExercises: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [popupContent, setPopupContent] = useState<ReactNode>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<number>(0);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const loadStats = useCallback(() => {
    getAdminStats().then(setRawStats).catch(console.warn);
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const savedRole = (await tokenStorage.getRole()) as UserRole ?? 'Admin';
        setRole(savedRole);

        const [stats, analyticsData] = await Promise.all([
          getAdminStats(),
          getAdminAnalytics(),
        ]);

        setRawStats(stats);
        setAnalytics(analyticsData);

        if (savedRole === 'Admin') {
          const users = await getAdminUsers();
          const sorted = [...users].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setRecentUsers(sorted.slice(0, 3));
        }

        const regs = analyticsData.userRegistrations;
        const last7 = regs.slice(-7);
        const prev7 = regs.slice(-14, -7);
        const last7Total = last7.reduce((s, d) => s + d.count, 0);
        const prev7Total = prev7.reduce((s, d) => s + d.count, 0);
        if (prev7Total > 0) {
          setWeeklyTrend(Math.round(((last7Total - prev7Total) / prev7Total) * 100));
        } else {
          setWeeklyTrend(last7Total > 0 ? 100 : 0);
        }

        if (savedRole === 'Inspector') setActiveSection('home');
        if (savedRole === 'FitnessManager') setActiveSection('home');

      } catch (e) {
        console.warn(e);
      } finally {
        setLoadingStats(false);
      }
    };
    void loadAll();
  }, []);

  const handleNavPress = useCallback((id: Section) => {
    setActiveSection(id);
    setSidebarOpen(false);
    setPopupContent(null);
  }, []);

  const stats = [
    { label: 'Total Users', value: String(rawStats.totalUsers), icon: 'people-outline', color: '#3d6b42', bg: '#e8f5eb', section: 'users' as Section },
    { label: 'Pilates Programs', value: String(rawStats.totalPilatesPrograms), icon: 'body-outline', color: '#c94444', bg: '#fdecef', section: 'pilates' as Section },
    { label: 'Yoga Classes', value: String(rawStats.totalYogaClasses), icon: 'leaf-outline', color: '#c9782e', bg: '#fff4e8', section: 'yoga' as Section },
    { label: 'Workout Plans', value: String(rawStats.totalFitnessExercises), icon: 'barbell-outline', color: '#3b7ec8', bg: '#e8f2fc', section: 'fitness' as Section },
  ];

  return {
    activeSection,
    sidebarOpen,
    setSidebarOpen,
    stats,
    loadingStats,
    handleNavPress,
    refreshStats: loadStats,
    popupContent,
    setPopupContent,
    recentUsers,
    weeklyTrend,
    role,
    analytics,
  };
}