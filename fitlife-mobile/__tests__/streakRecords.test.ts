import {
  longestStreakEver,
  todayActivityTotals,
} from '../src/domain/PilatesProgressStats';
import type { WorkoutCompletion } from '../src/domain/PilatesDomainTypes';

describe('longestStreakEver', () => {
  const uid = 'user-local-1';

  it('returns 0 with no completions', () => {
    expect(longestStreakEver([], uid)).toBe(0);
  });

  it('returns length of longest consecutive day run', () => {
    const entries: WorkoutCompletion[] = [
      {
        id: 'a',
        workoutId: 'w',
        workoutTitle: 'T',
        completedAt: new Date(2026, 2, 10, 9, 0, 0).toISOString(),
        durationMinutes: 10,
        userId: uid,
      },
      {
        id: 'b',
        workoutId: 'w',
        workoutTitle: 'T',
        completedAt: new Date(2026, 2, 26, 9, 0, 0).toISOString(),
        durationMinutes: 10,
        userId: uid,
      },
      {
        id: 'c',
        workoutId: 'w',
        workoutTitle: 'T',
        completedAt: new Date(2026, 2, 27, 9, 0, 0).toISOString(),
        durationMinutes: 10,
        userId: uid,
      },
      {
        id: 'd',
        workoutId: 'w',
        workoutTitle: 'T',
        completedAt: new Date(2026, 2, 28, 9, 0, 0).toISOString(),
        durationMinutes: 10,
        userId: uid,
      },
    ];
    expect(longestStreakEver(entries, uid)).toBe(3);
  });
});

describe('todayActivityTotals', () => {
  const fixed = new Date(2026, 2, 28, 14, 0, 0);

  it('sums minutes and calories for the local calendar day', () => {
    const entries: WorkoutCompletion[] = [
      {
        id: '1',
        workoutId: 'w',
        workoutTitle: 'T',
        completedAt: new Date(2026, 2, 28, 8, 0, 0).toISOString(),
        durationMinutes: 15,
      },
      {
        id: '2',
        workoutId: 'w',
        workoutTitle: 'T',
        completedAt: new Date(2026, 2, 27, 8, 0, 0).toISOString(),
        durationMinutes: 99,
      },
    ];
    const t = todayActivityTotals(entries, fixed);
    expect(t.minutes).toBe(15);
    expect(t.calories).toBeGreaterThan(0);
  });
});
