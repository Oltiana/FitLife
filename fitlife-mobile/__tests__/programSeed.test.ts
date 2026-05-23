import { programToExerciseRefs } from '../src/domain/PilatesProgramTypes';
import { buildPilatesProgramsFromCatalog, workoutToPilatesProgram } from '../src/data/PilatesProgramSeed';
import { pilatesCatalog } from '../src/data/pilatesCatalog';

describe('programSeed', () => {
  it('maps catalog workouts to PilatesProgram with workouts[]', () => {
    const programs = buildPilatesProgramsFromCatalog();
    expect(programs.length).toBe(pilatesCatalog.length);
    for (const p of programs) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.durationWeeks).toBeGreaterThan(0);
      const ex = programToExerciseRefs(p);
      expect(ex.length).toBeGreaterThan(0);
      expect(ex[0]!.id).toBeTruthy();
    }
  });

  it('maps catalog exercises to workout rows for first program', () => {
    const w = pilatesCatalog[0]!;
    const p = workoutToPilatesProgram(w);
    const ex = programToExerciseRefs(p);
    expect(ex.length).toBe(w.exercises.length);
    expect(ex.map((e) => e.name)).toEqual(w.exercises.map((e) => e.name));
  });
});
