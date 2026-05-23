


export type PilatesWorkoutResponse = {
  id: number;
  pilatesProgramId?: number;
  name: string;
  description: string;
  durationMinutes: number;
  orderIndex: number;
  isCompleted: boolean;
};

export type PilatesProgramResponse = {
  id: number;
  name: string;
  description: string;
  durationWeeks: number;
  level: string;
  displayOrder: number;
  workouts: PilatesWorkoutResponse[];
};


export type CreatePilatesProgramRequest = {
  name: string;
  description: string;
  durationWeeks: number;
  level: string;
  displayOrder: number;
};


export type CreatePilatesWorkoutRequest = {
  pilatesProgramId: number;
  name: string;
  description: string;
  durationMinutes: number;
  orderIndex: number;
};


export type EnrollPilatesProgramRequest = {
  pilatesProgramId: number;
};


export type CompletePilatesWorkoutRequest = {
  pilatesWorkoutId: number;
};


export type UserPilatesProgressResponse = {
  pilatesProgramId: number;
  programName: string;
  totalWorkouts: number;
  completedWorkouts: number;
  progressPercent: number;
  enrolledAt: string;
  completedAt: string | null;
};


export type UserPilatesWorkoutProgressResponse = {
  id: number;
  pilatesWorkoutId: number;
  pilatesProgramId: number;
  workoutName: string;
  isCompleted: boolean;
  completedAt: string | null;
  durationMinutes: number;
};
