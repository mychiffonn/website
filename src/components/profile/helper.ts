import { PROFILE } from '@/config'

// Official platform icon mapping with camelCase keys and object values
export const PROFILE_ICON_MAP = {
  // Email & Communication
  email: { label: 'Email', iconName: 'mingcute:mail-line' },
  skype: { label: 'Skype', iconName: 'mingcute:skype-line' },
  telegram: { label: 'Telegram', iconName: 'mingcute:telegram-line' },
  whatsapp: { label: 'WhatsApp', iconName: 'mingcute:whatsapp-line' },
  discord: { label: 'Discord', iconName: 'mingcute:discord-line' },
  slack: { label: 'Slack', iconName: 'mingcute:slack-line' },
  wechat: { label: 'Wechat', iconName: 'mingcute:wechat-line' },
  kakaotalk: { label: 'Kakao Talk', iconName: 'mingcute:kakao-talk-line' },
  line: { label: 'Line', iconName: 'mingcute:line-app-line' },

  // Social Media
  x: { label: 'X', iconName: 'mingcute:social-x-line' },
  twitter: { label: 'Twitter', iconName: 'mingcute:twitter-line' },
  linkedin: { label: 'LinkedIn', iconName: 'mingcute:linkedin-line' },
  facebook: { label: 'Facebook', iconName: 'mingcute:facebook-line' },
  instagram: { label: 'Instagram', iconName: 'mingcute:instagram-line' },
  bluesky: { label: 'Bluesky', iconName: 'mingcute:bluesky-social-line' },
  mastodon: { label: 'Mastodon', iconName: 'mingcute:mastodon-line' },
  threads: { label: 'Threads', iconName: 'mingcute:threads-line' },
  youtube: { label: 'YouTube', iconName: 'mingcute:youtube-line' },
  twitch: { label: 'Twitch', iconName: 'mingcute:twitch-line' },
  tiktok: { label: 'TikTok', iconName: 'mingcute:tiktok-line' },
  snapchat: { label: 'Snapchat', iconName: 'mingcute:snapchat-line' },
  pinterest: { label: 'Pinterest', iconName: 'mingcute:pinterest-line' },
  reddit: { label: 'Reddit', iconName: 'mingcute:reddit-line' },
  medium: { label: 'Medium', iconName: 'mingcute:medium-line' },
  weibo: { label: 'Weibo', iconName: 'mingcute:weibo-line' },

  // Academic & Research
  googleScholar: { label: 'Google Scholar', iconName: 'academicons:google-scholar' },
  orcid: { label: 'ORCID', iconName: 'academicons:orcid' },
  researchgate: { label: 'ResearchGate', iconName: 'academicons:researchgate' },
  academia: { label: 'Academia.edu', iconName: 'academicons:academia' },
  pubmed: { label: 'PubMed', iconName: 'academicons:pubmed' },
  arXiv: { label: 'arXiv', iconName: 'academicons:arxiv' },
  ssrn: { label: 'SSRN', iconName: 'academicons:ssrn' },
  scopus: { label: 'Scopus', iconName: 'academicons:scopus' },
  mendeley: { label: 'Mendeley', iconName: 'academicons:mendeley' },
  zotero: { label: 'Zotero', iconName: 'academicons:zotero' },
  figshare: { label: 'Figshare', iconName: 'academicons:figshare' },
  dblp: { label: 'DBLP', iconName: 'mingcute:database-line' },
  semanticScholar: { label: 'Semantic Scholar', iconName: 'mingcute:brain-line' },

  // Developer Platforms
  github: { label: 'GitHub', iconName: 'mingcute:github-line' },
  gitlab: { label: 'GitLab', iconName: 'mingcute:git-lab-line' },
  bitbucket: { label: 'Bitbucket', iconName: 'mingcute:git-branch-line' },
  codepen: { label: 'CodePen', iconName: 'mingcute:code-line' },
  codesandbox: { label: 'CodeSandbox', iconName: 'mingcute:code-line' },
  stackoverflow: { label: 'Stack Overflow', iconName: 'academicons:stackoverflow' },
  figma: { label: 'Stack Overflow', iconName: 'mingcute:figma-line' },

  // Professional & Portfolio
  website: { label: 'Website', iconName: 'mingcute:globe-2-line' },
  portfolio: { label: 'Portfolio', iconName: 'mingcute:briefcase-line' },
  blog: { label: 'Blog', iconName: 'mingcute:pen-line' },
  cv: { label: 'CV', iconName: 'academicons:cv' },
  resume: { label: 'Resume', iconName: 'mingcute:file-line' },
  calendar: { label: 'Calendar', iconName: 'mingcute:calendar-line' },

  // Other
  rss: { label: 'RSS', iconName: 'mingcute:rss-line' },
  patreon: { label: 'Patreon', iconName: 'mingcute:heart-line' },
  kofi: { label: 'Ko-fi', iconName: 'mingcute:coffee-line' },
  buymeacoffee: { label: 'Buy me a coffee', iconName: 'mingcute:coffee-line' },
  paypal: { label: 'PayPal', iconName: 'mingcute:paypal-line' },
  venmo: { label: 'Venmo', iconName: 'mingcute:wallet-4-line' },
  cashapp: { label: 'Cash App', iconName: 'mingcute:currency-dollar-line' }
} as const

export type ProfileLinkType = keyof typeof PROFILE_ICON_MAP

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
