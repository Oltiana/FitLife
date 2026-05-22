import { View, Text, StyleSheet } from 'react-native';

export function WorkoutPlansScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Plans</Text>
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