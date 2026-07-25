import type { Element, ElementContent, RootContent } from "hast"
import {
  defineHastPlugin,
  type HastPluginInput,
  type HastVisitorContext,
} from "satteri"

export interface SidenoteOptions {
  backrefContent?: ElementContent | ElementContent[]
  rewriteFootnotes?: boolean
  backrefLabel?: string
}

interface FootnoteReference {
  counter: number
  refIds: string[]
}

interface SidenoteState {
  definitions: Map<string, RootContent[]>
  references: Map<string, FootnoteReference>
}

const STATE_KEY = "astroScholarSidenotes"
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

function getState(ctx: HastVisitorContext): SidenoteState {
  const existing = ctx.data[STATE_KEY]
  if (existing) return existing as SidenoteState

  const state: SidenoteState = {
    definitions: new Map(),
    references: new Map(),
  }
  ctx.data[STATE_KEY] = state
  return state
}

function footnoteKey(value: string): string {
  return value.replace(/^#/, "").replace(/^(?:user-content-)?fn-/, "")
}

function cloneNode<T extends RootContent>(node: T): T {
  return structuredClone(node)
}

function isGeneratedBackref(node: Element): boolean {
  return (
    node.tagName === "a" &&
    (hasProperty(node, "dataFootnoteBackref") ||
      String(node.properties?.className ?? "").includes(
        "data-footnote-backref",
      ))
  )
}

function cleanFootnoteContent(children: readonly RootContent[]): RootContent[] {
  const result: RootContent[] = []

  for (const child of children) {
    if (!isElement(child)) {
      result.push(cloneNode(child))
      continue
    }

    if (isGeneratedBackref(child)) continue

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
        const key = footnoteKey(String(item.properties?.id ?? ""))
        if (key) definitions.set(key, cleanFootnoteContent(item.children))
      }
      continue
    }

    collectDefinitions(child.children, definitions)
  }
}

function findFootnoteLink(children: readonly RootContent[]): Element | null {
  for (const child of children) {
    if (
      isElement(child) &&
      child.tagName === "a" &&
      (hasProperty(child, "dataFootnoteRef") ||
        /^#(?:user-content-)?fn-/.test(String(child.properties?.href ?? "")))
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

function makeBackref(
  counter: number,
  refId: string,
  className: string,
  label: (n: number) => string,
  children: ElementContent[],
): Element {
  return {
    type: "element",
    tagName: "a",
    properties: {
      href: `#${refId}`,
      className: [className],
      ariaLabel: label(counter),
    },
    children: structuredClone(children),
  }
}

function rewriteFootnotesList(
  ol: Element,
  references: Map<string, FootnoteReference>,
  backrefChildren: ElementContent[],
  label: (n: number) => string,
): ElementContent[] {
  return ol.children.map((child: ElementContent) => {
    if (!isElement(child) || child.tagName !== "li") {
      return cloneNode(child)
    }

    const reference = references.get(
      footnoteKey(String(child.properties?.id ?? "")),
    )
    if (!reference) return cloneNode(child)

    const backrefs = reference.refIds.flatMap<ElementContent>(
      (refId, index) => [
        ...(index === 0 ? [{ type: "text" as const, value: " " }] : []),
        makeBackref(
          reference.counter,
          refId,
          "footnote-backref",
          label,
          backrefChildren,
        ),
      ],
    )

    return {
      ...cloneNode(child),
      children: [...cleanFootnoteContent(child.children), ...backrefs],
    }
  }) as ElementContent[]
}

function rewriteFootnoteChildren(
  children: readonly RootContent[],
  state: SidenoteState,
  rewriteFootnotes: boolean,
  backrefChildren: ElementContent[],
  label: (n: number) => string,
): RootContent[] {
  return children.map((child) => {
    if (!isElement(child)) return cloneNode(child)

    if (child.tagName === "h2" && child.properties?.id === "footnote-label") {
      return {
        ...cloneNode(child),
        tagName: "div",
      }
    }

    if (rewriteFootnotes && child.tagName === "ol") {
      return {
        ...cloneNode(child),
        children: rewriteFootnotesList(
          child,
          state.references,
          backrefChildren,
          label,
        ),
      }
    }

    return {
      ...cloneNode(child),
      children: rewriteFootnoteChildren(
        child.children,
        state,
        rewriteFootnotes,
        backrefChildren,
        label,
      ) as ElementContent[],
    }
  })
}

/**
 * Convert Sätteri's GFM footnotes into responsive sidenotes.
 *
 * Sätteri reuses plugin definitions between documents, so the three passes use
 * its document-local `ctx.data` bag instead of closure state.
 */
export function satteriSidenotes(
  options: SidenoteOptions = {},
): HastPluginInput[] {
  const {
    rewriteFootnotes = true,
    backrefLabel = "Back to reference {n}",
    backrefContent,
  } = options
  const backrefChildren: ElementContent[] = backrefContent
    ? Array.isArray(backrefContent)
      ? backrefContent
      : [backrefContent]
    : [{ type: "text", value: " " }, BACKREF_ICON]
  const label = (n: number) => backrefLabel.replace("{n}", String(n))

  return [
    () =>
      defineHastPlugin({
        name: "sidenotes-collect-footnotes",
        element: {
          filter: ["section"],
          visit(node, ctx) {
            if (!hasProperty(node, "dataFootnotes")) return
            collectDefinitions(node.children, getState(ctx).definitions)
          },
        },
      }),
    () =>
      defineHastPlugin({
        name: "sidenotes-replace-references",
        element: {
          filter: ["sup"],
          visit(node, ctx) {
            const link = findFootnoteLink(node.children)
            if (!link) return

            const state = getState(ctx)
            const key = footnoteKey(String(link.properties?.href ?? ""))
            const content = state.definitions.get(key)
            if (!content) return

            let reference = state.references.get(key)
            if (!reference) {
              reference = {
                counter: state.references.size + 1,
                refIds: [],
              }
              state.references.set(key, reference)
            }

            const occurrence = reference.refIds.length + 1
            const suffix = occurrence === 1 ? "" : `-${occurrence}`
            const snId = `sn-${reference.counter}${suffix}`
            const refId = `snref-${reference.counter}${suffix}`
            reference.refIds.push(refId)

            const parent = ctx.parent(node)
            if (isInsideHeading(node, parent as RootContent | undefined)) {
              ctx.replaceNode(node, {
                type: "element",
                tagName: "span",
                properties: { className: ["sidenote-wrapper"] },
                children: [
                  {
                    type: "element",
                    tagName: "span",
                    properties: {
                      id: refId,
                      className: ["sidenote-toggle", "sidenote-number"],
                    },
                    children: [
                      { type: "text", value: String(reference.counter) },
                    ],
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
                  children: [
                    { type: "text", value: String(reference.counter) },
                  ],
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
                    id: `sn-note-${reference.counter}${suffix}`,
                    dataSidenoteNumber: String(reference.counter),
                  },
                  children: [
                    ...(structuredClone(content) as ElementContent[]),
                    makeBackref(
                      reference.counter,
                      refId,
                      "sidenote-backref",
                      label,
                      backrefChildren,
                    ),
                  ],
                },
              ],
            })
          },
        },
      }),
    () =>
      defineHastPlugin({
        name: "sidenotes-rewrite-footnote-list",
        element: {
          filter: ["section"],
          visit(node, ctx) {
            if (!hasProperty(node, "dataFootnotes")) return
            ctx.setProperty(
              node,
              "children",
              rewriteFootnoteChildren(
                node.children,
                getState(ctx),
                rewriteFootnotes,
                backrefChildren,
                label,
              ),
            )
          },
        },
      }),
  ]
}
