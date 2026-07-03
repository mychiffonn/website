import { getCollection, type CollectionEntry } from "astro:content"

import { PROJECT_CATEGORIES } from "@/schemas"

import { PROJECT_LINK_TYPES, type ProjectLinkType } from "@icon-config"

export type Project = CollectionEntry<"projects">

// ========================================
// Project Utilities
// ========================================

export const getProjectLinks = (code?: string, doc?: string, url?: string, release?: string) => {
  const linkData = [
    { type: "code" as const, href: code },
    { type: "doc" as const, href: doc },
    { type: "url" as const, href: url },
    { type: "release" as const, href: release }
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

/** Human-readable label for a project category slug */
export const getCategoryLabel = (slug: string) =>
  PROJECT_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug

/**
 * Counts how many projects fall under each category, for rendering the
 * category filter bar on the projects page.
 *
 * @param projects - Array of projects to count categories for
 * @returns Categories with at least one project, sorted by count (desc) then label
 */
export function getProjectCategoryCounts(projects: Project[]) {
  const counts = new Map<string, number>()
  for (const project of projects) {
    for (const category of project.data.category ?? []) {
      counts.set(category, (counts.get(category) || 0) + 1)
    }
  }

  return PROJECT_CATEGORIES.map(({ slug, label }) => ({
    slug,
    label,
    count: counts.get(slug) || 0
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
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
export function sortProjects(projects: Project[]): Project[] {
  return projects.sort((a, b) => {
    // First, prioritize highlighted projects
    if (a.data.isHighlighted && !b.data.isHighlighted) return -1
    if (!a.data.isHighlighted && b.data.isHighlighted) return 1

    // Then sort by end date (most recent first); ongoing projects rank highest.
    const ongoingSentinel = new Date(8640000000000000)
    const endDateA = a.data.toDate ?? (a.data.fromDate ? ongoingSentinel : new Date(0))
    const endDateB = b.data.toDate ?? (b.data.fromDate ? ongoingSentinel : new Date(0))
    const endDelta = endDateB.getTime() - endDateA.getTime()
    if (endDelta !== 0) return endDelta

    // Fall back to start date for consistent ordering among ongoing projects.
    const startDateA = a.data.fromDate || new Date(0)
    const startDateB = b.data.fromDate || new Date(0)
    return startDateB.getTime() - startDateA.getTime()
  })
}

/**
 * Gets all projects with optional filtering at the collection level.
 *
 * @param filter - Optional filter function to apply at collection level
 * @returns Promise resolving to filtered and sorted projects
 */
export async function getProjects(filter?: (project: Project) => boolean): Promise<Project[]> {
  // Fetch from collection with optional filtering
  const projects = filter
    ? await getCollection("projects", filter)
    : await getCollection("projects")

  return sortProjects(projects)
}

export interface ProjectNavigation {
  prev: Project | null
  next: Project | null
}

export async function getProjectNavigation(currentId: string): Promise<ProjectNavigation> {
  const projects = await getProjects((project) => !!project.body?.trim())
  const currentIndex = projects.findIndex((p) => p.id === currentId)
  if (currentIndex === -1) return { prev: null, next: null }
  return {
    prev: currentIndex > 0 ? projects[currentIndex - 1] : null,
    next: currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null
  }
}
