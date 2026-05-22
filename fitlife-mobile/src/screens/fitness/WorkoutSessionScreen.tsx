import { View, Text, StyleSheet } from 'react-native';

export function WorkoutSessionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Session</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
});