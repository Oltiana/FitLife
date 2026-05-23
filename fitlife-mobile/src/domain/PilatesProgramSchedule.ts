
export function programSlotKey(weekIndex: number, dayIndex: number): string {
  return `w${weekIndex}-d${dayIndex}`;
}

export function parseSlotKey(
  key: string,
): { weekIndex: number; dayIndex: number } | null {
  const m = /^w(\d+)-d(\d+)$/.exec(key);
  if (!m) return null;
  return { weekIndex: Number(m[1]), dayIndex: Number(m[2]) };
}

export function countMarkedInWeek(
  marked: Set<string>,
  weekIndex: number,
): number {
  let n = 0;
  for (let d = 0; d < 7; d++) {
    if (marked.has(programSlotKey(weekIndex, d))) n++;
  }
  return n;
}


export function isProgramWeekUnlocked(
  weekIndex: number,
  marked: Set<string>,
  totalWeeks: number,
): boolean {
  if (weekIndex < 0 || weekIndex >= totalWeeks) return false;
  if (weekIndex === 0) return true;
  return countMarkedInWeek(marked, weekIndex - 1) >= 2;
}

export function canToggleSlot(
  weekIndex: number,
  dayIndex: number,
  marked: Set<string>,
  totalWeeks: number,
): boolean {
  if (weekIndex < 0 || weekIndex >= totalWeeks) return false;
  if (dayIndex < 0 || dayIndex > 6) return false;
  const key = programSlotKey(weekIndex, dayIndex);
  if (marked.has(key)) return true;
  return isProgramWeekUnlocked(weekIndex, marked, totalWeeks);
}


export function isProgramCompleted(
  marked: Set<string>,
  totalWeeks: number,
): boolean {
  if (totalWeeks <= 0) return false;
  return countMarkedInWeek(marked, totalWeeks - 1) >= 2;
}
