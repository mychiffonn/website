import {
  differenceInCalendarDays,
  intlFormat,
  intlFormatDistance,
  isValid,
  parseISO
} from "date-fns"
import { formatInTimeZone, fromZonedTime } from "date-fns-tz"

import { SITE } from "@site-config"

// ============================================================================
// DATE VALIDATION & PARSING
// ============================================================================

/**
 * Extracts the date portion (YYYY-MM-DD) from an update filename/ID.
 * Supports both simple date format (YYYY-MM-DD) and Jekyll-style format (YYYY-MM-DD-description).
 *
 * @param updateId - The update filename/ID (with or without extension)
 * @returns The extracted date string in YYYY-MM-DD format, or null if invalid
 */
export function extractDateFromUpdateId(updateId: string): string | null {
  // Remove file extension if present
  const idWithoutExt = updateId.replace(/\.[^/.]+$/, "")

  // Match YYYY-MM-DD at the start, optionally followed by a dash and description
  const dateMatch = idWithoutExt.match(/^(\d{4}-\d{2}-\d{2})(?:-.*)?$/)

  if (!dateMatch) {
    return null
  }

  const dateString = dateMatch[1]

  // Validate that it's a real date
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return null
  }

  return dateString
}

/**
 * Validates if a string is a machine-readable format suitable for
 * the <time> element's `datetime` attribute.
 *
 * It primarily checks for ISO 8601 compliance, which covers the vast
 * majority of valid formats like YYYY-MM-DD, YYYY-MM, and full timestamps.
 *
 * @param input The string or value to validate.
 * @returns {boolean} True if the input is a valid machine-readable date string.
 */
export function isValidMachineReadableDate(input: unknown): boolean {
  if (typeof input !== "string" || input.trim() === "") {
    return false
  }

  // parseISO is designed to parse ISO 8601 strings, which is the
  // most robust format for the datetime attribute. It will correctly
  // parse full dates, dates with times, and timezone offsets.
  const date = parseISO(input)

  // isValid checks if the resulting date from parsing is a real date.
  return isValid(date)
}

/**
 * Creates a valid Date object from various inputs.
 * - Sanitizes strings by removing quotes.
 * - For strings WITHOUT a timezone offset (e.g., "2025-10-17", "2025-10-17T14:30:00"),
 * it interprets them in the site's default timezone.
 * - For strings that ALREADY HAVE a timezone offset (e.g., "...Z", "...-07:00"),
 * it respects that offset.
 * @input string | number | Date
 * @returns Date locale date, with timezone and language support
 */
export function createLocalDate(dateInput: string | number | Date): Date {
  // Pass through Date objects and numbers (timestamps)
  if (dateInput instanceof Date) {
    return dateInput
  }
  if (typeof dateInput === "number") {
    return new Date(dateInput)
  }

  // Sanitize string input from potential YAML quotes
  let cleanDateString = dateInput.trim()
  if (
    (cleanDateString.startsWith("'") && cleanDateString.endsWith("'")) ||
    (cleanDateString.startsWith('"') && cleanDateString.endsWith('"'))
  ) {
    cleanDateString = cleanDateString.slice(1, -1)
  }

  // Regex to check if the string includes a timezone offset (Z, +HH:mm, -HHmm, etc.)
  const hasTimezoneRegex = /Z|[+-]\d{2}(?::?\d{2})?$/

  // If the string already has a timezone, let the native Date constructor handle it.
  // It correctly parses ISO 8601 strings with offsets.
  if (hasTimezoneRegex.test(cleanDateString)) {
    return new Date(cleanDateString)
  }

  // If no timezone is present, interpret the date using the site's configured timezone.
  // This correctly handles "YYYY-MM-DD" as midnight and "YYYY-MM-DDTHH:mm" as the specified time.
  const timeZone = SITE.locale.options.timeZone || "UTC"
  return fromZonedTime(cleanDateString, timeZone)
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Formats a date, automatically switching between relative and absolute formats.
 * Uses the site's locale configuration by default.
 *
 * @param date - Date to format (Date object, timestamp number, or ISO string)
 * @param locale - BCP 47 language tag (defaults to site locale)
 * @param options - Formatting options including relative date settings
 * @returns Formatted date string
 */
export function formatDate(
  date: string | number | Date,
  locale = SITE.locale.lang,
  options?: Intl.DateTimeFormatOptions & {
    relative?: boolean
    maxDaysThreshold?: number
  }
): string {
  const dateObj = createLocalDate(date)
  const useRelative = options?.relative ?? SITE.locale.relative.enabled

  if (useRelative) {
    const threshold = options?.maxDaysThreshold ?? SITE.locale.relative.maxDaysThreshold
    const diffInDays = Math.abs(differenceInCalendarDays(dateObj, new Date()))

    if (diffInDays <= threshold) {
      // Use intlFormatDistance, which leverages Intl.RelativeTimeFormat under the hood.
      // It correctly uses the locale string from SITE.locale without extra imports.
      return intlFormatDistance(dateObj, new Date(), { locale })
    }
  }

  // Use intlFormat for absolute dates. It's a clean wrapper around Intl.DateTimeFormat.
  const { relative: _relative, maxDaysThreshold: _maxDaysThreshold, ...intlOptions } = options || {}
  const finalOptions = { ...SITE.locale.options, ...intlOptions }
  return intlFormat(dateObj, finalOptions, { locale })
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
  return formatInTimeZone(dateObj, timeZone, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
}

// ============================================================================
// DATE RANGE UTILITIES
// ============================================================================

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
  /** Complete display range string (e.g., "Jan 2024 - Present") */
  displayRange: string
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
  options?: Intl.DateTimeFormatOptions & {
    relative?: boolean
    maxDaysThreshold?: number
  }
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
    toDateDisplay: toDate ? formatter(toDate) : undefined,
    displayRange: ""
  }

  if (fromDate && !toDate) {
    result.displayRange = `${result.fromDateDisplay} - Present`
  } else if (!fromDate && toDate) {
    result.displayRange = result.toDateDisplay!
  } else if (fromDate && toDate && fromDate.getTime() === toDate.getTime()) {
    result.displayRange = result.fromDateDisplay!
  } else if (fromDate && toDate) {
    const formattedFrom = result.fromDateDisplay!
    const formattedTo = result.toDateDisplay!
    result.displayRange =
      formattedFrom === formattedTo ? formattedFrom : `${formattedFrom} - ${formattedTo}`
  }

  return result
}
