/**
 * @fileoverview Main entry point for the redesigned post management system
 *
 * This file provides the main facade and factory functions for creating
 * a fully configured post management system. It follows the Facade pattern
 * to provide a simple interface to the complex underlying system.
 *
 * @author My (Chiffon) Nguyen, Claude Code
 * @version 2.0.0
 */

import type {
  Post,
  AuthorData,
  TagCount,
  PostMeta,
  PostNavigation,
  TOCSection,
  AuthorReference
} from './types'
import type { PostManager as PostManagerInterface, CachingStrategy } from './types'
import { AstroPostRepository, AstroAuthorRepository } from './repositories'
import { PostService, TagService, AuthorService } from './services'
import { WeakRefCache } from './cache'
import { PostUtils } from './utils'

/**
 * Main facade for the post management system.
 *
 * This class provides a simplified interface to all post management
 * functionality, coordinating between the various services and repositories.
 * It implements the Singleton pattern to ensure consistent state across
 * the application.
 *
 * @example
 * ```typescript
 * const manager = PostManager.getInstance()
 * const context = await manager.getPostContext('my-post')
 * const tags = await manager.getAllTags()
 * ```
 */
export class PostManager implements PostManagerInterface {
  private static instance: PostManager | null = null

  private readonly postService: PostService
  private readonly tagService: TagService
  private readonly authorService: AuthorService
  private readonly postUtils = new PostUtils()

  /**
   * Private constructor to enforce singleton pattern.
   *
   * Initializes all services with their dependencies and default caching strategies.
   */
  private constructor() {
    // Create repositories
    const postRepository = new AstroPostRepository()
    const authorRepository = new AstroAuthorRepository()

    // Create caches
    const metadataCache: CachingStrategy<PostMeta> = new WeakRefCache<PostMeta>()
    const authorPostsCache: CachingStrategy<Post[]> = new WeakRefCache<Post[]>()

    // Create services
    this.postService = new PostService(postRepository, authorRepository, metadataCache)
    this.tagService = new TagService(postRepository)
    this.authorService = new AuthorService(postRepository, authorRepository, authorPostsCache)
  }

  /**
   * Gets the singleton instance of the PostManager.
   *
   * Creates a new instance on first call, then returns the same instance
   * for all subsequent calls.
   *
   * @returns PostManager singleton instance
   */
  static getInstance(): PostManager {
    if (!PostManager.instance) {
      PostManager.instance = new PostManager()
    }
    return PostManager.instance
  }

  /**
   * Resets the singleton instance (mainly for testing).
   *
   * @internal
   */
  static resetInstance(): void {
    PostManager.instance = null
  }

  // ========================================
  // Core Post Operations
  // ========================================

  /**
   * Gets all posts including subposts.
   *
   * @returns Promise resolving to array of all posts and subposts
   */
  async getAllPostsAndSubposts(): Promise<Post[]> {
    return this.postService.getAllPostsAndSubposts()
  }

  /**
   * Gets a specific post by ID.
   *
   * @param postId - Post ID to retrieve
   * @returns Promise resolving to post or null if not found
   */
  async getPostById(postId: string): Promise<Post | null> {
    return this.postService.getPostById(postId)
  }

  /**
   * Gets main posts (excludes subposts).
   *
   * @param count Optional number of posts to return (returns all if not specified)
   * @returns Promise resolving to array of main posts
   */
  async getMainPosts(count?: number): Promise<Post[]> {
    return this.postService.getMainPosts(count)
  }

  /**
   * Gets subposts for a given parent post.
   *
   * @param parentId - Parent post ID to get subposts for
   * @returns Promise resolving to array of subposts
   */
  async getSubpostsByParent(parentId: string): Promise<Post[]> {
    return this.postService.getSubpostsByParent(parentId)
  }



  /**
   * Gets navigation information for a post.
   *
   * @param currentIdOrPost - Current post ID or object
   * @returns Promise resolving to navigation data
   */
  async getNavigation(currentIdOrPost: string | Post): Promise<PostNavigation> {
    return this.postService.getNavigation(currentIdOrPost)
  }

  /**
   * Gets computed metadata for a post.
   *
   * @param postId - Post ID
   * @returns Promise resolving to post metadata
   */
  async getMetadata(postId: string): Promise<PostMeta> {
    return this.postService.getMetadata(postId)
  }

  // ========================================
  // Tag Operations
  // ========================================

  /**
   * Gets all tags with their post counts.
   *
   * @returns Promise resolving to Map of tag -> count
   */
  async getAllTags(): Promise<Map<string, number>> {
    return this.tagService.getAllTags()
  }

  /**
   * Gets tags sorted by count (descending) then name (ascending).
   *
   * @returns Promise resolving to sorted tag count array
   */
  async getSortedTags(): Promise<TagCount[]> {
    return this.tagService.getSortedTags()
  }

  /**
   * Gets main posts that have a specific tag.
   *
   * @param tag - Tag to search for
   * @returns Promise resolving to posts with the tag
   */
  async getPostsByTag(tag: string): Promise<Post[]> {
    return this.tagService.getPostsByTag(tag)
  }

  // ========================================
  // Author Operations
  // ========================================

  /**
   * Gets all authors.
   *
   * @returns Promise resolving to array of all authors
   */
  async getAllAuthors(): Promise<AuthorData[]> {
    return this.authorService.getAllAuthors()
  }

  /**
   * Gets an author by their ID.
   *
   * @param authorId - Author ID
   * @returns Promise resolving to author data or null if not found
   */
  async getAuthorById(authorId: string): Promise<AuthorData | null> {
    return this.authorService.getAuthorById(authorId)
  }

  /**
   * Gets all posts by a specific author.
   *
   * @param authorId - Author ID
   * @returns Promise resolving to posts by the author
   */
  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    return this.authorService.getPostsByAuthor(authorId)
  }

  /**
   * Resolves author references to full author objects.
   *
   * @param authorRefs - Author reference objects to resolve
   * @returns Promise resolving to resolved authors
   */
  async resolveAuthors(authorRefs: AuthorReference[]): Promise<AuthorData[]> {
    return this.authorService.resolveAuthors(authorRefs)
  }

  // ========================================
  // TOC Operations
  // ========================================

  /**
   * Gets table of contents sections for a post.
   *
   * @param postId - Post ID
   * @returns Promise resolving to TOC sections
   */
  async getTOCSections(postId: string, tocMaxDepth: number): Promise<TOCSection[]> {
    return this.postService.getTOCSections(postId, this, tocMaxDepth)
  }

  /**
   * Gets headings for the current post only.
   *
   * @param postId - Post ID
   * @returns Promise resolving to markdown headings
   */
  async getCurrentPostHeadings(postId: string, tocMaxDepth: number): Promise<import('astro').MarkdownHeading[]> {
    return this.postService.getCurrentPostHeadings(postId, tocMaxDepth)
  }

  // ========================================
  // Utility Operations
  // ========================================

  /**
   * Determines if a post ID represents a subpost.
   *
   * @param postId - Post ID to check
   * @returns True if the post is a subpost
   */
  isSubpost(postId: string): boolean {
    return this.postUtils.isSubpost(postId)
  }

  /**
   * Extracts parent ID from a subpost ID.
   *
   * @param subpostId - Subpost ID
   * @returns Parent post ID
   */
  getParentId(subpostId: string): string {
    return this.postUtils.getParentId(subpostId)
  }

  // ========================================
  // Compatibility Methods (Legacy API)
  // ========================================

}

// ========================================
// Factory Functions
// ========================================

/**
 * Creates a new PostManager instance with custom configuration.
 *
 * This factory function allows for dependency injection and custom
 * cache configurations, useful for testing or specialized use cases.
 *
 * @param options - Configuration options
 * @returns Configured PostManager instance
 *
 * @example
 * ```typescript
 * import { NoOpCache } from './cache'
 *
 * const manager = createPostManager({
 *   metadataCache: new NoOpCache(),
 *   authorPostsCache: new NoOpCache()
 * })
 * ```
 */
export function createPostManager(_options?: {
  metadataCache?: CachingStrategy<PostMeta>
  authorPostsCache?: CachingStrategy<Post[]>
}): PostManager {
  // For now, return the singleton instance
  // In the future, this could create custom instances with the provided options
  return PostManager.getInstance()
}

// ========================================
// Exports
// ========================================

// Export the main interface
export default PostManager

// Export all types for advanced usage
export type * from './types'

// Export implementations for testing and advanced usage
export { AstroPostRepository, AstroAuthorRepository } from './repositories'
export { PostService, TagService, AuthorService } from './services'
export { WeakRefCache, MemoryCache, NoOpCache } from './cache'
export { PostUtils, calculateWordCountFromHtml, calculateWordCountFromPost } from './utils'
export { MainPostStrategy, SubpostStrategy, createStrategyForPost, STRATEGY_REGISTRY } from './strategies'

// Export TOC and scroll functionality
export { TOCManager, TOCUtilities, tocUtils } from './toc'
export {
  ScrollState,
  TOCScrollState,
  ScrollMask,
  ScrollToActive,
  HeadingRegions,
  TOCLinks,
  BaseScrollController,
  BaseTOCController
} from './scroll'
