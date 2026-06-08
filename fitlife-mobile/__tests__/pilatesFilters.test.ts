import {
  filterCompletionsByPeriod,
  filterCompletionsForUser,
  filterWorkoutsByLevel,
} from '../src/domain/PilatesProgressStats';
import type { WorkoutCompletion } from '../src/domain/PilatesDomainTypes';

describe('pilatesFilters', () => {
  const now = new Date('2026-03-28T12:00:00.000Z');
  const entries: WorkoutCompletion[] = [
    {
      id: '1',
      workoutId: 'w1',
      workoutTitle: 'A',
      completedAt: '2026-03-28T10:00:00.000Z',
      durationMinutes: 20,
      userId: 'user-a',
    },
    {
      id: '2',
      workoutId: 'w2',
      workoutTitle: 'B',
      completedAt: '2026-03-20T10:00:00.000Z',
      durationMinutes: 15,
      userId: 'user-b',
    },
  ];

  it('filterCompletionsForUser keeps only matching user rows', () => {
    const filtered = filterCompletionsForUser(entries, 'user-a');
    expect(filtered).toHaveLength(1);
    expect(filtered[0]!.id).toBe('1');
  });

  it('filterCompletionsByPeriod limits to last 7 days', () => {
    const filtered = filterCompletionsByPeriod(entries, '7d', now);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]!.id).toBe('1');
  });

  it('filterWorkoutsByLevel filters optional level', () => {
    const items = [
      { id: '1', level: 'beginner' as const },
      { id: '2', level: 'advanced' as const },
    ];
    expect(filterWorkoutsByLevel(items, 'advanced')).toHaveLength(1);
    expect(filterWorkoutsByLevel(items)).toHaveLength(2);
  });
});
