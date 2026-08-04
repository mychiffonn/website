import { getCollection, type CollectionEntry } from "astro:content"

import { PROJECT_TYPES } from "@/schemas"
import { slugify } from "@/lib/string-manipulation"

import { PROJECT_LINK_TYPES, type ProjectLinkType } from "@icon-config"

export type Project = CollectionEntry<"projects">

export const getProjectTypeLabel = (slug: string) =>
  PROJECT_TYPES.find((type) => type.slug === slug)?.label ?? slug

// ========================================
// Project Utilities
// ========================================

export const getProjectLinks = (
  code?: string,
  doc?: string,
  paper?: string,
  url?: string,
  release?: string,
) => {
  const linkData = [
    { type: "code" as const, href: code },
    { type: "doc" as const, href: doc },
    { type: "paper" as const, href: paper },
    { type: "url" as const, href: url },
    { type: "release" as const, href: release },
  ]

  return linkData
    .filter(
      (link): link is { type: ProjectLinkType; href: string } => !!link.href,
    )
    .map((link) => ({
      type: link.type,
      href: link.href,
      icon: PROJECT_LINK_TYPES[link.type].iconName,
      label: PROJECT_LINK_TYPES[link.type].label,
    }))
}

export function getProjectSkillCounts(projects: Project[], minimum = 2) {
  const counts = new Map<string, { label: string; count: number }>()
  for (const project of projects) {
    for (const label of project.data.skills) {
      const slug = slugify(label)
      const current = counts.get(slug)
      counts.set(slug, { label, count: (current?.count || 0) + 1 })
    }
  }

  return [...counts.entries()]
    .map(([slug, value]) => ({ slug, ...value }))
    .filter(({ count }) => count >= minimum)
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
function sortProjects(projects: Project[]): Project[] {
  return projects.sort((a, b) => {
    // First, prioritize highlighted projects
    if (a.data.selected && !b.data.selected) return -1
    if (!a.data.selected && b.data.selected) return 1

    // Then sort by end date (most recent first); ongoing projects rank highest.
    const ongoingSentinel = new Date(8640000000000000)
    const endDateA =
      a.data.toDate ?? (a.data.fromDate ? ongoingSentinel : new Date(0))
    const endDateB =
      b.data.toDate ?? (b.data.fromDate ? ongoingSentinel : new Date(0))
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
export async function getProjects(
  filter?: (project: Project) => boolean,
): Promise<Project[]> {
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

export async function getProjectNavigation(
  currentId: string,
): Promise<ProjectNavigation> {
  const projects = await getProjects((project) => !!project.body?.trim())
  const currentIndex = projects.findIndex((p) => p.id === currentId)
  if (currentIndex === -1) return { prev: null, next: null }
  return {
    prev: currentIndex > 0 ? projects[currentIndex - 1] : null,
    next:
      currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null,
  }
}
