import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { SITE } from '@/config'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const dateFormat = new Intl.DateTimeFormat(SITE.locale.dateLocale, {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
})

export function formatDate(date: Date) {
  return Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function getFormattedDate(
  date: string | number | Date,
  options?: Intl.DateTimeFormatOptions
) {
  if (typeof options !== 'undefined') {
    return new Date(date).toLocaleDateString(SITE.locale.dateLocale, {
      month: 'short',
      day: 'numeric', 
      year: 'numeric',
      ...options
    })
  }

  return dateFormat.format(new Date(date))
}

export function createDateRange(
  fromDate?: Date,
  toDate?: Date,
  options?: Intl.DateTimeFormatOptions
) {
  if (!fromDate && !toDate) return null

  const formatter = (date: Date) => getFormattedDate(date, { day: undefined, ...options })

  if (fromDate && !toDate) return `${formatter(fromDate)} - Present`
  if (!fromDate && toDate) return formatter(toDate)
  if (fromDate && toDate && fromDate === toDate) {
    return formatter(fromDate)
  }
  if (fromDate && toDate && fromDate != toDate) {
    const formattedFrom = formatter(fromDate)
    const formattedTo = formatter(toDate)
    return formattedFrom === formattedTo ? formattedFrom : `${formattedFrom} - ${formattedTo}`
  }
  return null
}

export function calculateWordCountFromHtml(
  html: string | null | undefined,
): number {
  if (!html) return 0
  const textOnly = html.replace(/<[^>]+>/g, '')
  return textOnly.split(/\s+/).filter(Boolean).length
}

export function readingTime(wordCount: number): string {
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 220))
  return `${readingTimeMinutes} min read`
}

export function getHeadingMargin(depth: number): string {
  const margins: Record<number, string> = {
    3: 'ml-4',
    4: 'ml-8',
    5: 'ml-12',
    6: 'ml-16',
  }
  return margins[depth] || ''
}
