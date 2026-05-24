import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FitLifeProfileScreen } from '../screens/FitLifeProfileScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { useTheme } from '../theme/PilatesThemeContext';
import { PilatesCalendarStack } from './PilatesCalendarStack';
import { PilatesStack } from './PilatesStack';
import type { MainTabParamList } from './PilatesNavigationTypes';
import { FitnessStack } from './FitnessStack';
import YogaStack from "./YogaStack";
import ScheduleScreen from '../screens/yoga/ScheduleScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs({ onLogout }: { onLogout: () => void }) {
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
      tabBarIconStyle: { marginTop: 2 },
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
      tabBarItemStyle: { paddingTop: 4, paddingBottom: 2 },
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
              name="Fitness"
              component={FitnessStack}
              options={{
                title: 'Fitness',
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="barbell-outline" size={size + 2} color={color} />
                ),
              }}
            />
      <Tab.Screen
        name="Search"
        component={PilatesStack}
        options={{
          title: 'Pilates',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="accessibility-outline" size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Yoga"
        component={YogaStack}
        options={{
          title: 'Yoga',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" size={size + 2} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size + 2} color={color} />
          ),
        }}
      >
        {() => <FitLifeProfileScreen onLogout={onLogout} />}
      </Tab.Screen>
      
    </Tab.Navigator>
  );
}