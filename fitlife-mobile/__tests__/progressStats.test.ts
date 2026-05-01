import {
  minutesLast7DaysByDay,
  minutesPerWeekLast4Windows,
  totalCompletedSessions,
  totalMinutes,
} from '../src/domain/PilatesProgressStats';
import type { WorkoutCompletion } from '../src/domain/PilatesDomainTypes';

describe('progressStats', () => {
  const fixedNow = new Date('2026-03-28T15:00:00.000Z');

  it('sums minutes into the correct day over last 7 days', () => {
    const entries: WorkoutCompletion[] = [
      {
        id: '1',
        workoutId: 'a',
        workoutTitle: 'Test',
        completedAt: '2026-03-28T10:00:00.000Z',
        durationMinutes: 20,
      },
      {
        id: '2',
        workoutId: 'a',
        workoutTitle: 'Test',
        completedAt: '2026-03-27T08:00:00.000Z',
        durationMinutes: 15,
      },
    ];

    const series = minutesLast7DaysByDay(entries, fixedNow);
    expect(series).toHaveLength(7);
    const last = series[series.length - 1];
    expect(last.value).toBe(20);
    expect(totalMinutes(entries)).toBe(35);
    expect(totalCompletedSessions(entries)).toBe(2);
  });

  it('aggregates weekly windows', () => {
    const entries: WorkoutCompletion[] = [
      {
        id: '1',
        workoutId: 'a',
        workoutTitle: 'Test',
        completedAt: '2026-03-27T12:00:00.000Z',
        durationMinutes: 10,
      },
    ];
    const weeks = minutesPerWeekLast4Windows(entries, fixedNow);
    expect(weeks).toHaveLength(4);
    expect(weeks.reduce((a, b) => a + b.value, 0)).toBeGreaterThanOrEqual(10);
  });
});
