import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { SITE } from '@/config'

// ========================================
// UI Utilities
// ========================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ========================================
// Date Utilities
// ========================================

/**
 * Format a date with optional locale and format options
 */
export function formatDate(
  date: string | number | Date,
  locale: string = SITE.locale.dateLocale,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(locale, {
    ...SITE.locale.dateOptions,
    ...options
  }).format(new Date(date))
}

/**
 * Create a date range string for projects/experiences
 */
export function createDateRange(
  fromDate?: Date,
  toDate?: Date,
  options?: Intl.DateTimeFormatOptions
): string | null {
  if (!fromDate && !toDate) return null

  const formatter = (date: Date) => formatDate(date, SITE.locale.dateLocale, {
    ...SITE.locale.dateOptions,
    day: undefined,
    ...options
  })

  if (fromDate && !toDate) return `${formatter(fromDate)} - Present`
  if (!fromDate && toDate) return formatter(toDate)
  if (fromDate && toDate && fromDate === toDate) {
    return formatter(fromDate)
  }
  if (fromDate && toDate) {
    const formattedFrom = formatter(fromDate)
    const formattedTo = formatter(toDate)
    return formattedFrom === formattedTo ? formattedFrom : `${formattedFrom} - ${formattedTo}`
  }
  return null
}
