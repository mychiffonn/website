import { getCollection, render, type CollectionEntry } from 'astro:content'

// ========================================
// Content Processing Utilities
// ========================================

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
