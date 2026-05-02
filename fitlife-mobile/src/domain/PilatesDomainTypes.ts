import type { ImageSourcePropType } from 'react-native';

/** Maps to expo-image `contentPosition` when using `cover`. */
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
  /** `contain` = full image + letterbox; active workout defaults to `cover` (fills frame). */
  imageResizeMode?: 'cover' | 'contain';
  /** Where to anchor the crop for `cover` (full-body shots often need `top` or `bottom`). */
  imageCropPosition?: ImageCropPosition;
  /** Vertical share of the active-workout screen for the image banner vs panel (default 1). */
  imageBannerFlex?: number;
};

export type PilatesLevel = 'beginner' | 'intermediate' | 'advanced';
export type PilatesCategory = 'core' | 'strength' | 'mobility';

export type PilatesWorkout = {
  id: string;
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
  workoutTitle: string;
  completedAt: string;
  durationMinutes: number;
  /** Lidhur me `User.id` (MVP: përdorues lokal). */
  userId?: string;
  /** Vlerësim i kalorive të djegura për këtë seancë (kcal). */
  caloriesBurned?: number;
  /** Radhë e qëndrueshme nga serveri (1, 2, …); opsionale për hyrje vetëm lokale. */
  displayOrder?: number;
};
