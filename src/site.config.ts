import type {
  FooterConfig,
  LinkConfig,
  ProfileConfig,
  PublicationConfig,
  SiteConfig
} from "@/types"

export const SITE: SiteConfig = {
  title: "My Chiffon N.",
  description:
    "NLP+HCI Researcher making knowledge work more inclusive, trustworthy, and collaborative.",
  href: "https://mychiffonn.com",
  author: "My (Chiffon) Nguyen",

  locale: {
    lang: "en-US",
    attrs: "en_US",
    dateLocale: "en-US",
    dateOptions: {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "America/Los_Angeles" // or your preferred timezone
    },
    relative: {
      enabled: true,
      maxDaysThreshold: 30 // relative date for dates less than 30 days ago
    }
  },

  // Blog settings
  featuredPostCount: 3,
  postsPerPage: 8,

  // TOC settings
  tocMaxDepth: 3,

  // Theme settings
  favicon: "/favicon.ico",
  prerender: true,
  npmCDN: "https://cdn.jsdelivr.net/npm",

  // Content license
  license: {
    label: "CC-BY-NC-4.0",
    href: "https://creativecommons.org/licenses/by-nc/4.0/"
  }
}

export const PROFILE: ProfileConfig = {
  name: "My (Chiffon) Nguyen",
  othernames: "Nguyễn Trà My / 阮沐茶 / 윈자미",
  tagline: "NLP+HCI Researcher & Life-long Learner",
  email: "hi@mychiffonn.com",
  location: "San Francisco, CA, USA",
  pronouns: "she/her/hers",
  pronunciation: "My = /me/, Chiffon = /shif-ON/, Nguyen = /ngwen/",
  links: {
    github: "https://github.com/mychiffonn",
    googleScholar: "https://scholar.google.com/citations?user=a25a-rUAAAAJ",
    cv: "/doc/cv.pdf",
    resume: "/doc/resume.pdf",
    bluesky: "https://bsky.app/profile/mychiffonn.bsky.social",
    discord: "https://discordapp.com/users/mychiffonn"
  }
}

export const NAV_LINKS: LinkConfig[] = [
  {
    href: "/projects",
    label: "Projects"
  },
  {
    href: "/publications",
    label: "Publications"
  },
  {
    href: "/blog",
    label: "Blog"
  },
  {
    href: "/uses",
    label: "Uses"
  },
  {
    href: "/now",
    label: "Now"
  }
]

export const PUB_CONFIG: PublicationConfig = {
  maxFirstAuthors: 4,
  maxLastAuthors: 4,
  highlightAuthor: {
    firstName: "My Chiffon",
    lastName: "Nguyen",
    aliases: ["My Nguyen", "M. Nguyen", "Chiffon Nguyen"]
  },
  citationStyle: "apa",
  sortOrder: "reverse-chronological"
}

export const FOOTER: FooterConfig = {
  credits: true,
  sourceCode: "https://github.com/mychiffonn/website",
  sourceContent: "https://github.com/mychiffonn/website/tree/main/src/content",
  footerLinks: []
}

if (import.meta.env.DEV) {
  const { validateFooter, validateProfile, validatePublicationConfig, validateSiteConfig } =
    await import("@/schemas")
  validateSiteConfig(SITE)
  validateProfile(PROFILE)
  validateFooter(FOOTER)
  validatePublicationConfig(PUB_CONFIG)
}
