import type { Heading } from "mdast"
import { defineMdastPlugin } from "satteri"

type HeadingDepth = Heading["depth"]

/**
 * Normalize authored Markdown headings so page templates can own the H1.
 *
 * Satteri visitors are called in document order, so this keeps the original
 * v1 behavior without unified's tree walker: the first heading depth observed
 * becomes H2, each newly encountered deeper source depth gets the next level,
 * and emitted headings are capped at H6.
 */
export function remarkNormalizeHeadings() {
  let currentLevel: HeadingDepth = 2
  const levelMap = new Map<HeadingDepth, HeadingDepth>()

  return defineMdastPlugin({
    name: "normalize-headings",
    heading(node, ctx) {
      const originalDepth = node.depth

      if (!levelMap.has(originalDepth)) {
        levelMap.set(originalDepth, currentLevel)
        currentLevel = Math.min(
          6,
          Math.max(...Array.from(levelMap.values())) + 1,
        ) as HeadingDepth
      }

      const nextDepth = levelMap.get(originalDepth)
      if (nextDepth && nextDepth !== originalDepth) {
        ctx.setProperty(node, "depth", nextDepth)
      }
    },
  })
}
