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

import type { Post } from './types'
import type { PostUtils as PostUtilsInterface } from './types'

/**
 * Calculates word count from HTML content by stripping tags and counting words.
 *
 * @param html - HTML content string (can be null or undefined)
 * @returns Word count as integer, 0 for empty/null content
 *
 * @example
 * ```typescript
 * const count = calculateWordCountFromHtml('<p>Hello <strong>world</strong></p>')
 * console.log(count) // 2
 * ```
 */
export function calculateWordCountFromHtml(html: string | null | undefined): number {
  if (!html) return 0

  // Strip HTML tags and count words
  const textOnly = html.replace(/<[^>]+>/g, '')
  return textOnly.split(/\s+/).filter(Boolean).length
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
 * Utility class implementing common post operations.
 *
 * This class contains pure functions that operate on post data without
 * requiring external dependencies. It implements the PostUtils interface
 * and can be easily tested and reused across the system.
 */
export class PostUtils implements PostUtilsInterface {
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
   * const utils = new PostUtils()
   * console.log(utils.isSubpost('parent-post/subpost')) // true
   * console.log(utils.isSubpost('main-post')) // false
   * ```
   */
  isSubpost(postId: string): boolean {
    return postId.includes('/')
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
   * const utils = new PostUtils()
   * const parentId = utils.getParentId('parent-post/my-subpost')
   * console.log(parentId) // 'parent-post'
   * ```
   */
  getParentId(subpostId: string): string {
    return subpostId.split('/')[0]
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
   * const utils = new PostUtils()
   * const sortedPosts = utils.sortByDateDesc(posts)
   * // Posts are now ordered newest to oldest
   * ```
   */
  sortByDateDesc<T extends { data: { createdAt: Date } }>(items: T[]): T[] {
    return [...items].sort((a, b) =>
      b.data.createdAt.valueOf() - a.data.createdAt.valueOf()
    )
  }

  /**
   * Calculates word count from HTML content.
   * Delegates to the standalone function for consistency.
   */
  calculateWordCountFromHtml(html: string | null | undefined): number {
    return calculateWordCountFromHtml(html)
  }

  /**
   * Calculates word count from a post object.
   * Delegates to the standalone function for consistency.
   */
  calculateWordCountFromPost(post: Post): number {
    return calculateWordCountFromPost(post)
  }
}
