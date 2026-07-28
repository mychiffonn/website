import { PROFILE_ICON_MAP, type ProfileLinkType } from "@icon-config"
import { PROFILE, SITE } from "@site-config"

export type ProfileLinkConfig = {
  [K in ProfileLinkType]?:
    | string
    | {
        href: string
        label?: string
      }
}

export type EmailVariant = "encoded" | "display"

export type ProfileLinkLocation = "header" | "about" | "footer"

/** Icon-only links shown in the header when no explicit set is configured. */
const DEFAULT_HEADER_LINKS = ["email", "cv", "googleScholar", "x"]

/**
 * Resolve which links a location should render.
 *
 * `false` or an empty array means the location renders nothing. `true` (or an
 * omitted field) means that location's default set: the four icons above for
 * the header, which cannot hold more; every configured link for the about
 * block; and every configured link plus the mail link and feed for the
 * footer, where they have always appeared. An array renders exactly those
 * keys, in the order given.
 *
 * @param location Where the links are being rendered
 * @returns An ordered list of profile link keys, empty when the location is off
 */
export const getProfileLinkPlacement = (
  location: ProfileLinkLocation,
): string[] => {
  const configured = PROFILE.linksPlacement?.[location]

  if (configured === false) return []
  if (Array.isArray(configured)) return configured

  if (location === "header") return DEFAULT_HEADER_LINKS

  const keys = Object.keys(PROFILE.links)
  return location === "footer" ? ["email", ...keys, "rss"] : keys
}

export type ProcessedProfileLink = {
  key: ProfileLinkType
  /** Labels from PROFILE_ICON_MAP or user overrides */
  label: string
  /** IconName from PROFILE_ICON_MAP */
  iconName: string
  /** Normalized URL (relative for internal, absolute for external) */
  href: string
  /** Whether the link is external */
  isExternal: boolean
}

/**
 * Resolve a single key to a link, drawing on the synthetic sources (`email`
 * from PROFILE.email, `rss` from the feed route) when the key is not a plain
 * entry in the links config.
 * @param key The profile link key to resolve
 * @param links The links config to read regular entries from
 * @returns The processed link, or null if the key is not configured
 */
const resolveProfileLink = (
  key: string,
  links: ProfileLinkConfig | Record<string, string>,
): ProcessedProfileLink | null => {
  const iconConfig = PROFILE_ICON_MAP[key as ProfileLinkType]
  if (!iconConfig) return null

  const value = (links as Record<string, unknown>)[key]

  if (value === undefined) {
    if (key === "email" && PROFILE.email) {
      return {
        key: "email",
        href: `mailto:${PROFILE.email}`,
        isExternal: true,
        label: iconConfig.label,
        iconName: iconConfig.iconName,
      }
    }
    if (key === "rss") {
      return {
        key: "rss",
        href: normalizeHref("/rss.xml").href,
        isExternal: false,
        label: iconConfig.label,
        iconName: iconConfig.iconName,
      }
    }
    return null
  }

  const linkData = processProfileLink(
    value as string | { href: string; label?: string },
    iconConfig,
  )
  const { href, isExternal } = normalizeHref(linkData.href)

  return {
    key: key as ProfileLinkType,
    href,
    isExternal,
    label: linkData.label,
    iconName: iconConfig.iconName,
  }
}

/**
 * Map links to their corresponding icon and label.
 *
 * When `keys` is an array the links are returned in exactly that order, and
 * keys with nothing configured behind them are skipped rather than rendered
 * broken. When it is `true` (or omitted) every configured link is returned in
 * config order.
 *
 * @param links The links to process, defaulting to the site profile links
 * @param keys Which links to include: `true` for all, `false` for none, or an
 *   ordered list of keys
 * @returns {@link ProcessedProfileLink[]} Array of processed profile links
 */
export const getProcessedProfileLinks = (
  links?: ProfileLinkConfig | Record<string, string>,
  keys: boolean | string[] = true,
): ProcessedProfileLink[] => {
  if (keys === false) return []

  const linksToProcess = links || PROFILE.links
  const requested = Array.isArray(keys)
    ? keys
    : Object.keys(linksToProcess as Record<string, unknown>)

  return requested
    .map((key) => resolveProfileLink(key, linksToProcess))
    .filter((entry): entry is ProcessedProfileLink => entry !== null)
}

/**
 * Return the email in the desired variant, display or encoded
 * @param email The email to transform
 * @param variant The variant to return, display or encoded
 * @returns The email in the desired variant
 */
export const getTransformedEmail = (
  email: string,
  variant: EmailVariant = "display",
): string => {
  switch (variant) {
    case "encoded":
      return Buffer.from(email, "utf8").toString("base64")
    case "display":
    default:
      return getEmailDisplayText(email)
  }
}

// ========================================
// Helper functions
// ========================================

const normalizeHref = (href: string): { href: string; isExternal: boolean } => {
  const normalized = href.startsWith("/public/")
    ? href.replace("/public", "")
    : href
  return {
    href: normalized,
    isExternal: !normalized.startsWith("/"),
  }
}

/**
 * Get the label for a link. Use the label from the link if it exists and is not 'platform'
 * @param value The link to get the label for
 * @param iconConfig The icon configuration
 * @returns The label for the link
 */
const getLabel = (
  value: string | { href: string; label?: string },
  iconConfig: any,
): string => {
  if (typeof value === "string") return iconConfig.label
  return value.label && value.label !== "platform"
    ? value.label
    : iconConfig.label
}

/**
 * Process a regular link
 * @param value The link to process
 * @param iconConfig The icon configuration
 * @returns The processed link
 */
const processProfileLink = (
  value: string | { href: string; label?: string },
  iconConfig: any,
) => ({
  href: typeof value === "string" ? value : value.href,
  label: getLabel(value, iconConfig),
})

/**
 * The domain shortcuts to use for the email display text
 */
const DOMAIN_SHORTCUTS: Record<string, string> = {
  "gmail.com": "[gmail]",
  "yahoo.com": "[yahoo]",
  "outlook.com": "[outlook]",
  "hotmail.com": "[hotmail]",
}

const getEmailDisplayText = (email: string): string => {
  const [localPart, domain] = email.split("@")
  const siteDomain = new URL(SITE.href).hostname

  if (domain === siteDomain) {
    return `${localPart} [at] [domain]`
  }

  const shortcut = DOMAIN_SHORTCUTS[domain]
  if (shortcut) {
    return `${localPart} [at] ${shortcut}`
  }

  return `${localPart} [at] ${domain.replace(/\./g, " [dot] ")}`
}
