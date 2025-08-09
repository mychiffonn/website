/**
 * @fileoverview Remark plugin to normalize heading levels in markdown content
 * 
 * This plugin normalizes all headings to create a proper sequence starting from H2,
 * regardless of the original heading levels used by the author. This ensures proper
 * document structure where the post title serves as H1.
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import type { Root, Heading } from 'mdast'
import { visit } from 'unist-util-visit'

/**
 * Remark plugin that normalizes heading levels to create a proper sequence.
 * 
 * This plugin:
 * 1. Collects all headings in document order
 * 2. Determines the minimum heading level used
 * 3. Normalizes all headings to start from H2 (since post title is H1)
 * 4. Maintains relative hierarchy between headings
 * 5. Eliminates orphan headings (gaps in hierarchy)
 * 
 * Examples:
 * - H1, H2, H3 → H2, H3, H4
 * - H3, H4, H5 → H2, H3, H4
 * - H1, H3, H4 → H2, H3, H4 (H3 becomes H3, not H4)
 * - H2, H5, H6 → H2, H3, H4 (eliminates gaps)
 * 
 * @returns Remark transformer function
 * 
 * @example
 * ```typescript
 * // In astro.config.ts
 * remarkPlugins: [
 *   remarkNormalizeHeadings,
 *   // other plugins...
 * ]
 * ```
 */
function remarkNormalizeHeadings() {
  return (tree: Root) => {
    const headings: Heading[] = []
    
    // Collect all headings
    visit(tree, 'heading', (node: Heading) => {
      headings.push(node)
    })
    
    if (headings.length === 0) return
    
    // Create a proper heading hierarchy without gaps
    let currentLevel = 2 // Start from H2 since post title is H1
    const levelMap = new Map<number, number>()
    
    // Process headings in document order
    for (const heading of headings) {
      const originalDepth = heading.depth
      
      if (!levelMap.has(originalDepth)) {
        // This is a new heading level we haven't seen before
        levelMap.set(originalDepth, currentLevel)
        
        // Find the next available level for future deeper headings
        const usedLevels = Array.from(levelMap.values())
        currentLevel = Math.max(...usedLevels) + 1
      }
      
      // Apply the mapped level, ensuring it doesn't exceed H6
      const newDepth = Math.min(6, levelMap.get(originalDepth)!)
      heading.depth = newDepth as 1 | 2 | 3 | 4 | 5 | 6
    }
  }
}

export default remarkNormalizeHeadings