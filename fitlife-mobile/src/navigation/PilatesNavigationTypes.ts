import type { NavigatorScreenParams } from '@react-navigation/native';

export type PilatesStackParamList = {
  PilatesList: undefined;
  WorkoutDetail: { workoutId: string };
  ActiveWorkout: { workoutId: string };
  ProgramSchedule: { workoutId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Pilates: NavigatorScreenParams<PilatesStackParamList>;
  Progress: undefined;
};
