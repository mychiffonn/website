/**
 * @fileoverview Table of Contents management for the blog system
 *
 * This module provides TOC generation, utilities, and management following
 * the Singleton pattern with proper caching and WeakRef memory management.
 *
 * @author My (Chiffon) Nguyen, Claude Code
 * @version 2.0.0
 */

import { render } from 'astro:content'
import type { MarkdownHeading } from 'astro'
import type { Post, PostManager, TOCSection } from './types'
import type { TOCManager as TOCManagerInterface, TOCUtils } from './types'
import { WeakRefCache } from './cache'

/**
 * Implementation of TOC utility functions.
 *
 * Contains pure functions for TOC-related operations like URL generation
 * and CSS class management.
 */
export class TOCUtilities implements TOCUtils {
  /**
   * Get CSS margin class for heading depth.
   *
   * @param depth - Heading depth level (1-6)
   * @returns CSS margin class for proper indentation
   */
  getHeadingMargin(depth: number): string {
    const margins: Record<number, string> = {
      2: '',
      3: 'ml-4',
      4: 'ml-8',
      5: 'ml-12',
      6: 'ml-16',
    }
    return margins[depth] || ''
  }

  /**
   * Generate TOC URLs for headings and sections.
   *
   * Handles complex routing logic for subposts, parent posts,
   * and cross-navigation between different post types.
   *
   * @param options - URL generation options
   * @returns Generated URL for navigation
   */
  getTOCUrl(options: {
    heading?: { slug: string }
    section?: { subpostId?: string }
    isSubpost?: boolean
    isActiveSection?: boolean
    parentId?: string
  }): string {
    const { heading, section, isSubpost, isActiveSection, parentId } = options

    if (heading && section) {
      // Heading within a section (subpost heading)
      if (isActiveSection) {
        return `#${heading.slug}`
      }
      return `/blog/${section.subpostId}#${heading.slug}`
    }

    if (heading) {
      // Heading URL (parent post heading)
      if (isSubpost && parentId) {
        return `/blog/${parentId}#${heading.slug}`
      }
      return `#${heading.slug}`
    }

    if (section) {
      // Section URL (subpost title)
      if (isActiveSection) {
        return "#"
      }
      return `/blog/${section.subpostId}`
    }

    return "#"
  }

  /**
   * Check if this is the first subpost section.
   *
   * Used to determine if a visual separator should be added
   * between parent and subpost sections.
   *
   * @param sections - All TOC sections
   * @param index - Current section index
   * @returns True if this is the first subpost section
   */
  isFirstSubpostSection(sections: TOCSection[], index: number): boolean {
    const section = sections[index]
    return section.type === "subpost" && (index === 0 || sections[index - 1].type === "parent")
  }
}

/**
 * Table of Contents manager implementing the Singleton pattern.
 *
 * Handles TOC generation for posts with subposts, including proper caching
 * and memory management using WeakRef for cache entries.
 */
export class TOCManager implements TOCManagerInterface {
  private static instance: TOCManager | null = null
  private readonly tocCache = new WeakRefCache<TOCSection[]>()

  private constructor() { }

  /**
   * Gets the singleton instance of the TOC manager.
   *
   * @returns TOC manager singleton instance
   */
  static getInstance(): TOCManager {
    if (!TOCManager.instance) {
      TOCManager.instance = new TOCManager()
    }
    return TOCManager.instance
  }

  /**
   * Resets the singleton instance (mainly for testing).
   *
   * @internal
   */
  static resetInstance(): void {
    TOCManager.instance = null
  }

  /**
   * Extracts headings from a post by rendering it.
   *
   * @param post - Post to extract headings from
   * @returns Promise resolving to array of markdown headings
   */
  private async extractHeadings(post: Post): Promise<MarkdownHeading[]> {
    try {
      const { headings } = await render(post)
      return headings
    } catch (error) {
      console.warn(`Failed to extract headings from post ${post.id}:`, error)
      return []
    }
  }

  /**
   * Filters headings by maximum depth.
   *
   * @param headings - Array of headings to filter
   * @param tocMaxDepth - Maximum depth to include (1-6)
   * @returns Filtered array of headings
   */
  private filterHeadingsByDepth(headings: MarkdownHeading[], tocMaxDepth: number): MarkdownHeading[] {
    return headings.filter(heading => heading.depth <= tocMaxDepth)
  }

  /**
   * Creates a parent section for the main post.
   *
   * @param headings - Headings from the parent post
   * @returns TOC section for the parent post
   */
  private createParentSection(headings: MarkdownHeading[]): TOCSection {
    return {
      type: 'parent',
      title: 'Overview',
      headings
    }
  }

  /**
   * Creates a subpost section.
   *
   * @param subpost - Subpost to create section for
   * @param headings - Headings from the subpost
   * @returns TOC section for the subpost
   */
  private createSubpostSection(subpost: Post, headings: MarkdownHeading[]): TOCSection {
    return {
      type: 'subpost',
      title: subpost.data.title,
      headings,
      subpostId: subpost.id
    }
  }

  /**
   * Gets table of contents sections for a post.
   *
   * Generates hierarchical TOC including parent post headings and
   * all subpost sections. Results are cached for performance.
   *
   * @param postId - Post ID to generate TOC for
   * @param postManager - Post manager instance for data access
   * @returns Promise resolving to TOC sections
   */
  async getTOCSections(postId: string, postManager: PostManager, tocMaxDepth: number): Promise<TOCSection[]> {
    // Create cache key that includes tocMaxDepth
    const cacheKey = `${postId}-depth-${tocMaxDepth}`

    // Check cache first
    const cached = this.tocCache.get(cacheKey)
    if (cached) return cached

    const post = await postManager.getPostById(postId)
    if (!post) return []

    // Determine parent ID and post
    const isSubpost = postManager.isSubpost(postId)
    const parentId = isSubpost ? postManager.getParentId(postId) : postId
    const parentPost = isSubpost ? await postManager.getPostById(parentId) : post

    if (!parentPost) return []

    const sections: TOCSection[] = []

    // Add parent post headings
    const parentHeadings = this.filterHeadingsByDepth(
      await this.extractHeadings(parentPost),
      tocMaxDepth
    )
    if (parentHeadings.length > 0) {
      sections.push(this.createParentSection(parentHeadings))
    }

    // Add subpost sections
    const subposts = await postManager.getSubpostsByParent(parentId)
    const subpostSections = await Promise.all(
      subposts.map(async (subpost: Post) => {
        const headings = this.filterHeadingsByDepth(
          await this.extractHeadings(subpost),
          tocMaxDepth
        )
        return headings.length > 0 ? this.createSubpostSection(subpost, headings) : null
      })
    )

    // Filter out null sections and add to main sections
    subpostSections.forEach((section) => {
      if (section) sections.push(section)
    })

    // Cache the result with depth-specific key
    this.tocCache.set(cacheKey, sections)
    return sections
  }

  /**
   * Clears the TOC cache.
   *
   * Useful for cache reset scenarios or during testing.
   */
  clearCache(): void {
    this.tocCache.clear()
  }
}

// Export utilities as singleton for consistency
export const tocUtils = new TOCUtilities()
