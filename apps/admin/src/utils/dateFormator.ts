type TimeFormatType = "date" | "time" | "both";

/**
 * Converts a UTC ISO timestamp to a user-friendly IST (India Standard Time) format.
 * @param utcTimestamp - UTC timestamp string (e.g., "2025-05-11T08:45:57.776Z")
 * @param type - Format type: "date", "time", or "both" (default: "both")
 * @returns A formatted string like "11 May 2025", "14:15:57", or "11 May 2025, 14:15:57"
 */
export function DateFormator(
  utcTimestamp: string,
  type: TimeFormatType = "both"
): string {
  const date = new Date(utcTimestamp);

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata"
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata"
  };

  const formattedDate = date.toLocaleDateString("en-GB", dateOptions);
  const formattedTime = date.toLocaleTimeString("en-GB", timeOptions);

  if (type === "date") return formattedDate;
  if (type === "time") return formattedTime;

  return `${formattedDate}, ${formattedTime}`;
}

