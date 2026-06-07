export type WorkoutPlan = {
  id: number;
  name: string;
  description?: string;
  level?: string;
};

export type WorkoutExercise = {
  id: number;
  exerciseName: string;
  bodyPart?: string;
  targetMuscle?: string;
  sets: number;
  reps: number;
};

export type WorkoutSession = {
  id: number;
  workoutPlanId: number;
  workoutPlanName?: string;
  durationMinutes?: number;
  calories?: number;
  completedAt?: string;
};