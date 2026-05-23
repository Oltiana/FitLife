
export { PilatesApiRoutes } from '../api/pilatesApiRoutes';

export const PILATES_DB_TABLES = {
  programs: 'PilatesPrograms',
  workouts: 'PilatesWorkouts',
  enrollments: 'UserPilatesEnrollments',
  progresses: 'UserPilatesProgresses',
} as const;
