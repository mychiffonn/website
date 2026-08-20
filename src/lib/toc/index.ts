import type { MarkdownHeading } from "astro"

import type { TOCHeadingItem } from "./types"

export type { TOCHeadingItem, TOCSection, HeadingRegion } from "./types"
export { UnifiedTOCController } from "./scroll"

/** Filters raw markdown headings to `tocMaxDepth` and adds an in-page `href`. */
export function processRawHeadings(
  headings: MarkdownHeading[],
  tocMaxDepth: number,
): TOCHeadingItem[] {
  if (!headings?.length) return []
  return headings
    .filter((heading) => heading.depth <= tocMaxDepth)
    .map((heading) => ({
      ...heading,
      href: `#${heading.slug}`,
    }))
}

/** Get width class for TOCFloat headings */
export function getHeadingWidth(depth: number): string {
  const widths: Record<number, string> = {
    1: "w-4",
    2: "w-4",
    3: "w-3",
    4: "w-2",
    5: "w-1.5",
    6: "w-1",
  }
  return widths[depth] || "w-2"
}
