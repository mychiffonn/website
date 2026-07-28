import { SITE } from "@site-config"
import { formatDate } from "@/lib/date-utils"

/**
 * Context prepended to copied markdown so the text stands on its own once it
 * leaves the page.
 */
export interface MarkdownDocumentContext {
  /** Page title, which lives in frontmatter and is absent from the body */
  title: string
  /** Short summary, when the page has one */
  description?: string
  /** Path the content came from, resolved against the site origin */
  path?: string
  /** Publication or last-updated date */
  date?: Date
}

/**
 * Prepends a portable header to a raw markdown body.
 *
 * Astro strips frontmatter from `entry.body`, so a copied post otherwise opens
 * mid-document with no title, no date, and no way back to the source. This adds
 * that context as plain markdown rather than a YAML block: the internal keys
 * (draft, order, image paths, author references) mean nothing outside the repo,
 * and every target for a paste — an LLM, a notes app, an issue — renders
 * markdown while few render frontmatter.
 *
 * @param body - Raw markdown body
 * @param context - Title and optional description, path, and date
 * @returns The body with a title, optional summary, and source line on top
 */
export function buildMarkdownDocument(
  body: string,
  { title, description, path, date }: MarkdownDocumentContext,
): string {
  const header = [`# ${title}`]

  if (description) header.push(description)

  const source = [
    path ? `Source: ${new URL(path, SITE.href).href}` : null,
    date ? `Date: ${formatDate(date)}` : null,
  ].filter(Boolean)

  if (source.length > 0) header.push(source.join("  \n"))

  return `${header.join("\n\n")}\n\n${body.trim()}\n`
}
