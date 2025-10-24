/**
 * String manipulation utility functions
 */

/**
 * Converts a string to a URL-friendly slug
 * @param text String to convert to slug
 * @returns Lowercase slug with spaces replaced by dashes
 */
export const slugify = (text: string): string => {
  return text
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/[^\w-]+/g, "") // Remove non-word characters except dashes
    .replace(/--+/g, "-") // Replace multiple dashes with single dash
    .replace(/^-+/, "") // Remove leading dashes
    .replace(/-+$/, "") // Remove trailing dashes
}

/**
 * Deduplicates an array of strings by converting to lowercase first
 * @param arr Array of strings to deduplicate
 * @returns Array with duplicates removed (case-insensitive)
 */
export const dedupLowerCase = (arr: string[]) => [...new Set(arr.map((s) => s.toLowerCase()))]

/**
 * Deduplicates an array of strings while preserving the case of the first occurrence
 * @param arr Array of strings to deduplicate
 * @returns Array with duplicates removed, preserving case of first occurrence
 */
export const dedupPreserveCase = (arr: string[]) => {
  const seen = new Set<string>()
  const result: string[] = []

  for (const item of arr) {
    const lowerCase = item.toLowerCase()
    if (!seen.has(lowerCase)) {
      seen.add(lowerCase)
      result.push(item)
    }
  }

  return result
}
