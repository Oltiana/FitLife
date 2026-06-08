import {
  findCatalogByProgramName,
  getCatalogWorkoutById,
  pilatesCatalog,
} from '../src/data/pilates/catalog';

describe('pilatesCatalog', () => {
  it('has built-in workouts with exercises', () => {
    expect(pilatesCatalog.length).toBeGreaterThan(0);
    for (const w of pilatesCatalog) {
      expect(w.id).toBeTruthy();
      expect(w.title).toBeTruthy();
      expect(w.exercises.length).toBeGreaterThan(0);
      expect(w.estimatedMinutes).toBeGreaterThan(0);
    }
  });

  it('getCatalogWorkoutById returns a workout by id', () => {
    const first = pilatesCatalog[0]!;
    expect(getCatalogWorkoutById(first.id)?.title).toBe(first.title);
    expect(getCatalogWorkoutById('missing-id')).toBeUndefined();
  });

  it('findCatalogByProgramName matches case-insensitively', () => {
    const first = pilatesCatalog[0]!;
    expect(findCatalogByProgramName(first.title.toUpperCase())?.id).toBe(
      first.id,
    );
  });
});
