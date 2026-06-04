import React, {
  useMemo,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useRoute,
  useNavigation,
} from "@react-navigation/native";
import SimpleMonthCalendar from "../../../components/SimpleMonthCalendar";
import { colors } from "../../../theme/colors";
import { useScheduleViewModel } from "../viewmodels/ScheduleViewModel";
import { api } from "../../../services/api";
import { IMAGE_BASE_URL } from "../../../constants/apiConfig";

function todayISO(): string {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const selectedWorkout =
    route.params?.selectedWorkout;

  const [selected, setSelected] =
    useState(todayISO());

  const [selectedInstructor, setSelectedInstructor] =
    useState("");

  const {
  sessions,
  allSessions,
  loading,
  bookSession,
  instructors,
} = useScheduleViewModel(selected);

  const marked = useMemo(() => {
  const dates: any = {};

  allSessions.forEach((s: any) => {
    const date = s.sessionDate?.slice(0, 10);

    if (!date) return;

    if (s.capacity > 0) {
      dates[date] = {
        marked: true,
        dotColor: "#22C55E",
      };
    }
  });

  dates[selected] = {
    ...dates[selected],
    selected: true,
    marked: true,
    dotColor: "#22C55E",
  };

  return dates;
}, [allSessions, selected]);

  const filteredSessions = sessions.filter(
    (s: any) => {
      if (!selectedInstructor) return true;

      return (
        s.instructorName ===
        selectedInstructor
      );
    }
  );

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + 8 },
      ]}
    >
      
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>
            ←
          </Text>
        </Pressable>

        <Text style={styles.title}>
          Schedule
        </Text>
      </View>

      <Text style={styles.sub}>
        Choose time & instructor
      </Text>

      
      {selectedWorkout && (
        <View style={styles.selectedBox}>
          <Text style={styles.selectedText}>
            {selectedWorkout.title}
          </Text>
        </View>
      )}

      
      <SimpleMonthCalendar
        selectedDate={selected}
        markedDates={marked}
        onDayPress={(d) =>
          setSelected(d.dateString)
        }
      />

      
      <View style={styles.filterRow}>
        {instructors.map((inst: string) => (
          <Pressable
            key={inst}
            onPress={() =>
              setSelectedInstructor(inst)
            }
            style={[
              styles.filterBtn,
              selectedInstructor === inst && {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <Text
              style={{
                color:
                  selectedInstructor === inst
                    ? "#fff"
                    : colors.text,
              }}
            >
              {inst}
            </Text>
          </Pressable>
        ))}
      </View>

      
      <FlatList
        data={filteredSessions}
        keyExtractor={(item) =>
          item.id.toString()
        }
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        renderItem={({ item }) => {
          const isFull =
            item.capacity <= 0;

          return (
            <View style={styles.slotCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.timeBig}>
                  {item.startTime}
                </Text>

                <Text
                  style={styles.instructorBig}
                >
                  {item.instructorName}
                </Text>

                <Text style={styles.spots}>
                  {isFull
                    ? "Full"
                    : `${item.capacity} spots left`}
                </Text>
              </View>

              <Pressable
                disabled={isFull}
                style={[
                  styles.bookBtn,
                  isFull && {
                    backgroundColor:
                      "#ccc",
                  },
                ]}
                onPress={async () => {
                  await bookSession(item.id);

                  Alert.alert(
                    "Booked",
                    `${selectedWorkout?.title || "Session"} booked at ${item.startTime}`
                  );
                }}
              >
                <Text style={styles.bookText}>
                  {isFull ? "Full" : "Book"}
                </Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading
              ? "Loading..."
              : "No sessions available"}
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

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 6,
  },

  backText: {
    fontSize: 22,
    marginRight: 10,
    color: colors.primary,
  },

  title: {
    fontSize: 32,
    color: colors.primary,
    fontWeight: "700",
  },

  sub: {
    marginLeft: 16,
    marginBottom: 10,
    color: colors.textMuted,
  },

  selectedBox: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
  },

  selectedText: {
    fontWeight: "600",
    color: colors.text,
  },

  filterRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
    flexWrap: "wrap",
  },

  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
    marginBottom: 8,
  },

  slotCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    borderRadius: 14,
  },

  timeBig: {
    fontSize: 18,
    fontWeight: "700",
  },

  instructorBig: {
    color: colors.textMuted,
    marginTop: 2,
  },

  spots: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
  },

  bookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  bookText: {
    color: "#fff",
    fontWeight: "600",
  },

  empty: {
    textAlign: "center",
    marginTop: 20,
    color: colors.textMuted,
  },
});