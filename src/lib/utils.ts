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
 * Format a date as a relative time string (e.g., "3 days ago", "2 months ago")
 */
function formatRelativeTime(date: Date, locale: string = SITE.locale.dateLocale): string {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffInDays) < 7) {
    return rtf.format(diffInDays, 'day');
  } else if (Math.abs(diffInDays) < 30) {
    return rtf.format(Math.floor(diffInDays / 7), 'week');
  } else if (Math.abs(diffInDays) < 365) {
    return rtf.format(Math.floor(diffInDays / 30), 'month');
  } else {
    return rtf.format(Math.floor(diffInDays / 365), 'year');
  }
}

export function formatDate(
  date: string | number | Date,
  locale: string = SITE.locale.dateLocale,
  options?: Intl.DateTimeFormatOptions & {
    relative?: boolean;
    maxDaysThreshold?: number;
  }
): string {
  const dateObj = new Date(date);

  // Check if relative formatting is requested (either via options or global config)
  const useRelative = options?.relative ?? SITE.locale.relative.enabled;

  if (useRelative) {
    const threshold = options?.maxDaysThreshold ?? SITE.locale.relative.maxDaysThreshold;
    const now = new Date();
    const diffInDays = Math.abs(Math.floor((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    // If within threshold, use relative format
    if (diffInDays <= threshold) {
      return formatRelativeTime(dateObj, locale);
    }
  }

  // Remove custom options before passing to Intl.DateTimeFormat
  const { relative, maxDaysThreshold, ...intlOptions } = options || {};

  return new Intl.DateTimeFormat(locale, {
    ...SITE.locale.dateOptions,
    ...intlOptions
  }).format(dateObj);
}

/**
 * Create a date range string for projects/experiences
 */
export function createDateRange(
  fromDate?: Date,
  toDate?: Date,
  options?: Intl.DateTimeFormatOptions & {
    relative?: boolean;
    maxDaysThreshold?: number;
  }
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
