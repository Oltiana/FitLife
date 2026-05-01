import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import MainTabs from "./MainTabs";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import { tokenStorage } from "../storage/tokenStorage";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showRegister, setShowRegister] = useState(false);

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
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}