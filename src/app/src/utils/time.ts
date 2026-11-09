const DEFAULT_DURATION_MIN = 60;
const LAST_MINUTE_OF_DAY = 23 * 60 + 59;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(totalMinutes: number): string {
  const capped = Math.min(totalMinutes, LAST_MINUTE_OF_DAY);
  const h = Math.floor(capped / 60);
  const m = capped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * End time to propose when the start time changes ("HH:MM" strings, "" = empty).
 * - Valid previous range → keep its duration.
 * - Otherwise → 1 hour after the new start.
 * Capped at 23:59 so the end never wraps to the next day.
 */
export function nextEndTime(prevStart: string, prevEnd: string, newStart: string): string {
  if (!newStart) return "";

  const duration =
    prevStart && prevEnd && prevEnd > prevStart
      ? toMinutes(prevEnd) - toMinutes(prevStart)
      : DEFAULT_DURATION_MIN;

  return toHHMM(toMinutes(newStart) + duration);
}
