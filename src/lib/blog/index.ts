/**
 * @fileoverview Main entry point for the consolidated post management system
 *
 * This file provides a clean interface and factory functions for the post management system.
 * It acts as a facade, delegating to the actual implementation while maintaining a simple API.
 *
 * @author My (Chiffon) Nguyen, Claude Code
 * @version 3.0.0
 */

import { PostManagerImpl } from "./manager"
import type {
  AuthorData,
  AuthorReference,
  Post,
  PostContext,
  PostManager as PostManagerInterface,
  PostMeta,
  PostNavigation,
  TOCSection
} from "./types"

/**
 * Main facade for the post management system.
 *
 * This class provides a simplified interface to all post management
 * functionality by delegating to the implementation class.
 * It implements the Singleton pattern to ensure consistent state across
 * the application.
 *
 * @example
 * ```typescript
 * const manager = PostManager.getInstance()
 * const context = await manager.getPostContext('my-post')
 * const tags = await manager.getAllTags()
 * ```
 */
export class PostManager implements PostManagerInterface {
  private static instance: PostManager | null = null
  private readonly impl: PostManagerImpl

  /**
   * Private constructor to enforce singleton pattern.
   */
  private constructor() {
    this.impl = PostManagerImpl.getInstance()
  }

  /**
   * Gets the singleton instance of the PostManager.
   */
  static getInstance(): PostManager {
    if (!PostManager.instance) {
      PostManager.instance = new PostManager()
    }
    return PostManager.instance
  }

  /**
   * Resets the singleton instance (mainly for testing).
   */
  static resetInstance(): void {
    PostManager.instance = null
    PostManagerImpl.resetInstance()
  }

  // ========================================
  // Delegated Methods
  // ========================================

  async getAllPostsAndSubposts(): Promise<Post[]> {
    return this.impl.getAllPostsAndSubposts()
  }

  async getPostById(postId: string): Promise<Post | null> {
    return this.impl.getPostById(postId)
  }

  async getMainPosts(count?: number): Promise<Post[]> {
    return this.impl.getMainPosts(count)
  }

  async getSubpostsByParent(parentId: string): Promise<Post[]> {
    return this.impl.getSubpostsByParent(parentId)
  }

  async getNavigation(currentIdOrPost: string | Post): Promise<PostNavigation> {
    return this.impl.getNavigation(currentIdOrPost)
  }

  async getMetadata(postId: string): Promise<PostMeta> {
    return this.impl.getMetadata(postId)
  }

  // Author Operations
  async resolveAuthors(authorRefs: AuthorReference[]): Promise<AuthorData[]> {
    return this.impl.resolveAuthors(authorRefs)
  }

  // TOC Operations
  async getTOCSections(postId: string, tocMaxDepth?: number): Promise<TOCSection[]> {
    return this.impl.getTOCSections(postId, tocMaxDepth)
  }

  async getCurrentPostHeadings(
    postId: string,
    tocMaxDepth?: number
  ): Promise<import("astro").MarkdownHeading[]> {
    return this.impl.getCurrentPostHeadings(postId, tocMaxDepth)
  }

  // Utility Operations
  isSubpost(postId: string): boolean {
    return this.impl.isSubpost(postId)
  }

  getParentId(subpostId: string): string {
    return this.impl.getParentId(subpostId)
  }

  // Optimized Composite Methods
  async getPostContext(postId: string, tocMaxDepth?: number): Promise<PostContext> {
    return this.impl.getPostContext(postId, tocMaxDepth)
  }

  async getBatchMetadata(postIds: string[]): Promise<Map<string, PostMeta>> {
    return this.impl.getBatchMetadata(postIds)
  }

  async getPostsByTag(tag: string): Promise<PostMeta[]> {
    return this.impl.getPostsByTag(tag)
  }

  async getPostsByAuthor(authorId: string): Promise<PostMeta[]> {
    return this.impl.getPostsByAuthor(authorId)
  }
}

// ========================================
// Factory Functions
// ========================================

/**
 * Creates a new PostManager instance.
 *
 * @returns PostManager instance
 *
 * @example
 * ```typescript
 * const manager = createPostManager()
 * ```
 */
export function createPostManager(): PostManager {
  return PostManager.getInstance()
}

// ========================================
// Exports
// ========================================

export default PostManager
export type * from "./types"
// Optimized exports for better tree-shaking
export {
  isSubpost,
  getParentId,
  sortByDateDesc,
  calculateWordCountFromHtml,
  calculateWordCountFromPost,
  formatSubpostCount,
  generatePostHref,
  getPostIconName
} from "./utils"

// Lazy-loaded exports for optional functionality
export { getTOCSections } from "./toc"
export { UnifiedTOCController } from "./scroll"
