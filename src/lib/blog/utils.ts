import { SITE } from "@site-config"

import type { Post } from "./types"

/**
 * Calculates word count from HTML content, excluding code blocks and math expressions.
 * Uses Intl.Segmenter for accurate Unicode support with fallback for older environments.
 */
export function calculateWordCountFromHtml(html: string | null | undefined): number {
  if (!html) return 0

  let content = html
    .replace(/<pre[^>]*>.*?<\/pre>/gs, "")
    .replace(/<code[^>]*>.*?<\/code>/g, "")
    .replace(/\$\$.*?\$\$/g, "")
    .replace(/\$.*?\$/g, "")
    .replace(/<[^>]+>/g, "")

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const segmenter = new Intl.Segmenter(SITE.locale.lang, { granularity: "word" })
      const segments = Array.from(segmenter.segment(content))
      return segments.filter((segment) => segment.isWordLike).length
    } catch {
      // Fall through to fallback
    }
  }

  const latinWords = content.match(/[a-zA-Z]+/g)?.length || 0
  const cjkChars =
    content.match(/[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff]/g)?.length || 0
  const arabicWords = content.match(/[\u0600-\u06ff]+/g)?.length || 0
  const cyrillicWords = content.match(/[\u0400-\u04ff]+/g)?.length || 0
  const hebrewWords = content.match(/[\u0590-\u05ff]+/g)?.length || 0

  return latinWords + cjkChars + arabicWords + cyrillicWords + hebrewWords
}

export function calculateWordCountFromPost(post: Post): number {
  return calculateWordCountFromHtml(post.rendered?.html ?? "")
}

export function isSubpost(postId: string): boolean {
  return postId.includes("/")
}

export function getParentId(subpostId: string): string {
  return subpostId.split("/")[0]
}

export function sortByDateDesc<T extends { data: { createdAt: Date } }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.data.createdAt.valueOf() - a.data.createdAt.valueOf())
}

export function formatSubpostCount(count: number): string {
  return `${count} subpost${count === 1 ? "" : "s"}`
}

export function generatePostHref(postId: string, baseUrl: string): string {
  return `${baseUrl}/${postId}`
}

export function getPostIconName(
  isActive: boolean,
  isSubpost: boolean
): "post-active" | "subpost" | "parent-post" {
  if (isActive) return "post-active"
  return isSubpost ? "subpost" : "parent-post"
}
