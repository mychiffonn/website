import type { Element, ElementContent, RootContent } from "hast"
import { defineHastPlugin } from "satteri"

export interface SidenoteOptions {
  backrefContent?: ElementContent | ElementContent[]
  rewriteFootnotes?: boolean
  backrefLabel?: string
}

interface FootnoteRef {
  counter: number
  refId: string
}

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"])

const BACKREF_ICON: Element = {
  type: "element",
  tagName: "svg",
  properties: {
    viewBox: "0 0 24 24",
    ariaHidden: "true",
    className: ["sidenote-backref-icon"],
  },
  children: [
    {
      type: "element",
      tagName: "path",
      properties: { d: "m10 9l5-5l5 5" },
      children: [],
    },
    {
      type: "element",
      tagName: "path",
      properties: { d: "M4 20h7a4 4 0 0 0 4-4V4" },
      children: [],
    },
  ],
}

function isElement(node: unknown): node is Element {
  return (
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    (node as { type: string }).type === "element"
  )
}

function hasProperty(node: Element, key: string): boolean {
  return !!node.properties && key in node.properties
}

function stripFnPrefix(value: string): string {
  return value.replace("user-content-fn-", "").replace("fn-", "")
}

function cloneNode<T extends RootContent>(node: T): T {
  return structuredClone(node)
}

function cleanFootnoteContent(children: readonly RootContent[]): RootContent[] {
  const result: RootContent[] = []

  for (const child of children) {
    if (!isElement(child)) {
      result.push(cloneNode(child))
      continue
    }

    if (
      child.tagName === "a" &&
      (hasProperty(child, "dataFootnoteBackref") ||
        String(child.properties?.className ?? "").includes(
          "data-footnote-backref",
        ))
    ) {
      continue
    }

    if (child.tagName === "p") {
      result.push(...cleanFootnoteContent(child.children))
      continue
    }

    result.push({
      ...cloneNode(child),
      children: cleanFootnoteContent(child.children) as ElementContent[],
    })
  }

  return result
}

function collectDefinitions(
  children: readonly RootContent[],
  definitions: Map<string, RootContent[]>,
): void {
  for (const child of children) {
    if (!isElement(child)) continue

    if (child.tagName === "ol") {
      for (const item of child.children) {
        if (!isElement(item) || item.tagName !== "li") continue
        const key = stripFnPrefix(String(item.properties?.id ?? ""))
        if (key) definitions.set(key, cleanFootnoteContent(item.children))
      }
      continue
    }

    collectDefinitions(child.children, definitions)
  }
}

function makeBackref(
  counter: number,
  refId: string,
  label: (n: number) => string,
  backrefChildren: ElementContent[],
): Element {
  return {
    type: "element",
    tagName: "a",
    properties: {
      href: `#${refId}`,
      className: ["sidenote-backref"],
      ariaLabel: label(counter),
    },
    children: structuredClone(backrefChildren),
  }
}

function findFootnoteLink(children: readonly RootContent[]): Element | null {
  for (const child of children) {
    if (
      isElement(child) &&
      child.tagName === "a" &&
      (hasProperty(child, "dataFootnoteRef") ||
        String(child.properties?.href ?? "").includes("#user-content-fn-") ||
        String(child.properties?.href ?? "").includes("#fn-"))
    ) {
      return child
    }
  }
  return null
}

function isInsideHeading(
  node: Element,
  parent: RootContent | undefined,
): boolean {
  return (
    HEADING_TAGS.has(node.tagName) ||
    (isElement(parent) && HEADING_TAGS.has(parent.tagName))
  )
}

function rewriteFootnotesList(
  ol: Element,
  refMap: Map<string, FootnoteRef>,
  backrefChildren: ElementContent[],
  label: (n: number) => string,
): ElementContent[] {
  return ol.children.map((child: ElementContent) => {
    if (!isElement(child) || child.tagName !== "li") {
      return cloneNode(child)
    }

    const key = stripFnPrefix(String(child.properties?.id ?? ""))
    const ref = refMap.get(key)
    if (!ref) return cloneNode(child)

    return {
      ...cloneNode(child),
      children: [
        ...cleanFootnoteContent(child.children),
        { type: "text", value: " " },
        {
          type: "element",
          tagName: "a",
          properties: {
            href: `#${ref.refId}`,
            className: ["footnote-backref"],
            ariaLabel: label(ref.counter),
          },
          children: structuredClone(backrefChildren),
        },
      ],
    }
  }) as ElementContent[]
}

function rewriteFootnoteChildren(
  children: readonly RootContent[],
  refMap: Map<string, FootnoteRef>,
  backrefChildren: ElementContent[],
  label: (n: number) => string,
): RootContent[] {
  return children.map((child) => {
    if (!isElement(child)) return cloneNode(child)

    if (child.tagName === "ol") {
      return {
        ...cloneNode(child),
        children: rewriteFootnotesList(child, refMap, backrefChildren, label),
      }
    }

    return {
      ...cloneNode(child),
      children: rewriteFootnoteChildren(
        child.children,
        refMap,
        backrefChildren,
        label,
      ) as ElementContent[],
    }
  })
}

export function rehypeSidenotes(options: SidenoteOptions = {}) {
  const {
    rewriteFootnotes = true,
    backrefLabel = "Back to reference {n}",
    backrefContent,
  } = options

  const definitions = new Map<string, RootContent[]>()
  const refMap = new Map<string, FootnoteRef>()
  const backrefChildren: ElementContent[] = backrefContent
    ? Array.isArray(backrefContent)
      ? backrefContent
      : [backrefContent]
    : [{ type: "text", value: " " }, BACKREF_ICON]
  const label = (n: number) => backrefLabel.replace("{n}", String(n))

  return [
    defineHastPlugin({
      name: "sidenotes-collect-footnotes",
      element: {
        filter: ["section"],
        visit(node) {
          if (!hasProperty(node, "dataFootnotes")) return
          collectDefinitions(node.children, definitions)
        },
      },
    }),
    defineHastPlugin({
      name: "sidenotes-replace-references",
      element: {
        filter: ["sup"],
        visit(node, ctx) {
          const link = findFootnoteLink(node.children)
          if (!link) return

          const key = stripFnPrefix(
            String(link.properties?.href ?? "").replace("#", ""),
          )
          const content = definitions.get(key)
          if (!content) return

          const counter = refMap.size + 1
          const snId = `sn-${counter}`
          const refId = `snref-${counter}`
          refMap.set(key, { counter, refId })

          const parent = ctx.parent(node)
          if (isInsideHeading(node, parent as RootContent | undefined)) {
            ctx.replaceNode(node, {
              type: "element",
              tagName: "span",
              properties: { className: ["sidenote-wrapper"] },
              children: [
                {
                  type: "element",
                  tagName: "label",
                  properties: {
                    id: refId,
                    className: ["sidenote-toggle", "sidenote-number"],
                  },
                  children: [{ type: "text", value: String(counter) }],
                },
              ],
            })
            return
          }

          ctx.replaceNode(node, {
            type: "element",
            tagName: "span",
            properties: { className: ["sidenote-wrapper"] },
            children: [
              {
                type: "element",
                tagName: "label",
                properties: {
                  htmlFor: snId,
                  id: refId,
                  className: ["sidenote-toggle", "sidenote-number"],
                },
                children: [{ type: "text", value: String(counter) }],
              },
              {
                type: "element",
                tagName: "input",
                properties: {
                  type: "checkbox",
                  id: snId,
                  className: ["sidenote-toggle-checkbox"],
                },
                children: [],
              },
              {
                type: "element",
                tagName: "span",
                properties: {
                  className: ["sidenote"],
                  id: `sn-note-${counter}`,
                  dataSidenoteNumber: String(counter),
                },
                children: [
                  ...(structuredClone(content) as ElementContent[]),
                  makeBackref(counter, refId, label, backrefChildren),
                ],
              },
            ],
          })
        },
      },
    }),
    defineHastPlugin({
      name: "sidenotes-rewrite-footnote-list",
      element: {
        filter: ["section"],
        visit(node, ctx) {
          if (!rewriteFootnotes || !hasProperty(node, "dataFootnotes")) return
          ctx.setProperty(
            node,
            "children",
            rewriteFootnoteChildren(
              node.children,
              refMap,
              backrefChildren,
              label,
            ),
          )
        },
      },
    }),
  ]
}

export default rehypeSidenotes
