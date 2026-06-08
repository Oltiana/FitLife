import {
  normalizePilatesProgram,
  parseProgramExercisesJson,
  programToExerciseRefs,
  type PilatesProgram,
} from '../src/domain/PilatesProgramTypes';

describe('pilatesProgramTypes', () => {
  const sampleProgram: PilatesProgram = {
    id: '1',
    name: 'Core Flow',
    description: 'Test program',
    durationWeeks: 4,
    level: 'beginner',
    displayOrder: 2,
    workouts: [
      {
        id: 2,
        name: 'Session B',
        description: 'Second',
        durationMinutes: 20,
        orderIndex: 2,
        isCompleted: false,
      },
      {
        id: 1,
        name: 'Session A',
        description: 'First',
        durationMinutes: 15,
        orderIndex: 1,
        isCompleted: true,
      },
    ],
  };

  it('programToExerciseRefs sorts by orderIndex and converts minutes to seconds', () => {
    const refs = programToExerciseRefs(sampleProgram);
    expect(refs.map((r) => r.name)).toEqual(['Session A', 'Session B']);
    expect(refs[0]!.durationSec).toBe(900);
    expect(refs[1]!.durationSec).toBe(1200);
  });

  it('parseProgramExercisesJson returns valid refs only', () => {
    const json = JSON.stringify([
      { id: 'a', name: 'Breathing', durationSec: 60, description: 'Inhale' },
      { id: 12, name: 'Bad', durationSec: 30 },
    ]);
    const refs = parseProgramExercisesJson(json);
    expect(refs).toHaveLength(1);
    expect(refs[0]!.name).toBe('Breathing');
  });

  it('normalizePilatesProgram maps API-shaped payload', () => {
    const normalized = normalizePilatesProgram({
      id: 7,
      name: 'API Program',
      level: 'INTERMEDIATE',
      display_order: 3,
      workouts: [
        {
          id: 10,
          name: 'W1',
          description: 'D',
          durationMinutes: 12,
          orderIndex: 1,
          isCompleted: false,
        },
      ],
    });
    expect(normalized?.id).toBe('7');
    expect(normalized?.level).toBe('intermediate');
    expect(normalized?.displayOrder).toBe(3);
    expect(normalized?.workouts).toHaveLength(1);
  });
});
