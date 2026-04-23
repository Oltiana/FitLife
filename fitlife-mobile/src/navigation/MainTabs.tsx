import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";

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

function ProfileScreen() {
  return (
    <View>
      <Text>Profile Module</Text>
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Fitness" component={FitnessScreen} />
      <Tab.Screen name="Yoga" component={YogaScreen} />
      <Tab.Screen name="Pilates" component={PilatesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}