import type { NavigatorScreenParams } from '@react-navigation/native';

export type PilatesSectionTabParamList = {
  PilatesWorkouts: undefined;
  Progress: undefined;
};

export type PilatesStackParamList = {
  DiscoverHub: { initialModality?: 'all' | 'pilates' | 'fitness' | 'yoga' } | undefined;
  PilatesHome: NavigatorScreenParams<PilatesSectionTabParamList> | undefined;
  PilatesList: undefined;
  BrowseModalityDetail: {
    id: string;
    modality: 'fitness' | 'yoga';
    title: string;
    description: string;
    minutes: number;
  };
  WorkoutDetail: { workoutId: string };
  ActiveWorkout: {
    workoutId: string;
    pilatesWorkoutId?: number;
    pilatesProgramId?: number;
    pilatesWorkoutIds?: number[];
  };
  ProgramSchedule: { workoutId: string };
};

export type CalendarStackParamList = {
  CalendarHub: undefined;
  ProgramSchedule: { workoutId: string };
};

export type YogaStackParamList = {
  YogaHome: undefined;
  WorkoutDetail: undefined;
  Upcoming: undefined;
  Schedule: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Fitness: undefined;
  Search: NavigatorScreenParams<PilatesStackParamList>;
  Yoga: NavigatorScreenParams<YogaStackParamList>;
  Profile: undefined;
};
