/**
 * @fileoverview Table of Contents management for the blog system
 *
 * This module provides TOC generation and utility functions.
 *
 * @author My (Chiffon) Nguyen, Claude Code
 * @version 3.0.0
 */

import { render } from "astro:content"

import type { Post, PostManager, TOCHeadingItem, TOCSection } from "./types"

/**
 * Extract headings from a post, filter by max depth, and add href.
 * Optimized with early returns and efficient filtering.
 */
async function extractAndProcessHeadings(
  post: Post,
  tocMaxDepth: number
): Promise<TOCHeadingItem[]> {
  try {
    const { headings } = await render(post)

    // Early return if no headings
    if (!headings?.length) return []

    // Filter and transform in single pass for better performance
    return headings
      .filter((heading) => heading.depth <= tocMaxDepth)
      .map((heading) => ({
        ...heading,
        href: `#${heading.slug}`
      }))
  } catch (error) {
    console.warn(`Failed to extract headings from post ${post.id}:`, error)
    return []
  }
}

/**
 * Gets table of contents sections for a post.
 *
 * Highly optimized implementation with minimal database calls,
 * efficient parallel processing, and early returns.
 *
 * @param postId - Post ID to generate TOC for
 * @param postManager - Post manager instance for data access
 * @param tocMaxDepth - Maximum heading depth to include
 * @returns Promise resolving to TOC sections
 */
export async function getTOCSections(
  postId: string,
  postManager: PostManager,
  tocMaxDepth: number
): Promise<TOCSection[]> {
  // Early return for invalid depth
  if (tocMaxDepth <= 0) return []

  const post = await postManager.getPostById(postId)
  if (!post) return []

  // Determine parent context efficiently
  const isSubpost = postManager.isSubpost(postId)
  const parentId = isSubpost ? postManager.getParentId(postId) : postId

  // Optimize: avoid extra query if current post is already the parent
  const parentPost = isSubpost ? await postManager.getPostById(parentId) : post
  if (!parentPost) return []

  // Parallel fetch of parent headings and subposts
  const [parentHeadings, subposts] = await Promise.all([
    extractAndProcessHeadings(parentPost, tocMaxDepth),
    postManager.getSubpostsByParent(parentId)
  ])

  // Early return if no content to process
  if (parentHeadings.length === 0 && subposts.length === 0) return []

  // Process subposts in parallel with early filtering
  const subpostSectionsPromises = subposts.map(
    async (subpost: Post): Promise<TOCSection | null> => {
      const headings = await extractAndProcessHeadings(subpost, tocMaxDepth)

      // Return null early if no headings to avoid object creation
      if (headings.length === 0) return null

      return {
        postId: subpost.id,
        postTitle: subpost.data.title,
        isSubpost: true,
        headings
      }
    }
  )

  const subpostResults = await Promise.all(subpostSectionsPromises)
  const subpostSections = subpostResults.filter(
    (section): section is TOCSection => section !== null
  )

  // Build final sections array efficiently
  const sections: TOCSection[] = []

  // Add parent section if it has headings
  if (parentHeadings.length > 0) {
    sections.push({
      postId: parentId,
      postTitle: parentPost.data.title,
      isSubpost: false,
      headings: parentHeadings
    })
  }

  // Add all valid subpost sections
  if (subpostSections.length > 0) {
    sections.push(...subpostSections)
  }

  return sections
}

/**
 * Determines which TOC sections contain active headings based on currently visible heading IDs.
 * This integrates with the scroll controller's active heading detection.
 *
 * @param sections - Array of TOC sections
 * @param activeHeadingIds - Array of currently visible heading IDs from scroll controller
 * @returns Set of section postIds that contain active headings
 */
export function getActiveSections(sections: TOCSection[], activeHeadingIds: string[]): Set<string> {
  const activeSections = new Set<string>()
  const activeIdSet = new Set(activeHeadingIds)

  for (const section of sections) {
    // Check if any heading in this section is currently active
    const hasActiveHeading = section.headings.some((heading) => activeIdSet.has(heading.slug))

    if (hasActiveHeading) {
      activeSections.add(section.postId)
    }
  }

  return activeSections
}

export function getTOCUrl(
  heading: { slug: string },
  section: TOCSection,
  isActiveSection: boolean
): string {
  // If this is the currently active section, use fragment-only URL
  if (isActiveSection) {
    return `#${heading.slug}`
  }

  // Use the section's postId for navigation
  return `/blog/${section.postId}#${heading.slug}`
}

/** Get width class for TOCHeadingLink headings */
export function getHeadingMargin(depth: number): string {
  const margins: Record<number, string> = {
    2: "",
    3: "ml-4",
    4: "ml-8",
    5: "ml-12",
    6: "ml-16"
  }
  return margins[depth] || ""
}

/** Get width class for TOCFloat headings */
export function getHeadingWidth(depth: number): string {
  const widths: Record<number, string> = {
    1: "w-4",
    2: "w-4",
    3: "w-3",
    4: "w-2",
    5: "w-1.5",
    6: "w-1"
  }
  return widths[depth] || "w-2"
}
