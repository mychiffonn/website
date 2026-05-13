/**
 * Publication processing utilities for BibTeX parsing and citation formatting
 */
// @ts-ignore - citation-js doesn't have types
import pkg from "@citation-js/core"

import "@citation-js/plugin-bibtex"

import type { ProcessedPublication, PublicationConfig } from "@/types"

import { PUBLICATION_LINK_TYPES } from "@/icon.config"

import {
  CUSTOM_FIELD_NAMES,
  CUSTOM_FIELDS_CONFIG,
  LINK_FIELD_NAMES,
  VENUE_BOOKTITLE_PATTERNS,
  VENUE_DOI_PATTERNS,
  VENUE_URL_PATTERNS
} from "./data"

// @ts-ignore - citation-js doesn't have types
const { Cite, plugins } = pkg

// Types for citation-js
interface CitationEntry {
  id?: string
  label?: string
  title?: string
  author?: Array<string | { given?: string; family?: string }>
  issued?: { "date-parts"?: number[][] }
  year?: number
  "container-title"?: string
  journal?: string
  booktitle?: string
  series?: string
  publisher?: string
  DOI?: string
  doi?: string
  URL?: string
  url?: string
  keyword?: string
  _graph?: Array<{ data?: string }>
  [key: string]: unknown
}

/** Publication return type - normalized fields plus flexible custom metadata/link fields. */
export interface Publication {
  id: string
  title: string
  authors: string[]
  year?: number
  month?: number
  entryType?: string
  journal?: string
  booktitle?: string
  series?: string
  publisher?: string
  doi?: string
  url?: string
  keywords?: string
  abstract?: string
  award?: string
  arxiv?: string
  eprint?: string
  venue?: string
  selected?: boolean
  [key: string]: unknown
}

interface AuthorData {
  displayFirstAuthors: string
  displayLastAuthors?: string
  hasMore: boolean
  hiddenCount: number
  hiddenAuthors: string
}

interface PublicationLink {
  href: string
  icon: string
  label: string
  type: string
}

/**
 * Configure custom field types for academic publications using the plugin's configuration API
 * Automatically configures all fields from `src/lib/publications/data/custom-fields.json`
 * @see https://www.npmjs.com/package/@citation-js/plugin-bibtex
 */
const configureCustomFields = (): void => {
  const config = plugins.config.get("@bibtex")

  // Config format: config.constants.fieldTypes.fieldname = [fieldType, valueType]
  for (const [fieldName, fieldConfig] of Object.entries(CUSTOM_FIELDS_CONFIG)) {
    config.constants.fieldTypes[fieldName] = [fieldConfig.fieldType, fieldConfig.valueType]
  }

  config.parse.strict = false
}

configureCustomFields()

/**
 * Extract custom fields from raw BibTeX data
 * @param entry - Citation.js parsed entry
 * @returns Custom fields extracted from raw BibTeX
 */
function extractCustomFields(entry: CitationEntry): Record<string, string> {
  const customFields: Record<string, string> = {}

  if (entry._graph?.[0]?.data) {
    const rawBib = entry._graph[0].data
    const entryMatch = rawBib.match(new RegExp(`@\\w+\\{${entry.id}[\\s\\S]*?\\n\\}`, "i"))
    if (entryMatch) {
      const entryContent = entryMatch[0]

      // Pattern for all field formats
      const fieldPattern = /(\w+)\s*=\s*(?:\{([^}]*)\}|"([^"]*)"|([^,\s}]+))/g
      let match

      while ((match = fieldPattern.exec(entryContent)) !== null) {
        const fieldName = match[1].toLowerCase()
        const fieldValue = (match[2] || match[3] || match[4])?.trim()
        if (fieldValue && !customFields[fieldName]) {
          customFields[fieldName] = fieldValue
        }
      }
    }
  }

  return customFields
}

/**
 * Extract the BibTeX entry type (e.g., "article", "inproceedings", "misc") from raw data
 */
function extractEntryType(entry: CitationEntry): string | undefined {
  if (entry._graph?.[0]?.data) {
    const rawBib = entry._graph[0].data
    const typeMatch = rawBib.match(new RegExp(`@(\\w+)\\{${entry.id}`, "i"))
    if (typeMatch) {
      return typeMatch[1].toLowerCase()
    }
  }
  return undefined
}

/**
 * Venue inference patterns: match booktitle/journal substrings to short venue names.
 * Ordered by specificity — first match wins.
 */
function inferVenue(pub: Publication): string {
  if (pub.venue) return pub.venue

  const booktitle = pub.booktitle || ""
  for (const [pattern, venue] of VENUE_BOOKTITLE_PATTERNS) {
    if (pattern.test(booktitle)) return venue
  }

  const journal = pub.journal || ""
  for (const [pattern, venue] of VENUE_BOOKTITLE_PATTERNS) {
    if (pattern.test(journal)) return venue
  }
  if (journal) return journal

  const url = pub.url || ""
  for (const [pattern, venue] of VENUE_URL_PATTERNS) {
    if (pattern.test(url)) return venue
  }

  const doi = pub.doi || ""
  for (const [pattern, venue] of VENUE_DOI_PATTERNS) {
    if (pattern.test(doi)) return venue
  }

  if (pub.series) return pub.series
  if (pub.booktitle) return pub.booktitle
  if (pub.publisher) return pub.publisher
  if (pub.eprint) return "Preprint"

  return ""
}

/**
 * Parse BibTeX content using citation-js
 * @param bibContent - Raw BibTeX file content
 * @returns Array of parsed publication objects
 */
export function parseBibTeX(bibContent: string): Publication[] {
  try {
    const cite = new Cite(bibContent)
    const publications: CitationEntry[] = cite.data

    return publications.map((entry) => {
      const customFields = extractCustomFields(entry)

      // Helper to get field value (entry field takes precedence over customFields)
      const getField = (fieldName: string) => (entry as any)[fieldName] || customFields[fieldName]

      // Build publication object with core fields + all custom fields
      const entryType = extractEntryType(entry)
      const month = entry.issued?.["date-parts"]?.[0]?.[1]

      const publication: any = {
        id: entry.id || entry.label || `pub-${Math.random().toString(36).substring(2, 11)}`,
        title: entry.title || customFields.title || "",
        authors: entry.author
          ? entry.author.map((author) =>
              typeof author === "string"
                ? author.trim()
                : `${author.given || ""} ${author.family || ""}`.trim()
            )
          : [],
        year:
          entry.issued?.["date-parts"]?.[0]?.[0] ||
          entry.year ||
          (customFields.year ? parseInt(customFields.year, 10) : undefined),
        month,
        entryType,
        // Standard BibTeX fields
        journal: entry["container-title"] || entry.journal || customFields.journal,
        booktitle: entry.booktitle || customFields.booktitle,
        series: entry.series || customFields.series,
        publisher: entry.publisher || customFields.publisher,
        doi: entry.DOI || entry.doi || customFields.doi,
        url: entry.URL || entry.url || customFields.url
      }

      // Automatically add all custom fields from CUSTOM_FIELDS_CONFIG
      for (const fieldName of CUSTOM_FIELD_NAMES) {
        const value = getField(fieldName)
        // Handle 'selected' field specially (convert to boolean)
        if (fieldName === "selected") {
          publication[fieldName] = value === "true" || value === true
        } else {
          publication[fieldName] = value
        }
      }

      // keywords is a standard BibTeX field — citation-js parses it as entry.keyword
      publication.keywords = (entry as any).keyword || customFields.keywords || undefined

      return publication as Publication
    })
  } catch {
    return []
  }
}

/**
 * Format a citation in the specified style
 * @param entry - Publication entry
 * @param style - Citation style ('apa', 'mla', 'chicago')
 * @returns Formatted citation string
 */
export function formatCitation(entry: Publication, style: string = "apa"): string {
  try {
    const cite = new Cite(entry)
    return cite.format("bibliography", {
      format: "text",
      template: `${style}`,
      lang: "en-US"
    })
  } catch {
    return `${entry.authors.join(", ")}. (${entry.year}). ${entry.title}.`
  }
}

/**
 * Highlight author names in bold based on configuration
 * @param authors - Array of author names
 * @param highlightConfig - Configuration for author highlighting
 * @returns Array of authors with highlighted names in HTML
 */
export function highlightAuthorName(
  authors: string[],
  highlightConfig: PublicationConfig["highlightAuthor"]
): string[] {
  const { firstName, lastName, aliases = [] } = highlightConfig

  // Create exact name patterns to match
  const namesToHighlight = [
    `${firstName} ${lastName}`,
    `${lastName}, ${firstName}`,
    `${firstName.split(" ")[0]} ${lastName}`, // Handle "My" from "My Chiffon"
    `${lastName}, ${firstName.split(" ")[0]}`,
    ...aliases
  ]

  return authors.map((author) => {
    const authorTrimmed = author.trim()
    const shouldHighlight = namesToHighlight.some((name) => {
      // Exact match (case-insensitive)
      if (authorTrimmed.toLowerCase() === name.toLowerCase()) {
        return true
      }

      // For aliases that might be shorter, check if author starts/ends with the alias
      // but only if it's a complete word boundary
      const nameLower = name.toLowerCase()

      // Word boundary regex - matches only complete words
      const wordBoundaryRegex = new RegExp(
        `\\b${nameLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i"
      )
      return wordBoundaryRegex.test(authorTrimmed)
    })

    return shouldHighlight ? `<strong class="author-highlight">${author}</strong>` : author
  })
}

/**
 * Truncate author list based on configuration
 * @param authors - Array of author names (already highlighted)
 * @param maxFirst - Maximum number of first authors to show
 * @param maxLast - Maximum number of last authors to show (optional)
 * @returns Object with truncated author list and metadata
 */
export function truncateAuthors(
  authors: string[],
  maxFirst: number,
  maxLast: number = 0
): AuthorData {
  const totalAuthors = authors.length

  // Early return if no truncation needed
  if (totalAuthors <= maxFirst || totalAuthors <= maxFirst + maxLast) {
    return {
      displayFirstAuthors: authors.join(", ") + (totalAuthors > 0 ? "," : ""),
      hasMore: false,
      hiddenCount: 0,
      hiddenAuthors: ""
    }
  }

  const firstAuthors = authors.slice(0, maxFirst)
  const hidden = maxLast > 0 ? authors.slice(maxFirst, -maxLast) : authors.slice(maxFirst)
  const lastAuthors = maxLast > 0 ? authors.slice(-maxLast) : undefined

  return {
    displayFirstAuthors: firstAuthors.join(", ") + ",",
    displayLastAuthors: lastAuthors?.join(", "),
    hasMore: true,
    hiddenCount: hidden.length,
    hiddenAuthors: hidden.join(", ")
  }
}

/**
 * Extract publication action links (excluding doi, url, arxiv which go on title)
 * Automatically includes all fields marked as 'link' category in CUSTOM_FIELDS_CONFIG
 * @param entry - Publication entry
 * @returns Array of action link objects with proper icon names
 */
export function getPublicationLinks(entry: Publication): PublicationLink[] {
  const links: PublicationLink[] = []

  for (const field of LINK_FIELD_NAMES) {
    const fieldValue = entry[field]
    if (typeof fieldValue === "string" && fieldValue) {
      const linkConfig = PUBLICATION_LINK_TYPES[field as keyof typeof PUBLICATION_LINK_TYPES]
      if (linkConfig) {
        links.push({
          href: fieldValue,
          icon: linkConfig.iconName,
          label: linkConfig.label,
          type: field
        })
      }
    }
  }

  return links
}

/**
 * Get the position of the highlighted author in the author list (0-indexed)
 * Returns Infinity if not found
 */
function getHighlightedAuthorPosition(
  authors: string[],
  highlightConfig: PublicationConfig["highlightAuthor"]
): number {
  const { firstName, lastName, aliases = [] } = highlightConfig
  const namesToMatch = [
    `${firstName} ${lastName}`,
    `${lastName}, ${firstName}`,
    `${firstName.split(" ")[0]} ${lastName}`,
    `${lastName}, ${firstName.split(" ")[0]}`,
    ...aliases
  ].map((n) => n.toLowerCase())

  for (let i = 0; i < authors.length; i++) {
    const authorLower = authors[i].trim().toLowerCase()
    if (namesToMatch.some((name) => authorLower === name || authorLower.includes(name))) {
      return i
    }
  }
  return Infinity
}

/**
 * Sort publications by year (descending) with configurable within-year ordering
 * @param publications - Array of publications
 * @param config - Publication configuration (optional, for within-year sort)
 * @returns Sorted array of publications
 */
export function sortPublications(
  publications: Publication[],
  _config?: PublicationConfig
): Publication[] {
  return [...publications].sort((a, b) => {
    const yearA = a.year || 0
    const yearB = b.year || 0
    if (yearA !== yearB) return yearB - yearA

    const monthA = a.month ?? 0
    const monthB = b.month ?? 0
    return monthB - monthA
  })
}

/**
 * Sort publications by relevance: selected first, then author position ascending, then year descending, then month descending
 */
export function sortPublicationsByRelevance(
  publications: Publication[],
  config: PublicationConfig
): Publication[] {
  return [...publications].sort((a, b) => {
    // selected=true first
    const selA = a.selected ? 0 : 1
    const selB = b.selected ? 0 : 1
    if (selA !== selB) return selA - selB

    // author position ascending
    const posA = getHighlightedAuthorPosition(a.authors, config.highlightAuthor)
    const posB = getHighlightedAuthorPosition(b.authors, config.highlightAuthor)
    if (posA !== posB) return posA - posB

    // year descending
    const yearA = a.year || 0
    const yearB = b.year || 0
    if (yearA !== yearB) return yearB - yearA

    // month descending
    const monthA = a.month ?? 0
    const monthB = b.month ?? 0
    return monthB - monthA
  })
}

/**
 * Filter publications by selected status
 * @param publications - Array of publications
 * @param limit - Maximum number of publications to return
 * @returns Array of selected publications
 */
export function getSelectedPublications(
  publications: Publication[],
  limit?: number
): Publication[] {
  const selected = publications.filter((pub) => pub.selected === true)
  return limit ? selected.slice(0, limit) : selected
}

/**
 * Process publication data for display (matches ProcessedPublication schema)
 * @param publication - Publication entry
 * @param config - Publication configuration
 * @returns Processed publication data for component rendering
 */
export function getPublicationData(
  publication: Publication,
  config: PublicationConfig
): ProcessedPublication {
  // Process authors
  const highlightedAuthors = highlightAuthorName(publication.authors || [], config.highlightAuthor)
  const authorData = truncateAuthors(
    highlightedAuthors,
    config.maxFirstAuthors,
    config.maxLastAuthors
  )

  // Get publication links
  const links = getPublicationLinks(publication)

  // Determine main URL for title linking (prefer DOI, then arXiv, then URL)
  const mainUrl = publication.doi
    ? `https://doi.org/${publication.doi}`
    : publication.arxiv
      ? `https://arxiv.org/abs/${publication.arxiv}`
      : publication.url || ""

  const venue = inferVenue(publication)

  const authorPosition = getHighlightedAuthorPosition(
    publication.authors || [],
    config.highlightAuthor
  )

  return {
    title: publication.title || "",
    year: publication.year,
    abstract: publication.abstract,
    award: publication.award,
    mainUrl: mainUrl || undefined,
    authorData: {
      displayFirstAuthors: authorData.displayFirstAuthors,
      displayLastAuthors: authorData.displayLastAuthors,
      hasMore: authorData.hasMore,
      hiddenCount: authorData.hiddenCount,
      hiddenAuthors: authorData.hiddenAuthors
    },
    publisher: venue || undefined,
    links,
    keywords: publication.keywords
      ? publication.keywords
          .split(",")
          .map((k: string) => k.trim())
          .filter(Boolean)
      : [],
    selected: publication.selected === true,
    authorPosition
  }
}
