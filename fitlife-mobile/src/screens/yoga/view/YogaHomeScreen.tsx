import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Dimensions,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../../services/api";
import { colors } from "../../../theme/colors";
import { IMAGE_BASE_URL } from "../../../constants/apiConfig";

const { width: W } = Dimensions.get("window");
const CARD_W = W - 32;



function safe(val: any): string {
  return val === null || val === undefined ? "" : String(val);
}

function levelLabel(level: any): string {
  if (!level) return "ALL LEVELS";

  const s = safe(level).toUpperCase();

  if (s.includes("BEGIN")) return "BEGINNER";
  if (s.includes("INTER")) return "INTERMEDIATE";
  if (s.includes("ADV")) return "ADVANCED";

  return s;
}

function getImageUrl(path: string | null | undefined) {
  if (!path || path.trim() === "") return null;

  return `${IMAGE_BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
}



export default function YogaHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [levelFilter, setLevelFilter] = useState("ALL");

  const load = useCallback(async () => {
    try {
      const data = await api.getTasks();
      setItems(data.tasks || []);
    } catch (err) {
      console.log(err);
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const filteredItems = items.filter((it) => {
    if (levelFilter === "ALL") return true;
    return safe(it.level).toUpperCase().includes(levelFilter);
  });

  const goToSchedule = (item: any) => {
    navigation.navigate("Schedule", {
      selectedWorkout: item,
      autoOpen: true,
    });
  };

  const renderCard = ({ item }: any) => {
    const imageUrl = getImageUrl(item.imageUrl);

    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          navigation.navigate("WorkoutDetail", {
            workout: item,
          })
        }
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.cardImage}
          />
        ) : (
          <View style={styles.cardImage} />
        )}

        <View style={styles.cardOverlay} />

        <View style={styles.cardBottom}>
          <Text style={styles.cardTitle}>
            {safe(item.title)}
          </Text>

          <View style={styles.pillRow}>
            <View style={styles.pillDark}>
              <Text style={styles.pillDarkText}>
                {levelLabel(item.level)}
              </Text>
            </View>

            <View style={styles.pillLight}>
              <Text style={styles.pillLightText}>
                {item.durationMin} min
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.bookBtn}
            onPress={(e) => {
              e.stopPropagation();
              goToSchedule(item);
            }}
          >
            <Text style={styles.bookText}>Book</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Text style={styles.serifTitle}>Yoga</Text>

        <Text style={styles.subtitle}>
          Select a workout to get started.
        </Text>
      </View>

      <View style={styles.filterRow}>
        {["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"].map((lvl) => (
          <Pressable
            key={lvl}
            onPress={() => setLevelFilter(lvl)}
            style={[
              styles.filterBtn,
              levelFilter === lvl && styles.filterActive,
            ]}
          >
            <Text style={{ color: levelFilter === lvl ? "#fff" : colors.text }}>
              {lvl}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
        <Pressable
          onPress={() => navigation.navigate("Upcoming")}
          style={styles.upcomingBtn}
        >
          <Text style={styles.upcomingBtnText}>
            Upcoming Yoga →
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(it) => it.id.toString()}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? "Loading..." : "No workouts"}
          </Text>
        }
      />
    </View>
  );
}



const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  serifTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.primary,
  },

  subtitle: {
    color: colors.textMuted,
    marginTop: 4,
  },

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
  },

  filterActive: {
    backgroundColor: colors.primary,
  },

  upcomingBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  upcomingBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  card: {
    width: CARD_W,
    height: 300,
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 18,
    backgroundColor: "#ddd",
  },

  cardImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  cardBottom: {
    position: "absolute",
    bottom: 0,
    padding: 18,
    width: "100%",
  },

  cardTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },

  pillRow: {
    flexDirection: "row",
  },

  pillDark: {
    backgroundColor: colors.pillDark,
    padding: 8,
    borderRadius: 999,
    marginRight: 8,
  },

  pillDarkText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  pillLight: {
    backgroundColor: "rgba(255,255,255,0.25)",
    padding: 8,
    borderRadius: 999,
  },

  pillLightText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  bookBtn: {
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  bookText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: colors.textMuted,
  },
});