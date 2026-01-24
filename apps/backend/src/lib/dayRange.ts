export function getDayWindow(now: Date = new Date()): { from: Date; to: Date } {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

  const istNow = new Date(now.getTime() + IST_OFFSET_MS);

  istNow.setUTCHours(0, 0, 0, 0);

  const from = new Date(istNow.getTime() - IST_OFFSET_MS);
  const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);

  return { from, to };
}
