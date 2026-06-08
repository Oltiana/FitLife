import { sortProgramsByDisplayOrder } from '../src/data/pilates/cache';
import type { PilatesProgram } from '../src/domain/PilatesProgramTypes';

describe('pilatesCache', () => {
  it('sortProgramsByDisplayOrder sorts by displayOrder then name', () => {
    const programs: PilatesProgram[] = [
      {
        id: 'b',
        name: 'Beta',
        description: '',
        durationWeeks: 4,
        level: 'beginner',
        displayOrder: 2,
        workouts: [],
      },
      {
        id: 'a',
        name: 'Alpha',
        description: '',
        durationWeeks: 4,
        level: 'beginner',
        displayOrder: 1,
        workouts: [],
      },
      {
        id: 'c',
        name: 'Charlie',
        description: '',
        durationWeeks: 4,
        level: 'beginner',
        displayOrder: 1,
        workouts: [],
      },
    ];
    const sorted = sortProgramsByDisplayOrder(programs);
    expect(sorted.map((p) => p.name)).toEqual(['Alpha', 'Charlie', 'Beta']);
  });
});
