/**
 * Publication processing utilities for BibTeX parsing and citation formatting
 */
// @ts-ignore - citation-js doesn't have types
import pkg from '@citation-js/core'
import '@citation-js/plugin-bibtex'
import { PUBLICATION_LINK_TYPES } from "@/icon.config"
import type { PublicationConfig } from "@/types"
import type { ProcessedPublication } from "@/schemas"

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
  abstract?: string
  venue?: string
  "container-title"?: string
  journal?: string
  booktitle?: string
  series?: string
  publisher?: string
  DOI?: string
  doi?: string
  URL?: string
  url?: string
  arxiv?: string
  pdf?: string
  code?: string
  demo?: string
  post?: string
  poster?: string
  resources?: string
  selected?: string | boolean
  slides?: string
  talk?: string
  threads?: string
  video?: string
  website?: string
  award?: string
  eprint?: string
  _graph?: Array<{ data?: string }>
}

export interface Publication {
  id: string
  title: string
  authors: string[]
  year?: number
  abstract?: string
  venue?: string
  journal?: string
  booktitle?: string
  series?: string
  publisher?: string
  doi?: string
  url?: string
  arxiv?: string
  pdf?: string
  code?: string
  demo?: string
  post?: string
  poster?: string
  resources?: string
  selected: boolean
  slides?: string
  talk?: string
  threads?: string
  video?: string
  website?: string
  award?: string
  eprint?: string
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

// Configure custom field types for academic publications using the plugin's configuration API
const configureCustomFields = (): void => {
  const config = plugins.config.get('@bibtex')

  // Add custom academic field types following the documentation format
  // Format: config.constants.fieldTypes.fieldname = [fieldType, valueType]
  // fieldType: 'field', 'list', or 'separated'
  // valueType: 'literal', 'title', 'name', 'date', 'verbatim', 'uri', 'other'

  config.constants.fieldTypes.abstract = ['field', 'literal']
  config.constants.fieldTypes.arxiv = ['field', 'literal']
  config.constants.fieldTypes.award = ['field', 'literal']
  config.constants.fieldTypes.code = ['field', 'uri']
  config.constants.fieldTypes.demo = ['field', 'uri']
  config.constants.fieldTypes.pdf = ['field', 'uri']
  config.constants.fieldTypes.post = ['field', 'uri']
  config.constants.fieldTypes.poster = ['field', 'uri']
  config.constants.fieldTypes.resources = ['field', 'uri']
  config.constants.fieldTypes.selected = ['field', 'literal']
  config.constants.fieldTypes.slides = ['field', 'uri']
  config.constants.fieldTypes.talk = ['field', 'uri']
  config.constants.fieldTypes.threads = ['field', 'uri']
  config.constants.fieldTypes.venue = ['field', 'literal']
  config.constants.fieldTypes.video = ['field', 'uri']
  config.constants.fieldTypes.website = ['field', 'uri']
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
    const entryMatch = rawBib.match(new RegExp(`@\\w+\\{${entry.id}[\\s\\S]*?\\n\\}`, 'i'))
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

      return {
        id: entry.id || entry.label || `pub-${Math.random().toString(36).substring(2, 11)}`,
        title: entry.title || customFields.title || "",
        authors: entry.author ? entry.author.map((author) =>
          typeof author === 'string' ? author.trim() : `${author.given || ''} ${author.family || ''}`.trim()
        ) : [],
        year: entry.issued?.["date-parts"]?.[0]?.[0] || entry.year || parseInt(customFields.year),
        abstract: entry.abstract || customFields.abstract,
        venue: entry.venue || customFields.venue,
        journal: entry["container-title"] || entry.journal || customFields.journal,
        booktitle: entry.booktitle || customFields.booktitle,
        series: entry.series || customFields.series,
        publisher: entry.publisher || customFields.publisher,
        doi: entry.DOI || entry.doi || customFields.doi,
        url: entry.URL || entry.url || customFields.url,
        arxiv: entry.arxiv || customFields.arxiv,
        pdf: entry.pdf || customFields.pdf,
        code: entry.code || customFields.code,
        demo: entry.demo || customFields.demo,
        post: entry.post || customFields.post,
        poster: entry.poster || customFields.poster,
        resources: entry.resources || customFields.resources,
        selected: entry.selected === "true" || entry.selected === true ||
          customFields.selected === "true",
        slides: entry.slides || customFields.slides,
        talk: entry.talk || customFields.talk,
        threads: entry.threads || customFields.threads,
        video: entry.video || customFields.video,
        website: entry.website || customFields.website,
        award: entry.award || customFields.award,
        eprint: entry.eprint || customFields.eprint
      }
    })
  } catch (error) {
    console.error("Error parsing BibTeX:", error)
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
  } catch (error) {
    console.error("Error formatting citation:", error)
    return `${entry.authors.join(", ")}. (${entry.year}). ${entry.title}.`
  }
}

/**
 * Highlight author names in bold based on configuration
 * @param authors - Array of author names
 * @param highlightConfig - Configuration for author highlighting
 * @returns Array of authors with highlighted names in HTML
 */
export function highlightAuthorName(authors: string[], highlightConfig: PublicationConfig['highlightAuthor']): string[] {
  const { firstName, lastName, aliases = [] } = highlightConfig
  const namesToHighlight = [
    `${firstName} ${lastName}`,
    `${lastName}, ${firstName}`,
    `${firstName.split(' ')[0]} ${lastName}`, // Handle "My" from "My Chiffon"
    `${lastName}, ${firstName.split(' ')[0]}`,
    ...aliases
  ]

  return authors.map(author => {
    const authorLower = author.toLowerCase()
    const shouldHighlight = namesToHighlight.some(name => {
      const nameLower = name.toLowerCase()
      // Check for exact match or partial match that includes both first and last name
      return authorLower.includes(nameLower) ||
        nameLower.includes(authorLower) ||
        (authorLower.includes(firstName.toLowerCase()) && authorLower.includes(lastName.toLowerCase()))
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
export function truncateAuthors(authors: string[], maxFirst: number, maxLast: number = 0): AuthorData {
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
 * @param entry - Publication entry
 * @returns Array of action link objects with proper icon names
 */
export function getPublicationLinks(entry: Publication): PublicationLink[] {
  const links: PublicationLink[] = []

  const actionFields = [
    "pdf", "code", "demo", "website", "slides", "video",
    "poster", "resources", "talk", "post", "threads"
  ] as const

  for (const field of actionFields) {
    if (entry[field]) {
      const linkConfig = PUBLICATION_LINK_TYPES[field]
      if (linkConfig) {
        links.push({
          href: entry[field]!,
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
export function sortPublications(publications: Publication[], config: PublicationConfig): Publication[] {
  const sorted = [...publications].sort((a, b) => {
    const yearA = a.year || 0
    const yearB = b.year || 0

    if (config.sortOrder === "chronological") {
      return yearA - yearB
    } else {
      return yearB - yearA
    }
  })

  return sorted
}

/**
 * Filter publications by selected status
 * @param publications - Array of publications
 * @param limit - Maximum number of publications to return
 * @returns Array of selected publications
 */
export function getSelectedPublications(publications: Publication[], limit?: number): Publication[] {
  const selected = publications.filter(pub => pub.selected === true)
  return limit ? selected.slice(0, limit) : selected
}

/**
 * Group publications by year
 * @param publications - Array of publications
 * @returns Object with years as keys and publication arrays as values
 */
export function groupPublicationsByYear(publications: Publication[]): Record<string, Publication[]> {
  const grouped: Record<string, Publication[]> = {}

  for (const pub of publications) {
    const year = pub.year || 0
    if (!grouped[year]) {
      grouped[year] = []
    }
    grouped[year].push(pub)
  }

  return grouped
}

/**
 * Process publication data for display (matches ProcessedPublication schema)
 * @param publication - Publication entry
 * @param config - Publication configuration
 * @returns Processed publication data for component rendering
 */
export function getPublicationData(publication: Publication, config: PublicationConfig): ProcessedPublication {
  // Process authors
  const highlightedAuthors = highlightAuthorName(publication.authors || [], config.highlightAuthor)
  const authorData = truncateAuthors(highlightedAuthors, config.maxFirstAuthors, config.maxLastAuthors)

  // Get publication links
  const links = getPublicationLinks(publication)

  // Determine main URL for title linking (prefer DOI, then arXiv, then URL)
  const mainUrl = publication.doi ? `https://doi.org/${publication.doi}` :
    publication.arxiv ? `https://arxiv.org/abs/${publication.arxiv}` :
      publication.url || ""

  // Format venue/publication info
  const getPublisher = (): string => {
    if (publication.venue) return publication.venue
    if (publication.journal) return publication.journal
    if (publication.booktitle) return publication.booktitle
    if (publication.series) return publication.series
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
