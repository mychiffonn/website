import { getCollection, type CollectionEntry } from "astro:content"

import { PROJECT_LINK_TYPES, type ProjectLinkType } from "@icon-config"

export type Project = CollectionEntry<"projects">

// ========================================
// Project Utilities
// ========================================

export const getProjectLinks = (repo?: string, doc?: string, url?: string, release?: string) => {
  const linkData = [
    { type: "repo" as const, href: repo },
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

/** Use with badge components to get variant based on project context */
export const getContextVariant = (context?: string) => {
  switch (context) {
    case "personal":
      return "default"
    case "work":
      return "outline"
    case "school":
      return "muted"
    case "community":
    case "research":
      return "accent"
    default:
      return "muted"
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
export function sortProjects(projects: Project[]): Project[] {
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
