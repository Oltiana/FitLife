import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FitLifeProfileScreen } from '../screens/FitLifeProfileScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PilatesProgressScreen } from '../screens/pilates/PilatesProgressScreen';
import { useTheme } from '../theme/PilatesThemeContext';
import { PilatesCalendarStack } from './PilatesCalendarStack';
import { PilatesStack } from './PilatesStack';
import type { MainTabParamList } from './PilatesNavigationTypes';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
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
      tabBarHideOnKeyboard: true,
      tabBarIconStyle: {
        marginTop: 2,
      },
      tabBarLabelStyle: {
        fontSize: 10,
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
      tabBarItemStyle: {
        paddingTop: 4,
        paddingBottom: 2,
      },
    }),
    [colors, tabBarExtraBottom],
  );

  return (
    <Tab.Navigator screenOptions={screenOptions} initialRouteName="Home">
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={PilatesStack}
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={PilatesCalendarStack}
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={PilatesProgressScreen}
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="reorder-three-outline" size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={FitLifeProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size + 2} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
