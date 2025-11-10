/**
 * @fileoverview Tag management for the blog system
 *
 * This module provides tag-related operations including tag counting,
 * sorting, and post filtering by tag.
 *
 * @author My (Chiffon) Nguyen, Claude Code
 * @version 3.0.0
 */

import { getCollection } from "astro:content"

import type { Post, PostMeta } from "./types"
import { getParentId, isSubpost } from "./utils"

export type TagCount = {
  tag: string
  count: number
}

export type TagPageData = {
  posts: PostMeta[]
}

/**
 * Retrieves all unique tags (without counts) for static path generation.
 * Tags from subposts are attributed to their parent posts.
 * Optimized for build-time performance.
 */
export async function getAllTags(getMainPosts: () => Promise<Post[]>): Promise<string[]> {
  const [mainPosts, allSubposts] = await Promise.all([
    getMainPosts(),
    getCollection("blog", (post) => isSubpost(post.id) && !post.data.draft)
  ])

  const uniqueTags = new Set<string>()

  // Process main posts
  for (const post of mainPosts) {
    if (post.data.tags?.length) {
      for (const tag of post.data.tags) {
        uniqueTags.add(tag)
      }
    }
  }

  // Process subposts
  for (const subpost of allSubposts) {
    if (subpost.data.tags?.length) {
      for (const tag of subpost.data.tags) {
        uniqueTags.add(tag)
      }
    }
  }

  return [...uniqueTags].sort()
}

/**
 * Retrieves sorted tags by count (descending) and name (ascending).
 * Tags from subposts are attributed to their parent posts.
 * Optimized with efficient Set operations and streamlined for static build.
 */
export async function getSortedTags(getMainPosts: () => Promise<Post[]>): Promise<TagCount[]> {
  const [mainPosts, allSubposts] = await Promise.all([
    getMainPosts(),
    getCollection("blog", (post) => isSubpost(post.id) && !post.data.draft)
  ])

  // Use Map with Set for efficient deduplication of post IDs per tag
  const tagCounts = new Map<string, Set<string>>()

  // Process main posts - direct attribution
  for (const post of mainPosts) {
    if (!post.data.tags?.length) continue

    for (const tag of post.data.tags) {
      let postIds = tagCounts.get(tag)
      if (!postIds) {
        postIds = new Set()
        tagCounts.set(tag, postIds)
      }
      postIds.add(post.id)
    }
  }

  // Process subposts - attribute to parent
  for (const subpost of allSubposts) {
    if (!subpost.data.tags?.length) continue

    const parentId = getParentId(subpost.id)
    for (const tag of subpost.data.tags) {
      let postIds = tagCounts.get(tag)
      if (!postIds) {
        postIds = new Set()
        tagCounts.set(tag, postIds)
      }
      postIds.add(parentId)
    }
  }

  // Convert to sorted array in single pass
  return [...tagCounts.entries()]
    .map(([tag, postIds]) => ({ tag, count: postIds.size }))
    .sort((a, b) => {
      const countDiff = b.count - a.count
      return countDiff !== 0 ? countDiff : a.tag.localeCompare(b.tag)
    })
}

/**
 * Retrieves all post metadata (main posts only) that have a specific tag.
 * Includes main posts with the tag and parent posts of subposts with the tag.
 * Optimized with efficient filtering and batch metadata fetching.
 *
 * @param tag - Tag to filter posts by
 * @param getBatchMetadata - Function to get batch metadata
 * @returns Promise resolving to array of post metadata
 */
export async function getPostsByTag(
  tag: string,
  getBatchMetadata: (postIds: string[]) => Promise<Map<string, PostMeta>>
): Promise<PostMeta[]> {
  // Parallel fetch of main posts and subposts with the tag
  const [mainPostsWithTag, subpostsWithTag] = await Promise.all([
    getCollection(
      "blog",
      (post) => !post.data.draft && !isSubpost(post.id) && post.data.tags?.includes(tag)
    ),
    getCollection(
      "blog",
      (post) => !post.data.draft && isSubpost(post.id) && post.data.tags?.includes(tag)
    )
  ])

  // Get parent IDs (use Set only to avoid duplicate API calls for same parent)
  const parentIds = new Set(subpostsWithTag.map((subpost) => getParentId(subpost.id)))

  // Combine all unique post IDs
  const allPostIds = [...mainPostsWithTag.map((post) => post.id), ...parentIds]

  // Early return if no posts
  if (allPostIds.length === 0) {
    return []
  }

  // Get batch metadata for all posts
  const metadataMap = await getBatchMetadata(allPostIds)

  // Convert to sorted array, filtering out any missing metadata
  const postsMetadata = allPostIds
    .map((postId) => metadataMap.get(postId))
    .filter((metadata): metadata is PostMeta => metadata !== undefined)

  // Sort by date (most recent first)
  return postsMetadata.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}
