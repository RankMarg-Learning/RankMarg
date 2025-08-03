export function getDayWindow(): { from: Date; to: Date } {
  const now = new Date();
  const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
  const past = new Date(now.getTime() - twentyFourHoursInMs);

  return { from: past, to: now };
}
