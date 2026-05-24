import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type LinkingOptions,
} from '@react-navigation/native';
import { navigationRef } from './src/navigation/PilatesNavigationRef';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WebAppRoot } from './src/components/PilatesWebAppRoot';
import { hasAuthToken, syncPilatesAfterAuth } from './src/api/pilatesApi';
import {
  ensurePreferencesForLegacyInstall,
  loadPrograms,
  loadThemePreference,
  type ColorSchemePreference,
} from './src/data/pilates';
import { hydratePilatesModelFromPrograms } from './src/models/PilatesModel';
import { MainTabs } from './src/navigation/MainTabs';
import type { MainTabParamList } from './src/navigation/PilatesNavigationTypes';
import { ThemeProvider, useTheme } from './src/theme/PilatesThemeContext';
import { tokenStorage } from './src/storage/tokenStorage';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import { AdminDashboard } from './src/screens/admin/AdminDashboard';

function Root({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, width: '100%', minHeight: '100vh' as unknown as number }}>
        {children}
      </View>
    );
  }
  return <GestureHandlerRootView style={{ flex: 1 }}>{children}</GestureHandlerRootView>;
}

function BootSpinner() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

function ThemedNavigation() {
  const { colors, colorScheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await tokenStorage.getToken();
      const role = await tokenStorage.getRole();
      setIsLoggedIn(!!token);
      setIsAdmin(role === 'Admin');
    };
    void checkAuth();
  }, []);

  const handleLoginSuccess = async () => {
    const role = await tokenStorage.getRole();
    setIsAdmin(role === 'Admin');
    await syncPilatesAfterAuth();
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await tokenStorage.clearAuth();
    setIsAdmin(false);
    setIsLoggedIn(false);
  };

  const linking = useMemo<LinkingOptions<MainTabParamList>>(
    () => ({
      prefixes: ['http://localhost:8081', 'https://localhost:8081'],
      config: {
        screens: {
          Home: '',
          Search: {
            path: 'pilates',
            screens: {
              DiscoverHub: 'discover',
              PilatesHome: {
                path: '',
                screens: {
                  PilatesWorkouts: '',
                  Progress: 'progress',
                },
              },
              WorkoutDetail: 'workout/:workoutId',
              ActiveWorkout: 'active/:workoutId',
              ProgramSchedule: 'schedule/:workoutId',
            },
          },
          Calendar: {
            path: 'calendar',
            screens: {
              CalendarHub: '',
              ProgramSchedule: 'schedule/:workoutId',
            },
          },
          Profile: 'profile',
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

  if (isLoggedIn === null) return null;

  if (!isLoggedIn) {
    return showRegister ? (
      <RegisterScreen
        onRegisterSuccess={() => {
          void syncPilatesAfterAuth().finally(() => {
            setShowRegister(false);
            setIsLoggedIn(true);
          });
        }}
        onNavigateToLogin={() => setShowRegister(false)}
      />
    ) : (
      <LoginScreen
        onLoginSuccess={() => void handleLoginSuccess()}
        onNavigateToRegister={() => setShowRegister(true)}
      />
    );
  }

  if (isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <NavigationContainer theme={theme} ref={navigationRef} linking={linking}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <MainTabs onLogout={handleLogout} />
    </NavigationContainer>
  );
}

export default function App() {
  const [bootReady, setBootReady] = useState(false);
  const [initialTheme, setInitialTheme] = useState<ColorSchemePreference>('light');

  useEffect(() => {
    void (async () => {
      try {
        const theme = await loadThemePreference();
        setInitialTheme(theme);
        if (await hasAuthToken()) {
          try {
            await syncPilatesAfterAuth();
          } catch {
            const programs = await loadPrograms();
            hydratePilatesModelFromPrograms(programs);
          }
        } else {
          const programs = await loadPrograms();
          hydratePilatesModelFromPrograms(programs);
        }
        await ensurePreferencesForLegacyInstall();
      } catch (e) {
        console.warn('[FitLife] boot hydrate failed', e);
      } finally {
        setBootReady(true);
      }
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