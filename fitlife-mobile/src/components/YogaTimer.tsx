import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";

export default function YogaTimer() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (running) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  return (
    <View>
      <Text>{time}s</Text>

      <Pressable onPress={() => setRunning(!running)}>
        <Text>{running ? "Pause" : "Start"}</Text>
      </Pressable>

      <Pressable onPress={() => setTime(0)}>
        <Text>Reset</Text>
      </Pressable>
    </View>
  );
}