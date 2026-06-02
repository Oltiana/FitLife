import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import {
  DMSans_400Regular,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { colors } from "../theme/colors";

const WEEK = ["S", "M", "T", "W", "TH", "F", "S"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const screenW = Dimensions.get("window").width;

const pad2 = (n: number): string => String(n).padStart(2, "0");

const toYMD = (y: number, m: number, d: number): string =>
  `${y}-${pad2(m)}-${pad2(d)}`;

type MarkedDate = {
  selected?: boolean;
  marked?: boolean;
  dotColor?: string;
  dots?: any[];
};

type Props = {
  selectedDate?: string;
  markedDates?: Record<string, MarkedDate>;
  onDayPress?: (day: { dateString: string }) => void;
  onVisibleMonthChange?: (month: string) => void;
  initialMonth?: string;
};

const SimpleMonthCalendar: React.FC<Props> = ({
  selectedDate,
  markedDates = {},
  onDayPress,
  onVisibleMonthChange,
  initialMonth,
}) => {
  const base =
    (selectedDate && selectedDate.length >= 10 && selectedDate) ||
    (initialMonth && initialMonth.length === 7 && `${initialMonth}-01`) ||
    new Date().toISOString().slice(0, 10);

  const [viewMonth, setViewMonth] = useState<string>(() => base.slice(0, 7));

  useEffect(() => {
    if (selectedDate && selectedDate.length >= 10) {
      setViewMonth(selectedDate.slice(0, 7));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (initialMonth && initialMonth.length === 7) {
      setViewMonth(initialMonth);
    }
  }, [initialMonth]);

  const { year, monthIndex, daysInMonth, startWeekday } = useMemo(() => {
    const [y, m] = viewMonth.split("-").map(Number);

    const year = Number.isFinite(y) ? y : new Date().getFullYear();
    const monthIndex =
      Number.isFinite(m) && m >= 1 && m <= 12
        ? m - 1
        : new Date().getMonth();

    const first = new Date(year, monthIndex, 1);
    const last = new Date(year, monthIndex + 1, 0);

    return {
      year,
      monthIndex,
      daysInMonth: last.getDate(),
      startWeekday: first.getDay(),
    };
  }, [viewMonth]);

  const shiftMonth = (delta: number) => {
    const d = new Date(year, monthIndex + delta, 1);
    const nm = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
    setViewMonth(nm);
    onVisibleMonthChange?.(nm);
  };

  const cellW = Math.floor((screenW - 40 - 24) / 7);

  const cells = useMemo(() => {
    const out: { type: "empty" | "day"; key: string; day?: number; dateString?: string }[] = [];

    for (let i = 0; i < startWeekday; i++) {
      out.push({ type: "empty", key: `e-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = toYMD(year, monthIndex + 1, day);
      out.push({ type: "day", key: dateString, day, dateString });
    }

    return out;
  }, [year, monthIndex, daysInMonth, startWeekday]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={() => shiftMonth(-1)} style={styles.arrowBtn}>
          <Text style={styles.arrow}>‹</Text>
        </Pressable>

        <Text style={[styles.monthTitle, { fontFamily: "DMSans_700Bold" }]}>
          {MONTH_NAMES[monthIndex]} {year}
        </Text>

        <Pressable onPress={() => shiftMonth(1)} style={styles.arrowBtn}>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEK.map((w, i) => (
          <View key={i} style={[styles.weekCell, { width: cellW }]}>
            <Text style={[styles.weekLab, { fontFamily: "DMSans_600SemiBold" }]}>
              {w}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((c) => {
          if (c.type === "empty") {
            return <View key={c.key} style={[styles.cell, { width: cellW }]} />;
          }

          const meta = markedDates?.[c.dateString!] || {};
          const isSel = selectedDate === c.dateString;
          const hasDot = meta.marked || meta.dots?.length;

          return (
            <Pressable
              key={c.key}
              style={[
                styles.cell,
                { width: cellW },
                isSel && styles.cellSel,
              ]}
              onPress={() => onDayPress?.({ dateString: c.dateString! })}
            >
              <Text
                style={[
                  styles.dayNum,
                  { fontFamily: "DMSans_400Regular" },
                  isSel && styles.dayNumSel,
                ]}
              >
                {c.day}
              </Text>

              {hasDot && (
                <View
                  style={[
                    styles.dot,
                    meta.dotColor && { backgroundColor: meta.dotColor },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default SimpleMonthCalendar;


const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  arrowBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  arrow: {
    fontSize: 28,
    color: colors.primary,
  },
  monthTitle: {
    fontSize: 17,
    color: colors.primary,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  weekCell: {
    alignItems: "center",
  },
  weekLab: {
    textAlign: "center",
    fontSize: 11,
    color: colors.textMuted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  cellSel: {
    backgroundColor: colors.primary,
  },
  dayNum: {
    fontSize: 15,
    color: colors.text,
  },
  dayNumSel: {
    color: "#fff",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
});