/**
 * Custom configuration schemas for the theme, with zod validation
 */
import { z } from "astro/zod"

import type { ProfileLinkType } from "@icon-config"

/**
 * Configuration schema for site-wide settings including metadata, localization, and theme options.
 */
export const SiteConfigSchema = z.object({
  /** Site metadata */
  title: z.string(),
  /** To be used as meta description or description tag in head. <= 100 characters */
  description: z.string().max(100),
  href: z.string().url(),
  author: z.string(),

  // Localization
  locale: z.object({
    lang: z.string().default("en-US"),
    attrs: z.string().default("en_US"),
    dateLocale: z.string().default("en-US"),
    dateOptions: z
      .object({
        day: z.enum(["numeric", "2-digit"]).optional(),
        month: z.enum(["numeric", "2-digit", "narrow", "short", "long"]).optional(),
        year: z.enum(["numeric", "2-digit"]).optional(),
        timeZone: z.string().optional()
      })
      .default({}),
    relative: z
      .object({
        enabled: z.boolean().default(false),
        maxDaysThreshold: z.number().default(30)
      })
      .default({})
  }),

  // Blog settings
  featuredPostCount: z.number().positive().default(2),
  postsPerPage: z.number().positive().default(8),

  /** TOC max depth of markdown headings, between 1 and 6 */
  tocMaxDepth: z.number().min(1).max(6).default(3),

  // Theme settings
  favicon: z.string().default("/favicon.ico"),
  prerender: z.boolean().default(true),
  npmCDN: z.string().url().default("https://cdn.jsdelivr.net/npm"),

  // Content license
  license: z
    .object({
      href: z.string(),
      label: z.string()
    })
    .default({
      label: "CC-BY-NC-4.0",
      href: "https://creativecommons.org/licenses/by-nc/4.0/"
    })
})

/**
 * Schema for profile social links configuration.
 *
 * Supports platforms like: email, github, twitter, linkedin, googleScholar, etc.
 * Each link can be:
 * - A simple string URL
 * - An object with href and optional custom label (use 'platform' for default label)
 *
 * @example
 * ```ts
 * {
 *   github: "https://github.com/username",
 *   googleScholar: {
 *     href: "https://scholar.google.com/citations?user=...",
 *     label: "platform" // Uses default label from platform config
 *   }
 * }
 * ```
 */
export const ProfileLinkConfigSchema = z
  .record(
    z.custom<ProfileLinkType>((val) => typeof val === "string"),
    z.union([
      z.string(),
      z.object({
        /** URL or path for the social link */
        href: z.string(),
        /** Custom label or 'platform' to use default from platform config */
        label: z.union([z.string(), z.literal("platform")]).optional()
      })
    ])
  )
  .optional()
  .default({})

/**
 * Schema for personal profile configuration including contact info and social links.
 */
export const ProfileConfigSchema = z.object({
  /** Full name or display name */
  name: z.string(),
  /** (Optional) Your other names, including native, maiden, nicknames. */
  othernames: z.string().or(z.array(z.string())).optional(),
  /**
   * How you want the world to know about you.
   * Short biography, tagline, or job title and affiliations
   * Max 50 characters
   */
  tagline: z.string().max(50),
  /** required: Main email address */
  email: z.string().email(),
  /** optional: Geographic location (city, state, country) */
  location: z.string().max(50).optional(),
  /** Phone number, accepting international format */
  phone: z
    .string()
    .regex(/^[+]?[\d\s().-]{7,22}$/)
    .optional(),
  /** Preferred pronouns (e.g., "she/her", "they/them") */
  pronouns: z.string().max(20).optional(),
  /** Phonetic pronunciation guide for your name */
  pronunciation: z.string().optional(),
  // pronunciationAudioPath: z.string().optional(),
  /** Social media and professional platform links */
  links: ProfileLinkConfigSchema
})

/**
 * Schema for website footer configuration including credits and additional links.
 */
export const FooterConfigSchema = z.object({
  /** Whether to show "Built with" credits in footer */
  credits: z.boolean().default(true),
  /** URL to source code repository, optional */
  sourceCode: z.string().url().optional(),
  /** URL to content source repository, optional */
  sourceContent: z.string().url().optional(),
  /** Additional links to display in footer */
  footerLinks: z
    .array(
      z.object({
        /** URL for the footer link */
        href: z.string().url(),
        /** Display text for the footer link */
        label: z.string()
      })
    )
    .default([])
})

/**
 * Schema for tools/software with categorization tags.
 */
export const ToolSchema = z.object({
  /** Name of the tool or software */
  name: z.string(),
  /** Brief description of what the tool does */
  description: z.string(),
  /** Official website or documentation URL */
  href: z.string().url(),
  /** Icon identifier for the tool */
  icon: z.string(),
  /** Categorization tags for filtering and organization */
  tags: z
    .array(
      z.enum(["Free", "OpenSource", "Subscription", "Bundle", "SelfHosted", "Gifted", "Favorite"])
    )
    .optional()
})

/**
 * Schema for publication configuration including author display and formatting settings.
 */
export const PublicationConfigSchema = z.object({
  // Author display settings
  maxFirstAuthors: z.number().min(1).default(4),
  maxLastAuthors: z.number().min(0).optional(),
  highlightAuthor: z.object({
    firstName: z.string(),
    lastName: z.string(),
    aliases: z.array(z.string()).optional() // Handle name variations
  }),

  // Display settings
  citationStyle: z.enum(["apa", "mla", "chicago"]).default("apa"),
  sortOrder: z.enum(["chronological", "reverse-chronological"]).default("reverse-chronological")
})

/**
 * Schema for BibTeX bibliography entries with custom fields support.
 * Includes standard BibTeX fields plus some extensions.
 */
export const BibEntrySchema = z.object({
  // Standard BibTeX fields
  /** Unique identifier for the bibliography entry */
  id: z.string(),
  /** Entry type (article, inproceedings, book, etc.) */
  type: z.string(),
  /** Publication title */
  title: z.string(),
  /** Authors list */
  author: z.string().optional(),
  /** Publication year */
  year: z.number().or(z.string()).optional(),
  /** DOI identifier */
  doi: z.string().optional(),
  /** Generic URL */
  url: z.string().optional(),

  // Journal/Conference fields
  /** Journal name */
  journal: z.string().optional(),
  /** Conference/proceedings name */
  booktitle: z.string().optional(),
  /** Volume number */
  volume: z.string().optional(),
  /** Issue/number */
  number: z.string().optional(),
  /** Page range */
  pages: z.string().optional(),
  /** Publisher */
  publisher: z.string().optional(),
  /** Editor(s) */
  editor: z.string().optional(),

  // Custom academic fields
  /** Abstract text */
  abstract: z.string().optional(),
  /** arXiv identifier */
  arxiv: z.string().optional(),
  /** Award or honor received */
  award: z.string().optional(),
  /** Source code repository URL */
  code: z.string().optional(),
  /** Live demo URL */
  demo: z.string().optional(),
  /** PDF file path or URL */
  pdf: z.string().optional(),
  /** Blog post URL */
  post: z.string().optional(),
  /** Poster file path or URL */
  poster: z.string().optional(),
  /** Additional resources URL */
  resources: z.string().optional(),
  /** Boolean for featured publications */
  selected: z.boolean().optional(),
  /** Presentation slides URL */
  slides: z.string().optional(),
  /** Talk/presentation URL */
  talk: z.string().optional(),
  /** Social media threads (X/Twitter/Bluesky/Threads) */
  threads: z.string().optional(),
  /** Publication venue */
  venue: z.string().optional(),
  /** Video URL */
  video: z.string().optional(),
  /** Project website URL */
  website: z.string().optional()
})

/**
 * Processed publication data type for component rendering.
 * This represents the transformed data structure expected by PubCard.astro
 */
export const ProcessedPublicationSchema = z.object({
  // Core publication info
  title: z.string(),
  year: z.number().or(z.string()).optional(),
  abstract: z.string().optional(),
  award: z.string().optional(),

  // Main URL (derived from doi, url, or other primary link)
  mainUrl: z.string().optional(),

  // Processed author data
  authorData: z.object({
    /** First authors to display (with highlighted author(s) and commas) */
    displayFirstAuthors: z.string(),
    /** Last authors to display (with highlighted author(s) and commas) */
    displayLastAuthors: z.string().optional(),
    /** Whether there are more authors than displayed */
    hasMore: z.boolean(),
    /** Count of hidden authors */
    hiddenCount: z.number(),
    /** Hidden authors (with highlighted author(s) and commas) */
    hiddenAuthors: z.string()
  }),

  /** Information based on venue / booktitle / journal / etc */
  publisher: z.string().optional(),

  // Action links
  links: z.array(
    z.object({
      href: z.string(),
      icon: z.string(),
      label: z.string()
    })
  )
})

// Type exports
export type SiteConfig = z.infer<typeof SiteConfigSchema>
export type ProfileLinkConfig = z.infer<typeof ProfileLinkConfigSchema>
export type ProfileConfig = z.infer<typeof ProfileConfigSchema>
export type FooterConfig = z.infer<typeof FooterConfigSchema>
export type Tool = z.infer<typeof ToolSchema>
export type PublicationConfig = z.infer<typeof PublicationConfigSchema>
export type BibEntry = z.infer<typeof BibEntrySchema>
export type ProcessedPublication = z.infer<typeof ProcessedPublicationSchema>

// Validation functions
export const validateSiteConfig = (data: unknown) => SiteConfigSchema.parse(data)
export const validateProfile = (data: unknown) => ProfileConfigSchema.parse(data)
export const validateFooter = (data: unknown) => FooterConfigSchema.parse(data)
export const validateTool = (data: unknown) => ToolSchema.parse(data)
export const validatePublicationConfig = (data: unknown) => PublicationConfigSchema.parse(data)
export const validateBibEntry = (data: unknown) => BibEntrySchema.parse(data)
export const validateProcessedPublication = (data: unknown) =>
  ProcessedPublicationSchema.parse(data)
