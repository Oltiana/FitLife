import type { NavigatorScreenParams } from '@react-navigation/native';

export type PilatesStackParamList = {
  DiscoverHub: { initialModality?: 'all' | 'pilates' | 'fitness' | 'yoga' } | undefined;
  PilatesList: undefined;
  BrowseModalityDetail: {
    id: string;
    modality: 'fitness' | 'yoga';
    title: string;
    description: string;
    minutes: number;
  };
  WorkoutDetail: { workoutId: string };
  ActiveWorkout: { workoutId: string };
  ProgramSchedule: { workoutId: string };
};

/** Kalendari javor për programet ku je regjistruar (Pilates, yoga, etj.) — sipas përdoruesit. */
export type CalendarStackParamList = {
  CalendarHub: undefined;
  ProgramSchedule: { workoutId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: NavigatorScreenParams<PilatesStackParamList>;
  Calendar: NavigatorScreenParams<CalendarStackParamList>;
  Progress: undefined;
  Profile: undefined;
};
