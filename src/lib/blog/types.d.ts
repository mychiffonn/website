/**
 * @fileoverview Core type definitions for the blog management system
 *
 * This module defines all the data types and interfaces used throughout
 * the blog system, including domain models and computed types.
 *
 * @author My (Chiffon) Nguyen, Claude Code
 * @version 2.0.0
 */

import type { MarkdownHeading } from "astro"
import type { CollectionEntry, InferEntrySchema } from "astro:content"

// ========================================
// Core Domain Types
// ========================================

/**
 * Blog post from Astro content collection
 */
export type Post = CollectionEntry<"blog">

/**
 * Author from Astro content collection
 */
export type AuthorData = InferEntrySchema<"people">

/**
 * Author reference type as created by Astro's reference() function
 * in 'blog' collection
 */
export type AuthorReference = {
  collection: "people"
  id: string
}

// ========================================
// Post-related Interfaces
// ========================================

/**
 * Post metadata with computed fields
 *
 * Extends the base post data with calculated information
 * like word counts and subpost relationships.
 *
 * @see PostManager.getMetadata()
 */
export interface PostMeta extends Omit<InferEntrySchema<"blog">, "authors"> {
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

/**
 * Navigation links between posts
 *
 * @see PostManager.getNavigation()
 */
export interface PostNavigation {
  /** Next post in chronological order (newer) */
  newer: Post | null
  /** Previous post in chronological order (older) */
  older: Post | null
  /** Parent post (for subposts only) */
  parent: Post | null
}

/**
 * Combined post and metadata for list displays.
 *
 */
export interface PostWithMetadata {
  post: Post
  metadata: PostMeta
}

/**
 * Navigation item for Subposts* components
 */
export interface PostNavItem {
  id: string
  title: string
  isActive: boolean
  isSubpost: boolean
  wordCount: number
  combinedWordCount?: number
  subpostCount?: number
  href: string
}

/**
 * Complete context data for rendering an individual post page.
 *
 * Optimized with derived information computed internally to minimize component logic.
 */
export interface PostContext {
  /** Core post metadata with resolved authors */
  metadata: PostMeta
  /** Navigation to previous/next/parent posts */
  navigation: PostNavigation
  /** TOC sections (includes current post + subposts with postIds, titles, and headings) */
  tocSections: TOCSection[]
  /** Current post headings (derived from tocSections) */
  headings: TOCHeadingItem[]
  /** List of subpost IDs (derived from tocSections) */
  subpostIds: string[]
  /** Parent post info (derived from navigation/tocSections) */
  parentPost: { id: string; title: string } | null
  /** Whether current post is a subpost (derived) */
  isSubpost: boolean
  /** Whether current post has subposts (derived) */
  hasSubposts: boolean
  /** Navigation items for subpost components (pre-computed) */
  postNavItems: PostNavItem[]
  /** Active post navigation item (pre-computed) */
  activePostNavItem: PostNavItem | null
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
  /** Post/subpost id, to construct href */
  postId: string
  /** Title of the post */
  postTitle: string
  /** Section type: parent or subpost */
  isSubpost: boolean
  /** Markdown headings in this section */
  headings: TOCHeadingItem[]
}

/**
 * TOC heading item for components
 * MarkdownHeading has fields depth, slug, text already
 */
export interface TOCHeadingItem extends MarkdownHeading {
  href: string
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
 * Interface for TOC section processing and generation.
 */
export interface TOCManager {
  getTOCSections(
    postId: string,
    postManager: PostManager,
    tocMaxDepth?: number
  ): Promise<TOCSection[]>
}

// ========================================
// Service Interfaces
// ========================================

/**
 * Main service interface for the post management system.
 */
export interface PostManager {
  getPostById(postId: string): Promise<Post | null>
  getMainPosts(count?: number): Promise<Post[]>
  getAllPostsAndSubposts(): Promise<Post[]>
  getSubpostsByParent(parentId: string): Promise<Post[]>
  getMetadata(postId: string): Promise<PostMeta>
  getNavigation(currentIdOrPost: string | Post): Promise<PostNavigation>

  resolveAuthors(authorRefs: AuthorReference[]): Promise<AuthorData[]>

  getTOCSections(postId: string, tocMaxDepth?: number): Promise<TOCSection[]>
  getCurrentPostHeadings(postId: string, tocMaxDepth?: number): Promise<MarkdownHeading[]>
  isSubpost(postId: string): boolean
  getParentId(subpostId: string): string

  /** Gets complete context for individual post pages with optimized data fetching */
  getPostContext(postId: string, tocMaxDepth?: number): Promise<PostContext>

  /** Gets metadata for multiple posts in a single optimized batch operation */
  getBatchMetadata(postIds: string[]): Promise<Map<string, PostMeta>>
}
