/**
 * @fileoverview Repository implementations for post and author data access
 *
 * Implements the Repository pattern to abstract data access from Astro content
 * collections. These repositories provide a clean interface for data operations
 * and can be easily mocked for testing.
 *
 * @author My (Chiffon) Nguyen, Claude Code
 * @version 2.0.0
 */

import { getCollection, getEntry } from 'astro:content'
import type { Post, AuthorData, AuthorReference } from './types'
import type { PostRepository, AuthorRepository } from './types'
import { PostUtils } from './utils'

/**
 * Implementation of the post repository using Astro functions
 *
 * This repository handles all data access operations for blog posts,
 * abstracting the Astro content collection API behind a clean interface.
 * It includes logic for handling the subpost system and proper sorting.
 *
 * @example
 * ```typescript
 * const repository = new AstroPostRepository()
 * const posts = await repository.getMainPosts()
 * const post = await repository.getPostById('my-post')
 * ```
 */
export class AstroPostRepository implements PostRepository {
  /** Utility instance for post operations */
  private readonly postUtils = new PostUtils()

  /**
   * Retrieves published main posts, excluding subposts.
   *
   * Filters out drafts and subposts, returning only top-level posts
   * sorted by publication date in descending order.
   *
   * @param count Optional number of posts to return (returns all if not specified)
   * @returns Promise resolving to array of main posts
   */
  async getMainPosts(count?: number): Promise<Post[]> {
    const posts = await getCollection('blog', post =>
      !post.data.draft && !this.postUtils.isSubpost(post.id))

    const sortedPosts = this.postUtils.sortByDateDesc(posts)
    return count ? sortedPosts.slice(0, count) : sortedPosts
  }

  /**
   * Retrieves all published posts including both main posts and subposts.
   *
   * @returns Promise resolving to array of all published posts
   */
  async getAllPosts(): Promise<Post[]> {
    return await getCollection('blog', (post) => !post.data.draft)
  }

  /**
   * Retrieves a specific post by its ID.
   *
   * Returns null for drafts or non-existent posts. Handles any errors
   * gracefully by returning null rather than throwing.
   *
   * @param postId - Unique identifier for the post
   * @returns Promise resolving to the post or null if not found
   */
  async getPostById(postId: string): Promise<Post | null> {
    try {
      const post = await getEntry('blog', postId)
      return post && !post.data.draft ? post : null
    } catch (error) {
      // Log the error for debugging but don't throw
      console.warn(`Failed to retrieve post ${postId}:`, error)
      return null
    }
  }

  /**
   * Retrieves all subposts belonging to a specific parent post.
   *
   * Subposts are sorted first by publication date, then by their
   * optional order field for manual ordering within the same date.
   *
   * @param parentId - ID of the parent post
   * @returns Promise resolving to sorted array of subposts
   */
  async getSubpostsByParent(parentId: string): Promise<Post[]> {
    const subposts = await getCollection('blog', (post) => {
      return !post.data.draft &&
        this.postUtils.isSubpost(post.id) &&
        this.postUtils.getParentId(post.id) === parentId
    })

    // Sort by date first, then by optional order field
    return subposts.sort((a, b) => {
      // Primary sort: by publication date (ascending for subposts)
      const dateDiff = a.data.createdAt.valueOf() - b.data.createdAt.valueOf()
      if (dateDiff !== 0) return dateDiff

      // Secondary sort: by order field (ascending)
      const orderA = a.data.order ?? 0
      const orderB = b.data.order ?? 0
      return orderA - orderB
    })
  }

  /**
   * Retrieves all main posts authored by a specific author.
   *
   * Searches through post author arrays and returns posts where the
   * specified author ID is found. Excludes subposts from results.
   *
   * @param authorId - ID of the author to search for
   * @returns Promise resolving to posts by the author
   */
  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    const posts = await getCollection('blog', (post) => {
      return !post.data.draft &&
        !this.postUtils.isSubpost(post.id) &&
        post.data.authors?.some(authorRef => authorRef.id === authorId)
    })

    return this.postUtils.sortByDateDesc(posts)
  }

  /**
   * Retrieves all main posts that contain a specific tag.
   *
   * This method handles both direct tags on main posts and inherited
   * tags from subposts. When a subpost has a tag, its parent post
   * is included in the results for that tag.
   *
   * @param tag - Tag to search for
   * @returns Promise resolving to unique posts with the tag
   */
  async getPostsByTag(tag: string): Promise<Post[]> {
    // Get main posts that directly have this tag
    const mainPostsWithTag = await getCollection('blog', (post) => {
      return !post.data.draft &&
        !this.postUtils.isSubpost(post.id) &&
        post.data.tags?.includes(tag)
    })

    // Get subposts that have this tag
    const subpostsWithTag = await getCollection('blog', (post) => {
      return !post.data.draft &&
        this.postUtils.isSubpost(post.id) &&
        post.data.tags?.includes(tag)
    })

    // Get parent posts for tagged subposts
    const parentIds = [...new Set(
      subpostsWithTag.map(subpost => this.postUtils.getParentId(subpost.id))
    )]

    const parentPosts = await Promise.all(
      parentIds.map(parentId => this.getPostById(parentId))
    )

    // Filter out any null results from parent post lookups
    const validParents = parentPosts.filter(
      (post): post is NonNullable<typeof post> => post !== null
    )

    // Combine and deduplicate posts
    const allPosts = [...mainPostsWithTag, ...validParents]
    const uniquePosts = allPosts.filter((post, index, arr) =>
      arr.findIndex(p => p.id === post.id) === index
    )

    return this.postUtils.sortByDateDesc(uniquePosts)
  }
}

/**
 * Astro-based implementation of the author repository.
 *
 * Handles all data access operations for author information,
 * including resolving author references from posts to full author objects.
 *
 * @example
 * ```typescript
 * const repository = new AstroAuthorRepository()
 * const author = await repository.getAuthorById('john-doe')
 * const authors = await repository.resolveAuthors(post.data.authors)
 * ```
 */
export class AstroAuthorRepository implements AuthorRepository {
  /**
   * Retrieves an author by their unique ID.
   *
   * Returns null for non-existent authors and handles errors gracefully.
   *
   * @param authorId - Unique identifier for the author
   * @returns Promise resolving to the author or null if not found
   */
  async getAuthorById(authorId: string): Promise<AuthorData | null> {
    try {
      const author = await getEntry('authors', authorId)
      return author?.data || null
    } catch (error) {
      console.warn(`Failed to retrieve author ${authorId}:`, error)
      return null
    }
  }

  /**
   * Retrieves all authors from the authors collection.
   *
   * Returns all available authors, handling any errors gracefully
   * by filtering out failed retrievals.
   *
   * @returns Promise resolving to array of all authors
   */
  async getAllAuthors(): Promise<AuthorData[]> {
    try {
      const authors = await getCollection('authors')
      return authors.map(author => author.data)
    } catch (error) {
      console.warn('Failed to retrieve all authors:', error)
      return []
    }
  }

  /**
   * Resolves an array of author references to full author objects.
   *
   * Takes author reference objects (typically from post frontmatter)
   * and resolves them to complete author data. Filters out any
   * references that fail to resolve.
   *
   * @param authorRefs - Array of author reference objects
   * @returns Promise resolving to array of resolved author objects
   *
   * @example
   * ```typescript
   * const authorRefs = post.data.authors // [{ collection: 'authors', id: 'john-doe' }]
   * const authors = await repository.resolveAuthors(authorRefs)
   * ```
   */
  async resolveAuthors(authorRefs: AuthorReference[]): Promise<AuthorData[]> {
    if (!authorRefs || authorRefs.length === 0) {
      return []
    }

    const resolvedAuthors = await Promise.all(
      authorRefs.map(async (authorRef) => {
        try {
          const author = await getEntry(authorRef)
          return author?.data || null
        } catch (error) {
          console.warn(`Failed to resolve author reference:`, authorRef, error)
          return null
        }
      })
    )

    // Filter out null results from failed resolutions
    return resolvedAuthors.filter(
      (author): author is NonNullable<typeof author> => author !== null
    )
  }
}
