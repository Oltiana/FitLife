import { useCallback, useEffect, useState } from 'react';
import { type ReactNode } from 'react';
import { getAdminStats } from '../../../api/adminApi';

export type Section = 'home' | 'users' | 'pilates' | 'yoga' | 'fitness' | 'analytics';

type AdminStats = {
  totalUsers: number;
  totalPilatesPrograms: number;
  totalYogaClasses: number;
  totalFitnessExercises: number;
};

export function useAdminDashboardViewModel() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rawStats, setRawStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPilatesPrograms: 0,
    totalYogaClasses: 0,
    totalFitnessExercises: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [popupContent, setPopupContent] = useState<ReactNode>(null);

  const loadStats = useCallback(() => {
    getAdminStats().then(setRawStats).catch(console.warn);
  }, []);

  useEffect(() => {
    getAdminStats()
      .then(setRawStats)
      .catch(console.warn)
      .finally(() => setLoadingStats(false));
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
  };
}