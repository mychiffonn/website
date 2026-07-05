import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import type { ElementContent } from "hast"
import type { Blockquote } from "mdast"
import type {} from "mdast-util-to-hast"
import { toHtml } from "hast-util-to-html"
import { h } from "hastscript"
import { defineMdastPlugin } from "satteri"
import type { MdastNode, MdastVisitorContext } from "satteri"

const ICONS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "../assets/icons/callouts",
)

const loadIcon = (name: string) =>
  readFileSync(join(ICONS_DIR, `${name}.svg`), "utf8")
    .replace("<svg", '<svg aria-hidden="true"')
    .replace(/\s+/g, " ")
    .trim()

const VARIANTS = {
  note: "info-circle",
  abstract: "info-circle",
  tip: "lightbulb",
  important: "bell",
  question: "info-circle",
  warning: "shield-warning",
  caution: "danger-triangle",
  quote: "info-circle",
} as const

type CalloutVariant = keyof typeof VARIANTS
type ContainerDirectiveNode = MdastNode & {
  type: "containerDirective"
}
type CalloutNode = Blockquote | ContainerDirectiveNode

const ALIASES: Record<string, CalloutVariant> = {
  note: "note",
  abstract: "abstract",
  summary: "abstract",
  tldr: "abstract",
  info: "note",
  todo: "important",
  tip: "tip",
  hint: "tip",
  important: "important",
  success: "tip",
  check: "tip",
  done: "tip",
  question: "question",
  help: "question",
  faq: "question",
  warning: "warning",
  caution: "warning",
  attention: "warning",
  failure: "caution",
  fail: "caution",
  missing: "caution",
  danger: "caution",
  error: "caution",
  bug: "caution",
  example: "important",
  quote: "quote",
  cite: "quote",
}

const OBSIDIAN_CALLOUT = /^\[!(\w+)\]([+-]?)(?:[ \t]+(\S[^\n]*))?(?:\n|$)/i

const icons: Record<string, string> = {}
for (const name of [...new Set(Object.values(VARIANTS)), "alt-arrow-down"]) {
  icons[name] = loadIcon(name)
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const raw = (value: string): ElementContent =>
  ({ type: "raw", value }) as unknown as ElementContent

const normalizeVariant = (
  name: string,
  fallback: CalloutVariant | null,
): CalloutVariant | null => ALIASES[name.toLowerCase()] ?? fallback

const normalizeDirectiveVariant = (name: string): CalloutVariant | null => {
  const lower = name.toLowerCase()
  if (lower in VARIANTS) return lower as CalloutVariant

  return normalizeVariant(lower, null)
}

const calloutSummary = (variant: CalloutVariant, label: string | null) => {
  const title: ElementContent[] = [
    { type: "text", value: label || capitalize(variant) },
  ]

  return toHtml(
    h("summary", [
      raw(icons[VARIANTS[variant]]),
      h("span", title),
      raw(icons["alt-arrow-down"]),
    ]),
    { allowDangerousHtml: true },
  )
}

const setCalloutDetails = (
  node: Readonly<CalloutNode>,
  variant: CalloutVariant,
  open: boolean,
  summary: string,
  ctx: MdastVisitorContext,
) => {
  ctx.prependChild(node, { type: "html", value: summary })
  ctx.setProperty(node, "data", {
    hName: "details",
    hProperties: {
      dataCallout: variant,
      open,
    },
  })
}

export const calloutDirective = defineMdastPlugin({
  name: "callout-directive",
  containerDirective(node, ctx) {
    const variant = normalizeDirectiveVariant(node.name)
    if (!variant) return

    const first = node.children[0]
    const isLabel =
      first?.type === "paragraph" &&
      (first.data as { directiveLabel?: boolean })?.directiveLabel === true
    const label = isLabel ? ctx.textContent(first) : null
    if (isLabel) ctx.removeNode(first)

    const closed = !!node.attributes && "closed" in node.attributes
    setCalloutDetails(
      node,
      variant,
      !closed,
      calloutSummary(variant, label),
      ctx,
    )
  },
  blockquote(node, ctx) {
    const first = node.children[0]
    if (first?.type !== "paragraph") return

    const marker = first.children[0]
    if (marker?.type !== "text") return

    const match = marker.value.match(OBSIDIAN_CALLOUT)
    if (!match) return

    const variant = normalizeVariant(match[1], "note") ?? "note"
    const open = match[2] !== "-"
    const label = match[3] ?? null
    const value = marker.value.slice(match[0].length)

    if (value || first.children.length > 1) {
      ctx.setProperty(marker, "value", value)
    } else {
      ctx.removeNode(first)
    }

    setCalloutDetails(node, variant, open, calloutSummary(variant, label), ctx)
  },
})
