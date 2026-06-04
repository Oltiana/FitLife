import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { colors } from "../../../theme/colors";
import { api } from "../../../services/api";
import { IMAGE_BASE_URL } from "../../../constants/apiConfig";

function safe(val: any): string {
  return val === null || val === undefined ? "" : String(val);
}

function formatDuration(sec: any): string {
  const s = Number(sec) || 30;

  const m = Math.floor(s / 60);
  const r = s % 60;

  return r === 0
    ? `${m}:00`
    : `${m}:${String(r).padStart(2, "0")}`;
}

function getImageUrl(path: string | null | undefined) {
  if (!path || path.trim() === "") return "";

  return `${IMAGE_BASE_URL}${
    path.startsWith("/") ? path : "/" + path
  }`;
}

export default function WorkoutDetailScreen() {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const workout = route.params?.workout || {};

  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    loadSteps();
  }, []);

  const loadSteps = async () => {
    try {
      const data = await api.getWorkoutSteps(workout.id);

      setSteps(data.steps || []);
    } catch (err) {
      console.log(err);
      setSteps([]);
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = () => {
    if (steps.length === 0) return;

    setStarted(true);
    setCurrentStep(0);
    setTimeLeft(steps[0].durationSec);
  };

  useEffect(() => {
    if (!started) return;

    if (timeLeft <= 0) {
      if (currentStep < steps.length - 1) {
        const next = currentStep + 1;

        setCurrentStep(next);
        setTimeLeft(steps[next].durationSec);
      } else {
        setStarted(false);
      }

      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [started, timeLeft, currentStep]);

  if (started) {
    const step = steps[currentStep];

    return (
      <View style={styles.center}>
        <Image
          source={{ uri: getImageUrl(step.imageUrl) }}
          style={styles.bigImg}
          contentFit="cover"
        />

        <Text style={styles.title}>
          {safe(step.title)}
        </Text>

        <Text style={styles.timer}>
          {timeLeft}s
        </Text>

        <Text style={styles.stepInfo}>
          Step {currentStep + 1} / {steps.length}
        </Text>

        <Pressable
          style={[styles.startBtn, { marginTop: 30 }]}
          onPress={() => setStarted(false)}
        >
          <Text style={styles.startBtnText}>
            Stop
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>

        <Text style={styles.screenTitle}>
          Workout details
        </Text>

        <View style={{ width: 60 }} />
      </View>

      <View style={styles.workoutBox}>
        <Text style={styles.workoutTitle}>
          {safe(workout.title)}
        </Text>

        <Text style={styles.workoutLevel}>
          {safe(workout.level)}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={steps}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.stepRow}>
              <Image
                source={{ uri: getImageUrl(item.imageUrl) }}
                style={styles.stepImg}
                contentFit="cover"
              />

              <View style={styles.stepText}>
                <Text style={styles.stepLabel}>
                  STEP {item.stepOrder}
                </Text>

                <Text style={styles.stepTitle}>
                  {safe(item.title)}
                </Text>

                <Text style={styles.stepDur}>
                  {formatDuration(item.durationSec)}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No workout steps
            </Text>
          }
        />
      )}

      {!loading && steps.length > 0 && (
        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + 12 },
          ]}
        >
          <Pressable
            style={styles.startBtn}
            onPress={startWorkout}
          >
            <Text style={styles.startBtnText}>
              Start workout
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },

  backText: {
    color: colors.primary,
    fontSize: 16,
  },

  screenTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  workoutBox: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
  },

  workoutTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  workoutLevel: {
    marginTop: 4,
    color: colors.primary,
    fontWeight: "600",
  },

  list: {
    padding: 16,
    paddingBottom: 120,
  },

  stepRow: {
    flexDirection: "row",
    marginBottom: 18,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 10,
  },

  stepImg: {
    width: 72,
    height: 72,
    borderRadius: 14,
    marginRight: 14,
  },

  stepText: {
    flex: 1,
    justifyContent: "center",
  },

  stepLabel: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "700",
  },

  stepTitle: {
    fontSize: 17,
    marginTop: 2,
    color: colors.text,
  },

  stepDur: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 16,
  },

  startBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  startBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  bigImg: {
    width: 250,
    height: 250,
    borderRadius: 20,
  },

  title: {
    fontSize: 22,
    marginTop: 20,
    fontWeight: "700",
  },

  timer: {
    fontSize: 40,
    marginTop: 10,
    fontWeight: "700",
    color: colors.primary,
  },

  stepInfo: {
    marginTop: 10,
    color: colors.textMuted,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: colors.textMuted,
  },
});