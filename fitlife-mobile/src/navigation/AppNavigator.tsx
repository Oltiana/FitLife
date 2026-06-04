import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { MainTabs } from './MainTabs';
import LoginScreen from "../screens/auth/view/LoginScreen";
import RegisterScreen from "../screens/auth/view/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/view/ForgotPasswordScreen";
import { tokenStorage } from "../storage/tokenStorage";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await tokenStorage.getToken();
      setIsLoggedIn(!!token);
    };
    checkAuth();
  }, []);

  if (isLoggedIn === null) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="MainTabs">
            {() => <MainTabs onLogout={() => setIsLoggedIn(false)} />}
          </Stack.Screen>
        ) : showForgotPassword ? (
          <Stack.Screen name="ForgotPassword">
            {() => (
              <ForgotPasswordScreen
                onNavigateToLogin={() => setShowForgotPassword(false)}
                onResetSuccess={() => setShowForgotPassword(false)}
              />
            )}
          </Stack.Screen>
        ) : showRegister ? (
          <Stack.Screen name="Register">
            {() => (
              <RegisterScreen
                onRegisterSuccess={() => setShowRegister(false)}
                onNavigateToLogin={() => setShowRegister(false)}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login">
  {() => (
    <LoginScreen
      onLoginSuccess={() => setIsLoggedIn(true)}
      onNavigateToRegister={() => setShowRegister(true)}
      onNavigateToForgotPassword={() => setShowForgotPassword(true)}
    />
  )}
</Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}