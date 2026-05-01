import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { tokenStorage } from "../storage/tokenStorage";

const Tab = createBottomTabNavigator();

function FitnessScreen() {
  return (
    <View>
      <Text>Fitness Module</Text>
    </View>
  );
}

function YogaScreen() {
  return (
    <View>
      <Text>Yoga Module</Text>
    </View>
  );
}

function PilatesScreen() {
  return (
    <View>
      <Text>Pilates Module</Text>
    </View>
  );
}

function ProfileScreen({ onLogout }: { onLogout: () => void }) {
  const handleLogout = async () => {
    await tokenStorage.clearAuth();
    onLogout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  logoutButton: {
    backgroundColor: "#FF4444",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

export default function MainTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Fitness" component={FitnessScreen} />
      <Tab.Screen name="Yoga" component={YogaScreen} />
      <Tab.Screen name="Pilates" component={PilatesScreen} />
      <Tab.Screen name="Profile">
        {() => <ProfileScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}