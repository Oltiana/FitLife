import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PilatesListScreen } from '../screens/pilates/PilatesListScreen';
import { PilatesProgressScreen } from '../screens/pilates/PilatesProgressScreen';
import { useTheme } from '../theme/PilatesThemeContext';
import type { PilatesSectionTabParamList } from './PilatesNavigationTypes';

const Tab = createBottomTabNavigator<PilatesSectionTabParamList>();

export function PilatesSectionTabs() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarExtraBottom =
    Platform.OS === 'ios' ? Math.max(insets.bottom, 10) : Math.max(insets.bottom, 12);

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarShowLabel: true,
      tabBarIconStyle: { marginTop: 2 },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600' as const,
        marginTop: 2,
        marginBottom: 0,
      },
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 8,
        paddingBottom: tabBarExtraBottom,
        minHeight: 56 + tabBarExtraBottom,
      },
      tabBarItemStyle: { paddingTop: 4, paddingBottom: 2 },
    }),
    [colors, tabBarExtraBottom],
  );

  return (
    <Tab.Navigator screenOptions={screenOptions} initialRouteName="PilatesWorkouts">
      <Tab.Screen
        name="PilatesWorkouts"
        component={PilatesListScreen}
        options={{
          title: 'Pilates',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="accessibility-outline" size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={PilatesProgressScreen}
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size + 2} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
