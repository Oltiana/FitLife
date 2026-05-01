import type { WorkoutCompletion } from './PilatesDomainTypes';
import type { PilatesLevel } from './PilatesDomainTypes';

/**
 * Vlerësim i përafërt (pa HR/peshë të përdoruesit).
 * MET ~3 (Pilates mesatare), masa referuese 65 kg: kcal ≈ MET × kg × (min/60).
 */
const REFERENCE_WEIGHT_KG = 65;
const BASE_PILATES_MET = 3;
const LEVEL_MET_BONUS: Record<PilatesLevel, number> = {
  beginner: 0,
  intermediate: 0.8,
  advanced: 1.4,
};

export function estimatePilatesCalories(
  durationMinutes: number,
  level: PilatesLevel = 'beginner',
): number {
  const hours = Math.max(0, durationMinutes) / 60;
  const met = BASE_PILATES_MET + (LEVEL_MET_BONUS[level] ?? 0);
  return Math.round(met * REFERENCE_WEIGHT_KG * hours);
}

/** Përdor vlerën e ruajtur ose vlerësimin nga minutat. */
export function caloriesForCompletion(entry: WorkoutCompletion): number {
  if (
    entry.caloriesBurned != null &&
    !Number.isNaN(entry.caloriesBurned) &&
    entry.caloriesBurned >= 0
  ) {
    return entry.caloriesBurned;
  }
  return estimatePilatesCalories(entry.durationMinutes);
}
