import React from "react";
import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";


import YogaHomeScreen from "../screens/yoga/YogaHomeScreen";
import WorkoutDetailScreen from "../screens/yoga/WorkoutDetailScreen";
import UpcomingScreen from "../screens/yoga/UpcomingScreen";
import ScheduleScreen from "../screens/yoga/ScheduleScreen";


const Stack = createNativeStackNavigator();

export default function YogaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="YogaHome"
        component={YogaHomeScreen}
      />

      <Stack.Screen
        name="Upcoming"
        component={UpcomingScreen}
      />

      <Stack.Screen
        name="WorkoutDetail"
        component={WorkoutDetailScreen}
      />

      <Stack.Screen name="Schedule" component={ScheduleScreen} />
    </Stack.Navigator>
  );
}