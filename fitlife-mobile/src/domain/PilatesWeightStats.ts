import { localCalendarDayKey } from './PilatesProgressStats';

export type WeightEntry = {
  id: string;
  /** ISO ose YYYY-MM-DD; përdoret dita lokale. */
  date: string;
  kg: number;
};

function dayKeyFromEntry(e: WeightEntry): string {
  const d = new Date(e.date);
  if (Number.isNaN(d.getTime())) return e.date.slice(0, 10);
  return localCalendarDayKey(d);
}

/** Renditur nga e vjetra te e reja. */
export function sortWeightEntries(entries: WeightEntry[]): WeightEntry[] {
  return [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

/** 30 ditët e fundit: vlera e fundit e njohur deri në atë ditë (për grafik të vazhdueshëm). */
export function weightLast30DaysSeries(
  entries: WeightEntry[],
  now: Date = new Date(),
): { value: number; label: string }[] {
  const sorted = sortWeightEntries(entries);
  const byDay = new Map<string, number>();
  for (const e of sorted) {
    byDay.set(dayKeyFromEntry(e), e.kg);
  }
  const result: { value: number; label: string }[] = [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let carry = 0;
  let haveCarry = false;
  for (let i = 29; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const key = localCalendarDayKey(day);
    const v = byDay.get(key);
    if (v != null) {
      carry = v;
      haveCarry = true;
    }
    const showLabel = i % 7 === 0 || i === 0;
    const label = showLabel
      ? `${day.getMonth() + 1}/${day.getDate()}`
      : '';
    result.push({ value: haveCarry ? carry : 0, label });
  }
  return result;
}

export function weightChartMax(series: { value: number }[]): number {
  const vals = series.map((s) => s.value).filter((v) => v > 0);
  if (vals.length === 0) return 100;
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const pad = Math.max(1, (max - min) * 0.08);
  return Math.ceil(max + pad);
}

/** Rekordi më i ulët (për motivim humbje peshe); null nëse pa të dhëna. */
export function lowestWeightKg(entries: WeightEntry[]): number | null {
  if (entries.length === 0) return null;
  return Math.min(...entries.map((e) => e.kg));
}

/** Ndryshimi nga hyrja e parë te e fundit (negativ = ulje). */
export function weightDeltaFromFirst(entries: WeightEntry[]): number | null {
  const s = sortWeightEntries(entries);
  if (s.length < 2) return null;
  return s[s.length - 1]!.kg - s[0]!.kg;
}
