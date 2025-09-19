import { PROFILE, SITE } from '@site-config'
import { PROFILE_ICON_MAP, type ProfileLinkType } from '@icon-config'

export type ProfileLinkConfig = {
  [K in ProfileLinkType]?: string | {
    href: string
    label?: string
  }
}

export type EmailVariant = 'encoded' | 'display'

export type ProcessedProfileLink = {
  key: ProfileLinkType,
  /** Labels from PROFILE_ICON_MAP or user overrides */
  label: string,
  /** IconName from PROFILE_ICON_MAP */
  iconName: string,
  /** Normalized and absolute URL */
  href: string,
  /** Whether the link is external */
  isExternal: boolean
}


/**
 * Map links to their corresponding icon and label.
 * @param links The links to process
 * @param includeRss Whether to include the RSS link
 * @param includeEmail Whether to include the email link
 * @returns {@link ProcessedProfileLink[]} Array of processed profile links
 */
export const getProcessedProfileLinks = (
  links?: ProfileLinkConfig | Record<string, string>,
  includeRss = false,
  includeEmail = false
): ProcessedProfileLink[] => {
  const linksToProcess = links || PROFILE.links
  const entries: ProcessedProfileLink[] = []

  if (includeEmail && PROFILE.email) {
    entries.push({
      key: 'email' as ProfileLinkType,
      href: `mailto:${PROFILE.email}`,
      isExternal: true,
      label: 'Email',
      iconName: 'mingcute:mail-line'
    })
  }

  for (const [key, value] of Object.entries(linksToProcess)) {
    const iconConfig = PROFILE_ICON_MAP[key as ProfileLinkType]
    if (!iconConfig) continue

    const linkData = processProfileLink(value, iconConfig)

    const { href, isExternal } = normalizeHref(linkData.href)

    entries.push({
      key: key as ProfileLinkType,
      href,
      isExternal,
      label: linkData.label,
      iconName: iconConfig.iconName
    })
  }

  if (includeRss && !entries.some(entry => entry.key === 'rss')) {
    const { href } = normalizeHref('/rss.xml')
    entries.push({
      key: 'rss',
      href,
      isExternal: false,
      label: 'RSS',
      iconName: PROFILE_ICON_MAP.rss.iconName
    })
  }

  return entries
}


/**
 * Get the icon for a platform
 * @param platform The social/academic/professional platform to get the icon for
 * @returns The icon name for the platform, e.g., "mingcute:linkedin-line"
 */
export const getIconForPlatform = (platform: string): string => {
  const iconConfig = PROFILE_ICON_MAP[platform as ProfileLinkType]
  return iconConfig?.iconName || "mingcute:external-link-line"
}


/**
 * Return the email in the desired variant, display or encoded
 * @param email The email to transform
 * @param variant The variant to return, display or encoded
 * @returns The email in the desired variant
 */
export const getTransformedEmail = (email: string, variant: EmailVariant = 'display'): string => {
  switch (variant) {
    case 'encoded':
      return btoa(email)
    case 'display':
    default:
      return getEmailDisplayText(email)
  }
}

// ========================================
// Helper functions
// ========================================

const normalizeHref = (href: string): { href: string; isExternal: boolean } => {
  const normalized = href.startsWith('/public/') ? href.replace('/public', '') : href
  return {
    href: new URL(normalized, SITE.href).toString(),
    isExternal: !normalized.startsWith('/')
  }
}

/**
 * Get the label for a link. Use the label from the link if it exists and is not 'platform'
 * @param value The link to get the label for
 * @param iconConfig The icon configuration
 * @returns The label for the link
 */
const getLabel = (value: string | { href: string; label?: string }, iconConfig: any): string => {
  if (typeof value === 'string') return iconConfig.label
  return (value.label && value.label !== 'platform') ? value.label : iconConfig.label
}

/**
 * Process a regular link
 * @param value The link to process
 * @param iconConfig The icon configuration
 * @returns The processed link
 */
const processProfileLink = (value: string | { href: string; label?: string }, iconConfig: any) => ({
  href: typeof value === 'string' ? value : value.href,
  label: getLabel(value, iconConfig),
})

/**
 * The domain shortcuts to use for the email display text
 */
const DOMAIN_SHORTCUTS: Record<string, string> = {
  'gmail.com': '[gmail]',
  'yahoo.com': '[yahoo]',
  'outlook.com': '[outlook]',
  'hotmail.com': '[hotmail]'
}

const getEmailDisplayText = (email: string): string => {
  const [localPart, domain] = email.split('@')
  const siteDomain = new URL(SITE.href).hostname
  
  if (domain === siteDomain) {
    return `${localPart} [at] [domain]`
  }
  
  const shortcut = DOMAIN_SHORTCUTS[domain]
  if (shortcut) {
    return `${localPart} [at] ${shortcut}`
  }
  
  return `${localPart} [at] ${domain.replace(/\./g, ' [dot] ')}`
}