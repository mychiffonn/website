import type { MarkdownHeading } from "astro"
import { render } from "astro:content"

import type { Post, PostManager, TOCHeadingItem, TOCSection } from "./types"

function processRawHeadings(headings: MarkdownHeading[], tocMaxDepth: number): TOCHeadingItem[] {
  if (!headings?.length) return []
  return headings
    .filter((heading) => heading.depth <= tocMaxDepth)
    .map((heading) => ({
      ...heading,
      href: `#${heading.slug}`
    }))
}

async function extractAndProcessHeadings(
  post: Post,
  tocMaxDepth: number
): Promise<TOCHeadingItem[]> {
  try {
    const { headings } = await render(post)
    return processRawHeadings(headings, tocMaxDepth)
  } catch (error) {
    console.warn(`Failed to extract headings from post ${post.id}:`, error)
    return []
  }
}

/**
 * Gets table of contents sections for a post, including parent and subpost headings.
 *
 * When `preRenderedHeadings` is provided for `postId`, skips the redundant `render()` call
 * for that post (the page already rendered it for `<Content />`).
 */
export async function getTOCSections(
  postId: string,
  postManager: PostManager,
  tocMaxDepth: number,
  preRenderedHeadings?: MarkdownHeading[]
): Promise<TOCSection[]> {
  if (tocMaxDepth <= 0) return []

  const post = await postManager.getPostById(postId)
  if (!post) return []

  const isSubpostPost = postManager.isSubpost(postId)
  const parentId = isSubpostPost ? postManager.getParentId(postId) : postId

  const parentPost = isSubpostPost ? await postManager.getPostById(parentId) : post
  if (!parentPost) return []

  const [parentHeadings, subposts] = await Promise.all([
    parentId === postId && preRenderedHeadings
      ? processRawHeadings(preRenderedHeadings, tocMaxDepth)
      : extractAndProcessHeadings(parentPost, tocMaxDepth),
    postManager.getSubpostsByParent(parentId)
  ])

  if (parentHeadings.length === 0 && subposts.length === 0) return []

  const subpostSectionsPromises = subposts.map(
    async (subpost: Post): Promise<TOCSection | null> => {
      const headings =
        subpost.id === postId && preRenderedHeadings
          ? processRawHeadings(preRenderedHeadings, tocMaxDepth)
          : await extractAndProcessHeadings(subpost, tocMaxDepth)

      if (headings.length === 0) return null

      return {
        postId: subpost.id,
        postTitle: subpost.data.title,
        isSubpost: true,
        headings
      }
    }
  )

  const subpostResults = await Promise.all(subpostSectionsPromises)
  const subpostSections = subpostResults.filter(
    (section): section is TOCSection => section !== null
  )

  const sections: TOCSection[] = []

  if (parentHeadings.length > 0) {
    sections.push({
      postId: parentId,
      postTitle: parentPost.data.title,
      isSubpost: false,
      headings: parentHeadings
    })
  }

  if (subpostSections.length > 0) {
    sections.push(...subpostSections)
  }

  return sections
}

export function getActiveSections(sections: TOCSection[], activeHeadingIds: string[]): Set<string> {
  const activeSections = new Set<string>()
  const activeIdSet = new Set(activeHeadingIds)

  for (const section of sections) {
    const hasActiveHeading = section.headings.some((heading) => activeIdSet.has(heading.slug))

    if (hasActiveHeading) {
      activeSections.add(section.postId)
    }
  }

  return activeSections
}

export function getTOCUrl(
  heading: { slug: string },
  section: TOCSection,
  isActiveSection: boolean
): string {
  if (isActiveSection) {
    return `#${heading.slug}`
  }
  return `/blog/${section.postId}#${heading.slug}`
}

/** Get margin class for TOCHeadingLink headings */
export function getHeadingMargin(depth: number): string {
  const margins: Record<number, string> = {
    2: "",
    3: "ml-4",
    4: "ml-8",
    5: "ml-12",
    6: "ml-16"
  }
  return margins[depth] || ""
}

/** Get width class for TOCFloat headings */
export function getHeadingWidth(depth: number): string {
  const widths: Record<number, string> = {
    1: "w-4",
    2: "w-4",
    3: "w-3",
    4: "w-2",
    5: "w-1.5",
    6: "w-1"
  }
  return widths[depth] || "w-2"
}
