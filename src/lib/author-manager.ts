import { getCollection, type CollectionEntry } from 'astro:content'

export type Author = CollectionEntry<'authors'>

export class AuthorManager {
  private static instance: AuthorManager
  private cache: Author[] | null = null

  private constructor() {}

  static getInstance(): AuthorManager {
    if (!AuthorManager.instance) {
      AuthorManager.instance = new AuthorManager()
    }
    return AuthorManager.instance
  }

  private async initializeCache(): Promise<void> {
    if (this.cache !== null) return

    console.log('🚀 Initializing AuthorManager cache...')
    this.cache = await getCollection('authors')
    console.log(`✅ AuthorManager cache initialized: ${this.cache.length} authors`)
  }

  async getAllAuthors(): Promise<Author[]> {
    await this.initializeCache()
    return this.cache!
  }

  async getAuthorById(authorId: string): Promise<Author | null> {
    await this.initializeCache()
    return this.cache!.find(author => author.id === authorId) || null
  }

  async getAuthorsByIds(authorIds: string[]): Promise<Author[]> {
    await this.initializeCache()
    return this.cache!.filter(author => authorIds.includes(author.id))
  }
}