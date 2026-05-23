

export const PilatesApiRoutes = {
  programs: '/api/Pilates/programs',
  programById: (id: number | string) => `/api/Pilates/programs/${id}`,
  enroll: '/api/Pilates/enroll',
  myEnrollments: '/api/Pilates/my-enrollments',
  myEnrollmentByProgramId: (pilatesProgramId: number | string) =>
    `/api/Pilates/my-enrollments/${pilatesProgramId}`,
  myWorkoutProgress: '/api/Pilates/my-workout-progress',
  completeWorkout: '/api/Pilates/complete-workout',
  workouts: '/api/Pilates/workouts',
} as const;
