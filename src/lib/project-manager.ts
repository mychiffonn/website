import { getCollection, type CollectionEntry } from 'astro:content'

export type Project = CollectionEntry<'projects'>

export class ProjectManager {
  private static instance: ProjectManager
  private cache: Project[] | null = null

  private constructor() {}

  static getInstance(): ProjectManager {
    if (!ProjectManager.instance) {
      ProjectManager.instance = new ProjectManager()
    }
    return ProjectManager.instance
  }

  private async initializeCache(): Promise<void> {
    if (this.cache !== null) return

    const projects = await getCollection('projects')

    // Sort projects by toDate (most recent first)
    this.cache = projects.sort((a, b) => {
      const dateA = a.data.toDate?.getTime() || 0
      const dateB = b.data.toDate?.getTime() || 0
      return dateB - dateA
    })
  }

  async getAllProjects(): Promise<Project[]> {
    await this.initializeCache()
    return [...this.cache!]
  }

  async getProjectById(projectId: string): Promise<Project | null> {
    await this.initializeCache()
    return this.cache!.find(project => project.id === projectId) || null
  }

  async getHighlightedProjects(): Promise<Project[]> {
    await this.initializeCache()
    return this.cache!.filter(project => project.data.isHighlighted)
  }

  async getProjectsByContext(context: string): Promise<Project[]> {
    await this.initializeCache()
    return this.cache!.filter(project => project.data.context === context)
  }

  async getProjectsByTag(tag: string): Promise<Project[]> {
    await this.initializeCache()
    return this.cache!.filter(project =>
      project.data.tags?.some(projectTag =>
        projectTag.toLowerCase() === tag.toLowerCase()
      )
    )
  }

  async getRecentProjects(count: number): Promise<Project[]> {
    const projects = await this.getAllProjects()
    return projects.slice(0, count)
  }
}
