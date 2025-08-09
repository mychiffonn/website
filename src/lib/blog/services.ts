/**
 * @fileoverview Service layer implementations for post management
 *
 * Contains business logic services that orchestrate repositories and strategies
 * to provide high-level operations. Services handle caching, coordination
 * between different data sources, and complex business rules.
 *
 * @author My (Chiffon) Nguyen, Claude Code
 * @version 2.0.0
 */

import { getCollection } from 'astro:content'
import type {
  Post,
  AuthorData,
  AuthorReference,
  TagCount,
  PostMeta,
  PostNavigation,
  TOCSection
} from './types'
import type {
  TagService as TagServiceInterface,
  AuthorService as AuthorServiceInterface,
  PostRepository,
  AuthorRepository,
  CachingStrategy,
  NavigationContext,
  MetadataContext
} from './types'
import { STRATEGY_REGISTRY } from './strategies'
import { PostUtils } from './utils'

/**
 * Core service for post-related operations.
 *
 * This service orchestrates repositories and strategies to provide
 * high-level post operations. It handles caching, strategy selection,
 * and coordination between different data sources.
 *
 * @example
 * ```typescript
 * const service = new PostService(postRepository, authorRepository)
 * const context = await service.getPostContext('my-post')
 * const navigation = await service.getNavigation('my-post')
 * ```
 */
export class PostService {
  private readonly postRepository: PostRepository
  private readonly authorRepository: AuthorRepository
  private readonly metadataCache: CachingStrategy<PostMeta>
  private readonly postUtils = new PostUtils()

  /**
   * Creates a new PostService instance.
   *
   * @param postRepository - Repository for post data access
   * @param authorRepository - Repository for author data access
   * @param metadataCache - Cache for post metadata (optional)
   */
  constructor(
    postRepository: PostRepository,
    authorRepository: AuthorRepository,
    metadataCache: CachingStrategy<PostMeta>
  ) {
    this.postRepository = postRepository
    this.authorRepository = authorRepository
    this.metadataCache = metadataCache
  }

  /**
   * Gets the appropriate processing strategy for a post ID.
   *
   * @param postId - Post ID to get strategy for
   * @returns Content processing strategy
   * @throws Error if no strategy is found
   */
  private getStrategy(postId: string) {
    const strategy = STRATEGY_REGISTRY.find(s => s.isApplicable(postId))
    if (!strategy) {
      throw new Error(`No strategy found for post: ${postId}`)
    }
    return strategy
  }

  /**
   * Gets navigation information for a post.
   *
   * Delegates to the appropriate strategy based on whether the post
   * is a main post or subpost. Each strategy handles navigation
   * according to its specific rules.
   *
   * @param currentIdOrPost - Current post ID or object
   * @returns Promise resolving to navigation data
   */
  async getNavigation(currentIdOrPost: string | Post): Promise<PostNavigation> {
    const currentId = typeof currentIdOrPost === 'string' ? currentIdOrPost : currentIdOrPost.id
    const strategy = this.getStrategy(currentId)

    if (strategy.type === 'subpost') {
      // Subpost navigation: move between siblings
      const parentId = this.postUtils.getParentId(currentId)
      const [parentPost, subposts] = await Promise.all([
        this.postRepository.getPostById(parentId),
        this.postRepository.getSubpostsByParent(parentId)
      ])

      const context: NavigationContext = {
        allMainPosts: [], // Not needed for subpost navigation
        subposts,
        parentPost: parentPost || undefined
      }

      return strategy.processNavigation(currentId, context)
    } else {
      // Main post navigation: move between main posts
      const allMainPosts = await this.postRepository.getMainPosts()
      const context: NavigationContext = { allMainPosts }
      return strategy.processNavigation(currentId, context)
    }
  }

  /**
   * Gets computed metadata for a post.
   *
   * Metadata includes word counts, subpost information, and resolved
   * author data. Results are cached for performance.
   *
   * @param postId - Post ID to get metadata for
   * @returns Promise resolving to post metadata
   * @throws Error if post is not found
   */
  async getMetadata(postId: string): Promise<PostMeta> {
    // Check cache first
    const cached = this.metadataCache.get(postId)
    if (cached) return cached

    // Get the post
    const post = await this.postRepository.getPostById(postId)
    if (!post) {
      throw new Error(`Post not found: ${postId}`)
    }

    // Get strategy and prepare context
    const strategy = this.getStrategy(postId)
    const context: MetadataContext = {}

    // For main posts, get subposts
    if (strategy.type === 'main') {
      context.subposts = await this.postRepository.getSubpostsByParent(postId)
    }

    // Resolve authors for all posts
    context.authors = await this.authorRepository.resolveAuthors(post.data.authors || [])

    // Process metadata with strategy
    const metadata = await strategy.processMetadata(post, context)

    // Cache the result
    this.metadataCache.set(postId, metadata)
    return metadata
  }


  /**
   * Gets table of contents sections for a post.
   *
   * Delegates to the TOC manager for generating hierarchical
   * table of contents that includes both main post and subpost headings.
   *
   * @param postId - Post ID to get TOC for
   * @returns Promise resolving to TOC sections
   */
  async getTOCSections(postId: string, postManager: any, tocMaxDepth: number): Promise<TOCSection[]> {
    // Import dynamically to avoid circular dependencies
    const { TOCManager } = await import('./toc')
    const tocManager = TOCManager.getInstance()
    return tocManager.getTOCSections(postId, postManager, tocMaxDepth)
  }

  // Methods for TOC manager compatibility
  async getPostById(postId: string) {
    return this.postRepository.getPostById(postId)
  }

  isSubpost(postId: string): boolean {
    return this.postUtils.isSubpost(postId)
  }

  getParentId(subpostId: string): string {
    return this.postUtils.getParentId(subpostId)
  }

  async getSubpostsByParent(parentId: string) {
    return this.postRepository.getSubpostsByParent(parentId)
  }

  async getMainPosts(count?: number): Promise<Post[]> {
    return this.postRepository.getMainPosts(count)
  }


  /**
   * Gets all posts including subposts.
   *
   * @returns Promise resolving to array of all posts and subposts
   */
  async getAllPostsAndSubposts(): Promise<Post[]> {
    return this.postRepository.getAllPosts()
  }

  /**
   * Gets posts by author ID.
   *
   * @param authorId - Author ID to get posts for
   * @returns Promise resolving to array of posts by author
   */
  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    return this.postRepository.getPostsByAuthor(authorId)
  }

  /**
   * Gets posts by tag.
   *
   * @param tag - Tag to get posts for
   * @returns Promise resolving to array of posts with tag
   */
  async getPostsByTag(tag: string): Promise<Post[]> {
    return this.postRepository.getPostsByTag(tag)
  }

  /**
   * Gets headings for the current post only.
   *
   * Returns markdown headings from just the current post,
   * not including parent or subpost headings.
   *
   * @param postId - Post ID to get headings for
   * @returns Promise resolving to markdown headings
   */
  async getCurrentPostHeadings(postId: string, maxHeadingDepth: number = 6): Promise<import('astro').MarkdownHeading[]> {
    const post = await this.postRepository.getPostById(postId)
    if (!post) return []

    try {
      const { render } = await import('astro:content')
      const { headings } = await render(post)
      return headings.filter(heading => heading.depth <= maxHeadingDepth)
    } catch (error) {
      console.warn(`Failed to render headings for post ${postId}:`, error)
      return []
    }
  }

}

/**
 * Service for tag-related operations.
 *
 * Handles tag counting, filtering, and the special logic for
 * tags that come from subposts vs main posts.
 *
 * @example
 * ```typescript
 * const service = new TagService(postRepository)
 * const tags = await service.getAllTags()
 * const posts = await service.getPostsByTag('javascript')
 * ```
 */
export class TagService implements TagServiceInterface {
  private readonly postRepository: PostRepository
  private readonly postUtils = new PostUtils()
  private tagCountsCache: Map<string, number> | null = null

  /**
   * Creates a new TagService instance.
   *
   * @param postRepository - Repository for post data access
   */
  constructor(postRepository: PostRepository) {
    this.postRepository = postRepository
  }

  /**
   * Initializes the tag cache by counting tag occurrences.
   *
   * For subpost tags, the parent post is counted instead of the subpost,
   * ensuring that tag counts represent the number of main posts.
   */
  private async initializeTagCache(): Promise<void> {
    if (this.tagCountsCache !== null) return

    const [mainPosts, allSubposts] = await Promise.all([
      this.postRepository.getMainPosts(),
      getCollection('blog', (post) => this.postUtils.isSubpost(post.id) && !post.data.draft)
    ])

    const tagCounts = new Map<string, Set<string>>()

    // Count tags from main posts
    mainPosts.forEach(post => {
      post.data.tags?.forEach(tag => {
        if (!tagCounts.has(tag)) tagCounts.set(tag, new Set())
        tagCounts.get(tag)!.add(post.id)
      })
    })

    // For subpost tags, count their parent posts instead
    allSubposts.forEach(subpost => {
      const parentId = this.postUtils.getParentId(subpost.id)
      subpost.data.tags?.forEach(tag => {
        if (!tagCounts.has(tag)) tagCounts.set(tag, new Set())
        tagCounts.get(tag)!.add(parentId)
      })
    })

    // Convert Set sizes to counts
    this.tagCountsCache = new Map(
      Array.from(tagCounts.entries()).map(([tag, postIds]) => [tag, postIds.size])
    )
  }

  /**
   * Gets all tags with their post counts.
   *
   * Returns a map where keys are tag names and values are the number
   * of main posts that contain that tag (directly or via subposts).
   *
   * @returns Promise resolving to Map of tag -> count
   */
  async getAllTags(): Promise<Map<string, number>> {
    await this.initializeTagCache()
    return new Map(this.tagCountsCache!)
  }

  /**
   * Gets tags sorted by count (descending) then name (ascending).
   *
   * @returns Promise resolving to sorted tag count array
   */
  async getSortedTags(): Promise<TagCount[]> {
    const tagCounts = await this.getAllTags()
    return [...tagCounts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => {
        const countDiff = b.count - a.count
        return countDiff !== 0 ? countDiff : a.tag.localeCompare(b.tag)
      })
  }

  /**
   * Gets main posts that contain a specific tag.
   *
   * Delegates to the repository which handles the complex logic
   * of including posts whose subposts contain the tag.
   *
   * @param tag - Tag to search for
   * @returns Promise resolving to posts with the tag
   */
  async getPostsByTag(tag: string): Promise<Post[]> {
    return this.postRepository.getPostsByTag(tag)
  }
}

/**
 * Service for author-related operations.
 *
 * Handles author data retrieval and caching of author-post relationships.
 *
 * @example
 * ```typescript
 * const service = new AuthorService(postRepository, authorRepository)
 * const author = await service.getAuthorById('john-doe')
 * const posts = await service.getPostsByAuthor('john-doe')
 * ```
 */
export class AuthorService implements AuthorServiceInterface {
  private readonly postRepository: PostRepository
  private readonly authorRepository: AuthorRepository
  private readonly authorPostsCache: CachingStrategy<Post[]>

  /**
   * Creates a new AuthorService instance.
   *
   * @param postRepository - Repository for post data access
   * @param authorRepository - Repository for author data access
   * @param authorPostsCache - Cache for author-post relationships (optional)
   */
  constructor(
    postRepository: PostRepository,
    authorRepository: AuthorRepository,
    authorPostsCache: CachingStrategy<Post[]>
  ) {
    this.postRepository = postRepository
    this.authorRepository = authorRepository
    this.authorPostsCache = authorPostsCache
  }

  /**
   * Gets all authors from the repository.
   *
   * @returns Promise resolving to array of all authors
   */
  async getAllAuthors(): Promise<AuthorData[]> {
    return this.authorRepository.getAllAuthors()
  }

  /**
   * Gets an author by their ID.
   *
   * @param authorId - Author ID to retrieve
   * @returns Promise resolving to author or null if not found
   */
  async getAuthorById(authorId: string): Promise<AuthorData | null> {
    return this.authorRepository.getAuthorById(authorId)
  }

  /**
   * Gets all posts by a specific author.
   *
   * Results are cached for performance since author-post relationships
   * don't change frequently.
   *
   * @param authorId - Author ID to get posts for
   * @returns Promise resolving to posts by the author
   */
  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    // Check cache first
    const cached = this.authorPostsCache.get(authorId)
    if (cached) return cached

    // Get posts from repository
    const posts = await this.postRepository.getPostsByAuthor(authorId)

    // Cache the result
    this.authorPostsCache.set(authorId, posts)
    return posts
  }

  /**
   * Resolves author references to full author objects.
   *
   * @param authorRefs - Author reference objects to resolve
   * @returns Promise resolving to resolved author data
   */
  async resolveAuthors(authorRefs: AuthorReference[]): Promise<AuthorData[]> {
    return this.authorRepository.resolveAuthors(authorRefs)
  }
}
