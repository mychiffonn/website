import type { MarkdownHeading } from "astro"
import { render } from "astro:content"

import { processRawHeadings } from "@/lib/toc"
import type { Post, PostManager, TOCSection } from "./types"

async function extractAndProcessHeadings(
  post: Post,
  tocMaxDepth: number,
): Promise<ReturnType<typeof processRawHeadings>> {
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
  preRenderedHeadings?: MarkdownHeading[],
): Promise<TOCSection[]> {
  if (tocMaxDepth <= 0) return []

  const post = await postManager.getPostById(postId)
  if (!post) return []

  const isSubpostPost = postManager.isSubpost(postId)
  const parentId = isSubpostPost ? postManager.getParentId(postId) : postId

  const parentPost = isSubpostPost
    ? await postManager.getPostById(parentId)
    : post
  if (!parentPost) return []

  const [parentHeadings, subposts] = await Promise.all([
    parentId === postId && preRenderedHeadings
      ? processRawHeadings(preRenderedHeadings, tocMaxDepth)
      : extractAndProcessHeadings(parentPost, tocMaxDepth),
    postManager.getSubpostsByParent(parentId),
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
        headings,
      }
    },
  )

  const subpostResults = await Promise.all(subpostSectionsPromises)
  const subpostSections = subpostResults.filter(
    (section): section is TOCSection => section !== null,
  )

  const sections: TOCSection[] = []

  if (parentHeadings.length > 0) {
    sections.push({
      postId: parentId,
      postTitle: parentPost.data.title,
      isSubpost: false,
      headings: parentHeadings,
    })
  }

  if (subpostSections.length > 0) {
    sections.push(...subpostSections)
  }

  return sections
}
