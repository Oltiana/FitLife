import type { ImageSourcePropType } from 'react-native';

export type ImageCropPosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight';

export type PilatesExercise = {
  id: string;
  name: string;
  description: string;
  durationSec: number;
  image: ImageSourcePropType;

  imageResizeMode?: 'cover' | 'contain';

  imageCropPosition?: ImageCropPosition;

  imageBannerFlex?: number;
};

export type PilatesLevel = 'beginner' | 'intermediate' | 'advanced';
export type PilatesCategory = 'core' | 'strength' | 'mobility';

const LEVEL_LABELS: Record<PilatesLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function normalizePilatesLevel(raw: string | undefined | null): PilatesLevel {
  const l = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (l === 'beginner' || l === 'intermediate' || l === 'advanced') {
    return l;
  }
  return 'beginner';
}

export function formatPilatesLevelLabel(
  raw: string | undefined | null,
): string {
  return LEVEL_LABELS[normalizePilatesLevel(raw)];
}

export type PilatesWorkout = {
  id: string;
  pilatesProgramId: string;

  pilatesWorkoutId?: number;

  pilatesWorkoutIds?: number[];
  title: string;
  level: PilatesLevel;
  category: PilatesCategory;
  estimatedMinutes: number;
  description: string;
  coverImage: ImageSourcePropType;
  exercises: PilatesExercise[];
};

export type WorkoutCompletion = {
  id: string;

  workoutId: string;

  pilatesWorkoutId?: number;

  pilatesWorkoutIds?: number[];

  pilatesProgramId?: string;
  workoutTitle: string;
  programName?: string;
  workoutName?: string;
  exercisesCompleted?: string[];
  completedAt: string;
  durationMinutes: number;

  userId?: string;

  caloriesBurned?: number;

  displayOrder?: number;
};
