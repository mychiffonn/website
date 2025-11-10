/**
 * @fileoverview Utility functions and classes for post management
 *
 * Contains pure functions and utility classes that don't depend on external
 * data sources. These utilities follow functional programming principles
 * where possible and provide reusable post-related operations.
 *
 * @author My (Chiffon) Nguyen, Claude Code
 * @version 2.0.0
 */

import { SITE } from "@site-config"

import type { Post } from "./types"

/**
 * Calculates word count from HTML content, excluding code blocks and math expressions.
 * Uses modern Intl.Segmenter for accurate Unicode support with fallback for older environments.
 *
 * @param html - HTML content string (can be null or undefined)
 * @returns Word count as integer, 0 for empty/null content
 *
 * @example
 * ```typescript
 * const count = calculateWordCountFromHtml('<p>Hello <strong>world</strong> <code>code</code></p>')
 * console.log(count) // 2 (excludes code)
 *
 * const multiScript = calculateWordCountFromHtml('<p>Hello 你好 мир שלום</p>')
 * console.log(multiScript) // Works with all Unicode scripts
 * ```
 */
export function calculateWordCountFromHtml(html: string | null | undefined): number {
  if (!html) return 0

  // Remove code blocks and math expressions first
  let content = html
    .replace(/<pre[^>]*>.*?<\/pre>/gs, "") // code blocks
    .replace(/<code[^>]*>.*?<\/code>/g, "") // inline code
    .replace(/\$\$.*?\$\$/g, "") // display math
    .replace(/\$.*?\$/g, "") // inline math
    .replace(/<[^>]+>/g, "") // HTML tags

  // Try modern Intl.Segmenter first (supports all Unicode scripts)
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const segmenter = new Intl.Segmenter(SITE.locale.lang, { granularity: "word" })
      const segments = Array.from(segmenter.segment(content))
      return segments.filter((segment) => segment.isWordLike).length
    } catch {
      // Fall through to fallback if Segmenter fails
    }
  }

  // Fallback: Handle most common scripts manually
  const latinWords = content.match(/[a-zA-Z]+/g)?.length || 0
  const cjkChars =
    content.match(/[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff]/g)?.length || 0
  const arabicWords = content.match(/[\u0600-\u06ff]+/g)?.length || 0
  const cyrillicWords = content.match(/[\u0400-\u04ff]+/g)?.length || 0
  const hebrewWords = content.match(/[\u0590-\u05ff]+/g)?.length || 0

  return latinWords + cjkChars + arabicWords + cyrillicWords + hebrewWords
}

/**
 * Calculates word count from a post object using its rendered HTML or raw body.
 *
 * @param post - Post object containing content
 * @returns Word count as integer
 *
 * @example
 * ```typescript
 * const post = await getPostById('my-post')
 * const count = calculateWordCountFromPost(post)
 * ```
 */
export function calculateWordCountFromPost(post: Post): number {
  const content = post.rendered?.html || post.body
  return calculateWordCountFromHtml(content)
}

/**
 * Determines if a post ID represents a subpost.
 *
 * Subposts are identified by having a forward slash in their ID,
 * indicating they belong to a parent post directory.
 *
 * @param postId - Post ID to check
 * @returns True if the post is a subpost
 *
 * @example
 * ```typescript
 * console.log(isSubpost('parent-post/subpost')) // true
 * console.log(isSubpost('main-post')) // false
 * ```
 */
export function isSubpost(postId: string): boolean {
  return postId.includes("/")
}

/**
 * Extracts the parent post ID from a subpost ID.
 *
 * Takes the first part before the first forward slash as the parent ID.
 *
 * @param subpostId - Subpost ID in format "parent/subpost"
 * @returns Parent post ID
 *
 * @example
 * ```typescript
 * const parentId = getParentId('parent-post/my-subpost')
 * console.log(parentId) // 'parent-post'
 * ```
 */
export function getParentId(subpostId: string): string {
  return subpostId.split("/")[0]
}

/**
 * Sorts an array of posts by publication date in descending order (newest first).
 *
 * Uses the createdAt field from the post's data object and sorts by
 * numeric timestamp value for consistent ordering.
 *
 * @param items - Array of objects with createdAt in their data
 * @returns New sorted array (does not mutate original)
 *
 * @example
 * ```typescript
 * const sortedPosts = sortByDateDesc(posts)
 * // Posts are now ordered newest to oldest
 * ```
 */
export function sortByDateDesc<T extends { data: { createdAt: Date } }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.data.createdAt.valueOf() - a.data.createdAt.valueOf())
}

// ============================================================================
// Display Formatting Utils
// ============================================================================

/**
 * Format subpost count display text
 * Handles singular/plural formatting consistently
 */
export function formatSubpostCount(count: number): string {
  return `${count} subpost${count === 1 ? "" : "s"}`
}

/**
 * Generate navigation href for posts
 * Centralizes URL generation logic
 */
export function generatePostHref(postId: string, baseUrl: string): string {
  return `${baseUrl}/${postId}`
}

/**
 * Determine icon name based on post state
 * Eliminates inline icon selection logic in components
 */
export function getPostIconName(
  isActive: boolean,
  isSubpost: boolean
): "post-active" | "subpost" | "parent-post" {
  if (isActive) return "post-active"
  return isSubpost ? "subpost" : "parent-post"
}
