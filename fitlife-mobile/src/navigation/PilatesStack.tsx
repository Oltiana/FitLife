import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { BrowseModalityDetailScreen } from '../screens/discover/BrowseModalityDetailScreen';
import { DiscoverHubScreen } from '../screens/discover/DiscoverHubScreen';
import { ActiveWorkoutScreen } from '../screens/pilates/PilatesActiveWorkoutScreen';
import { PilatesListScreen } from '../screens/pilates/PilatesListScreen';
import { PilatesProgramScheduleScreen } from '../screens/pilates/PilatesProgramScheduleScreen';
import { WorkoutDetailScreen } from '../screens/pilates/PilatesWorkoutDetailScreen';
import { useTheme } from '../theme/PilatesThemeContext';
import type { PilatesStackParamList } from './PilatesNavigationTypes';

const Stack = createNativeStackNavigator<PilatesStackParamList>();

export function PilatesStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="DiscoverHub"
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
        headerStyle: { backgroundColor: colors.surface },
        contentStyle: { backgroundColor: colors.background },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="DiscoverHub"
        component={DiscoverHubScreen}
        options={{ headerShown: false, title: 'Search' }}
      />
      <Stack.Screen
        name="BrowseModalityDetail"
        component={BrowseModalityDetailScreen}
        options={{ title: 'Session' }}
      />
      <Stack.Screen
        name="PilatesList"
        component={PilatesListScreen}
        options={{ headerShown: false, title: 'Pilates' }}
      />
      <Stack.Screen
        name="WorkoutDetail"
        component={WorkoutDetailScreen}
        options={{ title: 'Workout details' }}
      />
      <Stack.Screen
        name="ActiveWorkout"
        component={ActiveWorkoutScreen}
        options={{
          title: 'Active workout',
          headerBackVisible: true,
          ...(Platform.OS !== 'web'
            ? {
                headerTransparent: true,
                headerBlurEffect:
                  Platform.OS === 'ios' ? ('light' as const) : undefined,
                headerStyle: {
                  backgroundColor:
                    Platform.OS === 'android'
                      ? 'rgba(255,245,248,0.92)'
                      : 'transparent',
                },
              }
            : {}),
        }}
      />
      <Stack.Screen
        name="ProgramSchedule"
        component={PilatesProgramScheduleScreen}
        options={{ title: 'Program calendar' }}
      />
    </Stack.Navigator>
  );
}
