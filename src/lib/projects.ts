import { getCollection, type CollectionEntry } from 'astro:content'
import { PROJECT_LINK_TYPES, type ProjectLinkType } from '@icon-config'

export type Project = CollectionEntry<'projects'>

// ========================================
// Project Link Utilities
// ========================================

export const getProjectLinks = (repo?: string, doc?: string, url?: string, release?: string) => {
  const linkData = [
    { type: 'repo' as const, href: repo },
    { type: 'doc' as const, href: doc },
    { type: 'url' as const, href: url },
    { type: 'release' as const, href: release }
  ]

  return linkData
    .filter((link): link is { type: ProjectLinkType; href: string } => !!link.href)
    .map((link) => ({
      type: link.type,
      href: link.href,
      icon: PROJECT_LINK_TYPES[link.type].iconName,
      label: PROJECT_LINK_TYPES[link.type].label
    }))
}

export const hasProjectContent = (project: { body?: string }): boolean => {
  return !!(project.body && project.body.trim().length > 0)
}

export const getProjectDescription = (project: CollectionEntry<'projects'>) => {
  // First try to use description from frontmatter
  if (project.data.description) {
    return {
      text: project.data.description,
      needsReadMore: false
    }
  }

  // Fall back to first 150 characters of body content
  if (project.body && project.body.trim().length > 0) {
    const bodyText = project.body.trim()
    const needsTruncation = bodyText.length > 150
    const text = needsTruncation ? bodyText.substring(0, 150) + '...' : bodyText

    return {
      text,
      needsReadMore: needsTruncation
    }
  }

  return null
}

export const getContextVariant = (context?: string) => {
  switch (context) {
    case 'school':
      return 'default'
    case 'work':
      return 'outline'
    case 'personal':
      return 'secondary'
    case 'collab':
      return 'destructive'
    default:
      return 'secondary'
  }
}

// ========================================
// Project Data Management
// ========================================

/**
 * Sorts projects by priority (highlighted first, then by date).
 *
 * @param projects - Array of projects to sort
 * @returns Sorted array of projects
 */
export function sortProjectsByPriority(projects: Project[]): Project[] {
  return projects.sort((a, b) => {
    // First, prioritize highlighted projects
    if (a.data.isHighlighted && !b.data.isHighlighted) return -1
    if (!a.data.isHighlighted && b.data.isHighlighted) return 1

    // Then sort by date (most recent first)
    const dateA = a.data.toDate || a.data.fromDate || new Date(0)
    const dateB = b.data.toDate || b.data.fromDate || new Date(0)
    return dateB.getTime() - dateA.getTime()
  })
}

/**
 * Filters projects into featured and other categories.
 *
 * @param projects - Array of projects to categorize
 * @returns Object with featuredProjects and otherProjects arrays
 */
export function categorizeProjects(projects: Project[]) {
  const featuredProjects = projects.filter(project => project.data.isHighlighted)
  const otherProjects = projects.filter(project => !project.data.isHighlighted)

  return { featuredProjects, otherProjects }
}

// Cache for projects to avoid repeated fetching across pages
let projectsCache: Project[] | null = null

/**
 * Gets all projects with caching and optional filtering at the collection level.
 *
 * @param filter - Optional filter function to apply at collection level
 * @returns Promise resolving to filtered and sorted projects
 */
export async function getProjects(filter?: (project: Project) => boolean): Promise<Project[]> {
  // Use cache if available and no filter is provided
  if (!filter && projectsCache) {
    return projectsCache
  }

  // Fetch from collection with optional filtering
  const projects = filter
    ? await getCollection('projects', filter)
    : await getCollection('projects')

  const sortedProjects = sortProjectsByPriority(projects)

  // Cache only unfiltered results
  if (!filter) {
    projectsCache = sortedProjects
  }

  return sortedProjects
}

/**
 * Gets projects optimized for the index page (featured/other split).
 */
export async function getProjectsForIndex() {
  const projects = await getProjects()
  return categorizeProjects(projects)
}

/**
 * Gets projects optimized for static path generation.
 * Only returns projects that have content.
 */
export async function getProjectsWithContent(hasContentFn: (project: { body?: string }) => boolean) {
  // Filter at collection level for better performance
  return await getProjects(project => hasContentFn(project))
}
