import { tz, TZDate } from "@date-fns/tz"
import { format, intlFormat, isValid, parseISO } from "date-fns"

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

  // Handle date-only strings (YYYY-MM-DD) - create at midnight in local timezone
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDateString)) {
    const [year, month, day] = cleanDateString.split("-").map(Number)
    return new Date(year, month - 1, day)
  }

  // All other cases: use TZDate to interpret in site timezone
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
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = createLocalDate(date)

  // Use site's default options if none provided, excluding timeZone from display options
  const { timeZone, ...displayOptions } = SITE.locale.options
  const formatOptions = options ?? displayOptions

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
  timeZone: string = SITE.locale.options.timeZone || "UTC"
): string {
  const dateObj = createLocalDate(date)
  // For date-only inputs, use the local timezone instead of converting
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
    return format(dateObj, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", {
      in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
    })
  }
  return format(dateObj, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", {
    in: tz(timeZone)
  })
}

/**
 * Date range result object with machine-readable and display formats.
 */
export interface DateRangeResult {
  /** Start date object for machine-readable attributes */
  fromDate?: Date
  /** Formatted display text for start date */
  fromDateDisplay?: string
  /** End date object for machine-readable attributes */
  toDate?: Date
  /** Formatted display text for end date */
  toDateDisplay?: string
}

/**
 * Create a date range with both machine-readable and display formats.
 * Returns detailed date information for proper HTML time elements.
 *
 * @param fromDate - Start date of the range
 * @param toDate - End date of the range (optional, defaults to "Present")
 * @param options - Formatting options for date display
 * @returns Date range object with display and machine formats, or null if no dates
 */
export function createDateRange(
  fromDate?: Date,
  toDate?: Date,
  options?: Intl.DateTimeFormatOptions
): DateRangeResult | null {
  if (!fromDate && !toDate) return null

  const formatter = (d: Date) =>
    formatDate(d, SITE.locale.lang, {
      ...SITE.locale.options,
      day: undefined,
      ...options
    })

  const result = {
    fromDate,
    fromDateDisplay: fromDate ? formatter(fromDate) : undefined,
    toDate,
    toDateDisplay: toDate ? formatter(toDate) : undefined
  }

  return result
}
