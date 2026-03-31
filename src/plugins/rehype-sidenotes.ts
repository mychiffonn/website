/**
 * Rehype plugin: GFM footnotes → Tufte-style sidenotes.
 * Desktop (>= 1200px): margin notes. Mobile: CSS checkbox popup cards. Zero JS.
 *
 * 1. Collect footnote definitions from <section data-footnotes>
 * 2. Replace each <sup> footnote ref with sidenote wrapper
 * 3. Rewrite bottom footnotes section with backrefs
 */

import type { Root, Element, ElementContent } from "hast"
import { visit } from "unist-util-visit"

export interface SidenoteOptions {
  /** hast node(s) for backref links. Default: SVG arrow-curve-up icon */
  backrefContent?: ElementContent | ElementContent[]
  /** Whether to rewrite the bottom footnotes section. Default: true */
  rewriteFootnotes?: boolean
  /** Aria-label template for backrefs. {n} = footnote number. Default: "Back to reference {n}" */
  backrefLabel?: string
}

interface FootnoteRef {
  counter: number
  refId: string
}

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"])

function isElement(node: unknown): node is Element {
  return (
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    (node as { type: string }).type === "element"
  )
}

/** Strip backref <a> elements and unwrap <p> tags from footnote content. */
function cleanFootnoteContent(children: ElementContent[]): ElementContent[] {
  const result: ElementContent[] = []
  for (const child of children) {
    if (!isElement(child)) {
      result.push(child)
      continue
    }
    if (
      child.tagName === "a" &&
      child.properties &&
      ("dataFootnoteBackref" in child.properties ||
        String(child.properties.className ?? "").includes("data-footnote-backref"))
    ) {
      continue
    }
    if (child.tagName === "p") {
      result.push(...cleanFootnoteContent(child.children))
      continue
    }
    result.push({
      ...child,
      children: cleanFootnoteContent(child.children) as ElementContent[],
    })
  }
  return result
}

/** Default backref icon (arrow curve up) — visual styling in sidenote.css */
const BACKREF_ICON: Element = {
  type: "element",
  tagName: "svg",
  properties: { viewBox: "0 0 24 24", ariaHidden: "true", className: ["sidenote-backref-icon"] },
  children: [
    { type: "element", tagName: "path", properties: { d: "m10 9l5-5l5 5" }, children: [] },
    { type: "element", tagName: "path", properties: { d: "M4 20h7a4 4 0 0 0 4-4V4" }, children: [] },
  ],
}

function isInsideHeading(node: Element, parent: Element | Root | null): boolean {
  if (isElement(node) && HEADING_TAGS.has(node.tagName)) return true
  if (isElement(parent) && HEADING_TAGS.has(parent.tagName)) return true
  return false
}

function stripFnPrefix(s: string): string {
  return s.replace("user-content-fn-", "").replace("fn-", "")
}

function rehypeSidenotes(options: SidenoteOptions = {}) {
  const { rewriteFootnotes = true, backrefLabel = "Back to reference {n}", backrefContent } = options
  const backrefChildren: ElementContent[] = backrefContent
    ? Array.isArray(backrefContent) ? backrefContent : [backrefContent]
    : [{ type: "text", value: " " }, BACKREF_ICON]
  const label = (n: number) => backrefLabel.replace("{n}", String(n))

  return (tree: Root) => {
    // Pass 1: Collect footnote definitions
    const definitions = new Map<string, ElementContent[]>()
    let footnotesSection: Element | null = null

    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "section" || !node.properties || !("dataFootnotes" in node.properties))
        return
      footnotesSection = node

      const findOl = (children: ElementContent[]) => {
        for (const child of children) {
          if (isElement(child) && child.tagName === "ol") {
            for (const li of child.children) {
              if (!isElement(li) || li.tagName !== "li") continue
              const key = stripFnPrefix(String(li.properties?.id ?? ""))
              if (key) definitions.set(key, cleanFootnoteContent(li.children))
            }
          } else if (isElement(child) && child.children) {
            findOl(child.children)
          }
        }
      }
      findOl(node.children)
    })

    if (definitions.size === 0) return

    // Pass 2: Replace each footnote ref <sup> with sidenote markup
    let counter = 0
    const refMap = new Map<string, FootnoteRef>()

    visit(tree, "element", (node: Element, index, parent) => {
      if (!parent || index === undefined || node.tagName !== "sup") return

      const link = node.children.find(
        (c): c is Element =>
          isElement(c) &&
          c.tagName === "a" &&
          ("dataFootnoteRef" in (c.properties ?? {}) ||
            String(c.properties?.href ?? "").includes("#user-content-fn-") ||
            String(c.properties?.href ?? "").includes("#fn-"))
      )
      if (!link) return

      const key = stripFnPrefix(String(link.properties?.href ?? "").replace("#", ""))
      const content = definitions.get(key)
      if (!content) return

      counter++
      const snId = `sn-${counter}`
      const refId = `snref-${counter}`

      refMap.set(key, { counter, refId })

      const inHeading = isInsideHeading(node, parent as Element | Root | null)

      if (inHeading) {
        const indicator: Element = {
          type: "element",
          tagName: "span",
          properties: { className: ["sidenote-wrapper"] },
          children: [
            {
              type: "element",
              tagName: "label",
              properties: { id: refId, className: ["sidenote-toggle", "sidenote-number"] },
              children: [{ type: "text", value: String(counter) }],
            },
          ],
        }
        ;(parent as Element).children.splice(index as number, 1, indicator)
      } else {
        const backref: Element = {
          type: "element",
          tagName: "a",
          properties: { href: `#${refId}`, className: ["sidenote-backref"], ariaLabel: label(counter) },
          children: structuredClone(backrefChildren),
        }

        const wrapper: Element = {
          type: "element",
          tagName: "span",
          properties: { className: ["sidenote-wrapper"] },
          children: [
            {
              type: "element",
              tagName: "label",
              properties: { htmlFor: snId, id: refId, className: ["sidenote-toggle", "sidenote-number"] },
              children: [{ type: "text", value: String(counter) }],
            },
            {
              type: "element",
              tagName: "input",
              properties: { type: "checkbox", id: snId, className: ["sidenote-toggle-checkbox"] },
              children: [],
            },
            {
              type: "element",
              tagName: "span",
              properties: { className: ["sidenote"], id: `sn-note-${counter}`, dataSidenoteNumber: String(counter) },
              children: [...content, backref],
            },
          ],
        }
        ;(parent as Element).children.splice(index as number, 1, wrapper)
      }
    })

    // Pass 3: Rewrite bottom footnotes section
    if (rewriteFootnotes) {
      const fnSection = footnotesSection as Element | null
      if (fnSection) {
        const findOl = (children: ElementContent[]) => {
          for (const child of children) {
            if (isElement(child) && child.tagName === "ol") {
              rewriteFootnotesList(child, refMap, backrefChildren, label)
            } else if (isElement(child) && child.children) {
              findOl(child.children)
            }
          }
        }
        findOl(fnSection.children)
      }
    }
  }
}

function rewriteFootnotesList(
  ol: Element,
  refMap: Map<string, FootnoteRef>,
  backrefChildren: ElementContent[],
  label: (n: number) => string
): void {
  for (const li of ol.children) {
    if (!isElement(li) || li.tagName !== "li") continue

    const key = stripFnPrefix(String(li.properties?.id ?? ""))
    const ref = refMap.get(key)
    if (!ref) continue

    li.children = [
      ...cleanFootnoteContent(li.children),
      { type: "text", value: " " },
      {
        type: "element",
        tagName: "a",
        properties: { href: `#${ref.refId}`, className: ["footnote-backref"], ariaLabel: label(ref.counter) },
        children: structuredClone(backrefChildren),
      },
    ]
  }
}

export default rehypeSidenotes
