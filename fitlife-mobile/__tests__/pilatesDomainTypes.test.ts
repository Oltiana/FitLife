import {
  formatPilatesLevelLabel,
  normalizePilatesLevel,
} from '../src/domain/PilatesDomainTypes';

describe('pilatesDomainTypes', () => {
  it('normalizePilatesLevel accepts known levels and defaults to beginner', () => {
    expect(normalizePilatesLevel('Beginner')).toBe('beginner');
    expect(normalizePilatesLevel('INTERMEDIATE')).toBe('intermediate');
    expect(normalizePilatesLevel('advanced')).toBe('advanced');
    expect(normalizePilatesLevel('')).toBe('beginner');
    expect(normalizePilatesLevel(undefined)).toBe('beginner');
  });

  it('formatPilatesLevelLabel returns display labels', () => {
    expect(formatPilatesLevelLabel('intermediate')).toBe('Intermediate');
    expect(formatPilatesLevelLabel('unknown')).toBe('Beginner');
  });
});
