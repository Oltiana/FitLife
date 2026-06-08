import {
  bookingBlockedReason,
  buildCalendarMarkedDates,
  decrementSessionCapacity,
  filterSessionsByDate,
  filterSessionsByInstructor,
  formatYogaTimerSeconds,
  isSessionBookable,
  isValidSessionDateKey,
  sessionDateKey,
  uniqueInstructorNames,
  type YogaSessionLike,
} from '../src/domain/yogaSessionUtils';

describe('yogaSessionUtils', () => {
  const sessions: YogaSessionLike[] = [
    {
      id: 1,
      sessionDate: '2026-06-10T09:00:00.000Z',
      capacity: 5,
      instructorName: 'Ana',
    },
    {
      id: 2,
      sessionDate: '2026-06-11T09:00:00.000Z',
      capacity: 0,
      instructorName: 'Ben',
    },
    {
      id: 3,
      sessionDate: '2026-06-10T18:00:00.000Z',
      capacity: 3,
      instructorName: 'Ana',
    },
  ];

  it('filterSessionsByDate keeps only matching calendar day', () => {
    const filtered = filterSessionsByDate(sessions, '2026-06-10');
    expect(filtered.map((s) => s.id)).toEqual([1, 3]);
  });

  it('filterSessionsByDate returns empty for invalid selected date', () => {
    expect(filterSessionsByDate(sessions, '10-06-2026')).toEqual([]);
    expect(filterSessionsByDate(sessions, '')).toEqual([]);
  });

  it('sessionDateKey and isValidSessionDateKey handle invalid values', () => {
    expect(sessionDateKey('2026-06-10T09:00:00.000Z')).toBe('2026-06-10');
    expect(sessionDateKey(undefined)).toBeNull();
    expect(sessionDateKey('not-a-date')).toBeNull();
    expect(isValidSessionDateKey('2026-06-10')).toBe(true);
    expect(isValidSessionDateKey('2026-13-40')).toBe(false);
  });

  it('decrementSessionCapacity reduces capacity for booked session', () => {
    const next = decrementSessionCapacity(sessions, 1);
    expect(next.find((s) => s.id === 1)?.capacity).toBe(4);
    expect(next.find((s) => s.id === 2)?.capacity).toBe(0);
  });

  it('decrementSessionCapacity does not go below zero', () => {
    const next = decrementSessionCapacity(sessions, 2);
    expect(next.find((s) => s.id === 2)?.capacity).toBe(0);
  });

  it('uniqueInstructorNames returns distinct instructors', () => {
    expect(uniqueInstructorNames(filterSessionsByDate(sessions, '2026-06-10'))).toEqual(
      ['Ana'],
    );
  });

  it('filterSessionsByInstructor filters only when name is set', () => {
    expect(filterSessionsByInstructor(sessions, '').map((s) => s.id)).toEqual([
      1, 2, 3,
    ]);
    expect(filterSessionsByInstructor(sessions, 'Ben').map((s) => s.id)).toEqual([2]);
  });

  it('isSessionBookable checks capacity', () => {
    expect(isSessionBookable(sessions[0]!)).toBe(true);
    expect(isSessionBookable(sessions[1]!)).toBe(false);
  });

  it('bookingBlockedReason explains why booking fails', () => {
    expect(bookingBlockedReason(undefined)).toBe('Session not found');
    expect(bookingBlockedReason(sessions[1]!)).toBe('Session is full');
    expect(bookingBlockedReason(sessions[0]!)).toBeNull();
    expect(
      bookingBlockedReason({
        id: 9,
        capacity: 2,
        instructorName: 'Zoe',
        sessionDate: 'bad',
      }),
    ).toBe('Invalid session date');
  });

  it('buildCalendarMarkedDates marks only bookable days and selected date', () => {
    const marks = buildCalendarMarkedDates(sessions, '2026-06-10');
    expect(marks['2026-06-10']).toEqual({
      marked: true,
      dotColor: '#22C55E',
      selected: true,
    });
    expect(marks['2026-06-11']).toBeUndefined();
  });

  it('formatYogaTimerSeconds formats mm:ss', () => {
    expect(formatYogaTimerSeconds(0)).toBe('0:00');
    expect(formatYogaTimerSeconds(65)).toBe('1:05');
    expect(formatYogaTimerSeconds(-3)).toBe('0:00');
  });
});
