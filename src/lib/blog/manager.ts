import type { MarkdownHeading } from "astro"
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

export class PostManager implements PostManagerInterface {
  private static instance: PostManager | null = null

  private constructor() {}

  static getInstance(): PostManager {
    if (!PostManager.instance) {
      PostManager.instance = new PostManager()
    }
    return PostManager.instance
  }

  static resetInstance(): void {
    PostManager.instance = null
  }

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

  async resolveAuthors(authorRefs: AuthorReference[]): Promise<AuthorData[]> {
    return authorModule.resolveAuthors(authorRefs)
  }

  async getTOCSections(
    postId: string,
    tocMaxDepth: number = 6,
    preRenderedHeadings?: MarkdownHeading[]
  ): Promise<TOCSection[]> {
    if (tocMaxDepth <= 0) return []
    const { getTOCSections } = await import("./toc")
    return getTOCSections(postId, this, tocMaxDepth, preRenderedHeadings)
  }

  isSubpost(postId: string): boolean {
    return isSubpost(postId)
  }

  getParentId(subpostId: string): string {
    return getParentId(subpostId)
  }

  /**
   * Gets complete context for rendering an individual post page.
   * When `preRenderedHeadings` is provided, avoids a redundant `render()` call in TOC generation.
   */
  async getPostContext(
    postId: string,
    tocMaxDepth: number = 6,
    preRenderedHeadings?: MarkdownHeading[]
  ): Promise<PostContext> {
    const [metadata, navigation, tocSections] = await Promise.all([
      this.getMetadata(postId),
      this.getNavigation(postId),
      this.getTOCSections(postId, tocMaxDepth, preRenderedHeadings)
    ])

    const headings = tocSections.find((section) => section.postId === postId)?.headings || []

    const subpostIds = tocSections
      .filter((section) => section.isSubpost)
      .map((section) => section.postId)

    const isSubpostFlag = metadata.isSubpost === true
    const hasSubposts = metadata.hasSubposts === true

    const parentPost = navigation.parent
      ? {
          id: navigation.parent.id,
          title: navigation.parent.data.title
        }
      : null

    const postNavItems: PostNavItem[] = await Promise.all(
      subpostIds.map(async (subpostId) => {
        const subpostSection = tocSections.find((section) => section.postId === subpostId)
        const subpostMetadata = await this.getMetadata(subpostId)
        return {
          id: subpostId,
          title: subpostSection?.postTitle || "",
          isActive: subpostId === postId,
          isSubpost: true,
          wordCount: subpostMetadata.wordCount,
          combinedWordCount: undefined,
          subpostCount: 0,
          href: `/blog/${subpostId}`
        }
      })
    )

    const activePostNavItem: PostNavItem | null =
      hasSubposts || isSubpostFlag
        ? await (async () => {
            if (isSubpostFlag && parentPost) {
              const parentMetadata = await this.getMetadata(parentPost.id)
              return {
                id: parentPost.id,
                title: parentPost.title,
                isActive: false,
                isSubpost: false,
                wordCount: parentMetadata.wordCount,
                combinedWordCount: parentMetadata.combinedWordCount ?? undefined,
                subpostCount: parentMetadata.subpostCount,
                href: `/blog/${parentPost.id}`
              }
            } else {
              return {
                id: postId,
                title: metadata.title,
                isActive: true,
                isSubpost: false,
                wordCount: metadata.wordCount,
                combinedWordCount: metadata.combinedWordCount ?? undefined,
                subpostCount: metadata.subpostCount,
                href: `/blog/${postId}`
              }
            }
          })()
        : null

    return {
      metadata,
      navigation,
      tocSections,
      headings,
      subpostIds,
      parentPost,
      isSubpost: isSubpostFlag,
      hasSubposts,
      postNavItems,
      activePostNavItem
    }
  }

  async getBatchMetadata(postIds: string[]): Promise<Map<string, PostMeta>> {
    if (!postIds.length) return new Map()

    const metadataResults = await Promise.allSettled(
      postIds.map(async (postId) => {
        const metadata = await this.getMetadata(postId)
        return [postId, metadata] as const
      })
    )

    const validMetadata = metadataResults
      .filter(
        (result): result is PromiseFulfilledResult<readonly [string, PostMeta]> =>
          result.status === "fulfilled"
      )
      .map((result) => result.value)

    return new Map(validMetadata)
  }

  async getPostsByAuthor(authorId: string): Promise<PostMeta[]> {
    try {
      const posts = await getCollection("blog", (post) => {
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

      const parentIds = new Set(subpostsWithTag.map((subpost) => getParentId(subpost.id)))

      const allPostIds = [...mainPostsWithTag.map((post) => post.id), ...parentIds]

      if (allPostIds.length === 0) {
        return []
      }

      const metadataMap = await this.getBatchMetadata(allPostIds)

      const postsMetadata = allPostIds
        .map((postId) => metadataMap.get(postId))
        .filter((metadata): metadata is PostMeta => metadata !== undefined)

      return postsMetadata.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      console.warn(`Failed to retrieve posts by tag ${tag}:`, error)
      return []
    }
  }
}
