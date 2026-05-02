import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PilatesCalendarHubScreen } from '../screens/pilates/PilatesCalendarHubScreen';
import { PilatesProgramScheduleScreen } from '../screens/pilates/PilatesProgramScheduleScreen';
import { useTheme } from '../theme/PilatesThemeContext';
import type { CalendarStackParamList } from './PilatesNavigationTypes';

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export function PilatesCalendarStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
        headerStyle: { backgroundColor: colors.surface },
        contentStyle: { backgroundColor: colors.background },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="CalendarHub"
        component={PilatesCalendarHubScreen}
        options={{ title: 'Schedule' }}
      />
      <Stack.Screen
        name="ProgramSchedule"
        component={PilatesProgramScheduleScreen}
        options={{ title: 'Program calendar' }}
      />
    </Stack.Navigator>
  );
}
