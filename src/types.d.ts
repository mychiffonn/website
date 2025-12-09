import type { z } from "astro:content"

import type {
  FooterConfigSchema,
  ProcessedPublicationSchema,
  ProfileConfigSchema,
  PublicationConfigSchema,
  SiteConfigSchema,
  ToolSchema
} from "@/schemas"

export type LinkConfig = {
  href: string
  label: string
}

// Used internally
export type Tool = z.infer<typeof ToolSchema>
export type ProcessedPublication = z.infer<typeof ProcessedPublicationSchema>

// Used in site config
export type ProfileConfig = z.infer<typeof ProfileConfigSchema>
export type FooterConfig = z.infer<typeof FooterConfigSchema>
export type PublicationConfig = z.infer<typeof PublicationConfigSchema>
export type SiteConfig = z.infer<typeof SiteConfigSchema>
