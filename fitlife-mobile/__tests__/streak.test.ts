import { calculateStreak } from '../src/domain/PilatesProgressStats';
import type { WorkoutCompletion } from '../src/domain/PilatesDomainTypes';

describe('calculateStreak', () => {
  it('returns 0 when user has no completions', () => {
    expect(calculateStreak([], 'user-1', new Date('2026-03-28T12:00:00'))).toBe(
      0,
    );
  });

  it('returns at least 1 when there is activity on the reference day', () => {
    const uid = 'user-local-1';
    const ref = new Date(2026, 2, 28, 12, 0, 0);
    const entries: WorkoutCompletion[] = [
      {
        id: '1',
        workoutId: 'w',
        workoutTitle: 'T',
        completedAt: new Date(2026, 2, 28, 9, 0, 0).toISOString(),
        durationMinutes: 10,
        userId: uid,
      },
    ];
    expect(calculateStreak(entries, uid, ref)).toBe(1);
  });
});
