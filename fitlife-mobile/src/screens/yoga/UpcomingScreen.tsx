import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../theme/colors";
import { api } from "../../services/api";
import { IMAGE_BASE_URL } from "../../constants/apiConfig";

function safe(val: any): string {
  return val === null || val === undefined ? "" : String(val);
}

function getImageUrl(path: string | null | undefined) {
  if (!path || path.trim() === "") return "";

  return `${IMAGE_BASE_URL}${
    path.startsWith("/") ? path : "/" + path
  }`;
}

export default function UpcomingScreen() {
  const navigation = useNavigation<any>();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpcoming();
  }, []);

  const loadUpcoming = async () => {
    try {
      const data = await api.getUpcomingClasses();

      setItems(data.upcoming || []);
    } catch (err) {
      console.log(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.card}>
        <Image
          source={{ uri: getImageUrl(item.imageUrl) }}
          style={styles.img}
          contentFit="cover"
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {safe(item.title)}
          </Text>

          <Text style={styles.instructor}>
            Instructor: {safe(item.instructorName)}
          </Text>

          <Text style={styles.level}>
            {safe(item.level)}
          </Text>

          <View style={styles.dateRow}>
            <Text style={styles.date}>
              {new Date(item.startDate).toLocaleDateString()}
            </Text>

            <Text style={styles.time}>
              {safe(item.startTime)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        <View>
          <Text style={styles.header}>
            Upcoming Classes
          </Text>

          <Text style={styles.sub}>
            New yoga sessions coming soon
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: 30,
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No upcoming classes
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 18,
  },

  backArrow: {
    fontSize: 24,
    marginRight: 14,
    color: colors.primary,
  },

  header: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.primary,
  },

  sub: {
    color: colors.textMuted,
    marginTop: 2,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  img: {
    width: 82,
    height: 82,
    borderRadius: 16,
    marginRight: 14,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  instructor: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },

  level: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 3,
    fontWeight: "600",
  },

  dateRow: {
    flexDirection: "row",
    marginTop: 8,
  },

  date: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginRight: 8,
    fontSize: 12,
  },

  time: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: colors.textMuted,
  },
});