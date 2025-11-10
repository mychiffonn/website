/**
 * @fileoverview Author management for the blog system
 *
 * This module provides author-related operations including retrieval,
 * resolution of author references, and post filtering by author.
 *
 * @author My (Chiffon) Nguyen, Claude Code
 * @version 3.0.0
 */

import { getCollection, getEntry } from "astro:content"

import type { AuthorData, AuthorReference, PostMeta } from "./types"
import { isSubpost } from "./utils"

/**
 * Retrieves all authors from the people collection.
 */
export async function getAllAuthors(): Promise<AuthorData[]> {
  try {
    const authors = await getCollection("people")
    return authors.map((author) => author.data)
  } catch (error) {
    console.warn("Failed to retrieve all authors:", error)
    return []
  }
}

/**
 * Retrieves a single author by ID.
 */
export async function getAuthorById(authorId: string): Promise<AuthorData | null> {
  try {
    const author = await getEntry("people", authorId)
    return author?.data || null
  } catch (error) {
    console.warn(`Failed to retrieve author ${authorId}:`, error)
    return null
  }
}

/**
 * Retrieves all posts by a specific author (main posts only).
 * Optimized with efficient filtering and early returns.
 */
export async function getPostsByAuthor(
  authorId: string,
  getBatchMetadata: (postIds: string[]) => Promise<Map<string, PostMeta>>
): Promise<PostMeta[]> {
  try {
    const posts = await getCollection("blog", (post) => {
      // Early returns for better performance
      if (post.data.draft || isSubpost(post.id)) return false
      return post.data.authors?.some((authorRef) => authorRef.id === authorId) ?? false
    })

    if (posts.length === 0) {
      return []
    }

    const metadataMap = await getBatchMetadata(posts.map((p) => p.id))
    const postsMetadata = posts
      .map((post) => metadataMap.get(post.id))
      .filter((metadata): metadata is PostMeta => metadata !== undefined)

    return postsMetadata.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (error) {
    console.warn(`Failed to retrieve posts by author ${authorId}:`, error)
    return []
  }
}

/**
 * Resolves author references to author data objects.
 * Optimized with batch processing and efficient filtering.
 */
export async function resolveAuthors(authorRefs: AuthorReference[]): Promise<AuthorData[]> {
  if (!authorRefs?.length) return []

  // Process all author references in parallel for better performance
  const resolvedAuthors = await Promise.allSettled(
    authorRefs.map(async (authorRef) => {
      const author = await getEntry(authorRef)
      return author?.data || null
    })
  )

  // Filter out failed promises and null results efficiently
  return resolvedAuthors
    .filter(
      (result): result is PromiseFulfilledResult<AuthorData> =>
        result.status === "fulfilled" && result.value !== null
    )
    .map((result) => result.value)
}
