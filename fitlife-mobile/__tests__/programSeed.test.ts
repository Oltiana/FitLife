import { parseProgramExercisesJson } from '../src/domain/PilatesProgramTypes';
import { buildPilatesProgramsFromCatalog, workoutToPilatesProgram } from '../src/data/PilatesProgramSeed';
import { pilatesCatalog } from '../src/data/pilatesCatalog';

describe('programSeed', () => {
  it('maps catalog workouts to PilatesProgram with valid exercises_json', () => {
    const programs = buildPilatesProgramsFromCatalog();
    expect(programs.length).toBe(pilatesCatalog.length);
    for (const p of programs) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.duration_weeks).toBeGreaterThan(0);
      const ex = parseProgramExercisesJson(p.exercises_json);
      expect(ex.length).toBeGreaterThan(0);
      expect(ex[0]!.id).toBeTruthy();
    }
  });

  it('round-trips exercise refs for first workout', () => {
    const w = pilatesCatalog[0]!;
    const p = workoutToPilatesProgram(w);
    const ex = parseProgramExercisesJson(p.exercises_json);
    expect(ex.map((e) => e.id)).toEqual(w.exercises.map((e) => e.id));
  });
});
