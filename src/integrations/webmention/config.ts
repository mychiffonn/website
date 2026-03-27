import type { WebmentionConfig } from "./types"
import { WebmentionConfigSchema } from "./types"

export const WEBMENTION: WebmentionConfig = {
  enabled: true
}

if (import.meta.env.DEV && typeof window === "undefined") {
  WebmentionConfigSchema.parse(WEBMENTION)

  if (WEBMENTION.enabled && !import.meta.env.WEBMENTION_TOKEN) {
    throw new Error("WEBMENTION_TOKEN env var is required when webmention.enabled is true")
  }
}
