import { PROFILE } from '@/config'

// Official platform icon mapping with camelCase keys and object values
export const PROFILE_ICON_MAP = {
  // Email & Communication
  email: { label: 'Email', iconName: 'lucide:mail' },
  skype: { label: 'Skype', iconName: 'lucide:phone' },
  telegram: { label: 'Telegram', iconName: 'lucide:send' },
  whatsapp: { label: 'WhatsApp', iconName: 'lucide:message-circle' },
  discord: { label: 'Discord', iconName: 'lucide:message-square' },
  slack: { label: 'Slack', iconName: 'lucide:slack' },

  // Social Media - using official names
  github: { label: 'GitHub', iconName: 'lucide:github' },
  x: { label: 'X', iconName: 'lucide:twitter' },
  twitter: { label: 'Twitter', iconName: 'lucide:twitter' },
  linkedin: { label: 'LinkedIn', iconName: 'lucide:linkedin' },
  facebook: { label: 'Facebook', iconName: 'lucide:facebook' },
  instagram: { label: 'Instagram', iconName: 'lucide:instagram' },
  bluesky: { label: 'Bluesky', iconName: 'lucide:cloud' },
  mastodon: { label: 'Mastodon', iconName: 'lucide:message-circle' },
  threads: { label: 'Threads', iconName: 'lucide:at-sign' },
  youtube: { label: 'YouTube', iconName: 'lucide:youtube' },
  twitch: { label: 'Twitch', iconName: 'lucide:twitch' },
  tiktok: { label: 'TikTok', iconName: 'lucide:music' },
  snapchat: { label: 'Snapchat', iconName: 'lucide:camera' },
  pinterest: { label: 'Pinterest', iconName: 'lucide:image' },
  reddit: { label: 'Reddit', iconName: 'lucide:message-square' },
  medium: { label: 'Medium', iconName: 'lucide:pen-tool' },

  // Academic & Research
  googleScholar: { label: 'Google Scholar', iconName: 'academicons:google-scholar' },
  orcid: { label: 'ORCID', iconName: 'academicons:orcid' },
  researchgate: { label: 'ResearchGate', iconName: 'academicons:researchgate' },
  academia: { label: 'Academia.edu', iconName: 'academicons:academia' },
  pubmed: { label: 'PubMed', iconName: 'academicons:pubmed' },
  arXiv: { label: 'arXiv', iconName: 'academicons:arxiv' },
  ssrn: { label: 'SSRN', iconName: 'lucide:file-text' },
  scopus: { label: 'Scopus', iconName: 'academicons:scopus' },
  mendeley: { label: 'Mendeley', iconName: 'academicons:mendeley' },
  zotero: { label: 'Zotero', iconName: 'academicons:zotero' },
  figshare: { label: 'Figshare', iconName: 'academicons:figshare' },
  dblp: { label: 'DBLP', iconName: 'lucide:database' },
  semanticScholar: { label: 'Semantic Scholar', iconName: 'lucide:brain' },

  // Developer Platforms
  gitlab: { label: 'GitLab', iconName: 'lucide:gitlab' },
  bitbucket: { label: 'Bitbucket', iconName: 'lucide:git-branch' },
  codepen: { label: 'CodePen', iconName: 'lucide:code' },
  codesandbox: { label: 'CodeSandbox', iconName: 'lucide:sandbox' },
  stackoverflow: { label: 'Stack Overflow', iconName: 'lucide:layers' },
  hackerrank: { label: 'HackerRank', iconName: 'lucide:terminal' },
  leetcode: { label: 'LeetCode', iconName: 'lucide:code-2' },
  npm: { label: 'npm', iconName: 'lucide:package' },
  pypi: { label: 'PyPI', iconName: 'lucide:python' },
  dockerhub: { label: 'Docker Hub', iconName: 'lucide:container' },
  devcommunity: { label: 'Dev Community', iconName: 'lucide:dev' },
  hashnode: { label: 'Hashnode', iconName: 'lucide:hash' },
  kaggle: { label: 'Kaggle', iconName: 'lucide:bar-chart' },
  huggingface: { label: 'Hugging Face', iconName: 'lucide:smile' },

  // Professional & Portfolio
  website: { label: 'Website', iconName: 'lucide:globe' },
  portfolio: { label: 'Portfolio', iconName: 'lucide:briefcase' },
  blog: { label: 'Blog', iconName: 'lucide:pen-tool' },
  cv: { label: 'CV', iconName: 'academicons:cv' },
  resume: { label: 'Resume', iconName: 'lucide:file-user' },
  calendar: { label: 'Calendar', iconName: 'lucide:calendar' },

  // Other
  rss: { label: 'RSS', iconName: 'lucide:rss' },
  patreon: { label: 'Patreon', iconName: 'lucide:heart-plus' },
  koFi: { label: 'Ko-fi', iconName: 'lucide:coffee' },
  buymeacoffee: { label: 'Buy me a coffee', iconName: 'lucide:coffee' },
  paypal: { label: 'PayPal', iconName: 'lucide:credit-card' },
  venmo: { label: 'Venmo', iconName: 'lucide:wallet-sign' },
  cashapp: { label: 'Cash App', iconName: 'lucide:dollar-sign' }
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
  return iconConfig?.iconName || 'lucide:external-link'
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
