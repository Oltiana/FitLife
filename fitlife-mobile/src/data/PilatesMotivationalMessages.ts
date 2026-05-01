/**
 * Mesazhe të thjeshta motivuese sipas kontekstit të progresit.
 */
const GENERAL = [
  'Every mindful minute adds up — keep showing up for yourself.',
  'Small steps today build stronger habits tomorrow.',
  'Your body appreciates the consistency, not the perfection.',
  'Progress is built one session at a time.',
];

export function pickMotivationalMessage(
  streak: number,
  totalMinutes: number,
  totalSessions: number,
): string {
  if (totalSessions === 0) {
    return 'Complete your first session — the best time to start is now.';
  }
  if (totalMinutes >= 180 && streak >= 1) {
    return 'You have serious dedication — keep that energy going.';
  }
  if (streak >= 14) {
    return 'Two weeks of consistency — that is real commitment.';
  }
  if (streak >= 7) {
    return 'A full week streak — you are building something lasting.';
  }
  if (streak >= 3) {
    return 'Three days in a row — momentum is on your side.';
  }
  const i =
    (streak + totalSessions + Math.floor(totalMinutes / 10)) % GENERAL.length;
  return GENERAL[i] ?? GENERAL[0]!;
}
