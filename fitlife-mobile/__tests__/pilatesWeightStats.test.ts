import {
  lowestWeightKg,
  sortWeightEntries,
  weightDeltaFromFirst,
  weightLast30DaysSeries,
} from '../src/domain/PilatesWeightStats';

describe('pilatesWeightStats', () => {
  const entries = [
    { id: '2', date: '2026-03-10T08:00:00.000Z', kg: 68 },
    { id: '1', date: '2026-03-01T08:00:00.000Z', kg: 70 },
    { id: '3', date: '2026-03-28T08:00:00.000Z', kg: 66 },
  ];

  it('sortWeightEntries orders chronologically', () => {
    const sorted = sortWeightEntries(entries);
    expect(sorted.map((e) => e.kg)).toEqual([70, 68, 66]);
  });

  it('lowestWeightKg and weightDeltaFromFirst', () => {
    expect(lowestWeightKg(entries)).toBe(66);
    expect(weightDeltaFromFirst(entries)).toBe(-4);
  });

  it('weightLast30DaysSeries returns 30 points', () => {
    const series = weightLast30DaysSeries(
      entries,
      new Date('2026-03-28T12:00:00.000Z'),
    );
    expect(series).toHaveLength(30);
    expect(series[series.length - 1]!.value).toBe(66);
  });
});
