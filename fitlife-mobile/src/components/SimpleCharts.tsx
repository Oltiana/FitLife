import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans";
import { colors } from "../theme/colors";

type BarChartProps = {
  labels?: string[];
  values?: number[];
  barColor?: string;
};

type SparkBarsProps = {
  values?: number[];
  barColor?: string;
};

function maxVal(arr: number[]): number {
  const m = Math.max(0, ...arr.map((x) => Number(x) || 0));
  return m > 0 ? m : 1;
}


export const SimpleBarChart: React.FC<BarChartProps> = ({
  labels = [],
  values = [],
  barColor = colors.primary,
}) => {
  const vals = values.map((v) => Math.max(0, Number(v) || 0));
  const labs = labels.map((l) => String(l));
  const max = maxVal(vals);
  const n = Math.max(1, Math.min(labs.length, vals.length));
  const trackH = 100;

  return (
    <View style={styles.barWrap}>
      <View style={styles.barRow}>
        {Array.from({ length: n }).map((_, i) => {
          const hPx = Math.max(2, Math.round((vals[i] / max) * trackH));
          return (
            <View key={String(i)} style={styles.barCol}>
              <View style={[styles.barTrack, { height: trackH }]}>
                <View
                  style={[
                    styles.barFill,
                    { height: hPx, backgroundColor: barColor },
                  ]}
                />
              </View>
              <Text
                style={[styles.barLab, { fontFamily: "DMSans_400Regular" }]}
                numberOfLines={1}
              >
                {labs[i] ?? ""}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};


export const SimpleSparkBars: React.FC<SparkBarsProps> = ({
  values = [],
  barColor = colors.primary,
}) => {
  const vals = values.map((v) => Math.max(0, Number(v) || 0));
  const max = maxVal(vals);

  return (
    <View style={styles.sparkRow}>
      {vals.map((v, i) => {
        const h = Math.max(4, Math.round((v / max) * 72));
        return (
          <View
            key={String(i)}
            style={[
              styles.sparkBar,
              { height: h, backgroundColor: barColor },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  barWrap: {
    marginBottom: 16,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 140,
    paddingTop: 8,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 2,
  },
  barTrack: {
    width: "80%",
    justifyContent: "flex-end",
    backgroundColor: colors.mint,
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 6,
  },
  barLab: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: "center",
  },
  sparkRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 80,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sparkBar: {
    flex: 1,
    marginHorizontal: 1,
    borderRadius: 2,
    minHeight: 2,
  },
});