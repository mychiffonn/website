import type { FooterConfig, ProfileConfig, SiteConfig, SocialLink } from "@/types"

export const SITE: SiteConfig = {
  title: "My Chiffon N.",
  description:
    "NLP+HCI Researcher and Engineer making human knowledge work more inclusive, collaborative and trustworthy.",
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
  othernames: "Nguyễn Trà My / 자미 / 阮沐茶",
  tagline: "NLP+HCI Researcher, Engineer & Life-long Learner",
  location: "San Francisco, CA, USA",
  pronouns: "she/her/hers",
  pronunciation: "My = /me/, Chiffon = /shif-ON/, Nguyen = /ngwen/",
  links: {
    email: "chiffonng136@gmail.com",
    github: "https://github.com/mychiffonn",
    googleScholar: "https://scholar.google.com/citations?user=a25a-rUAAAAJ",
    cv: "doc/cv.pdf",
    bluesky: "https://bsky.app/profile/mychiffonn.bsky.social",
    discord: "https://discordapp.com/users/mychiffonn"
  }
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: "/projects",
    label: "Projects"
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

export const FOOTER: FooterConfig = {
  credits: true,
  sourceCode: "https://github.com/mychiffonn/website",
  sourceContent: "https://github.com/mychiffonn/website/tree/main/src/content",
  footerLinks: []
}

if (import.meta.env.DEV) {
  const { validateFooter, validateProfile, validateSiteConfig } = await import("@/lib/schemas")
  validateSiteConfig(SITE)
  validateProfile(PROFILE)
  validateFooter(FOOTER)
}
