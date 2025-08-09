/**
 * @fileoverview Strategy pattern implementations for content processing
 *
 * Contains different strategies for processing main posts vs subposts.
 * Each strategy handles the specific logic needed for its content type,
 * allowing for clean separation of concerns and easy extensibility.
 *
 * @author Post Management System
 * @version 2.0.0
 */

import type { Post, PostNavigation, PostMeta } from './types'
import type {
  ContentProcessingStrategy,
  NavigationContext,
  MetadataContext
} from './types'
import { PostUtils, calculateWordCountFromPost } from './utils'

/**
 * Strategy for processing main (top-level) posts.
 *
 * Main posts are standalone blog entries that may have subposts as children.
 * They participate in the main site navigation flow and can have aggregated
 * metadata that includes data from their subposts.
 *
 * Navigation for main posts moves between other main posts in chronological order.
 * Metadata includes word counts from both the main post and any subposts.
 *
 * @example
 * ```typescript
 * const strategy = new MainPostStrategy()
 * if (strategy.isApplicable('my-post')) {
 *   const navigation = await strategy.processNavigation('my-post', context)
 *   const metadata = await strategy.processMetadata(post, context)
 * }
 * ```
 */
export class MainPostStrategy implements ContentProcessingStrategy {
  /** Strategy type identifier */
  readonly type = 'main' as const

  /** Utility instance for post operations */
  private readonly postUtils = new PostUtils()

  /**
   * Determines if this strategy applies to the given post ID.
   *
   * Main posts are identified by NOT having a forward slash in their ID,
   * indicating they are not nested under another post.
   *
   * @param postId - Post ID to check
   * @returns True if this is a main post
   */
  isApplicable(postId: string): boolean {
    return !this.postUtils.isSubpost(postId)
  }

  /**
   * Processes navigation for a main post.
   *
   * Navigation moves between main posts based on publication date.
   * The "newer" post is the one published after the current post,
   * and "older" is the one published before.
   *
   * @param postId - ID of the current post
   * @param context - Navigation context containing all main posts
   * @returns Promise resolving to navigation information
   */
  async processNavigation(postId: string, context: NavigationContext): Promise<PostNavigation> {
    const { allMainPosts } = context
    const currentIndex = allMainPosts.findIndex((post) => post.id === postId)

    if (currentIndex === -1) {
      return { newer: null, older: null, parent: null }
    }

    return {
      // Posts are sorted newest first, so "newer" has a lower index
      newer: currentIndex > 0 ? allMainPosts[currentIndex - 1] : null,
      // "Older" posts have a higher index
      older: currentIndex < allMainPosts.length - 1 ? allMainPosts[currentIndex + 1] : null,
      // Main posts don't have parents
      parent: null
    }
  }

  /**
   * Processes metadata for a main post.
   *
   * Main post metadata includes:
   * - Individual word count for the main post
   * - Combined word count including all subposts
   * - Count of subposts
   * - Flag indicating if subposts exist
   * - Resolved author information
   *
   * @param post - The main post to process
   * @param context - Metadata context containing subposts and authors
   * @returns Promise resolving to complete post metadata
   */
  async processMetadata(post: Post, context: MetadataContext): Promise<PostMeta> {
    const { subposts = [], authors = [] } = context

    const wordCount = calculateWordCountFromPost(post)
    const subpostCount = subposts.length
    const hasSubposts = subpostCount > 0

    // Calculate combined word count if subposts exist
    let combinedWordCount: number | null = null
    if (hasSubposts) {
      const subpostWordCount = subposts.reduce((acc, subpost) =>
        acc + calculateWordCountFromPost(subpost), 0
      )
      combinedWordCount = wordCount + subpostWordCount
    }

    return {
      ...post.data,
      id: post.id,
      wordCount,
      combinedWordCount,
      subpostCount,
      hasSubposts,
      isSubpost: false,
      authors,
    }
  }
}

/**
 * Strategy for processing subposts.
 *
 * Subposts are nested under main posts and have different navigation
 * and metadata characteristics. They navigate between sibling subposts
 * within the same parent, and their metadata is simpler since they
 * cannot have their own subposts.
 *
 * Navigation for subposts moves between other subposts of the same parent.
 * Metadata is individual to the subpost and doesn't aggregate child data.
 *
 * @example
 * ```typescript
 * const strategy = new SubpostStrategy()
 * if (strategy.isApplicable('parent-post/subpost')) {
 *   const navigation = await strategy.processNavigation('parent-post/subpost', context)
 *   const metadata = await strategy.processMetadata(subpost, context)
 * }
 * ```
 */
export class SubpostStrategy implements ContentProcessingStrategy {
  /** Strategy type identifier */
  readonly type = 'subpost' as const

  /** Utility instance for post operations */
  private readonly postUtils = new PostUtils()

  /**
   * Determines if this strategy applies to the given post ID.
   *
   * Subposts are identified by having a forward slash in their ID,
   * indicating they are nested under a parent post.
   *
   * @param postId - Post ID to check
   * @returns True if this is a subpost
   */
  isApplicable(postId: string): boolean {
    return this.postUtils.isSubpost(postId)
  }

  /**
   * Processes navigation for a subpost.
   *
   * Navigation moves between sibling subposts within the same parent post.
   * The parent post reference is included for upward navigation.
   * Subposts are ordered by date and optional order field.
   *
   * @param postId - ID of the current subpost
   * @param context - Navigation context containing subposts and parent
   * @returns Promise resolving to navigation information
   */
  async processNavigation(postId: string, context: NavigationContext): Promise<PostNavigation> {
    const { subposts = [], parentPost = null } = context

    const currentIndex = subposts.findIndex((post) => post.id === postId)

    if (currentIndex === -1) {
      return { newer: null, older: null, parent: parentPost }
    }

    return {
      // For subposts, "newer" is the next in sequence (higher index)
      newer: currentIndex < subposts.length - 1 ? subposts[currentIndex + 1] : null,
      // "Older" is the previous in sequence (lower index)
      older: currentIndex > 0 ? subposts[currentIndex - 1] : null,
      // Include parent for upward navigation
      parent: parentPost
    }
  }

  /**
   * Processes metadata for a subpost.
   *
   * Subpost metadata is simpler than main posts since they cannot
   * have their own subposts. The metadata includes:
   * - Individual word count for the subpost
   * - No combined word count (always null)
   * - Zero subpost count
   * - No subposts flag (always false)
   * - Resolved author information
   *
   * @param post - The subpost to process
   * @param context - Metadata context containing authors
   * @returns Promise resolving to subpost metadata
   */
  async processMetadata(post: Post, context: MetadataContext): Promise<PostMeta> {
    const { authors = [] } = context

    const wordCount = calculateWordCountFromPost(post)

    return {
      ...post.data,
      id: post.id,
      wordCount,
      combinedWordCount: null, // Subposts don't aggregate
      subpostCount: 0,         // Subposts can't have subposts
      hasSubposts: false,      // Subposts can't have subposts
      isSubpost: true,         // This is a subpost
      authors,
    }
  }
}

/**
 * Factory function to create appropriate strategy for a post ID.
 *
 * Determines the correct strategy based on the post ID format and
 * returns an instance of the appropriate strategy class.
 *
 * @param postId - Post ID to create strategy for
 * @returns Appropriate strategy instance
 * @throws Error if no strategy matches the post ID
 *
 * @example
 * ```typescript
 * const strategy = createStrategyForPost('my-post') // Returns MainPostStrategy
 * const subStrategy = createStrategyForPost('parent/sub') // Returns SubpostStrategy
 * ```
 */
export function createStrategyForPost(postId: string): ContentProcessingStrategy {
  const postUtils = new PostUtils()

  if (postUtils.isSubpost(postId)) {
    return new SubpostStrategy()
  } else {
    return new MainPostStrategy()
  }
}

/**
 * Registry of all available content processing strategies.
 *
 * Maintains instances of all strategy implementations for reuse.
 * Useful for scenarios where you need to iterate over all strategies
 * or want to avoid creating new instances repeatedly.
 *
 * @example
 * ```typescript
 * const strategy = STRATEGY_REGISTRY.find(s => s.isApplicable(postId))
 * ```
 */
export const STRATEGY_REGISTRY: readonly ContentProcessingStrategy[] = [
  new MainPostStrategy(),
  new SubpostStrategy(),
] as const
