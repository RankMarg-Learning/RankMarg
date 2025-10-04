import { startOfDay, subDays } from "date-fns";

export function getDayWindow(): { from: Date; to: Date } {
  const IST_OFFSET_MS: number = 5.5 * 60 * 60 * 1000;

  const nowUtc: Date = new Date();
  const nowIst: Date = new Date(nowUtc.getTime() + IST_OFFSET_MS);

  const startOfTodayIst: Date = startOfDay(nowIst);
  const startOfPrevDayIst: Date = subDays(startOfTodayIst, 1);

  const from: Date = new Date(startOfPrevDayIst.getTime() - IST_OFFSET_MS);
  const to: Date = new Date(startOfTodayIst.getTime() - IST_OFFSET_MS);

  return { from, to };
}
