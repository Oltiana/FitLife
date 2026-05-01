import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type LinkingOptions,
} from '@react-navigation/native';
import { navigationRef } from './src/navigation/PilatesNavigationRef';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Text, TextInput, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WebAppRoot } from './src/components/PilatesWebAppRoot';
import { bootstrapRemoteApiIfConfigured } from './src/api/PilatesBackendApi';
import { loadThemePreference } from './src/data/PilatesThemePreferenceRepository';
import type { ColorSchemePreference } from './src/data/PilatesThemePreferenceRepository';
import {
  ensurePreferencesForLegacyInstall,
} from './src/data/PilatesUserPreferencesRepository';
import { ensureDefaultUser, loadPrograms } from './src/data/PilatesUserProgramRepository';
import { hydratePilatesModelFromPrograms } from './src/models/PilatesModel';
import { MainTabs } from './src/navigation/PilatesMainTabs';
import type { MainTabParamList } from './src/navigation/PilatesNavigationTypes';
import { ThemeProvider, useTheme } from './src/theme/PilatesThemeContext';

const ROBOTO_STACK =
  Platform.OS === 'web' ? 'Roboto, Arial, sans-serif' : 'Roboto';

const defaultTextProps = Text.defaultProps ?? {};
Text.defaultProps = {
  ...defaultTextProps,
  style: [defaultTextProps.style, { fontFamily: ROBOTO_STACK }],
};

const defaultTextInputProps = TextInput.defaultProps ?? {};
TextInput.defaultProps = {
  ...defaultTextInputProps,
  style: [defaultTextInputProps.style, { fontFamily: ROBOTO_STACK }],
};

function Root({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'web') {
    return (
      <View
        style={{
          flex: 1,
          width: '100%',
          minHeight: '100vh' as unknown as number,
        }}
      >
        {children}
      </View>
    );
  }
  return <GestureHandlerRootView style={{ flex: 1 }}>{children}</GestureHandlerRootView>;
}

function BootSpinner() {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

function ThemedNavigation() {
  const { colors, colorScheme } = useTheme();
  const linking = useMemo<LinkingOptions<MainTabParamList>>(
    () => ({
      prefixes: ['http://localhost:8081', 'https://localhost:8081'],
      config: {
        screens: {
          Home: '',
          Pilates: {
            path: 'pilates',
            screens: {
              PilatesList: '',
              WorkoutDetail: 'workout/:workoutId',
              ActiveWorkout: 'active/:workoutId',
              ProgramSchedule: 'schedule/:workoutId',
            },
          },
          Progress: 'progress',
        },
      },
    }),
    [],
  );
  const theme = useMemo(
    () => ({
      ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
      colors: {
        ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.accent,
      },
    }),
    [colorScheme, colors],
  );

  return (
    <NavigationContainer theme={theme} ref={navigationRef} linking={linking}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <MainTabs />
    </NavigationContainer>
  );
}

export default function App() {
  const [bootReady, setBootReady] = useState(false);
  const [initialTheme, setInitialTheme] =
    useState<ColorSchemePreference>('light');

  useEffect(() => {
    void (async () => {
      const theme = await loadThemePreference();
      setInitialTheme(theme);
      await ensureDefaultUser();
      await bootstrapRemoteApiIfConfigured();
      const programs = await loadPrograms();
      hydratePilatesModelFromPrograms(programs);
      await ensurePreferencesForLegacyInstall();
      setBootReady(true);
    })();
  }, []);

  return (
    <Root>
      <ThemeProvider initialScheme={initialTheme}>
        <SafeAreaProvider>
          {!bootReady ? (
            <BootSpinner />
          ) : (
            <WebAppRoot>
              <ThemedNavigation />
            </WebAppRoot>
          )}
        </SafeAreaProvider>
      </ThemeProvider>
    </Root>
  );
}
