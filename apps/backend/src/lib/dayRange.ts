import { addDays, setHours, setMinutes, setSeconds } from "date-fns";

/**
 * Returns the UTC time window corresponding to 1:00 AM IST today to 1:00 AM IST tomorrow.
 */
export function getDayWindow(): { from: Date; to: Date } {
  const IST_OFFSET_MS: number = 5.5 * 60 * 60 * 1000; // +5:30 in milliseconds

  const now: Date = new Date();
  const istNow: Date = new Date(now.getTime() + IST_OFFSET_MS);

  let ist1AM: Date = setSeconds(setMinutes(setHours(istNow, 1), 0), 0);
  if (istNow.getHours() < 1) {
    ist1AM = addDays(ist1AM, -1);
  }

  const from: Date = new Date(ist1AM.getTime() - IST_OFFSET_MS);
  const to: Date = new Date(from.getTime() + 24 * 60 * 60 * 1000);

  return { from, to };
}
