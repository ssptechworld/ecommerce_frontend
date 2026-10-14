/**
 * Converts a UTC ISO datetime string (from the database) to the user's
 * local system timezone and returns a formatted, human-readable string.
 *
 * The browser's Intl API automatically handles the UTC → local conversion.
 * No manual offset calculations are needed — this is the correct approach.
 *
 * @param utcDateStr - ISO 8601 UTC date string, e.g. "2026-08-14T20:18:41.701369Z"
 * @param options    - Optional Intl.DateTimeFormatOptions overrides
 * @returns Formatted local date string, e.g. "19 Aug 2026, 01:48 AM"
 */
export const formatLocalDate = (
  utcDateStr: string | undefined | null,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!utcDateStr) return "—";

  // Ensure the string ends with 'Z' so JS treats it as UTC
  const normalized = utcDateStr.endsWith("Z") ? utcDateStr : utcDateStr + "Z";

  const date = new Date(normalized);
  if (isNaN(date.getTime())) return "Invalid date";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  // Intl.DateTimeFormat with undefined locale uses the browser's system locale
  // undefined timezone uses the system's local timezone — exactly what we want
  return new Intl.DateTimeFormat(undefined, options ?? defaultOptions).format(date);
};

/**
 * Shorthand: date only (no time), converted to user's local timezone.
 * e.g. "19 Aug 2026"
 */
export const formatLocalDateOnly = (utcDateStr: string | undefined | null): string => {
  return formatLocalDate(utcDateStr, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
