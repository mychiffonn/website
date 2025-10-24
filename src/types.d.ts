import type { z } from "astro/zod"

import type {
  FooterConfigSchema,
  ProfileConfigSchema,
  PublicationConfigSchema,
  SiteConfigSchema,
  ToolSchema
} from "@/schemas"

import type { ProfileLinkConfig } from "@/components/profile/helper"

// Infer TypeScript types from Zod schemas
export type SiteConfig = z.infer<typeof SiteConfigSchema>

export type LinkConfig = {
  href: string
  label: string
}

export type ProfileConfig = z.infer<typeof ProfileConfigSchema>

export type FooterConfig = z.infer<typeof FooterConfigSchema>

export type Tool = z.infer<typeof ToolSchema>

export type PublicationConfig = z.infer<typeof PublicationConfigSchema>
