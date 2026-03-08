import type { MarkdownHeading } from "astro"
import type { CollectionEntry, InferEntrySchema } from "astro:content"

export type Post = CollectionEntry<"blog">

export type AuthorData = InferEntrySchema<"people">

export type AuthorReference = {
  collection: "people"
  id: string
}

/**
 * Post metadata with computed fields.
 * Extends the base post data with calculated information
 * like word counts and subpost relationships.
 */
export interface PostMeta extends Omit<InferEntrySchema<"blog">, "authors"> {
  id: string
  wordCount: number
  combinedWordCount: number | null
  isSubpost: boolean
  subpostCount: number
  hasSubposts: boolean
  authors: AuthorData[]
}

export interface PostNavigation {
  newer: Post | null
  older: Post | null
  parent: Post | null
}

export interface PostWithMetadata {
  post: Post
  metadata: PostMeta
}

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
 * Derived fields are computed internally to minimize component logic.
 */
export interface PostContext {
  metadata: PostMeta
  navigation: PostNavigation
  tocSections: TOCSection[]
  headings: TOCHeadingItem[]
  subpostIds: string[]
  parentPost: { id: string; title: string } | null
  isSubpost: boolean
  hasSubposts: boolean
  postNavItems: PostNavItem[]
  activePostNavItem: PostNavItem | null
}

export interface TOCSection {
  postId: string
  postTitle: string
  isSubpost: boolean
  headings: TOCHeadingItem[]
}

/**
 * TOC heading item for components.
 * MarkdownHeading has fields depth, slug, text already.
 */
export interface TOCHeadingItem extends MarkdownHeading {
  href: string
}

export interface HeadingRegion {
  id: string
  start: number
  end: number
}

export interface TOCManager {
  getTOCSections(
    postId: string,
    postManager: PostManager,
    tocMaxDepth?: number
  ): Promise<TOCSection[]>
}

export interface PostManager {
  getPostById(postId: string): Promise<Post | null>
  getMainPosts(count?: number): Promise<Post[]>
  getAllPostsAndSubposts(): Promise<Post[]>
  getSubpostsByParent(parentId: string): Promise<Post[]>
  getMetadata(postId: string): Promise<PostMeta>
  getNavigation(currentIdOrPost: string | Post): Promise<PostNavigation>

  resolveAuthors(authorRefs: AuthorReference[]): Promise<AuthorData[]>

  getTOCSections(postId: string, tocMaxDepth?: number): Promise<TOCSection[]>
  isSubpost(postId: string): boolean
  getParentId(subpostId: string): string

  getPostContext(postId: string, tocMaxDepth?: number): Promise<PostContext>
  getBatchMetadata(postIds: string[]): Promise<Map<string, PostMeta>>
}
