import type { CollectionEntry } from 'astro:content'
import { PostManager } from './post-manager'

export type TagCount = { tag: string; count: number }

export class TagManager {
  private static instance: TagManager
  private cache: Map<string, number> | null = null

  private constructor() { }

  static getInstance(): TagManager {
    if (!TagManager.instance) {
      TagManager.instance = new TagManager()
    }
    return TagManager.instance
  }

  private async initializeCache(): Promise<void> {
    if (this.cache !== null) return

    const blogManager = PostManager.getInstance()
    const posts = await blogManager.getAllPostsAndSubposts()

    this.cache = posts.reduce((acc, post) => {
      post.data.tags?.forEach((tag) => {
        acc.set(tag, (acc.get(tag) || 0) + 1)
      })
      return acc
    }, new Map<string, number>())
  }

  async getAllTags(): Promise<Map<string, number>> {
    await this.initializeCache()
    return new Map(this.cache!)
  }

  async getSortedTags(): Promise<TagCount[]> {
    const tagCounts = await this.getAllTags()
    return [...tagCounts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => {
        const countDiff = b.count - a.count
        return countDiff !== 0 ? countDiff : a.tag.localeCompare(b.tag)
      })
  }

  async getTagCount(tag: string): Promise<number> {
    await this.initializeCache()
    return this.cache!.get(tag) || 0
  }

  async getPostsByTag(tag: string): Promise<CollectionEntry<'blog'>[]> {
    const blogManager = PostManager.getInstance()
    return await blogManager.getPostsByTag(tag)
  }
}
