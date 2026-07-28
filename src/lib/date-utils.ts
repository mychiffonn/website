import { tz, TZDate } from "@date-fns/tz"
import { formatISO, intlFormat, isValid, parseISO } from "date-fns"

import { SITE } from "@site-config"

/**
 * Extracts the date portion (YYYY-MM-DD) from an update filename/ID.
 * Supports both simple date format (YYYY-MM-DD) and Jekyll-style format (YYYY-MM-DD-description).
 *
 * @param str - The string to extract the date from
 * @returns The extracted date string in YYYY-MM-DD format, or null if invalid
 */
export function extractDateFromStr(str: string): string | null {
  // Remove file extension if present
  const idWithoutExt = str.replace(/\.[^/.]+$/, "")

  // Match YYYY-MM-DD at the start, optionally followed by a dash and description
  const dateMatch = idWithoutExt.match(/^(\d{4}-\d{2}-\d{2})(?:-.*)?$/)

  if (!dateMatch) {
    return null
  }

  const dateString = dateMatch[1]

  try {
    const parsed = parseISO(dateString)
    if (!isValid(parsed)) {
      return null
    }
  } catch {
    return null
  }

  return dateString
}

/**
 * Creates a valid Date object from various inputs.
 * - Sanitizes strings by removing quotes.
 * - For strings WITHOUT a timezone offset (e.g., "2025-10-17", "2025-10-17T14:30:00"),
 * it interprets them in the site's default timezone.
 * - For strings that ALREADY HAVE a timezone offset (e.g., "...Z", "...-07:00"),
 * it respects that offset.
 * @input string | number | Date
 * @returns Date Local date, with timezone and language support
 */
export function createLocalDate(dateInput: string | number | Date): Date {
  // Pass through non-string inputs
  if (dateInput instanceof Date) return dateInput
  if (typeof dateInput === "number") return new Date(dateInput)

  // Sanitize string input from potential YAML quotes
  const cleanDateString = dateInput.trim().replace(/^["']|["']$/g, "")
  const timeZone = SITE.locale.options.timeZone || "UTC"

  // Check for timezone indicator (Z or ±HH:MM)
  const hasTimezone = /Z|[+-]\d{2}:\d{2}$/.test(cleanDateString)

  // If already has timezone, use parseISO directly
  if (hasTimezone) {
    const parsed = parseISO(cleanDateString)
    return isValid(parsed) ? parsed : new TZDate(cleanDateString, timeZone)
  }

  // Offsetless calendar strings must be built from components: TZDate's string
  // constructor parses with plain Date semantics (system timezone) and only
  // renders in the target zone, which shifts the instant on non-site machines.
  const parts = cleanDateString.match(
    /^(\d{4})-(\d{2})(?:-(\d{2}))?(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?)?$/,
  )

  if (parts) {
    const [, year, month, day, hour, minute, second, ms] = parts
    return new TZDate(
      Number(year),
      Number(month) - 1,
      day ? Number(day) : 1,
      Number(hour ?? 0),
      Number(minute ?? 0),
      Number(second ?? 0),
      Number(ms?.padEnd(3, "0") ?? 0),
      timeZone,
    )
  }

  // Anything else (e.g. "Jan 5, 2026"): best-effort parse in the site timezone
  return new TZDate(cleanDateString, timeZone)
}

/**
 * Formats a date using the site's locale configuration.
 * Uses the site's default date format options if none provided.
 *
 * @param date - Date to format (Date object, timestamp number, or ISO string)
 * @param locale - BCP 47 language tag (defaults to site locale)
 * @param options - Formatting options (defaults to site's locale.options)
 * @returns Formatted date string
 */
export function formatDate(
  date: string | number | Date,
  locale = SITE.locale.lang,
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateObj = createLocalDate(date)

  // Keep the site timeZone in the display options; without it Intl renders in
  // whatever zone the build machine happens to run in.
  const formatOptions = {
    timeZone: SITE.locale.options.timeZone || "UTC",
    ...(options ?? SITE.locale.options),
  }

  // Use intlFormat for date formatting. It's a clean wrapper around Intl.DateTimeFormat.
  return intlFormat(dateObj, formatOptions, { locale })
}

/**
 * Generate a timezone-aware ISO datetime string for HTML `<time>` attributes.
 *
 * @param date - Date to format (Date object, timestamp number, or ISO string)
 * @param timeZone - Target timezone (defaults to site timezone)
 * @returns ISO 8601 datetime string suitable for HTML time element
 */
export function formatDateTimeISO(
  date: string | number | Date,
  timeZone: string = SITE.locale.options.timeZone || "UTC",
): string {
  return formatISO(createLocalDate(date), { in: tz(timeZone) })
}

/**
 * One run of range text, tagged with the endpoint it belongs to.
 */
export interface DateRangeSegment {
  /** Text to render */
  text: string
  /** ISO datetime for the endpoint this run describes; absent when both endpoints share the text (e.g. a common year) */
  dateTime?: string
  /** True for the dash between the two endpoints, which reads as silence to a screen reader */
  isSeparator?: boolean
}

/** Month + year by default: ranges read as "Jan – Mar 2024", not "Jan 5 – Mar 2 2024". */
function rangeFormatOptions(
  options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormatOptions {
  return {
    ...SITE.locale.options,
    day: undefined,
    ...options,
  }
}

/**
 * Formats a date range as display segments paired with machine-readable datetimes.
 *
 * Delegates to `Intl.DateTimeFormat.formatRangeToParts`, which already knows to
 * collapse a shared year ("Jan – Mar 2024"), spell both out across a boundary
 * ("Nov 2023 – Mar 2024"), and print a single date when both endpoints fall in
 * the same formatted period. Parts are merged by `source` so each endpoint can
 * be wrapped in its own `<time>` element.
 *
 * @param fromDate - Start of the range
 * @param toDate - End of the range (omit for an open-ended range)
 * @param options - Display options, merged over the site defaults
 * @param locale - BCP 47 language tag (defaults to site locale)
 * @returns Ordered segments, or null when neither endpoint is given
 */
export function formatDateRange(
  fromDate?: Date,
  toDate?: Date,
  options?: Intl.DateTimeFormatOptions,
  locale: string = SITE.locale.lang,
): DateRangeSegment[] | null {
  if (!fromDate && !toDate) return null

  const formatter = new Intl.DateTimeFormat(locale, rangeFormatOptions(options))

  // A single endpoint has no range to format.
  if (!fromDate || !toDate) {
    const date = (fromDate ?? toDate) as Date
    return [{ text: formatter.format(date), dateTime: formatDateTimeISO(date) }]
  }

  const parts = formatter.formatRangeToParts(fromDate, toDate)

  // Endpoints inside the same formatted period collapse to one date, with every
  // part marked "shared". Anchor that text to the start so it still gets a <time>.
  if (parts.every(({ source }) => source === "shared")) {
    return [
      {
        text: formatter.format(fromDate),
        dateTime: formatDateTimeISO(fromDate),
      },
    ]
  }

  const isoBySource: Record<string, string | undefined> = {
    startRange: formatDateTimeISO(fromDate),
    endRange: formatDateTimeISO(toDate),
    shared: undefined,
  }

  const segments = parts.reduce<DateRangeSegment[]>(
    (merged, { value, source }) => {
      const last = merged.at(-1)
      if (last && last.dateTime === isoBySource[source]) {
        last.text += value
      } else {
        merged.push({ text: value, dateTime: isoBySource[source] })
      }
      return merged
    },
    [],
  )

  // The shared run sitting between the endpoints is the dash; callers voice it.
  const endIndex = segments.findIndex(
    ({ dateTime }) => dateTime === isoBySource.endRange,
  )
  const separator = endIndex > 0 ? segments[endIndex - 1] : undefined
  if (separator && !separator.dateTime) separator.isSeparator = true

  return segments
}

/**
 * The locale's own range separator (e.g. " – " in en-US), read back from a
 * formatted sample range so open-ended ranges match closed ones.
 *
 * @param options - Display options, merged over the site defaults
 * @param locale - BCP 47 language tag (defaults to site locale)
 * @returns The literal text Intl places between the two endpoints
 */
export function getDateRangeSeparator(
  options?: Intl.DateTimeFormatOptions,
  locale: string = SITE.locale.lang,
): string {
  const parts = new Intl.DateTimeFormat(
    locale,
    rangeFormatOptions(options),
  ).formatRangeToParts(
    new Date(Date.UTC(2000, 0, 1)),
    new Date(Date.UTC(2001, 6, 1)),
  )

  const separator = parts.find(
    (part, index) =>
      part.type === "literal" &&
      part.source === "shared" &&
      parts.slice(0, index).some((p) => p.source === "startRange") &&
      parts.slice(index + 1).some((p) => p.source === "endRange"),
  )

  return separator?.value ?? " – "
}
