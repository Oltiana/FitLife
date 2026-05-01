import {
  caloriesForCompletion,
  estimatePilatesCalories,
} from '../src/domain/PilatesCaloriesEstimate';
import type { WorkoutCompletion } from '../src/domain/PilatesDomainTypes';

describe('caloriesEstimate', () => {
  it('estimatePilatesCalories uses MET 3 × 65 kg × hours', () => {
    expect(estimatePilatesCalories(0)).toBe(0);
    // 60 min → 3 * 65 * 1 = 195
    expect(estimatePilatesCalories(60)).toBe(195);
    // 30 min → 97.5 → 98
    expect(estimatePilatesCalories(30)).toBe(98);
  });

  it('caloriesForCompletion prefers stored caloriesBurned', () => {
    const base: WorkoutCompletion = {
      id: '1',
      workoutId: 'w',
      workoutTitle: 'T',
      completedAt: new Date().toISOString(),
      durationMinutes: 60,
    };
    expect(caloriesForCompletion(base)).toBe(195);
    expect(caloriesForCompletion({ ...base, caloriesBurned: 120 })).toBe(120);
  });
});
