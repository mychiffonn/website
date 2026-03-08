import { getCollection } from "astro:content"

import type { Post } from "./types"
import { getParentId, isSubpost } from "./utils"

export type TagCount = {
  tag: string
  count: number
}

export type TagPageData = {
  posts: import("./types").PostMeta[]
}

/**
 * Retrieves all unique tags for static path generation.
 * Tags from subposts are attributed to their parent posts.
 */
export async function getAllTags(getMainPosts: () => Promise<Post[]>): Promise<string[]> {
  const [mainPosts, allSubposts] = await Promise.all([
    getMainPosts(),
    getCollection("blog", (post) => isSubpost(post.id) && !post.data.draft)
  ])

  const uniqueTags = new Set<string>()

  for (const post of mainPosts) {
    if (post.data.tags?.length) {
      for (const tag of post.data.tags) {
        uniqueTags.add(tag)
      }
    }
  }

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
 */
export async function getSortedTags(getMainPosts: () => Promise<Post[]>): Promise<TagCount[]> {
  const [mainPosts, allSubposts] = await Promise.all([
    getMainPosts(),
    getCollection("blog", (post) => isSubpost(post.id) && !post.data.draft)
  ])

  const tagCounts = new Map<string, Set<string>>()

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

  return [...tagCounts.entries()]
    .map(([tag, postIds]) => ({ tag, count: postIds.size }))
    .sort((a, b) => {
      const countDiff = b.count - a.count
      return countDiff !== 0 ? countDiff : a.tag.localeCompare(b.tag)
    })
}
