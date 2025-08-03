import { getCollection, render, type CollectionEntry } from 'astro:content'

// ========================================
// Content Processing Utilities
// ========================================

export function calculateWordCountFromHtml(
  html: string | null | undefined,
): number {
  if (!html) return 0
  const textOnly = html.replace(/<[^>]+>/g, '')
  return textOnly.split(/\s+/).filter(Boolean).length
}

// ========================================
// TypeScript Interfaces
// ========================================

export interface Post extends CollectionEntry<'blog'> { }

export interface ParsedAuthor {
  id: string
  name: string
  avatar?: string
  isRegistered: boolean
}

export interface PostNavigation {
  newer: Post | null
  older: Post | null
  parent: Post | null
}

export interface PostMetadata {
  wordCount: number
  combinedWordCount: number | null
  subpostCount: number
  hasSubposts: boolean
  publishDate: Date
  modifiedDate?: Date
  authors: ParsedAuthor[]
  tags: string[]
}

export interface TOCHeading {
  slug: string
  text: string
  depth: number
  isSubpostTitle?: boolean
}

export interface TOCSection {
  type: 'parent' | 'subpost'
  title: string
  headings: TOCHeading[]
  subpostId?: string
}

export interface PostContext {
  post: Post
  metadata: PostMetadata
  navigation: PostNavigation
  authors: ParsedAuthor[]
  tocSections: TOCSection[]
  headings: any[]
  isSubpost: boolean
  parentPost: Post | null
}

export interface SubpostContext {
  currentPost: Post
  parentPost: Post | null
  subposts: Post[]
  metadata: Map<string, PostMetadata>
  isCurrentSubpost: boolean
}

// ========================================
// PostManager Class
// ========================================

export class PostManager {
  private static instance: PostManager
  // Only cache computationally expensive operations that benefit from memoization
  private metadataCache: Map<string, PostMetadata> = new Map()
  private tocCache: Map<string, TOCSection[]> = new Map()
  private renderedContentCache: Map<string, { headings: any[]; html: string }> = new Map()
  private authorsCache: Map<string, CollectionEntry<'authors'>> = new Map()

  private constructor() { }

  static getInstance(): PostManager {
    if (!PostManager.instance) {
      PostManager.instance = new PostManager()
    }
    return PostManager.instance
  }

  // ========================================
  // Dev Mode Cache Invalidation
  // ========================================

  clearCache(): void {
    this.metadataCache.clear()
    this.tocCache.clear()
    this.renderedContentCache.clear()
    this.authorsCache.clear()
    console.log('🧹 PostManager cache cleared')
  }

  getCacheStats(): object {
    return {
      metadataCacheSize: this.metadataCache.size,
      tocCacheSize: this.tocCache.size,
      renderedContentSize: this.renderedContentCache.size,
      authorsCacheSize: this.authorsCache.size
    }
  }

  // ========================================
  // Utility Functions
  // ========================================

  isSubpost(postId: string): boolean {
    return postId.includes('/')
  }

  getParentId(subpostId: string): string {
    return subpostId.split('/')[0]
  }

  // ========================================
  // Core Data Access Methods (Direct Collection Access)
  // ========================================

  async getAllPosts(): Promise<Post[]> {
    const allPostsAndSubposts = await getCollection('blog')
    return allPostsAndSubposts
      .filter((post) => !post.data.draft && !this.isSubpost(post.id))
      .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf())
  }

  async getAllPostsAndSubposts(): Promise<Post[]> {
    const allPostsAndSubposts = await getCollection('blog')
    return allPostsAndSubposts.filter(post => !post.data.draft)
  }

  async getPostById(postId: string): Promise<Post | null> {
    const allPosts = await getCollection('blog')
    return allPosts.find(post => post.id === postId && !post.data.draft) || null
  }

  async getSubpostsForParent(parentId: string): Promise<Post[]> {
    const allPosts = await getCollection('blog')
    const subposts = allPosts
      .filter((post) => !post.data.draft && this.isSubpost(post.id) && this.getParentId(post.id) === parentId)
      .sort((a, b) => {
        const dateDiff = a.data.publishDate.valueOf() - b.data.publishDate.valueOf()
        if (dateDiff !== 0) return dateDiff

        const orderA = a.data.order ?? 0
        const orderB = b.data.order ?? 0
        return orderA - orderB
      })

    return subposts
  }

  // ========================================
  // Author Management (with caching)
  // ========================================

  private async getAuthorMap(): Promise<Map<string, CollectionEntry<'authors'>>> {
    if (this.authorsCache.size === 0) {
      const allAuthors = await getCollection('authors')
      allAuthors.forEach(author => this.authorsCache.set(author.id, author))
    }
    return this.authorsCache
  }

  async parseAuthors(authors: any[] = []): Promise<ParsedAuthor[]> {
    if (!authors.length) return []

    const authorMap = await this.getAuthorMap()

    // Handle both reference objects and strings
    const authorIds = authors.map(author =>
      typeof author === 'string' ? author : author.id || author
    )

    return authorIds.map((id) => {
      const author = authorMap.get(id)
      return {
        id,
        name: author?.data?.name || id,
        avatar: author?.data?.avatar,
        isRegistered: !!author,
      }
    })
  }

  // ========================================
  // Navigation
  // ========================================

  async getNavigation(currentId: string): Promise<PostNavigation>
  async getNavigation(currentPost: Post): Promise<PostNavigation>
  async getNavigation(currentIdOrPost: string | Post): Promise<PostNavigation> {
    const currentId = typeof currentIdOrPost === 'string' ? currentIdOrPost : currentIdOrPost.id

    if (this.isSubpost(currentId)) {
      const parentId = this.getParentId(currentId)
      const [parent, subposts] = await Promise.all([
        this.getPostById(parentId),
        this.getSubpostsForParent(parentId)
      ])

      const currentIndex = subposts.findIndex((post) => post.id === currentId)
      if (currentIndex === -1) {
        return { newer: null, older: null, parent }
      }

      return {
        newer: currentIndex < subposts.length - 1 ? subposts[currentIndex + 1] : null,
        older: currentIndex > 0 ? subposts[currentIndex - 1] : null,
        parent
      }
    }

    const allPosts = await this.getAllPosts()
    const currentIndex = allPosts.findIndex((post) => post.id === currentId)

    if (currentIndex === -1) {
      return { newer: null, older: null, parent: null }
    }

    return {
      newer: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
      older: currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null,
      parent: null
    }
  }

  // ========================================
  // Content Rendering with Caching
  // ========================================

  private async getRenderedContent(post: Post): Promise<{ headings: any[]; html: string }> {
    const cached = this.renderedContentCache.get(post.id)
    if (cached) return cached

    const { headings } = await render(post)
    const result = { headings, html: post.body || '' }

    this.renderedContentCache.set(post.id, result)
    return result
  }

  // ========================================
  // Metadata Computation (with caching)
  // ========================================

  async getMetadata(postId: string): Promise<PostMetadata> {
    const cached = this.metadataCache.get(postId)
    if (cached) return cached

    const post = await this.getPostById(postId)
    if (!post) {
      const defaultMetadata: PostMetadata = {
        wordCount: 0,
        combinedWordCount: null,
        subpostCount: 0,
        hasSubposts: false,
        publishDate: new Date(),
        modifiedDate: undefined,
        authors: [],
        tags: []
      }
      return defaultMetadata
    }

    const wordCount = calculateWordCountFromHtml(post.body)

    let combinedWordCount: number | null = null
    let subpostCount = 0
    let hasSubposts = false

    if (!this.isSubpost(postId)) {
      const subposts = await this.getSubpostsForParent(postId)
      subpostCount = subposts.length
      hasSubposts = subpostCount > 0

      if (hasSubposts) {
        combinedWordCount = subposts.reduce((acc, subpost) =>
          acc + calculateWordCountFromHtml(subpost.body), wordCount
        )
      }
    }

    // Parse authors for this post
    const authors = await this.parseAuthors(post.data.authors || [])

    const metadata: PostMetadata = {
      wordCount,
      combinedWordCount,
      subpostCount,
      hasSubposts,
      publishDate: post.data.publishDate,
      modifiedDate: post.data.modifiedDate,
      authors,
      tags: post.data.tags || []
    }

    this.metadataCache.set(postId, metadata)
    return metadata
  }

  // ========================================
  // Table of Contents (with caching)
  // ========================================

  async getTOCSections(postId: string): Promise<TOCSection[]> {
    const cached = this.tocCache.get(postId)
    if (cached) return cached

    const post = await this.getPostById(postId)
    if (!post) return []

    const parentId = this.isSubpost(postId) ? this.getParentId(postId) : postId
    const parentPost = this.isSubpost(postId) ? await this.getPostById(parentId) : post

    if (!parentPost) return []

    const sections: TOCSection[] = []

    // Add parent post headings
    const { headings: parentHeadings } = await this.getRenderedContent(parentPost)
    if (parentHeadings.length > 0) {
      sections.push({
        type: 'parent',
        title: 'Overview',
        headings: parentHeadings.map((heading) => ({
          slug: heading.slug,
          text: heading.text,
          depth: heading.depth,
        })),
      })
    }

    // Add subpost sections
    const subposts = await this.getSubpostsForParent(parentId)
    await Promise.all(
      subposts.map(async (subpost) => {
        const { headings: subpostHeadings } = await this.getRenderedContent(subpost)
        if (subpostHeadings.length > 0) {
          sections.push({
            type: 'subpost',
            title: subpost.data.title,
            headings: subpostHeadings.map((heading, index) => ({
              slug: heading.slug,
              text: heading.text,
              depth: heading.depth,
              isSubpostTitle: index === 0,
            })),
            subpostId: subpost.id,
          })
        }
      })
    )

    this.tocCache.set(postId, sections)
    return sections
  }

  // ========================================
  // Optimized Context Methods
  // ========================================

  async getSubpostContext(currentPostId: string): Promise<SubpostContext | null> {
    const currentPost = await this.getPostById(currentPostId)
    if (!currentPost) return null

    const isCurrentSubpost = this.isSubpost(currentPostId)
    const parentId = isCurrentSubpost ? this.getParentId(currentPostId) : currentPostId

    const [parentPost, subposts] = await Promise.all([
      isCurrentSubpost ? this.getPostById(parentId) : Promise.resolve(null),
      this.getSubpostsForParent(parentId)
    ])

    // Get metadata for all relevant posts in parallel
    const allPosts = [currentPost, parentPost, ...subposts].filter(Boolean) as Post[]
    const metadataEntries = await Promise.all(
      allPosts.map(async (post) => [post.id, await this.getMetadata(post.id)] as const)
    )
    const metadata = new Map(metadataEntries)

    return {
      currentPost,
      parentPost,
      subposts,
      metadata,
      isCurrentSubpost
    }
  }

  // ========================================
  // Utility Functions
  // ========================================

  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    const posts = await this.getAllPosts()
    return posts.filter((post) => {
      if (!post.data.authors) return false
      // Handle both reference objects and strings for backward compatibility
      return post.data.authors.some(author =>
        typeof author === 'string' ? author === authorId : author.id === authorId
      )
    })
  }

  async getPostsByTag(tag: string): Promise<Post[]> {
    const posts = await this.getAllPostsAndSubposts()
    return posts.filter((post) => post.data.tags?.includes(tag))
  }

  async getRecentPosts(count: number): Promise<Post[]> {
    const posts = await this.getAllPosts()
    return posts.slice(0, count)
  }

  groupPostsByYear(posts: Post[]): Record<string, Post[]> {
    return posts.reduce(
      (acc: Record<string, Post[]>, post) => {
        const year = post.data.publishDate.getFullYear().toString()
          ; (acc[year] ??= []).push(post)
        return acc
      },
      {},
    )
  }

  // ========================================
  // High-Level Context Creation
  // ========================================

  async getPostContext(postId: string): Promise<PostContext | null> {
    const post = await this.getPostById(postId)
    if (!post) return null

    const isSubpost = this.isSubpost(postId)

    // Fetch all required data in parallel
    const [
      metadata,
      navigation,
      authors,
      tocSections,
      renderedContent,
      parentPost
    ] = await Promise.all([
      this.getMetadata(postId),
      this.getNavigation(postId),
      this.parseAuthors(post.data.authors || []),
      this.getTOCSections(postId),
      this.getRenderedContent(post),
      isSubpost ? this.getPostById(this.getParentId(postId)) : Promise.resolve(null)
    ])

    return {
      post,
      metadata,
      navigation,
      authors,
      tocSections,
      headings: renderedContent.headings,
      isSubpost,
      parentPost
    }
  }
}
