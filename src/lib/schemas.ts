import { z } from 'astro/zod'

/**
 * Configuration schema for site-wide settings including metadata, localization, and theme options.
 */
export const SiteConfigSchema = z.object({
  // Site metadata
  title: z.string(),
  description: z.string(),
  href: z.string().url(),
  author: z.string(),

  // Localization
  locale: z.object({
    lang: z.string().default('en-US'),
    attrs: z.string().default('en_US'),
    dateLocale: z.string().default('en-US'),
    dateOptions: z.object({
      day: z.enum(['numeric', '2-digit']).optional(),
      month: z.enum(['numeric', '2-digit', 'narrow', 'short', 'long']).optional(),
      year: z.enum(['numeric', '2-digit']).optional(),
      timeZone: z.string().optional(),
    }).default({}),
    relative: z.object({
      enabled: z.boolean().default(false),
      maxDaysThreshold: z.number().default(30)
    }).default({})
  }),

  // Blog settings
  featuredPostCount: z.number().positive().default(2),
  postsPerPage: z.number().positive().default(8),

  /** TOC max depth of markdown headings, between 1 and 6 */
  tocMaxDepth: z.number().min(1).max(6).default(3),

  // Theme settings
  favicon: z.string().default('/favicon.ico'),
  prerender: z.boolean().default(true),
  npmCDN: z.string().url().default('https://cdn.jsdelivr.net/npm'),

  // Content license
  license: z.object({
    href: z.string(),
    label: z.string()
  }).default({
    label: 'CC-BY-NC-4.0',
    href: 'https://creativecommons.org/licenses/by-nc/4.0/'
  }),
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
 *   email: "user@example.com",
 *   github: "https://github.com/username",
 *   googleScholar: {
 *     href: "https://scholar.google.com/citations?user=...",
 *     label: "platform" // Uses default label from platform config
 *   }
 * }
 * ```
 */
export const ProfileLinkConfigSchema = z.record(
  z.string(),
  z.union([
    z.string(),
    z.object({
      /** URL or path for the social link */
      href: z.string(),
      /** Custom label or 'platform' to use default from platform config */
      label: z.union([z.string(), z.literal('platform')]).optional()
    })
  ])
).optional().default({})

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
   */
  tagline: z.string().max(70),
  /** Geographic location (city, state, country) */
  location: z.string().max(50).optional(),
  /** Phone number in international format */
  phone: z.string().regex(/^[+]?[\d\s().-]{7,22}$/).optional(),
  /** Preferred pronouns (e.g., "she/her", "they/them") */
  pronouns: z.string().max(20).optional(),
  /** Phonetic pronunciation guide for your name */
  pronunciation: z.string().optional(),
  // pronunciationAudioPath: z.string().optional(),
  /** Social media and professional platform links */
  links: ProfileLinkConfigSchema.default({})
})

/**
 * Schema for website footer configuration including credits and additional links.
 */
export const FooterConfigSchema = z.object({
  /** Whether to show "Built with" credits in footer */
  credits: z.boolean().default(true),
  /** URL to source code repository */
  sourceCode: z.string().url().optional(),
  /** URL to content source repository */
  sourceContent: z.string().url().optional(),
  /** Additional links to display in footer */
  footerLinks: z.array(z.object({
    /** URL for the footer link */
    href: z.string().url(),
    /** Display text for the footer link */
    label: z.string()
  })).default([])
})

/**
 * Schema for tools/software recommendations with categorization tags.
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
  tags: z.array(z.enum(['Free', 'OpenSource', 'Subscription', 'Bundle', 'SelfHosted', 'Gifted', 'Favorite'])).optional()
})

export const validateSiteConfig = (data: unknown) => SiteConfigSchema.parse(data)
export const validateProfile = (data: unknown) => ProfileConfigSchema.parse(data)
export const validateFooter = (data: unknown) => FooterConfigSchema.parse(data)
export const validateTool = (data: unknown) => ToolSchema.parse(data)
