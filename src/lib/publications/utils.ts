/**
 * Publication processing utilities for BibTeX parsing and citation formatting
 */
// @ts-ignore - citation-js doesn't have types
import pkg from "@citation-js/core"

import "@citation-js/plugin-bibtex"

import type { ProcessedPublication, PublicationConfig } from "@/types"

import { PUBLICATION_LINK_TYPES } from "@/icon.config"

// @ts-ignore - citation-js doesn't have types
const { Cite, plugins } = pkg

/**
 * Valid field types for BibTeX plugin configuration
 * @see https://citation.js.org/api/0.7/module-@citation-js_plugin-bibtex.config.html
 */
type BibTeXFieldType = "field" | "list" | "separated"

/**
 * Valid value types for BibTeX plugin configuration
 * - literal: Normal text or numeric content
 * - title: Like literal but responsive to sentenceCase config
 * - name: Personal or organizational names
 * - date: An EDTF Level 1 date
 * - verbatim: Unaltered text (no expansion of commands)
 * - uri: Same as verbatim but URL-encoded if needed
 * - other: No special behavior, treated like literal
 * @see https://citation.js.org/api/0.7/module-@citation-js_plugin-bibtex.config.html
 */
type BibTeXValueType = "literal" | "title" | "name" | "date" | "verbatim" | "uri" | "other"

/**
 * Central configuration for all custom publication fields
 *
 * Add the field to CUSTOM_FIELDS_CONFIG with its configuration (fieldType, valueType, category)
 *
 * @see https://citation.js.org/api/0.7/module-@citation-js_plugin-bibtex.config.html
 * @see also PUBLICATION_LINK_TYPES in @link {src/icon.config.ts} for link field icons/labels
 */
const CUSTOM_FIELDS_CONFIG = {
  abstract: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "literal" as BibTeXValueType,
    category: "metadata"
  },
  arxiv: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "literal" as BibTeXValueType,
    category: "metadata"
  },
  award: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "literal" as BibTeXValueType,
    category: "metadata"
  },
  eprint: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "literal" as BibTeXValueType,
    category: "metadata"
  },
  venue: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "literal" as BibTeXValueType,
    category: "metadata"
  },
  selected: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "literal" as BibTeXValueType,
    category: "metadata"
  },

  // Link fields (to appear as action buttons - must also be in PUBLICATION_LINK_TYPES)
  pdf: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "uri" as BibTeXValueType,
    category: "link"
  },
  code: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "uri" as BibTeXValueType,
    category: "link"
  },
  data: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "uri" as BibTeXValueType,
    category: "link"
  },
  demo: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "uri" as BibTeXValueType,
    category: "link"
  },
  draft: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "uri" as BibTeXValueType,
    category: "link"
  },
  models: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "uri" as BibTeXValueType,
    category: "link"
  },
  post: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "uri" as BibTeXValueType,
    category: "link"
  },
  poster: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "uri" as BibTeXValueType,
    category: "link"
  },
  proposal: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "uri" as BibTeXValueType,
    category: "link"
  },
  resources: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "uri" as BibTeXValueType,
    category: "link"
  },
  slides: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "uri" as BibTeXValueType,
    category: "link"
  },
  talk: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "uri" as BibTeXValueType,
    category: "link"
  },
  thread: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "uri" as BibTeXValueType,
    category: "link"
  },
  video: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "uri" as BibTeXValueType,
    category: "link"
  },
  website: {
    fieldType: "field" as BibTeXFieldType,
    valueType: "uri" as BibTeXValueType,
    category: "link"
  }
} as const

type CustomFieldName = keyof typeof CUSTOM_FIELDS_CONFIG

// Auto-generate type for custom fields based on CUSTOM_FIELDS_CONFIG
type CustomFields = {
  [K in CustomFieldName]?: K extends "selected" ? string | boolean : string
}

// Types for citation-js
interface CitationEntry extends CustomFields {
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
  _graph?: Array<{ data?: string }>
}

// Auto-generate type for Publication custom fields (normalized to proper types)
type PublicationCustomFields = {
  [K in CustomFieldName]: K extends "selected" ? boolean : string | undefined
}

/** Publication return type - automatically includes all custom fields from CUSTOM_FIELDS_CONFIG */
export interface Publication extends PublicationCustomFields {
  id: string
  title: string
  authors: string[]
  year?: number
  journal?: string
  booktitle?: string
  series?: string
  publisher?: string
  doi?: string
  url?: string
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
 * Automatically configures all fields from CUSTOM_FIELDS_CONFIG
 * @see https://www.npmjs.com/package/@citation-js/plugin-bibtex
 */
const configureCustomFields = (): void => {
  const config = plugins.config.get("@bibtex")

  // Automatically configure all custom fields from CUSTOM_FIELDS_CONFIG
  // Format: config.constants.fieldTypes.fieldname = [fieldType, valueType]
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
        year: entry.issued?.["date-parts"]?.[0]?.[0] || entry.year || parseInt(customFields.year),
        // Standard BibTeX fields
        journal: entry["container-title"] || entry.journal || customFields.journal,
        booktitle: entry.booktitle || customFields.booktitle,
        series: entry.series || customFields.series,
        publisher: entry.publisher || customFields.publisher,
        doi: entry.DOI || entry.doi || customFields.doi,
        url: entry.URL || entry.url || customFields.url
      }

      // Automatically add all custom fields from CUSTOM_FIELDS_CONFIG
      for (const fieldName of Object.keys(CUSTOM_FIELDS_CONFIG) as CustomFieldName[]) {
        const value = getField(fieldName)
        // Handle 'selected' field specially (convert to boolean)
        if (fieldName === "selected") {
          publication[fieldName] = value === "true" || value === true
        } else {
          publication[fieldName] = value
        }
      }

      return publication as Publication
    })
  } catch (_error) {
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
  } catch (_error) {
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

    return shouldHighlight ? `<strong>${author}</strong>` : author
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

  // Automatically get all link fields from CUSTOM_FIELDS_CONFIG
  const linkFields = Object.keys(CUSTOM_FIELDS_CONFIG).filter(
    (field) => CUSTOM_FIELDS_CONFIG[field as CustomFieldName].category === "link"
  ) as CustomFieldName[]

  for (const field of linkFields) {
    const fieldValue = (entry as any)[field]
    if (fieldValue) {
      const linkConfig = (PUBLICATION_LINK_TYPES as any)[field]
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
 * Sort publications by year and date
 * @param publications - Array of publications
 * @param config - Publication configuration
 * @returns Sorted array of publications
 */
export function sortPublications(publications: Publication[]): Publication[] {
  const sorted = [...publications].sort((a, b) => {
    const yearA = a.year || 0
    const yearB = b.year || 0

    return yearB - yearA
  })

  return sorted
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

  // Format venue/publication info
  const getPublisher = (): string => {
    if (publication.venue) return publication.venue
    if (publication.series) return publication.series
    if (publication.journal) return publication.journal
    if (publication.booktitle) return publication.booktitle
    if (publication.eprint) return "Preprint"
    if (publication.publisher) return publication.publisher
    return ""
  }

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
    publisher: getPublisher() || undefined,
    links
  }
}
