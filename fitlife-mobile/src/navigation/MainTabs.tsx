import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { tokenStorage } from "../storage/tokenStorage";

const Tab = createBottomTabNavigator();

function HomeScreen() {
  return (
    <ScrollView style={styles.homeScreen} contentContainerStyle={styles.homeContent}>
      <View style={styles.homeHeader}>
        <Text style={styles.appTitle}>FitLife</Text>
        <View style={styles.profileIconWrap}>
          <Ionicons name="person-outline" size={18} color="#111" />
        </View>
      </View>

      <Text style={styles.greeting}>Hello, Loreta!</Text>
      <Text style={styles.subGreeting}>Ready for your workout?</Text>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <Text style={styles.sectionLink}>View all</Text>
      </View>
      <View style={styles.row}>
        <StatCard icon="flame-outline" title="Calories Burned" value="540" subtitle="kcal" />
        <StatCard icon="barbell-outline" title="Workouts" value="3" subtitle="this week" />
        <StatCard icon="time-outline" title="Active Time" value="2h 15m" subtitle="this week" />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Choose your activity</Text>
      </View>
      <View style={styles.row}>
        <ActivityCard title="Fitness" subtitle="Build strength and stay fit" dotColor="#49b05a" bg="#e5f6d9" />
        <ActivityCard title="Yoga" subtitle="Find balance and inner peace" dotColor="#f3a64f" bg="#fdebd8" />
        <ActivityCard title="Pilates" subtitle="Improve flexibility and core strength" dotColor="#ea6a6a" bg="#fde1e1" />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended for you</Text>
        <Text style={styles.sectionLink}>See all</Text>
      </View>
      <View style={styles.row}>
        <RecommendedCard title="Full Body Workout" />
        <RecommendedCard title="Morning Yoga Flow" />
        <RecommendedCard title="Pilates Core" />
      </View>
    </ScrollView>
  );
}

function FitnessScreen() {
  return (
    <View style={styles.placeholder}>
      <Text>Fitness Module</Text>
    </View>
  );
}

function YogaScreen() {
  return (
    <View style={styles.placeholder}>
      <Text>Yoga Module</Text>
    </View>
  );
}

function PilatesScreen() {
  return (
    <View style={styles.placeholder}>
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
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  homeScreen: {
    flex: 1,
    backgroundColor: "#f8faf8",
  },
  homeContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 14,
  },
  homeHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 4,
  },
  appTitle: { fontSize: 22, fontWeight: "800", color: "#121212" },
  profileIconWrap: {
    position: "absolute",
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  greeting: { fontSize: 16, fontWeight: "700", color: "#111" },
  subGreeting: { fontSize: 14, color: "#666", marginTop: -6 },
  sectionHeader: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#222" },
  sectionLink: { fontSize: 12, fontWeight: "700", color: "#4e7a53" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  smallCard: {
    flex: 1,
    minHeight: 88,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cfcfcf",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  smallTitle: { fontSize: 10, color: "#222", textAlign: "center", fontWeight: "600" },
  smallValue: { fontSize: 15, fontWeight: "800", color: "#111", marginTop: 4 },
  smallSub: { fontSize: 10, color: "#666" },
  activityCard: {
    flex: 1,
    minHeight: 96,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cfcfcf",
    padding: 10,
    justifyContent: "space-between",
  },
  activityTitle: { fontSize: 13, fontWeight: "800", color: "#222" },
  activitySub: { fontSize: 10, color: "#555", lineHeight: 14, marginTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 99, alignSelf: "center", marginTop: 6 },
  recoCard: {
    flex: 1,
    minHeight: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cfcfcf",
    backgroundColor: "#fff",
    padding: 10,
    justifyContent: "space-between",
  },
  recoTitle: { fontSize: 12, fontWeight: "700", color: "#222" },
  bookmark: { alignSelf: "flex-end" },
});

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <View style={styles.smallCard}>
      <Ionicons name={icon} size={16} color="#111" />
      <Text style={styles.smallTitle}>{title}</Text>
      <Text style={styles.smallValue}>{value}</Text>
      <Text style={styles.smallSub}>{subtitle}</Text>
    </View>
  );
}

function ActivityCard({
  title,
  subtitle,
  dotColor,
  bg,
}: {
  title: string;
  subtitle: string;
  dotColor: string;
  bg: string;
}) {
  return (
    <View style={[styles.activityCard, { backgroundColor: bg }]}>
      <View>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activitySub}>{subtitle}</Text>
      </View>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
    </View>
  );
}

function RecommendedCard({ title }: { title: string }) {
  return (
    <View style={styles.recoCard}>
      <Text style={styles.recoTitle}>{title}</Text>
      <Ionicons style={styles.bookmark} name="bookmark-outline" size={15} color="#222" />
    </View>
  );
}

export default function MainTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#111",
        tabBarInactiveTintColor: "#777",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#ddd",
          height: 58,
        },
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: "home",
            Fitness: "search",
            Yoga: "calendar-outline",
            Pilates: "list-outline",
            Profile: "person-circle",
          };
          return <Ionicons name={map[route.name] ?? "ellipse-outline"} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Fitness" component={FitnessScreen} />
      <Tab.Screen name="Yoga" component={YogaScreen} />
      <Tab.Screen name="Pilates" component={PilatesScreen} />
      <Tab.Screen name="Profile">
        {() => <ProfileScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}