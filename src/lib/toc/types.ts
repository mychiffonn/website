import type { MarkdownHeading } from "astro"

/**
 * TOC heading item for components.
 * MarkdownHeading has fields depth, slug, text already.
 */
export interface TOCHeadingItem extends MarkdownHeading {
  href: string
}

/**
 * One section of a table of contents. For content with sub-parts (e.g. blog
 * subposts), each part gets its own section; for a single-page piece of
 * content (e.g. a project), there's just one section covering the page.
 */
export interface TOCSection {
  postId: string
  postTitle: string
  isSubpost: boolean
  headings: TOCHeadingItem[]
}

export interface HeadingRegion {
  id: string
  start: number
  end: number
}
