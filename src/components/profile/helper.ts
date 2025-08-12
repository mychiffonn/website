import { PROFILE } from '@/config'
import { PROFILE_ICON_MAP, type ProfileLinkType } from '@/icons'

export type ProfileLinkConfig = {
  [K in ProfileLinkType]?: string | {
    href: string
    label?: string | 'platform'
  }
}

export interface ProfileLinksProps {
  links: ProfileLinkConfig
  class?: string
  includeLabel?: boolean
  includeRss?: boolean
}

export type ProcessedProfileLinks = {
  key: string,
  /** Labels from PROFILE_ICON_MAP or user overrides */
  label: string,
  /** IconName from PROFILE_ICON_MAP */
  iconName: string,
  href: string,
  /** Display text for email (user-friendly obfuscated format) */
  displayText?: string
}

/** Process links - uses provided links or falls back to PROFILE.links */
export const getProcessedProfileLinks = (
  links?: ProfileLinkConfig | Record<string, string>,
  includeRss = false
): ProcessedProfileLinks[] => {
  const entries: ProcessedProfileLinks[] = []

  // Use provided links or fall back to PROFILE.links
  const linksToProcess = links || PROFILE.links

  // Process links
  Object.entries(linksToProcess).forEach(([key, value]) => {
    const iconConfig = PROFILE_ICON_MAP[key as ProfileLinkType]

    if (!iconConfig) return

    let href: string
    let label: string

    let displayText: string | undefined

    if (typeof value === 'string') {
      href = key === 'email' && !value.startsWith('mailto:')
        ? `mailto:${protectEmail(value)}`
        : value
      label = iconConfig.label
      if (key === 'email') {
        displayText = getEmailDisplayText(value)
      }
    } else {
      const emailAddress = value.href.startsWith('mailto:') ? value.href.replace('mailto:', '') : value.href
      href = key === 'email' && !value.href.startsWith('mailto:')
        ? `mailto:${protectEmail(emailAddress)}`
        : key === 'email' && value.href.startsWith('mailto:')
          ? `mailto:${protectEmail(emailAddress)}`
          : value.href
      // Use user-supplied label if provided, otherwise use the default from PROFILE_ICON_MAP
      // Special case: if label is 'platform', use the default label from iconConfig
      label = (value.label && value.label !== 'platform') ? value.label : iconConfig.label
      if (key === 'email') {
        displayText = getEmailDisplayText(emailAddress)
      }
    }

    entries.push({
      key,
      href,
      label,
      iconName: iconConfig.iconName,
      ...(displayText && { displayText })
    })
  })

  // Add RSS if requested and not already present
  if (includeRss && !entries.some(entry => entry.key === 'rss')) {
    entries.push({
      key: 'rss',
      href: '/rss.xml',
      label: 'RSS',
      iconName: PROFILE_ICON_MAP.rss.iconName
    })
  }

  return entries
}

export const getIconForPlatform = (platform: string): string => {
  const iconConfig = PROFILE_ICON_MAP[platform as ProfileLinkType]
  return iconConfig?.iconName || 'mingcute:external-link-line'
}

// Email protection utilities
export const protectEmail = (email: string): string => {
  // Basic email obfuscation - replace @ and . with HTML entities
  return email
    .replace(/@/g, '&#64;')
    .replace(/\./g, '&#46;')
}

export const getEmailDisplayText = (email: string): string => {
  // Convert email to user-friendly obfuscated format: mail [at] example [dot] com
  return email
    .replace(/@/g, ' [at] ')
    .replace(/\./g, ' [dot] ')
}
