import type { CollectionEntry } from "astro:content"

const projectLinkDefinitions = {
  repo: { label: 'Repository', iconName: 'mingcute:github-line' },
  doc: { label: 'Documentation', iconName: 'mingcute:book-line' },
  url: { label: 'Website', iconName: 'mingcute:external-link-line' },
  release: { label: 'Release', iconName: 'mingcute:download-line' }
} as const

export const getProjectLinks = (repo?: string, doc?: string, url?: string, release?: string) => {
  const linkData = [
    { type: 'repo' as const, href: repo },
    { type: 'doc' as const, href: doc },
    { type: 'url' as const, href: url },
    { type: 'release' as const, href: release }
  ]

  return linkData
    .filter((link) => link.href)
    .map((link) => ({
      type: link.type,
      href: link.href!,
      icon: projectLinkDefinitions[link.type].iconName,
      label: projectLinkDefinitions[link.type].label
    }))
}

export const hasProjectContent = (project: { body?: string }) => {
  return project.body && project.body.trim().length > 0
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
