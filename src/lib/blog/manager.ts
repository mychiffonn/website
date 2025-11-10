/**
 * @fileoverview Implementation of the PostManager interface,
 * with singleton pattern.
 *
 * @author My (Chiffon) Nguyen, Claude Code
 * @version 3.0.0
 */

import { getCollection, getEntry } from "astro:content"

import * as authorModule from "./author"
import type {
  AuthorData,
  AuthorReference,
  Post,
  PostContext,
  PostManager as PostManagerInterface,
  PostMeta,
  PostNavigation,
  PostNavItem,
  TOCSection
} from "./types"
import { calculateWordCountFromPost, getParentId, isSubpost, sortByDateDesc } from "./utils"

/**
 * Implementation of the PostManager interface with all functionality consolidated.
 *
 * This class provides a simplified interface to all post management
 * functionality with consolidated repository and service logic.
 * It implements the Singleton pattern to ensure consistent state across
 * the application.
 */
export class PostManagerImpl implements PostManagerInterface {
  private static instance: PostManagerImpl | null = null

  /**
   * Private constructor to enforce singleton pattern.
   */
  private constructor() {
    // All functionality is now consolidated directly in this class
  }

  /**
   * Gets the singleton instance of the PostManager.
   */
  static getInstance(): PostManagerImpl {
    if (!PostManagerImpl.instance) {
      PostManagerImpl.instance = new PostManagerImpl()
    }
    return PostManagerImpl.instance
  }

  /**
   * Resets the singleton instance (mainly for testing).
   */
  static resetInstance(): void {
    PostManagerImpl.instance = null
  }

  // ========================================
  // Core Post Operations
  // ========================================

  async getAllPostsAndSubposts(): Promise<Post[]> {
    return await getCollection("blog", (post) => !post.data.draft)
  }

  async getPostById(postId: string): Promise<Post | null> {
    try {
      const post = await getEntry("blog", postId)
      return post && !post.data.draft ? post : null
    } catch (error) {
      console.warn(`Failed to retrieve post ${postId}:`, error)
      return null
    }
  }

  async getMainPosts(count?: number): Promise<Post[]> {
    const posts = await getCollection("blog", (post) => !post.data.draft && !isSubpost(post.id))

    const sortedPosts = sortByDateDesc(posts)
    return count ? sortedPosts.slice(0, count) : sortedPosts
  }

  async getSubpostsByParent(parentId: string): Promise<Post[]> {
    const subposts = await getCollection("blog", (post) => {
      return !post.data.draft && isSubpost(post.id) && getParentId(post.id) === parentId
    })

    return subposts.sort((a, b) => {
      const dateDiff = a.data.createdAt.valueOf() - b.data.createdAt.valueOf()
      if (dateDiff !== 0) return dateDiff

      const orderA = a.data.order ?? 0
      const orderB = b.data.order ?? 0
      return orderA - orderB
    })
  }

  async getNavigation(currentIdOrPost: string | Post): Promise<PostNavigation> {
    const currentId = typeof currentIdOrPost === "string" ? currentIdOrPost : currentIdOrPost.id

    if (isSubpost(currentId)) {
      const parentId = getParentId(currentId)
      const [parentPost, subposts] = await Promise.all([
        this.getPostById(parentId),
        this.getSubpostsByParent(parentId)
      ])

      const currentIndex = subposts.findIndex((post) => post.id === currentId)

      if (currentIndex === -1) {
        return { newer: null, older: null, parent: parentPost || null }
      }

      return {
        newer: currentIndex < subposts.length - 1 ? subposts[currentIndex + 1] : null,
        older: currentIndex > 0 ? subposts[currentIndex - 1] : null,
        parent: parentPost || null
      }
    } else {
      const allMainPosts = await this.getMainPosts()
      const currentIndex = allMainPosts.findIndex((post) => post.id === currentId)

      if (currentIndex === -1) {
        return { newer: null, older: null, parent: null }
      }

      return {
        newer: currentIndex > 0 ? allMainPosts[currentIndex - 1] : null,
        older: currentIndex < allMainPosts.length - 1 ? allMainPosts[currentIndex + 1] : null,
        parent: null
      }
    }
  }

  async getMetadata(postId: string): Promise<PostMeta> {
    const post = await this.getPostById(postId)
    if (!post) {
      throw new Error(`Post not found: ${postId}`)
    }

    const authors = await this.resolveAuthors(post.data.authors || [])

    if (isSubpost(postId)) {
      const wordCount = calculateWordCountFromPost(post)

      return {
        ...post.data,
        id: post.id,
        wordCount,
        combinedWordCount: null,
        subpostCount: 0,
        hasSubposts: false,
        isSubpost: true,
        authors
      }
    } else {
      const subposts = await this.getSubpostsByParent(postId)
      const wordCount = calculateWordCountFromPost(post)
      const subpostCount = subposts.length
      const hasSubposts = subpostCount > 0

      let combinedWordCount: number | null = null
      if (hasSubposts) {
        const subpostWordCount = subposts.reduce(
          (acc, subpost) => acc + calculateWordCountFromPost(subpost),
          0
        )
        combinedWordCount = wordCount + subpostWordCount
      }

      return {
        ...post.data,
        id: post.id,
        wordCount,
        combinedWordCount,
        subpostCount,
        hasSubposts,
        isSubpost: false,
        authors
      }
    }
  }

  // ========================================
  // Author Operations
  // ========================================

  async resolveAuthors(authorRefs: AuthorReference[]): Promise<AuthorData[]> {
    return authorModule.resolveAuthors(authorRefs)
  }

  // ========================================
  // TOC Operations
  // ========================================

  async getTOCSections(postId: string, tocMaxDepth: number = 6): Promise<TOCSection[]> {
    if (tocMaxDepth <= 0) return []
    // Lazy import for better tree-shaking and reduced initial bundle size
    const { getTOCSections } = await import("./toc")
    return getTOCSections(postId, this, tocMaxDepth)
  }

  async getCurrentPostHeadings(
    postId: string,
    tocMaxDepth: number = 6
  ): Promise<import("astro").MarkdownHeading[]> {
    if (tocMaxDepth <= 0) return []

    const post = await this.getPostById(postId)
    if (!post) return []

    try {
      // Lazy import of Astro render function for better performance
      const { render } = await import("astro:content")
      const { headings } = await render(post)
      return headings.filter((heading) => heading.depth <= tocMaxDepth)
    } catch (error) {
      console.warn(`Failed to render headings for post ${postId}:`, error)
      return []
    }
  }

  // ========================================
  // Utility Operations
  // ========================================

  isSubpost(postId: string): boolean {
    return isSubpost(postId)
  }

  getParentId(subpostId: string): string {
    return getParentId(subpostId)
  }

  // ========================================
  // Optimized Composite Methods
  // ========================================

  async getPostContext(postId: string, tocMaxDepth: number = 6): Promise<PostContext> {
    // Fetch only the essential data in parallel (3 queries)
    const [metadata, navigation, tocSections] = await Promise.all([
      this.getMetadata(postId),
      this.getNavigation(postId),
      this.getTOCSections(postId, tocMaxDepth)
    ])

    // Derive information internally to minimize component logic
    const headings = tocSections.find((section) => section.postId === postId)?.headings || []

    const subpostIds = tocSections
      .filter((section) => section.isSubpost)
      .map((section) => section.postId)

    const isSubpost = metadata.isSubpost === true
    const hasSubposts = metadata.hasSubposts === true

    // Extract parent info from navigation and tocSections
    const parentPost = navigation.parent
      ? {
          id: navigation.parent.id,
          title: navigation.parent.data.title
        }
      : null

    // Create navigation items for subpost components
    const postNavItems: PostNavItem[] = subpostIds.map((subpostId) => {
      const subpostSection = tocSections.find((section) => section.postId === subpostId)
      return {
        id: subpostId,
        title: subpostSection?.postTitle || "",
        isActive: subpostId === postId,
        isSubpost: true,
        wordCount: 0, // Could be populated if needed
        combinedWordCount: undefined,
        subpostCount: 0,
        href: `/blog/${subpostId}`
      }
    })

    // Create active post navigation item
    const activePostNavItem: PostNavItem | null =
      hasSubposts || isSubpost
        ? {
            id: isSubpost ? parentPost!.id : postId,
            title: isSubpost ? parentPost!.title : metadata.title,
            isActive: !isSubpost,
            isSubpost: false,
            wordCount: metadata.wordCount,
            combinedWordCount: metadata.combinedWordCount ?? undefined,
            subpostCount: metadata.subpostCount,
            href: `/blog/${isSubpost ? parentPost!.id : postId}`
          }
        : null

    return {
      metadata,
      navigation,
      tocSections,
      headings,
      subpostIds,
      parentPost,
      isSubpost,
      hasSubposts,
      postNavItems,
      activePostNavItem
    }
  }

  async getBatchMetadata(postIds: string[]): Promise<Map<string, PostMeta>> {
    // Early return for empty arrays to avoid unnecessary processing
    if (!postIds.length) return new Map()

    // Optimized batch processing with error handling
    const metadataResults = await Promise.allSettled(
      postIds.map(async (postId) => {
        const metadata = await this.getMetadata(postId)
        return [postId, metadata] as const
      })
    )

    // Filter successful results only
    const validMetadata = metadataResults
      .filter(
        (result): result is PromiseFulfilledResult<readonly [string, PostMeta]> =>
          result.status === "fulfilled"
      )
      .map((result) => result.value)

    return new Map(validMetadata)
  }

  // ========================================
  // Post Filtering Operations
  // ========================================

  async getPostsByAuthor(authorId: string): Promise<PostMeta[]> {
    try {
      const posts = await getCollection("blog", (post) => {
        // Early returns for better performance
        if (post.data.draft || isSubpost(post.id)) return false
        return post.data.authors?.some((authorRef) => authorRef.id === authorId) ?? false
      })

      if (posts.length === 0) {
        return []
      }

      const metadataMap = await this.getBatchMetadata(posts.map((p) => p.id))
      const postsMetadata = posts
        .map((post) => metadataMap.get(post.id))
        .filter((metadata): metadata is PostMeta => metadata !== undefined)

      return postsMetadata.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      console.warn(`Failed to retrieve posts by author ${authorId}:`, error)
      return []
    }
  }

  async getPostsByTag(tag: string): Promise<PostMeta[]> {
    try {
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
      const metadataMap = await this.getBatchMetadata(allPostIds)

      // Convert to sorted array, filtering out any missing metadata
      const postsMetadata = allPostIds
        .map((postId) => metadataMap.get(postId))
        .filter((metadata): metadata is PostMeta => metadata !== undefined)

      // Sort by date (most recent first)
      return postsMetadata.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      console.warn(`Failed to retrieve posts by tag ${tag}:`, error)
      return []
    }
  }
}
