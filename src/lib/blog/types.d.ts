/**
 * @fileoverview Core type definitions for the blog management system
 *
 * This module defines all the data types and interfaces used throughout
 * the blog system, including domain models and computed types.
 *
 * @author My (Chiffon) Nguyen, Claude Code
 * @version 2.0.0
 */

import type { MarkdownHeading } from 'astro'
import type { InferEntrySchema, CollectionEntry } from 'astro:content'

// ========================================
// Core Domain Types
// ========================================

/**
 * Blog post from Astro content collection
 */
export type Post = CollectionEntry<'blog'>

/**
 * Author from Astro content collection
 */
export type AuthorData = InferEntrySchema<'authors'>

/**
 * Author reference type as created by Astro's reference() function
 * in 'blog' collection
 */
export type AuthorReference = {
  collection: 'authors'
  id: string
}

/**
 * Tag with its associated post count
 */
export type TagCount = {
  tag: string
  count: number
}

// ========================================
// Navigation Types
// ========================================

/**
 * Navigation links between posts
 */
export interface PostNavigation {
  /** Next post in chronological order (newer) */
  newer: Post | null
  /** Previous post in chronological order (older) */
  older: Post | null
  /** Parent post (for subposts only) */
  parent: Post | null
}

// ========================================
// Metadata Types
// ========================================

/**
 * Post metadata with computed fields
 *
 * Extends the base post data with calculated information
 * like word counts and subpost relationships.
 */
export interface PostMeta extends Omit<InferEntrySchema<'blog'>, 'authors'> {
  /** id from Post object */
  id: string
  /** Word count for this post only */
  wordCount: number
  /** Combined word count including subposts (main posts only) */
  combinedWordCount: number | null
  /** Whether this post is a subpost */
  isSubpost: boolean
  /** Number of subposts (main posts only). Must be 0 if isSubpost is true. */
  subpostCount: number
  /** Whether this post has subposts. Must be false if isSubpost is true */
  hasSubposts: boolean
  /** Resolved author objects */
  authors: AuthorData[]
}

// ========================================
// Table of Contents Types
// ========================================

/**
 * A section in the table of contents
 *
 * Can represent either a parent post or a subpost section
 * with its associated headings.
 */
export interface TOCSection {
  /** Type of section */
  type: 'parent' | 'subpost'
  /** Display title for the section */
  title: string
  /** Markdown headings in this section */
  headings: MarkdownHeading[]
  /** Subpost ID (for subpost sections only) */
  subpostId?: string
}

// ========================================
// Scroll Management Types
// ========================================

/**
 * Scroll state for managing scroll-based UI interactions
 */
export interface ScrollElements {
  /** The scrollable area element */
  scrollArea: HTMLElement | null
  /** The container element with scroll masks */
  container: HTMLElement | null
}

/**
 * Heading region for TOC scroll tracking
 */
export interface HeadingRegion {
  /** Heading ID */
  id: string
  /** Start position in document */
  start: number
  /** End position in document */
  end: number
}

/**
 * Configuration for scroll mask classes
 */
export interface ScrollMaskConfig {
  /** CSS class for top fade mask */
  top: string
  /** CSS class for bottom fade mask */
  bottom: string
}

// ========================================
// Repository Layer Interfaces
// ========================================

/**
 * Repository pattern interface for post data access operations.
 *
 * Abstracts the data source (Astro collections) and provides a clean
 * contract for post retrieval operations.
 */
export interface PostRepository {
  getMainPosts(count?: number): Promise<Post[]>
  getAllPosts(): Promise<Post[]>
  getPostById(postId: string): Promise<Post | null>
  getSubpostsByParent(parentId: string): Promise<Post[]>
  getPostsByAuthor(authorId: string): Promise<Post[]>
  getPostsByTag(tag: string): Promise<Post[]>
}

/**
 * Repository pattern interface for author data access operations.
 */
export interface AuthorRepository {
  getAllAuthors(): Promise<AuthorData[]>
  getAuthorById(authorId: string): Promise<AuthorData | null>
  resolveAuthors(authorRefs: AuthorReference[]): Promise<AuthorData[]>
}

// ========================================
// Strategy Pattern Interfaces
// ========================================

/**
 * Context object passed to navigation processing strategies
 */
export interface NavigationContext {
  allMainPosts: Post[]
  subposts?: Post[]
  parentPost?: Post
}

/**
 * Context object passed to metadata processing strategies
 */
export interface MetadataContext {
  subposts?: Post[]
  authors?: AuthorData[]
}

/**
 * Strategy pattern interface for content processing operations.
 */
export interface ContentProcessingStrategy {
  readonly type: 'main' | 'subpost'
  isApplicable(postId: string): boolean
  processNavigation(postId: string, context: NavigationContext): Promise<PostNavigation>
  processMetadata(post: Post, context: MetadataContext): Promise<PostMeta>
}

// ========================================
// Cache Management Interfaces
// ========================================

/**
 * Strategy pattern interface for caching implementations.
 */
export interface CachingStrategy<T> {
  get(key: string): T | null
  set(key: string, value: T): void
  invalidate(key: string): void
  clear(): void
  size(): number
}

// ========================================
// Service Layer Interfaces
// ========================================


/**
 * Service interface for tag-related operations.
 */
export interface TagService {
  getAllTags(): Promise<Map<string, number>>
  getSortedTags(): Promise<TagCount[]>
  getPostsByTag(tag: string): Promise<Post[]>
}

/**
 * Service interface for author-related operations.
 */
export interface AuthorService {
  getAllAuthors(): Promise<AuthorData[]>
  getAuthorById(authorId: string): Promise<AuthorData | null>
  getPostsByAuthor(authorId: string): Promise<Post[]>
  resolveAuthors(authorRefs: AuthorReference[]): Promise<AuthorData[]>
}

// ========================================
// Utility Interfaces
// ========================================

/**
 * Utility interface for post-related helper functions.
 */
export interface PostUtils {
  isSubpost(postId: string): boolean
  getParentId(subpostId: string): string
  sortByDateDesc<T extends { data: { createdAt: Date } }>(items: T[]): T[]
  calculateWordCountFromHtml(html: string | null | undefined): number
  calculateWordCountFromPost(post: Post): number
}


/**
 * Main facade interface for the post management system.
 */
export interface PostManager {
  getPostById(postId: string): Promise<Post | null>
  getMainPosts(count?: number): Promise<Post[]>
  getAllPostsAndSubposts(): Promise<Post[]>
  getSubpostsByParent(parentId: string): Promise<Post[]>
  getMetadata(postId: string): Promise<PostMeta>
  getNavigation(currentIdOrPost: string | Post): Promise<PostNavigation>

  getAllTags(): Promise<Map<string, number>>
  getSortedTags(): Promise<TagCount[]>
  getPostsByTag(tag: string): Promise<Post[]>

  getAllAuthors(): Promise<AuthorData[]>
  getAuthorById(authorId: string): Promise<AuthorData | null>
  getPostsByAuthor(authorId: string): Promise<Post[]>
  resolveAuthors(authorRefs: AuthorReference[]): Promise<AuthorData[]>

  getTOCSections(postId: string, tocMaxDepth?: number): Promise<TOCSection[]>
  getCurrentPostHeadings(postId: string, tocMaxDepth?: number): Promise<import('astro').MarkdownHeading[]>
  isSubpost(postId: string): boolean
  getParentId(subpostId: string): string
}

// ========================================
// TOC Management Interfaces
// ========================================

/**
 * Interface for TOC section processing and generation.
 */
export interface TOCManager {
  getTOCSections(postId: string, postManager: any, tocMaxDepth?: number): Promise<TOCSection[]>
  clearCache(): void
}

/**
 * Interface for TOC utility functions.
 */
export interface TOCUtils {
  getHeadingMargin(depth: number): string
  getTOCUrl(options: {
    heading?: { slug: string }
    section?: { subpostId?: string }
    isSubpost?: boolean
    isActiveSection?: boolean
    parentId?: string
  }): string
  isFirstSubpostSection(sections: TOCSection[], index: number): boolean
}

// ========================================
// Scroll Management Interfaces
// ========================================

/**
 * Base interface for scroll controllers.
 */
export interface ScrollController {
  init(): void
  cleanup(): void
}

/**
 * Interface for scroll mask functionality (fade effects).
 */
export interface ScrollMask {
  update(maskClasses: { top: string; bottom: string }): void
}

/**
 * Interface for scroll-to-active functionality.
 */
export interface ScrollToActive {
  scroll(activeItemSelector: string): void
}
