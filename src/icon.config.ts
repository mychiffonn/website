export const SEMANTIC_ICONS = {
  // Navigation & Breadcrumbs
  blog: "mingcute:book-5-line",
  "post-active": "mingcute:book-line", // Used for both active parent posts and active subposts
  post: "mingcute:book-2-line",
  "parent-post": "mingcute:documents-line",
  subpost: "mingcute:document-line",
  folder: "mingcute:folder-line",
  "folder-open": "mingcute:folder-open-line",
  file: "mingcute:file-line",
  copy: "mingcute:copy-line",
  group: "mingcute:group-line",
  person: "mingcute:user-1-line",
  question: "mingcute:question-line",
  tool: "mingcute:tool-line",

  // Meta information
  hashtag: "mingcute:hashtag-line",
  tags: "mingcute:tag-2-line",
  publish: "mingcute:calendar-line",
  "reading-time": "mingcute:time-duration-line",
  update: "mingcute:edit-line",
  subposts: "mingcute:documents-line",

  // Common UI icons
  home: "mingcute:home-4-line",
  menu: "mingcute:menu-line",
  close: "mingcute:close-line",
  "chevron-right": "mingcute:right-line",
  "chevron-down": "mingcute:down-line",
  "chevron-up": "mingcute:up-line",
  "arrow-up": "mingcute:up-line",
  "arrow-left": "mingcute:arrow-left-line",
  "arrow-right": "mingcute:arrow-right-line",
  "arrow-left-up": "mingcute:arrow-left-up-line",
  "more-horizontal": "mingcute:more-1-line",
  left: "mingcute:left-line",
  right: "mingcute:right-line",
  "external-link": "mingcute:external-link-line",
  star: "mingcute:star-line",
  "to-top": "mingcute:arrow-to-up-line",

  // Content & actions
  calendar: "mingcute:calendar-line",
  time: "mingcute:time-line",
  timeline: "mingcute:time-line",
  edit: "mingcute:edit-line",
  check: "mingcute:check-line",
  info: "mingcute:information-line",
  warning: "mingcute:alert-triangle-line",
  error: "mingcute:close-circle-line"
}

// Official platform icon mapping with camelCase keys and object values
export const PROFILE_ICON_MAP = {
  // Email & Communication
  skype: { label: "Skype", iconName: "mingcute:skype-line" },
  telegram: { label: "Telegram", iconName: "mingcute:telegram-line" },
  whatsapp: { label: "WhatsApp", iconName: "mingcute:whatsapp-line" },
  discord: { label: "Discord", iconName: "mingcute:discord-line" },
  slack: { label: "Slack", iconName: "mingcute:slack-line" },
  wechat: { label: "Wechat", iconName: "mingcute:wechat-line" },
  kakaotalk: { label: "Kakao Talk", iconName: "mingcute:kakao-talk-line" },
  line: { label: "Line", iconName: "mingcute:line-app-line" },

  // Social Media
  x: { label: "X", iconName: "mingcute:social-x-line" },
  twitter: { label: "Twitter", iconName: "mingcute:twitter-line" },
  linkedin: { label: "LinkedIn", iconName: "mingcute:linkedin-line" },
  facebook: { label: "Facebook", iconName: "mingcute:facebook-line" },
  instagram: { label: "Instagram", iconName: "mingcute:instagram-line" },
  bluesky: { label: "Bluesky", iconName: "mingcute:bluesky-social-line" },
  mastodon: { label: "Mastodon", iconName: "mingcute:mastodon-line" },
  threads: { label: "Threads", iconName: "mingcute:threads-line" },
  youtube: { label: "YouTube", iconName: "mingcute:youtube-line" },
  twitch: { label: "Twitch", iconName: "mingcute:twitch-line" },
  tiktok: { label: "TikTok", iconName: "mingcute:tiktok-line" },
  snapchat: { label: "Snapchat", iconName: "mingcute:snapchat-line" },
  pinterest: { label: "Pinterest", iconName: "mingcute:pinterest-line" },
  reddit: { label: "Reddit", iconName: "mingcute:reddit-line" },
  medium: { label: "Medium", iconName: "mingcute:medium-line" },
  weibo: { label: "Weibo", iconName: "mingcute:weibo-line" },

  // Academic & Research
  googleScholar: { label: "Google Scholar", iconName: "academicons:google-scholar" },
  orcid: { label: "ORCID", iconName: "academicons:orcid" },
  researchgate: { label: "ResearchGate", iconName: "academicons:researchgate" },
  academia: { label: "Academia.edu", iconName: "academicons:academia" },
  pubmed: { label: "PubMed", iconName: "academicons:pubmed" },
  arXiv: { label: "arXiv", iconName: "academicons:arxiv" },
  ssrn: { label: "SSRN", iconName: "academicons:ssrn" },
  scopus: { label: "Scopus", iconName: "academicons:scopus" },
  mendeley: { label: "Mendeley", iconName: "academicons:mendeley" },
  zotero: { label: "Zotero", iconName: "academicons:zotero" },
  figshare: { label: "Figshare", iconName: "academicons:figshare" },
  dblp: { label: "DBLP", iconName: "academicons:dblp" },
  semanticScholar: { label: "Semantic Scholar", iconName: "academicons:semantic-scholar" },
  inspire: { label: "Inspire", iconName: "academicons:inspire" },

  // Developer Platforms
  github: { label: "GitHub", iconName: "mingcute:github-line" },
  gitlab: { label: "GitLab", iconName: "mingcute:git-lab-line" },
  bitbucket: { label: "Bitbucket", iconName: "mingcute:git-branch-line" },
  codepen: { label: "CodePen", iconName: "mingcute:code-line" },
  codesandbox: { label: "CodeSandbox", iconName: "mingcute:code-line" },
  stackoverflow: { label: "Stack Overflow", iconName: "academicons:stackoverflow" },
  figma: { label: "Figma", iconName: "mingcute:figma-line" },

  // Professional & Portfolio
  website: { label: "Website", iconName: "mingcute:globe-2-line" },
  portfolio: { label: "Portfolio", iconName: "mingcute:briefcase-line" },
  blog: { label: "Blog", iconName: "mingcute:pen-line" },
  cv: { label: "CV", iconName: "academicons:cv" },
  resume: { label: "Resume", iconName: "mingcute:file-line" },
  calendar: { label: "Calendar", iconName: "mingcute:calendar-line" },

  // Other
  rss: { label: "RSS", iconName: "mingcute:rss-line" },
  patreon: { label: "Patreon", iconName: "mingcute:heart-line" },
  kofi: { label: "Ko-fi", iconName: "mingcute:coffee-line" },
  buymeacoffee: { label: "Buy me a coffee", iconName: "mingcute:coffee-line" },
  paypal: { label: "PayPal", iconName: "mingcute:paypal-line" },
  venmo: { label: "Venmo", iconName: "mingcute:wallet-4-line" },
  cashapp: { label: "Cash App", iconName: "mingcute:currency-dollar-line" }
}

export const PROJECT_LINK_TYPES = {
  repo: { label: "Repository", iconName: "mingcute:github-line" },
  doc: { label: "Documentation", iconName: "mingcute:document-line" },
  url: { label: "Website", iconName: "mingcute:external-link-line" },
  release: { label: "Release", iconName: "mingcute:download-line" }
} as const

export type ProfileLinkType = keyof typeof PROFILE_ICON_MAP
export type SemanticIconName = keyof typeof SEMANTIC_ICONS
export type ProjectLinkType = keyof typeof PROJECT_LINK_TYPES
